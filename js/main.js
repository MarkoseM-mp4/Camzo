/**
 * CAMZO — Main Game Orchestrator
 * State Machine: LOBBY -> HIDING -> TRANSITION -> HUNTING -> GAME_OVER
 * Supports Pass & Play, Solo vs AI, and Online Multiplayer Rooms with 5-Letter Codes.
 */

import { sound } from './audio.js';
import { Stickman } from './stickman.js';
import { environmentManager } from './environments.js';
import { PaintEngine } from './paint-engine.js';
import { HunterVision } from './hunter-vision.js';
import { ui } from './ui.js';
import { networkManager } from './network.js';

class Game {
  constructor() {
    // Canvases
    this.container = document.getElementById('canvas-container');
    this.bgCanvas = document.getElementById('bg-canvas');
    this.charCanvas = document.getElementById('character-canvas');
    this.paintCanvas = document.getElementById('paint-canvas');
    this.visionCanvas = document.getElementById('vision-canvas');
    this.fxCanvas = document.getElementById('fx-canvas');
    this.charCtx = this.charCanvas.getContext('2d');

    // Subsystems
    this.paintEngine = new PaintEngine(this.container, this.paintCanvas, this.bgCanvas);
    this.hunterVision = new HunterVision(this.container, this.visionCanvas, this.fxCanvas);

    // Game State
    this.state = 'LOBBY'; // 'LOBBY', 'HIDING', 'TRANSITION', 'HUNTING', 'GAME_OVER'
    this.gameMode = 'pass-and-play'; // 'pass-and-play', 'online-multiplayer'
    this.hiders = [];
    this.activePlayerHider = null;
    this.hidingDuration = 30;
    this.huntingDuration = 45;
    this.currentTimer = 0;
    this.timerInterval = null;
    this.startTime = 0;
    this.currentBgName = 'Default';
    this.bgChoice = 'random';
    this.hidersCount = 1;
    this.isDisguiseRevealed = false;

    // Online Multiplayer State
    this.isOnline = false;
    this.onlineSeed = 0;
    this.myOnlineRole = 'hider'; // 'hunter' or 'hider'
    this.submittedCamo = false;

    this.init();
  }

  async init() {
    // Preload folder backgrounds
    await environmentManager.preloadImages();

    // Draw initial stickman avatar preview in lobby
    const previewCanvas = document.getElementById('stickman-preview-canvas');
    if (previewCanvas) {
      const dummy = new Stickman({ x: 50, y: 60, scale: 0.8, isPlaced: true });
      dummy.renderPreview(previewCanvas);
    }

    this.setupEventListeners();
    this.setupHunterCallbacks();
    this.setupMultiplayerLobbyEvents();
    this.setupNetworkCallbacks();

    // Re-render character canvas whenever a paint stroke is drawn
    this.paintEngine.onPaintUpdate = () => {
      this.renderCharacters(this.isDisguiseRevealed);
    };

    this.startRenderLoop();
  }

