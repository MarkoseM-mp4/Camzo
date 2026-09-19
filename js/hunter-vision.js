/**
 * Hunter Vision & Investigation System for Camzo
 * Renders dark fog-of-war with smooth circular flashlight window,
 * performs click investigation against stickman hitboxes,
 * manages miss penalties (deducting lives from 10), and particle effects.
 */

import { sound } from './audio.js';

export class HunterVision {
  constructor(canvasContainer, visionCanvas, fxCanvas) {
    this.container = canvasContainer;
    this.canvas = visionCanvas;
    this.ctx = this.canvas.getContext('2d');
    this.fxCanvas = fxCanvas;
    this.fxCtx = this.fxCanvas.getContext('2d');

    // Configurable vision radius
    this.visionRadius = 160;
    this.enabled = false;
    this.isSpectator = false;

    // Smooth cursor interpolation
    this.targetX = 640;
    this.targetY = 360;
    this.currentX = 640;
    this.currentY = 360;
    this.smoothSpeed = 0.25;

    // Ambient darkness alpha (0.96 for near-pitch darkness with faint contour)
    this.darknessAlpha = 0.97;

    // Remote hunters tracking for spectator / multiplayer
    this.remoteHunters = new Map(); // hunterId -> { currentX, currentY, targetX, targetY, lastSeen }

    // Investigation statistics
    this.totalClicks = 0;
    this.hits = 0;
    this.misses = 0;
    this.maxHunterLives = 10;
    this.hunterLives = 10;

    // Hiders reference list
    this.hiders = [];

    // Active visual FX particles
    this.particles = [];
    this.ripples = [];

    // Callbacks
    this.onHit = null;
    this.onMiss = null;
    this.onAllFound = null;
    this.onHunterOutOfLives = null;
    this.onCursorMove = null;
    this.customInvestigateHandler = null;

    this.feedbackEl = document.getElementById('investigation-feedback');

    this.initEvents();
    this.startAnimationLoop();
  }

  setHiders(hiders) {
    this.hiders = hiders;
  }

  setVisionRadius(radius) {
    this.visionRadius = radius;
  }

  setHunterLives(lives) {
    const val = parseInt(lives, 10) || 10;
    this.maxHunterLives = Math.max(3, Math.min(10, val));
    this.hunterLives = this.maxHunterLives;
  }

  updateRemoteHunter(hunterId, x, y) {
    if (!hunterId) hunterId = 'default';
    let hunter = this.remoteHunters.get(hunterId);
    if (!hunter) {
      hunter = {
        currentX: x,
        currentY: y,
        targetX: x,
        targetY: y,
        lastSeen: Date.now()
      };
      this.remoteHunters.set(hunterId, hunter);
    } else {
      hunter.targetX = x;
      hunter.targetY = y;
      hunter.lastSeen = Date.now();
    }
  }

  clearRemoteHunters() {
    this.remoteHunters.clear();
  }

