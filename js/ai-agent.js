/**
 * AI Agents for Camzo
 * 1. AI Hunter: Sweeps flashlight across the map with realistic inspection behavior and clicks.
 * 2. AI Hider: Positions and camouflages stickman automatically by sampling background colors.
 */

export class AIAgent {
  constructor() {
    this.hunterTimer = null;
    this.isHunterActive = false;
  }

  // Generate automated camouflage for an AI Hider
  static camouflageHider(hider, bgCanvas, paintCanvas) {
    const bgCtx = bgCanvas.getContext('2d', { willReadFrequently: true });
    const paintCtx = paintCanvas.getContext('2d');
    const box = hider.getHitbox();

    // Sample 6-10 points around and inside the stickman
    const samplePoints = [
      { x: hider.x, y: hider.y - 70 }, // Head
      { x: hider.x, y: hider.y - 45 }, // Torso
      { x: hider.x - 15, y: hider.y - 40 }, // Left arm
      { x: hider.x + 15, y: hider.y - 40 }, // Right arm
      { x: hider.x - 10, y: hider.y - 15 }, // Left leg
      { x: hider.x + 10, y: hider.y - 15 }  // Right leg
    ];

    samplePoints.forEach(pt => {
      const sx = Math.max(0, Math.min(bgCanvas.width - 1, Math.floor(pt.x)));
      const sy = Math.max(0, Math.min(bgCanvas.height - 1, Math.floor(pt.y)));
      const pixel = bgCtx.getImageData(sx, sy, 1, 1).data;
      const col = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;

      // Paint camouflage splats over the limb
      paintCtx.save();
      paintCtx.fillStyle = col;
      paintCtx.beginPath();
      paintCtx.arc(pt.x + (Math.random() * 8 - 4), pt.y + (Math.random() * 8 - 4), 16 + Math.random() * 8, 0, Math.PI * 2);
      paintCtx.fill();

      // Add a couple micro texture stipples
      for (let i = 0; i < 4; i++) {
        paintCtx.beginPath();
        paintCtx.arc(pt.x + (Math.random() * 24 - 12), pt.y + (Math.random() * 24 - 12), 2 + Math.random() * 4, 0, Math.PI * 2);
        paintCtx.fill();
      }
      paintCtx.restore();
    });
  }

  // Start AI Hunter autonomous search behavior
  startAIHunter(hunterVision, hiders, onEnd) {
    this.isHunterActive = true;
    let nextInspectTime = Date.now() + 2000;

    const patrol = () => {
      if (!this.isHunterActive) return;

      // Pick a search waypoint
      const activeHiders = hiders.filter(h => !h.found && !h.eliminated);
      if (activeHiders.length === 0) {
        this.stopAIHunter();
        if (onEnd) onEnd();
        return;
      }

      // 40% chance to gravitate towards a hider with noise, 60% chance to roam randomly
      let targetX, targetY;
      if (Math.random() < 0.45 && activeHiders.length > 0) {
        const target = activeHiders[Math.floor(Math.random() * activeHiders.length)];
        // Add random scatter offset (between -100 and +100px)
        targetX = target.x + (Math.random() * 160 - 80);
        targetY = target.y + (Math.random() * 160 - 80);
      } else {
        targetX = 150 + Math.random() * (hunterVision.canvas.width - 300);
        targetY = 150 + Math.random() * (hunterVision.canvas.height - 300);
      }

      hunterVision.targetX = Math.max(50, Math.min(hunterVision.canvas.width - 50, targetX));
      hunterVision.targetY = Math.max(50, Math.min(hunterVision.canvas.height - 50, targetY));

      // Investigation decision
      if (Date.now() >= nextInspectTime) {
        nextInspectTime = Date.now() + 1800 + Math.random() * 2500;
        // Investigate around current flashlight position
        const clickX = hunterVision.currentX + (Math.random() * 40 - 20);
        const clickY = hunterVision.currentY + (Math.random() * 40 - 20);
        hunterVision.investigate(clickX, clickY);
      }

      // Schedule next sweep waypoint in 1.2 to 2.5 seconds
      const nextPatrolDelay = 1200 + Math.random() * 1300;
      this.hunterTimer = setTimeout(patrol, nextPatrolDelay);
    };

    patrol();
  }

  stopAIHunter() {
    this.isHunterActive = false;
    if (this.hunterTimer) {
      clearTimeout(this.hunterTimer);
      this.hunterTimer = null;
    }
  }
}
