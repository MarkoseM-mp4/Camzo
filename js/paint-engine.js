/**
 * Camouflage Painting & Color-Sampling Engine for Camzo
 * Smooth continuous stroke painting, scrollwheel brush resizing,
 * and eyedropper color sampling.
 */

import { sound } from './audio.js';

export class PaintEngine {
  constructor(canvasContainer, paintCanvas, bgCanvas) {
    this.container = canvasContainer;
    this.canvas = paintCanvas;
    this.ctx = this.canvas.getContext('2d');
    this.bgCanvas = bgCanvas;
    this.bgCtx = this.bgCanvas.getContext('2d', { willReadFrequently: true });

    // Brush state
    this.currentColor = '#3b82f6';
    this.brushSize = 24;
    this.brushOpacity = 1.0;        // 0.0 – 1.0; changed via Ctrl+Scroll
    this.brushType = 'solid'; // 'solid', 'spray', 'stipple'
    this.isPainting = false;
    this.enabled = false;

    // Smooth stroke tracking
    this.lastX = null;
    this.lastY = null;

    // Undo history stack
    this.history = [];
    this.maxHistory = 20;

    // Callback on each paint stroke (so character canvas can re-composite the masked paint)
    this.onPaintUpdate = null;

    // Recent colors palette
    this.recentColors = ['#1e3f28', '#2e6b3b', '#8d6e63', '#1e2538', '#fde68a', '#3b82f6'];

    // Loupe and cursor elements
    this.loupeEl = document.getElementById('eyedropper-loupe');
    this.loupeCanvas = document.getElementById('loupe-canvas');
    this.loupeCtx = this.loupeCanvas ? this.loupeCanvas.getContext('2d') : null;
    this.loupeHexEl = document.getElementById('loupe-color-hex');
    this.brushCursorEl = document.getElementById('brush-cursor');

    // UI elements
    this.colorSwatchEl = document.getElementById('color-preview-swatch');
    this.colorHexEl = document.getElementById('color-hex-text');
    this.brushSizeDisplayEl = document.getElementById('brush-size-display');
    this.brushSizeSliderEl = document.getElementById('brush-size-slider');
    this.paletteContainerEl = document.getElementById('palette-chips');

    // Zoom & Pan Stage elements
    this.stageEl = document.getElementById('canvas-stage');
    this.zoomBadgeEl = document.getElementById('canvas-zoom-badge');
    this.zoomTextEl = document.getElementById('canvas-zoom-text');

    // Zoom & Pan state
    this.zoom = 1.0;
    this.panX = 0;
    this.panY = 0;
    this.isSpaceDown = false;
    this.isPanning = false;
    this.panStartX = 0;
    this.panStartY = 0;

    this.initEvents();
    this.updatePaletteUI();
    this.saveState();
  }

  // Apply CSS transform to the canvas stage
  applyTransform() {
    if (!this.stageEl) return;
    this.stageEl.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;

    if (this.zoomBadgeEl && this.zoomTextEl) {
      if (this.zoom > 1.01) {
        this.zoomBadgeEl.classList.remove('hidden');
        this.zoomTextEl.textContent = `${Math.round(this.zoom * 100)}%`;
      } else {
        this.zoomBadgeEl.classList.add('hidden');
      }
    }
  }

  // Reset zoom back to default full-view 1.0x
  resetZoom() {
    this.zoom = 1.0;
    this.panX = 0;
    this.panY = 0;
    this.isPanning = false;
    this.isSpaceDown = false;
    if (this.container) this.container.style.cursor = '';
    this.applyTransform();
  }

  setEnabled(val) {
    this.enabled = val;
    if (!val) {
      this.isPainting = false;
      this.isPanning = false;
      this.isSpaceDown = false;
      this.resetZoom();
      if (this.brushCursorEl) this.brushCursorEl.classList.add('hidden');
      if (this.loupeEl) this.loupeEl.classList.add('hidden');
    } else {
      if (this.brushCursorEl) this.brushCursorEl.classList.remove('hidden');
    }
  }

