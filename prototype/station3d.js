// The orbital station of the opening screen, live: a city disc crowned with towers, a turning ring, a tapered
// stem with its tether to the planet, shuttles coming and going. It only draws; nothing of the game reads it.
window.createStation3D = (canvas, { still = false } = {}) => {
  const B = window.BABYLON;
  const M = B.MeshBuilder;
  const V = (x, y, z) => new B.Vector3(x, y, z);
  const TAU = Math.PI * 2;
  const engine = new B.Engine(canvas, true, { alpha: true, premultipliedAlpha: false, stencil: true }, false);
  engine.setHardwareScalingLevel(1 / Math.min(1.5, window.devicePixelRatio || 1));
  const scene = new B.Scene(engine);
  scene.clearColor = new B.Color4(0, 0, 0, 0);
  scene.skipPointerMovePicking = true;
  const camera = new B.ArcRotateCamera('camera', -1.05, 1.2, 46, V(0, -2.6, 0), scene);
  camera.fov = 0.72;
  const film = scene.imageProcessingConfiguration;
  film.toneMappingEnabled = true;
  film.toneMappingType = B.ImageProcessingConfiguration.TONEMAPPING_ACES;
  film.exposure = 1.05;
  film.contrast = 1.3;
  const sun = new B.DirectionalLight('sun', V(0.7, -0.45, 0.55), scene);
  sun.diffuse = B.Color3.FromHexString('#FFE2BC');
  sun.intensity = 1.5;
  const rim = new B.DirectionalLight('rim', V(-0.5, 0.15, -1), scene);
  rim.diffuse = B.Color3.FromHexString('#66D9EA');
  rim.intensity = 1.1;
  const sky = new B.HemisphericLight('sky', V(0, 1, 0), scene);
  sky.diffuse = B.Color3.FromHexString('#3C6C78');
  sky.groundColor = B.Color3.FromHexString('#2A1018');
  sky.intensity = 0.35;

  let seed = 29;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const paints = {};
  function paint(colour, emit = 0, spec = 0.3) {
    const id = colour + emit + spec;
    if (paints[id]) return paints[id];
    const m = new B.StandardMaterial(id, scene);
    m.diffuseColor = B.Color3.FromHexString(colour);
    m.emissiveColor = B.Color3.FromHexString(colour).scale(emit);
    m.specularColor = new B.Color3(spec, spec, spec * 1.05);
    m.specularPower = 48;
    paints[id] = m;
    return m;
  }
  const hull = paint('#5A6468'), light = paint('#7E898C'), dark = paint('#262D30'), brass = paint('#8C7A4A', 0, 0.5);
  const olive = paint('#4F5744'), hazard = paint('#D4A92A', 0.05);
  const glass = paint('#9FE6F0', 1.1), warm = paint('#F0B05C', 1.0), red = paint('#FF3F52', 1.2), green = paint('#5CF08A', 1.2);
  const thrust = paint('#8FDCFF', 1.6), flesh = paint('#4E1B28', 0.05), pink = paint('#E8738A', 0.6), cyan = paint('#66E4F5', 1.2);
  // Lights that blink are their own materials, so one value drives them all.
  const blink = paint('#FF5060', 1.2, 0).clone('blink'), beacon = paint('#9FE6F0', 1.2, 0).clone('beacon');

  const root = new B.TransformNode('station', scene);
  const put = (mesh, material, at = [0, 0, 0], turn = [0, 0, 0], parent = root) => {
    mesh.material = material;
    mesh.position.copyFromFloats(...at);
    mesh.rotation.copyFromFloats(...turn);
    mesh.parent = parent;
    return mesh;
  };
  const box = (w, h, d, m, at, turn, parent) => put(M.CreateBox('b', { width: w, height: h, depth: d }, scene), m, at, turn, parent);
  const cyl = (h, top, bottom, m, at, turn, tess = 24, parent) => put(M.CreateCylinder('c', { height: h, diameterTop: top, diameterBottom: bottom, tessellation: tess }, scene), m, at, turn, parent);
  const ball = (d, m, at, parent) => put(M.CreateSphere('s', { diameter: d, segments: 10 }, scene), m, at, [0, 0, 0], parent);
  const around = (n, f) => { for (let i = 0; i < n; i++) f((i / n) * TAU, i); };

  // ---- The city disc: terraces, ribs, rows of windows, docks on the rim.
  const disc = new B.TransformNode('disc', scene);
  disc.parent = root;
  disc.position.y = 2.2;
  cyl(0.9, 15.2, 14.4, hull, [0, 0, 0], [0, 0, 0], 72, disc);
  cyl(0.12, 15.5, 15.5, dark, [0, 0.42, 0], [0, 0, 0], 72, disc);
  cyl(0.55, 11.4, 12.6, light, [0, 0.7, 0], [0, 0, 0], 64, disc);
  cyl(0.5, 8.2, 9.2, hull, [0, 1.2, 0], [0, 0, 0], 56, disc);
  cyl(0.6, 4.6, 6.2, olive, [0, 1.7, 0], [0, 0, 0], 40, disc);
  cyl(1.6, 9.6, 5.0, dark, [0, -1.2, 0], [0, 0, 0], 48, disc);
  around(48, (a, i) => {
    const r = 7.05;
    box(0.16, 0.95, 0.6, i % 2 ? dark : light, [Math.cos(a) * r, 0.05, Math.sin(a) * r], [0, -a, 0], disc);
    if (i % 2 === 0) box(0.05, 0.12, 0.42, i % 6 === 0 ? warm : glass, [Math.cos(a) * 7.42, 0.12, Math.sin(a) * 7.42], [0, -a, 0], disc);
    // Ribs over the terraces.
    if (i % 3 === 0) box(2.3, 0.14, 0.12, brass, [Math.cos(a) * 5.4, 0.98, Math.sin(a) * 5.4], [0, -a, 0], disc);
    if (i % 4 === 1) box(0.4, 0.22 + rnd() * 0.3, 0.3, rnd() < 0.5 ? hull : light, [Math.cos(a) * 4.3, 1.5, Math.sin(a) * 4.3], [0, -a, 0], disc);
  });
  around(90, (a, i) => box(0.12, 0.07, 0.04, i % 9 === 4 ? warm : glass, [Math.cos(a) * 5.95, 0.72, Math.sin(a) * 5.95], [0, -a, 0], disc));
  around(70, (a, i) => box(0.12, 0.07, 0.04, i % 7 === 2 ? warm : glass, [Math.cos(a) * 4.35, 1.22, Math.sin(a) * 4.35], [0, -a, 0], disc));
  // Docks: four arms on the rim with a berth each, hazard stripes at the mouth.
  const docks = [];
  around(4, (a, i) => {
    const arm = new B.TransformNode('dock', scene);
    arm.parent = disc;
    arm.rotation.y = -a + 0.4;
    box(3.2, 0.32, 0.9, hull, [8.6, 0, 0], [0, 0, 0], arm);
    box(3.2, 0.06, 0.06, light, [8.6, 0.2, 0.42], [0, 0, 0], arm);
    box(1.0, 0.9, 1.4, light, [10.4, 0, 0], [0, 0, 0], arm);
    for (let s = 0; s < 6; s++) box(0.04, 0.16, 0.24, s % 2 ? hazard : dark, [10.92, -0.2 + s * 0.1, 0], [0, 0, 0.7], arm);
    box(0.06, 0.5, 0.9, warm, [10.92, 0.02, 0], [0, 0, 0], arm);
    ball(0.16, i % 2 ? green : red, [10.4, 0.55, 0], arm);
    docks.push(arm);
  });

  // ---- The crown: towers of different heights, lit in strips, beacons on top.
  const towers = [[0, 0, 0.9, 5.2], [1.3, 0.3, 0.6, 3.6], [-1.1, 0.8, 0.55, 4.1], [0.3, -1.4, 0.6, 3.2], [-0.6, -1.0, 0.45, 2.6], [1.6, -0.9, 0.4, 2.4], [-1.6, -0.2, 0.42, 3.0], [0.5, 1.5, 0.4, 2.2]];
  towers.forEach(([x, z, w, h], i) => {
    const base = 2.0;
    box(w, h, w * 0.9, i % 3 ? hull : light, [x, base + h / 2, z], [0, i * 0.4, 0], disc);
    box(w * 0.75, h * 0.25, w * 0.7, dark, [x, base + h + h * 0.12, z], [0, i * 0.4, 0], disc);
    for (let k = 0; k < Math.floor(h * 2.2); k++) box(w * 1.02, 0.05, w * 0.92, k % 5 === 2 ? warm : glass, [x, base + 0.3 + k * 0.42, z], [0, i * 0.4, 0], disc);
    box(0.05, 0.9 + (i % 3) * 0.4, 0.05, light, [x, base + h * 1.25 + 0.5, z], [0, 0, 0], disc);
    ball(0.13, i % 2 ? blink : beacon, [x, base + h * 1.25 + 1 + (i % 3) * 0.2, z], disc);
  });

  // ---- The ring that turns under the disc, in segments.
  const ring = new B.TransformNode('ring', scene);
  ring.parent = root;
  ring.position.y = 0.4;
  ring.rotation.x = 0.08;
  around(36, (a, i) => {
    const r = 9.6;
    box(0.9, 0.55, (TAU * r) / 36 * 0.82, i % 6 ? hull : olive, [Math.cos(a) * r, 0, Math.sin(a) * r], [0, -a, 0], ring);
    box(0.92, 0.05, (TAU * r) / 36 * 0.5, i % 4 ? glass : warm, [Math.cos(a) * r, 0.12, Math.sin(a) * r], [0, -a, 0], ring);
    if (i % 9 === 0) box(0.12, 0.12, r * 0.7, dark, [Math.cos(a) * r * 0.62, 0.3, Math.sin(a) * r * 0.62], [0, -a + Math.PI / 2, 0], ring);
  });

  // ---- The stem: tapered, four flared fins, a tether to the planet.
  const profile = [[2.4, 0], [2.6, -0.6], [2.2, -2.4], [1.5, -4.6], [1.0, -6.8], [0.62, -8.8], [0.3, -10.2], [0.12, -11]].map(([r, y]) => V(r, y, 0));
  put(M.CreateLathe('stem', { shape: profile, tessellation: 40, cap: B.Mesh.CAP_ALL }, scene), dark, [0, 1.0, 0]);
  around(4, (a) => {
    const fin = new B.TransformNode('fin', scene);
    fin.parent = root;
    fin.rotation.y = a + Math.PI / 4;
    box(0.28, 6.6, 1.6, dark, [2.3, -2.6, 0], [0, 0, 0.32], fin);
    box(0.3, 6.6, 0.08, hull, [2.35, -2.6, 0.8], [0, 0, 0.32], fin);
    for (let k = 0; k < 8; k++) box(0.32, 0.05, 0.9, k % 3 ? glass : warm, [2.3 - k * 0.12, -0.4 - k * 0.65, 0], [0, 0, 0.32], fin);
  });
  around(30, (a, i) => box(0.1, 0.06, 0.04, i % 5 ? glass : warm, [Math.cos(a) * 2.05, -1.4, Math.sin(a) * 2.05], [0, -a, 0]));
  cyl(14, 0.07, 0.07, light, [0, -17, 0], [0, 0, 0], 8);
  const pulses = [];
  for (let i = 0; i < 4; i++) pulses.push(ball(0.22, cyan, [0, -11 - i * 3.5, 0]));
  // What came up the tether: biomass gripping the lower stem.
  around(9, (a, i) => {
    const r = 0.75 + (i % 3) * 0.08;
    const path = [[0.2, -10.6], [r * 0.9, -9], [r * 1.25, -7.6], [r * 1.5, -6.4 - (i % 2) * 0.5]].map(([rr, y], k) => V(Math.cos(a + k * 0.25) * rr, y + 1.0, Math.sin(a + k * 0.25) * rr));
    const tube = M.CreateTube('vine', { path: B.Curve3.CreateCatmullRomSpline(path, 10, false).getPoints(), tessellation: 8, radiusFunction: (k, d) => 0.09 * (1 - d / 12) + 0.02 }, scene);
    put(tube, flesh, [0, 0, 0], [0, 0, 0]);
    if (i % 2 === 0) ball(0.22, pink, [path[2].x * 1.08, path[2].y, path[2].z * 1.08]);
  });

  // ---- The projector, on a fixed arm of the stem, toward the planet.
  const lensAt = V(-4.2, -1.9, 2.2);
  const armPath = [V(-1.3, -1.4, 0.9), V(-2.8, -1.6, 1.7), lensAt];
  put(M.CreateTube('arm', { path: B.Curve3.CreateCatmullRomSpline(armPath, 8, false).getPoints(), radius: 0.18, tessellation: 10 }, scene), light, [0, 0, 0], [0, 0, 0]);
  cyl(0.55, 1.5, 0.4, dark, [lensAt.x + 0.15, lensAt.y, lensAt.z + 0.1], [0, 0, 1.25]);
  put(M.CreateTorus('lens', { diameter: 1.2, thickness: 0.1, tessellation: 28 }, scene), cyan, [lensAt.x - 0.05, lensAt.y, lensAt.z], [0, 0, 1.25]);
  ball(0.45, cyan, [lensAt.x - 0.08, lensAt.y, lensAt.z]);

  // ---- Shuttles: a blunt hull, a cockpit, two engines, each on its own loop to a dock.
  const shuttles = [];
  for (let i = 0; i < 3; i++) {
    const s = new B.TransformNode('shuttle', scene);
    s.parent = root;
    box(0.9, 0.26, 0.42, i % 2 ? olive : light, [0, 0, 0], [0, 0, 0], s);
    box(0.35, 0.18, 0.34, dark, [0.42, 0.08, 0], [0, 0, 0.3], s);
    box(0.2, 0.05, 0.3, glass, [0.5, 0.15, 0], [0, 0, 0.3], s);
    for (const z of [-0.14, 0.14]) {
      cyl(0.22, 0.12, 0.16, dark, [-0.52, 0, z], [0, 0, Math.PI / 2], 10, s);
      const flame = cyl(0.5, 0.0, 0.14, thrust, [-0.85, 0, z], [0, 0, Math.PI / 2], 10, s);
      flame.visibility = 0.85;
    }
    shuttles.push(s);
  }

  const glow = new B.GlowLayer('glow', scene, { mainTextureFixedSize: 512, blurKernelSize: 32 });
  glow.intensity = 0.75;
  root.rotation.z = 0.05;

  let time = 0;
  function animate(dt) {
    time += dt;
    disc.rotation.y = time * 0.03;
    ring.rotation.y = -time * 0.12;
    const on = (Math.sin(time * 3.4) > 0.55) ? 1.4 : 0.15;
    blink.emissiveColor = B.Color3.FromHexString('#FF5060').scale(on);
    beacon.emissiveColor = B.Color3.FromHexString('#9FE6F0').scale(0.5 + 0.7 * (0.5 + 0.5 * Math.sin(time * 1.7)));
    pulses.forEach((p, i) => {
      const k = ((time * 0.22 + i / pulses.length) % 1);
      p.position.y = -10.4 - k * 13;
      p.scaling.setAll(1 - k * 0.6);
    });
    shuttles.forEach((s, i) => {
      // Out from a dock, round in a wide loop, back in.
      const k = (time * (0.05 + i * 0.012) + i / 3) % 1, a = k * TAU;
      const R = 13 + i * 2.2, y = 2.2 + Math.sin(a * 2 + i) * 1.6 - i * 1.4;
      s.position.set(Math.cos(a + i * 2) * R, y, Math.sin(a + i * 2) * R * 0.75);
      s.rotation.y = -(a + i * 2) - Math.PI / 2;
      s.rotation.z = Math.sin(a * 2 + i) * 0.15;
    });
  }

  return {
    engine, scene,
    // Where the lens is on the canvas, in its pixels: the beam leaves from there.
    lens() {
      const p = B.Vector3.Project(lensAt, root.getWorldMatrix(), scene.getTransformMatrix(), camera.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight()));
      return [p.x / engine.getRenderWidth(), p.y / engine.getRenderHeight()];
    },
    draw(dt) {
      if (!still) animate(dt);
      scene.render();
    },
    resize() { engine.resize(); },
    dispose() { scene.dispose(); engine.dispose(); },
  };
};