  setupEventListeners() {
    // Start Game Button in Lobby
    const btnStart = document.getElementById('btn-start-game');
    if (btnStart) {
      btnStart.addEventListener('click', () => {
        if (this.gameMode === 'online-multiplayer') {
          if (networkManager.isHost) {
            networkManager.startGame();
          }
        } else {
          this.startGameFromLobby();
        }
      });
    }

    // Ready to Hunt Button in HUD (Hiding Phase early lock-in)
    const btnFinishHiding = document.getElementById('btn-finish-hiding');
    if (btnFinishHiding) {
      btnFinishHiding.addEventListener('click', () => {
        if (this.state === 'HIDING') {
          if (this.activePlayerHider && !this.activePlayerHider.isPlaced) {
            this.activePlayerHider.isPlaced = true;
          }
          if (this.isOnline) {
            this.submitOnlineCamouflage();
          } else {
            clearInterval(this.timerInterval);
            this.startTransitionToHunting();
          }
        }
      });
    }

    // Relocate Button (Allows repositioning stickman if player wishes)
    const btnRelocate = document.getElementById('btn-relocate');
    if (btnRelocate) {
      btnRelocate.addEventListener('click', () => {
        if (this.state === 'HIDING' && this.activePlayerHider && !this.submittedCamo) {
          this.activePlayerHider.isPlaced = false;
          this.paintEngine.setEnabled(false);
          ui.showPhaseBanner('MOVE CHAMELEON', '', 'Left-click anywhere to place your stickman!', 'RELOCATE', 2000);
          sound.playTick();
        }
      });
    }

    // Undo & Clear Buttons in HUD
    const btnUndo = document.getElementById('btn-undo-paint');
    if (btnUndo) {
      btnUndo.addEventListener('click', () => {
        if (!this.submittedCamo) this.paintEngine.undo();
      });
    }
    const btnClear = document.getElementById('btn-clear-paint');
    if (btnClear) {
      btnClear.addEventListener('click', () => {
        if (!this.submittedCamo) this.paintEngine.clear();
      });
    }

    // Lobby Return Buttons
    const btnRestart = document.getElementById('btn-restart');
    if (btnRestart) {
      btnRestart.addEventListener('click', () => this.returnToLobby());
    }
    const btnLobbyReturn = document.getElementById('btn-lobby-return');
    if (btnLobbyReturn) {
      btnLobbyReturn.addEventListener('click', () => this.returnToLobby());
    }

    // Play Again Button on Game Over Screen
    const btnPlayAgain = document.getElementById('btn-play-again');
    if (btnPlayAgain) {
      btnPlayAgain.addEventListener('click', () => {
        ui.hideGameOver();
        if (this.isOnline) {
          networkManager.playAgain();
        } else {
          this.startMatch();
        }
      });
    }



    // STICKMAN PLACEMENT: Follow mouse until left click places it
    this.container.addEventListener('mousemove', (e) => {
      if (this.state === 'HIDING' && this.activePlayerHider && !this.activePlayerHider.isPlaced) {
        const coords = this.paintEngine.getCanvasCoords(e);
        this.activePlayerHider.x = Math.max(50, Math.min(this.bgCanvas.width - 50, coords.x));
        this.activePlayerHider.y = Math.max(60, Math.min(this.bgCanvas.height - 60, coords.y));
        this.renderCharacters();
      }
    });

    // LEFT CLICK TO PLACE STICKMAN
    this.container.addEventListener('mousedown', (e) => {
      if (this.state === 'HIDING' && e.button === 0 && this.activePlayerHider && !this.activePlayerHider.isPlaced) {
        const coords = this.paintEngine.getCanvasCoords(e);
        this.activePlayerHider.x = Math.max(50, Math.min(this.bgCanvas.width - 50, coords.x));
        this.activePlayerHider.y = Math.max(60, Math.min(this.bgCanvas.height - 60, coords.y));
        this.activePlayerHider.isPlaced = true;
        
        sound.playHit();
        ui.showPhaseBanner('LOCKED IN!', '', 'Right-click to sample color, Left-click & drag to paint camouflage!', 'READY TO PAINT', 1800);

        this.paintEngine.setEnabled(true);
        this.renderCharacters();
      }
    });
  }

  setupHunterCallbacks() {
    this.hunterVision.onHit = (foundHider) => {
      this.renderCharacters();
      const active = this.hiders.filter(h => !h.found);
      ui.updateHidersRemaining(active.length, this.hiders.length);
      ui.updateHunterStats(
        this.hunterVision.totalClicks,
        this.hunterVision.misses,
        this.hunterVision.getAccuracy()
      );
    };

    this.hunterVision.onMiss = (hunterLives) => {
      ui.renderHearts(hunterLives, 10);
      ui.updateHunterStats(
        this.hunterVision.totalClicks,
        this.hunterVision.misses,
        this.hunterVision.getAccuracy()
      );
    };

    this.hunterVision.onAllFound = () => {
      if (!this.isOnline) {
        this.endGame('HUNTER');
      }
    };

    this.hunterVision.onHunterOutOfLives = () => {
      if (!this.isOnline) {
        this.endGame('HIDERS');
      }
    };

    // Hunter moves flashlight (Online multiplayer broadcast)
    this.hunterVision.onCursorMove = (x, y) => {
      if (this.isOnline && this.myOnlineRole === 'hunter') {
        networkManager.sendHunterMove(x, y);
      }
    };

    // Hunter clicks to investigate (Online multiplayer server validation vs local investigation)
    this.hunterVision.customInvestigateHandler = (x, y, clientX, clientY) => {
      if (this.isOnline) {
        if (this.myOnlineRole === 'hunter') {
          networkManager.sendHunterInvestigate(x, y);
        }
      } else {
        this.hunterVision.investigate(x, y, clientX, clientY);
      }
    };
  }

