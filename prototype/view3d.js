// The 3D view of the prototype: a second way of drawing the same game.
// It reads the page's state and helpers (G, cam, view, wayOf, along...) and never changes a rule or the state.
// The camera is orthographic with a fixed tilt, so a finger lands on the same cell as in 2D once y is flattened.
window.createView3D = (glCanvas) => {
  const B = window.BABYLON;
  const ELEVATION = (50 * Math.PI) / 180;
  const tilt = Math.sin(ELEVATION);
  const lean = Math.cos(ELEVATION) / tilt; // cells of ground hidden behind one cell of height
  const engine = new B.Engine(glCanvas, true, { stencil: true }, false);
  engine.setHardwareScalingLevel(1 / Math.min(1.75, window.devicePixelRatio || 1));
  const scene = new B.Scene(engine);
  scene.clearColor = new B.Color4(0.012, 0.025, 0.03, 1);
  scene.ambientColor = new B.Color3(0.1, 0.14, 0.15);
  scene.skipPointerMovePicking = true;
  scene.detachControl();
  // Dark film look: contrast, and edges that fall into shadow.
  const look = scene.imageProcessingConfiguration;
  look.toneMappingEnabled = true;
  look.toneMappingType = B.ImageProcessingConfiguration.TONEMAPPING_ACES;
  look.exposure = 1.05;
  look.contrast = 1.18;
  look.vignetteEnabled = true;
  look.vignetteWeight = 1.8;
  look.vignetteColor = new B.Color4(0, 0.03, 0.04, 0);

  // Game y grows southwards, Babylon z northwards.
  const at = (x, h, y) => new B.Vector3(x, h, -y);
  const camera = new B.FreeCamera('camera', at(0, 100, 70), scene);
  camera.mode = B.Camera.ORTHOGRAPHIC_CAMERA;
  camera.minZ = 1;
  camera.maxZ = 420;

  const sky = new B.HemisphericLight('sky', new B.Vector3(0.1, 1, -0.2), scene);
  sky.intensity = 0.55;
  sky.diffuse = B.Color3.FromHexString('#B4D4DC');
  sky.groundColor = B.Color3.FromHexString('#10201C');
  const sun = new B.DirectionalLight('sun', new B.Vector3(0.55, -1, -0.35), scene);
  sun.intensity = 0.85;
  sun.diffuse = B.Color3.FromHexString('#FFE3C2');
  sun.autoUpdateExtends = false;
  sun.shadowMinZ = 1;
  sun.shadowMaxZ = 160;
  const heart = new B.PointLight('heart', at(0, 2, 0), scene);
  heart.diffuse = B.Color3.FromHexString('#B7F34A');
  heart.range = 11;

  const shadows = new B.ShadowGenerator(2048, sun);
  shadows.usePercentageCloserFiltering = true;
  shadows.bias = 0.002;
  shadows.setDarkness(0.3);
  const glow = new B.GlowLayer('glow', scene, { mainTextureFixedSize: 512, blurKernelSize: 24 });
  glow.intensity = 0.6;

  // Steel deck: one texture tile covers 4 x 4 cells.
  const deck = new B.DynamicTexture('deck', { width: 512, height: 512 }, scene, true);
  {
    const g = deck.getContext();
    g.fillStyle = '#16262B';
    g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        g.fillStyle = ['#16262B', '#152429', '#17272D'][(i * 7 + j * 5) % 3];
        g.fillRect(i * 128 + 2, j * 128 + 2, 124, 124);
      }
    }
    g.strokeStyle = '#0A1215';
    g.lineWidth = 6;
    g.strokeRect(0, 0, 512, 512);
    g.fillStyle = '#3A555C';
    for (const x of [16, 496]) for (const y of [16, 496]) g.fillRect(x - 4, y - 4, 8, 8);
    deck.update();
    deck.wrapU = deck.wrapV = B.Texture.WRAP_ADDRESSMODE;
    deck.uScale = W / 4;
    deck.vScale = H / 4;
    deck.anisotropicFilteringLevel = 8;
  }
  const ground = B.MeshBuilder.CreateGround('ground', { width: W, height: H }, scene);
  ground.position = at(W / 2, 0, H / 2);
  const steel = new B.StandardMaterial('steel', scene);
  steel.diffuseTexture = deck;
  steel.specularColor = new B.Color3(0.12, 0.16, 0.17);
  steel.specularPower = 28;
  ground.material = steel;
  ground.receiveShadows = true;

  // ---- A few unit shapes drawn many times. Each shape and paint pair is one draw call.
  const M = B.MeshBuilder;
  const SHAPES = {
    box: () => M.CreateBox('box', { size: 1 }, scene),
    tube: () => M.CreateCylinder('tube', { height: 1, diameter: 1, tessellation: 18 }, scene),
    plinth: () => M.CreateCylinder('plinth', { height: 1, diameterBottom: 1, diameterTop: 0.8, tessellation: 8 }, scene),
    cone: () => M.CreateCylinder('cone', { height: 1, diameterBottom: 1, diameterTop: 0, tessellation: 10 }, scene),
    shard: () => M.CreateCylinder('shard', { height: 1, diameterBottom: 1, diameterTop: 0, tessellation: 4 }, scene),
    ball: () => M.CreateSphere('ball', { diameter: 1, segments: 8 }, scene),
    ring: () => M.CreateTorus('ring', { diameter: 1, thickness: 0.16, tessellation: 20 }, scene),
  };
  // [colour, light it gives off, opacity, shine]
  const PAINT = {
    plate: ['#34505A', 0, 1, 0.5], dark: ['#0E191D', 0, 1, 0.25], trim: ['#6F8A92', 0, 1, 0.45],
    rail: ['#4C6B74', 0, 1, 0.5], belt: ['#1B2B30', 0, 1, 0.2], stone: ['#6B6251', 0, 1, 0.15],
    cyan: ['#55D6E8', 0.85, 1, 0.3], acid: ['#B7F34A', 0.6, 1, 0.3], alarm: ['#FF4D5E', 0.9, 1, 0.3],
    amber: ['#F0A03C', 0.7, 1, 0.3], lime: ['#62E06A', 0.95, 1, 0.3], pale: ['#D5FAFF', 0.9, 1, 0.3],
    grey: ['#5C686B', 0.05, 1, 0.1], dormant: ['#4A3338', 0.05, 1, 0.2],
    S: ['#78BE3C', 0.35, 1, 0.6], F: ['#D98425', 0.3, 1, 0.4], C: ['#D8CAA9', 0.12, 1, 0.8], N: ['#55D6E8', 0.65, 1, 0.5],
    Sfield: ['#23411F', 0.08, 1, 0.5], Ffield: ['#45290F', 0.08, 1, 0.5], Cfield: ['#3A352C', 0.05, 1, 0.5], Nfield: ['#103842', 0.1, 1, 0.5],
    flesh: ['#8C3247', 0.12, 1, 0.9], pink: ['#FF8FA2', 0.45, 1, 0.8], gore: ['#3A1820', 0.05, 1, 0.9],
    skin: ['#24431E', 0.05, 1, 0.6], moss: ['#4B8024', 0.18, 1, 0.6], sleep: ['#2B2729', 0, 1, 0.3],
    site: ['#55D6E8', 0.25, 0.3, 0.1], wreck: ['#FF4D5E', 0.3, 0.35, 0.1], infected: ['#4A1420', 0.1, 0.45, 0.2],
    husk: ['#191D1E', 0, 0.45, 0.05], scent: ['#B7F34A', 0.55, 0.75, 0.1],
  };
  const FLAT = new Set(['belt', 'Sfield', 'Ffield', 'Cfield', 'Nfield', 'site', 'wreck', 'infected', 'husk', 'scent']);
  const materials = {};
  function material(name) {
    if (materials[name]) return materials[name];
    const [hex, light, opacity, shine] = PAINT[name];
    const color = B.Color3.FromHexString(hex);
    const m = new B.StandardMaterial(name, scene);
    m.diffuseColor = color;
    m.emissiveColor = color.scale(light);
    m.ambientColor = color;
    m.specularColor = new B.Color3(shine, shine, shine).scale(0.6);
    m.specularPower = 40;
    m.alpha = opacity;
    materials[name] = m;
    return m;
  }

  const batches = new Map();
  const matrix = new B.Matrix();
  const turn = new B.Quaternion();
  const size = new B.Vector3();
  const spot = new B.Vector3();
  let ghost = false; // while drawing a construction site
  // angle is a game angle (0 east, clockwise). roll lays an upright shape along that angle.
  function add(shape, paint, x, y, h, sx, sy = sx, sz = sx, angle = 0, roll = 0) {
    const name = ghost ? 'site' : paint;
    let batch = batches.get(`${shape}|${name}`);
    if (!batch) {
      const mesh = SHAPES[shape]();
      mesh.material = material(name);
      mesh.isPickable = false;
      mesh.alwaysSelectAsActiveMesh = true;
      if (!FLAT.has(name)) shadows.addShadowCaster(mesh);
      else mesh.receiveShadows = PAINT[name][2] === 1;
      batch = { mesh, data: new Float32Array(16 * 64), count: 0, grown: true };
      batches.set(`${shape}|${name}`, batch);
    }
    if ((batch.count + 1) * 16 > batch.data.length) {
      const bigger = new Float32Array(batch.data.length * 2);
      bigger.set(batch.data);
      batch.data = bigger;
      batch.grown = true;
    }
    B.Quaternion.RotationYawPitchRollToRef(angle, 0, roll, turn);
    B.Matrix.ComposeToRef(size.set(sx, sy, sz), turn, spot.set(x, h, -y), matrix);
    matrix.copyToArray(batch.data, batch.count * 16);
    batch.count++;
  }
  function flush() {
    for (const batch of batches.values()) {
      batch.mesh.setEnabled(batch.count > 0);
      if (batch.count) {
        if (batch.grown) batch.mesh.thinInstanceSetBuffer('matrix', batch.data, 16, false);
        else batch.mesh.thinInstanceBufferUpdated('matrix');
        batch.mesh.thinInstanceCount = batch.count;
        batch.grown = false;
      }
      batch.count = 0;
    }
  }

  const LYING = -Math.PI / 2;
  const facing = (dir) => Math.atan2(DY[dir], DX[dir]);
  const noise = (x, y) => Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
  const hull = (c) => TYPES[c.type]?.hp ?? 100;
  function segment(paint, ax, ay, bx, by, h, width, shape = 'tube') {
    const length = Math.hypot(bx - ax, by - ay);
    if (length > 0.01) add(shape, paint, (ax + bx) / 2, (ay + by) / 2, h, width, length, width, Math.atan2(by - ay, bx - ax), LYING);
  }
  function pointer(paint, x, y, h, dir, length = 0.2, width = 0.22) {
    add('cone', paint, x, y, h, 0.1, length, width, facing(dir), LYING);
  }
  function base(kind, x, y, h, r, angle = 0) {
    if (kind === 'S') add('ball', 'S', x, y, h, r * 1.8);
    if (kind === 'F') add('tube', 'F', x, y, h, r * 1.1, r * 2.2, r * 1.1, angle, LYING);
    if (kind === 'C') add('shard', 'C', x, y, h, r * 1.7, r * 2.3, r * 1.7, angle, LYING);
    if (kind === 'N') {
      for (let i = 0; i < 3; i++) add('box', 'N', x, y, h, r * 2.1, r * 0.3, r * 0.3, angle + (i * Math.PI) / 3);
      add('ball', 'pale', x, y, h, r * 0.9);
    }
  }
  function cargo(item, x, y, h, angle = 0, room = 0.74) {
    if (item.length === 1) return base(item, x, y, h, 0.16, angle);
    // First base leading.
    const cx = Math.cos(angle);
    const cy = Math.sin(angle);
    add('tube', 'dark', x, y, h - 0.07, 0.2, room + 0.08, 0.2, angle, LYING);
    [...item].forEach((b, i) => {
      const along = ((item.length - 1) / 2 - i) * (room / item.length);
      base(b, x + cx * along, y + cy * along, h + 0.06, Math.min(0.12, (room / item.length) * 0.45), angle);
    });
  }
  function body(x, y, tall = 0.46, paint = 'plate') {
    add('box', 'dark', x, y, 0.06, 0.82, 0.12, 0.82);
    add('box', paint, x, y, 0.12 + tall / 2, 0.68, tall, 0.68);
    for (const a of [-1, 1]) for (const b of [-1, 1]) add('tube', 'trim', x + a * 0.32, y + b * 0.32, 0.12 + tall * 0.4, 0.1, tall * 0.8, 0.1);
  }
  function membrane(x, y, dir, full, h = 0.3) {
    add('ball', full ? 'pink' : 'grey', x + DX[dir] * 0.38, y + DY[dir] * 0.38, h, 0.14, 0.3, 0.28, facing(dir));
  }
  // What a listener reads, floating over it.
  function readingOf(c, x, y, h) {
    const net = netOf(c);
    const place = c.read || 0;
    add('ring', 'cyan', x, y, h, 0.5);
    if (net.focus) cargo(place ? net.focus[place - 1] : net.focus, x, y, h + 0.1, Math.PI, 0.46);
    for (let i = 0; i < place; i++) add('box', 'cyan', x - 0.2 + i * 0.2, y - 0.36, h, 0.09, 0.09, 0.09);
  }

  const BUILDINGS = {
    belt(c, x, y) {
      const fed = feeders(c).map((f) => (f.dir + 2) % 4);
      const sides = new Set([c.dir, ...(fed.length ? fed : [(c.dir + 2) % 4])]);
      add('box', 'belt', x, y, 0.07, 0.46, 0.14, 0.46);
      for (let side = 0; side < 4; side++) {
        const a = facing(side);
        const ox = DX[side];
        const oy = DY[side];
        if (!sides.has(side)) {
          add('box', 'rail', x + ox * 0.25, y + oy * 0.25, 0.16, 0.06, 0.1, 0.54, a);
          continue;
        }
        add('box', 'belt', x + ox * 0.365, y + oy * 0.365, 0.07, 0.27, 0.14, 0.46, a);
        for (const s of [-1, 1]) add('box', 'rail', x + ox * 0.365 - oy * s * 0.25, y + oy * 0.365 + ox * s * 0.25, 0.16, 0.27, 0.1, 0.06, a);
      }
      const shift = built(c) ? (((G.time + owed) * 2 * rate()) % 1) * 0.34 - 0.17 : 0;
      if (c.type === 'belt') pointer('trim', x + DX[c.dir] * shift, y + DY[c.dir] * shift, 0.15, c.dir, 0.18, 0.2);
    },
    gate(c, x, y) {
      BUILDINGS.belt(c, x, y);
      const smart = listens(c);
      const on = smart ? Boolean(netOf(c).focus) : c.open;
      const light = on ? 'lime' : 'alarm';
      const side = (c.dir + 1) % 4;
      const ox = DX[side] * 0.34;
      const oy = DY[side] * 0.34;
      for (const s of [-1, 1]) add('tube', 'trim', x + ox * s, y + oy * s, 0.33, 0.12, 0.66, 0.12);
      add('ball', light, x - ox, y - oy, 0.75, 0.3);
      if (!on) add('box', 'alarm', x, y, 0.36, 0.08, 0.09, 0.66, facing(c.dir));
      pointer(light, x + DX[c.dir] * 0.38, y + DY[c.dir] * 0.38, 0.2, c.dir);
      if (smart) readingOf(c, x, y, 0.95);
    },
    bridge(c, x, y) {
      add('box', 'belt', x, y, 0.07, 0.46, 0.14, 1);
      add('box', 'plate', x, y, 0.34, 1, 0.1, 0.46);
      for (const s of [-1, 1]) {
        add('box', 'rail', x, y + s * 0.25, 0.44, 1, 0.1, 0.06);
        for (const t of [-1, 1]) add('tube', 'trim', x + t * 0.4, y + s * 0.25, 0.18, 0.09, 0.36, 0.09);
      }
      for (const axis of [0, 1]) {
        const way = wayOf(c, axis);
        if (way != null) pointer(c.ways?.[axis] != null ? 'acid' : 'trim', x + DX[way] * 0.4, y + DY[way] * 0.4, axis ? 0.46 : 0.17, way);
      }
    },
    mine(c, x, y) {
      body(x, y, 0.3);
      const bob = built(c) && !c.item ? Math.sin(G.time * 9 + c.x) * 0.05 : 0;
      add('tube', 'trim', x, y, 0.6 + bob, 0.14, 0.4, 0.14);
      add('plinth', 'plate', x, y, 0.8 + bob, 0.42, 0.14, 0.42);
      base(DEPOSIT[key(c.x, c.y)] || 'S', x, y, 0.96 + bob, 0.14);
      pointer('pink', x + DX[c.dir] * 0.48, y + DY[c.dir] * 0.48, 0.26, c.dir);
    },
    ligase(c, x, y) {
      body(x, y);
      add('plinth', 'dark', x, y, 0.64, 0.5, 0.14, 0.5);
      const spin = built(c) && c.ports.every((p) => p.length) ? G.time * 3 : 0;
      for (let i = 0; i < 4; i++) {
        const a = spin + i * 1.3;
        const ox = Math.cos(a) * 0.14;
        const oy = Math.sin(a) * 0.14;
        add('ball', i % 2 ? 'cyan' : 'acid', x + ox, y + oy, 0.74 + i * 0.07, 0.11);
        add('ball', i % 2 ? 'acid' : 'cyan', x - ox, y - oy, 0.74 + i * 0.07, 0.11);
      }
      for (let port = 0; port < 3; port++) {
        const side = portSide(c, port);
        const kind = c.ports[port][0] || c.last[port];
        membrane(x, y, side, c.ports[port].length);
        if (kind) base(kind, x + DX[side] * 0.32, y + DY[side] * 0.32, 0.62, 0.08);
      }
      pointer('acid', x + DX[c.dir] * 0.46, y + DY[c.dir] * 0.46, 0.3, c.dir);
    },
    join(c, x, y) {
      body(x, y);
      for (const port of [0, 1]) {
        const side = joinSide(c, port);
        const gene = c.ports[port][0] || (c.last ? c.last.slice(port * 3, port * 3 + 3) : '');
        membrane(x, y, side, c.ports[port].length);
        add('plinth', 'dark', x + DX[side] * 0.18, y + DY[side] * 0.18, 0.66, 0.3, 0.18, 0.3);
        if (gene) cargo(gene, x + DX[side] * 0.2, y + DY[side] * 0.2, 0.86, Math.PI, 0.3);
      }
      segment('acid', x - 0.2, y, x + 0.2, y, 0.7, 0.07);
      pointer('acid', x + DX[c.dir] * 0.46, y + DY[c.dir] * 0.46, 0.3, c.dir);
    },
    turret(c, x, y) {
      const loaded = Object.values(c.ammo).some((n) => n);
      const a = c.aim ?? -Math.PI / 2;
      const ox = Math.cos(a);
      const oy = Math.sin(a);
      add('plinth', 'dark', x, y, 0.15, 0.95, 0.3, 0.95);
      add('tube', 'plate', x, y, 0.45, 0.5, 0.34, 0.5);
      add('ball', 'plate', x, y, 0.74, 0.56, 0.4, 0.56);
      for (const s of [-1, 1]) segment('trim', x - oy * s * 0.09, y + ox * s * 0.09, x + ox * 0.62 - oy * s * 0.09, y + oy * 0.62 + ox * s * 0.09, 0.76, 0.11);
      add('ring', loaded ? 'cyan' : 'alarm', x, y, 0.58, 0.64, 0.5, 0.64);
      add('ball', loaded ? 'cyan' : 'grey', x, y, 0.94, 0.2);
    },
    wall(c, x, y) {
      const tall = 0.35 + 0.5 * Math.max(0, c.hp / hull(c));
      add('box', 'stone', x, y, tall / 2, 0.92, tall, 0.92);
      add('box', 'dark', x, y, tall + 0.05, 0.7, 0.1, 0.7);
      for (const s of [-1, 1]) add('shard', 'trim', x + s * 0.2, y, tall + 0.2, 0.16, 0.26, 0.16);
    },
    cyst(c, x, y) {
      const full = c.stock.length / 60;
      const beat = 1 + Math.sin(G.time * 3 + c.x) * 0.04;
      const r = (0.5 + full * 0.4) * beat;
      add('plinth', 'dark', x, y, 0.08, 0.8, 0.16, 0.8);
      add('ball', full > 0.95 ? 'alarm' : 'flesh', x, y, 0.16 + r * 0.38, r, r * 0.9, r);
      for (let i = 0; i < 4; i++) add('ball', 'pink', x + DX[i] * r * 0.35, y + DY[i] * r * 0.35, 0.2 + r * 0.3, 0.12);
      pointer('pink', x + DX[c.dir] * 0.46, y + DY[c.dir] * 0.46, 0.22, c.dir);
    },
    split(c, x, y) {
      body(x, y, 0.28);
      add('plinth', 'trim', x, y, 0.48, 0.34, 0.14, 0.34);
      for (const t of [3, 0, 1]) {
        const d = (c.dir + t) % 4;
        pointer('trim', x + DX[d] * 0.44, y + DY[d] * 0.44, 0.3, d);
      }
    },
    sort(c, x, y) {
      body(x, y, 0.3);
      pointer('trim', x + DX[c.dir] * 0.44, y + DY[c.dir] * 0.44, 0.3, c.dir);
      const side = sideExit(c);
      pointer('acid', x + DX[side] * 0.46, y + DY[side] * 0.46, 0.32, side);
      if (c.x != null && listens(c)) return readingOf(c, x, y, 0.65);
      [...c.want].forEach((b, i) => {
        const n = c.want.length;
        const px = x + (n === 1 ? 0 : (i - (n - 1) / 2) * (0.64 / n));
        const r = n === 1 ? 0.15 : n === 3 ? 0.1 : 0.06;
        if (b === '?') add('ring', 'grey', px, y, 0.52, r * 2);
        else base(b, px, y, 0.54, r, Math.PI);
      });
    },
    pump(c, x, y) {
      const full = Math.min(1, c.stock.length / VEIN.cap);
      const beat = built(c) ? Math.sin(G.time * 7 + c.x) * 0.06 : 0;
      add('plinth', 'dark', x, y, 0.12, 0.9, 0.24, 0.9);
      add('ball', 'flesh', x, y, 0.44, 0.6 + beat, 0.5 - beat, 0.6 + beat);
      add('ring', 'pink', x, y, 0.36, 0.68 + beat);
      const kind = c.stock[0] || c.packets[0]?.item;
      if (kind) cargo(kind, x, y, 0.78 + full * 0.08, Math.PI, 0.5);
    },
    pocket(c, x, y) {
      add('plinth', 'dark', x, y, 0.1, 0.86, 0.2, 0.86);
      add('ball', 'skin', x, y, 0.3, 0.66, 0.36 + Math.min(1, c.stock.length / WORM.pocket) * 0.3, 0.66);
      add('ring', 'acid', x, y, 0.46, 0.5);
      if (c.stock.length) cargo(c.stock[0], x, y, 0.64, Math.PI, 0.5);
      for (let d = 0; d < 4; d++) {
        if (!G.tracks[key(c.x + DX[d], c.y + DY[d])]) continue;
        const out = c.unload ? (d + 2) % 4 : d;
        pointer('acid', x + DX[out] * 0.46, y + DY[out] * 0.46, 0.3, out);
      }
    },
    core(c, x, y) {
      const beat = Math.sin(G.time * 2.5) * 0.06;
      add('plinth', 'plate', x, y, 0.18, 1.3, 0.36, 1.3);
      add('ball', 'moss', x, y, 0.62, 0.9 + beat);
      add('ball', 'acid', x, y, 0.96 + beat, 0.46);
      for (let i = 0; i < 4; i++) segment('cyan', x + DX[i] * 0.3, y + DY[i] * 0.3, x + DX[i] * 0.66, y + DY[i] * 0.66, 0.36, 0.1);
    },
  };

  // ---- The world
  function drawFields(area) {
    for (const [kind, x, y, w, h] of FIELDS) {
      if (x + w < area.x0 || x > area.x1 || y + h < area.y0 || y > area.y1) continue;
      for (let i = x; i < x + w; i++) {
        for (let j = y; j < y + h; j++) {
          const n = noise(i, j);
          const cx = i + 0.5;
          const cy = j + 0.5;
          add('box', `${kind}field`, cx, cy, 0.02 + n * 0.02, 0.98, 0.05, 0.98);
          if (cam.zoom < 9 && (i + j) % 2) continue;
          if (G.cells[key(i, j)]) {
            base(kind, cx - 0.38, cy + 0.38, 0.12, 0.08);
            continue;
          }
          const swell = 1 + Math.sin(G.time * 2 + n * 9) * 0.07;
          if (kind === 'S') {
            add('ball', 'S', cx, cy, 0.18, (0.3 + n * 0.22) * swell);
            add('ball', 'moss', cx + 0.26, cy - 0.2, 0.1, 0.17);
          } else if (kind === 'F') {
            for (let k = 0; k < 3; k++) add('tube', 'F', cx + (k - 1) * 0.22, cy + Math.sin(k + n * 5) * 0.16, 0.14 + n * 0.1, 0.12, 0.25 + n * 0.25 * swell, 0.12);
          } else if (kind === 'C') {
            add('shard', 'C', cx, cy, 0.24, 0.36, 0.4 + n * 0.3, 0.36, n * 6);
            add('shard', 'C', cx + 0.26, cy + 0.2, 0.12, 0.2, 0.22, 0.2, n * 3);
          } else {
            add('tube', 'Nfield', cx, cy, 0.14, 0.07, 0.28, 0.07);
            base('N', cx, cy, 0.3, 0.17 * swell, n * 6);
          }
        }
      }
    }
  }
  function drawBreaches() {
    for (const b of G.breaches) {
      const fade = b.state === 'spent' ? 1 - (G.time - b.ended) / 8 : 1;
      if (fade <= 0) continue;
      const x = b.x + 0.5;
      const y = b.y + 0.5;
      const asleep = b.state === 'sleep';
      const r = (0.8 + (b.left / b.total) * 0.7) * fade;
      const skin = asleep ? 'sleep' : 'gore';
      const beat = asleep ? 0 : Math.sin(G.time * 5) * 0.12;
      add('tube', asleep ? 'husk' : 'infected', x, y, 0.03, 7 * fade, 0.05, 7 * fade);
      add('plinth', skin, x, y, 0.22, r * 2.6, 0.44, r * 2.6);
      add('ball', asleep ? 'dormant' : 'alarm', x, y, 0.38, r * 1.2 + beat, 0.42 + beat, r * 1.2 + beat);
      for (let i = 0; i < 9; i++) {
        const a = i * 0.698;
        const sway = asleep ? 0 : Math.sin(G.time * 3 + i) * 0.25;
        let px = x + Math.cos(a) * r;
        let py = y + Math.sin(a) * r;
        for (let j = 1; j <= 3; j++) {
          const reach = r + j * 0.5 * fade;
          const nx = x + Math.cos(a + sway * j * 0.3) * reach;
          const ny = y + Math.sin(a + sway * j * 0.3) * reach;
          segment(skin, px, py, nx, ny, 0.3 - j * 0.05, 0.3 - j * 0.06);
          px = nx;
          py = ny;
        }
      }
      if (!asleep) {
        for (let i = 0; i < 10; i++) {
          const p = (G.time * 0.4 + i / 10) % 1;
          add('ball', 'alarm', x + Math.cos(i * 2.4) * p * 2.4, y + Math.sin(i * 2.4) * p * 2.4, 0.4 + p * 1.8, 0.14 * (1 - p));
        }
      }
    }
  }
  function drawOrganism3D() {
    const x = CORE.x + 0.5;
    const y = CORE.y + 0.5;
    const want = STAGES[G.stage];
    const part = !want ? 0 : want.rate ? G.held / want.hold : G.fed / want.count;
    const born = Math.min(1, (G.time - (G.grownAt ?? -99)) / 3);
    const reach = 1.2 + Math.max(0, G.stage + part - (1 - born)) * 1.6;
    const arms = 6 + G.stage * 3;
    for (let i = 0; i < arms; i++) {
      const a = i * 2.39996;
      const far = reach * (0.8 + (i % 4) * 0.13);
      let px = x + Math.cos(a) * 0.4;
      let py = y + Math.sin(a) * 0.4;
      for (let j = 1; j <= 5; j++) {
        const k = j / 5;
        const bend = a + Math.sin(G.time * 0.9 + i + k * 3) * 0.2 * k;
        const nx = x + Math.cos(bend) * far * k;
        const ny = y + Math.sin(bend) * far * k;
        segment(j > 3 ? 'moss' : 'skin', px, py, nx, ny, 0.11 - k * 0.07, (0.2 + G.stage * 0.04) * (1 - k * 0.65));
        add('ball', 'skin', nx, ny, 0.11 - k * 0.07, (0.2 + G.stage * 0.04) * (1 - k * 0.6));
        px = nx;
        py = ny;
      }
      if (G.stage) add('ball', ['S', 'pink', 'N'][i % G.stage], px, py, 0.2, 0.16 + G.stage * 0.06);
    }
    for (let i = 0; i < 12 + G.stage * 8; i++) {
      const p = (G.time * 0.12 + noise(i, 3)) % 1;
      const a = i * 2.4 + G.time * 0.15;
      const r = (0.6 + noise(i, 7)) * reach;
      add('ball', 'acid', x + Math.cos(a) * r, y + Math.sin(a) * r, 0.2 + p * 2.6, 0.09 * (1 - p));
    }
    heart.position.copyFromFloats(x, 2.2, -y);
    heart.intensity = 0.22 + G.stage * 0.06 + Math.sin(G.time * 2.5) * 0.05;
  }
  function drawLinks() {
    for (const c of Object.values(G.cells)) {
      if (c.type !== 'pump' || !c.to || !G.cells[c.to]) continue;
      const to = G.cells[c.to];
      const ax = c.x + 0.5;
      const ay = c.y + 0.5;
      const bx = to.x + 0.5;
      const by = to.y + 0.5;
      const broken = c.veinHp <= 0;
      ghost = c.veinLeft > 0;
      segment(broken ? 'alarm' : 'gore', ax, ay, bx, by, 0.05, 0.4);
      segment(leaking(c) || broken ? 'alarm' : 'flesh', ax, ay, bx, by, 0.15, 0.2);
      ghost = false;
      for (const p of c.packets) {
        const k = Math.min(1, p.t);
        const x = ax + (bx - ax) * k;
        const y = ay + (by - ay) * k;
        add('ball', 'pink', x, y, 0.22, 0.34 + Math.min(8, p.n) * 0.025);
        base(p.item[0], x, y, 0.44, 0.13);
      }
      if (leaking(c)) {
        for (let i = 0; i < 8; i++) {
          const p = (G.time + i / 8) % 1;
          add('ball', 'alarm', (ax + bx) / 2 + Math.cos(i * 2.4) * p, (ay + by) / 2 + Math.sin(i * 2.4) * p, 0.2 + p * 0.6, 0.2 * (1 - p));
        }
      }
    }
    for (const t of Object.values(G.tracks)) {
      const paint = built(t) ? 'scent' : 'site';
      for (const k of [0, 0.5]) add('ball', paint, t.x + 0.5 + DX[t.dir] * k, t.y + 0.5 + DY[t.dir] * k, 0.05, k ? 0.12 : 0.18, 0.06, k ? 0.12 : 0.18);
    }
    for (const w of G.wires) {
      let a = G.cells[w.a];
      let b = G.cells[w.b];
      if (!a || !b) continue;
      if (b.type === 'turret') [a, b] = [b, a];
      const live = carries(w);
      segment(!w.hp ? 'alarm' : live ? 'N' : 'site', a.x + 0.5, a.y + 0.5, b.x + 0.5, b.y + 0.5, 0.85, 0.06);
      const gene = live && netOf(a)?.focus;
      if (!gene) continue;
      const length = span(a, b);
      const count = Math.max(1, Math.ceil(length / 4));
      for (let i = 0; i < count; i++) {
        const k = ((G.time * 5) / Math.max(1, length) + i / count) % 1;
        cargo(gene, a.x + 0.5 + (b.x - a.x) * k, a.y + 0.5 + (b.y - a.y) * k, 1, Math.atan2(b.y - a.y, b.x - a.x), 0.4);
      }
    }
  }
  function drawCells(area) {
    for (const c of Object.values(G.cells)) {
      if (c.x < area.x0 - 1 || c.x > area.x1 || c.y < area.y0 - 1 || c.y > area.y1) continue;
      const x = c.x + 0.5;
      const y = c.y + 0.5;
      ghost = !built(c);
      BUILDINGS[c.type]?.(c, x, y);
      if (ghost) {
        for (const a of [-1, 1]) for (const b of [-1, 1]) add('tube', 'site', x + a * 0.44, y + b * 0.44, 0.45, 0.05, 0.9, 0.05);
      }
      ghost = false;
      if (cam.zoom < 9) continue;
      if ((isBelt(c) || c.type === 'split' || c.type === 'sort') && c.item) {
        const p = along(c, c.from, exitOf(c), c.t);
        cargo(c.item, p.x, p.y, isBelt(c) ? 0.28 : 0.55, p.angle);
      }
      if (c.type === 'bridge') {
        c.lanes.forEach((lane, axis) => {
          if (!lane) return;
          const p = along(c, lane.dir, lane.dir, lane.t);
          cargo(lane.item, p.x, p.y, axis ? 0.58 : 0.24, p.angle);
        });
      }
    }
    for (const [id, w] of Object.entries(G.ruins)) {
      if (G.cells[id]) continue;
      for (let i = 0; i < 4; i++) add('shard', 'wreck', w.x + 0.3 + (i % 2) * 0.4, w.y + 0.3 + (i >> 1) * 0.4, 0.14, 0.28, 0.3, 0.28, i);
    }
  }
  function drawLife() {
    for (const w of G.worms) {
      const moving = built(w) && !w.docked && !w.stuck;
      const k = moving ? Math.min(1, w.t + owed * WORM.speed * rate()) : 0;
      const next = moving && trackAfter(w.path[0]);
      let ahead3 = null;
      ghost = !built(w);
      for (let i = 0; i < w.path.length; i++) {
        let [x, y] = w.path[i].split(',').map((n) => Number(n) + 0.5);
        const to = i ? w.path[i - 1] : next && key(next.x, next.y);
        if (moving && to) {
          const [tx, ty] = to.split(',').map((n) => Number(n) + 0.5);
          x += (tx - x) * k;
          y += (ty - y) * k;
        }
        const lift = Math.sin(G.time * 8 - i) * (moving ? 0.05 : 0);
        const hold = w.holds[i - 1];
        add('ball', hold ? 'skin' : 'moss', x, y, 0.34 + lift, hold ? 0.98 : 0.74, hold ? 0.66 : 0.56, hold ? 0.98 : 0.74);
        if (ahead3) segment('moss', x, y, ahead3[0], ahead3[1], 0.3, 0.3);
        if (!i) for (const s of [-0.14, 0.14]) add('ball', 'pale', x + s, y, 0.64 + lift, 0.13);
        if (hold?.n) {
          add('ring', 'acid', x, y, 0.64 + lift, 0.3 + (hold.n / WORM.hold) * 0.4);
          cargo(hold.kind, x, y, 0.74 + lift, 0, 0.56);
        }
        ahead3 = [x, y];
      }
      ghost = false;
    }
    G.enemies.forEach((e, i) => {
      const goal = e.goal || { x: CORE.x + 0.5, y: CORE.y + 0.5 };
      const a = Math.atan2(goal.y - e.y, goal.x - e.x);
      const ox = Math.cos(a);
      const oy = Math.sin(a);
      const bob = Math.sin(G.time * 10 + i) * 0.03;
      add('ball', 'gore', e.x - ox * 0.12, e.y - oy * 0.12, 0.3 + bob, 0.66, 0.36, 0.46, a);
      add('ball', 'flesh', e.x + ox * 0.26, e.y + oy * 0.26, 0.3 + bob, 0.3, 0.26, 0.32, a);
      for (const side of [-1, 1]) {
        add('ball', 'alarm', e.x + ox * 0.38 - oy * side * 0.09, e.y + oy * 0.38 + ox * side * 0.09, 0.36 + bob, 0.09);
        for (let leg = 0; leg < 3; leg++) {
          const step3 = Math.sin(G.time * 14 + leg * 2 + side) * 0.07;
          const f = (leg - 1) * 0.22;
          segment('flesh', e.x + ox * f, e.y + oy * f, e.x + ox * (f + step3) - oy * side * 0.44, e.y + oy * (f + step3) + ox * side * 0.44, 0.14, 0.07);
        }
      }
    });
    for (const s of G.shots) {
      const paint = { 1: 'grey', 2: 'pink', 5: 'amber', 12: 'acid' }[s.hurt];
      segment(paint, s.x, s.y, s.tx, s.ty, 0.6, s.hurt === 12 ? 0.14 : 0.07);
      add('ball', paint, s.tx, s.ty, 0.45, s.hurt === 12 ? 0.55 : 0.28);
    }
  }

  // ---- Read-outs stay on the 2D canvas, flattened on the ground and lifted to their object's height.
  function drawOverlay() {
    const s = cam.zoom * view.dpr;
    const g = ctx;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, canvas.width, canvas.height);
    g.setTransform(s, 0, 0, s * tilt, canvas.width / 2 - cam.x * s, canvas.height / 2 - cam.y * s * tilt);
    const up = (y, h) => y - h * lean;
    const px = 1 / cam.zoom;
    const label = (text, x, y, points, color) => {
      g.save();
      g.translate(x, y);
      g.scale(1 / 40, 1 / (40 * tilt));
      g.fillStyle = color;
      g.font = `700 ${points}px Verdana`;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText(text, 0, 0);
      g.restore();
    };
    const bar = (x, y, part, color) => {
      rect(g, x - 0.4, y, 0.8, 0.1, '#05090B');
      rect(g, x - 0.4, y, 0.8 * Math.max(0, part), 0.1, color);
    };
    for (const [, x, y, w, h] of FIELDS) {
      const rich = richness(x + w / 2, y + h / 2);
      if (rich < 2) continue;
      const color = rich > richCap() ? '#8B989C' : '#B7F34A';
      rect(g, x, y, w, h, null, color);
      label(`×${rich}`, x + 0.4, y - 0.5, Math.min(90, Math.max(18, (13 * 40) / cam.zoom)), color);
    }
    for (const b of G.breaches) {
      if (b.state === 'spent') continue;
      const x = b.x + 0.5;
      const y = b.y + 0.5;
      const asleep = b.state === 'sleep';
      if (asleep) {
        g.setLineDash([0.6, 0.6]);
        circle(g, x, y, b.r, null, '#8A747C', Math.max(0.06, px));
        g.setLineDash([]);
      }
      if (cam.zoom < 8) continue;
      label(b.left, x, up(y, 0.9), 28, asleep ? '#A3B8B3' : '#FFD0D0');
      b.genes.forEach((gene, row) => {
        [...gene].forEach((kind, i) => glyph(g, kind, x + (i - 1) * 0.65, y + 2 + row * 0.65, 0.24));
      });
    }
    const want = STAGES[G.stage];
    const part = !want ? 0 : want.rate ? G.held / want.hold : G.fed / want.count;
    if (part > 0) {
      g.beginPath();
      g.arc(CORE.x + 0.5, CORE.y + 0.5, 1.05 + G.stage * 0.22, -Math.PI / 2, -Math.PI / 2 + part * Math.PI * 2);
      g.strokeStyle = '#B7F34A';
      g.lineWidth = 0.14;
      g.stroke();
    }
    for (const c of Object.values(G.cells)) {
      const x = c.x + 0.5;
      const y = c.y + 0.5;
      if (!built(c)) bar(x, y + 0.36, 1 - c.left / BUILD[c.type], '#55D6E8');
      if (c.hp < hull(c) - 0.5) bar(x, up(c.y, 0.8), c.hp / hull(c), healing(c) ? '#62E06A' : '#FF6B6B');
      if (c.type === 'ligase' && cam.zoom >= 20) {
        for (let port = 0; port < 3; port++) {
          const side = portSide(c, port);
          label(port + 1, x + DX[side] * 0.14, up(y + DY[side] * 0.14, 0.75), 11, '#E6F0EC');
        }
      }
    }
    for (const w of G.worms) {
      const [x, y] = w.path[0].split(',').map(Number);
      if (w.hp < WORM.hp - 0.5) bar(x + 0.5, up(y, 0.7), w.hp / WORM.hp, '#FF6B6B');
      if (w.id !== wormId) continue;
      for (const id of w.path) {
        const [cx, cy] = id.split(',').map(Number);
        circle(g, cx + 0.5, cy + 0.5, 0.58, null, '#B7F34A', 0.05);
      }
    }
    if (cam.zoom >= 9) {
      const packs = [];
      for (const e of G.enemies) {
        const pack = packs.find((p) => p.e.gene === e.gene && Math.abs(p.e.x - e.x) < 0.8 && Math.abs(p.e.y - e.y) < 0.6);
        if (pack) pack.n++;
        else packs.push({ e, n: 1 });
      }
      for (const { e, n } of packs) {
        const y = up(e.y, 0.95);
        rect(g, e.x - 0.4, y - 0.16, 0.8, 0.32, '#05090BCC');
        [...e.gene].forEach((kind, i) => glyph(g, kind, e.x + (i - 1) * 0.24, y, 0.11));
        rect(g, e.x - 0.4, y - 0.26, 0.8 * Math.max(0, e.hp / e.max), 0.08, '#FF6B6B');
        if (n > 1) label(`×${n}`, e.x + 0.75, y, 15, '#FFD0D0');
      }
    }
    for (const c of chain) rect(g, c.x + 0.04, c.y + 0.04, 0.92, 0.92, null, '#FF6B6B');
    const picked = selected && G.cells[selected];
    if (picked) {
      rect(g, picked.x, picked.y, 1, 1, null, '#B7F34A');
      if (picked.type === 'turret') circle(g, picked.x + 0.5, picked.y + 0.5, NERVE.range, null, '#55D6E8', 2 * px);
    }
    const from = (linking && G.cells[linking]) || (wiring && G.cells[wiring]);
    if (from) circle(g, from.x + 0.5, from.y + 0.5, linking ? VEIN.reach : NERVE.reach, null, linking ? '#FF8FA2' : '#55D6E8', 2 * px);
    const start = gesture?.mode === 'draw' && (drag?.vein || drag?.nerve);
    if (start) {
      const far = Math.hypot(drag.aim.x - start.x, drag.aim.y - start.y) > VEIN.reach;
      g.beginPath();
      g.moveTo(start.x + 0.5, start.y + 0.5);
      g.lineTo(drag.aim.x + 0.5, drag.aim.y + 0.5);
      g.strokeStyle = far ? '#FF4D5E' : drag.vein ? '#FF8FA2' : '#55D6E8';
      g.lineWidth = 0.22;
      g.setLineDash([0.4, 0.3]);
      g.stroke();
      g.setLineDash([]);
    }
    g.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
    for (const e of G.enemies) marker(e.x, e.y, '#FF6B6B');
    for (const b of G.breaches) if (b.state === 'wake') marker(b.x + 0.5, b.y + 0.5, '#F0A03C');
    marker(CORE.x + 0.5, CORE.y + 0.5, '#B7F34A');
  }

  let width = 0;
  let height = 0;
  return {
    tilt,
    // A tap on the top of a tall object means that object, though the ground behind it is another cell.
    pick(point) {
      const p = worldAt(point.x, point.y);
      const x = Math.floor(p.x);
      for (const h of [0.75, 0.5, 0.3]) {
        const y = Math.floor(p.y + h * lean);
        const c = G.cells[key(x, y)];
        if (c && !isBelt(c) && c.type !== 'bridge' && y !== Math.floor(p.y) && !G.cells[key(x, Math.floor(p.y))]) return { x, y };
      }
      return { x, y: Math.floor(p.y) };
    },
    draw() {
      if (width !== view.w || height !== view.h) {
        width = view.w;
        height = view.h;
        engine.resize();
      }
      const halfW = view.w / 2 / cam.zoom;
      const halfH = view.h / 2 / cam.zoom;
      camera.orthoLeft = -halfW;
      camera.orthoRight = halfW;
      camera.orthoTop = halfH;
      camera.orthoBottom = -halfH;
      const back = 160;
      camera.position.copyFromFloats(cam.x, Math.sin(ELEVATION) * back, -cam.y - Math.cos(ELEVATION) * back);
      camera.setTarget(at(cam.x, 0, cam.y));
      // The shadow map follows what is on screen, so it stays sharp up close.
      const reach = Math.min(48, Math.max(halfW, halfH / tilt) + 4);
      sun.position.copyFromFloats(cam.x - 33, 60, -cam.y + 21);
      sun.orthoLeft = -reach;
      sun.orthoRight = reach;
      sun.orthoTop = reach;
      sun.orthoBottom = -reach;

      const a = worldAt(0, 0);
      const b = worldAt(view.w, view.h);
      // Tall things just south of the screen still show their tops.
      const area = { x0: Math.floor(a.x) - 1, y0: Math.floor(a.y) - 2, x1: Math.ceil(b.x) + 1, y1: Math.ceil(b.y) + 2 };
      drawFields(area);
      drawBreaches();
      drawOrganism3D();
      drawLinks();
      drawCells(area);
      drawLife();
      flush();
      scene.render();
      drawOverlay();
    },
    dispose() {
      scene.dispose();
      engine.dispose();
    },
  };
};
