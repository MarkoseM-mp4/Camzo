/**
 * Thick Gummy Stickman Character Entity
 * Modeled after the rubbery toy figurine:
 * Round spherical head, thick torso, rounded thick spread arms & legs.
 */

export class Stickman {
  constructor(options = {}) {
    this.id = options.id || 'hider_' + Math.random().toString(36).substr(2, 9);
    this.name = options.name || 'Hider';
    this.x = options.x || 640;
    this.y = options.y || 360;
    this.scale = options.scale || 1.0;
    this.lives = options.lives || 10;
    this.found = false;
    this.eliminated = false;
    this.isHuman = options.isHuman ?? true;
    this.isPlaced = options.isPlaced ?? false;

    // Dimensions matching the thick rubbery star-man
    this.headRadius = 24;
    this.limbThickness = 28; // Thick arms and legs!
    this.torsoWidth = 42;
    this.height = 130;
    this.width = 110;

    // Base color of the unpainted figure (smooth off-white / porcelain rubber)
    this.baseColor = '#f0eee9';
    this.outlineColor = '#3a3a3c';
  }

  // Hitbox covering the spread limbs
  getHitbox() {
    const halfW = (this.width * this.scale) / 2;
    const halfH = (this.height * this.scale) / 2;
    return {
      x: this.x - halfW,
      y: this.y - halfH,
      width: this.width * this.scale,
      height: this.height * this.scale
    };
  }

  containsPoint(px, py) {
    if (this.found || this.eliminated) return false;
    const box = this.getHitbox();
    const margin = 20;
    const inBox = (
      px >= box.x - margin &&
      px <= box.x + box.width + margin &&
      py >= box.y - margin &&
      py <= box.y + box.height + margin
    );
    const dist = Math.hypot(px - this.x, py - this.y);
    const radialHit = dist <= (85 * this.scale);
    return inBox || radialHit;
  }

  // Draw the thick rubbery stickman path
  drawSilhouette(ctx) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Limb coordinates relative to center (0, 0)
    const headY = -46;
    const neckY = -24;
    const centerTorsoY = -5;
    const hipY = 16;

    // Spread angles like the reference image
    const leftHand = { x: -44, y: -48 };   // Up and out to the left
    const rightHand = { x: 50, y: -12 };   // Out to the right slightly down
    const leftFoot = { x: -46, y: 38 };    // Down and out to the left
    const rightFoot = { x: 12, y: 56 };    // Down and slightly right

    // 1. Thick Legs
    ctx.lineWidth = this.limbThickness;
    ctx.beginPath();
    ctx.moveTo(leftFoot.x, leftFoot.y);
    ctx.lineTo(-10, hipY);
    ctx.lineTo(rightFoot.x, rightFoot.y);
    ctx.stroke();

    // 2. Thick Torso & Belly (Rounded wedge)
    ctx.beginPath();
    ctx.moveTo(-16, hipY);
    ctx.lineTo(14, hipY);
    ctx.lineTo(18, neckY);
    ctx.lineTo(-18, neckY);
    ctx.closePath();
    ctx.fill();

    // Fill the hip crotch joint smoothly
    ctx.beginPath();
    ctx.arc(0, hipY - 2, 16, 0, Math.PI * 2);
    ctx.fill();

    // 3. Thick Arms
    ctx.lineWidth = this.limbThickness;
    ctx.beginPath();
    ctx.moveTo(leftHand.x, leftHand.y);
    ctx.lineTo(-10, neckY + 4);
    ctx.lineTo(10, neckY + 4);
    ctx.lineTo(rightHand.x, rightHand.y);
    ctx.stroke();

    // Chest / shoulder bridge
    ctx.beginPath();
    ctx.arc(0, neckY + 4, 18, 0, Math.PI * 2);
    ctx.fill();

    // 4. Head
    ctx.beginPath();
    ctx.arc(0, headY, this.headRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Render Stickman base body (to be painted over with camouflage)
  renderBody(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.scale, this.scale);

    // Ground soft ambient contact shadow
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, 52, 45, 12, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.filter = 'blur(4px)';
    ctx.fill();
    ctx.restore();

    // Subtle dark boundary stroke so figure stands out before camouflage
    ctx.strokeStyle = '#22262f';
    ctx.fillStyle = this.baseColor;

    // Draw outline base
    ctx.save();
    ctx.strokeStyle = '#181b22';
    ctx.lineWidth = this.limbThickness + 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    this.drawSilhouette(ctx);
    ctx.restore();

    // Draw solid inner white/porcelain body
    ctx.save();
    ctx.strokeStyle = this.baseColor;
    ctx.fillStyle = this.baseColor;
    this.drawSilhouette(ctx);
    ctx.restore();

    // Subtle 3D volumetric shading (inner gradient/highlight)
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = this.limbThickness - 10;
    ctx.lineCap = 'round';
    this.drawSilhouette(ctx);
    ctx.restore();

    ctx.restore();
  }

