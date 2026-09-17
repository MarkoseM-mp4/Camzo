import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
  maxHttpBufferSize: 1e7 // 10MB for canvas camo data URLs
});

const PORT = process.env.PORT || 8080;

// Serve static game files
app.use(express.static(__dirname));

// Procedural theme IDs for random selection
const PROCEDURAL_THEMES = [
  'procedural-forest',
  'procedural-city',
  'procedural-warehouse',
  'procedural-beach',
  'procedural-library',
  'procedural-arcade',
  'procedural-graffiti',
  'procedural-candy',
  'procedural-circuit',
  'procedural-autumn'
];

// Room state storage
const rooms = new Map();

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid ambiguous letters
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return rooms.has(code) ? generateRoomCode() : code;
}

function getSanitizedRoom(room) {
  return {
    code: room.code,
    hostId: room.hostId,
    status: room.status,
    settings: room.settings,
    players: room.players.map(p => ({
      id: p.id,
      nickname: p.nickname,
      role: p.role,
      isHost: p.id === room.hostId
    })),
    activeBackgroundId: room.activeBackgroundId,
    hunterLives: room.hunterLives,
    remainingHidersCount: room.remainingHidersCount
  };
}

io.on('connection', (socket) => {
  let currentRoomCode = null;

  // Create Room
  socket.on('create_room', ({ nickname }) => {
    const code = generateRoomCode();
    currentRoomCode = code;

    const hostPlayer = {
      id: socket.id,
      nickname: (nickname && nickname.trim()) || 'Host',
      role: 'hunter'
    };

    const room = {
      code,
      hostId: socket.id,
      status: 'LOBBY',
      settings: {
        background: 'random',
        hidingTime: 30,
        visionRadius: 160
      },
      players: [hostPlayer],
      seed: 0,
      activeBackgroundId: 'procedural-forest',
      hidersData: {},
      hunterLives: 10,
      remainingHidersCount: 0
    };

    rooms.set(code, room);
    socket.join(code);

    socket.emit('room_created', {
      roomCode: code,
      player: hostPlayer,
      room: getSanitizedRoom(room)
    });
  });

  // Join Room
  socket.on('join_room', ({ roomCode, nickname }) => {
    const code = (roomCode || '').trim().toUpperCase();
    const room = rooms.get(code);

    if (!room) {
      socket.emit('join_error', { message: `Room "${code}" not found!` });
      return;
    }

    if (room.status !== 'LOBBY') {
      socket.emit('join_error', { message: 'Game in this room is already in progress!' });
      return;
    }

    currentRoomCode = code;
    // Determine default role: if room has no hunter, make hunter, otherwise default to hider
    const hasHunter = room.players.some(p => p.role === 'hunter');
    const role = hasHunter ? 'hider' : 'hunter';

    const newPlayer = {
      id: socket.id,
      nickname: (nickname && nickname.trim()) || `Player ${room.players.length + 1}`,
      role
    };

    room.players.push(newPlayer);
    socket.join(code);

    socket.emit('room_joined', {
      roomCode: code,
      player: newPlayer,
      room: getSanitizedRoom(room)
    });

    socket.to(code).emit('player_joined', {
      player: newPlayer,
      room: getSanitizedRoom(room)
    });
  });

  // Host updates room settings
  socket.on('update_settings', ({ settings }) => {
    if (!currentRoomCode) return;
    const room = rooms.get(currentRoomCode);
    if (!room || room.hostId !== socket.id) return;

    room.settings = { ...room.settings, ...settings };
    io.to(currentRoomCode).emit('room_updated', { room: getSanitizedRoom(room) });
  });

  // Switch role (Hunter / Hider)
  socket.on('toggle_role', ({ targetPlayerId }) => {
    if (!currentRoomCode) return;
    const room = rooms.get(currentRoomCode);
    if (!room) return;

    // Only player themselves or the host can change roles
    if (socket.id !== targetPlayerId && socket.id !== room.hostId) return;

    const player = room.players.find(p => p.id === targetPlayerId);
    if (player) {
      player.role = player.role === 'hunter' ? 'hider' : 'hunter';
      io.to(currentRoomCode).emit('room_updated', { room: getSanitizedRoom(room) });
    }
  });

  // Start Game (Host only)
  socket.on('start_game', () => {
    if (!currentRoomCode) return;
    const room = rooms.get(currentRoomCode);
    if (!room || room.hostId !== socket.id) return;

    // Ensure there is at least one hunter and one hider
    const hunters = room.players.filter(p => p.role === 'hunter');
    const hiders = room.players.filter(p => p.role === 'hider');

    // If only 1 player or nobody picked hunter/hider, assign appropriately
    if (room.players.length === 1) {
      // Solo test mode: make player hider and allow testing
      room.players[0].role = 'hider';
    } else {
      if (hunters.length === 0 && hiders.length > 0) {
        hiders[0].role = 'hunter';
      } else if (hiders.length === 0 && hunters.length > 0) {
        hunters[hunters.length - 1].role = 'hider';
      }
    }

    room.status = 'HIDING';
    room.seed = Math.floor(Math.random() * 10000000) + 1;

    // Choose procedural background
    if (room.settings.background === 'random' || !room.settings.background) {
      room.activeBackgroundId = PROCEDURAL_THEMES[Math.floor(Math.random() * PROCEDURAL_THEMES.length)];
    } else {
      room.activeBackgroundId = room.settings.background;
    }

    room.hidersData = {};
    room.hunterLives = 10;
    const activeHiders = room.players.filter(p => p.role === 'hider');
    room.remainingHidersCount = activeHiders.length;

    io.to(currentRoomCode).emit('game_started', {
      seed: room.seed,
      background: room.activeBackgroundId,
      hidingTime: Number(room.settings.hidingTime) || 30,
      visionRadius: Number(room.settings.visionRadius) || 160,
      room: getSanitizedRoom(room)
    });
  });

  // Hider submits their camouflage canvas and stickman coordinates
  socket.on('submit_camo', ({ x, y, scale, camoDataUrl }) => {
    if (!currentRoomCode) return;
    const room = rooms.get(currentRoomCode);
    if (!room || room.status !== 'HIDING') return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    room.hidersData[socket.id] = {
      id: socket.id,
      nickname: player.nickname,
      x: Math.round(x),
      y: Math.round(y),
      scale: scale || 1.0,
      camoDataUrl: camoDataUrl || null,
      found: false
    };

    // Check if all hiders have submitted
    const hiderPlayers = room.players.filter(p => p.role === 'hider');
    const allSubmitted = hiderPlayers.every(p => !!room.hidersData[p.id]);

    if (allSubmitted || hiderPlayers.length === 0) {
      startHuntingPhase(room);
    }
  });

  // Hiding time expired
  socket.on('hiding_time_up', () => {
    if (!currentRoomCode) return;
    const room = rooms.get(currentRoomCode);
    if (!room || room.status !== 'HIDING') return;
    startHuntingPhase(room);
  });

  function startHuntingPhase(room) {
    if (room.status !== 'HIDING') return;
    room.status = 'HUNTING';

    // Populate fallback positions for hiders who didn't submit
    const hiderPlayers = room.players.filter(p => p.role === 'hider');
    hiderPlayers.forEach(p => {
      if (!room.hidersData[p.id]) {
        room.hidersData[p.id] = {
          id: p.id,
          nickname: p.nickname,
          x: 640 + (Math.random() * 200 - 100),
          y: 400 + (Math.random() * 100 - 50),
          scale: 1.0,
          camoDataUrl: null,
          found: false
        };
      }
    });

    room.remainingHidersCount = hiderPlayers.length;

    io.to(room.code).emit('start_hunting', {
      hiders: Object.values(room.hidersData),
      hunterLives: room.hunterLives,
      remainingHidersCount: room.remainingHidersCount,
      room: getSanitizedRoom(room)
    });
  }

  // Hunter moves cursor / flashlight
  socket.on('hunter_move', ({ x, y }) => {
    if (!currentRoomCode) return;
    socket.to(currentRoomCode).emit('spectate_hunter', { x, y });
  });

  // Hunter investigates coordinates
  socket.on('hunter_investigate', ({ x, y }) => {
    if (!currentRoomCode) return;
    const room = rooms.get(currentRoomCode);
    if (!room || room.status !== 'HUNTING') return;

    // Verify distance to all unfound hiders
    let hitHider = null;
    const hitThreshold = 55; // Pixels distance radius around stickman center

    for (const hider of Object.values(room.hidersData)) {
      if (hider.found) continue;
      const dist = Math.hypot(x - hider.x, y - hider.y);
      if (dist <= hitThreshold) {
        hitHider = hider;
        break;
      }
    }

    if (hitHider) {
      hitHider.found = true;
      room.remainingHidersCount = Math.max(0, room.remainingHidersCount - 1);

      io.to(currentRoomCode).emit('investigation_hit', {
        hiderId: hitHider.id,
        x: hitHider.x,
        y: hitHider.y,
        remainingHidersCount: room.remainingHidersCount
      });

      // If all hiders found, Hunter wins!
      if (room.remainingHidersCount <= 0) {
        room.status = 'GAME_OVER';
        io.to(currentRoomCode).emit('game_over', {
          winner: 'HUNTER',
          hiders: Object.values(room.hidersData),
          room: getSanitizedRoom(room)
        });
      }
    } else {
      // Miss: deduct 1 life
      room.hunterLives = Math.max(0, room.hunterLives - 1);

      io.to(currentRoomCode).emit('investigation_miss', {
        x,
        y,
        hunterLives: room.hunterLives
      });

      // If lives reach 0, Hiders win!
      if (room.hunterLives <= 0) {
        room.status = 'GAME_OVER';
        io.to(currentRoomCode).emit('game_over', {
          winner: 'HIDER',
          hiders: Object.values(room.hidersData),
          room: getSanitizedRoom(room)
        });
      }
    }
  });

  // Hunting time expired -> Hiders win!
  socket.on('hunting_time_up', () => {
    if (!currentRoomCode) return;
    const room = rooms.get(currentRoomCode);
    if (!room || room.status !== 'HUNTING') return;

    room.status = 'GAME_OVER';
    io.to(currentRoomCode).emit('game_over', {
      winner: 'HIDER',
      hiders: Object.values(room.hidersData),
      room: getSanitizedRoom(room)
    });
  });

  // Play Again (remains in room, returns to room lobby)
  socket.on('play_again', () => {
    if (!currentRoomCode) return;
    const room = rooms.get(currentRoomCode);
    if (!room) return;

    room.status = 'LOBBY';
    room.hidersData = {};
    room.hunterLives = 10;
    room.remainingHidersCount = 0;

    io.to(currentRoomCode).emit('return_to_lobby', { room: getSanitizedRoom(room) });
  });

  // Disconnect handler
  socket.on('disconnect', () => {
    if (!currentRoomCode) return;
    const room = rooms.get(currentRoomCode);
    if (!room) return;

    room.players = room.players.filter(p => p.id !== socket.id);
    delete room.hidersData[socket.id];

    if (room.players.length === 0) {
      rooms.delete(currentRoomCode);
    } else {
      // If host disconnected, nominate new host
      if (room.hostId === socket.id) {
        room.hostId = room.players[0].id;
      }
      io.to(currentRoomCode).emit('player_left', {
        playerId: socket.id,
        room: getSanitizedRoom(room)
      });
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[CAMZO SERVER] Running at http://0.0.0.0:${PORT}`);
});