  /* -------------------------------------------------------------
     ONLINE MULTIPLAYER SETUP & NETWORKING
     ------------------------------------------------------------- */
  setupMultiplayerLobbyEvents() {
    // Radio Mode Selection
    document.querySelectorAll('input[name="game-mode"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.gameMode = e.target.value;
        const isMp = this.gameMode === 'online-multiplayer';
        ui.showMultiplayerPanel(isMp);

        const startBtn = document.getElementById('btn-start-game');
        if (startBtn) {
          if (isMp) {
            startBtn.classList.add('hidden'); // Shown once room created/joined as host
          } else {
            startBtn.classList.remove('hidden');
            startBtn.querySelector('span').textContent = 'START GAME';
          }
        }

        if (isMp) {
          networkManager.connect();
        }
      });
    });

    // Create Room Button
    const btnCreateRoom = document.getElementById('btn-mp-create-room');
    if (btnCreateRoom) {
      btnCreateRoom.addEventListener('click', () => {
        const nickInput = document.getElementById('mp-nickname');
        const nickname = (nickInput && nickInput.value.trim()) || 'Host';
        networkManager.createRoom(nickname);
      });
    }

    // Join Room Button
    const btnJoinRoom = document.getElementById('btn-mp-join-room');
    if (btnJoinRoom) {
      btnJoinRoom.addEventListener('click', () => {
        const codeInput = document.getElementById('mp-room-code-input');
        const nickInput = document.getElementById('mp-nickname');
        const code = (codeInput && codeInput.value.trim().toUpperCase()) || '';
        const nickname = (nickInput && nickInput.value.trim()) || 'Player';

        const errorEl = document.getElementById('mp-error-msg');
        if (code.length !== 5) {
          if (errorEl) {
            errorEl.textContent = 'Please enter a valid 5-letter room code!';
            errorEl.classList.remove('hidden');
          }
          return;
        }

        if (errorEl) errorEl.classList.add('hidden');
        networkManager.joinRoom(code, nickname);
      });
    }

    // Copy Room Code Button
    const btnCopyCode = document.getElementById('btn-mp-copy-code');
    if (btnCopyCode) {
      btnCopyCode.addEventListener('click', () => {
        if (networkManager.roomCode) {
          navigator.clipboard.writeText(networkManager.roomCode).then(() => {
            const orig = btnCopyCode.textContent;
            btnCopyCode.textContent = '✓ Copied!';
            setTimeout(() => { btnCopyCode.textContent = orig; }, 2000);
          });
        }
      });
    }

    // Leave Room Button
    const btnLeaveRoom = document.getElementById('btn-mp-leave-room');
    if (btnLeaveRoom) {
      btnLeaveRoom.addEventListener('click', () => {
        window.location.reload();
      });
    }

    // Settings changes sync by host
    const bgSelect = document.getElementById('select-background');
    const timeSelect = document.getElementById('select-hiding-time');
    const radiusSelect = document.getElementById('select-vision-radius');

    const onSettingChange = () => {
      if (this.gameMode === 'online-multiplayer' && networkManager.isHost) {
        networkManager.updateSettings({
          background: bgSelect.value,
          hidingTime: timeSelect.value,
          visionRadius: radiusSelect.value
        });
      }
    };

    if (bgSelect) bgSelect.addEventListener('change', onSettingChange);
    if (timeSelect) timeSelect.addEventListener('change', onSettingChange);
    if (radiusSelect) radiusSelect.addEventListener('change', onSettingChange);
  }

  setupNetworkCallbacks() {
    // Room Created
    networkManager.onRoomCreated = (data) => {
      ui.showRoomView(true, data.roomCode);
      ui.renderRoomPlayers(data.room.players, data.player.id, true, (pid) => {
        networkManager.toggleRole(pid);
      });
    };

    // Room Joined
    networkManager.onRoomJoined = (data) => {
      ui.showRoomView(true, data.roomCode);
      ui.renderRoomPlayers(data.room.players, data.player.id, data.player.isHost, (pid) => {
        networkManager.toggleRole(pid);
      });
    };

    // Join Error
    networkManager.onJoinError = (msg) => {
      const errorEl = document.getElementById('mp-error-msg');
      if (errorEl) {
        errorEl.textContent = msg;
        errorEl.classList.remove('hidden');
      }
    };

    // Room Players Updated
    networkManager.onRoomUpdated = (data) => {
      ui.renderRoomPlayers(data.room.players, networkManager.myPlayerId, networkManager.isHost, (pid) => {
        networkManager.toggleRole(pid);
      });

      // Synchronize settings from host
      if (!networkManager.isHost && data.room.settings) {
        const bgSelect = document.getElementById('select-background');
        const timeSelect = document.getElementById('select-hiding-time');
        const radiusSelect = document.getElementById('select-vision-radius');
        if (bgSelect && data.room.settings.background) bgSelect.value = data.room.settings.background;
        if (timeSelect && data.room.settings.hidingTime) timeSelect.value = data.room.settings.hidingTime;
        if (radiusSelect && data.room.settings.visionRadius) radiusSelect.value = data.room.settings.visionRadius;
      }
    };

    networkManager.onPlayerJoined = (data) => {
      sound.playTick();
      ui.renderRoomPlayers(data.room.players, networkManager.myPlayerId, networkManager.isHost, (pid) => {
        networkManager.toggleRole(pid);
      });
    };

    networkManager.onPlayerLeft = (data) => {
      ui.renderRoomPlayers(data.room.players, networkManager.myPlayerId, networkManager.isHost, (pid) => {
        networkManager.toggleRole(pid);
      });
    };

    // Game Started by Host
    networkManager.onGameStarted = async (data) => {
      this.isOnline = true;
      this.myOnlineRole = networkManager.myRole;
      this.onlineSeed = data.seed;
      this.hidingDuration = data.hidingTime;
      this.hunterVision.setVisionRadius(data.visionRadius);
      this.submittedCamo = false;

      ui.showLobby(false);
      await this.startOnlineMatch(data);
    };

    // Hunting Phase Begins (camo submitted and composited)
    networkManager.onStartHunting = async (data) => {
      await this.beginOnlineHuntingPhase(data);
    };

    // Spectate Hunter Flashlight Movement
    networkManager.onSpectateHunter = (data) => {
      if (this.isOnline && this.myOnlineRole === 'hider') {
        this.hunterVision.targetX = data.x;
        this.hunterVision.targetY = data.y;
      }
    };

    // Investigation Result: Hit!
    networkManager.onInvestigationHit = (data) => {
      const hider = this.hiders.find(h => h.id === data.hiderId);
      this.hunterVision.triggerNetworkHit(data.x, data.y, hider);
      this.renderCharacters();
      ui.updateHidersRemaining(data.remainingHidersCount, this.hiders.length);
    };

    // Investigation Result: Miss!
    networkManager.onInvestigationMiss = (data) => {
      this.hunterVision.triggerNetworkMiss(data.x, data.y, data.hunterLives);
      ui.renderHearts(data.hunterLives, 10);
    };

    // Game Over
    networkManager.onGameOver = (data) => {
      this.endGame(data.winner);
    };

    // Play Again / Return to Lobby
    networkManager.onReturnToLobby = (data) => {
      this.state = 'LOBBY';
      ui.hideGameOver();
      ui.showSpectatorBanner(false);
      ui.showHunterWaiting(false);
      ui.showLobby(true);
      ui.renderRoomPlayers(data.room.players, networkManager.myPlayerId, networkManager.isHost, (pid) => {
        networkManager.toggleRole(pid);
      });
    };
  }

  // Start Online Match
  async startOnlineMatch(data) {
    this.state = 'HIDING';
    this.isDisguiseRevealed = false;
    this.paintEngine.clear();
    this.hunterVision.resetStats();
    this.hunterVision.setEnabled(false);

    // 1. Load Background with identical seed
    this.currentBgName = await environmentManager.loadBackground(this.bgCanvas, data.background, data.seed);

    // 2. Setup player role
    const totalHiders = data.room.players.filter(p => p.role === 'hider').length;

    ui.setPhase('HIDING');
    ui.renderHearts(10, 10);
    ui.updateHidersRemaining(totalHiders, totalHiders);
    ui.updateHunterStats(0, 0, 100);

    if (this.myOnlineRole === 'hunter') {
      // Hunter Anti-Peeking screen
      this.paintEngine.setEnabled(false);
      ui.showHunterWaiting(true, this.hidingDuration);
      this.startOnlineHunterWaitingCountdown();
    } else {
      // Hider: Place and camouflage stickman
      ui.showHunterWaiting(false);
      this.paintEngine.setEnabled(false);

      const myHider = new Stickman({
        id: networkManager.myPlayerId,
        name: 'You',
        x: 640,
        y: 450,
        lives: 10,
        isHuman: true,
        isPlaced: false
      });
      this.hiders = [myHider];
      this.activePlayerHider = myHider;
      this.renderCharacters();

      ui.showPhaseBanner('PLACE CHAMELEON', '', 'Move mouse to choose a spot, then LEFT-CLICK to place & paint!', 'STEP 1', 3000);
      this.startOnlineHiderCountdown();
    }
  }

  startOnlineHiderCountdown() {
    this.currentTimer = this.hidingDuration;
    ui.updateTimer(this.currentTimer);
    sound.playTransition();

    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.currentTimer--;
      const isUrgent = this.currentTimer <= 5;
      ui.updateTimer(this.currentTimer, isUrgent);
      sound.playTick(isUrgent);

      if (this.currentTimer <= 10 && this.currentTimer > 0) {
        ui.showUrgentCountdown(this.currentTimer);
      }

      if (this.currentTimer <= 0) {
        clearInterval(this.timerInterval);
        ui.hideUrgentCountdown();
        this.submitOnlineCamouflage();
      }
    }, 1000);
  }

  startOnlineHunterWaitingCountdown() {
    this.currentTimer = this.hidingDuration;
    ui.updateTimer(this.currentTimer);

    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.currentTimer--;
      ui.updateTimer(this.currentTimer);
      ui.updateWaitingCountdown(this.currentTimer);

      if (this.currentTimer <= 0) {
        clearInterval(this.timerInterval);
        if (networkManager.isHost) {
          networkManager.notifyHidingTimeout();
        }
      }
    }, 1000);
  }

  submitOnlineCamouflage() {
    if (this.submittedCamo) return;
    this.submittedCamo = true;
    clearInterval(this.timerInterval);
    ui.hideUrgentCountdown();

    if (this.activePlayerHider && !this.activePlayerHider.isPlaced) {
      this.activePlayerHider.isPlaced = true;
    }

    this.paintEngine.setEnabled(false);

    // Capture painted camouflage layer
    const camoDataUrl = this.paintCanvas.toDataURL('image/png');

    networkManager.submitCamo({
      x: this.activePlayerHider ? this.activePlayerHider.x : 640,
      y: this.activePlayerHider ? this.activePlayerHider.y : 400,
      scale: this.activePlayerHider ? this.activePlayerHider.scale : 1.0,
      camoDataUrl
    });

    ui.showPhaseBanner('CAMOUFLAGE LOCKED!', '', 'Disguise transmitted to server. Waiting for match start...', 'READY', 4000);
    sound.playHit();
  }

  // Begin Online Hunting Phase (called when server sends start_hunting)
  async beginOnlineHuntingPhase(data) {
    this.state = 'HUNTING';
    clearInterval(this.timerInterval);
    ui.hideUrgentCountdown();
    ui.showHunterWaiting(false);
    ui.setPhase('HUNTING');
    this.startTime = Date.now();

    // Clear and prepare paintCanvas for compositing all hiders
    const pCtx = this.paintCanvas.getContext('2d');
    pCtx.clearRect(0, 0, this.paintCanvas.width, this.paintCanvas.height);

    // Reconstruct all hiders from server payload
    this.hiders = data.hiders.map(h => new Stickman({
      id: h.id,
      name: h.nickname,
      x: h.x,
      y: h.y,
      scale: h.scale || 1.0,
      lives: 10,
      isHuman: false,
      isPlaced: true
    }));

    this.hunterVision.setHiders(this.hiders);

    // Composite each hider's camo image onto the paintCanvas
    const imageLoadPromises = data.hiders
      .filter(h => !!h.camoDataUrl)
      .map(h => new Promise(resolve => {
        const img = new Image();
        img.onload = () => {
          pCtx.drawImage(img, 0, 0);
          resolve();
        };
        img.onerror = resolve;
        img.src = h.camoDataUrl;
      }));

    await Promise.all(imageLoadPromises);
    this.renderCharacters();

    ui.renderHearts(data.hunterLives || 10, 10);
    ui.updateHidersRemaining(data.remainingHidersCount, this.hiders.length);

    if (this.myOnlineRole === 'hunter') {
      ui.showSpectatorBanner(false);
      this.hunterVision.setEnabled(true, false); // Active flashlight
      ui.showPhaseBanner('HUNT!', '', 'Flashlight active. Click to investigate suspicious spots!', 'PHASE 2', 2000);
    } else {
      ui.showSpectatorBanner(true); // Spectator view
      this.hunterVision.setEnabled(true, true); // Passive spectator flashlight
      ui.showPhaseBanner('SURVIVE!', '', 'The Hunter is searching! Watch their flashlight sweep...', 'HOLD STILL', 2000);
    }

    // Hunting phase countdown (60s)
    this.currentTimer = 60;
    ui.updateTimer(this.currentTimer);

    this.timerInterval = setInterval(() => {
      this.currentTimer--;
      const isUrgent = this.currentTimer <= 10;
      ui.updateTimer(this.currentTimer, isUrgent);
      sound.playTick(isUrgent);

      if (this.currentTimer <= 0) {
        clearInterval(this.timerInterval);
        if (networkManager.isHost) {
          networkManager.notifyHuntingTimeout();
        }
      }
    }, 1000);
  }

  /* -------------------------------------------------------------
     LOCAL PLAY METHODS (PASS & PLAY, SOLO VS AI)
     ------------------------------------------------------------- */
  async startGameFromLobby() {
    this.isOnline = false;
    const selectedModeEl = document.querySelector('input[name="game-mode"]:checked');
    this.gameMode = selectedModeEl ? selectedModeEl.value : 'pass-and-play';

    const countSelect = document.getElementById('select-hiders-count');
    this.hidersCount = parseInt(countSelect.value, 10) || 1;

    const timeSelect = document.getElementById('select-hiding-time');
    this.hidingDuration = parseInt(timeSelect.value, 10) || 30;

    const radiusSelect = document.getElementById('select-vision-radius');
    const radius = parseInt(radiusSelect.value, 10) || 160;
    this.hunterVision.setVisionRadius(radius);

    const bgSelect = document.getElementById('select-background');
    this.bgChoice = bgSelect ? bgSelect.value : 'random';

    ui.showLobby(false);
    await this.startMatch();
  }

  async startMatch() {
    this.state = 'HIDING';
    this.isDisguiseRevealed = false;
    this.paintEngine.clear();
    this.paintEngine.setEnabled(false);
    this.hunterVision.resetStats();
    this.hunterVision.setEnabled(false);

    // 1. Load Background
    this.currentBgName = await environmentManager.loadBackground(this.bgCanvas, this.bgChoice);

    // 2. Spawn Hiders
    this.hiders = [];
    for (let i = 0; i < this.hidersCount; i++) {
      const rx = 200 + Math.random() * (this.bgCanvas.width - 400);
      const ry = 200 + Math.random() * (this.bgCanvas.height - 350);
      const isHuman = (i === 0);

      const hider = new Stickman({
        id: `hider_${i + 1}`,
        name: `Hider ${i + 1}`,
        x: rx,
        y: ry,
        lives: 10,
        isHuman: isHuman,
        isPlaced: !isHuman
      });
      this.hiders.push(hider);
    }

    this.activePlayerHider = this.hiders.find(h => h.isHuman) || null;
    this.hunterVision.setHiders(this.hiders);

    this.renderCharacters();

    ui.setPhase('HIDING');
    ui.renderHearts(10, 10);
    ui.updateHidersRemaining(this.hiders.length, this.hiders.length);
    ui.updateHunterStats(0, 0, 100);

    ui.showPhaseBanner('PLACE CHAMELEON', '', 'Move your mouse to choose a spot, then LEFT-CLICK to place!', 'STEP 1', 3000);
    this.startHidingCountdown();
  }

  startHidingCountdown() {
    this.currentTimer = this.hidingDuration;
    ui.updateTimer(this.currentTimer);
    sound.playTransition();

    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.currentTimer--;
      const isUrgent = this.currentTimer <= 5;
      ui.updateTimer(this.currentTimer, isUrgent);
      sound.playTick(isUrgent);

      if (this.currentTimer <= 10 && this.currentTimer > 0) {
        ui.showUrgentCountdown(this.currentTimer);
      }

      if (this.currentTimer <= 0) {
        clearInterval(this.timerInterval);
        ui.hideUrgentCountdown();
        if (this.activePlayerHider && !this.activePlayerHider.isPlaced) {
          this.activePlayerHider.isPlaced = true;
        }
        this.startTransitionToHunting();
      }
    }, 1000);
  }

  startTransitionToHunting() {
    this.state = 'TRANSITION';
    ui.hideUrgentCountdown();
    this.paintEngine.setEnabled(false);
    sound.playTransition();

    this.hiders.forEach(h => { h.isPlaced = true; });
    this.renderCharacters();

    ui.showPassDevice(true, () => {
      this.beginHuntingPhase();
    });
  }

  beginHuntingPhase() {
    this.state = 'HUNTING';
    ui.setPhase('HUNTING');
    ui.showPhaseBanner('HUNT!', '', 'Flashlight active. Click to investigate. Watch your lives!', 'PHASE 2', 2000);
    this.startTime = Date.now();

    this.hunterVision.setEnabled(true, false);

    this.currentTimer = this.huntingDuration;
    ui.updateTimer(this.currentTimer);

    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.currentTimer--;
      const isUrgent = this.currentTimer <= 10;
      ui.updateTimer(this.currentTimer, isUrgent);
      sound.playTick(isUrgent);

      if (this.currentTimer <= 0) {
        clearInterval(this.timerInterval);
        const unfound = this.hiders.filter(h => !h.found);
        if (unfound.length > 0) {
          this.endGame('HIDERS');
        } else {
          this.endGame('HUNTER');
        }
      }
    }, 1000);
  }

  endGame(winner) {
    this.state = 'GAME_OVER';
    clearInterval(this.timerInterval);
    this.paintEngine.setEnabled(false);
    this.hunterVision.setEnabled(false);
    ui.showSpectatorBanner(false);
    ui.showHunterWaiting(false);

    const hidersFound = this.hiders.filter(h => h.found).length;
    const timeTaken = Math.round((Date.now() - this.startTime) / 1000);

    this.renderCharacters(true);

    ui.showGameOver({
      winner,
      hidersFound,
      totalHiders: this.hiders.length,
      accuracy: this.hunterVision.getAccuracy(),
      totalClicks: this.hunterVision.totalClicks,
      timeTaken: Math.max(1, timeTaken),
      livesRemaining: this.hunterVision.hunterLives,
      backgroundName: this.currentBgName
    });
  }

  returnToLobby() {
    clearInterval(this.timerInterval);
    this.state = 'LOBBY';
    ui.hideUrgentCountdown();
    ui.showSpectatorBanner(false);
    ui.showHunterWaiting(false);
    this.paintEngine.setEnabled(false);
    this.hunterVision.setEnabled(false);
    ui.hideGameOver();
    ui.showPassDevice(false);
    ui.showLobby(true);
  }

  /**
   * Render all stickmen with MASKED CAMOUFLAGE
   * 1. Draws stickman silhouette(s)
   * 2. Uses source-atop to composite player's paint strokes strictly onto the character silhouette!
   * The background on bgCanvas remains 100% clean and untouched!
   */
  renderCharacters(revealOverride = false) {
    const w = this.charCanvas.width;
    const h = this.charCanvas.height;
    this.charCtx.clearRect(0, 0, w, h);

    // 1. Draw stickman base body silhouettes
    this.hiders.forEach(hider => {
      hider.renderBody(this.charCtx);
    });

    // 2. MASKED CAMOUFLAGE: composite paintCanvas strictly on stickman silhouette
    if (!revealOverride || !this.isDisguiseRevealed) {
      this.charCtx.save();
      this.charCtx.globalCompositeOperation = 'source-atop';
      this.charCtx.drawImage(this.paintCanvas, 0, 0);
      this.charCtx.restore();
    }

    // 3. Draw Game-Over / Reveal glowing overlays (unmasked, radiant red/green glows!)
    this.hiders.forEach(hider => {
      hider.renderOverlays(this.charCtx, revealOverride);
    });
  }

  startRenderLoop() {
    const loop = () => {
      if (this.state !== 'LOBBY') {
        const reveal = this.state === 'GAME_OVER' || this.isDisguiseRevealed;
        this.renderCharacters(reveal);
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}

// Instantiate on load or immediately if DOM is already ready
function initGame() {
  if (!window.gameInstance) {
    window.gameInstance = new Game();
  }
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initGame);
} else {
  initGame();
}
