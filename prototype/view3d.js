// The 3D view of the prototype: a second way of drawing the same game.
// It reads the page's state and helpers (G, cam, view, wayOf, along...) and never changes a rule or the state.
// The camera is orthographic with a fixed tilt, so a finger lands on the same cell as in 2D once y is flattened.
window.createView3D = (glCanvas) => {
  const B = window.BABYLON;
  const ELEVATION = (50 * Math.PI) / 180;
  const tilt = Math.sin(ELEVATION);
  const lean = Math.cos(ELEVATION) / tilt; // cells of ground hidden behind one cell of height
  const engine = new B.Engine(glCanvas, true, { stencil: true }, false);
  // Fast: screen pixels, smaller shadows and a lighter glow, for graphics cards that cannot keep up.
  const fast = window.quality3d === 'fast';
  engine.setHardwareScalingLevel(1 / (fast ? 1 : Math.min(1.75, window.devicePixelRatio || 1)));
  // GPU time of a frame, where the browser offers timer queries (the performance graph reads it).
  const timing = engine.getCaps().timerQuery ? new B.EngineInstrumentation(engine) : null;
  if (timing) timing.captureGPUFrameTime = true;
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

  const shadows = new B.ShadowGenerator(fast ? 1024 : 2048, sun);
  shadows.usePercentageCloserFiltering = true;
  shadows.bias = 0.002;
  shadows.setDarkness(0.3);
  const glow = new B.GlowLayer('glow', scene, { mainTextureFixedSize: fast ? 256 : 512, blurKernelSize: fast ? 12 : 24 });
  glow.intensity = 0.6;

  const terrain = window.createTerrain3D(B, scene, glow);

  // ---- A small planet: the ground falls away toward the horizon and toward both sides, smoothly from the middle.
  // Lowering a point only moves it down the screen, so what is drawn flat over the ground (grid, previews) can be
  // laid where it shows, and a point of the screen is turned back into its cell. The ground meshes bend in their
  // shader; pieces lean with the slope under their foot and drop with it (their matrices, so glow and shadows
  // follow), so a run of belts stays joined. window.curve3d runs from 0 to 1; at 1 the horizon stays past the top.
  const SIDE = 0.9;
  const MAXK = 0.2 / lean;
  const bend = { cx: 0, cy: 0, hw: 1, hh: 1, k: 0 };
  const depthOf = (y) => Math.max(0, (bend.cy - y) / bend.hh);
  const sideOf = (x) => ((x - bend.cx) / bend.hw) * SIDE;
  const dropAt = (x, y) => (bend.k ? bend.k * (depthOf(y) ** 2 + sideOf(x) ** 2) * bend.hh : 0);
  // The ground's slope under a point: toward the horizon, and toward the side.
  const slopeAt = (y) => Math.atan(2 * bend.k * depthOf(y));
  const rollAt = (x) => -Math.atan((2 * bend.k * sideOf(x) * SIDE * bend.hh) / bend.hw);
  // The ground cell under a point of the flat screen: where it shows, it was lowered by its drop.
  const groundRow = (x, flatY) => {
    let y = flatY;
    for (let i = 0; i < 8; i++) y = flatY - dropAt(x, y) * lean;
    return y;
  };
  class Bend extends B.MaterialPluginBase {
    constructor(material) {
      super(material, 'Bend', 200, { BEND: false });
      this._enable(true);
    }
    prepareDefines(defines) { defines.BEND = true; }
    getClassName() { return 'Bend'; }
    getUniforms() {
      return {
        ubo: [{ name: 'bendView', size: 4, type: 'vec4' }, { name: 'bendK', size: 1, type: 'float' }],
        vertex: '#ifdef BEND\nuniform vec4 bendView;\nuniform float bendK;\n#endif',
      };
    }
    bindForSubMesh(ubo) {
      ubo.updateFloat4('bendView', bend.cx, bend.cy, bend.hw, bend.hh);
      ubo.updateFloat('bendK', bend.k);
    }
    getCustomCode(type) {
      if (type !== 'vertex') return null;
      return {
        CUSTOM_VERTEX_UPDATE_WORLDPOS: `#ifdef BEND
          float bendT = max(0.0, (bendView.y + worldPos.z) / bendView.w);
          float bendS = (worldPos.x - bendView.x) / bendView.z * ${SIDE.toFixed(3)};
          worldPos.y -= bendK * (bendT * bendT + bendS * bendS) * bendView.w;
          #endif`,
      };
    }
  }
  for (const name of ['soil', 'iron', 'roots']) {
    const m = scene.getMaterialByName(name);
    if (m) new Bend(m);
  }

  // ---- Each shape and paint pair of the models is one draw call.
  const models = window.createModels3D(B, scene);
  const { SHAPES, CASTERS } = models;
  const PAINT = { ...models.PAINT, ...terrain.PAINT };
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
  const foot = new B.Matrix();
  const lean2 = new B.Matrix();
  const bent = new B.Matrix();
  const spot = new B.Vector3();
  // angle is a game angle (0 east, clockwise). roll lays an upright shape along that angle.
  function add(shape, paint, x, y, h, sx, sy = sx, sz = sx, angle = 0, roll = 0) {
    // ghost: a construction site, a hologram above the height it has been woven to.
    const name = add.ghost && !(add.solid > 0 && h <= add.solid) ? (add.ghost === 'scrap' ? 'scrap' : 'site') : paint;
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
    // Everything rides the ground, which is at height 0 under what is built.
    B.Matrix.ComposeToRef(size.set(sx, sy, sz), turn, spot.set(x, add.plane ? h : h + terrain.height(x, y), -y), matrix);
    const drop = dropAt(x, y);
    if (drop) {
      // Turned about its foot by the slope there, then lowered with the ground.
      B.Matrix.TranslationToRef(-x, 0, y, foot);
      B.Matrix.RotationXToRef(slopeAt(y), lean2);
      foot.multiplyToRef(lean2, foot);
      B.Matrix.RotationZToRef(rollAt(x), lean2);
      foot.multiplyToRef(lean2, foot);
      B.Matrix.TranslationToRef(x, -drop, -y, lean2);
      foot.multiplyToRef(lean2, foot);
      matrix.multiplyToRef(foot, bent);
      matrix.copyFrom(bent);
    }
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

  const heartbeat = () => {
    heart.position.copyFromFloats(CORE.x + 0.5, 2.2, -(CORE.y + 0.5));
    heart.intensity = 0.22 + G.stage * 0.06 + Math.sin(G.time * 2.5) * 0.05;
  };

  // ---- Read-outs stay on the 2D canvas, flattened on the ground and lifted to their object's height.
  function drawOverlay(area) {
    // Bent, the read-outs are drawn flat apart, then laid on the screen row by row where the ground shows.
    // The flat drawing reaches past the top of the screen by a margin: the bent ground shows cells from there.
    flat.lift = bend.k ? Math.ceil(canvas.height * 0.6) : 0;
    if (bend.k && (flat.canvas.width !== canvas.width || flat.canvas.height !== canvas.height + flat.lift)) Object.assign(flat.canvas, { width: canvas.width, height: canvas.height + flat.lift });
    if (bend.k) { flat.raw(1, 0, 0, 1, 0, 0); flat.ctx.clearRect(0, 0, flat.canvas.width, flat.canvas.height); }
    // What is drawn is picked from the screen's top-left corner: bent, that corner reaches up by the margin too.
    const shownFrom = window.worldAt;
    if (bend.k) window.worldAt = (sx, sy) => shownFrom(sx, sy <= 0 ? sy - flat.lift / view.dpr : sy);
    try { drawFlat(area); } finally { window.worldAt = shownFrom; }
  }
  function drawFlat(area) {
    const s = cam.zoom * view.dpr;
    const g = bend.k ? flat.ctx : ctx;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, canvas.width, canvas.height);
    g.setTransform(s, 0, 0, s * tilt, canvas.width / 2 - cam.x * s, canvas.height / 2 - cam.y * s * tilt);
    drawFog(g);
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
    // With a tool in hand, the plane the finger points at.
    if (tool !== 'hand' && cam.zoom >= 11) {
      const a = worldAt(0, 0);
      const b = worldAt(view.w, view.h);
      const x0 = Math.floor(a.x);
      const x1 = Math.ceil(b.x);
      const y0 = Math.floor(a.y);
      const y1 = Math.ceil(b.y);
      g.beginPath();
      for (let x = x0; x <= x1; x++) {
        g.moveTo(x, y0);
        g.lineTo(x, y1);
      }
      for (let y = y0; y <= y1; y++) {
        g.moveTo(x0, y);
        g.lineTo(x1, y);
      }
      g.strokeStyle = '#8FBAC426';
      g.lineWidth = px;
      g.stroke();
    }
    for (const field of fieldsIn(area.x0, area.y0, area.x1, area.y1)) {
      const kind = field[0];
      const patch = patchOf(field);
      if (!patch.list.some((p) => known(p.x, p.y))) continue;
      // Dark on dark ground: carbon is framed and named, or it passes for rubble.
      if (kind === 'K') {
        g.beginPath();
        for (const p of patch.list) {
          if (!known(p.x, p.y)) continue;
          g.moveTo(p.x + 1.1, p.y + 0.5);
          g.arc(p.x + 0.5, p.y + 0.5, 0.6, 0, Math.PI * 2);
        }
        g.fillStyle = '#AEB9BF14';
        g.fill();
        if (cam.zoom >= 8) label(typeof L === 'function' ? L('carbone') : 'carbone', patch.cx, patch.top - 0.42, Math.min(40, Math.max(14, 440 / cam.zoom)), '#D3DCE0');
        continue;
      }
      const rich = richAt(patch.list[0].x, patch.list[0].y);
      if (rich < 2) continue;
      const color = rich > richCap() ? '#8B989C' : '#B7F34A';
      label(`×${rich}`, patch.cx, patch.top - 0.5, Math.min(90, Math.max(18, (13 * 40) / cam.zoom)), color);
    }
    for (const b of shownNests(area.x0, area.y0, area.x1, area.y1)) {
      if (b.state === 'spent') continue;
      const x = b.x + 0.5;
      const y = b.y + 0.5;
      const asleep = b.state === 'sleep';
      if (asleep) {
        g.setLineDash([0.6, 0.6]);
        circle(g, x, y, b.r + Math.sin(motionTime() * 1.1) * 0.08, null, '#8A747C', Math.max(0.06, px));
        g.setLineDash([]);
      }
      if (cam.zoom < 8) continue;
      label(b.left, x, up(y, 2.1), 26, asleep ? '#A3B8B3' : '#FFD0D0');
      if (!asleep && b.max) bar(x, up(y, 2.75), Math.max(0, b.hp / b.max), '#FF6B6B');
      if (b.tier) label(`niveau ${levelOf(b)}`, x, up(y, 3.1), 20, '#F0A03C');
      b.genes.forEach((gene, row) => {
        [...gene].forEach((kind, i) => glyph(g, kind, x + (i - 1) * 0.65, y + 2 + row * 0.65, 0.24));
      });
    }
    const part = stagePart() ?? 0;
    if (part > 0) {
      g.beginPath();
      g.arc(CORE.x + 0.5, CORE.y + 0.5, 1.05 + G.stage * 0.22, -Math.PI / 2, -Math.PI / 2 + part * Math.PI * 2);
      g.strokeStyle = '#B7F34A';
      g.lineWidth = 0.14;
      g.stroke();
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
      for (const e of G.enemies.map(creatureAt)) {
        if (!inSight(e.x, e.y)) continue;
        const pack = packs.find((p) => p.e.gene === e.gene && Math.abs(p.e.x - e.x) < 0.8 && Math.abs(p.e.y - e.y) < 0.6);
        if (pack) pack.n++;
        else packs.push({ e, n: 1 });
      }
      for (const { e, n } of packs) {
        const y = up(e.y, 0.95 + terrain.height(e.x, e.y));
        rect(g, e.x - 0.4, y - 0.16, 0.8, 0.32, '#05090BCC');
        [...e.gene].forEach((kind, i) => glyph(g, kind, e.x + (i - 1) * 0.24, y, 0.11));
        rect(g, e.x - 0.4, y - 0.26, 0.8 * Math.max(0, e.hp / e.max), 0.08, '#FF6B6B');
        if (n > 1) label(`×${n}`, e.x + 0.75, y, 15, '#FFD0D0');
      }
    }
    for (const d of G.drones) {
      const pose = dronePose(d);
      if (!pose.goal || pose.w >= 0.5) continue;
      g.beginPath();
      g.moveTo(pose.x, up(pose.y, pose.h));
      g.lineTo(pose.goal.x, pose.goal.y);
      g.strokeStyle = '#55D6E8AA';
      g.lineWidth = px;
      g.setLineDash([0.3, 0.3]);
      g.lineDashOffset = -motionTime() % 0.6;
      g.stroke();
      g.lineDashOffset = 0;
      g.setLineDash([]);
    }
    // Waiting for a drone to take it down.
    const marked = [...Object.values(G.cells), ...Object.values(G.ruins)].filter((c) => c.out != null);
    g.setLineDash([0.14, 0.1]);
    for (const c of marked) rect(g, c.x + 0.06, c.y + 0.06, sizeOf(c) - 0.12, sizeOf(c) - 0.12, null, '#FF6B6B');
    for (const c of Object.values(G.cells)) {
      const to = c.veinOut != null && c.to && G.cells[c.to];
      if (!to) continue;
      g.beginPath();
      g.moveTo(c.x + 0.5, c.y + 0.5);
      g.lineTo(to.x + 0.5, to.y + 0.5);
      g.strokeStyle = '#FF6B6B';
      g.lineWidth = 0.12;
      g.stroke();
    }
    g.setLineDash([]);
    for (const w of G.worms) {
      if (w.out == null) continue;
      const [wx, wy] = w.path[0].split(',').map(Number);
      circle(g, wx + 0.5, wy + 0.5, 0.62, null, '#FF6B6B', 0.06);
    }
    sceneSigns(g);
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
    drawPreview(g, true);
    g.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
    for (const e of G.enemies) if (inSight(e.x, e.y)) marker(e.x, e.y, '#FF6B6B');
    for (const b of G.breaches) if (b.state === 'wake' && known(b.x, b.y)) marker(b.x + 0.5, b.y + 0.5, '#F0A03C');
    marker(CORE.x + 0.5, CORE.y + 0.5, '#B7F34A');
    if (bend.k) layBent(s * tilt);
  }
  const flat = { canvas: document.createElement('canvas'), lift: 0 };
  flat.ctx = flat.canvas.getContext('2d');
  // Every transform set on the flat drawing is moved down by the margin, the screen-space ones included.
  flat.raw = flat.ctx.setTransform.bind(flat.ctx);
  flat.ctx.setTransform = (a, b, c, d, e, f) => flat.raw(a, b, c, d, e, f + flat.lift);
  // The flat read-outs laid on the bent ground through a mesh of small triangles: each screen point shows the flat
  // drawing of the cell under it. A point only moves down the screen, so x stays and only y is looked up.
  function layBent(S) {
    const W = canvas.width, H = canvas.height, s = cam.zoom * view.dpr, cols = 14, rows = 12;
    const src = [];
    for (let j = 0; j <= rows; j++) for (let i = 0; i <= cols; i++) {
      const u = (W * i) / cols, v = (H * j) / rows, x = cam.x + (u - W / 2) / s;
      src.push([u, v, flat.lift + H / 2 + (groundRow(x, cam.y + (v - H / 2) / S) - cam.y) * S]);
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const tri = (a, b, c) => {
      // The affine map from the flat triangle (u, sv) to the screen one (u, v); x is the same in both.
      const [ax, ay, as] = a, [bx, by, bs] = b, [cx, cy, cs] = c;
      const det = (bx - ax) * (cs - as) - (cx - ax) * (bs - as);
      if (Math.abs(det) < 1e-6) return;
      const m21 = ((by - ay) * (cs - as) - (cy - ay) * (bs - as)) / det, m22 = ((bx - ax) * (cy - ay) - (cx - ax) * (by - ay)) / det;
      const gx = (ax + bx + cx) / 3, gy = (ay + by + cy) / 3, grow = (px, py) => [px + Math.sign(px - gx) * 0.6, py + Math.sign(py - gy) * 0.6];
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(...grow(ax, ay)); ctx.lineTo(...grow(bx, by)); ctx.lineTo(...grow(cx, cy)); ctx.closePath();
      ctx.clip();
      ctx.setTransform(1, m21, 0, m22, 0, ay - m21 * ax - m22 * as);
      ctx.drawImage(flat.canvas, 0, 0);
      ctx.restore();
    };
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const at = (di, dj) => src[(j + dj) * (cols + 1) + i + di];
      tri(at(0, 0), at(1, 0), at(1, 1));
      tri(at(0, 0), at(1, 1), at(0, 1));
    }
  }

  let width = 0;
  let height = 0;
  return {
    // Milliseconds, or null where the browser cannot measure it.
    gpu() { const c = timing?.gpuFrameTimeCounter; return c?.count ? c.lastSecAverage * 1e-6 : null; },
    tilt,
    ground: terrain.groundAt,
    // Where the camera shows a point of the ground, bent as the shader bends it: tests hold the cursor to it.
    project(x, y) {
      const v = B.Vector3.Project(new B.Vector3(x, terrain.height(x, y) - dropAt(x, y), -y), B.Matrix.IdentityReadOnly, scene.getTransformMatrix(), new B.Viewport(0, 0, view.w, view.h));
      return { x: v.x, y: v.y };
    },
    // A tap on the top of a tall object means that object, though the ground behind it is another cell.
    pick(point) {
      const p = worldAt(point.x, point.y);
      p.y = groundRow(p.x, p.y);
      const x = Math.floor(p.x);
      for (const h of [0.75, 0.5, 0.3]) {
        const y = Math.floor(p.y + h * lean);
        const c = cellAt(x, y);
        if (c && !isBelt(c) && c.type !== 'bridge' && y !== Math.floor(p.y) && !cellAt(x, Math.floor(p.y))) return { x, y };
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
      Object.assign(bend, { cx: cam.x, cy: cam.y, hw: halfW, hh: halfH / tilt, k: MAXK * Math.max(0, Math.min(1, Number(window.curve3d) || 0)) });
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
      // Rows past the top still show where the ground falls most, in the corners.
      const kl = bend.k * lean;
      const above = kl ? Math.ceil(((1 - Math.sqrt(Math.max(0, 1 - 4 * kl * (1 + kl * SIDE * SIDE)))) / (2 * kl) - 1) * bend.hh) + 1 : 0;
      const area = { x0: Math.floor(a.x) - 1, y0: Math.floor(a.y) - 2 - above, x1: Math.ceil(b.x) + 1, y1: Math.ceil(b.y) + 2 };
      heartbeat();
      terrain.update(area);
      terrain.draw(add, area, G.time + owed);
      models.draw(add, area);
      flush();
      // Framed as Babylon's own loop does, so its GPU timer sees each frame.
      engine.beginFrame();
      scene.render();
      engine.endFrame();
      drawOverlay(area);
    },
    dispose() {
      scene.dispose();
      engine.dispose();
    },
  };
};
