/**
 * Background Environment Manager for Camzo
 * Loads and renders procedural and folder background environments.
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
      { id: 'procedural-autumn', name: '🍂 Golden Autumn Park' },
      { id: 'procedural-volcano', name: '🌋 Magma Cavern' },
      { id: 'procedural-space', name: '🚀 Cosmic Nebula' },
      { id: 'procedural-arctic', name: '❄️ Crystal Ice Cave' },
      { id: 'procedural-egypt', name: '🏺 Pharaoh\'s Tomb' },
      { id: 'procedural-mystic', name: '🔮 Mystic Mushroom Hollow' },
      { id: 'procedural-underwater', name: '🌊 Sunken Atlantis' },
      { id: 'procedural-dojo', name: '🌸 Zen Bamboo Garden' },
      { id: 'procedural-steampunk', name: '⚙️ Steampunk Workshop' },
      { id: 'procedural-haunted', name: '🏰 Haunted Gothic Castle' },
      { id: 'procedural-matrix', name: '🟢 Digital Cyber Matrix' }
    ];

    this.currentBackgroundName = 'Default';
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

  // Preload background images into memory (if any folder)
  async preloadImages() {
    return Promise.resolve();
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
      case 'procedural-volcano':
        this.drawMagmaCavern(ctx, canvas.width, canvas.height);
        this.currentBackgroundName = 'Magma Cavern';
        break;
      case 'procedural-space':
        this.drawCosmicNebula(ctx, canvas.width, canvas.height);
        this.currentBackgroundName = 'Cosmic Nebula';
        break;
      case 'procedural-arctic':
        this.drawIceCave(ctx, canvas.width, canvas.height);
        this.currentBackgroundName = 'Crystal Ice Cave';
        break;
      case 'procedural-egypt':
        this.drawPharaohTomb(ctx, canvas.width, canvas.height);
        this.currentBackgroundName = 'Pharaoh\'s Tomb';
        break;
      case 'procedural-mystic':
        this.drawMysticHollow(ctx, canvas.width, canvas.height);
        this.currentBackgroundName = 'Mystic Mushroom Hollow';
        break;
      case 'procedural-underwater':
        this.drawSunkenAtlantis(ctx, canvas.width, canvas.height);
        this.currentBackgroundName = 'Sunken Atlantis';
        break;
      case 'procedural-dojo':
        this.drawZenGarden(ctx, canvas.width, canvas.height);
        this.currentBackgroundName = 'Zen Bamboo Garden';
        break;
      case 'procedural-steampunk':
        this.drawSteampunkWorkshop(ctx, canvas.width, canvas.height);
        this.currentBackgroundName = 'Steampunk Workshop';
        break;
      case 'procedural-haunted':
        this.drawHauntedCastle(ctx, canvas.width, canvas.height);
        this.currentBackgroundName = 'Haunted Gothic Castle';
        break;
      case 'procedural-matrix':
        this.drawCyberMatrix(ctx, canvas.width, canvas.height);
        this.currentBackgroundName = 'Digital Cyber Matrix';
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

  /* -------------------------------------------------------------
     PROCEDURAL BACKGROUND 11: MAGMA CAVERN
     ------------------------------------------------------------- */
  drawMagmaCavern(ctx, w, h) {
    // Dark charred volcanic cavern backdrop
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#100505');
    sky.addColorStop(0.5, '#240a0a');
    sky.addColorStop(0.85, '#3b0d0d');
    sky.addColorStop(1, '#1a0505');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Jagged volcanic ceiling stalactites
    ctx.fillStyle = '#1c0c0c';
    for (let x = 0; x < w + 40; x += 35) {
      const sh = 40 + (this.rnd() * 80);
      const sw = 25 + this.rnd() * 25;
      ctx.beginPath();
      ctx.moveTo(x - sw / 2, 0);
      ctx.lineTo(x, sh);
      ctx.lineTo(x + sw / 2, 0);
      ctx.fill();
    }

    // Basalt hexagonal pillars along the sides
    const pillarColors = ['#180e0e', '#231414', '#2d1818'];
    for (let i = 0; i < 14; i++) {
      const px = (i % 2 === 0) ? (i * 28) : (w - (i * 28) - 30);
      const ph = 180 + (i * 37) % 240;
      const pw = 36 + (i % 3) * 8;
      ctx.fillStyle = pillarColors[i % pillarColors.length];
      ctx.fillRect(px, h - ph - 60, pw, ph);
      // Basalt column highlights
      ctx.fillStyle = '#3a2020';
      ctx.fillRect(px + 4, h - ph - 60, 6, ph);
      ctx.fillStyle = '#0f0707';
      ctx.fillRect(px + pw - 6, h - ph - 60, 6, ph);
    }

    // Glowing fissures in rock walls
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 2;
    for (let i = 0; i < 10; i++) {
      let fx = this.rnd() * w;
      let fy = h * 0.2 + this.rnd() * (h * 0.45);
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      for (let s = 0; s < 5; s++) {
        fx += (this.rnd() - 0.5) * 45;
        fy += 12 + this.rnd() * 20;
        ctx.lineTo(fx, fy);
      }
      ctx.stroke();
    }

    // Cascading Molten Lava River
    const lavaGrad = ctx.createLinearGradient(0, h * 0.65, 0, h);
    lavaGrad.addColorStop(0, '#991b1b');
    lavaGrad.addColorStop(0.2, '#dc2626');
    lavaGrad.addColorStop(0.5, '#ea580c');
    lavaGrad.addColorStop(0.8, '#f59e0b');
    lavaGrad.addColorStop(1, '#fef08a');

    ctx.fillStyle = lavaGrad;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.72);
    ctx.bezierCurveTo(w * 0.3, h * 0.62, w * 0.6, h * 0.78, w, h * 0.68);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.fill();

    // Hot golden lava flow ripples
    ctx.strokeStyle = '#fffbeb';
    ctx.lineWidth = 3;
    for (let r = 0; r < 9; r++) {
      const rx = (r * 130 + 30) % w;
      const ry = h * 0.75 + (r % 4) * 18;
      ctx.beginPath();
      ctx.ellipse(rx, ry, 45 + (r % 3) * 20, 8, -0.1, 0, Math.PI);
      ctx.stroke();
    }

    // Magma bubbles
    for (let b = 0; b < 16; b++) {
      const bx = this.rnd() * w;
      const by = h * 0.74 + this.rnd() * (h * 0.22);
      const br = 6 + this.rnd() * 12;
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(bx, by, br * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Floating incandescent fiery embers & sparks
    const emberColors = ['#fef08a', '#fde047', '#f97316', '#ef4444'];
    for (let e = 0; e < 110; e++) {
      const ex = this.rnd() * w;
      const ey = this.rnd() * (h * 0.85);
      const er = 1.5 + this.rnd() * 3.5;
      ctx.fillStyle = emberColors[e % emberColors.length];
      ctx.beginPath();
      ctx.arc(ex, ey, er, 0, Math.PI * 2);
      ctx.fill();
    }

    this.addMicroTexture(ctx, w, h, 0.05);
  }

  /* -------------------------------------------------------------
     PROCEDURAL BACKGROUND 12: COSMIC NEBULA
     ------------------------------------------------------------- */
  drawCosmicNebula(ctx, w, h) {
    // Deep cosmic void backdrop
    const spaceGrad = ctx.createLinearGradient(0, 0, w, h);
    spaceGrad.addColorStop(0, '#02010a');
    spaceGrad.addColorStop(0.5, '#070319');
    spaceGrad.addColorStop(1, '#020008');
    ctx.fillStyle = spaceGrad;
    ctx.fillRect(0, 0, w, h);

    // Glowing vibrant nebula gas clouds
    const nebulae = [
      { x: w * 0.25, y: h * 0.35, r: 240, c1: 'rgba(147, 51, 234, 0.38)', c2: 'rgba(79, 70, 229, 0)' },
      { x: w * 0.7, y: h * 0.6, r: 280, c1: 'rgba(236, 72, 153, 0.35)', c2: 'rgba(168, 85, 247, 0)' },
      { x: w * 0.5, y: h * 0.2, r: 220, c1: 'rgba(6, 182, 212, 0.32)', c2: 'rgba(14, 165, 233, 0)' },
      { x: w * 0.82, y: h * 0.25, r: 200, c1: 'rgba(244, 63, 94, 0.28)', c2: 'rgba(217, 70, 239, 0)' },
      { x: w * 0.15, y: h * 0.75, r: 210, c1: 'rgba(59, 130, 246, 0.3)', c2: 'rgba(16, 185, 129, 0)' }
    ];

    nebulae.forEach(neb => {
      const g = ctx.createRadialGradient(neb.x, neb.y, 20, neb.x, neb.y, neb.r);
      g.addColorStop(0, neb.c1);
      g.addColorStop(1, neb.c2);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(neb.x, neb.y, neb.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Starfield (320 stars)
    const starColors = ['#ffffff', '#bae6fd', '#fef08a', '#fbcfe8', '#a7f3d0'];
    for (let s = 0; s < 320; s++) {
      const sx = this.rnd() * w;
      const sy = this.rnd() * h;
      const sr = 0.7 + this.rnd() * 2.2;
      ctx.fillStyle = starColors[s % starColors.length];
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();

      // Starburst cross on brightest stars
      if (s % 22 === 0) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sx - 7, sy);
        ctx.lineTo(sx + 7, sy);
        ctx.moveTo(sx, sy - 7);
        ctx.lineTo(sx, sy + 7);
        ctx.stroke();
      }
    }

    // Majestic Ringed Gas Giant Planet
    const px = w * 0.74;
    const py = h * 0.34;
    const pr = 58;

    // Atmospheric planet glow
    const planetAtm = ctx.createRadialGradient(px, py, pr * 0.8, px, py, pr * 1.35);
    planetAtm.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
    planetAtm.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = planetAtm;
    ctx.beginPath();
    ctx.arc(px, py, pr * 1.35, 0, Math.PI * 2);
    ctx.fill();

    // Planet body with atmospheric bands
    const planetGrad = ctx.createLinearGradient(px - pr, py - pr, px + pr, py + pr);
    planetGrad.addColorStop(0, '#38bdf8');
    planetGrad.addColorStop(0.35, '#818cf8');
    planetGrad.addColorStop(0.65, '#c084fc');
    planetGrad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = planetGrad;
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fill();

    // Planetary Rings (tilted ellipse)
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(-0.38);
    // Outer bright ring
    ctx.strokeStyle = 'rgba(224, 231, 255, 0.65)';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.ellipse(0, 0, pr * 2.2, pr * 0.55, 0, 0, Math.PI * 2);
    ctx.stroke();
    // Inner ring
    ctx.strokeStyle = 'rgba(165, 180, 252, 0.45)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.ellipse(0, 0, pr * 1.75, pr * 0.42, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Distant Cratered Moon
    const mx = w * 0.2;
    const my = h * 0.22;
    const mr = 22;
    const moonGrad = ctx.createRadialGradient(mx - 5, my - 5, 3, mx, my, mr);
    moonGrad.addColorStop(0, '#f1f5f9');
    moonGrad.addColorStop(0.7, '#94a3b8');
    moonGrad.addColorStop(1, '#334155');
    ctx.fillStyle = moonGrad;
    ctx.beginPath();
    ctx.arc(mx, my, mr, 0, Math.PI * 2);
    ctx.fill();

    // Orbital space satellite station
    const satX = w * 0.42;
    const satY = h * 0.68;
    // Station core
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(satX - 10, satY - 7, 20, 14);
    // Blue solar panel wings
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(satX - 45, satY - 14, 30, 28);
    ctx.fillRect(satX + 15, satY - 14, 30, 28);
    ctx.strokeStyle = '#e0f2fe';
    ctx.lineWidth = 1;
    ctx.strokeRect(satX - 45, satY - 14, 30, 28);
    ctx.strokeRect(satX + 15, satY - 14, 30, 28);
    // Blinking beacon
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(satX, satY - 10, 3, 0, Math.PI * 2);
    ctx.fill();

    // Shooting star meteor trail
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w * 0.12, h * 0.1);
    ctx.lineTo(w * 0.26, h * 0.24);
    ctx.stroke();

    this.addMicroTexture(ctx, w, h, 0.04);
  }

  /* -------------------------------------------------------------
     PROCEDURAL BACKGROUND 13: CRYSTAL ICE CAVE
     ------------------------------------------------------------- */
  drawIceCave(ctx, w, h) {
    // Frosty glacial cavern backdrop
    const iceGrad = ctx.createLinearGradient(0, 0, 0, h);
    iceGrad.addColorStop(0, '#031828');
    iceGrad.addColorStop(0.4, '#072e4a');
    iceGrad.addColorStop(0.75, '#0c466e');
    iceGrad.addColorStop(1, '#021e33');
    ctx.fillStyle = iceGrad;
    ctx.fillRect(0, 0, w, h);

    // Ethereal Aurora Borealis curtains across the cavern roof
    const auroraWaves = [
      { col: 'rgba(16, 185, 129, 0.35)', y: h * 0.22, amp: 26 },
      { col: 'rgba(20, 184, 166, 0.32)', y: h * 0.28, amp: 32 },
      { col: 'rgba(168, 85, 247, 0.28)', y: h * 0.18, amp: 20 }
    ];

    auroraWaves.forEach(aw => {
      ctx.fillStyle = aw.col;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      for (let x = 0; x <= w; x += 30) {
        const y = aw.y + Math.sin((x / w) * 8 + aw.amp) * aw.amp;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, 0);
      ctx.fill();
    });

    // Sharp hanging translucent icicles
    for (let x = 10; x < w + 20; x += 32) {
      const ih = 50 + (this.rnd() * 110);
      const iw = 14 + (this.rnd() * 18);
      // Ice body
      ctx.fillStyle = (x % 2 === 0) ? '#38bdf8' : '#7dd3fc';
      ctx.beginPath();
      ctx.moveTo(x - iw / 2, 0);
      ctx.lineTo(x, ih);
      ctx.lineTo(x + iw / 2, 0);
      ctx.fill();
      // White sharp specular glint
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - iw / 4, 0);
      ctx.lineTo(x, ih - 4);
      ctx.stroke();
    }

    // Faceted quartz & ice crystal clusters growing from walls and ground
    const crystalColors = ['#0284c7', '#38bdf8', '#7dd3fc', '#bae6fd', '#e0f2fe'];
    for (let c = 0; c < 22; c++) {
      const cx = (c * 65) % w + (this.rnd() * 30);
      const cy = h - 35 - (this.rnd() * 100);
      const cw = 20 + this.rnd() * 24;
      const ch = 60 + this.rnd() * 100;
      const tilt = (this.rnd() - 0.5) * 0.6;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(tilt);

      // Faceted polygon crystal
      ctx.fillStyle = crystalColors[c % crystalColors.length];
      ctx.beginPath();
      ctx.moveTo(-cw / 2, 0);
      ctx.lineTo(0, -ch);
      ctx.lineTo(cw / 2, 0);
      ctx.lineTo(0, 10);
      ctx.fill();

      // Shaded crystal facet
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.beginPath();
      ctx.moveTo(0, -ch);
      ctx.lineTo(cw / 2, 0);
      ctx.lineTo(0, 10);
      ctx.fill();

      ctx.restore();
    }

    // Frozen glacier floor with fracture sheen
    const floorGrad = ctx.createLinearGradient(0, h - 75, 0, h);
    floorGrad.addColorStop(0, '#0284c7');
    floorGrad.addColorStop(0.5, '#38bdf8');
    floorGrad.addColorStop(1, '#0369a1');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, h - 75, w, 75);

    // Deep ice cracks in frozen floor
    ctx.strokeStyle = '#e0f2fe';
    ctx.lineWidth = 2;
    for (let k = 0; k < 6; k++) {
      let kx = k * (w / 5) + 30;
      let ky = h - 65;
      ctx.beginPath();
      ctx.moveTo(kx, ky);
      for (let s = 0; s < 4; s++) {
        kx += (this.rnd() - 0.5) * 60;
        ky += 15 + this.rnd() * 10;
        ctx.lineTo(kx, ky);
      }
      ctx.stroke();
    }

    // Drifting snowflakes & glistening frost motes
    ctx.fillStyle = '#ffffff';
    for (let f = 0; f < 130; f++) {
      const fx = this.rnd() * w;
      const fy = this.rnd() * h;
      const fr = 1 + this.rnd() * 2.5;
      ctx.beginPath();
      ctx.arc(fx, fy, fr, 0, Math.PI * 2);
      ctx.fill();
    }

    this.addMicroTexture(ctx, w, h, 0.04);
  }

  /* -------------------------------------------------------------
     PROCEDURAL BACKGROUND 14: PHARAOH'S TOMB
     ------------------------------------------------------------- */
  drawPharaohTomb(ctx, w, h) {
    // Ancient desert sandstone wall
    ctx.fillStyle = '#451a03';
    ctx.fillRect(0, 0, w, h);

    // Weathered sandstone brick masonry
    const blockH = 34;
    const blockW = 75;
    for (let y = 0; y < h; y += blockH) {
      const offset = (Math.floor(y / blockH) % 2) * (blockW / 2);
      for (let x = -blockW; x < w + blockW; x += blockW) {
        ctx.fillStyle = ((x + y) % 3 === 0) ? '#78350f' : (((x + y) % 5 === 0) ? '#92400e' : '#b45309');
        ctx.fillRect(x + offset + 2, y + 2, blockW - 4, blockH - 4);
      }
    }

    // Massive carved Egyptian columns with lotus capitals
    for (let x = 60; x < w; x += 260) {
      // Column shaft
      ctx.fillStyle = '#d97706';
      ctx.fillRect(x, 0, 48, h);
      ctx.fillStyle = '#92400e';
      ctx.fillRect(x + 6, 0, 8, h);
      ctx.fillRect(x + 34, 0, 8, h);

      // Decorative colored painted bands
      const bands = ['#1e3a8a', '#dc2626', '#15803d', '#facc15'];
      for (let by = 90; by < h - 90; by += 85) {
        ctx.fillStyle = bands[(by / 85) % bands.length];
        ctx.fillRect(x, by, 48, 14);
      }

      // Lotus capital top
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.moveTo(x - 14, 0);
      ctx.lineTo(x + 62, 0);
      ctx.lineTo(x + 48, 45);
      ctx.lineTo(x, 45);
      ctx.fill();
    }

    // Hieroglyphic frieze banner along upper wall
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(0, 50, w, 40);
    ctx.fillStyle = '#fde047';
    ctx.fillRect(0, 50, w, 4);
    ctx.fillRect(0, 86, w, 4);

    // Carved hieroglyphic symbols
    const glyphs = ['𓋹', '𓊽', '𓂀', '𓃭', '𓁹', '𓅃', '𓆣', '𓈖', '𓇳', '𓏏'];
    ctx.font = '22px serif';
    ctx.fillStyle = '#fde047';
    for (let gx = 25; gx < w; gx += 45) {
      const g = glyphs[(gx / 45) % glyphs.length];
      ctx.fillText(g, gx, 78);
    }

    // Golden Royal Sarcophagus Shrine Silhouette
    const sarcX = w * 0.48;
    const sarcY = h * 0.38;
    const sarcW = 100;
    const sarcH = 200;

    // Sarcophagus gold body
    ctx.fillStyle = '#d97706';
    ctx.fillRect(sarcX - sarcW / 2, sarcY, sarcW, sarcH);
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 4;
    ctx.strokeRect(sarcX - sarcW / 2, sarcY, sarcW, sarcH);

    // Nemes Headdress stripes & Death Mask
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(sarcX, sarcY + 45, 32, 0, Math.PI * 2);
    ctx.fill();
    // Blue headdress stripes
    ctx.fillStyle = '#1e40af';
    for (let sy = sarcY + 20; sy < sarcY + 70; sy += 12) {
      ctx.fillRect(sarcX - 28, sy, 56, 5);
    }
    // Crossed Crook and Flail
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(sarcX - 24, sarcY + 110);
    ctx.lineTo(sarcX + 24, sarcY + 80);
    ctx.moveTo(sarcX + 24, sarcY + 110);
    ctx.lineTo(sarcX - 24, sarcY + 80);
    ctx.stroke();

    // Wall-mounted flaming sconce torches with ambient glow
    const torches = [w * 0.22, w * 0.78];
    torches.forEach(tx => {
      const ty = h * 0.42;
      // Ambient radial warm glow
      const glow = ctx.createRadialGradient(tx, ty, 10, tx, ty, 90);
      glow.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
      glow.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(tx, ty, 90, 0, Math.PI * 2);
      ctx.fill();

      // Bronze sconce bracket
      ctx.fillStyle = '#78350f';
      ctx.fillRect(tx - 6, ty, 12, 35);
      ctx.fillRect(tx - 14, ty, 28, 8);

      // Flickering flame tongues
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.arc(tx, ty - 8, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(tx, ty - 12, 7, 0, Math.PI * 2);
      ctx.fill();
    });

    // Scattered glittering gold coins & gems across the floor
    const gemColors = ['#ef4444', '#10b981', '#3b82f6', '#f59e0b', '#ec4899'];
    for (let c = 0; c < 90; c++) {
      const cx = this.rnd() * w;
      const cy = h - 35 + this.rnd() * 30;
      ctx.fillStyle = (c % 2 === 0) ? '#fde047' : gemColors[c % gemColors.length];
      ctx.beginPath();
      ctx.arc(cx, cy, 3 + this.rnd() * 4, 0, Math.PI * 2);
      ctx.fill();
    }

    this.addMicroTexture(ctx, w, h, 0.05);
  }

  /* -------------------------------------------------------------
     PROCEDURAL BACKGROUND 15: MYSTIC MUSHROOM HOLLOW
     ------------------------------------------------------------- */
  drawMysticHollow(ctx, w, h) {
    // Deep enchanted twilight atmosphere
    const twilight = ctx.createLinearGradient(0, 0, 0, h);
    twilight.addColorStop(0, '#090518');
    twilight.addColorStop(0.5, '#170c38');
    twilight.addColorStop(0.85, '#261247');
    twilight.addColorStop(1, '#0d0722');
    ctx.fillStyle = twilight;
    ctx.fillRect(0, 0, w, h);

    // Gnarled ancient hollow trees in background
    for (let t = 0; t < 7; t++) {
      const tx = t * (w / 6) + (Math.sin(t * 4) * 20);
      const tw = 28 + (t % 3) * 12;
      ctx.fillStyle = '#1c102c';
      ctx.fillRect(tx, 0, tw, h);

      // Luminescent tree moss
      ctx.fillStyle = '#06b6d4';
      for (let my = 60; my < h - 80; my += 50) {
        ctx.beginPath();
        ctx.ellipse(tx + tw / 2, my, tw * 0.6, 8, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Giant Bioluminescent Fantasy Mushrooms
    const shrooms = [
      { x: w * 0.14, y: h * 0.58, capW: 90, capH: 60, col: '#06b6d4', dots: '#cffafe' },
      { x: w * 0.35, y: h * 0.65, capW: 75, capH: 50, col: '#c084fc', dots: '#f3e8ff' },
      { x: w * 0.58, y: h * 0.52, capW: 110, capH: 75, col: '#84cc16', dots: '#ecfccb' },
      { x: w * 0.82, y: h * 0.62, capW: 95, capH: 62, col: '#f43f5e', dots: '#ffe4e6' },
      { x: w * 0.94, y: h * 0.7, capW: 65, capH: 45, col: '#38bdf8', dots: '#e0f2fe' }
    ];

    shrooms.forEach(sh => {
      // Mushroom Stalk
      const stalkH = h - sh.y;
      ctx.fillStyle = '#332354';
      ctx.fillRect(sh.x - 12, sh.y, 24, stalkH);
      ctx.strokeStyle = '#5b3e8a';
      ctx.lineWidth = 2;
      ctx.strokeRect(sh.x - 12, sh.y, 24, stalkH);

      // Ambient spore glow halo
      const glow = ctx.createRadialGradient(sh.x, sh.y, 10, sh.x, sh.y, sh.capW * 0.9);
      glow.addColorStop(0, sh.col);
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(sh.x, sh.y, sh.capW * 0.9, 0, Math.PI * 2);
      ctx.fill();

      // Glowing Mushroom Cap
      ctx.fillStyle = sh.col;
      ctx.beginPath();
      ctx.ellipse(sh.x, sh.y, sh.capW, sh.capH, 0, Math.PI, Math.PI * 2);
      ctx.fill();

      // Gills under cap
      ctx.fillStyle = '#201338';
      ctx.beginPath();
      ctx.ellipse(sh.x, sh.y, sh.capW, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Glowing Polka Dots
      ctx.fillStyle = sh.dots;
      const dotCoords = [
        { dx: 0, dy: -sh.capH * 0.6, r: 8 },
        { dx: -sh.capW * 0.45, dy: -sh.capH * 0.35, r: 6 },
        { dx: sh.capW * 0.45, dy: -sh.capH * 0.35, r: 6 },
        { dx: -sh.capW * 0.2, dy: -sh.capH * 0.7, r: 7 },
        { dx: sh.capW * 0.2, dy: -sh.capH * 0.7, r: 7 }
      ];
      dotCoords.forEach(d => {
        ctx.beginPath();
        ctx.arc(sh.x + d.dx, sh.y + d.dy, d.r, 0, Math.PI * 2);
        ctx.fill();
      });
    });

    // Floating fairy spore motes drifting through the air
    const sporeColors = ['#67e8f9', '#c084fc', '#a3e635', '#fda4af', '#fef08a'];
    for (let m = 0; m < 95; m++) {
      const mx = this.rnd() * w;
      const my = this.rnd() * (h * 0.85);
      const mr = 2 + this.rnd() * 4.5;
      ctx.fillStyle = sporeColors[m % sporeColors.length];
      ctx.beginPath();
      ctx.arc(mx, my, mr, 0, Math.PI * 2);
      ctx.fill();
    }

    // Mossy ground bank
    ctx.fillStyle = '#160a2b';
    ctx.fillRect(0, h - 45, w, 45);
    ctx.fillStyle = '#10b981';
    for (let gx = 0; gx < w; gx += 20) {
      ctx.beginPath();
      ctx.arc(gx + 10, h - 40, 10, Math.PI, Math.PI * 2);
      ctx.fill();
    }

    this.addMicroTexture(ctx, w, h, 0.04);
  }

  /* -------------------------------------------------------------
     PROCEDURAL BACKGROUND 16: SUNKEN ATLANTIS
     ------------------------------------------------------------- */
  drawSunkenAtlantis(ctx, w, h) {
    // Deep abyssal ocean gradient
    const sea = ctx.createLinearGradient(0, 0, 0, h);
    sea.addColorStop(0, '#021824');
    sea.addColorStop(0.4, '#043445');
    sea.addColorStop(0.75, '#06505e');
    sea.addColorStop(1, '#022129');
    ctx.fillStyle = sea;
    ctx.fillRect(0, 0, w, h);

    // Caustic sunlight rays filtering from surface
    ctx.fillStyle = 'rgba(103, 232, 249, 0.07)';
    for (let r = 0; r < 7; r++) {
      const rx = (r * 180 + 40) % w;
      ctx.beginPath();
      ctx.moveTo(rx, 0);
      ctx.lineTo(rx + 60, 0);
      ctx.lineTo(rx + 160, h);
      ctx.lineTo(rx + 40, h);
      ctx.fill();
    }

    // Classical Sunken Atlantean Marble Ruins & Fluted Columns
    for (let c = 0; c < 7; c++) {
      const cx = c * 180 + 35;
      const isBroken = (c % 2 === 1);
      const ch = isBroken ? (h * 0.45) : (h * 0.78);
      const cy = h - ch;
      const cw = 42;

      // Marble column shaft
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(cx, cy, cw, ch);
      // Flutes
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(cx + 6, cy, 6, ch);
      ctx.fillRect(cx + 18, cy, 6, ch);
      ctx.fillRect(cx + 30, cy, 6, ch);

      // Column capital
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(cx - 10, cy - 14, cw + 20, 14);

      // Sea barnacles & coral encrustation
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(cx + cw / 2, cy + ch * 0.6, 12, 0, Math.PI * 2);
      ctx.fill();
    }

    // Swaying Emerald & Jade Kelp Ribbons
    for (let k = 0; k < 26; k++) {
      const kx = (k * 48 + 15) % w;
      const kh = 140 + (k % 5) * 45;
      ctx.strokeStyle = (k % 2 === 0) ? '#059669' : '#10b981';
      ctx.lineWidth = 6 + (k % 3) * 3;
      ctx.beginPath();
      ctx.moveTo(kx, h);
      ctx.bezierCurveTo(kx + 35, h - kh * 0.35, kx - 35, h - kh * 0.7, kx + 15, h - kh);
      ctx.stroke();
    }

    // Luminous Drifting Jellyfish
    const jellies = [
      { x: w * 0.22, y: h * 0.38, r: 28, col: '#f472b6' },
      { x: w * 0.52, y: h * 0.25, r: 35, col: '#38bdf8' },
      { x: w * 0.8, y: h * 0.42, r: 30, col: '#c084fc' }
    ];

    jellies.forEach(j => {
      // Bell dome
      ctx.fillStyle = j.col;
      ctx.beginPath();
      ctx.arc(j.x, j.y, j.r, Math.PI, Math.PI * 2);
      ctx.fill();
      // Translucent skirt
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(j.x, j.y, j.r * 0.8, Math.PI, Math.PI * 2);
      ctx.fill();
      // Flowing tentacles
      ctx.strokeStyle = j.col;
      ctx.lineWidth = 2;
      for (let t = -3; t <= 3; t++) {
        const tx = j.x + t * 6;
        ctx.beginPath();
        ctx.moveTo(tx, j.y);
        ctx.bezierCurveTo(tx + 8, j.y + 25, tx - 8, j.y + 45, tx + 4, j.y + 65);
        ctx.stroke();
      }
    });

    // School of Tropical Reef Fish
    const fishColors = ['#facc15', '#f97316', '#3b82f6'];
    for (let f = 0; f < 18; f++) {
      const fx = (f * 65 + 40) % (w - 60);
      const fy = h * 0.3 + (f % 6) * 30;
      ctx.fillStyle = fishColors[f % fishColors.length];
      ctx.beginPath();
      ctx.ellipse(fx, fy, 12, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      // Tail
      ctx.beginPath();
      ctx.moveTo(fx - 10, fy);
      ctx.lineTo(fx - 18, fy - 6);
      ctx.lineTo(fx - 18, fy + 6);
      ctx.fill();
    }

    // Rising Pearlescent Oxygen Bubbles
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1.5;
    for (let b = 0; b < 65; b++) {
      const bx = this.rnd() * w;
      const by = this.rnd() * h;
      const br = 2.5 + this.rnd() * 6;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.stroke();
      // Specular shine
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(bx - br * 0.3, by - br * 0.3, br * 0.25, 0, Math.PI * 2);
      ctx.fill();
    }

    this.addMicroTexture(ctx, w, h, 0.04);
  }

  /* -------------------------------------------------------------
     PROCEDURAL BACKGROUND 17: ZEN BAMBOO GARDEN
     ------------------------------------------------------------- */
  drawZenGarden(ctx, w, h) {
    // Dusk twilight sunset sky
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#130d24');
    sky.addColorStop(0.35, '#3b123d');
    sky.addColorStop(0.7, '#6b1c41');
    sky.addColorStop(1, '#9f2244');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Glowing Twilight Crimson/Harvest Moon
    const mx = w * 0.76;
    const my = h * 0.26;
    const mr = 52;
    const moonGlow = ctx.createRadialGradient(mx, my, mr * 0.8, mx, my, mr * 1.5);
    moonGlow.addColorStop(0, 'rgba(253, 224, 71, 0.5)');
    moonGlow.addColorStop(1, 'rgba(253, 224, 71, 0)');
    ctx.fillStyle = moonGlow;
    ctx.beginPath();
    ctx.arc(mx, my, mr * 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(mx, my, mr, 0, Math.PI * 2);
    ctx.fill();

    // Distant Temple Pagoda Silhouette
    const pagX = w * 0.72;
    const pagY = h * 0.35;
    ctx.fillStyle = '#180a1c';
    // 3 tiers of upturned pagoda roofs
    for (let r = 0; r < 3; r++) {
      const rw = 95 - r * 18;
      const ry = pagY + r * 38;
      ctx.beginPath();
      ctx.moveTo(pagX - rw / 2 - 14, ry + 12);
      ctx.quadraticCurveTo(pagX, ry - 4, pagX + rw / 2 + 14, ry + 12);
      ctx.lineTo(pagX + rw / 2, ry + 18);
      ctx.lineTo(pagX - rw / 2, ry + 18);
      ctx.fill();
      ctx.fillRect(pagX - rw * 0.35, ry + 18, rw * 0.7, 20);
    }

    // Tall Green Bamboo Forest Grove
    for (let b = 0; b < 28; b++) {
      const bx = (b * 44) % w + (Math.sin(b * 3) * 10);
      const bw = 12 + (b % 3) * 4;
      // Bamboo stalk
      ctx.fillStyle = (b % 2 === 0) ? '#166534' : '#15803d';
      ctx.fillRect(bx, 0, bw, h);

      // Internode rings
      ctx.fillStyle = '#86efac';
      for (let ny = 40; ny < h; ny += 65) {
        ctx.fillRect(bx - 2, ny, bw + 4, 3);
      }

      // Bamboo leaves
      ctx.fillStyle = '#22c55e';
      for (let ly = 60; ly < h - 100; ly += 75) {
        ctx.beginPath();
        ctx.ellipse(bx + bw + 12, ly, 18, 5, 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Weeping Cherry Blossom (Sakura) Branches
    const branchX = w * 0.15;
    ctx.strokeStyle = '#291811';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(w * 0.1, 40, w * 0.2, 70, branchX + 160, 110);
    ctx.stroke();

    // Cherry blossom pink flowers & floating petals
    const sakuraColors = ['#fbcfe8', '#f472b6', '#fda4af', '#fecdd3', '#ffffff'];
    for (let f = 0; f < 180; f++) {
      const fx = (f < 100) ? (this.rnd() * (w * 0.45)) : (this.rnd() * w);
      const fy = (f < 100) ? (this.rnd() * (h * 0.45)) : (this.rnd() * h);
      ctx.fillStyle = sakuraColors[f % sakuraColors.length];
      ctx.beginPath();
      ctx.arc(fx, fy, 4 + this.rnd() * 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Carved Japanese Stone Toro Lantern
    const lx = w * 0.35;
    const ly = h - 130;
    ctx.fillStyle = '#475569';
    ctx.fillRect(lx - 8, ly + 50, 16, 40); // post
    ctx.fillRect(lx - 20, ly + 36, 40, 14); // base
    ctx.fillStyle = '#fef08a'; // glowing fire chamber
    ctx.fillRect(lx - 15, ly + 14, 30, 22);
    ctx.fillStyle = '#334155'; // lantern roof
    ctx.beginPath();
    ctx.moveTo(lx - 28, ly + 14);
    ctx.lineTo(lx, ly - 8);
    ctx.lineTo(lx + 28, ly + 14);
    ctx.fill();

    // Raked Zen Sand Ripples Floor
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(0, h - 45, w, 45);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    for (let sy = h - 38; sy < h - 5; sy += 10) {
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(w, sy);
      ctx.stroke();
    }

    this.addMicroTexture(ctx, w, h, 0.04);
  }

  /* -------------------------------------------------------------
     PROCEDURAL BACKGROUND 18: STEAMPUNK WORKSHOP
     ------------------------------------------------------------- */
  drawSteampunkWorkshop(ctx, w, h) {
    // Victorian boiler iron plates background
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(0, 0, w, h);

    // Riveted iron panels
    const panelW = 160;
    const panelH = 120;
    for (let y = 0; y < h; y += panelH) {
      for (let x = 0; x < w; x += panelW) {
        ctx.strokeStyle = '#292524';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, panelW, panelH);
        // Screws / rivets on corners
        ctx.fillStyle = '#78716c';
        ctx.beginPath();
        ctx.arc(x + 8, y + 8, 3, 0, Math.PI * 2);
        ctx.arc(x + panelW - 8, y + 8, 3, 0, Math.PI * 2);
        ctx.arc(x + 8, y + panelH - 8, 3, 0, Math.PI * 2);
        ctx.arc(x + panelW - 8, y + panelH - 8, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Interlocking Mechanical Brass & Bronze Cogs
    const gears = [
      { x: w * 0.18, y: h * 0.35, r: 65, teeth: 16, col: '#d97706' },
      { x: w * 0.18 + 105, y: h * 0.35 - 30, r: 45, teeth: 12, col: '#b45309' },
      { x: w * 0.52, y: h * 0.28, r: 75, teeth: 18, col: '#ca8a04' },
      { x: w * 0.52 + 105, y: h * 0.28 + 40, r: 50, teeth: 14, col: '#d97706' },
      { x: w * 0.84, y: h * 0.42, r: 80, teeth: 20, col: '#b45309' },
      { x: w * 0.84 - 100, y: h * 0.42 - 50, r: 42, teeth: 12, col: '#f59e0b' }
    ];

    gears.forEach(g => {
      // Gear Teeth
      ctx.fillStyle = g.col;
      for (let t = 0; t < g.teeth; t++) {
        const angle = (t / g.teeth) * Math.PI * 2;
        const tx = g.x + Math.cos(angle) * (g.r + 8);
        const ty = g.y + Math.sin(angle) * (g.r + 8);
        ctx.save();
        ctx.translate(tx, ty);
        ctx.rotate(angle);
        ctx.fillRect(-6, -6, 12, 12);
        ctx.restore();
      }

      // Outer gear circle
      ctx.beginPath();
      ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2);
      ctx.fillStyle = g.col;
      ctx.fill();
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Inner spoke cutouts
      ctx.fillStyle = '#1c1917';
      for (let s = 0; s < 4; s++) {
        const sAngle = (s / 4) * Math.PI * 2;
        const sx = g.x + Math.cos(sAngle) * (g.r * 0.5);
        const sy = g.y + Math.sin(sAngle) * (g.r * 0.5);
        ctx.beginPath();
        ctx.arc(sx, sy, g.r * 0.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Central brass hub & bolt
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(g.x, g.y, 10, 0, Math.PI * 2);
      ctx.fill();
    });

    // Copper & Brass Industrial Pipe Network
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 16;
    // Main horizontal steam trunk
    ctx.beginPath();
    ctx.moveTo(0, h * 0.72);
    ctx.lineTo(w, h * 0.72);
    ctx.stroke();
    // Vertical feeder branches
    ctx.beginPath();
    ctx.moveTo(w * 0.35, 0);
    ctx.lineTo(w * 0.35, h * 0.72);
    ctx.moveTo(w * 0.7, 0);
    ctx.lineTo(w * 0.7, h * 0.72);
    ctx.stroke();

    // Pipe joints & flanges
    ctx.fillStyle = '#78350f';
    for (let px = 60; px < w; px += 180) {
      ctx.fillRect(px, h * 0.72 - 12, 12, 24);
    }

    // Red Valve Wheel
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(w * 0.35, h * 0.72 - 30, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Brass Steam Pressure Manometer Dials
    const gauges = [w * 0.35 - 70, w * 0.7 + 60];
    gauges.forEach(gx => {
      const gy = h * 0.72 - 50;
      // Outer brass ring
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.arc(gx, gy, 28, 0, Math.PI * 2);
      ctx.fill();
      // White dial face
      ctx.fillStyle = '#fefce8';
      ctx.beginPath();
      ctx.arc(gx, gy, 22, 0, Math.PI * 2);
      ctx.fill();
      // Gauge markings & red needle
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.lineTo(gx + 12, gy - 12);
      ctx.stroke();
    });

    // Steel Diamond-Tread Grating Floor
    ctx.fillStyle = '#292524';
    ctx.fillRect(0, h - 55, w, 55);
    ctx.strokeStyle = '#44403c';
    ctx.lineWidth = 2;
    for (let fx = -50; fx < w + 50; fx += 25) {
      ctx.beginPath();
      ctx.moveTo(fx, h - 55);
      ctx.lineTo(fx + 30, h);
      ctx.stroke();
    }

    this.addMicroTexture(ctx, w, h, 0.05);
  }

  /* -------------------------------------------------------------
     PROCEDURAL BACKGROUND 19: HAUNTED GOTHIC CASTLE
     ------------------------------------------------------------- */
  drawHauntedCastle(ctx, w, h) {
    // Midnight purple stone chamber
    const hall = ctx.createLinearGradient(0, 0, 0, h);
    hall.addColorStop(0, '#0c0714');
    hall.addColorStop(0.5, '#160d26');
    hall.addColorStop(1, '#0b0612');
    ctx.fillStyle = hall;
    ctx.fillRect(0, 0, w, h);

    // Weathered gothic stone brick masonry
    for (let y = 0; y < h; y += 30) {
      const offset = (Math.floor(y / 30) % 2) * 35;
      for (let x = -70; x < w + 70; x += 70) {
        ctx.strokeStyle = '#1e1430';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + offset, y, 70, 30);
      }
    }

    // Grand Gothic Pointed-Arch Stained Glass Windows
    const winWidth = 90;
    const winHeight = 220;
    const winPositions = [w * 0.2, w * 0.5, w * 0.8];

    winPositions.forEach(wx => {
      const wy = 50;
      // Pointed arch window frame
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(wx - winWidth / 2, wy + winHeight);
      ctx.lineTo(wx - winWidth / 2, wy + winHeight * 0.35);
      ctx.quadraticCurveTo(wx, wy - 20, wx + winWidth / 2, wy + winHeight * 0.35);
      ctx.lineTo(wx + winWidth / 2, wy + winHeight);
      ctx.closePath();
      ctx.clip();

      // Stained glass multi-colored panels
      const glassColors = [
        '#1d4ed8', '#b91c1c', '#7c3aed', '#047857',
        '#d97706', '#0284c7', '#be123c', '#4338ca'
      ];
      const rows = 7;
      const cols = 4;
      const cw = winWidth / cols;
      const ch = winHeight / rows;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          ctx.fillStyle = glassColors[(r * cols + c) % glassColors.length];
          ctx.fillRect(wx - winWidth / 2 + c * cw, wy + r * ch, cw, ch);
          ctx.strokeStyle = '#05020a';
          ctx.lineWidth = 3;
          ctx.strokeRect(wx - winWidth / 2 + c * cw, wy + r * ch, cw, ch);
        }
      }

      ctx.restore();

      // Stone window trim border
      ctx.strokeStyle = '#382b4d';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(wx - winWidth / 2, wy + winHeight);
      ctx.lineTo(wx - winWidth / 2, wy + winHeight * 0.35);
      ctx.quadraticCurveTo(wx, wy - 20, wx + winWidth / 2, wy + winHeight * 0.35);
      ctx.lineTo(wx + winWidth / 2, wy + winHeight);
      ctx.stroke();
    });

    // Hanging Wrought Iron Candelabra Chandeliers
    const chandeliers = [w * 0.35, w * 0.65];
    chandeliers.forEach(cx => {
      // Chain
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, 130);
      ctx.stroke();

      // Iron Ring Bar
      ctx.fillStyle = '#18181b';
      ctx.fillRect(cx - 45, 130, 90, 8);

      // Candles with eerie green/violet flames
      for (let c = -2; c <= 2; c++) {
        const canX = cx + c * 18;
        // White wax stick
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(canX - 3, 114, 6, 16);
        // Ghostly flame
        ctx.fillStyle = (c % 2 === 0) ? '#4ade80' : '#c084fc';
        ctx.beginPath();
        ctx.ellipse(canX, 106, 4, 7, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Stone Gargoyle silhouettes perched on corbels
    const gargoyles = [{ x: 45, y: h * 0.5 }, { x: w - 45, y: h * 0.5 }];
    gargoyles.forEach(g => {
      ctx.fillStyle = '#1e1b2e';
      ctx.beginPath();
      ctx.arc(g.x, g.y, 22, 0, Math.PI * 2);
      ctx.fill();
      // Glowing eerie yellow eyes
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(g.x - 5, g.y - 3, 3, 0, Math.PI * 2);
      ctx.arc(g.x + 5, g.y - 3, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Cobwebs in upper corners
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1;
    for (let r = 20; r <= 80; r += 20) {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 0.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(w, 0, r, Math.PI * 0.5, Math.PI);
      ctx.stroke();
    }

    // Checkered gothic floor with creeping mist
    ctx.fillStyle = '#090510';
    ctx.fillRect(0, h - 50, w, 50);
    const tileW = 45;
    for (let tx = 0; tx < w; tx += tileW) {
      ctx.fillStyle = ((tx / tileW) % 2 === 0) ? '#211833' : '#0e0917';
      ctx.fillRect(tx, h - 50, tileW, 50);
    }

    // Spooky fog clouds along the floor
    ctx.fillStyle = 'rgba(168, 85, 247, 0.15)';
    for (let i = 0; i < 9; i++) {
      ctx.beginPath();
      ctx.arc(i * 140 + 30, h - 30, 60, 0, Math.PI * 2);
      ctx.fill();
    }

    this.addMicroTexture(ctx, w, h, 0.05);
  }

  /* -------------------------------------------------------------
     PROCEDURAL BACKGROUND 20: DIGITAL CYBER MATRIX
     ------------------------------------------------------------- */
  drawCyberMatrix(ctx, w, h) {
    // Deep terminal phosphor CRT black/green backdrop
    const crt = ctx.createLinearGradient(0, 0, 0, h);
    crt.addColorStop(0, '#010804');
    crt.addColorStop(0.5, '#021609');
    crt.addColorStop(1, '#010f06');
    ctx.fillStyle = crt;
    ctx.fillRect(0, 0, w, h);

    // 3D Perspective Wireframe Horizon Grid
    const horizonY = h * 0.52;
    ctx.strokeStyle = 'rgba(0, 255, 102, 0.35)';
    ctx.lineWidth = 1.5;

    // Horizontal receding lines
    for (let y = horizonY; y < h; y += (y - horizonY) * 0.45 + 8) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Perspective vanishing lines
    const vanishX = w * 0.5;
    for (let x = -w * 0.5; x < w * 1.5; x += 65) {
      ctx.beginPath();
      ctx.moveTo(vanishX, horizonY);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // Cascading Digital Code Rain (36 columns)
    const codeGlyphs = '0123456789ABCDEFｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ';
    const colSpacing = w / 36;
    for (let col = 0; col < 36; col++) {
      const cx = col * colSpacing + 6;
      const headY = (col * 37 + (this.rnd() * h)) % h;
      const trailLen = 10 + (col % 8) * 3;

      for (let r = 0; r < trailLen; r++) {
        const gy = headY - r * 16;
        if (gy < 0 || gy > h) continue;

        const glyph = codeGlyphs[(col * 7 + r * 5) % codeGlyphs.length];
        if (r === 0) {
          // Bright white leading head
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 15px monospace';
        } else if (r < 4) {
          // Vivid neon green
          ctx.fillStyle = '#00ff66';
          ctx.font = '14px monospace';
        } else {
          // Fading deep green tail
          const alpha = 1 - (r / trailLen);
          ctx.fillStyle = `rgba(34, 197, 94, ${alpha * 0.8})`;
          ctx.font = '13px monospace';
        }
        ctx.fillText(glyph, cx, gy);
      }
    }

    // Holographic Isometric Data Cubes
    const cubes = [
      { x: w * 0.25, y: h * 0.32, size: 36 },
      { x: w * 0.75, y: h * 0.28, size: 44 }
    ];

    cubes.forEach(cb => {
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      // Front square
      ctx.strokeRect(cb.x - cb.size / 2, cb.y - cb.size / 2, cb.size, cb.size);
      // Back square & connecting edges
      ctx.strokeRect(cb.x - cb.size / 2 + 14, cb.y - cb.size / 2 - 14, cb.size, cb.size);
      ctx.beginPath();
      ctx.moveTo(cb.x - cb.size / 2, cb.y - cb.size / 2);
      ctx.lineTo(cb.x - cb.size / 2 + 14, cb.y - cb.size / 2 - 14);
      ctx.moveTo(cb.x + cb.size / 2, cb.y - cb.size / 2);
      ctx.lineTo(cb.x + cb.size / 2 + 14, cb.y - cb.size / 2 - 14);
      ctx.moveTo(cb.x - cb.size / 2, cb.y + cb.size / 2);
      ctx.lineTo(cb.x - cb.size / 2 + 14, cb.y + cb.size / 2 - 14);
      ctx.moveTo(cb.x + cb.size / 2, cb.y + cb.size / 2);
      ctx.lineTo(cb.x + cb.size / 2 + 14, cb.y + cb.size / 2 - 14);
      ctx.stroke();
    });

    // High-Tech Server Racks on flanks with blinking LED arrays
    const rackW = 75;
    const racks = [0, w - rackW];
    racks.forEach(rx => {
      ctx.fillStyle = '#061a10';
      ctx.fillRect(rx, 0, rackW, h);
      ctx.strokeStyle = '#00ff66';
      ctx.lineWidth = 1;
      ctx.strokeRect(rx, 0, rackW, h);

      // Server blades & LED arrays
      const ledCols = ['#22c55e', '#00f0ff', '#eab308', '#ef4444'];
      for (let sy = 30; sy < h - 40; sy += 38) {
        ctx.fillStyle = '#031008';
        ctx.fillRect(rx + 4, sy, rackW - 8, 30);
        for (let l = 0; l < 4; l++) {
          ctx.fillStyle = ledCols[(sy + l) % ledCols.length];
          ctx.beginPath();
          ctx.arc(rx + 16 + l * 14, sy + 15, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });

    this.addMicroTexture(ctx, w, h, 0.05);
  }
}

export const environmentManager = new EnvironmentManager();