  setEnabled(val, isSpectator = false) {
    this.enabled = val;
    this.isSpectator = isSpectator;
    if (!val) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.fxCtx.clearRect(0, 0, this.fxCanvas.width, this.fxCanvas.height);
      this.clearRemoteHunters();
    }
  }

  resetStats() {
    this.totalClicks = 0;
    this.hits = 0;
    this.misses = 0;
    this.hunterLives = this.maxHunterLives || 10;
    this.particles = [];
    this.ripples = [];
    this.clearRemoteHunters();
  }

  getAccuracy() {
    if (this.totalClicks === 0) return 100;
    return Math.round((this.hits / this.totalClicks) * 100);
  }

  getCanvasCoords(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  initEvents() {
    this.container.addEventListener('mousemove', (e) => {
      if (!this.enabled || this.isSpectator) return;
      const coords = this.getCanvasCoords(e);
      this.targetX = coords.x;
      this.targetY = coords.y;
      if (this.onCursorMove) {
        this.onCursorMove(coords.x, coords.y);
      }
    });

    this.container.addEventListener('mousedown', (e) => {
      if (!this.enabled || this.isSpectator || e.button !== 0) return;
      const coords = this.getCanvasCoords(e);
      if (this.customInvestigateHandler) {
        this.customInvestigateHandler(coords.x, coords.y, e.clientX, e.clientY);
      } else {
        this.investigate(coords.x, coords.y, e.clientX, e.clientY);
      }
    });
  }

  // Investigate a specific coordinate
  investigate(x, y, clientX = 0, clientY = 0) {
    this.totalClicks++;

    // Check hit against all active hiders
    let hitHider = null;
    for (const hider of this.hiders) {
      if (!hider.found && !hider.eliminated && hider.containsPoint(x, y)) {
        hitHider = hider;
        break;
      }
    }

    if (hitHider) {
      // HIT!
      this.hits++;
      hitHider.found = true;
      sound.playHit();
      this.spawnHitBurst(x, y);
      this.showFeedback('FOUND! 🎯', 'feedback-hit', clientX, clientY);

      if (this.onHit) this.onHit(hitHider);

      // Check if all hiders are now found
      const remaining = this.hiders.filter(h => !h.found && !h.eliminated);
      if (remaining.length === 0 && this.onAllFound) {
        this.onAllFound();
      }
    } else {
      // MISS! Deduct 1 Hunter life
      this.misses++;
      this.hunterLives = Math.max(0, this.hunterLives - 1);
      sound.playMiss();
      this.spawnMissRipple(x, y);
      this.showFeedback(`MISS! ⚠️ (${this.hunterLives} lives left)`, 'feedback-miss', clientX, clientY);

      if (this.onMiss) this.onMiss(this.hunterLives);

      // Check if Hunter ran out of lives -> HIDERS WIN!
      if (this.hunterLives <= 0 && this.onHunterOutOfLives) {
        this.onHunterOutOfLives();
      }
    }
  }

  // Trigger hit from network event
  triggerNetworkHit(x, y, hider) {
    this.totalClicks++;
    this.hits++;
    if (hider) hider.found = true;
    sound.playHit();
    this.spawnHitBurst(x, y);
    this.showFeedback('FOUND! 🎯', 'feedback-hit');
    if (this.onHit) this.onHit(hider);
  }

  // Trigger miss from network event
  triggerNetworkMiss(x, y, lives) {
    this.totalClicks++;
    this.misses++;
    this.hunterLives = lives;
    sound.playMiss();
    this.spawnMissRipple(x, y);
    this.showFeedback(`MISS! ⚠️ (${lives} lives left)`, 'feedback-miss');
    if (this.onMiss) this.onMiss(lives);
  }

  // Spawn visual feedback banner
  showFeedback(text, className, clientX, clientY) {
    if (!this.feedbackEl) return;
    const rect = this.container.getBoundingClientRect();
    const relX = clientX ? clientX - rect.left : this.currentX * (rect.width / this.canvas.width);
    const relY = clientY ? clientY - rect.top : this.currentY * (rect.height / this.canvas.height);

    this.feedbackEl.textContent = text;
    this.feedbackEl.className = `investigation-feedback ${className}`;
    this.feedbackEl.style.left = `${relX}px`;
    this.feedbackEl.style.top = `${relY}px`;
    this.feedbackEl.classList.remove('hidden');

    clearTimeout(this.feedbackTimeout);
    this.feedbackTimeout = setTimeout(() => {
      this.feedbackEl.classList.add('hidden');
    }, 950);
  }

  // Particle systems
  spawnHitBurst(x, y) {
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 8;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 3 + Math.random() * 5,
        color: Math.random() > 0.4 ? '#00ff88' : '#00f0ff',
        alpha: 1,
        life: 0.9 + Math.random() * 0.3
      });
    }
  }

  spawnMissRipple(x, y) {
    this.ripples.push({
      x, y,
      radius: 5,
      maxRadius: 48,
      alpha: 1,
      color: '#ff2a85'
    });
  }

  // Main rendering loop for vision mask and effects
  startAnimationLoop() {
    const loop = () => {
      if (this.enabled) {
        this.updateSmoothPosition();
        this.renderVision();
      }
      this.renderFX();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  updateSmoothPosition() {
    if (!this.isSpectator) {
      this.currentX += (this.targetX - this.currentX) * this.smoothSpeed;
      this.currentY += (this.targetY - this.currentY) * this.smoothSpeed;
    }

    const now = Date.now();
    for (const [id, h] of this.remoteHunters.entries()) {
      h.currentX += (h.targetX - h.currentX) * this.smoothSpeed;
      h.currentY += (h.targetY - h.currentY) * this.smoothSpeed;
      if (now - h.lastSeen > 12000) {
        this.remoteHunters.delete(id);
      }
    }
  }

  // Render the circular vision flashlight hole through the darkness
  renderVision() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.ctx.clearRect(0, 0, w, h);

    this.ctx.save();
    // 1. Draw solid dark overlay
    this.ctx.fillStyle = `rgba(5, 8, 14, ${this.darknessAlpha})`;
    this.ctx.fillRect(0, 0, w, h);

    // Collect all beams to render
    const beams = [];
    if (!this.isSpectator) {
      beams.push({ x: this.currentX, y: this.currentY, id: 'local' });
    }
    for (const [id, h] of this.remoteHunters.entries()) {
      beams.push({ x: h.currentX, y: h.currentY, id });
    }

    // Fallback beam if spectator has no remote updates yet
    if (beams.length === 0 && this.isSpectator) {
      beams.push({ x: this.currentX, y: this.currentY, id: 'fallback' });
    }

    // 2. Cut circular vision hole for EACH beam using destination-out
    this.ctx.globalCompositeOperation = 'destination-out';
    for (const b of beams) {
      const grad = this.ctx.createRadialGradient(
        b.x, b.y, this.visionRadius * 0.75,
        b.x, b.y, this.visionRadius
      );
      grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
      grad.addColorStop(0.85, 'rgba(0, 0, 0, 0.95)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(b.x, b.y, this.visionRadius, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // 3. Draw flashlight glass rim & beam ring for each beam
    this.ctx.globalCompositeOperation = 'source-over';
    const rimColors = ['#00f0ff', '#ffb700', '#00ff88', '#ff2a85'];
    const rimStrokes = [
      'rgba(0, 240, 255, 0.45)',
      'rgba(255, 183, 0, 0.45)',
      'rgba(0, 255, 136, 0.45)',
      'rgba(255, 42, 133, 0.45)'
    ];

    beams.forEach((b, idx) => {
      const colIdx = idx % rimColors.length;
      this.ctx.strokeStyle = rimStrokes[colIdx];
      this.ctx.lineWidth = 3;
      this.ctx.shadowColor = rimColors[colIdx];
      this.ctx.shadowBlur = 10;
      this.ctx.beginPath();
      this.ctx.arc(b.x, b.y, this.visionRadius, 0, Math.PI * 2);
      this.ctx.stroke();

      // Subtle flashlight center reticle
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      this.ctx.lineWidth = 1;
      this.ctx.shadowBlur = 0;
      this.ctx.beginPath();
      this.ctx.arc(b.x, b.y, 6, 0, Math.PI * 2);
      this.ctx.stroke();
    });

    this.ctx.restore();
  }

  // Render particle and ripple animations
  renderFX() {
    const w = this.fxCanvas.width;
    const h = this.fxCanvas.height;
    this.fxCtx.clearRect(0, 0, w, h);

    // Hit burst particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.95;
      p.vy *= 0.95;
      p.alpha -= 0.02;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.fxCtx.save();
      this.fxCtx.globalAlpha = p.alpha;
      this.fxCtx.fillStyle = p.color;
      this.fxCtx.shadowColor = p.color;
      this.fxCtx.shadowBlur = 10;
      this.fxCtx.beginPath();
      this.fxCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.fxCtx.fill();
      this.fxCtx.restore();
    }

    // Miss ripple waves
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i];
      r.radius += 2.5;
      r.alpha = 1 - (r.radius / r.maxRadius);

      if (r.radius >= r.maxRadius) {
        this.ripples.splice(i, 1);
        continue;
      }

      this.fxCtx.save();
      this.fxCtx.globalAlpha = r.alpha;
      this.fxCtx.strokeStyle = r.color;
      this.fxCtx.lineWidth = 3;
      this.fxCtx.shadowColor = r.color;
      this.fxCtx.shadowBlur = 8;
      this.fxCtx.beginPath();
      this.fxCtx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      this.fxCtx.stroke();
      this.fxCtx.restore();
    }
  }
}
