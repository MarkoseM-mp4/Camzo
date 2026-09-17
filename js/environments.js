/**
 * Background Environment Manager for Camzo
 * Loads and renders images from the Background/ folder randomly,
 * supports custom uploaded images, and provides rich procedural environments.
 */

export class EnvironmentManager {
  constructor() {
    this.folderBackgrounds = [];

    // Rich procedural map themes
    this.proceduralThemes = [
      { id: 'procedural-forest', name: '🌲 Verdant Jungle' },
      { id: 'procedural-city', name: '🏙️ Cyberpunk Alley' },
      { id: 'procedural-warehouse', name: '📦 Industrial Warehouse' },
      { id: 'procedural-beach', name: '🏖️ Tropical Coral Beach' },
      { id: 'procedural-library', name: '📚 Grand Ancient Library' },
      { id: 'procedural-arcade', name: '🕹️ Retro 80s Arcade' },
      { id: 'procedural-graffiti', name: '🎨 Street Art Wall' },
      { id: 'procedural-candy', name: '🍭 Sweet Candy Land' },
      { id: 'procedural-circuit', name: '⚡ Cyber Circuit Board' },
      { id: 'procedural-autumn', name: '🍂 Golden Autumn Park' }
    ];

    this.currentBackgroundName = 'Default';
    this.customImage = null;
    this.customImageName = '';
    this.imageCache = new Map();
    this.rnd = Math.random;
  }

