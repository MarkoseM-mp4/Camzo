/**
 * UI Manager for Camzo
 * Manages HUD elements, countdown animations, phase banners,
 * life hearts displays, modals, and game over statistics.
 */

import { sound } from './audio.js';

export class UIManager {
  constructor() {
    // HUD Elements
    this.gameHudEl = document.getElementById('game-hud');
    this.hudPhaseName = document.getElementById('hud-phase-name');
    this.hudTimerVal = document.getElementById('hud-timer-val');
    this.hudTimerLabel = document.getElementById('hud-timer-label');
    this.hudLivesCount = document.getElementById('hud-lives-count');
    this.livesHeartsContainer = document.getElementById('lives-hearts-container');
    this.hudHidersLeft = document.getElementById('hud-hiders-left');
    
    // Bottom bars
    this.hudHiderControls = document.getElementById('hud-hider-controls');
    this.hudHunterControls = document.getElementById('hud-hunter-controls');
    this.hunterAccuracyPill = document.getElementById('hunter-accuracy-pill');
    this.hunterClicksPill = document.getElementById('hunter-clicks-pill');
    this.hunterMissesPill = document.getElementById('hunter-misses-pill');

    // Modals
    this.lobbyScreen = document.getElementById('lobby-screen');
    this.passDeviceModal = document.getElementById('pass-device-modal');
    this.gameoverModal = document.getElementById('gameover-modal');
    this.helpModal = document.getElementById('help-modal');

    // Phase Banner
    this.phaseBanner = document.getElementById('phase-banner');
    this.bannerBadge = document.getElementById('banner-badge');
    this.bannerTitle = document.getElementById('banner-title');
    this.bannerCountdown = document.getElementById('banner-countdown');
    this.bannerSubtitle = document.getElementById('banner-subtitle');

    // Header buttons
    this.btnAudioToggle = document.getElementById('btn-audio-toggle');
    this.audioIcon = document.getElementById('audio-icon');
    this.btnHelp = document.getElementById('btn-help');
    this.btnCloseHelp = document.getElementById('btn-close-help');
    this.btnRestart = document.getElementById('btn-restart');

    this.initUIEvents();
    this.renderHearts(10, 10);
  }