  // Convert mouse client coordinates to internal 1280×720 canvas space.
  // bgCanvas is always visible — use its rect for coordinate scaling.
  // The brush cursor div lives inside canvas-container, so clientX/Y must be
  // relative to the CONTAINER (not the canvas), to account for letterbox offsets.
  getCanvasCoords(e) {
    const refCanvas = this.bgCanvas;
    const canvasRect = refCanvas.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();

    if (!canvasRect || canvasRect.width === 0) {
      // Fallback: treat container as canvas area
      const scaleX = refCanvas.width  / containerRect.width;
      const scaleY = refCanvas.height / containerRect.height;
      return {
        x: (e.clientX - containerRect.left) * scaleX,
        y: (e.clientY - containerRect.top)  * scaleY,
        clientX: e.clientX - containerRect.left,
        clientY: e.clientY - containerRect.top
      };
    }

    const scaleX = refCanvas.width  / canvasRect.width;
    const scaleY = refCanvas.height / canvasRect.height;
    return {
      // Internal canvas coords (for painting / hit-test):
      x: (e.clientX - canvasRect.left) * scaleX,
      y: (e.clientY - canvasRect.top)  * scaleY,
      // CSS coords relative to canvas-container (for brush cursor div positioning):
      clientX: e.clientX - containerRect.left,
      clientY: e.clientY - containerRect.top
    };
  }

