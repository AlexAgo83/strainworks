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
  const deck = new B.DynamicTexture('deck', { width: 1024, height: 1024 }, scene, true);
  {
    const g = deck.getContext();
    g.fillStyle = '#16262B';
    g.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        g.fillStyle = ['#16262B', '#152429', '#17272D'][(i * 7 + j * 5) % 3];
        g.fillRect(i * 256 + 3, j * 256 + 3, 250, 250);
      }
    }
    g.strokeStyle = '#0A1215';
    g.lineWidth = 9;
    g.strokeRect(0, 0, 1024, 1024);
    g.lineWidth = 3;
    g.strokeRect(24, 24, 976, 976);
    g.fillStyle = '#101C20';
    for (let i = 0; i < 9; i++) g.fillRect(640, 106 + i * 18, 220, 6);
    g.strokeStyle = '#20343A';
    g.lineWidth = 2;
    for (let i = 0; i < 70; i++) {
      const x = (i * 397) % 1000;
      const y = (i * 613) % 1000;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + ((i * 31) % 46) - 23, y + ((i * 17) % 18) - 9);
      g.stroke();
    }
    g.fillStyle = '#35505A';
    for (const x of [42, 512, 982]) {
      for (const y of [42, 512, 982]) {
        g.beginPath();
        g.arc(x, y, 8, 0, Math.PI * 2);
        g.fill();
      }
    }
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

  // ---- Each shape and paint pair of the models is one draw call.
  const models = window.createModels3D(B, scene);
  const { SHAPES, PAINT, CASTERS } = models;
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
  // angle is a game angle (0 east, clockwise). roll lays an upright shape along that angle.
  function add(shape, paint, x, y, h, sx, sy = sx, sz = sx, angle = 0, roll = 0) {
    const name = add.ghost ? 'site' : paint; // ghost: a construction site
    let batch = batches.get(`${shape}|${name}`);
    if (!batch) {
      const mesh = SHAPES[shape]();
      mesh.material = material(name);
      mesh.isPickable = false;
      mesh.alwaysSelectAsActiveMesh = true;
      const [, light, opacity] = PAINT[name];
      if (CASTERS.has(shape) && opacity === 1) shadows.addShadowCaster(mesh);
      else mesh.receiveShadows = opacity === 1 && !light;
      // Only what is lit goes through the glow pass, with what could hide it.
      if (light >= 0.2) glow.addIncludedOnlyMesh(mesh);
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

  const hull = (c) => TYPES[c.type]?.hp ?? 100;
  const heartbeat = () => {
    heart.position.copyFromFloats(CORE.x + 0.5, 2.2, -(CORE.y + 0.5));
    heart.intensity = 0.22 + G.stage * 0.06 + Math.sin(G.time * 2.5) * 0.05;
  };

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
      label(b.left, x, up(y, 2.1), 26, asleep ? '#A3B8B3' : '#FFD0D0');
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
          label(port + 1, x + DX[side] * 0.5, up(y + DY[side] * 0.5, 0.52), 10, '#E6F0EC');
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
      heartbeat();
      models.draw(add, area);
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
