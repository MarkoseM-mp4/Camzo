/**
 * CAMZO — Client Network Manager (Socket.IO)
 * Handles real-time room creation, joining with codes, role assignment,
 * camouflage data synchronization, hunter spectating, and game state broadcasts.
 */

export class NetworkManager {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.roomCode = null;
    this.myPlayerId = null;
    this.myRole = 'hider'; // 'hunter' or 'hider'
    this.isHost = false;
    this.currentRoom = null;

    // Callbacks to be hooked by main.js or ui.js
    this.onConnected = null;
    this.onRoomCreated = null;
    this.onRoomJoined = null;
    this.onJoinError = null;
    this.onPlayerJoined = null;
    this.onPlayerLeft = null;
    this.onRoomUpdated = null;
    this.onGameStarted = null;
    this.onStartHunting = null;
    this.onSpectateHunter = null;
    this.onInvestigationHit = null;
    this.onInvestigationMiss = null;
    this.onGameOver = null;
    this.onReturnToLobby = null;

    // Hunter cursor throttling (~30fps)
    this.lastHunterCursorTime = 0;
  }

  // Initialize socket connection
  connect() {
    if (this.socket && this.socket.connected) return;

    // window.io is loaded from /socket.io/socket.io.js
    if (typeof window.io === 'undefined') {
      console.warn('Socket.IO client script not loaded yet.');
      return;
    }

    this.socket = window.io({
      reconnectionAttempts: 5,
      timeout: 10000
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      this.myPlayerId = this.socket.id;
      console.log('[NETWORK] Connected to server, socket ID:', this.myPlayerId);
      if (this.onConnected) this.onConnected();
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('[NETWORK] Disconnected from server');
    });

    // Room events
    this.socket.on('room_created', (data) => {
      this.roomCode = data.roomCode;
      this.myPlayerId = data.player.id;
      this.myRole = data.player.role;
      this.isHost = true;
      this.currentRoom = data.room;
      if (this.onRoomCreated) this.onRoomCreated(data);
    });

    this.socket.on('room_joined', (data) => {
      this.roomCode = data.roomCode;
      this.myPlayerId = data.player.id;
      this.myRole = data.player.role;
      this.isHost = data.player.isHost;
      this.currentRoom = data.room;
      if (this.onRoomJoined) this.onRoomJoined(data);
    });

    this.socket.on('join_error', (data) => {
      if (this.onJoinError) this.onJoinError(data.message);
    });

    this.socket.on('player_joined', (data) => {
      this.currentRoom = data.room;
      if (this.onPlayerJoined) this.onPlayerJoined(data);
    });

    this.socket.on('player_left', (data) => {
      this.currentRoom = data.room;
      if (data.room.hostId === this.myPlayerId) {
        this.isHost = true;
      }
      if (this.onPlayerLeft) this.onPlayerLeft(data);
    });

    this.socket.on('room_updated', (data) => {
      this.currentRoom = data.room;
      const me = data.room.players.find(p => p.id === this.myPlayerId);
      if (me) {
        this.myRole = me.role;
        this.isHost = me.isHost;
      }
      if (this.onRoomUpdated) this.onRoomUpdated(data);
    });

    // Game lifecycle events
    this.socket.on('game_started', (data) => {
      this.currentRoom = data.room;
      const me = data.room.players.find(p => p.id === this.myPlayerId);
      if (me) {
        this.myRole = me.role;
      }
      if (this.onGameStarted) this.onGameStarted(data);
    });

    this.socket.on('start_hunting', (data) => {
      this.currentRoom = data.room;
      if (this.onStartHunting) this.onStartHunting(data);
    });

    this.socket.on('spectate_hunter', (data) => {
      if (this.onSpectateHunter) this.onSpectateHunter(data);
    });

    this.socket.on('investigation_hit', (data) => {
      if (this.onInvestigationHit) this.onInvestigationHit(data);
    });

    this.socket.on('investigation_miss', (data) => {
      if (this.onInvestigationMiss) this.onInvestigationMiss(data);
    });

    this.socket.on('game_over', (data) => {
      if (this.onGameOver) this.onGameOver(data);
    });

    this.socket.on('return_to_lobby', (data) => {
      this.currentRoom = data.room;
      if (this.onReturnToLobby) this.onReturnToLobby(data);
    });
  }

  createRoom(nickname, settings = null) {
    this.connect();
    this.socket.emit('create_room', { nickname, settings });
  }

  joinRoom(roomCode, nickname) {
    this.connect();
    this.socket.emit('join_room', { roomCode, nickname });
  }

  updateSettings(settings) {
    if (!this.socket) return;
    this.socket.emit('update_settings', { settings });
  }

  toggleRole(targetPlayerId) {
    if (!this.socket) return;
    this.socket.emit('toggle_role', { targetPlayerId });
  }

  startGame(settings = null) {
    if (!this.socket) return;
    this.socket.emit('start_game', { settings });
  }

  submitCamo(arg1, y, scale, camoDataUrl) {
    if (!this.socket) return;
    let payload;
    if (typeof arg1 === 'object' && arg1 !== null) {
      payload = arg1;
    } else {
      payload = { x: arg1, y, scale, camoDataUrl };
    }
    this.socket.emit('submit_camo', payload);
  }

  notifyHidingTimeout() {
    if (!this.socket) return;
    this.socket.emit('hiding_time_up');
  }

  sendHunterMove(x, y) {
    if (!this.socket) return;
    const now = performance.now();
    if (now - this.lastHunterCursorTime > 32) { // Cap at ~30 fps for smooth, lightweight networking
      this.lastHunterCursorTime = now;
      this.socket.emit('hunter_move', { x: Math.round(x), y: Math.round(y) });
    }
  }

  sendHunterInvestigate(x, y) {
    if (!this.socket) return;
    this.socket.emit('hunter_investigate', { x: Math.round(x), y: Math.round(y) });
  }

  notifyHuntingTimeout() {
    if (!this.socket) return;
    this.socket.emit('hunting_time_up');
  }

  playAgain() {
    if (!this.socket) return;
    this.socket.emit('play_again');
  }
}

export const networkManager = new NetworkManager();