  initUIEvents() {
    // Audio Toggle
    this.btnAudioToggle.addEventListener('click', () => {
      const muted = sound.toggleMute();
      this.audioIcon.textContent = muted ? '🔇' : '🔊';
      this.btnAudioToggle.title = muted ? 'Unmute Sound' : 'Mute Sound';
    });

    // Help Modal
    this.btnHelp.addEventListener('click', () => {
      this.helpModal.classList.remove('hidden');
      this.helpModal.classList.add('visible');
    });

    this.btnCloseHelp.addEventListener('click', () => {
      this.helpModal.classList.remove('visible');
      this.helpModal.classList.add('hidden');
    });

    // Mode Cards Toggle in Lobby
    document.querySelectorAll('.mode-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
      });
    });
  }

  // Show/Hide Main Lobby
  showLobby(show = true) {
    if (show) {
      this.lobbyScreen.classList.remove('hidden');
      this.lobbyScreen.classList.add('visible');
      this.gameHudEl.classList.add('hidden');
      this.btnRestart.classList.add('hidden');
    } else {
      this.lobbyScreen.classList.remove('visible');
      this.lobbyScreen.classList.add('hidden');
      this.gameHudEl.classList.remove('hidden');
      this.btnRestart.classList.remove('hidden');
    }
  }

  // Show/Hide Pass Device Curtain (Hotseat mode)
  showPassDevice(show = true, onReady) {
    if (show) {
      this.passDeviceModal.classList.remove('hidden');
      this.passDeviceModal.classList.add('visible');
      const btn = document.getElementById('btn-hunter-ready');
      const handler = () => {
        btn.removeEventListener('click', handler);
        this.passDeviceModal.classList.remove('visible');
        this.passDeviceModal.classList.add('hidden');
        if (onReady) onReady();
      };
      btn.addEventListener('click', handler);
    } else {
      this.passDeviceModal.classList.remove('visible');
      this.passDeviceModal.classList.add('hidden');
    }
  }

  // Set Current Phase UI Layout
  setPhase(phaseName) {
    this.hudPhaseName.textContent = phaseName.toUpperCase();

    if (phaseName === 'HIDING') {
      this.hudPhaseName.className = 'hud-value highlight-cyan';
      this.hudTimerLabel.textContent = 'HIDING TIME';
      this.hudHiderControls.classList.remove('hidden');
      this.hudHunterControls.classList.add('hidden');
    } else if (phaseName === 'HUNTING') {
      this.hudPhaseName.className = 'hud-value highlight-pink';
      this.hudTimerLabel.textContent = 'HUNTING TIME';
      this.hudHiderControls.classList.add('hidden');
      this.hudHunterControls.classList.remove('hidden');
    }
  }

  // Display Animated Phase Banner
  showPhaseBanner(title, countdown = '', subtitle = '', badge = 'PHASE START', duration = 2000) {
    this.bannerBadge.textContent = badge;
    this.bannerTitle.textContent = title;
    this.bannerCountdown.textContent = countdown;
    this.bannerSubtitle.textContent = subtitle;

    this.phaseBanner.classList.remove('hidden');

    if (duration > 0) {
      setTimeout(() => {
        this.phaseBanner.classList.add('hidden');
      }, duration);
    }
  }

  hidePhaseBanner() {
    this.phaseBanner.classList.add('hidden');
  }

  // Display pure countdown number on screen without any banner box
  showUrgentCountdown(number) {
    if (!this.urgentCountdownEl) {
      this.urgentCountdownEl = document.getElementById('urgent-countdown');
    }
    if (this.urgentCountdownEl) {
      this.urgentCountdownEl.textContent = number;
      this.urgentCountdownEl.classList.remove('hidden');
      // Re-trigger animation
      this.urgentCountdownEl.style.animation = 'none';
      void this.urgentCountdownEl.offsetWidth;
      this.urgentCountdownEl.style.animation = '';
    }
  }

  hideUrgentCountdown() {
    if (!this.urgentCountdownEl) {
      this.urgentCountdownEl = document.getElementById('urgent-countdown');
    }
    if (this.urgentCountdownEl) {
      this.urgentCountdownEl.classList.add('hidden');
    }
  }

  // Update Timer in HUD
  updateTimer(seconds, isUrgent = false) {
    this.hudTimerVal.textContent = seconds;
    if (isUrgent) {
      this.hudTimerVal.classList.add('timer-urgent');
    } else {
      this.hudTimerVal.classList.remove('timer-urgent');
    }
  }

  // Update Hider Lives and Animate Hearts
  renderHearts(currentLives, maxLives = 10) {
    this.hudLivesCount.textContent = `${currentLives} / ${maxLives}`;
    this.livesHeartsContainer.innerHTML = '';

    for (let i = 1; i <= maxLives; i++) {
      const heart = document.createElement('span');
      heart.className = 'heart-unit';
      if (i <= currentLives) {
        heart.textContent = '❤️';
      } else {
        heart.textContent = '🖤';
        heart.classList.add('lost');
      }
      this.livesHeartsContainer.appendChild(heart);
    }
  }

  // Update Remaining Hiders Counter
  updateHidersRemaining(activeCount, totalCount) {
    this.hudHidersLeft.textContent = `${activeCount} / ${totalCount}`;
  }

  // Update Hunter Stats Pills
  updateHunterStats(clicks, misses, accuracy) {
    if (this.hunterClicksPill) this.hunterClicksPill.textContent = clicks;
    if (this.hunterMissesPill) this.hunterMissesPill.textContent = misses;
    if (this.hunterAccuracyPill) this.hunterAccuracyPill.textContent = `${accuracy}%`;
  }

  // Show Game Over Pure Text Overlay
  showGameOver(results) {
    const { winner } = results;
    const title = document.getElementById('gameover-title');

    if (winner === 'HUNTER') {
      if (title) {
        title.textContent = 'HUNTER WINS';
        title.style.color = 'var(--cyan-accent)';
        title.style.textShadow = '0 0 25px var(--cyan-accent), 0 0 45px var(--cyan-glow), 0 2px 10px rgba(0, 0, 0, 0.95)';
      }
    } else {
      // HIDER WINS
      if (title) {
        title.textContent = 'HIDER WINS';
        title.style.color = '#ff2255';
        title.style.textShadow = '0 0 25px #ff0033, 0 0 50px #ff0033, 0 2px 10px rgba(0, 0, 0, 0.95)';
      }
    }

    this.gameoverModal.classList.remove('hidden');
    this.gameoverModal.classList.add('visible');
    sound.playVictory();
  }

  hideGameOver() {
    this.gameoverModal.classList.remove('visible');
    this.gameoverModal.classList.add('hidden');
  }

  // Hunter anti-peeking screen during Hiding Phase in Online mode
  showHunterWaiting(show = true, seconds = 30) {
    const el = document.getElementById('hunter-waiting-screen');
    const timerEl = document.getElementById('waiting-countdown-val');
    if (!el) return;
    if (show) {
      if (timerEl) timerEl.textContent = seconds;
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  }

  updateWaitingCountdown(seconds) {
    const timerEl = document.getElementById('waiting-countdown-val');
    if (timerEl) timerEl.textContent = seconds;
  }

  // Spectator Banner for Hiders while Hunter searches
  showSpectatorBanner(show = true) {
    const el = document.getElementById('hider-spectator-banner');
    if (!el) return;
    if (show) {
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  }

  // Toggle multiplayer lobby views
  showMultiplayerPanel(show = true) {
    const el = document.getElementById('multiplayer-panel');
    const hiderCountGroup = document.getElementById('select-hiders-count')?.closest('.setting-item');
    if (el) {
      if (show) {
        el.classList.remove('hidden');
        if (hiderCountGroup) hiderCountGroup.classList.add('hidden');
      } else {
        el.classList.add('hidden');
        if (hiderCountGroup) hiderCountGroup.classList.remove('hidden');
      }
    }
  }

  showRoomView(inRoom = true, roomCode = '') {
    const entryView = document.getElementById('mp-entry-view');
    const roomView = document.getElementById('mp-room-view');
    const codeDisplay = document.getElementById('mp-display-room-code');
    if (entryView && roomView) {
      if (inRoom) {
        entryView.classList.add('hidden');
        roomView.classList.remove('hidden');
        if (codeDisplay) codeDisplay.textContent = roomCode;
      } else {
        entryView.classList.remove('hidden');
        roomView.classList.add('hidden');
      }
    }
  }

  // Render Connected Players in Room Lobby
  renderRoomPlayers(players, myId, isHost, onToggleRole) {
    const listEl = document.getElementById('mp-players-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    players.forEach(p => {
      const card = document.createElement('div');
      card.className = `player-card ${p.id === myId ? 'is-me' : ''}`;

      const info = document.createElement('div');
      info.className = 'player-info';

      const name = document.createElement('span');
      name.className = 'player-name';
      name.textContent = p.nickname;

      if (p.isHost) {
        const crown = document.createElement('span');
        crown.className = 'host-crown';
        crown.textContent = '👑';
        crown.title = 'Room Host';
        info.appendChild(crown);
      }
      info.appendChild(name);

      if (p.id === myId) {
        const youTag = document.createElement('span');
        youTag.style.fontSize = '10px';
        youTag.style.color = 'var(--cyan-accent)';
        youTag.textContent = '(You)';
        info.appendChild(youTag);
      }

      const actions = document.createElement('div');
      actions.style.display = 'flex';
      actions.style.alignItems = 'center';
      actions.style.gap = '6px';

      const badge = document.createElement('span');
      badge.className = `player-role-badge ${p.role === 'hunter' ? 'role-hunter' : 'role-hider'}`;
      badge.textContent = p.role === 'hunter' ? '🔦 Hunter' : '🦎 Hider';
      actions.appendChild(badge);

      // Role toggle button if player is me or host
      if (p.id === myId || isHost) {
        const btnToggle = document.createElement('button');
        btnToggle.type = 'button';
        btnToggle.className = 'btn-toggle-role';
        btnToggle.textContent = '⇄ Switch';
        btnToggle.title = 'Switch between Hunter & Hider';
        btnToggle.addEventListener('click', (e) => {
          e.stopPropagation();
          if (onToggleRole) onToggleRole(p.id);
        });
        actions.appendChild(btnToggle);
      }

      card.appendChild(info);
      card.appendChild(actions);
      listEl.appendChild(card);
    });

    const waitingNotice = document.getElementById('mp-room-waiting-notice');
    const startBtn = document.getElementById('btn-start-game');
    if (waitingNotice) {
      if (isHost) {
        waitingNotice.classList.add('hidden');
        if (startBtn) {
          startBtn.classList.remove('hidden');
          startBtn.querySelector('span').textContent = 'START ONLINE MATCH';
        }
      } else {
        waitingNotice.classList.remove('hidden');
        if (startBtn) startBtn.classList.add('hidden');
      }
    }
  }
}

export const ui = new UIManager();