  initEvents() {
    // Prevent default context menu on right click
    this.container.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });

    // Zoom Badge click to reset
    if (this.zoomBadgeEl) {
      this.zoomBadgeEl.addEventListener('click', (e) => {
        e.stopPropagation();
        this.resetZoom();
      });
    }

    // Spacebar key tracking for pan navigation when zoomed in
    window.addEventListener('keydown', (e) => {
      if (!this.enabled) return;
      if (e.code === 'Space' && !this.isSpaceDown && this.zoom > 1.01) {
        if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
        e.preventDefault();
        this.isSpaceDown = true;
        this.container.style.cursor = 'grab';
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space') {
        this.isSpaceDown = false;
        if (!this.isPanning) {
          this.container.style.cursor = '';
        }
      }
    });

    // MOUSE DOWN: Paint, Color Pick, or Pan
    this.container.addEventListener('mousedown', (e) => {
      if (!this.enabled) return;

      // Pan with Space + Left Click OR Middle Click (button 1)
      if ((this.isSpaceDown && e.button === 0) || e.button === 1) {
        e.preventDefault();
        this.isPanning = true;
        this.panStartX = e.clientX - this.panX;
        this.panStartY = e.clientY - this.panY;
        this.container.style.cursor = 'grabbing';
        return;
      }

      const coords = this.getCanvasCoords(e);

      // RIGHT CLICK: Sample Color
      if (e.button === 2) {
        e.preventDefault();
        this.sampleColorAt(coords.x, coords.y);
        this.updateLoupe(coords);
        return;
      }

      // LEFT CLICK: Start continuous painting
      if (e.button === 0) {
        this.isPainting = true;
        this.lastX = coords.x;
        this.lastY = coords.y;

        // Draw initial dot
        this.paintDot(coords.x, coords.y);
        sound.playPaintStroke();

        if (this.onPaintUpdate) this.onPaintUpdate();
      }
    });

    // MOUSE MOVE: Continuous smooth ribbon painting or panning
    window.addEventListener('mousemove', (e) => {
      if (!this.enabled) return;

      // Panning active
      if (this.isPanning) {
        this.panX = e.clientX - this.panStartX;
        this.panY = e.clientY - this.panStartY;

        const containerRect = this.container.getBoundingClientRect();
        const minPanX = containerRect.width * (1 - this.zoom) - containerRect.width * 0.25;
        const maxPanX = containerRect.width * 0.25;
        const minPanY = containerRect.height * (1 - this.zoom) - containerRect.height * 0.25;
        const maxPanY = containerRect.height * 0.25;

        this.panX = Math.max(minPanX, Math.min(maxPanX, this.panX));
        this.panY = Math.max(minPanY, Math.min(maxPanY, this.panY));

        this.applyTransform();
        return;
      }

      // Use bgCanvas rect for bounds check
      const rect = this.bgCanvas.getBoundingClientRect();
      const containerRect = this.container.getBoundingClientRect();
      const inBounds = (
        rect.width > 0 &&
        e.clientX >= containerRect.left &&
        e.clientX <= containerRect.right &&
        e.clientY >= containerRect.top &&
        e.clientY <= containerRect.bottom &&
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      );

      if (!inBounds) {
        if (this.brushCursorEl) this.brushCursorEl.classList.add('hidden');
        if (this.loupeEl) this.loupeEl.classList.add('hidden');
        return;
      }

      const coords = this.getCanvasCoords(e);
      this.updateCursorIndicator(coords);

      // Continuous painting: draw smooth line from last point to current point
      if (this.isPainting) {
        if (this.lastX !== null && this.lastY !== null) {
          this.paintSmoothStroke(this.lastX, this.lastY, coords.x, coords.y);
        }
        this.lastX = coords.x;
        this.lastY = coords.y;

        if (this.onPaintUpdate) this.onPaintUpdate();
      }

      // Right mouse held down: continuous color sampling
      if (e.buttons === 2) {
        this.sampleColorAt(coords.x, coords.y);
        this.updateLoupe(coords);
      }
    });

    // MOUSE UP: Finish stroke or panning
    window.addEventListener('mouseup', (e) => {
      if (this.isPanning) {
        this.isPanning = false;
        this.container.style.cursor = this.isSpaceDown ? 'grab' : '';
      }
      if (this.isPainting) {
        this.isPainting = false;
        this.lastX = null;
        this.lastY = null;
        this.saveState();
        if (this.onPaintUpdate) this.onPaintUpdate();
      }
      if (this.loupeEl) {
        this.loupeEl.classList.add('hidden');
      }
    });

    // MOUSE WHEEL:
    //   Shift + Scroll   → ZOOM into/out of canvas with mouse pointer as center!
    //   Ctrl + Scroll    → Change brush OPACITY
    //   Default Scroll   → Change brush SIZE
    const handleWheel = (e) => {
      if (!this.enabled) return;
      e.preventDefault();
      e.stopPropagation();

      const isShift = e.shiftKey;
      const isCtrl = e.ctrlKey || e.metaKey;
      const scrollUp = e.deltaY < 0;

      if (isShift) {
        // Shift + Scroll Wheel → ZOOM into canvas with mouse pointer as center
        const containerRect = this.container.getBoundingClientRect();
        const mouseX = e.clientX - containerRect.left;
        const mouseY = e.clientY - containerRect.top;

        // Stage coordinate currently under mouse cursor
        const stageX = (mouseX - this.panX) / this.zoom;
        const stageY = (mouseY - this.panY) / this.zoom;

        // Zoom factor
        const zoomStep = scrollUp ? 1.18 : (1 / 1.18);
        let newZoom = this.zoom * zoomStep;

        if (newZoom <= 1.05) {
          // Snap back to normal 1x view
          this.resetZoom();
        } else {
          newZoom = Math.min(6.0, newZoom);
          this.zoom = newZoom;
          this.panX = mouseX - stageX * newZoom;
          this.panY = mouseY - stageY * newZoom;

          // Pan bounds clamping (keep canvas within reasonable viewport reach)
          const minPanX = containerRect.width * (1 - newZoom) - containerRect.width * 0.25;
          const maxPanX = containerRect.width * 0.25;
          const minPanY = containerRect.height * (1 - newZoom) - containerRect.height * 0.25;
          const maxPanY = containerRect.height * 0.25;

          this.panX = Math.max(minPanX, Math.min(maxPanX, this.panX));
          this.panY = Math.max(minPanY, Math.min(maxPanY, this.panY));

          this.applyTransform();
        }

        const coords = this.getCanvasCoords(e);
        this.updateCursorIndicator(coords);
        return;
      }

      if (isCtrl) {
        // Ctrl+Scroll → adjust opacity in 5% steps
        const step = scrollUp ? 0.05 : -0.05;
        this.setBrushOpacity(this.brushOpacity + step);
      } else {
        // Plain scroll → adjust brush size (fine 1px steps below 6px)
        let delta;
        if (scrollUp) {
          delta = this.brushSize < 6 ? 1 : (this.brushSize < 16 ? 2 : 4);
        } else {
          delta = this.brushSize <= 6 ? -1 : (this.brushSize <= 16 ? -2 : -4);
        }
        this.setBrushSize(this.brushSize + delta);
      }

      const coords = this.getCanvasCoords(e);
      this.updateCursorIndicator(coords);
    };

    // paintCanvas has pointer-events:none, so attach wheel listeners to container + bgCanvas
    this.container.addEventListener('wheel', handleWheel, { passive: false });
    this.bgCanvas.addEventListener('wheel', handleWheel, { passive: false });
    // Also capture at document level so scroll still works when mouse is over overlaid canvases
    document.addEventListener('wheel', (e) => {
      const rect = this.container.getBoundingClientRect();
      const inCanvas = (
        e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= rect.bottom
      );
      if (inCanvas) handleWheel(e);
    }, { passive: false });


    // Slider sync
    if (this.brushSizeSliderEl) {
      this.brushSizeSliderEl.addEventListener('input', (e) => {
        this.setBrushSize(parseInt(e.target.value, 10));
      });
    }

    // Brush Type Buttons
    document.querySelectorAll('.brush-type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.brush-type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.brushType = btn.dataset.type;
      });
    });

    // Undo via Ctrl+Z
    window.addEventListener('keydown', (e) => {
      if (!this.enabled) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        this.undo();
      }
    });
  }

  // Brush Sizing
  setBrushSize(newSize) {
    this.brushSize = Math.max(1, Math.min(64, newSize));
    if (this.brushSizeDisplayEl) {
      this.brushSizeDisplayEl.textContent = `${this.brushSize}px`;
    }
    if (this.brushSizeSliderEl) {
      this.brushSizeSliderEl.value = this.brushSize;
    }
  }

  // Brush Opacity (Ctrl+Scroll)
  setBrushOpacity(val) {
    if (this.brushOpacity === undefined) this.brushOpacity = 1.0;
    this.brushOpacity = Math.max(0.05, Math.min(1.0, val));
    // Update the opacity display text if present
    const opacityEl = document.getElementById('brush-opacity-display');
    if (opacityEl) opacityEl.textContent = `${Math.round(this.brushOpacity * 100)}%`;
    // Animate the progress bar
    const barEl = document.getElementById('brush-opacity-bar');
    if (barEl) barEl.style.width = `${Math.round(this.brushOpacity * 100)}%`;
    // Tint the cursor border to show semi-transparency
    this.updateCursorBorderOpacity();
  }

  updateCursorBorderOpacity() {
    if (!this.brushCursorEl) return;
    // Make border color semi-transparent to give visual opacity feedback
    const r = parseInt(this.currentColor.slice(1, 3), 16);
    const g = parseInt(this.currentColor.slice(3, 5), 16);
    const b = parseInt(this.currentColor.slice(5, 7), 16);
    const opacity = this.brushOpacity !== undefined ? this.brushOpacity : 1.0;
    this.brushCursorEl.style.borderColor = `rgba(${r},${g},${b},${opacity})`;
    this.brushCursorEl.style.backgroundColor = `rgba(${r},${g},${b},${opacity * 0.12})`;
  }

  // Update Dynamic Brush Cursor Indicator circle
  updateCursorIndicator(coords) {
    if (!this.brushCursorEl) return;
    this.brushCursorEl.classList.remove('hidden');
    // coords.clientX/Y are relative to canvas-container — use them directly
    this.brushCursorEl.style.left = `${coords.clientX}px`;
    this.brushCursorEl.style.top = `${coords.clientY}px`;

    const rect = this.bgCanvas.getBoundingClientRect();
    const displayRadius = rect.width > 0 ? (this.brushSize * rect.width) / this.bgCanvas.width : this.brushSize;

    this.brushCursorEl.style.width = `${displayRadius * 2}px`;
    this.brushCursorEl.style.height = `${displayRadius * 2}px`;
    this.updateCursorBorderOpacity();
  }

  // Sample exact pixel color from background
  sampleColorAt(x, y) {
    const clampedX = Math.max(0, Math.min(this.bgCanvas.width - 1, Math.floor(x)));
    const clampedY = Math.max(0, Math.min(this.bgCanvas.height - 1, Math.floor(y)));

    try {
      const pixel = this.bgCtx.getImageData(clampedX, clampedY, 1, 1).data;
      const hex = this.rgbToHex(pixel[0], pixel[1], pixel[2]);
      this.setColor(hex);
      sound.playSampleColor();
    } catch (e) {
      console.warn('Error sampling pixel:', e);
    }
  }

  // Update Magnifying Loupe
  updateLoupe(coords) {
    if (!this.loupeEl || !this.loupeCtx) return;
    this.loupeEl.classList.remove('hidden');
    this.loupeEl.style.left = `${coords.clientX}px`;
    this.loupeEl.style.top = `${coords.clientY}px`;

    const sampleW = 12;
    const sampleH = 12;
    const sx = Math.max(0, Math.min(this.bgCanvas.width - sampleW, coords.x - sampleW / 2));
    const sy = Math.max(0, Math.min(this.bgCanvas.height - sampleH, coords.y - sampleH / 2));

    this.loupeCtx.imageSmoothingEnabled = false;
    this.loupeCtx.clearRect(0, 0, 60, 60);
    this.loupeCtx.drawImage(this.bgCanvas, sx, sy, sampleW, sampleH, 0, 0, 60, 60);

    if (this.loupeHexEl) {
      this.loupeHexEl.textContent = this.currentColor.toUpperCase();
    }
  }

  // Set current color
  setColor(hex) {
    this.currentColor = hex;
    if (this.colorSwatchEl) this.colorSwatchEl.style.backgroundColor = hex;
    if (this.colorHexEl) this.colorHexEl.textContent = hex.toUpperCase();

    if (!this.recentColors.includes(hex)) {
      this.recentColors.unshift(hex);
      if (this.recentColors.length > 8) this.recentColors.pop();
      this.updatePaletteUI();
    }
  }

  // Update Recent Colors Palette
  updatePaletteUI() {
    if (!this.paletteContainerEl) return;
    this.paletteContainerEl.innerHTML = '';
    this.recentColors.forEach(col => {
      const chip = document.createElement('div');
      chip.className = 'palette-chip';
      chip.style.backgroundColor = col;
      chip.title = `Color: ${col}`;
      chip.addEventListener('click', () => {
        this.setColor(col);
        sound.playSampleColor();
      });
      this.paletteContainerEl.appendChild(chip);
    });
  }

  // SILKY SMOOTH CONTINUOUS BRUSH STROKE (NO "DOT DOT" ARTIFACTS)
  paintSmoothStroke(x1, y1, x2, y2) {
    this.ctx.save();
    this.ctx.globalAlpha = this.brushOpacity ?? 1.0; // apply Ctrl+Scroll opacity

    if (this.brushType === 'spray') {
      // Soft airbrush: dense interpolated spray
      const dist = Math.hypot(x2 - x1, y2 - y1);
      const steps = Math.max(1, Math.ceil(dist / 4));
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const cx = x1 + (x2 - x1) * t;
        const cy = y1 + (y2 - y1) * t;
        const grad = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, this.brushSize);
        grad.addColorStop(0, this.currentColor);
        grad.addColorStop(0.6, this.currentColor);
        grad.addColorStop(1, 'transparent');
        this.ctx.fillStyle = grad;
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, this.brushSize, 0, Math.PI * 2);
        this.ctx.fill();
      }
    } else if (this.brushType === 'stipple') {
      // Textured stipple along continuous path
      const dist = Math.hypot(x2 - x1, y2 - y1);
      const steps = Math.max(1, Math.ceil(dist / 6));
      this.ctx.fillStyle = this.currentColor;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const cx = x1 + (x2 - x1) * t;
        const cy = y1 + (y2 - y1) * t;
        const dots = Math.max(1, Math.floor(this.brushSize * 0.7));
        for (let d = 0; d < dots; d++) {
          const r = Math.random() * this.brushSize;
          const a = Math.random() * Math.PI * 2;
          const dotRadius = Math.max(0.5, Math.min(this.brushSize, 2 + Math.random() * 3));
          this.ctx.beginPath();
          this.ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, dotRadius, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
    } else {
      // Solid continuous stroke: round cap + round join path
      this.ctx.strokeStyle = this.currentColor;
      this.ctx.fillStyle = this.currentColor;
      this.ctx.lineWidth = Math.max(1, this.brushSize * 2);
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';

      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  // Paint a single dot on initial click
  paintDot(x, y) {
    this.ctx.save();
    this.ctx.globalAlpha = this.brushOpacity ?? 1.0; // apply Ctrl+Scroll opacity
    this.ctx.fillStyle = this.currentColor;

    if (this.brushType === 'spray') {
      const grad = this.ctx.createRadialGradient(x, y, 0, x, y, this.brushSize);
      grad.addColorStop(0, this.currentColor);
      grad.addColorStop(0.6, this.currentColor);
      grad.addColorStop(1, 'transparent');
      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(x, y, this.brushSize, 0, Math.PI * 2);
      this.ctx.fill();
    } else if (this.brushType === 'stipple') {
      const dots = Math.max(1, Math.floor(this.brushSize * 1.4));
      for (let d = 0; d < dots; d++) {
        const r = Math.random() * this.brushSize;
        const a = Math.random() * Math.PI * 2;
        const dotRadius = Math.max(0.5, Math.min(this.brushSize, 2 + Math.random() * 3));
        this.ctx.beginPath();
        this.ctx.arc(x + Math.cos(a) * r, y + Math.sin(a) * r, dotRadius, 0, Math.PI * 2);
        this.ctx.fill();
      }
    } else {
      this.ctx.beginPath();
      this.ctx.arc(x, y, Math.max(0.5, this.brushSize), 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();
  }

  // Save Canvas State for Undo
  saveState() {
    if (this.history.length >= this.maxHistory) {
      this.history.shift();
    }
    const snapshot = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    this.history.push(snapshot);
  }

  // Undo Last Stroke
  undo() {
    if (this.history.length > 1) {
      this.history.pop();
      const prev = this.history[this.history.length - 1];
      this.ctx.putImageData(prev, 0, 0);
      sound.playTick();
      if (this.onPaintUpdate) this.onPaintUpdate();
    } else if (this.history.length === 1) {
      this.clear();
    }
  }

  // Clear Paint Canvas
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.history = [];
    this.saveState();
    if (this.onPaintUpdate) this.onPaintUpdate();
  }

  rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }
}
