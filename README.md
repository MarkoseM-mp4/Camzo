# 🦎 CAMZO — Mecha Chameleon Hide & Seek

A high-stakes digital camouflage game where Hiders blend into dynamically rendered environments using realistic paint tools, and Hunters sweep darkness with a narrow flashlight beam to locate them.

Playable in **Pass & Play**, **Solo vs AI**, and **Online Multiplayer (5-Letter Room Codes)**.

---

## 🗺️ Maps & Environments (20 Maps)

Camzo features 20 distinct procedural environments, each offering unique textures, color palettes, and hiding spots for camouflage:

| # | Map Name | Theme ID | Description |
|---|----------|----------|-------------|
| 1 | 🌲 **Verdant Jungle** | `procedural-forest` | Lush rainforest canopy, overlapping exotic palm fronds, hanging vines, and tropical mossy tree bark. |
| 2 | 🏙️ **Cyberpunk Alley** | `procedural-city` | Rain-slicked asphalt, vibrant neon storefront signs, overhead hanging cables, and steam vents. |
| 3 | 📦 **Industrial Warehouse** | `procedural-warehouse` | Corrugated metal walls, wooden shipping crates, warning hazard stripes, and steel storage racks. |
| 4 | 🏖️ **Tropical Coral Beach** | `procedural-beach` | Sparkling turquoise ocean gradient, sandy shore, colorful seashells, starfishes, and beach towels. |
| 5 | 📚 **Grand Ancient Library** | `procedural-library` | Towering oak bookshelves, leather-bound book spines, stained-glass arch windows, and ornate carpet. |
| 6 | 🕹️ **Retro 80s Arcade** | `procedural-arcade` | Dim neon-lit gaming parlor, glowing arcade CRT cabinets, synthwave carpeting, and neon wall art. |
| 7 | 🎨 **Street Art Wall** | `procedural-graffiti` | Weathered brick masonry covered in layered graffiti tags, paint splatters, and stencil art. |
| 8 | 🍭 **Sweet Candy Land** | `procedural-candy` | Pastel swirl background, giant striped candy canes, gumdrop boulders, and frosted icing hills. |
| 9 | ⚡ **Cyber Circuit Board** | `procedural-circuit` | Deep green motherboard substrate, glowing gold/cyan solder traces, microchips, and capacitors. |
| 10 | 🍂 **Golden Autumn Park** | `procedural-autumn` | Warm sunset gradient, gnarled oak trees, stone footpaths, park benches, and drifting autumn leaves. |
| 11 | 🌋 **Magma Cavern** | `procedural-volcano` | Dark charred obsidian rock, hanging jagged stalactites, glowing molten lava rivers, and fiery embers. |
| 12 | 🚀 **Cosmic Nebula** | `procedural-space` | Deep cosmic void, multi-layered vibrant nebula gas clouds, 300+ twinkling stars, and ringed gas giants. |
| 13 | ❄️ **Crystal Ice Cave** | `procedural-arctic` | Frosty glacial walls, Aurora Borealis curtains, sharp hanging icicles with specular glints, and ice crystals. |
| 14 | 🏺 **Pharaoh's Tomb** | `procedural-egypt` | Weathered sandstone masonry, carved Egyptian columns, hieroglyphic friezes, and royal golden sarcophagus. |
| 15 | 🔮 **Mystic Mushroom Hollow** | `procedural-mystic` | Enchanted twilight fantasy hollow, gnarled trees with glowing moss, and giant bioluminescent mushrooms. |
| 16 | 🌊 **Sunken Atlantis** | `procedural-underwater` | Deep abyss ocean gradient, submerged classical marble columns, swaying kelp, jellyfish, and bubble streams. |
| 17 | 🌸 **Zen Bamboo Garden** | `procedural-dojo` | Dusk twilight sky with harvest moon, pagoda silhouette, bamboo groves, weeping cherry blossoms, and sakura petals. |
| 18 | ⚙️ **Steampunk Workshop** | `procedural-steampunk` | Riveted iron boiler panels, interlocking mechanical brass and bronze gears, copper pipe networks, and pressure gauges. |
| 19 | 🏰 **Haunted Gothic Castle** | `procedural-haunted` | Midnight purple chamber, towering pointed-arch stained-glass mosaic windows, ghostly candles, and gargoyles. |
| 20 | 🟢 **Digital Cyber Matrix** | `procedural-matrix` | Phosphor CRT backdrop, 3D perspective wireframe horizon grid, cascading digital code rain, and server racks. |

*(Custom image background uploads are also supported via drag-and-drop).*

---

## 🎮 Game Controls & Shortcuts

### Camouflage Phase (Hider)
- **Left-Click to Place**: Position your chameleon stickman anywhere on the map before camouflaging.
- **Right-Click**: **Eyedropper** — samples the exact pixel color from the background with magnifying loupe.
- **Left-Click & Drag**: **Silky Brush** — paints smoothly over your stickman with the sampled color.
- **Mouse Scroll Wheel**: Adjusts brush size from fine detail (**1px**) to wide coverage (**64px**).
- **Ctrl + Scroll Wheel**: Adjusts paint opacity (**5%** to **100%**).
- **Shift + Scroll Wheel**: **Focal Zoom** — zooms into and out of the canvas (up to **6×** magnification) centered directly on your mouse cursor.
- **Spacebar + Drag** (or **Middle-Mouse Drag**): Pan across the canvas while zoomed in.
- **Ctrl + Z**: Undo last paint stroke.
- **Ready to Hunt Button**: Lock in disguise early before timer expires.

### Hunting Phase (Hunter)
- **Mouse Move**: Directs the hunter's flashlight beam through the ambient darkness.
- **Left-Click**: **Investigate** — clicks a suspicious spot.
  - **Direct Hit**: Reveals the hidden chameleon with a green celebration glow and burst particles!
  - **Miss Penalty**: Deducts 1 hunter life (10 lives total).

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)

### Installation
```bash
# Clone the repository
git clone https://github.com/MarkoseM-mp4/Camzo.git
cd Camzo

# Install dependencies
npm install

# Start the game server
npm start
```

Open your browser and navigate to:
```
http://localhost:8080/
```

---

## 🕹️ Game Modes
1. **Pass & Play**: Play locally with friends on the same computer screen.
2. **Solo vs AI**:
   - **Solo Hunter**: AI hides and automatically camouflages itself; you take the flashlight and hunt!
   - **Solo Hider**: You camouflage yourself; intelligent AI sweeps the flashlight looking for you.
3. **Online Multiplayer**: Host or join a room using a unique 5-letter room code with real-time Socket.io networking.
