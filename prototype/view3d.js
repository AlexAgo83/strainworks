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

  // ---- A small planet: past the middle of the screen the ground falls away, more the further out.
  // Pieces drop whole (their matrices, so glow and shadows follow); the ground meshes bend in their shader.
  const CURVES = { none: 0, soft: 0.22, strong: 0.55 };
  const bend = { cx: 0, cy: 0, hw: 1, hh: 1, k: 0 };
  const dropAt = (x, y) => {
    if (!bend.k) return 0;
    const n = Math.max(0, Math.hypot((x - bend.cx) / bend.hw, (y - bend.cy) / bend.hh) - 0.45);
    return bend.k * n * n * bend.hh;
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
          float bendN = max(0.0, length(vec2((worldPos.x - bendView.x) / bendView.z, (-worldPos.z - bendView.y) / bendView.w)) - 0.45);
          worldPos.y -= bendK * bendN * bendN * bendView.w;
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
    B.Matrix.ComposeToRef(size.set(sx, sy, sz), turn, spot.set(x, (add.plane ? h : h + terrain.height(x, y)) - dropAt(x, y), -y), matrix);
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
    const s = cam.zoom * view.dpr;
    const g = ctx;
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
    const want = STAGES[G.stage];
    const part = !want ? 0 : want.rate ? G.held / want.hold : G.fed / want.count;
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
  }

  let width = 0;
  let height = 0;
  return {
    // Milliseconds, or null where the browser cannot measure it.
    gpu() { const c = timing?.gpuFrameTimeCounter; return c?.count ? c.lastSecAverage * 1e-6 : null; },
    tilt,
    ground: terrain.groundAt,
    // A tap on the top of a tall object means that object, though the ground behind it is another cell.
    pick(point) {
      const p = worldAt(point.x, point.y);
      for (let i = 0, y = p.y; i < 4; i++) p.y = y - dropAt(p.x, p.y) * lean;
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
      Object.assign(bend, { cx: cam.x, cy: cam.y, hw: halfW, hh: halfH / tilt, k: CURVES[window.curve3d] || 0 });
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
      const above = Math.ceil(bend.k * bend.hh * 1.2);
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