  // Seeded Pseudo-Random Number Generator (Mulberry32)
  mulberry32(a) {
    let t = a >>> 0;
    return () => {
      t = (t + 0x6D2B79F5) >>> 0;
      let r = Math.imul(t ^ (t >>> 15), t | 1);
      r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Preload background images into memory (if any custom/folder)
  async preloadImages() {
    return Promise.resolve();
  }

  // Set user custom uploaded image
  setCustomImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        this.customImage = img;
        this.customImageName = file.name;
        resolve(img);
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  // Load and draw background onto the provided canvas (with optional seed for identical multiplayer sync)
  async loadBackground(canvas, selection = 'random', seed = null) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (seed !== null && seed !== undefined) {
      this.rnd = this.mulberry32(Number(seed));
    } else {
      this.rnd = Math.random;
    }

    let chosenType = selection;

    if (this.customImage && selection === 'custom') {
      this.drawCoverImage(ctx, this.customImage, canvas.width, canvas.height);
      this.currentBackgroundName = `Custom: ${this.customImageName}`;
      return this.currentBackgroundName;
    }

    // If random, pick from available procedural themes using the active RNG
    if (chosenType === 'random' || !this.proceduralThemes.some(t => t.id === chosenType)) {
      const theme = this.proceduralThemes[Math.floor(this.rnd() * this.proceduralThemes.length)];
      chosenType = theme.id;
    }

    // Procedural Environments
    switch (chosenType) {
      case 'procedural-city':
        this.drawCityStreet(ctx, canvas.width, canvas.height);
        this.currentBackgroundName = 'Cyberpunk Alley';
        break;
      case 'procedural-warehouse':
        this.drawWarehouse(ctx, canvas.width, canvas.height);
        this.currentBackgroundName = 'Industrial Warehouse';
        break;
      case 'procedural-beach':
        this.drawBeach(ctx, canvas.width, canvas.height);
        this.currentBackgroundName = 'Tropical Coral Beach';
        break;
      case 'procedural-library':
        this.drawLibrary(ctx, canvas.width, canvas.height);
        this.currentBackgroundName = 'Grand Ancient Library';
        break;
      case 'procedural-arcade':
        this.drawArcade(ctx, canvas.width, canvas.height);
        this.currentBackgroundName = 'Retro 80s Arcade';
        break;
      case 'procedural-graffiti':
        this.drawGraffiti(ctx, canvas.width, canvas.height);
        this.currentBackgroundName = 'Street Art Wall';
        break;
      case 'procedural-candy':
        this.drawCandyLand(ctx, canvas.width, canvas.height);
        this.currentBackgroundName = 'Sweet Candy Land';
        break;
      case 'procedural-circuit':
        this.drawCircuitBoard(ctx, canvas.width, canvas.height);
        this.currentBackgroundName = 'Cyber Circuit Board';
        break;
      case 'procedural-autumn':
        this.drawAutumnPark(ctx, canvas.width, canvas.height);
        this.currentBackgroundName = 'Golden Autumn Park';
        break;
      case 'procedural-forest':
      default:
        this.drawForest(ctx, canvas.width, canvas.height);
        this.currentBackgroundName = 'Verdant Jungle';
        break;
    }

    return this.currentBackgroundName;
  }

  // Draw image to fill canvas (cover mode)
  drawCoverImage(ctx, img, cw, ch) {
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = cw / ch;
    let renderW, renderH, offsetX, offsetY;

    if (imgRatio > canvasRatio) {
      renderH = ch;
      renderW = ch * imgRatio;
      offsetX = (cw - renderW) / 2;
      offsetY = 0;
    } else {
      renderW = cw;
      renderH = cw / imgRatio;
      offsetX = 0;
      offsetY = (ch - renderH) / 2;
    }

    ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
    this.addMicroTexture(ctx, cw, ch, 0.04);
  }

  // Add subtle noise/texture so brush painting has rich pixel granularity
  addMicroTexture(ctx, w, h, opacity = 0.04) {
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (this.rnd() - 0.5) * 255 * opacity;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i+1] = Math.min(255, Math.max(0, data[i+1] + noise));
      data[i+2] = Math.min(255, Math.max(0, data[i+2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);
  }

  /* -------------------------------------------------------------
     PROCEDURAL BACKGROUND 1: VERDANT JUNGLE
     ------------------------------------------------------------- */
  drawForest(ctx, w, h) {
    // Deep woodland canopy gradient
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#0a1d12');
    sky.addColorStop(0.4, '#153320');
    sky.addColorStop(0.8, '#1f442b');
    sky.addColorStop(1, '#0c180f');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Distant tree trunks
    for (let i = 0; i < 36; i++) {
      const tx = (w / 36) * i + (Math.sin(i * 3) * 15);
      const tw = 16 + (i % 5) * 6;
      ctx.fillStyle = (i % 2 === 0) ? '#281c14' : '#38281b';
      ctx.fillRect(tx, 0, tw, h);

      // Bark streaks
      ctx.fillStyle = '#1c130d';
      ctx.fillRect(tx + tw * 0.2, 0, 3, h);
      ctx.fillRect(tx + tw * 0.6, 0, 4, h);
    }

    // Hanging jungle vines
    for (let i = 0; i < 24; i++) {
      const vx = (w / 24) * i + 20;
      ctx.strokeStyle = '#2d4a22';
      ctx.lineWidth = 4 + (i % 4);
      ctx.beginPath();
      ctx.moveTo(vx, 0);
      ctx.bezierCurveTo(vx + 30, h * 0.3, vx - 30, h * 0.6, vx + 15, h * 0.85);
      ctx.stroke();
    }

    // Rich multi-layered foliage bushes
    const greens = ['#0f2818', '#1a4327', '#255b35', '#337a47', '#429b5b', '#5bb877', '#7bd295', '#a3e4b2'];
    for (let i = 0; i < 500; i++) {
      const bx = this.rnd() * w;
      const by = this.rnd() * h;
      const br = 12 + this.rnd() * 50;
      ctx.fillStyle = greens[Math.floor(this.rnd() * greens.length)];
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fill();
    }

    // Exotic jungle flowers
    const flowerColors = ['#f43f5e', '#fb7185', '#e11d48', '#f59e0b', '#fbbf24', '#c084fc'];
    for (let i = 0; i < 50; i++) {
      const fx = this.rnd() * w;
      const fy = this.rnd() * (h - 40) + 20;
      ctx.fillStyle = flowerColors[i % flowerColors.length];
      ctx.beginPath();
      ctx.arc(fx, fy, 7 + this.rnd() * 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(fx, fy, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Mossy rocks along the ground
    for (let i = 0; i < 16; i++) {
      const rx = (w / 16) * i + this.rnd() * 20;
      const ry = h - 30 - this.rnd() * 120;
      ctx.fillStyle = '#374151';
      ctx.beginPath();
      ctx.ellipse(rx, ry, 40 + this.rnd() * 25, 22 + this.rnd() * 14, 0, 0, Math.PI * 2);
      ctx.fill();
      // Moss cap
      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.ellipse(rx, ry - 8, 30, 10, 0, Math.PI, Math.PI * 2);
      ctx.fill();
    }

    this.addMicroTexture(ctx, w, h, 0.04);
  }

  /* -------------------------------------------------------------
     PROCEDURAL BACKGROUND 2: CYBERPUNK ALLEY
     ------------------------------------------------------------- */
  drawCityStreet(ctx, w, h) {
    // Dark cyberpunk night sky
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#090a12');
    sky.addColorStop(0.6, '#141624');
    sky.addColorStop(1, '#0a0d16');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Skyscraper blocks with illuminated windows
    const buildingCount = 20;
    const bw = w / (buildingCount * 0.75);
    for (let i = 0; i < buildingCount; i++) {
      const bx = i * (bw * 0.8) - 40;
      const bh = 220 + ((i * 73) % 360);
      ctx.fillStyle = (i % 2 === 0) ? '#151928' : '#1d2337';
      ctx.fillRect(bx, h - bh - 90, bw, bh);

      // Windows
      for (let wy = h - bh - 80; wy < h - 110; wy += 18) {
        for (let wx = bx + 6; wx < bx + bw - 8; wx += 15) {
          const rand = (Math.sin(wx * 11 + wy * 17) + 1) / 2;
          if (rand > 0.45) {
            ctx.fillStyle = rand > 0.75 ? '#00f0ff' : (rand > 0.6 ? '#ff007f' : '#ffea00');
            ctx.fillRect(wx, wy, 7, 10);
          }
        }
      }
    }

    // Overhead cables
    ctx.strokeStyle = '#05070d';
    ctx.lineWidth = 3;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 80 + i * 25);
      ctx.quadraticCurveTo(w * 0.5, 120 + i * 35, w, 90 + i * 25);
      ctx.stroke();
    }

    // Asphalt road with reflections
    ctx.fillStyle = '#11131a';
    ctx.fillRect(0, h - 100, w, 100);

    // Neon puddles on road
    const puddleColors = ['rgba(0, 240, 255, 0.4)', 'rgba(255, 0, 128, 0.4)', 'rgba(168, 85, 247, 0.4)'];
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = puddleColors[i % puddleColors.length];
      ctx.beginPath();
      ctx.ellipse(80 + i * 140, h - 35 - (i % 3) * 20, 50, 10, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Crosswalk stripes
    ctx.fillStyle = '#94a3b8';
    for (let x = 40; x < w - 40; x += 55) {
      ctx.fillRect(x, h - 85, 30, 65);
    }

    // Glowing Neon Signs
    const neonSigns = [
      { text: 'RAMEN ラーメン', col: '#ff0055', x: 80, y: 140 },
      { text: 'CYBER BAR', col: '#00f0ff', x: 280, y: 200 },
      { text: 'HOTEL NEO', col: '#a855f7', x: 500, y: 120 },
      { text: 'OPEN 24H', col: '#00ff88', x: 740, y: 180 },
      { text: 'GLITCH', col: '#ffea00', x: 960, y: 150 }
    ];

    neonSigns.forEach(sign => {
      ctx.save();
      ctx.font = 'bold 20px monospace';
      ctx.fillStyle = sign.col;
      ctx.shadowColor = sign.col;
      ctx.shadowBlur = 15;
      ctx.fillText(sign.text, sign.x % (w - 180), sign.y);
      ctx.strokeRect((sign.x % (w - 180)) - 10, sign.y - 25, 170, 36);
      ctx.restore();
    });

    this.addMicroTexture(ctx, w, h, 0.05);
  }

  /* -------------------------------------------------------------
     PROCEDURAL BACKGROUND 3: INDUSTRIAL WAREHOUSE
     ------------------------------------------------------------- */
  drawWarehouse(ctx, w, h) {
    // Metal corrugated walls
    ctx.fillStyle = '#1e242d';
    ctx.fillRect(0, 0, w, h);

    // Vertical corrugated ridges
    for (let x = 0; x < w; x += 22) {
      ctx.fillStyle = (Math.floor(x / 22) % 2 === 0) ? '#28303d' : '#181d24';
      ctx.fillRect(x, 0, 22, h);
    }

    // Steel support I-beams
    for (let x = 70; x < w; x += 240) {
      ctx.fillStyle = '#334155';
      ctx.fillRect(x, 0, 34, h);
      ctx.fillStyle = '#475569';
      ctx.fillRect(x + 6, 0, 22, h);
      // Rivets
      ctx.fillStyle = '#cbd5e1';
      for (let y = 20; y < h; y += 45) {
        ctx.beginPath();
        ctx.arc(x + 10, y, 3, 0, Math.PI * 2);
        ctx.arc(x + 24, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Overhead industrial ventilation duct
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, 50, w, 32);
    ctx.fillStyle = '#475569';
    for (let x = 10; x < w; x += 40) {
      ctx.fillRect(x, 50, 4, 32);
    }

    // Hazard warning stripe barrier
    for (let x = 0; x < w + 50; x += 36) {
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(x, 220);
      ctx.lineTo(x + 18, 220);
      ctx.lineTo(x - 8, 255);
      ctx.lineTo(x - 26, 255);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(x + 18, 220);
      ctx.lineTo(x + 36, 220);
      ctx.lineTo(x + 10, 255);
      ctx.lineTo(x - 8, 255);
      ctx.fill();
    }

    // Massive stacks of colorful cargo containers & wooden pallets
    const containerColors = [
      '#dc2626', '#2563eb', '#16a34a', '#d97706',
      '#7c3aed', '#0891b2', '#78350f', '#475569'
    ];
    let seed = 42;
    for (let col = 0; col < 9; col++) {
      const cx = col * 135 + 20;
      const stackHeight = 2 + (col % 4);
      for (let row = 0; row < stackHeight; row++) {
        const cy = h - 65 - row * 75;
        const cw = 125;
        const ch = 70;
        const color = containerColors[(col + row * 3) % containerColors.length];

        ctx.fillStyle = color;
        ctx.fillRect(cx, cy, cw, ch);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 3;
        ctx.strokeRect(cx, cy, cw, ch);

        // Container door corrugations & shipping label
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        for (let gx = cx + 8; gx < cx + cw - 10; gx += 14) {
          ctx.fillRect(gx, cy + 4, 6, ch - 8);
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx + cw - 38, cy + 12, 28, 14);
      }
    }

    this.addMicroTexture(ctx, w, h, 0.05);
  }

  /* -------------------------------------------------------------
     PROCEDURAL BACKGROUND 4: TROPICAL CORAL BEACH
     ------------------------------------------------------------- */
  drawBeach(ctx, w, h) {
    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.42);
    sky.addColorStop(0, '#0284c7');
    sky.addColorStop(0.6, '#38bdf8');
    sky.addColorStop(1, '#bae6fd');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h * 0.42);

    // Fluffy clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    for (let i = 0; i < 6; i++) {
      const cx = (i * 220 + 70) % w;
      const cy = 45 + (i % 3) * 25;
      ctx.beginPath();
      ctx.arc(cx, cy, 25, 0, Math.PI * 2);
      ctx.arc(cx + 25, cy - 8, 30, 0, Math.PI * 2);
      ctx.arc(cx + 55, cy, 22, 0, Math.PI * 2);
      ctx.fill();
    }

    // Turquoise turquoise gradient ocean
    const sea = ctx.createLinearGradient(0, h * 0.42, 0, h * 0.64);
    sea.addColorStop(0, '#0369a1');
    sea.addColorStop(0.5, '#06b6d4');
    sea.addColorStop(1, '#2dd4bf');
    ctx.fillStyle = sea;
    ctx.fillRect(0, h * 0.42, w, h * 0.22);

    // Coral Reef formations underwater
    const reefColors = ['#f43f5e', '#fb923c', '#a855f7', '#ec4899', '#14b8a6'];
    for (let i = 0; i < 28; i++) {
      const rx = (i * 55 + 20) % w;
      const ry = h * 0.52 + (i % 4) * 12;
      ctx.fillStyle = reefColors[i % reefColors.length];
      ctx.beginPath();
      ctx.arc(rx, ry, 12 + (i % 3) * 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Shoreline foam wave curves
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.64);
    ctx.bezierCurveTo(w * 0.25, h * 0.62, w * 0.65, h * 0.67, w, h * 0.64);
    ctx.stroke();

    // Golden sand bank with dunes
    const sand = ctx.createLinearGradient(0, h * 0.64, 0, h);
    sand.addColorStop(0, '#fef08a');
    sand.addColorStop(0.4, '#fde047');
    sand.addColorStop(1, '#ca8a04');
    ctx.fillStyle = sand;
    ctx.fillRect(0, h * 0.64, w, h * 0.36);

    // Colorful beach umbrellas & towels
    const parasols = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
    for (let i = 0; i < 11; i++) {
      const px = 60 + i * 110;
      const py = h * 0.72 + (i % 3) * 40;

      // Beach towel
      ctx.fillStyle = parasols[i % parasols.length];
      ctx.fillRect(px - 28, py + 12, 56, 32);
      // Towel stripes
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px - 20, py + 12, 10, 32);
      ctx.fillRect(px + 10, py + 12, 10, 32);

      // Umbrella pole
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(px, py + 15);
      ctx.lineTo(px, py - 20);
      ctx.stroke();

      // Umbrella canopy
      ctx.beginPath();
      ctx.arc(px, py - 20, 32, Math.PI, Math.PI * 2);
      ctx.fillStyle = parasols[(i + 1) % parasols.length];
      ctx.fill();
    }

    this.addMicroTexture(ctx, w, h, 0.04);
  }

  /* -------------------------------------------------------------
     PROCEDURAL BACKGROUND 5: GRAND ANCIENT LIBRARY
     ------------------------------------------------------------- */
  drawLibrary(ctx, w, h) {
    // Rich mahogany & burgundy background
    ctx.fillStyle = '#231510';
    ctx.fillRect(0, 0, w, h);

    // Stone arches in the background
    for (let x = 0; x < w; x += 180) {
      ctx.fillStyle = '#3a231b';
      ctx.fillRect(x, 0, 180, h);
      ctx.fillStyle = '#1c100b';
      ctx.fillRect(x + 10, 20, 160, h - 20);
    }

    // Multi-tier wooden bookshelves
    const shelfRows = 6;
    const rowHeight = (h - 80) / shelfRows;
    const bookColors = [
      '#991b1b', '#1e40af', '#166534', '#854d0e',
      '#581c87', '#374151', '#c2410c', '#0f766e',
      '#e11d48', '#d97706', '#2563eb', '#15803d'
    ];

    for (let r = 0; r < shelfRows; r++) {
      const shelfY = 40 + r * rowHeight;

      // Wooden shelf plank
      ctx.fillStyle = '#5c3a21';
      ctx.fillRect(0, shelfY + rowHeight - 14, w, 14);
      ctx.fillStyle = '#804f2f';
      ctx.fillRect(0, shelfY + rowHeight - 14, w, 4);

      // Books filling the shelf
      let curX = 15;
      let bookIdx = r * 13;
      while (curX < w - 20) {
        const bw = 10 + (bookIdx % 7) * 4;
        const bh = rowHeight - 20 - (bookIdx % 5) * 6;
        const by = shelfY + rowHeight - 14 - bh;
        const col = bookColors[bookIdx % bookColors.length];

        ctx.fillStyle = col;
        ctx.fillRect(curX, by, bw, bh);

        // Gold spine lettering
        if (bw > 16) {
          ctx.fillStyle = '#fde047';
          ctx.fillRect(curX + 3, by + 10, bw - 6, 2);
          ctx.fillRect(curX + 3, by + 16, bw - 6, 2);
        }

        curX += bw + 3;
        bookIdx++;
      }
    }

    // Wooden library floor
    ctx.fillStyle = '#452a1a';
    ctx.fillRect(0, h - 45, w, 45);
    ctx.fillStyle = '#653e26';
    for (let x = 0; x < w; x += 60) {
      ctx.fillRect(x, h - 45, 2, 45);
    }

    // Rolling library ladder
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(w * 0.7, 30);
    ctx.lineTo(w * 0.74, h - 45);
    ctx.moveTo(w * 0.74, 30);
    ctx.lineTo(w * 0.78, h - 45);
    ctx.stroke();
    for (let ly = 60; ly < h - 50; ly += 35) {
      ctx.beginPath();
      ctx.moveTo(w * 0.7 + (ly / h) * 40, ly);
      ctx.lineTo(w * 0.74 + (ly / h) * 40, ly);
      ctx.stroke();
    }

    this.addMicroTexture(ctx, w, h, 0.04);
  }

  /* -------------------------------------------------------------
     PROCEDURAL BACKGROUND 6: RETRO 80S ARCADE
     ------------------------------------------------------------- */
  drawArcade(ctx, w, h) {
    // Deep neon dark background
    ctx.fillStyle = '#0a0518';
    ctx.fillRect(0, 0, w, h);

    // Synthwave perspective grid on upper/floor
    ctx.strokeStyle = 'rgba(236, 72, 153, 0.35)';
    ctx.lineWidth = 2;
    for (let x = 0; x <= w; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 100);
      ctx.stroke();
    }
    for (let y = 0; y <= 100; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Row of brightly colored Arcade Cabinets
    const cabCount = 8;
    const cabW = 110;
    const cabSpacing = (w - 60) / cabCount;
    const screenColors = ['#00f0ff', '#22c55e', '#eab308', '#ec4899', '#f97316', '#a855f7', '#06b6d4', '#f43f5e'];
    const cabBodies = ['#1e1b4b', '#312e81', '#1e293b', '#18181b', '#0f172a'];

    for (let i = 0; i < cabCount; i++) {
      const cx = 35 + i * cabSpacing;
      const cy = 110 + (i % 2) * 10;
      const ch = h - cy - 40;

      // Cabinet side silhouette
      ctx.fillStyle = cabBodies[i % cabBodies.length];
      ctx.fillRect(cx, cy, cabW, ch);
      ctx.strokeStyle = screenColors[i % screenColors.length];
      ctx.lineWidth = 3;
      ctx.strokeRect(cx, cy, cabW, ch);

      // Marquee sign with glow
      ctx.fillStyle = screenColors[i % screenColors.length];
      ctx.fillRect(cx + 10, cy + 10, cabW - 20, 28);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`ARCADE ${i + 1}`, cx + 18, cy + 28);

      // CRT Screen with game graphics
      const scrY = cy + 48;
      const scrH = 100;
      ctx.fillStyle = '#050b14';
      ctx.fillRect(cx + 12, scrY, cabW - 24, scrH);
      ctx.strokeStyle = '#38bdf8';
      ctx.strokeRect(cx + 12, scrY, cabW - 24, scrH);

      // Pixel game graphics on screen
      ctx.fillStyle = screenColors[(i + 1) % screenColors.length];
      ctx.beginPath();
      ctx.arc(cx + 35, scrY + 40, 10, 0, Math.PI * 2);
      ctx.arc(cx + 70, scrY + 60, 12, 0, Math.PI * 2);
      ctx.fill();

      // Joystick & Buttons deck
      ctx.fillStyle = '#334155';
      ctx.fillRect(cx + 8, scrY + scrH + 10, cabW - 16, 45);
      // Red Joystick
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(cx + 30, scrY + scrH + 28, 8, 0, Math.PI * 2);
      ctx.fill();
      // Arcade buttons
      const btnCols = ['#3b82f6', '#22c55e', '#eab308'];
      for (let b = 0; b < 3; b++) {
        ctx.fillStyle = btnCols[b];
        ctx.beginPath();
        ctx.arc(cx + 55 + b * 16, scrY + scrH + 28, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Neon carpet patterned floor
    ctx.fillStyle = '#110d24';
    ctx.fillRect(0, h - 45, w, 45);
    const carpetShapes = ['#ec4899', '#06b6d4', '#eab308', '#8b5cf6'];
    for (let x = 15; x < w; x += 35) {
      ctx.fillStyle = carpetShapes[x % carpetShapes.length];
      ctx.fillRect(x, h - 35, 12, 12);
      ctx.beginPath();
      ctx.arc(x + 22, h - 18, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    this.addMicroTexture(ctx, w, h, 0.05);
  }

  /* -------------------------------------------------------------
     PROCEDURAL BACKGROUND 7: STREET ART & GRAFFITI WALL
     ------------------------------------------------------------- */
  drawGraffiti(ctx, w, h) {
    // Red brick wall baseline
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(0, 0, w, h);

    const brickH = 26;
    const brickW = 55;
    for (let y = 0; y < h; y += brickH) {
      const offset = (Math.floor(y / brickH) % 2) * (brickW / 2);
      for (let x = -brickW; x < w + brickW; x += brickW) {
        ctx.fillStyle = ((x + y) % 3 === 0) ? '#991b1b' : (((x + y) % 5 === 0) ? '#b91c1c' : '#881337');
        ctx.fillRect(x + offset + 2, y + 2, brickW - 4, brickH - 4);
      }
    }

    // Concrete curb along bottom
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, h - 50, w, 50);
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, h - 50, w, 8);

    // Wildstyle Graffiti Spray Splatters & Tags
    const sprayColors = [
      '#f43f5e', '#3b82f6', '#10b981', '#facc15',
      '#a855f7', '#06b6d4', '#ff007f', '#22c55e', '#f97316'
    ];

    // Big spray bubbles & organic graffiti shapes
    for (let i = 0; i < 45; i++) {
      const gx = this.rnd() * w;
      const gy = this.rnd() * (h - 100) + 40;
      const gr = 30 + this.rnd() * 70;
      ctx.fillStyle = sprayColors[i % sprayColors.length];
      ctx.beginPath();
      ctx.arc(gx, gy, gr, 0, Math.PI * 2);
      ctx.fill();
    }

    // Graffiti Lettering Outlines (Camzo, Boom, Wild)
    const words = [
      { text: 'CAMZO', x: w * 0.15, y: h * 0.35, size: 70, col: '#fde047', stroke: '#000000' },
      { text: 'HIDE', x: w * 0.6, y: h * 0.45, size: 65, col: '#38bdf8', stroke: '#1e1b4b' },
      { text: 'CHAMELEON', x: w * 0.25, y: h * 0.65, size: 55, col: '#4ade80', stroke: '#064e3b' }
    ];

    words.forEach(wd => {
      ctx.save();
      ctx.font = `900 ${wd.size}px Impact, sans-serif`;
      ctx.lineWidth = 12;
      ctx.strokeStyle = wd.stroke;
      ctx.strokeText(wd.text, wd.x % (w - 250), wd.y);
      ctx.fillStyle = wd.col;
      ctx.fillText(wd.text, wd.x % (w - 250), wd.y);
      ctx.restore();
    });

    // Dripping spray paint drips
    for (let i = 0; i < 60; i++) {
      const dx = this.rnd() * w;
      const dy = this.rnd() * (h - 140) + 60;
      const dlen = 20 + this.rnd() * 60;
      ctx.fillStyle = sprayColors[i % sprayColors.length];
      ctx.fillRect(dx, dy, 5, dlen);
      ctx.beginPath();
      ctx.arc(dx + 2.5, dy + dlen, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    this.addMicroTexture(ctx, w, h, 0.06);
  }

  /* -------------------------------------------------------------
     PROCEDURAL BACKGROUND 8: SWEET CANDY LAND
     ------------------------------------------------------------- */
  drawCandyLand(ctx, w, h) {
    // Pastel Cotton Candy Sky
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#fbcfe8');
    sky.addColorStop(0.5, '#f472b6');
    sky.addColorStop(1, '#ec4899');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Rolling Marshmallow & Frosting Hills
    const hillGradients = [
      ['#c084fc', '#a855f7'],
      ['#67e8f9', '#06b6d4'],
      ['#fde047', '#facc15'],
      ['#86efac', '#22c55e']
    ];

    for (let i = 0; i < 4; i++) {
      const hill = ctx.createLinearGradient(0, h * 0.4 + i * 50, 0, h);
      hill.addColorStop(0, hillGradients[i][0]);
      hill.addColorStop(1, hillGradients[i][1]);
      ctx.fillStyle = hill;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.5 + i * 45);
      ctx.bezierCurveTo(w * 0.35, h * 0.35 + i * 50, w * 0.65, h * 0.65 + i * 40, w, h * 0.48 + i * 50);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.fill();
    }

    // Giant Swirled Lollipops
    const lollipops = [
      { x: w * 0.12, y: h * 0.48, r: 48, c1: '#ef4444', c2: '#ffffff' },
      { x: w * 0.38, y: h * 0.52, r: 42, c1: '#3b82f6', c2: '#fde047' },
      { x: w * 0.68, y: h * 0.44, r: 54, c1: '#8b5cf6', c2: '#ec4899' },
      { x: w * 0.88, y: h * 0.55, r: 38, c1: '#10b981', c2: '#ffffff' }
    ];

    lollipops.forEach(lp => {
      // Stick
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(lp.x - 4, lp.y, 8, 140);
      // Lollipop spiral candy
      ctx.beginPath();
      ctx.arc(lp.x, lp.y, lp.r, 0, Math.PI * 2);
      ctx.fillStyle = lp.c1;
      ctx.fill();
      ctx.strokeStyle = lp.c2;
      ctx.lineWidth = 7;
      ctx.stroke();

      // Spiral arcs
      ctx.beginPath();
      ctx.arc(lp.x, lp.y, lp.r * 0.65, 0, Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(lp.x, lp.y, lp.r * 0.35, Math.PI, Math.PI * 2);
      ctx.stroke();
    });

    // Sprinkles scattered everywhere
    const sprinkleColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#ffffff'];
    for (let i = 0; i < 180; i++) {
      const sx = this.rnd() * w;
      const sy = h * 0.45 + this.rnd() * (h * 0.55);
      const angle = this.rnd() * Math.PI;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(angle);
      ctx.fillStyle = sprinkleColors[i % sprinkleColors.length];
      ctx.fillRect(-8, -3, 16, 6);
      ctx.restore();
    }

    this.addMicroTexture(ctx, w, h, 0.04);
  }

  /* -------------------------------------------------------------
     PROCEDURAL BACKGROUND 9: CYBER CIRCUIT BOARD
     ------------------------------------------------------------- */
  drawCircuitBoard(ctx, w, h) {
    // Dark green/blue PCB substrate
    ctx.fillStyle = '#06281e';
    ctx.fillRect(0, 0, w, h);

    // PCB texture grid
    ctx.strokeStyle = '#0a3d2e';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 25) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 25) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Copper and Gold Bus Traces
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 4;
    for (let i = 0; i < 24; i++) {
      const startX = (i * 65) % w;
      const startY = (i * 45) % h;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(startX + 60, startY);
      ctx.lineTo(startX + 100, startY + 40);
      ctx.lineTo(startX + 180, startY + 40);
      ctx.stroke();

      // Solder pads at vertices
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(startX, startY, 5, 0, Math.PI * 2);
      ctx.arc(startX + 180, startY + 40, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Microchips (IC packages)
    const chips = [
      { x: w * 0.2, y: h * 0.3, w: 90, h: 90, label: 'CPU' },
      { x: w * 0.5, y: h * 0.2, w: 120, h: 70, label: 'GPU' },
      { x: w * 0.75, y: h * 0.45, w: 100, h: 80, label: 'RAM' },
      { x: w * 0.35, y: h * 0.65, w: 110, h: 75, label: 'ROM' }
    ];

    chips.forEach(chip => {
      // Pins
      ctx.fillStyle = '#cbd5e1';
      for (let p = chip.x + 8; p < chip.x + chip.w - 8; p += 12) {
        ctx.fillRect(p, chip.y - 8, 5, 8);
        ctx.fillRect(p, chip.y + chip.h, 5, 8);
      }

      // Chip body
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(chip.x, chip.y, chip.w, chip.h);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.strokeRect(chip.x, chip.y, chip.w, chip.h);

      // Chip label & notch
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(chip.x + 12, chip.y + 12, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(chip.label, chip.x + 20, chip.y + chip.h / 2 + 4);
    });

    // Glowing status LEDs
    const ledColors = ['#ef4444', '#22c55e', '#3b82f6', '#eab308'];
    for (let i = 0; i < 20; i++) {
      const lx = 40 + i * 65;
      const ly = h - 60 - (i % 3) * 20;
      ctx.fillStyle = ledColors[i % ledColors.length];
      ctx.beginPath();
      ctx.arc(lx, ly, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    this.addMicroTexture(ctx, w, h, 0.05);
  }

  /* -------------------------------------------------------------
     PROCEDURAL BACKGROUND 10: GOLDEN AUTUMN PARK
     ------------------------------------------------------------- */
  drawAutumnPark(ctx, w, h) {
    // Warm autumn golden hour sky
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#f97316');
    sky.addColorStop(0.35, '#fb923c');
    sky.addColorStop(0.7, '#fef08a');
    sky.addColorStop(1, '#ca8a04');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Distant mountain ridge
    ctx.fillStyle = '#7c2d12';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.45);
    ctx.lineTo(w * 0.25, h * 0.32);
    ctx.lineTo(w * 0.55, h * 0.42);
    ctx.lineTo(w * 0.8, h * 0.35);
    ctx.lineTo(w, h * 0.44);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.fill();

    // Autumn forest tree trunks
    for (let i = 0; i < 30; i++) {
      const tx = (w / 30) * i + Math.sin(i) * 12;
      const tw = 16 + (i % 4) * 6;
      ctx.fillStyle = (i % 2 === 0) ? '#451a03' : '#78350f';
      ctx.fillRect(tx, h * 0.25, tw, h * 0.75);
    }

    // Vibrant autumn leaves in oranges, crimsons, yellows
    const autumnColors = [
      '#dc2626', '#b91c1c', '#ea580c', '#f97316',
      '#d97706', '#f59e0b', '#eab308', '#78350f', '#991b1b'
    ];

    for (let i = 0; i < 480; i++) {
      const lx = this.rnd() * w;
      const ly = this.rnd() * (h * 0.75);
      const lr = 14 + this.rnd() * 42;
      ctx.fillStyle = autumnColors[i % autumnColors.length];
      ctx.beginPath();
      ctx.arc(lx, ly, lr, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cobblestone walking path
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.moveTo(w * 0.3, h);
    ctx.bezierCurveTo(w * 0.45, h * 0.75, w * 0.5, h * 0.6, w * 0.55, h * 0.5);
    ctx.lineTo(w * 0.65, h * 0.5);
    ctx.bezierCurveTo(w * 0.62, h * 0.6, w * 0.58, h * 0.75, w * 0.6, h);
    ctx.fill();

    // Fallen leaves blanket along the bottom
    for (let i = 0; i < 150; i++) {
      const flx = this.rnd() * w;
      const fly = h - 60 + this.rnd() * 55;
      ctx.fillStyle = autumnColors[i % autumnColors.length];
      ctx.beginPath();
      ctx.ellipse(flx, fly, 8 + this.rnd() * 6, 4 + this.rnd() * 3, this.rnd() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    this.addMicroTexture(ctx, w, h, 0.04);
  }
}

export const environmentManager = new EnvironmentManager();