  // Render Highlights, Placement Ring, and Game-Over Glowing Auras
  renderOverlays(ctx, revealOverride = false) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.scale, this.scale);

    // If unplaced (following mouse cursor), draw animated placement target ring
    if (!this.isPlaced) {
      ctx.save();
      const pulse = Math.sin(Date.now() / 120) * 6;
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, 75 + pulse, 0, Math.PI * 2);
      ctx.stroke();

      ctx.font = 'bold 12px "Space Mono", monospace';
      ctx.fillStyle = '#00f0ff';
      ctx.textAlign = 'center';
      ctx.fillText('CLICK TO PLACE', 0, 80);
      ctx.restore();
    }

    // ── Game-Over / Reveal Highlights ──────────────────────────────────────
    if (revealOverride || this.found) {
      ctx.save();

      if (this.found) {
        // FOUND: steady green success glow
        const pulse = Math.sin(Date.now() / 140) * 4;
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 22;
        const halfW = this.width / 2 + 10 + pulse;
        const halfH = this.height / 2 + 10 + pulse;
        ctx.strokeRect(-halfW, -halfH, halfW * 2, halfH * 2);

        ctx.font = 'bold 13px "Space Mono", monospace';
        ctx.fillStyle = '#00ff88';
        ctx.textAlign = 'center';
        ctx.fillText('FOUND! 🎯', 0, -halfH - 10);

      } else if (revealOverride && !this.found) {
        // HIDER WINS / STILL HIDDEN: Radiant Red Glowing Silhouette + Pulsing Border
        const t = Date.now();
        const pulse = Math.sin(t / 140) * 6;
        const blinkCycle = (t % 800) / 800;
        const blinkAlpha = blinkCycle < 0.7 ? 1.0 : 0.2; // Strong pulse / blink

        // 1. Neon Red Body Aura around the character itself!
        ctx.save();
        ctx.globalAlpha = blinkAlpha;
        ctx.strokeStyle = '#ff0033';
        ctx.lineWidth = this.limbThickness + 14 + Math.abs(pulse);
        ctx.shadowColor = '#ff0033';
        ctx.shadowBlur = 38 + Math.abs(pulse) * 5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        this.drawSilhouette(ctx);
        ctx.restore();

        // 2. High-intensity Red Outline directly on the character
        ctx.save();
        ctx.globalAlpha = 1.0;
        ctx.strokeStyle = '#ff2255';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#ff0033';
        ctx.shadowBlur = 18;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        this.drawSilhouette(ctx);
        ctx.restore();

        // 3. Pulsing Red Double-Border Box
        ctx.save();
        ctx.globalAlpha = blinkAlpha;
        const halfW = this.width / 2 + 18 + Math.abs(pulse);
        const halfH = this.height / 2 + 18 + Math.abs(pulse);

        // Wide outer red glow ring
        ctx.strokeStyle = 'rgba(255, 0, 50, 0.45)';
        ctx.lineWidth = 14;
        ctx.shadowColor = '#ff0033';
        ctx.shadowBlur = 30;
        ctx.strokeRect(-halfW - 4, -halfH - 4, (halfW + 4) * 2, (halfH + 4) * 2);

        // Sharp inner red border
        ctx.strokeStyle = '#ff1144';
        ctx.lineWidth = 5;
        ctx.strokeRect(-halfW, -halfH, halfW * 2, halfH * 2);
        ctx.restore();

        // 4. "HIDER WINS!" Floating Label above the character
        ctx.save();
        ctx.globalAlpha = 1.0;
        ctx.font = '900 16px "Outfit", sans-serif';
        ctx.fillStyle = '#ff2255';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#ff0033';
        ctx.shadowBlur = 20;
        ctx.fillText('👑 HIDER WINS! 👀', 0, -(this.height / 2 + 28));
        ctx.restore();
      }

      ctx.restore();
    }

    ctx.restore();
  }

  // Combined render to canvas
  render(ctx, revealOverride = false) {
    this.renderBody(ctx);
    this.renderOverlays(ctx, revealOverride);
  }

  // Draw avatar for lobby preview
  renderPreview(canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const origX = this.x;
    const origY = this.y;
    const origPlaced = this.isPlaced;
    const origScale = this.scale;

    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.scale = 0.75;
    this.isPlaced = true;

    this.render(ctx);

    this.x = origX;
    this.y = origY;
    this.isPlaced = origPlaced;
    this.scale = origScale;
  }
}
