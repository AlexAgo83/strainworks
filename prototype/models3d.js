// Every 3D model of the prototype. A model is a few custom unit shapes, instanced many times.
// Steel is angular and cold, living matter is lumpy, wet and lit from inside.
// Like view3d.js, this file only reads the game state.
window.createModels3D = (B, scene) => {
  const M = B.MeshBuilder;
  const TAU = Math.PI * 2;
  const LYING = -Math.PI / 2;
  const noise = (a, b) => Math.abs(Math.sin(a * 12.9898 + b * 78.233) * 43758.5453) % 1;

  // ---- Custom shapes, all one unit across
  function reshape(mesh, move, flat) {
    const points = mesh.getVerticesData(B.VertexBuffer.PositionKind);
    for (let i = 0; i < points.length; i += 3) {
      const [x, y, z] = move(points[i], points[i + 1], points[i + 2]);
      points[i] = x;
      points[i + 1] = y;
      points[i + 2] = z;
    }
    mesh.setVerticesData(B.VertexBuffer.PositionKind, points, true);
    if (flat) mesh.convertToFlatShadedMesh();
    else mesh.createNormals(true);
    return mesh;
  }
  function hull() {
    const low = M.CreateCylinder('low', { height: 0.78, diameter: 1, tessellation: 8 }, scene);
    const high = M.CreateCylinder('high', { height: 0.22, diameterBottom: 1, diameterTop: 0.78, tessellation: 8 }, scene);
    low.position.y = -0.11;
    high.position.y = 0.39;
    const mesh = B.Mesh.MergeMeshes([low, high], true);
    mesh.rotation.y = Math.PI / 8;
    mesh.bakeCurrentTransformIntoVertices();
    // An octagon pushed out into a square with cut corners.
    const square = (x, y, z) => {
      const r = Math.hypot(x, z);
      if (r < 1e-3) return [x, y, z];
      const wide = r / 0.5;
      const major = (v) => Math.sign(v) * wide * 0.5;
      const minor = (v) => Math.sign(v) * wide * 0.34;
      return Math.abs(x) > Math.abs(z) ? [major(x), y, minor(z)] : [minor(x), y, major(z)];
    };
    return reshape(mesh, square, true);
  }
  function curved(points, radius, sides = 5) {
    const path = points.map(([x, y]) => new B.Vector3(x, y, 0));
    return M.CreateTube('curved', { path, tessellation: sides, cap: B.Mesh.CAP_ALL, radiusFunction: (i) => radius(i / (path.length - 1)) }, scene);
  }
  function merged(...meshes) {
    return B.Mesh.MergeMeshes(meshes, true);
  }
  const SHAPES = {
    box: () => M.CreateBox('box', { size: 1 }, scene),
    hull,
    tube: () => M.CreateCylinder('tube', { height: 1, diameter: 1, tessellation: 8 }, scene),
    taper: () => M.CreateCylinder('taper', { height: 1, diameterBottom: 1, diameterTop: 0.55, tessellation: 6 }, scene),
    skirt: () => M.CreateCylinder('skirt', { height: 1, diameterBottom: 1, diameterTop: 0.76, tessellation: 8 }, scene).convertToFlatShadedMesh(),
    cone: () => M.CreateCylinder('cone', { height: 1, diameterBottom: 1, diameterTop: 0, tessellation: 8 }, scene),
    // A flat arrowhead along +x.
    arrow() {
      const m = M.CreateCylinder('arrow', { height: 1, diameter: 1, tessellation: 3 }, scene).convertToFlatShadedMesh();
      m.scaling.z = 1.15;
      m.bakeCurrentTransformIntoVertices();
      return m;
    },
    ring: () => M.CreateTorus('ring', { diameter: 1, thickness: 0.1, tessellation: 14 }, scene),
    // A wave across the ground: thin enough to stay a line when it is 70 cells wide.
    wave: () => M.CreateTorus('wave', { diameter: 1, thickness: 0.0035, tessellation: 96 }, scene),
    lip: () => reshape(M.CreateTorus('lip', { diameter: 1, thickness: 0.28, tessellation: 14 }, scene), (x, y, z) => {
      const swell = 1 + Math.sin(Math.atan2(z, x) * 7) * 0.07;
      return [x * swell, y * swell, z * swell];
    }),
    bead: () => M.CreateIcoSphere('bead', { radius: 0.5, subdivisions: 1, flat: false }, scene),
    ball: () => M.CreateSphere('ball', { diameter: 1, segments: 8 }, scene),
    sac: () => reshape(M.CreateSphere('sac', { diameter: 1, segments: 7 }, scene), (x, y, z) => {
      const bump = 1 + Math.sin(x * 11 + y * 3) * Math.sin(z * 12 - y * 2) * 0.09;
      return [x * bump, y * (y < 0 ? 0.8 : 1) * bump, z * bump];
    }),
    dome: () => M.CreateSphere('dome', { diameter: 1, segments: 7, slice: 0.5 }, scene),
    // An armour plate along +x: ridge on top, pointed at the back, serrated edge.
    shell: () => reshape(M.CreateSphere('shell', { diameter: 1, segments: 7, slice: 0.5 }, scene), (x, y, z) => {
      const ridge = Math.max(0, 1 - Math.abs(z) * 5) * 0.12;
      const back = x < 0 ? 1 + x * 0.7 : 1;
      const teeth = 1 + Math.sin(Math.atan2(z, x) * 9) * 0.06 * (1 - y * 2);
      return [x * teeth, y + ridge * y * 2, z * back * teeth];
    }, true),
    rock: () => reshape(M.CreateIcoSphere('rock', { radius: 0.5, subdivisions: 1, flat: true }, scene), (x, y, z) => {
      const k = 0.78 + noise(Math.round(x * 20), Math.round(y * 20) + Math.round(z * 20) * 7) * 0.4;
      return [x * k, y * k, z * k];
    }, true),
    crystal() {
      const shaft = M.CreateCylinder('shaft', { height: 0.65, diameterBottom: 0.7, diameterTop: 1, tessellation: 5 }, scene);
      const tip = M.CreateCylinder('tip', { height: 0.35, diameterBottom: 1, diameterTop: 0, tessellation: 5 }, scene);
      shaft.position.y = -0.175;
      tip.position.y = 0.325;
      return merged(shaft, tip).convertToFlatShadedMesh();
    },
    // Rises from its root and hooks towards +x.
    horn: () => curved([[0, 0], [-0.05, 0.28], [-0.01, 0.56], [0.12, 0.8], [0.36, 1]], (t) => 0.16 * (1 - t) + 0.012),
    // Half a hoop in the vertical plane of +x.
    arch: () => curved(Array.from({ length: 8 }, (_, i) => [Math.cos((i / 7) * Math.PI) * 0.5, Math.sin((i / 7) * Math.PI) * 0.5]), () => 0.055),
    gear() {
      const parts = [M.CreateCylinder('hub', { height: 1, diameter: 0.78, tessellation: 16 }, scene)];
      for (let i = 0; i < 8; i++) {
        const tooth = M.CreateBox('tooth', { width: 0.2, height: 1, depth: 0.16 }, scene);
        tooth.position.set(Math.cos((i / 8) * TAU) * 0.42, 0, -Math.sin((i / 8) * TAU) * 0.42);
        tooth.rotation.y = (i / 8) * TAU;
        parts.push(tooth);
      }
      return merged(...parts).convertToFlatShadedMesh();
    },
    stain: () => reshape(M.CreateCylinder('stain', { height: 1, diameter: 1, tessellation: 16 }, scene), (x, y, z) => {
      const k = 0.86 + Math.sin(Math.atan2(z, x) * 5) * 0.08 + Math.sin(Math.atan2(z, x) * 9) * 0.06;
      return [x * k, y, z * k];
    }),
  };

  // [colour, light it gives off, opacity, shine]
  const PAINT = {
    steel: ['#3A535B', 0, 1, 0.55], steel2: ['#587078', 0, 1, 0.6], dark: ['#141F23', 0, 1, 0.3], black: ['#070B0D', 0, 1, 0.2],
    chrome: ['#93AAB0', 0, 1, 0.9], copper: ['#9C5E36', 0.03, 1, 0.8], hazard: ['#C9952F', 0.06, 1, 0.35], rubber: ['#172327', 0, 1, 0.1],
    rail: ['#49666F', 0, 1, 0.55], slat: ['#24343A', 0, 1, 0.25], stone: ['#5C5547', 0, 1, 0.15], stone2: ['#777061', 0, 1, 0.2],
    cyan: ['#3FC6DC', 0.65, 1, 0.3], acid: ['#9FDC3C', 0.5, 1, 0.3], alarm: ['#FF3F52', 0.7, 1, 0.3], amber: ['#F0A03C', 0.55, 1, 0.3],
    lime: ['#3FE25A', 0.75, 1, 0.3], pale: ['#BFEFF5', 0.55, 1, 0.3], off: ['#273033', 0, 1, 0.3],
    glass: ['#8FE3EF', 0.06, 0.2, 1], membraneGlass: ['#B9E88A', 0.06, 0.32, 1],
    S: ['#69AE32', 0.28, 1, 0.7], S2: ['#B9EC7C', 0.35, 1, 0.7], F: ['#C9741F', 0.22, 1, 0.45], F2: ['#FFC06B', 0.3, 1, 0.4],
    C: ['#BFAF8E', 0.08, 1, 0.85], C2: ['#F3E6C8', 0.12, 1, 0.9], N: ['#36AFC6', 0.5, 1, 0.5], N2: ['#B8F3FA', 0.6, 1, 0.5],
    K: ['#272D31', 0.05, 1, 1], K2: ['#87959D', 0.1, 1, 1], I: ['#9B4DE0', 0.55, 1, 0.4], I2: ['#E7C2FF', 0.7, 1, 0.4],
    Nsoil: ['#0C2A31', 0.06, 1, 0.4],
    flesh: ['#7C2A3D', 0.07, 1, 0.9], flesh2: ['#A8485C', 0.12, 1, 0.9], pink: ['#E8738A', 0.28, 1, 0.8],
    gore: ['#32151C', 0.02, 1, 0.8], chitin: ['#241319', 0.02, 1, 1], bone: ['#A89C84', 0.03, 1, 0.5],
    skin: ['#22401D', 0.03, 1, 0.7], skin2: ['#366426', 0.07, 1, 0.8], sprout: ['#5E9E2B', 0.22, 1, 0.8],
    sleep: ['#302B29', 0.02, 1, 0.3], sleep2: ['#4C3D3C', 0.03, 1, 0.3], wreck: ['#231E1D', 0, 1, 0.15], ember: ['#FF6A3C', 0.8, 1, 0.2],
    infected: ['#4A1420', 0.08, 0.45, 0.2], husk: ['#15191A', 0, 0.45, 0.05], smoke: ['#59605F', 0, 0.22, 0],
    site: ['#55D6E8', 0.25, 0.26, 0.1], scrap: ['#FF5A5A', 0.25, 0.28, 0.1], holo: ['#55D6E8', 0.6, 0.7, 0.1], scent: ['#9FDC3C', 0.45, 0.75, 0.1],
  };
  Object.assign(PAINT, { rail2: ['#D88C2C', 0.22, 1, 0.5], rail3: ['#A45CF0', 0.35, 1, 0.5] });
  // Instances share their material, so a fade is a set of opacities to step through.
  const FADE = 16;
  for (let i = 1; i <= FADE; i++) PAINT[`chevron${i}`] = ['#7FA0A8', 0.05, (i / FADE) * 0.95, 0.15];
  // Only what has some bulk casts a shadow.
  const CASTERS = new Set(['hull', 'skirt', 'sac', 'shell', 'rock', 'crystal', 'horn', 'ball', 'taper', 'dome', 'gear']);

  // ---- Helpers. Angles are game angles: 0 east, clockwise. "side" is to the right of "forward".
  let add = null;
  let fine = true; // close enough for the small parts
  let clock = 0;
  const facing = (dir) => Math.atan2(DY[dir], DX[dir]);
  const maxHp = (c) => TYPES[c.type]?.hp ?? 100;
  function from(x, y, angle, forward, side = 0) {
    return [x + Math.cos(angle) * forward - Math.sin(angle) * side, y + Math.sin(angle) * forward + Math.cos(angle) * side];
  }
  function limb(paint, ax, ay, ah, bx, by, bh, width, shape = 'tube') {
    const flat = Math.hypot(bx - ax, by - ay);
    const length = Math.hypot(flat, bh - ah);
    if (length < 0.005) return;
    add(shape, paint, (ax + bx) / 2, (ay + by) / 2, (ah + bh) / 2, width, length, width, Math.atan2(by - ay, bx - ax), LYING + Math.atan2(bh - ah, flat));
  }
  function arrow(paint, x, y, h, dir, size = 0.2) {
    add('arrow', paint, x, y, h, size, 0.035, size, facing(dir));
  }
  function nozzle(x, y, dir, h) {
    const a = facing(dir);
    const [bx, by] = from(x, y, a, 0.39);
    add('hull', 'steel2', bx, by, h, 0.2, 0.2, 0.3, a);
    add('box', 'black', bx, by, h + 0.02, 0.22, 0.1, 0.16, a);
  }
  function intake(x, y, dir, filled) {
    const a = facing(dir);
    const [px, py] = from(x, y, a, 0.4);
    add('lip', filled ? 'pink' : 'flesh', px, py, 0.28, 0.3, 0.3, 0.3, a, LYING);
    add('bead', filled ? 'flesh2' : 'black', px, py, 0.28, 0.08, 0.16, 0.16, a);
    if (!fine) return;
    for (const s of [-1, 1]) {
      const [cx, cy] = from(x, y, a, 0.36, s * 0.16);
      add('horn', 'bone', cx, cy, 0.2, 0.22, 0.22, 0.22, a);
    }
  }
  function footing(x, y, size = 0.9) {
    add('hull', 'dark', x, y, 0.07, size, 0.14, size);
    if (!fine) return;
    for (const a of [-1, 1]) for (const b of [-1, 1]) add('bead', 'chrome', x + a * size * 0.36, y + b * size * 0.36, 0.15, 0.07);
  }
  function status(x, y, h, paint, on = true) {
    add('bead', on ? paint : 'off', x, y, h, 0.09, 0.07, 0.09);
  }

  // ---- Matter
  function base(kind, x, y, h, r, angle = 0) {
    if (kind === 'S') {
      add('bead', 'S', x, y, h, r * 1.8);
      if (!fine) return;
      add('bead', 'S2', x - r * 0.25, y - r * 0.2, h + r * 0.62, r * 0.8);
      for (const turn of [0.6, 2.7, 4.6]) add('bead', 'sprout', ...from(x, y, angle + turn, r * 0.85), h, r * 0.55);
    }
    if (kind === 'F') {
      add('tube', 'F', x, y, h, r * 1.15, r * 2.1, r * 1.15, angle, LYING);
      for (const end of [-1, 1]) add('bead', 'F2', ...from(x, y, angle, end * r), h, r * 1.15);
      if (fine) add('ring', 'F2', x, y, h, r * 1.25, r * 1.3, r * 1.25, angle, LYING);
    }
    if (kind === 'C') {
      add('crystal', 'C', x, y, h, r * 1.5, r * 2.6, r * 1.2, angle, LYING);
      if (fine) add('crystal', 'C2', ...from(x, y, angle, -r * 0.35, r * 0.5), h + r * 0.25, r * 0.7, r * 1.5, r * 0.6, angle, LYING + 0.3);
    }
    if (kind === 'I') {
      add('crystal', 'I', x, y, h, r * 1.3, r * 2.6, r * 1.3, angle, 0.2);
      add('bead', 'I2', x, y, h + r * 0.4, r * 0.6);
    }
    if (kind === 'K') {
      add('hull', 'K', x, y, h, r * 2, r * 1.5, r * 1.7, angle + 0.5, 0.2);
      add('crystal', 'K2', ...from(x, y, angle, r * 0.3), h + r * 0.6, r * 0.8, r * 1.3, r * 0.7, angle, 0.5);
    }
    if (kind === 'N') {
      for (let i = 0; i < 3; i++) add('box', 'N', x, y, h, r * 2.1, r * 0.26, r * 0.26, angle + (i * Math.PI) / 3);
      if (fine) {
        for (let i = 0; i < 6; i++) add('bead', 'N2', ...from(x, y, angle + (i * Math.PI) / 3, r * 1.05), h, r * 0.36);
      }
      add('bead', 'N2', x, y, h, r * 0.85);
    }
  }
  function cargo(item, x, y, h, angle = 0, room = 0.74) {
    if (item.length === 1) return base(item, x, y, h, 0.16, angle);
    const box = boxOf(item);
    if (box) {
      // A carbon shell, its content on the lid.
      const magazine = box === 'A';
      const trim = magazine ? 'amber' : box === 'H' ? 'I' : 'cyan';
      const long = room * (box === 'H' ? 1.2 : 1.05);
      const wide = Math.min(0.4, room * 0.58);
      add('hull', 'K', x, y, h, long, 0.22, wide, angle);
      add('box', 'K2', x, y, h + 0.1, long * 0.76, 0.04, wide * 0.7, angle);
      for (const s of [-1, 1]) add('box', trim, ...from(x, y, angle, s * long * 0.4), h + 0.11, 0.05, 0.05, wide * 0.85, angle);
      if (magazine && fine) {
        for (let i = 0; i < 6; i++) add('cone', trim, ...from(x, y, angle, (i - 2.5) * long * 0.13, wide * 0.5), h + 0.06, 0.07, 0.14, 0.07, angle);
      }
      return cargo(contentOf(item), x, y, h + 0.19, angle, room * 0.7);
    }
    // First base leading, on a spine.
    const n = item.length;
    const width = Math.min(0.24, room * 0.36);
    add('tube', 'black', x, y, h - 0.06, width * 0.7, room, width * 0.7, angle, LYING);
    for (let i = 0; i < n; i++) {
      const [bx, by] = from(x, y, angle, ((n - 1) / 2 - i) * (room / n));
      base(item[i], bx, by, h + 0.04, Math.min(0.11, (room / n) * 0.42), angle);
    }
    if (!fine) return;
    for (const s of [-1, 1]) add('bead', n === 6 ? 'acid' : 'steel2', ...from(x, y, angle, (s * room) / 2), h - 0.04, width * 0.6);
    if (n === 6) add('ring', 'acid', x, y, h, width, width * 0.8, width, angle, LYING);
  }

  // Every cell shares one phase, so the chevron leaving a cell is the one entering the next: the line
  // scrolls without a seam, at the speed of what it carries. It only fades where the line starts or ends.
  function chevron(c, travel, out, h) {
    const speed = paceOf(c);
    const p = built(c) ? (clock * speed) % 1 : 0.5;
    const line = (n) => n && built(n) && (isBelt(n) || n.type === 'bridge');
    let shown = 1;
    if (p < 0.4 && !line(ahead(c, (travel + 2) % 4))) shown = p / 0.4;
    if (p > 0.6 && !line(ahead(c, out))) shown = (1 - p) / 0.4;
    const step = Math.round(shown * FADE);
    if (!step) return;
    // along() adds the frame's head start itself.
    const at = along(c, travel, out, p - owed * speed);
    add('arrow', `chevron${step}`, at.x, at.y, h, 0.17, 0.03, 0.22, at.angle);
  }
  function readingOf(c, x, y, h) {
    const net = netOf(c);
    const place = c.read || 0;
    add('tube', 'glass', x, y, h, 0.5, 0.06, 0.5);
    add('ring', 'cyan', x, y, h, 0.52);
    if (net.focus) cargo(place ? net.focus[place - 1] : net.focus, x, y, h + 0.09, Math.PI, 0.44);
    for (let i = 0; i < place; i++) add('box', 'cyan', x - 0.16 + i * 0.16, y - 0.34, h, 0.08, 0.08, 0.1);
  }

  // ---- Logistics
  function conveyor(c, x, y) {
    const rail = c.type === 'belt' ? ['rail', 'rail2', 'rail3'][rankOf(c) - 1] : 'rail';
    const fed = feeders(c).map((f) => (f.dir + 2) % 4);
    const sides = fed.length ? [...new Set(fed)] : [(c.dir + 2) % 4];
    const turning = sides.length === 1 && sides[0] % 2 !== c.dir % 2;
    if (turning) {
      // A true quarter circle, around the corner both sides share.
      const ix = x + (DX[c.dir] + DX[sides[0]]) * 0.5;
      const iy = y + (DY[c.dir] + DY[sides[0]]) * 0.5;
      const a0 = Math.atan2(y + DY[sides[0]] * 0.5 - iy, x + DX[sides[0]] * 0.5 - ix);
      let sweep = Math.atan2(y + DY[c.dir] * 0.5 - iy, x + DX[c.dir] * 0.5 - ix) - a0;
      if (sweep > Math.PI) sweep -= TAU;
      if (sweep < -Math.PI) sweep += TAU;
      const n = fine ? 7 : 3;
      for (let i = 0; i < n; i++) {
        const a = a0 + (sweep * (i + 0.5)) / n;
        const piece = (shape, paint, r, h, width, tall, long) => add(shape, paint, ...from(ix, iy, a, r), h, long, tall, width, a + Math.PI / 2);
        piece('box', 'rubber', 0.5, 0.08, 0.46, 0.13, (0.8 / n) * 1.25);
        piece('box', rail, 0.25, 0.16, 0.07, 0.12, (0.4 / n) * 1.2);
        piece('box', rail, 0.75, 0.16, 0.07, 0.12, (1.2 / n) * 1.12);
        if (fine) piece('box', 'slat', 0.5, 0.147, 0.4, 0.012, 0.03);
      }
      return sides;
    }
    const open = new Set([c.dir, ...sides]);
    add('box', 'rubber', x, y, 0.08, 0.46, 0.13, 0.46);
    for (let side = 0; side < 4; side++) {
      const a = facing(side);
      if (!open.has(side)) {
        add('box', rail, ...from(x, y, a, 0.25), 0.16, 0.07, 0.12, 0.56, a);
        continue;
      }
      add('box', 'rubber', ...from(x, y, a, 0.365), 0.08, 0.27, 0.13, 0.46, a);
      for (const s of [-1, 1]) {
        add('box', rail, ...from(x, y, a, 0.385, s * 0.25), 0.16, 0.25, 0.12, 0.07, a);
        if (fine && side === c.dir) add('hull', 'dark', ...from(x, y, a, 0.36, s * 0.32), 0.09, 0.14, 0.18, 0.1, a);
      }
    }
    if (fine) {
      const a = facing(c.dir);
      for (let i = 0; i < 4; i++) add('box', 'slat', ...from(x, y, a, -0.36 + i * 0.24), 0.148, 0.04, 0.012, 0.4, a);
    }
    return sides;
  }

  const BUILDINGS = {
    belt(c, x, y) {
      for (const side of conveyor(c, x, y)) chevron(c, (side + 2) % 4, c.dir, 0.175);
    },

    // A gantry with a two-lamp head, and an arm that drops on red.
    // The radar pylon: three legs, a mast, a dish that turns, glowing rings, and a wave across the ground.
    screen(c, x, y) {
      const a = facing(c.dir), live = built(c), gene = live ? netOf(c)?.focus || '' : '';
      const flash = live ? Math.max(0, 1 - (G.time - (c.shownAt ?? -9)) / 0.6) : 0;
      add('hull', 'dark', x, y, 0.06, 0.5, 0.12, 0.5);
      add('tube', 'steel2', x, y, 0.5, 0.1, 0.9, 0.1);
      add('hull', 'steel', x, y, 1.05, 0.9, 0.62, 0.12, a + Math.PI / 2);
      add('hull', flash > 0.3 ? 'pale' : 'black', ...from(x, y, a, 0.07), 1.05, 0.8, 0.52, 0.03, a + Math.PI / 2);
      if (gene) for (let i = 0; i < 3; i++) base(gene[i], ...from(x, y, a, 0.1, (i - 1) * 0.24), 1.05, 0.12, i);
      else if (live) add('hull', 'cyan', ...from(x, y, a, 0.1), 1.05, 0.26, 0.05, 0.03 + Math.sin(clock * 3) * 0.01, a + Math.PI / 2);
      add('ring', 'cyan', x, y, 1.42, 0.12, 0.4, 0.12);
    },
    relay(c, x, y) {
      add('hull', 'dark', x, y, 0.06, 0.5, 0.12, 0.5);
      for (let i = 0; i < 3; i++) { const a = (i / 3) * TAU + 0.3; limb('steel2', ...from(x, y, a, 0.3), 0.02, x, y, 0.5, 0.05); }
      add('tube', 'steel2', x, y, 0.8, 0.09, 1.5, 0.09);
      for (const h of [0.55, 0.85, 1.15]) add('ring', 'N', x, y, h, 0.2, 0.6, 0.2);
      const beat = built(c) ? 0.5 + 0.5 * Math.sin(clock * 4 + x) : 0;
      add('bead', 'N2', x, y, 1.62, 0.2 + beat * 0.05);
      add('ring', 'cyan', x, y, 1.62, 0.36 + beat * 0.08, 0.5, 0.36 + beat * 0.08, 0, LYING);
      for (const s of [-1, 1]) { limb('steel', x, y, 1.5, ...from(x, y, 0, s * 0.22), 1.42, 0.035); add('bead', 'cyan', ...from(x, y, 0, s * 0.22), 1.42, 0.07); }
    },
    lab(c, x, y) {
      const live = built(c);
      add('hull', 'dark', x, y, 0.1, 1.9, 0.2, 1.9);
      add('hull', 'steel', x, y, 0.3, 1.6, 0.2, 1.6);
      for (const [dx, dy] of [[-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]]) add('tube', 'steel2', x + dx, y + dy, 0.6, 0.12, 0.6, 0.12);
      add('sac', 'glass', x, y, 0.75, 1.3, 0.9, 1.3);
      add('hull', 'steel2', x, y, 0.5, 0.9, 0.1, 0.5);
      for (let i = 0; i < 5; i++) {
        const f = (i - 2) * 0.17, glow = live ? 0.5 + 0.5 * Math.sin(clock * 3 + i) : 0;
        add('tube', 'glass', x + f, y - 0.05, 0.68, 0.09, 0.28, 0.09);
        add('bead', live ? ['S', 'F', 'C', 'N', 'acid'][i] : 'off', x + f, y - 0.05, 0.62 + glow * 0.06, 0.07);
      }
      if (live) add('ring', 'acid', x, y, 1.22, 0.7 + Math.sin(clock * 2) * 0.04, 0.5, 0.7, 0, LYING);
      add('hull', 'steel2', x + 0.55, y + 0.55, 1.05, 0.5, 0.06, 0.5);
      add('ring', 'cyan', x + 0.55, y + 0.55, 1.1, 0.4, 0.4, 0.4, 0, LYING);
      add('bead', live ? 'cyan' : 'off', x - 0.6, y + 0.6, 1.3, 0.12);
      limb('steel2', x - 0.6, y + 0.6, 0.4, x - 0.6, y + 0.6, 1.25, 0.05);
    },
    radar(c, x, y) {
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2 + 0.5;
        limb('steel2', x + Math.cos(a) * 0.46, y + Math.sin(a) * 0.46, 0.02, x, y, 0.95, 0.08);
      }
      add('hull', 'dark', x, y, 0.1, 0.78, 0.2, 0.78);
      add('tube', 'steel2', x, y, 1.15, 0.14, 1.9, 0.14);
      add('ring', 'cyan', x, y, 0.7 + Math.sin(clock * 3) * 0.05, 0.62, 1.4, 0.62);
      add('ring', 'cyan', x, y, 1.3 + Math.sin(clock * 3 + 1.5) * 0.05, 0.46, 1.4, 0.46);
      const spin = clock * 1.6;
      add('cone', 'steel', ...from(x, y, spin, 0.06), 2.12, 1.05, 0.32, 1.05, spin, 1.15);
      add('bead', 'pale', ...from(x, y, spin, 0.24), 2.2, 0.18);
      add('bead', 'cyan', x, y, 2.3, 0.12);
      if (!built(c)) return;
      // One wave every 3 s, from the pylon to the edge of what it sees.
      const k = radarWave(c, clock);
      if (k == null) return;
      const d = 1.6 + k * RADAR.range * 2;
      add('wave', 'cyan', x, y, 0.05, d, 1, d);
    },
    gate(c, x, y) {
      const sides = conveyor(c, x, y);
      const smart = listens(c);
      const on = smart ? Boolean(netOf(c).focus) : c.open;
      const a = facing(c.dir);
      if (on) for (const side of sides) chevron(c, (side + 2) % 4, c.dir, 0.175);
      for (const s of [-1, 1]) {
        add('hull', 'dark', ...from(x, y, a, 0, s * 0.38), 0.16, 0.2, 0.32, 0.2, a);
        add('tube', 'steel2', ...from(x, y, a, 0, s * 0.38), 0.5, 0.08, 0.5, 0.08);
      }
      const [hx, hy] = from(x, y, a, 0, -0.38);
      add('hull', 'black', hx, hy, 0.78, 0.42, 0.16, 0.24, a);
      add('bead', on ? 'lime' : 'off', ...from(hx, hy, a, 0.1), 0.88, 0.17);
      add('bead', on ? 'off' : 'alarm', ...from(hx, hy, a, -0.1), 0.88, 0.17);
      const [px, py] = from(x, y, a, 0, 0.38);
      if (on) {
        for (let i = 0; i < 3; i++) add('box', i % 2 ? 'black' : 'hazard', px, py, 0.5 + i * 0.17, 0.06, 0.17, 0.07, a);
      } else {
        for (let i = 0; i < 4; i++) add('box', i % 2 ? 'alarm' : 'hazard', ...from(x, y, a, 0, 0.3 - i * 0.18), 0.4, 0.08, 0.08, 0.18, a);
      }
      if (smart) readingOf(c, x, y, 1.02);
    },

    // The upper lane climbs a ramp, the lower one runs in a trough.
    bridge(c, x, y) {
      add('box', 'rubber', x, y, 0.08, 0.46, 0.13, 1);
      for (const s of [-1, 1]) add('box', 'rail', x + s * 0.25, y, 0.14, 0.06, 0.1, 1);
      add('box', 'steel', x, y, 0.4, 0.62, 0.08, 0.5);
      for (const e of [-1, 1]) {
        add('box', 'steel', x + e * 0.4, y, 0.33, 0.25, 0.07, 0.5, 0, -e * 0.55);
        add('box', 'hazard', x + e * 0.3, y, 0.435, 0.04, 0.03, 0.48);
        for (const s of [-1, 1]) {
          add('hull', 'dark', x + e * 0.36, y + s * 0.29, 0.17, 0.14, 0.34, 0.14);
          add('box', 'rail', x + e * 0.4, y + s * 0.25, 0.4, 0.26, 0.09, 0.06, 0, -e * 0.55);
        }
      }
      for (const s of [-1, 1]) add('box', 'rail', x, y + s * 0.25, 0.48, 0.6, 0.09, 0.06);
      for (const axis of [0, 1]) {
        const way = wayOf(c, axis);
        if (way == null) continue;
        chevron(c, way, way, axis ? 0.47 : 0.165);
      }
    },

    // A rotor whose blade shows where the next item leaves.
    // A T with a rocker that tips to the side the next item takes.
    split2(c, x, y) {
      const out = facing(c.dir);
      const exits = splitExits(c);
      footing(x, y, 0.84);
      add('hull', 'steel', x, y, 0.26, 0.42, 0.26, 0.8, out);
      add('hull', 'dark', ...from(x, y, out, 0.3), 0.3, 0.12, 0.34, 0.4, out);
      for (const d of exits) nozzle(x, y, d, 0.24);
      intake(x, y, (c.dir + 2) % 4, c.item);
      const next = c.turn % 2;
      const tip = next ? 1 : -1;
      limb('copper', ...from(x, y, out, 0, -0.26), 0.5 + tip * 0.07, ...from(x, y, out, 0, 0.26), 0.5 - tip * 0.07, 0.11);
      add('bead', 'chrome', x, y, 0.53, 0.15);
      for (let i = 0; i < 2; i++) add('bead', i === next ? 'amber' : 'off', ...from(x, y, out, 0.26, i ? 0.1 : -0.1), 0.5, 0.09);
    },

    split(c, x, y) {
      footing(x, y, 0.84);
      add('hull', 'steel', x, y, 0.28, 0.66, 0.3, 0.66);
      const exits = [3, 0, 1].map((t) => (c.dir + t) % 4);
      for (const d of exits) nozzle(x, y, d, 0.24);
      intake(x, y, (c.dir + 2) % 4, c.item);
      const next = facing(exits[c.turn % 3]);
      add('gear', 'steel2', x, y, 0.48, 0.5, 0.1, 0.5, next);
      add('box', 'chrome', ...from(x, y, next, 0.14), 0.56, 0.3, 0.06, 0.1, next);
      add('dome', 'copper', x, y, 0.53, 0.22, 0.3, 0.22);
    },

    // A scanner arch over a diverter blade, with the filter in its window.
    sort(c, x, y) {
      footing(x, y, 0.84);
      add('hull', 'steel', x, y, 0.26, 0.68, 0.26, 0.68);
      const a = facing(c.dir);
      const side = sideExit(c);
      nozzle(x, y, c.dir, 0.22);
      nozzle(x, y, side, 0.22);
      intake(x, y, (c.dir + 2) % 4, c.item);
      const [ax, ay] = from(x, y, a, -0.2);
      add('arch', 'steel2', ax, ay, 0.38, 0.66, 0.6, 0.8, a + Math.PI / 2);
      add('box', 'cyan', ax, ay, 0.64, 0.04, 0.03, 0.3, a);
      const turned = c.item && exitOf(c) === side;
      const blade = turned ? facing(side) : a;
      add('box', turned ? 'acid' : 'chrome', ...from(x, y, blade, 0.14), 0.41, 0.34, 0.07, 0.07, blade + 0.35);
      if (listens(c)) return readingOf(c, x, y, 0.78);
      add('hull', 'black', x, y, 0.5, 0.5, 0.1, 0.3);
      const n = c.want.length;
      for (let i = 0; i < n; i++) {
        const px = x + (n === 1 ? 0 : (i - (n - 1) / 2) * (0.48 / n));
        const r = n === 1 ? 0.13 : n === 3 ? 0.07 : 0.04;
        if (c.want[i] === '?') add('ring', 'steel2', px, y, 0.58, r * 2.2);
        else base(c.want[i], px, y, 0.6, r, Math.PI);
      }
    },

    // ---- Production
    // A tripod derrick: the cutter spins and the piston dives while it works.
    mine(c, x, y) {
      const kind = matterUnder(c) || 'S';
      const working = built(c) && !c.item;
      const dive = working ? (Math.sin(clock * 7 + c.x) + 1) * 0.06 : 0.06;
      const spin = working ? clock * 6 : c.x;
      const out = facing(c.dir);
      add('stain', 'black', x, y, 0.07, 0.92, 0.03, 0.92, c.x * 1.7);
      for (let i = 0; i < 3; i++) {
        const a = out + Math.PI / 3 + (i * TAU) / 3;
        const [fx, fy] = from(x, y, a, 0.43);
        add('hull', 'dark', fx, fy, 0.1, 0.2, 0.16, 0.2, a);
        limb('steel', fx, fy, 0.14, ...from(x, y, a, 0.14), 0.72, 0.09);
        if (fine) limb('hazard', ...from(x, y, a, 0.36), 0.28, ...from(x, y, a, 0.3), 0.4, 0.1);
      }
      add('gear', 'chrome', x, y, 0.2 + dive, 0.44, 0.08, 0.44, spin);
      add('taper', 'steel2', x, y, 0.44 + dive, 0.18, 0.44, 0.18);
      add('hull', 'steel', x, y, 0.76, 0.4, 0.16, 0.4, out);
      add('dome', 'glass', x, y, 0.84, 0.36, 0.5, 0.36);
      base(kind, x, y, 0.94, 0.11, spin * 0.2);
      const [tx, ty] = from(x, y, out, 0.4);
      limb('copper', ...from(x, y, out, 0.14), 0.72, tx, ty, 0.3, 0.1);
      nozzle(x, y, c.dir, 0.24);
      status(...from(x, y, out + 2.5, 0.2), 0.86, 'lime', working);
    },

    // A glass column holding the helix it is binding, three mouths in, one nozzle out.
    ligase(c, x, y) {
      const out = facing(c.dir);
      const working = built(c) && c.ports.every((p) => p.length);
      footing(x, y);
      add('hull', 'steel', x, y, 0.3, 0.72, 0.32, 0.72);
      add('hull', 'steel2', ...from(x, y, out, -0.02), 0.47, 0.54, 0.08, 0.54, out);
      for (const s of [-1, 1]) {
        add('tube', 'copper', ...from(x, y, out, 0.22, s * 0.27), 0.46, 0.1, 0.22, 0.1);
        if (fine) limb('copper', ...from(x, y, out, 0.22, s * 0.27), 0.56, ...from(x, y, out, 0.02, s * 0.12), 0.62, 0.04);
      }
      const spin = working ? clock * 3 : 0.4;
      const steps = fine ? 6 : 3;
      for (let i = 0; i < steps; i++) {
        const a = spin + i * 0.85;
        const h = 0.55 + (i / steps) * 0.4;
        const one = from(x, y, a, 0.12);
        const two = from(x, y, a, -0.12);
        add('bead', working ? 'acid' : 'skin2', ...one, h, 0.09);
        add('bead', working ? 'cyan' : 'steel2', ...two, h, 0.09);
        if (fine) limb('steel2', ...one, h, ...two, h, 0.025);
      }
      add('tube', 'glass', x, y, 0.75, 0.38, 0.5, 0.38);
      add('ring', 'steel2', x, y, 0.53, 0.42);
      add('ring', working ? 'cyan' : 'steel2', x, y, 1, 0.4);
      for (let port = 0; port < 3; port++) {
        const side = portSide(c, port);
        const kind = c.ports[port][0] || c.last[port];
        intake(x, y, side, c.ports[port].length);
        if (kind) base(kind, x + DX[side] * 0.33, y + DY[side] * 0.33, 0.52, 0.075);
      }
      nozzle(x, y, c.dir, 0.27);
      if (c.item) cargo(c.item, ...from(x, y, out, 0.3), 0.5, out, 0.34);
    },

    // A press over a carousel of six, with a hopper of carbon on one side.
    flip(c, x, y) {
      const out = facing(c.dir), live = built(c);
      footing(x, y);
      add('hull', 'steel', x, y, 0.25, 0.72, 0.24, 0.62, out);
      add('tube', 'dark', x, y, 0.42, 0.56, 0.1, 0.56);
      add('tube', 'glass', x, y, 0.5, 0.52, 0.06, 0.52);
      // The three bases on the disc trade places: the first and the last swing round each other.
      const gene = c.item || c.ports[0][0] || c.last || '', k = live && gene ? (clock * 1.4) % 1 : 0, swap = Math.sin(k * Math.PI);
      for (let i = 0; i < 3; i++) {
        const side = (i - 1) * 0.17, lift = i === 1 ? 0 : swap * 0.12, along = i === 1 ? 0 : (i ? -1 : 1) * swap * 0.12;
        add('bead', gene[i] || 'off', ...from(x, y, out, along, side * (1 - 2 * k)), 0.6 + lift, 0.1);
      }
      const spin = live ? clock * 3 : 0;
      for (let i = 0; i < 10; i++) add('bead', 'cyan', ...from(x, y, spin + (i / 12) * TAU, 0.32), 0.56, 0.03 + i * 0.004);
      add('cone', 'cyan', ...from(x, y, spin + (10 / 12) * TAU, 0.32), 0.56, 0.08, 0.1, 0.08, spin + (10 / 12) * TAU + Math.PI / 2, Math.PI / 2);
      intake(x, y, (c.dir + 2) % 4, c.ports[0].length);
      nozzle(x, y, c.dir, 0.25);
    },
    unpack(c, x, y) {
      const out = facing(c.dir), back = out + Math.PI, side = facing((c.dir + 1) % 4);
      const working = built(c) && (c.ports[1].length > 0 || c.item);
      footing(x, y);
      add('hull', 'steel', x, y, 0.27, 0.76, 0.26, 0.64, out);
      const [bx, by] = from(x, y, back, 0.24), open = working ? 0.6 + Math.sin(clock * 2.5) * 0.25 : 0.2;
      add('box', 'dark', bx, by, 0.5, 0.34, 0.22, 0.46, out);
      add('box', 'pink', bx, by, 0.62, 0.36, 0.03, 0.48, out);
      add('box', 'steel2', ...from(bx, by, back, 0.16), 0.66 + open * 0.12, 0.05, 0.03, 0.46, out, open);
      const turn = working ? clock * 2.6 : 0, inside = c.ports[1][0] || (c.last && contentOf(c.last)) || '';
      add('gear', 'steel2', x, y, 0.45, 0.46, 0.08, 0.46, turn);
      for (let i = 0; i < 6; i++) add('bead', i < c.ports[1].length && inside[i % 3] ? inside[i % 3] : 'off', ...from(x, y, turn + (i / 6) * TAU, 0.17), 0.5, 0.1);
      if (c.item) cargo(c.item, ...from(x, y, out, 0.22), 0.5, out, 0.4);
      const [hx, hy] = from(x, y, side, 0.34);
      add('skirt', 'dark', hx, hy, 0.4, 0.3, 0.26, 0.3, side, Math.PI);
      add('ring', 'hazard', hx, hy, 0.52, 0.3);
      for (let i = 0; i < Math.min(3, c.ports[2].length); i++) base(c.ports[2][i], ...from(hx, hy, i * 2.1, i ? 0.08 : 0), 0.5, 0.08, i);
      nozzle(x, y, c.dir, 0.25);
    },
    pack(c, x, y) {
      const out = facing(c.dir);
      const [goods, carbon] = c.ports;
      const magazine = c.box === 'A';
      const trim = magazine ? 'amber' : 'cyan';
      const working = built(c) && goods.length >= PACK.size && carbon.length >= BOX[c.box].carbon;
      footing(x, y);
      add('hull', 'steel', x, y, 0.27, 0.76, 0.26, 0.64, out);
      intake(x, y, (c.dir + 2) % 4, goods.length);

      const side = carbonSide(c);
      const a = facing(side);
      const [hx, hy] = from(x, y, a, 0.33);
      add('skirt', 'dark', hx, hy, 0.46, 0.36, 0.3, 0.36, a, Math.PI);
      add('ring', 'hazard', hx, hy, 0.6, 0.36);
      for (let i = 0; i < Math.min(4, carbon.length); i++) base('K', ...from(hx, hy, i * 1.7, i ? 0.08 : 0), 0.62, 0.085, i);
      if (!carbon.length) add('stain', 'black', hx, hy, 0.59, 0.24, 0.02, 0.24);

      const [cx, cy] = from(x, y, a, -0.1);
      const turn = working ? clock * 2.4 : 0;
      add('gear', 'steel2', cx, cy, 0.43, 0.52, 0.08, 0.52, turn);
      for (let i = 0; i < PACK.size; i++) {
        const [px, py] = from(cx, cy, turn + (i / PACK.size) * TAU, 0.19);
        add('bead', i < goods.length ? trim : 'off', px, py, 0.5, 0.11);
      }
      const press = working ? Math.max(0, Math.sin(clock * 5)) * 0.14 : 0;
      for (const s of [-1, 1]) add('tube', 'steel2', ...from(cx, cy, out, 0, s * 0.27), 0.62, 0.07, 0.46, 0.07);
      add('box', 'dark', cx, cy, 0.86, 0.14, 0.08, 0.62, out);
      add('taper', 'copper', cx, cy, 0.76 - press, 0.17, 0.24, 0.17, out, Math.PI);
      const inside = c.item || (goods.length ? `${c.box}:${goods[0]}` : c.last);
      if (inside) cargo(inside, ...from(x, y, out, 0.22), 0.5, out, 0.4);
      nozzle(x, y, c.dir, 0.25);
    },

    // Two gene chambers spliced under an arch.
    join(c, x, y) {
      const out = facing(c.dir);
      const working = built(c) && c.ports[0].length && c.ports[1].length;
      footing(x, y);
      add('hull', 'steel', x, y, 0.27, 0.74, 0.26, 0.6, out);
      for (const port of [0, 1]) {
        const side = joinSide(c, port);
        const [tx, ty] = from(x, y, facing(side), 0.22);
        const gene = c.ports[port][0] || (c.last ? c.last.slice(port * 3, port * 3 + 3) : '');
        intake(x, y, side, c.ports[port].length);
        add('hull', 'steel2', tx, ty, 0.43, 0.34, 0.1, 0.36, out);
        if (gene) cargo(gene, tx, ty, 0.62, out, 0.36);
        add('tube', 'glass', tx, ty, 0.56, 0.36, 0.22, 0.36);
        // One ring for gene 1, two for gene 2.
        for (let i = 0; i <= port; i++) add('ring', 'copper', tx, ty, 0.5 + i * 0.1, 0.4);
      }
      add('arch', 'copper', ...from(x, y, out, -0.16), 0.46, 0.5, 0.6, 0.8, out + Math.PI / 2);
      add('bead', working ? 'acid' : 'off', ...from(x, y, out, -0.16), 0.78, 0.14 + (working ? Math.sin(clock * 14) * 0.03 : 0));
      if (working && fine) limb('acid', ...from(x, y, out, -0.16), 0.76, ...from(x, y, out, 0.1), 0.6, 0.03);
      nozzle(x, y, c.dir, 0.25);
    },

    // A sac in a bone cradle, swelling and lighting its nodes as it fills.
    cyst(c, x, y) {
      const full = c.stock.length / capOf(c);
      const beat = 1 + Math.sin(clock * 2.6 + c.x) * 0.035;
      const r = (0.46 + full * 0.36) * beat;
      footing(x, y, 0.8);
      add('sac', full > 0.95 ? 'flesh2' : 'flesh', x, y, 0.2 + r * 0.4, r, r * 0.95, r, c.x);
      for (let i = 0; i < 4; i++) {
        const a = Math.PI / 4 + (i * Math.PI) / 2;
        add('horn', 'bone', ...from(x, y, a, 0.36), 0.12, 0.4, 0.46 + full * 0.14, 0.4, a + Math.PI);
      }
      for (let i = 0; i < 5; i++) {
        const a = i * 1.257 + 0.5;
        const lit = full * 5 > i + 0.05;
        add('bead', lit ? (full > 0.95 ? 'alarm' : 'pink') : 'gore', ...from(x, y, a, r * 0.4), 0.22 + r * 0.56, 0.11);
        if (fine) limb('gore', ...from(x, y, a + 0.3, r * 0.46), 0.22 + r * 0.22, ...from(x, y, a, r * 0.3), 0.22 + r * 0.68, 0.035);
      }
      add('lip', 'pink', x, y, 0.2 + r * 0.83, 0.2);
      if (c.stock.length && fine) cargo(c.stock[0], x, y, 0.3 + r * 0.85, Math.PI, 0.36);
      nozzle(x, y, c.dir, 0.22);
    },

    // A derrick over four cells: two counter-turning cutters, a mast, and a mouth on each of eight faces.
    borer(c, x, y) {
      const kind = matterUnder(c) || 'S';
      const working = built(c) && c.stock.length < BORER.hold;
      const spin = working ? clock * 4 : c.x;
      const dive = working ? (Math.sin(clock * 5 + c.x) + 1) * 0.05 : 0.04;
      add('stain', 'black', x, y, 0.07, 1.9, 0.03, 1.9, c.x * 1.3);
      for (let i = 0; i < 4; i++) {
        const a = Math.PI / 4 + (i * Math.PI) / 2;
        const [fx, fy] = from(x, y, a, 1.08);
        add('hull', 'dark', fx, fy, 0.12, 0.34, 0.22, 0.34, a);
        limb('steel', fx, fy, 0.2, ...from(x, y, a, 0.24), 1.2, 0.14);
        limb('hazard', ...from(x, y, a, 0.86), 0.46, ...from(x, y, a, 0.72), 0.64, 0.16);
        if (fine) limb('steel2', ...from(x, y, a, 0.66), 0.7, ...from(x, y, a + Math.PI / 2, 0.66), 0.7, 0.07);
      }
      add('gear', 'chrome', x, y, 0.2 + dive, 1.16, 0.12, 1.16, spin);
      add('gear', 'steel2', x, y, 0.36 + dive, 0.76, 0.12, 0.76, -spin * 1.4);
      add('taper', 'steel2', x, y, 0.78 + dive, 0.32, 0.74, 0.32);
      if (fine) for (let i = 0; i < 3; i++) add('ring', 'copper', x, y, 0.62 + i * 0.16 + dive, 0.4 - i * 0.05);
      add('hull', 'steel', x, y, 1.26, 0.74, 0.22, 0.74);
      add('ring', working ? 'cyan' : 'amber', x, y, 1.39, 0.7);
      add('dome', 'glass', x, y, 1.36, 0.6, 0.7, 0.6);
      base(kind, x, y, 1.5, 0.19, spin * 0.2);
      for (const door of edgesOf(c)) nozzle(door.x + 0.5, door.y + 0.5, door.dir, 0.22);
    },

    // Four sacs in one cradle, filling one after the other, two mouths side by side.
    vault(c, x, y) {
      const full = c.stock.length / capOf(c);
      add('hull', 'dark', x, y, 0.09, 1.9, 0.18, 1.9);
      add('hull', 'steel', x, y, 0.22, 1.62, 0.14, 1.62);
      for (let i = 0; i < 4; i++) {
        const a = Math.PI / 4 + (i * Math.PI) / 2;
        const part = Math.max(0, Math.min(1, full * 4 - i));
        const beat = 1 + Math.sin(clock * 2.2 + i * 1.4 + c.x) * 0.03;
        const r = (0.5 + part * 0.3) * beat;
        const [sx, sy] = from(x, y, a, 0.54);
        add('sac', part > 0.95 ? 'flesh2' : 'flesh', sx, sy, 0.3 + r * 0.36, r, r, r, a);
        add('lip', 'pink', sx, sy, 0.3 + r * 0.82, 0.18);
        add('bead', part > 0.05 ? (part > 0.95 ? 'alarm' : 'pink') : 'gore', ...from(sx, sy, a, r * 0.34), 0.3 + r * 0.6, 0.14);
        add('horn', 'bone', ...from(x, y, a, 1.12), 0.2, 0.5, 0.66 + part * 0.2, 0.5, a + Math.PI);
        if (fine) limb('gore', sx, sy, 0.46, x, y, 0.74, 0.12, 'taper');
      }
      add('sac', 'skin', x, y, 0.62, 0.4, 0.46, 0.4);
      add('ring', full > 0.95 ? 'alarm' : 'cyan', x, y, 0.84, 0.36);
      if (c.stock.length) cargo(c.stock[0], x, y, 0.98, Math.PI, 0.5);
      for (const door of edgesOf(c)) {
        if (door.dir === c.dir) nozzle(door.x + 0.5, door.y + 0.5, door.dir, 0.26);
        else if (fine) add('bead', 'black', door.x + 0.5 + DX[door.dir] * 0.42, door.y + 0.5 + DY[door.dir] * 0.42, 0.24, 0.18, 0.18, 0.18);
      }
    },

    // A two-lobed heart bolted to the deck, beating while it has matter.
    pump(c, x, y) {
      const kind = c.stock[0] || c.packets[0]?.item;
      const phase = (clock * 1.8 + c.x * 0.13) % 1;
      const beat = built(c) && kind ? Math.exp(-phase * 7) * 0.12 : 0;
      add('skirt', 'dark', x, y, 0.12, 0.92, 0.24, 0.92);
      add('ring', 'steel2', x, y, 0.25, 0.74, 1, 0.74);
      add('sac', 'flesh', x - 0.12, y, 0.46, 0.44 + beat, 0.54 + beat, 0.5 + beat, 0.4);
      add('sac', 'flesh2', x + 0.14, y + 0.05, 0.42, 0.38 - beat * 0.5, 0.44 - beat * 0.5, 0.42, 2);
      limb('pink', x - 0.1, y, 0.66, x - 0.16, y - 0.12, 0.88, 0.14, 'taper');
      limb('flesh2', x + 0.12, y + 0.02, 0.58, x + 0.22, y - 0.1, 0.76, 0.12, 'taper');
      for (let i = 0; i < 4; i++) {
        const a = Math.PI / 4 + (i * Math.PI) / 2;
        add('horn', 'chrome', ...from(x, y, a, 0.38), 0.22, 0.26, 0.26, 0.26, a + Math.PI);
      }
      const level = Math.ceil((c.stock.length / VEIN.cap) * 4);
      for (let i = 0; i < 4; i++) status(x - 0.21 + i * 0.14, y + 0.36, 0.27, 'pink', i < level);
      if (kind) cargo(kind, x + 0.02, y, 0.84, Math.PI, 0.4);
    },

    // A mouth against the trail: lips, teeth, and the heap it holds.
    pocket(c, x, y) {
      const full = Math.min(1, c.stock.length / WORM.pocket);
      footing(x, y, 0.82);
      add('sac', 'skin', x, y, 0.26, 0.78, 0.46, 0.78, c.y);
      add('stain', 'black', x, y, 0.42, 0.46, 0.04, 0.46);
      add('lip', c.unload ? 'sprout' : 'skin2', x, y, 0.44, 0.52 + Math.sin(clock * 3 + c.x) * 0.02);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU;
        // Teeth lean in to take, out to give.
        add('horn', 'bone', ...from(x, y, a, 0.27), 0.42, 0.2, 0.22, 0.2, c.unload ? a : a + Math.PI);
      }
      const heap = c.stock.length ? Math.max(1, Math.ceil(full * 4)) : 0;
      for (let i = 0; i < heap; i++) {
        const [px, py] = i ? from(x, y, i * 2.1, 0.12) : [x, y];
        cargo(c.stock[0], px, py, 0.46 + i * 0.04, i, 0.26);
      }
      for (let d = 0; d < 4; d++) {
        if (!G.tracks[key(c.x + DX[d], c.y + DY[d])]) continue;
        limb('skin2', x + DX[d] * 0.2, y + DY[d] * 0.2, 0.3, x + DX[d] * 0.56, y + DY[d] * 0.56, 0.12, 0.2, 'taper');
      }
    },

    // ---- Defence
    // Armoured head on a fixed ring: the magazine shows the load, the barrels recoil.
    turret(c, x, y) {
      const count = Object.values(c.ammo).reduce((s, n) => s + n, 0);
      const a = c.aim ?? -Math.PI / 2;
      const kick = built(c) && c.clock > 0 ? Math.min(1, c.clock * 4) * 0.07 : 0;
      add('skirt', 'dark', x, y, 0.14, 0.98, 0.28, 0.98, Math.PI / 8);
      for (let i = 0; i < 4; i++) add('hull', 'steel', ...from(x, y, Math.PI / 4 + (i * Math.PI) / 2, 0.4), 0.2, 0.2, 0.22, 0.2, Math.PI / 4 + (i * Math.PI) / 2);
      add('gear', 'steel2', x, y, 0.35, 0.66, 0.1, 0.66, a);
      add('ring', count ? 'cyan' : 'alarm', x, y, 0.41, 0.62, 0.8, 0.62);
      add('hull', 'steel', ...from(x, y, a, -0.03), 0.58, 0.5, 0.32, 0.4, a);
      add('shell', 'steel2', ...from(x, y, a, 0.02), 0.72, 0.5, 0.34, 0.42, a);
      for (const s of [-1, 1]) {
        add('hull', 'dark', ...from(x, y, a, -0.02, s * 0.27), 0.6, 0.36, 0.22, 0.14, a);
        const root = from(x, y, a, 0.1 - kick, s * 0.11);
        const muzzle = from(x, y, a, 0.64 - kick, s * 0.11);
        limb('chrome', ...root, 0.66, ...muzzle, 0.68, 0.1);
        limb('black', ...from(x, y, a, 0.54 - kick, s * 0.11), 0.677, ...muzzle, 0.68, 0.14);
        if (fine) add('ring', 'copper', ...from(x, y, a, 0.3 - kick, s * 0.11), 0.67, 0.14, 0.14, 0.14, a, LYING);
        if (kick > 0.03) add('bead', 'amber', ...from(x, y, a, 0.68, s * 0.11), 0.68, kick * 2.4);
      }
      add('hull', 'black', ...from(x, y, a, -0.3), 0.62, 0.2, 0.28, 0.32, a);
      const pips = Math.ceil(Math.min(12, count) / 3);
      for (let i = 0; i < 4; i++) status(...from(x, y, a, -0.3, -0.12 + i * 0.08), 0.77, 'cyan', i < pips);
      add('bead', count ? 'cyan' : 'alarm', ...from(x, y, a, 0.14), 0.87, 0.16, 0.1, 0.12, a);
    },

    // A long rail of chitin on a tripod: charge climbs its coils until the one heavy shot.
    sting(c, x, y) {
      const count = Object.values(c.ammo).reduce((s, n) => s + n, 0);
      const a = c.aim ?? -Math.PI / 2;
      const gun = GUNS.sting;
      const wait = Math.max(0, c.clock) * gun.pace; // 1 just fired, 0 ready
      const kick = built(c) ? Math.max(0, wait - 0.7) * 0.5 : 0;
      add('skirt', 'dark', x, y, 0.1, 0.7, 0.2, 0.7);
      for (let i = 0; i < 3; i++) {
        const t = a + Math.PI / 3 + (i * TAU) / 3;
        const [fx, fy] = from(x, y, t, 0.46);
        add('hull', 'steel', fx, fy, 0.08, 0.17, 0.14, 0.17, t);
        limb('steel2', fx, fy, 0.12, ...from(x, y, t, 0.08), 0.56, 0.09, 'taper');
      }
      add('gear', 'steel2', x, y, 0.56, 0.4, 0.08, 0.4, a);
      add('sac', 'skin', ...from(x, y, a, -0.24 - kick), 0.78, 0.42, 0.32, 0.34, a);
      add('shell', 'bone', ...from(x, y, a, -0.1 - kick), 0.86, 0.44, 0.26, 0.3, a);
      limb('chrome', ...from(x, y, a, -0.1 - kick), 0.8, ...from(x, y, a, 0.8 - kick), 0.86, 0.085);
      limb('bone', ...from(x, y, a, 0.7 - kick), 0.855, ...from(x, y, a, 1 - kick), 0.875, 0.12, 'cone');
      for (let i = 0; i < 4; i++) {
        const lit = count > 0 && 1 - wait > i / 4;
        add('ring', lit ? 'acid' : 'steel2', ...from(x, y, a, 0.12 + i * 0.16 - kick), 0.815 + i * 0.011, 0.23 - i * 0.025, 0.2, 0.23 - i * 0.025, a, LYING);
      }
      if (fine) {
        for (const s of [-1, 1]) limb('copper', ...from(x, y, a, -0.3, s * 0.1), 0.72, ...from(x, y, a, 0.1, s * 0.07), 0.82, 0.035);
      }
      // A scope on the side.
      limb('black', ...from(x, y, a, -0.12, 0.17), 0.96, ...from(x, y, a, 0.16, 0.17), 0.98, 0.1);
      add('bead', count ? 'cyan' : 'alarm', ...from(x, y, a, 0.18, 0.17), 0.98, 0.1);
      add('ring', count ? 'cyan' : 'alarm', x, y, 0.22, 0.58, 0.8, 0.58);
      if (kick > 0.06) add('bead', 'acid', ...from(x, y, a, 1 - kick), 0.875, kick * 1.4);
    },

    // Squat and armoured, two throats between jaws, both spitting at once.
    maw(c, x, y) {
      const count = Object.values(c.ammo).reduce((s, n) => s + n, 0);
      const a = c.aim ?? -Math.PI / 2;
      const wait = Math.max(0, c.clock) * GUNS.maw.pace;
      const kick = built(c) ? Math.max(0, wait - 0.5) * 0.18 : 0;
      add('skirt', 'dark', x, y, 0.16, 1, 0.32, 1, Math.PI / 8);
      add('ring', count ? 'amber' : 'alarm', x, y, 0.33, 0.74, 0.9, 0.74);
      add('sac', 'flesh', ...from(x, y, a, -0.1), 0.5, 0.72, 0.5, 0.8, a);
      add('shell', 'steel', ...from(x, y, a, -0.14), 0.58, 0.64, 0.4, 0.74, a);
      if (fine) for (let i = 0; i < 3; i++) add('horn', 'bone', ...from(x, y, a, -0.3 + i * 0.14), 0.74, 0.22, 0.2, 0.22, a + Math.PI);
      for (const s of [-1, 1]) {
        const root = from(x, y, a, 0.06 - kick, s * 0.19);
        const lips = from(x, y, a, 0.44 - kick, s * 0.19);
        limb('flesh2', ...root, 0.5, ...lips, 0.52, 0.27);
        add('lip', count ? 'pink' : 'flesh', ...lips, 0.52, 0.3, 0.3, 0.3, a, LYING);
        add('bead', 'black', ...from(x, y, a, 0.47 - kick, s * 0.19), 0.52, 0.07, 0.17, 0.17, a);
        // The jaws gape as it fires.
        limb('bone', ...from(x, y, a, 0.2, s * 0.4), 0.4, ...from(x, y, a, 0.64, s * (0.3 + kick * 1.6)), 0.36, 0.13, 'taper');
        add('bead', count ? 'amber' : 'alarm', ...from(x, y, a, 0.08, s * 0.16), 0.76, 0.1);
        if (kick > 0.03) add('bead', 'amber', ...from(x, y, a, 0.58, s * 0.19), 0.52, kick * 3);
      }
      const pips = Math.ceil(Math.min(12, count) / 3);
      for (let i = 0; i < 4; i++) status(...from(x, y, a, -0.4, -0.15 + i * 0.1), 0.62, 'amber', i < pips);
    },

    // Buttresses that join their neighbours, and come apart as they are hurt.
    wall(c, x, y) {
      const life = Math.max(0, c.hp / maxHp(c));
      const tall = 0.42 + 0.34 * life;
      add('hull', 'stone', x, y, tall / 2, 0.62, tall, 0.62);
      add('hull', 'dark', x, y, tall + 0.03, 0.44, 0.1, 0.44);
      let linked = false;
      for (let d = 0; d < 4; d++) {
        if (ahead(c, d)?.type !== 'wall') continue;
        linked = true;
        const a = facing(d);
        add('box', 'stone2', ...from(x, y, a, 0.37), tall * 0.36, 0.28, tall * 0.72, 0.42, a);
        add('box', 'dark', ...from(x, y, a, 0.37), tall * 0.75, 0.3, 0.07, 0.24, a);
      }
      const plates = Math.ceil(life * 4);
      for (let i = 0; i < plates; i++) {
        const a = (i * Math.PI) / 2 + (linked ? Math.PI / 4 : 0);
        add('hull', 'stone2', ...from(x, y, a, 0.33), tall * 0.4, 0.16, tall * 0.7, 0.34, a);
        add('horn', 'steel2', ...from(x, y, a, 0.18), tall, 0.22, 0.26, 0.22, a);
      }
      for (let i = plates; i < 4; i++) add('rock', 'stone', ...from(x, y, i * 1.7, 0.42), 0.07, 0.18, 0.14, 0.18, i);
      if (fine) add('box', 'hazard', x, y, tall + 0.09, 0.26, 0.02, 0.06);
    },

    // A creature held in a steel cradle, growing lobes, ribs and a crown.
    core(c, x, y) {
      if (c.size !== 3) return this.coreBody(c, x, y);
      const top = 0.55;
      add('hull', 'dark', x, y, top / 2, 2.94, top, 2.94);
      add('hull', 'steel2', x, y, top + 0.03, 2.72, 0.06, 2.72);
      add('ring', 'cyan', x, y, top + 0.07, 2.3, 0.3, 2.3);
      for (let s = 0; s < 4; s++) for (const o of [-1, 0, 1]) {
        const dx = DX[s], dy = DY[s];
        add('hull', 'black', x + dx * 1.36 + -dy * o, y + dy * 1.36 + dx * o, top * 0.45, dx ? 0.3 : 0.7, top * 0.8, dx ? 0.7 : 0.3);
        add('hull', 'cyan', x + dx * 1.49 + -dy * o, y + dy * 1.49 + dx * o, top * 0.55, dx ? 0.05 : 0.5, 0.1, dx ? 0.5 : 0.05);
      }
      const raw = add;
      add = (shape, paint, ax, ay, h, ...rest) => raw(shape, paint, ax, ay, h + top, ...rest);
      try { this.coreBody(c, x, y); } finally { add = raw; }
    },
    coreBody(c, x, y) {
      const beat = Math.exp(-((clock * 1.15) % 1) * 6) * 0.09;
      const stage = Math.min(3, G.stage);
      add('skirt', 'dark', x, y, 0.14, 1.56, 0.28, 1.56, Math.PI / 8);
      add('ring', 'steel2', x, y, 0.3, 1.22);
      add('ring', 'cyan', x, y, 0.33, 1.08, 0.6, 1.08);
      for (let i = 0; i < 4; i++) {
        const a = Math.PI / 4 + (i * Math.PI) / 2;
        add('hull', 'steel', ...from(x, y, a, 0.62), 0.28, 0.3, 0.36, 0.28, a);
        add('horn', 'chrome', ...from(x, y, a, 0.58), 0.42, 0.5, 0.54, 0.5, a + Math.PI);
        limb('copper', ...from(x, y, a + 0.4, 0.66), 0.2, ...from(x, y, a + 0.1, 0.28), 0.5, 0.06);
      }
      add('sac', 'skin2', x, y, 0.64, 1.02 + beat, 0.9 + beat, 1.02 + beat, clock * 0.08);
      for (let i = 0; i < 2 + stage * 2; i++) {
        const a = i * 2.39996;
        add('sac', i % 2 ? 'skin' : 'sprout', ...from(x, y, a, 0.4), 0.7 + (i % 3) * 0.1, 0.44 + beat, 0.44 + beat, 0.38 + beat, a);
      }
      if (stage >= 2) for (let i = 0; i < 6; i++) add('horn', 'bone', ...from(x, y, (i / 6) * TAU, 0.42), 0.66, 0.3, 0.5, 0.3, (i / 6) * TAU + Math.PI);
      if (stage >= 3) for (let i = 0; i < 8; i++) add('horn', 'sprout', ...from(x, y, (i / 8) * TAU, 0.2), 1.06, 0.26, 0.4, 0.26, (i / 8) * TAU);
      add('ball', 'acid', x, y, 1.04 + beat, 0.4 + beat);
      add('ball', 'black', x, y + 0.1, 1.12 + beat, 0.08, 0.14, 0.08);
      add('dome', 'membraneGlass', x, y, 0.92 + beat, 0.5, 0.62, 0.5);
    },
  };


  // A rank shows on its own plinth, square to the cell: a dark plate, a lit frame in the rank's colour (orange
  // MK2, violet MK3), corner posts taller and beating at MK3, chevrons at the front, and a part each family gains.
  function rankKit(c, x, y, size) {
    const mk = rankOf(c), paint = mk > 2 ? 'rail3' : 'rail2', half = size / 2 - 0.05, w = size - 0.1;
    add('hull', 'dark', x, y, 0.012, w, 0.024, w);
    for (const s of [-1, 1]) {
      add('hull', paint, x + s * half, y, 0.03, 0.05, 0.04, w);
      add('hull', paint, x, y + s * half, 0.03, w, 0.04, 0.05);
    }
    const post = mk > 2 ? 0.42 + Math.sin(clock * 3) * 0.04 : 0.26;
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) add('hull', paint, x + sx * half, y + sy * half, post / 2, 0.07, post, 0.07);
    const a = facing(c.dir ?? 0);
    for (let i = 0; i < mk - 1; i++) {
      const [cx, cy] = from(x, y, a, half - 0.02 - i * 0.14);
      for (const s of [-1, 1]) add('hull', paint, ...from(cx, cy, a + s * 2.3, 0.09), 0.05, 0.16, 0.035, 0.05, a + s * 0.8);
    }
    if (c.type === 'mine' || c.type === 'borer') for (let i = 0; i < mk - 1; i++) {
      // A drilling arm more each rank, its tip lit.
      const b = a + Math.PI / 2 + i * Math.PI, r = size * 0.24;
      limb('steel', ...from(x, y, b, r * 0.5), 0.7, ...from(x, y, b, r * 1.8), 0.08, 0.11, 'taper');
      add('bead', paint, ...from(x, y, b, r * 1.8), 0.12, 0.11);
    }
    if (['ligase', 'join', 'pack'].includes(c.type)) for (let i = 0; i < mk - 1; i++) {
      // A coil on each side, an arc between them at MK3.
      const s = i ? -1 : 1, [cx, cy] = from(x, y, a + s * Math.PI / 2, 0.44);
      add('tube', 'steel2', cx, cy, 0.4, 0.16, 0.6, 0.16);
      for (let k = 0; k < 4; k++) add('ring', paint, cx, cy, 0.16 + k * 0.13, 0.24);
      if (mk > 2 && i) limb(paint, ...from(x, y, a + Math.PI / 2, 0.44), 0.74 + Math.sin(clock * 6) * 0.03, ...from(x, y, a - Math.PI / 2, 0.44), 0.74, 0.04);
    }
    if (['turret', 'sting', 'maw'].includes(c.type)) {
      // Front armour lined in the rank's colour, and a back plate at MK3.
      const aim = c.aim ?? a, [fx, fy] = from(x, y, aim, 0.34);
      add('hull', 'steel', fx, fy, 0.34, 0.6, 0.42, 0.12, aim);
      add('hull', paint, ...from(fx, fy, aim, 0.07), 0.34, 0.62, 0.06, 0.05, aim);
      if (mk > 2) add('hull', 'steel', ...from(x, y, aim + Math.PI, 0.34), 0.34, 0.52, 0.36, 0.12, aim);
    }
    if (c.type === 'cyst' || c.type === 'vault') for (let i = 0; i < mk; i++) add('ring', paint, x, y, 0.22 + i * 0.2, size * 0.44);
    if (c.type === 'wall') for (let i = 0; i < mk - 1; i++) add('horn', 'bone', x, y, 0.5 + i * 0.2, 0.18, 0.4, 0.18);
  }
  // ---- The ground
  function fields(area) {
    for (const field of fieldsIn(area.x0, area.y0, area.x1, area.y1)) {
      const [kind, , , w, h] = field;
      const patch = patchOf(field);
      // From very far, one big sign for a field.
      if (cam.zoom < 6.5) {
        if (known(patch.cx, patch.cy)) base(kind, patch.cx, patch.cy, 0.8, Math.min(w, h) * 0.22);
        continue;
      }
      for (const { x: i, y: j } of patch.list) {
        if (i < area.x0 - 1 || i > area.x1 + 1 || j < area.y0 - 1 || j > area.y1 + 1 || !known(i, j)) continue;
        const n = noise(i, j);
        const m = noise(j + 4, i + 9);
        const cx = i + 0.5;
        const cy = j + 0.5;
        const covered = cellAt(i, j);
        if (covered) {
          if (covered.type !== 'mine' && covered.type !== 'borer') base(kind, cx - 0.38, cy + 0.38, 0.12, 0.08);
          continue;
        }
        if (cam.zoom < 9 && (i + j) % 2) continue;
        GROWTH[kind](cx + (n - 0.5) * 0.4, cy + (m - 0.5) * 0.4, n, m, i, j);
      }
    }
  }
  const GROWTH = {
    // Seams of graphite breaking out in six-sided slabs.
    K(x, y, n, m) {
      add('hull', 'K', x, y, 0.12 + n * 0.06, 0.44 + m * 0.2, 0.24 + n * 0.14, 0.36 + n * 0.16, n * 6, (m - 0.5) * 0.5);
      for (let i = 0; i < (fine ? 3 : 1); i++) {
        const a = m * 6 + i * 2.1;
        const [px, py] = from(x, y, a, 0.28);
        add(i ? 'hull' : 'crystal', i % 2 ? 'K2' : 'K', px, py, 0.13, 0.2, 0.18 + ((n + i * 0.3) % 1) * 0.3, 0.18, a, 0.45);
      }
    },
    // Isotope: violet spires that glow, rare and far out.
    I(x, y, n, m) {
      add('hull', 'K', x, y, 0.1, 0.4 + m * 0.2, 0.2, 0.36 + n * 0.14, n * 6);
      for (let i = 0; i < (fine ? 3 : 1); i++) {
        const a = m * 6 + i * 2.1;
        const [px, py] = from(x, y, a, i ? 0.24 : 0);
        add('crystal', i % 2 ? 'I2' : 'I', px, py, 0.2, 0.16, 0.36 + ((n + i * 0.3) % 1) * 0.36, 0.16, a, 0.15);
      }
    },
    // Pods on stalks, breathing.
    S(x, y, n, m) {
      const count = fine ? 2 + Math.floor(m * 3) : 1;
      for (let i = 0; i < count; i++) {
        const a = n * 6 + i * 2.3;
        const [px, py] = i ? from(x, y, a, 0.27) : [x, y];
        const r = (i ? 0.14 + n * 0.08 : 0.3 + m * 0.16) * (1 + Math.sin(clock * 1.8 + a) * 0.06);
        const h = i ? 0.12 + m * 0.08 : 0.2 + n * 0.08;
        add('taper', 'skin', px, py, h * 0.5, r * 0.5, h, r * 0.5);
        add('sac', i % 2 ? 'sprout' : 'S', px, py, h + r * 0.2, r, r * 0.86, r, a);
        if (fine) add('bead', 'S2', px, py, h + r * 0.58, r * 0.28);
      }
    },
    // Bundles that arch out of the ground.
    F(x, y, n, m) {
      const count = fine ? 3 : 1;
      for (let i = 0; i < count; i++) {
        const a = n * 3 + i * 1.05;
        const [px, py] = from(x, y, a + Math.PI / 2, (i - (count - 1) / 2) * 0.18);
        const size = 0.46 + ((m + i * 0.37) % 1) * 0.3;
        add('arch', i % 2 ? 'F2' : 'F', px, py, 0.02, size, size * (0.7 + n * 0.5), size * 1.5, a);
        add('bead', 'F', ...from(px, py, a, size / 2), 0.07, 0.14);
      }
    },
    // Crystals leaning out of broken plates.
    C(x, y, n, m) {
      if (fine) add('shell', 'stone', x, y, 0.03, 0.56, 0.2, 0.46, n * 6);
      add('crystal', 'C', x, y, 0.26, 0.26 + m * 0.1, 0.46 + n * 0.3, 0.26, n * 6, 0.2);
      for (let i = 0; i < (fine ? 2 + Math.floor(n * 2) : 1); i++) {
        const a = m * 6 + i * 2.2;
        add('crystal', i % 2 ? 'C2' : 'C', ...from(x, y, a, 0.24), 0.14, 0.14, 0.3 + (i % 2) * 0.1, 0.14, a, -0.55);
      }
    },
    // Neurons: a body, dendrites, and an axon to the next one with a spark running along it.
    N(x, y, n, m, i, j) {
      const h = 0.24 + n * 0.14;
      add('sac', 'N', x, y, h, 0.22, 0.22, 0.22, n * 6);
      add('bead', 'N2', x, y, h + 0.1, 0.1 + Math.max(0, Math.sin(clock * 2.4 + n * 6)) * 0.05);
      if (!fine) return;
      for (let k = 0; k < 4; k++) {
        const a = m * 6 + k * 1.57;
        const [px, py] = from(x, y, a, 0.3);
        limb('Nsoil', px, py, 0.03, x, y, h, 0.06, 'taper');
        add('bead', 'N', px, py, 0.06, 0.07);
      }
      // Along the row, or down to the next one.
      const down = (i * 3 + j * 5) % 4 === 0;
      const ni = i + (down ? 0 : 1);
      const nj = j + (down ? 1 : 0);
      if (depositAt(ni, nj) !== 'N' || cellAt(ni, nj)) return;
      const n2 = noise(ni, nj);
      const tx = ni + 0.5 + (n2 - 0.5) * 0.4;
      const ty = nj + 0.5 + (noise(nj + 4, ni + 9) - 0.5) * 0.4;
      const th = 0.24 + n2 * 0.14;
      limb('N', x, y, h, tx, ty, th, 0.025);
      const p = (clock * 0.8 + n) % 1;
      add('bead', 'N2', x + (tx - x) * p, y + (ty - y) * p, h + (th - h) * p, 0.08);
    },
  };

  // A crater with a maw: eggs for what is left inside, arms that curl shut while it sleeps.
  // A breach has four bodies. The first is the maw below, these are the others.
  const NESTS = [
    // A hive: stacked rings, one lit mouth for each share still inside.
    function hive(b, x, y, z, asleep, left, breath) {
      const skin = asleep ? 'sleep' : 'gore';
      const pale = asleep ? 'sleep2' : 'flesh';
      const floors = [[2.7, 0.3], [2.1, 0.78], [1.5, 1.2], [0.95, 1.56]];
      floors.forEach(([w, h], i) => {
        const swell = (1 + breath * (i % 2 ? 1 : -1)) * z;
        add('sac', i % 2 ? pale : skin, x, y, h * z, w * swell, 0.7 * z, w * swell, b.x + i);
        if (i === 3) return;
        const holes = fine ? 8 - i * 2 : 3;
        for (let j = 0; j < holes; j++) {
          const a = (j / holes) * TAU + i * 0.5 + b.y;
          const lit = (j * 3 + i) % 8 < left * 8;
          const at = from(x, y, a, w * 0.46 * z);
          add('bead', 'black', ...at, (h + 0.1) * z, 0.3 * z, 0.26 * z, 0.3 * z);
          if (lit) add('bead', asleep ? 'pink' : 'alarm', ...at, (h + 0.14) * z, 0.12 * z);
        }
      });
      add('lip', pale, x, y, 1.92 * z, 0.5 * z);
      add('ball', asleep ? 'sleep2' : 'alarm', x, y, 1.96 * z, 0.26 * z);
      if (asleep || !fine) return;
      // Awake, what lives in it circles the top.
      for (let i = 0; i < 9; i++) {
        const a = clock * (1.4 + (i % 3) * 0.4) + i * 0.7;
        add('bead', i % 2 ? 'alarm' : 'bone', ...from(x, y, a, (0.9 + (i % 4) * 0.35) * z), (1.5 + Math.sin(a * 2 + i) * 0.4) * z, 0.12);
      }
    },
    // A rift: a torn seam between leaning shards, lit from under.
    function rift(b, x, y, z, asleep, left, breath) {
      const along = b.x * 0.7 + b.y;
      const skin = asleep ? 'sleep' : 'gore';
      const open = (asleep ? 0.26 : 0.44 + breath) * z;
      const parts = fine ? 9 : 5;
      for (let i = 0; i < parts; i++) {
        const k = i / (parts - 1) - 0.5;
        const n = noise(i + b.x, b.y);
        const thin = 1 - Math.abs(k) * 1.5;
        const [px, py] = from(x, y, along, k * 4.8 * z, Math.sin(i * 2.2) * 0.18 * z);
        add('stain', 'black', px, py, 0.2, 0.8 * z, 0.06, (open * 2 + 0.2) * thin, along);
        add('bead', asleep ? 'pink' : 'alarm', px, py, 0.24, (asleep ? 0.14 : 0.3) * thin * z);
        for (const s of [-1, 1]) {
          const at = from(px, py, along + Math.PI / 2, s * (open + 0.36 * z));
          const tall = (0.5 + n * 0.9) * (0.4 + thin) * z;
          add('rock', skin, ...at, 0.2, 0.85 * z, 0.5 * z, 0.62 * z, along + n);
          const a = along + (s * Math.PI) / 2;
          add(i % 2 ? 'crystal' : 'horn', i % 3 ? 'bone' : asleep ? 'sleep2' : 'flesh2', ...at, tall / 2 + 0.1, 0.36 * z, tall, 0.36 * z, a, 0.45);
        }
      }
      const eggs = Math.ceil(left * 8);
      for (let i = 0; i < eggs; i++) {
        const [ex, ey] = from(x, y, along, ((i % 4) - 1.5) * 1.1 * z, (i < 4 ? 1 : -1) * 1.45 * z);
        add('sac', asleep ? 'sleep2' : 'flesh2', ex, ey, 0.3, 0.34 * z, 0.42 * z, 0.34 * z, i);
      }
    },
    // A cluster: pods on stalks round a knot, full or burst.
    function cluster(b, x, y, z, asleep, left, breath) {
      const skin = asleep ? 'sleep' : 'gore';
      const pale = asleep ? 'sleep2' : 'flesh';
      add('sac', skin, x, y, 0.35 * z, 1.5 * z, 0.8 * z, 1.5 * z, b.x);
      for (let i = 0; i < 7; i++) {
        const n = noise(i, b.x * 3 + b.y);
        const a = (i / 7) * TAU + n * 0.5;
        const sway = asleep ? 0 : Math.sin(clock * 2.4 + i) * 0.14;
        const tall = (0.6 + ((i * 3) % 4) * 0.36) * z;
        const [px, py] = from(x, y, a + sway, (0.9 + n * 0.9) * z);
        limb(skin, x, y, 0.35 * z, px, py, tall, 0.22 * z, 'taper');
        const full = i < Math.ceil(left * 7);
        const size = (full ? 0.8 + n * 0.4 + breath : 0.4) * z;
        add('sac', full ? pale : skin, px, py, tall + size * 0.2, size, size * 1.15, size, a);
        if (!full) continue;
        add('bead', asleep ? 'pink' : 'alarm', px, py, tall + size * 0.72, size * 0.28);
        if (fine) for (let j = 0; j < 3; j++) add('bead', asleep ? 'gore' : 'flesh2', ...from(px, py, a + j * 2.1, size * 0.4), tall + size * 0.3, 0.14 * z);
      }
      for (let i = 0; i < 6; i++) {
        const a = i * 1.047 + b.y;
        limb(skin, x, y, 0.3, ...from(x, y, a, 2.4 * z), 0.06, 0.3 * z, 'taper');
      }
    },
  ];
  function breaches(area) {
    for (const b of shownNests(area.x0, area.y0, area.x1, area.y1)) {
      if (cam.zoom < 6.5 && b.state !== 'spent') {
        const sleeping = b.state === 'sleep';
        const form = formOf(b);
        const wide = 3.4 * (1 + (b.tier || 0) * 0.12);
        const skin = sleeping ? 'sleep2' : 'flesh';
        if (form === 1) add('taper', skin, b.x + 0.5, b.y + 0.5, 0.9, wide, 2.6, wide);
        else if (form === 2) add('sac', skin, b.x + 0.5, b.y + 0.5, 0.4, wide * 1.6, 1.2, wide * 0.5, b.x);
        else if (form === 3) for (let i = 0; i < 4; i++) add('sac', skin, ...from(b.x + 0.5, b.y + 0.5, i * 1.57, wide * 0.3), 0.5, wide * 0.5);
        else add('lip', skin, b.x + 0.5, b.y + 0.5, 0.3, wide, 1.6, wide);
        add('ball', sleeping ? 'sleep' : 'alarm', b.x + 0.5, b.y + 0.5, 0.4, 1.5);
        continue;
      }
      if (b.x < area.x0 - 6 || b.x > area.x1 + 6 || b.y < area.y0 - 6 || b.y > area.y1 + 6) continue;
      const tier = b.tier || 0;
      // It fades as it dies, and stands bigger the farther it was dealt.
      // Hit, it swells a little and settles back: a spasm a third of a second long.
      const hurt = nestHurt(b), spasm = 1 + Math.sin(hurt * Math.PI) * 0.12;
      const fade = (b.state === 'spent' ? 1 - (G.time - b.ended) / 8 : 1) * (1 + tier * 0.08) * spasm;
      if (fade <= 0) continue;
      const x = b.x + 0.5;
      const y = b.y + 0.5;
      const asleep = b.state === 'sleep';
      const left = b.left / b.total;
      // Badly hurt, its breath turns uneven.
      const torn = b.max ? 1 - b.hp / b.max : 0;
      const breath = asleep ? Math.sin(clock * 0.8 + b.x) * 0.02 : Math.sin(clock * 5) * 0.08 + (torn > 0.4 ? Math.sin(clock * 13.7 + b.y) * 0.05 * torn : 0);
      if (hurt > 0) {
        // A red flash and spatter thrown out.
        add('ball', 'alarm', x, y, 0.6, (1.1 + (1 - hurt) * 0.6) * fade * hurt);
        for (let i = 0; i < 7; i++) {
          const a = i * 0.9 + b.x, out = (1 - hurt) * 2.2;
          add('bead', i % 2 ? 'gore' : 'alarm', ...from(x, y, a, 0.6 + out), 0.3 + out * hurt * 1.4, 0.16 * hurt + 0.04);
        }
      }
      if (fine && !asleep && torn > 0.4) for (let i = 0; i < 3; i++) {
        // Bleeding: drops running down its sides.
        const p = (clock * 0.5 + i / 3) % 1, a = i * 2.1 + b.y;
        add('bead', 'gore', ...from(x, y, a, 1.1 + p * 0.5), 1 - p * 0.9, 0.1 * (1 - p) + 0.03);
      }
      add('stain', asleep ? 'husk' : 'infected', x, y, 0.035, 7.2 * fade, 0.04, 7.2 * fade, b.x);
      for (let i = 0; i < tier * 3; i++) {
        // A crown of spines for what a level adds.
        const a = (i / (tier * 3)) * TAU + b.y;
        const tall = (0.6 + tier * 0.22) * Math.min(1, fade);
        add('horn', 'bone', ...from(x, y, a, 2.5 * fade), tall / 2, 0.42, tall, 0.42, a + Math.PI);
      }
      const form = formOf(b);
      if (form) {
        NESTS[form - 1](b, x, y, fade, asleep, left, breath);
        continue;
      }
      add('lip', asleep ? 'sleep2' : 'gore', x, y, 0.22, (2.1 + left * 0.3) * fade, 1.3 * fade, (2.1 + left * 0.3) * fade, b.y);
      add('stain', 'black', x, y, 0.3, 1.5 * fade, 0.05, 1.5 * fade);
      const rocks = fine ? 12 : 6;
      for (let i = 0; i < rocks; i++) {
        const n = noise(i, b.x + b.y);
        const a = (i / rocks) * TAU + n * 0.3;
        add('rock', asleep ? 'sleep' : 'gore', ...from(x, y, a, (1.3 + n * 0.3) * fade), 0.14, (0.4 + n * 0.4) * fade, (0.3 + n * 0.4) * fade, 0.4 * fade, a);
      }
      if (asleep) {
        // A closed lid, with one slit of light.
        add('shell', 'sleep2', x, y, 0.3, 1.36, 0.7 + breath, 1.36, b.x);
        add('box', 'pink', x, y, 0.76 + breath, 0.7, 0.04, 0.05, b.x);
      } else {
        add('sac', 'flesh', x, y, 0.3, (1.1 + breath) * fade, 0.4 * fade, (1.1 + breath) * fade, clock * 0.2);
        add('ball', 'alarm', x, y, 0.44, (0.42 + breath) * fade, 0.22 * fade, (0.42 + breath) * fade);
      }
      const teeth = fine ? 10 : 5;
      for (let i = 0; i < teeth; i++) {
        const a = (i / teeth) * TAU;
        const open = asleep ? 0.56 : 0.76 + breath;
        add('horn', 'bone', ...from(x, y, a, open * fade), 0.34, 0.4 * fade, 0.46 * fade, 0.4 * fade, a + Math.PI);
      }
      const eggs = Math.ceil(left * 8);
      for (let i = 0; i < eggs; i++) {
        const a = i * 0.785 + 0.3;
        const [ex, ey] = from(x, y, a, 1.05 * fade);
        add('sac', asleep ? 'sleep2' : 'flesh2', ex, ey, 0.3, 0.26 * fade, 0.36 * fade, 0.26 * fade, a);
        if (fine) add('bead', asleep ? 'gore' : 'alarm', ex, ey, 0.46, 0.1 * fade);
      }
      const joints = fine ? 6 : 3;
      for (let i = 0; i < 7; i++) {
        const a0 = i * 0.8976 + b.y;
        let [px, py] = from(x, y, a0, 1.25 * fade);
        let ph = 0.2;
        for (let j = 1; j <= joints; j++) {
          const k = j / joints;
          const a = a0 + (asleep ? k * 2.1 : Math.sin(clock * 2.6 + i + k * 3) * 0.5 * k);
          const step3 = (asleep ? 1.3 : 2.1) / joints;
          const [nx, ny] = from(px, py, a, step3 * fade);
          const nh = asleep ? 0.2 - k * 0.1 : 0.2 + Math.sin(k * Math.PI) * 0.22 + k * k * 0.12;
          const width = 0.3 * (1 - k * 0.72) * fade;
          limb(asleep ? 'sleep' : 'gore', px, py, ph, nx, ny, nh, width, 'taper');
          add('bead', asleep ? 'sleep2' : 'flesh', nx, ny, nh, width * 0.75);
          if (j === joints && !asleep) add('horn', 'bone', nx, ny, nh, 0.2, 0.24, 0.2, a);
          [px, py, ph] = [nx, ny, nh];
        }
      }
      if (asleep || !fine) continue;
      for (let i = 0; i < 12; i++) {
        const p = (clock * 0.35 + i / 12) % 1;
        add('bead', i % 3 ? 'flesh2' : 'alarm', ...from(x, y, i * 2.4 + p, p * 1.8), 0.5 + p * 1.8, 0.12 * (1 - p));
      }
    }
  }

  function organism() {
    const x = CORE.x + 0.5;
    const y = CORE.y + 0.5;
    const part = stagePart() ?? 0;
    const born = Math.min(1, (G.time - (G.grownAt ?? -99)) / 3);
    const reach = 1.3 + Math.max(0, G.stage + part - (1 - born)) * 1.6;
    // On the plinth the arms climb as a crown over it, a little taller each stage, held over its edge.
    const crown = coreCell()?.size === 3, tall = 1 + Math.min(3, Math.max(0, G.stage + part - (1 - born))) * 0.45;
    const arms = 6 + G.stage * 3;
    const joints = fine ? 9 : 4;
    for (let i = 0; i < arms; i++) {
      const a0 = i * 2.39996;
      const far = reach * (0.8 + (i % 4) * 0.13);
      let [px, py] = from(x, y, a0, crown ? 1.05 : 0.55);
      let ph = crown ? 0.6 : 0.2;
      let a = a0;
      for (let j = 1; j <= joints; j++) {
        const k = j / joints;
        a = a0 + Math.sin(i * 1.7 + k * 5) * 0.34 + Math.sin(clock * 0.9 + i + k * 4) * 0.16 * k;
        const [nx, ny] = crown ? from(x, y, a, 1.05 + Math.sin(k * Math.PI * 0.6) * 0.5 * Math.min(1, far / 4)) : from(px, py, a, Math.max(0.1, far - 0.55) / joints);
        const nh = crown ? 0.6 + k * tall * (0.85 + (i % 3) * 0.1) : 0.04 + Math.max(0, 0.16 * (1 - k * 2)) + (k === 1 ? 0.12 : 0);
        const width = (0.3 + G.stage * 0.05) * (1 - k * 0.66);
        limb(k > 0.7 ? 'skin2' : 'skin', px, py, ph, nx, ny, nh, width, 'taper');
        if (fine) add('bead', k > 0.7 ? 'skin2' : 'skin', nx, ny, nh, width * 0.8);
        if (fine && j % 3 === 1) add('bead', 'sprout', nx, ny, nh + width * 0.35, width * 0.34);
        [px, py, ph] = [nx, ny, nh];
      }
      if (!G.stage) continue;
      // Stage 1 buds, stage 2 opens them, stage 3 lights neurons.
      const kind = i % G.stage;
      const size = 0.2 + G.stage * 0.05;
      // Three bud colours, whatever the stage: from stage 4 the arms outnumber them.
      add('sac', ['S', 'pink', 'N'][kind % 3], px, py, ph + 0.06, size, size * 1.2, size, a);
      if (!fine || G.stage < 2) continue;
      for (let k = 0; k < 4; k++) {
        const p = a + k * 1.57;
        add('horn', 'skin2', ...from(px, py, p, size * 0.3), ph, size, size * 1.1, size, p);
      }
    }
    if (!fine) return;
    for (let i = 0; i < 10 + G.stage * 7; i++) {
      const p = (clock * 0.12 + noise(i, 3)) % 1;
      add('bead', 'acid', ...from(x, y, i * 2.4 + clock * 0.15, (0.6 + noise(i, 7)) * reach), 0.2 + p * 2.6, 0.08 * (1 - p));
    }
  }

  function links() {
    for (const c of Object.values(G.cells)) {
      if (c.type !== 'pump' || !c.to || !G.cells[c.to]) continue;
      const to = G.cells[c.to];
      const ax = c.x + 0.5;
      const ay = c.y + 0.5;
      const bx = to.x + 0.5;
      const by = to.y + 0.5;
      const length = span(c, to);
      const a = Math.atan2(by - ay, bx - ax);
      const broken = c.veinHp <= 0;
      add.ghost = c.veinCut ? 'scrap' : c.veinLeft > 0;
      if (broken) {
        // Torn: two limp halves.
        limb('gore', ax, ay, 0.1, ...from(ax, ay, a + 0.07, length * 0.4), 0.04, 0.24, 'taper');
        limb('gore', bx, by, 0.1, ...from(bx, by, a + Math.PI + 0.07, length * 0.4), 0.04, 0.24, 'taper');
        add('lip', 'alarm', (ax + bx) / 2, (ay + by) / 2, 0.05, 0.4);
        continue;
      }
      limb('gore', ax, ay, 0.06, bx, by, 0.06, 0.4);
      limb(leaking(c) ? 'alarm' : 'flesh', ax, ay, 0.13, bx, by, 0.13, 0.22);
      if (fine) {
        // Muscle rings squeezing along it.
        for (let d = 0.7; d < length - 0.4; d += 0.8) {
          const squeeze = Math.sin(clock * 6 - d * 2.2);
          add('lip', squeeze > 0.6 ? 'pink' : 'flesh2', ...from(ax, ay, a, d), 0.12, 0.3 + squeeze * 0.04, 0.3, 0.3 + squeeze * 0.04, a, LYING);
        }
      }
      add.ghost = false;
      for (const p of c.packets) {
        const [px, py] = from(ax, ay, a, length * Math.min(1, p.t));
        const r = 0.32 + Math.min(8, p.n) * 0.025;
        add('sac', 'pink', px, py, 0.2, r * 1.3, r, r, a);
        base(contentOf(p.item)[0], px, py, 0.42, 0.12);
      }
      if (leaking(c)) {
        for (let i = 0; i < 8; i++) {
          const p = (clock + i / 8) % 1;
          add('bead', 'alarm', ...from((ax + bx) / 2, (ay + by) / 2, i * 2.4, p), 0.2 + p * 0.6, 0.2 * (1 - p));
        }
      }
    }
    add.ghost = false;
    // The trail: paired glands, a wave of scent running along them.
    for (const t of Object.values(G.tracks)) {
      const a = facing(t.dir);
      const x = t.x + 0.5;
      const y = t.y + 0.5;
      const ready = built(t);
      for (const k of fine ? [0, 0.33, 0.66] : [0]) {
        const [px, py] = from(x, y, a, k);
        const wave = ready ? Math.max(0, Math.sin(clock * 5 - ((t.x + DX[t.dir] * k) * DX[t.dir] + (t.y + DY[t.dir] * k) * DY[t.dir]) * 1.6)) : 0;
        for (const s of [-1, 1]) add('bead', t.out != null ? 'alarm' : ready ? (wave > 0.8 ? 'acid' : 'scent') : 'site', ...from(px, py, a, 0, s * 0.13), 0.05, 0.1 + wave * 0.04, 0.05, 0.08, a);
      }
      if (fine && (t.x + t.y) % 3 === 0) arrow(ready ? 'scent' : 'site', x, y, 0.05, t.dir, 0.15);
    }
    // Nerves: sagging fibres with the message riding them.
    for (const w of G.wires) {
      let a = G.cells[w.a];
      let b = G.cells[w.b];
      if (!a || !b) continue;
      if (isGun(b)) [a, b] = [b, a];
      const live = carries(w);
      const length = span(a, b);
      const at = (k) => [a.x + 0.5 + (b.x - a.x) * k, a.y + 0.5 + (b.y - a.y) * k, 0.9 - Math.sin(k * Math.PI) * Math.min(0.5, length * 0.05)];
      // Short straight pieces along the sag, a bead at every joint so the fibre reads as one thread.
      const n = fine ? Math.max(6, Math.ceil(length * 2)) : 3, paint = !w.hp || w.out != null ? 'alarm' : live ? 'N' : 'site';
      for (let i = 0; i < n; i++) {
        limb(paint, ...at(i / n), ...at((i + 1) / n), 0.055);
        if (i) add('bead', paint, ...at(i / n), 0.06);
      }
      const gene = live && netOf(a)?.focus;
      if (!gene) continue;
      const count = Math.max(1, Math.ceil(length / 4));
      for (let i = 0; i < count; i++) {
        const [x, y, h] = at(((clock * 5) / Math.max(1, length) + i / count) % 1);
        cargo(gene, x, y, h + 0.12, Math.atan2(b.y - a.y, b.x - a.x), 0.4);
      }
    }
  }

  // What a tap would put there, on the plane where it would stand.
  let aimed = null;
  function ghost() {
    if (!aimed?.type) return;
    const { type, act, dir } = aimed;
    const { x, y } = centreOf(aimed);
    add.plane = true;
    add.ghost = act === 'no' ? 'scrap' : 'site';
    add.solid = 0;
    if (type === 'worm') add('sac', 'skin2', x, y, 0.34, 0.86, 0.6, 0.68);
    else if (type === 'track') arrow('scent', x, y, 0.06, dir, 0.3);
    else BUILDINGS[type]?.({ ...cell(type, aimed.x, aimed.y, dir), mk: aimed.mk }, x, y);
    add.ghost = false;
    add.plane = false;
  }
  function cells(area) {
    for (const c of Object.values(G.cells)) {
      if (c.x < area.x0 - 2 || c.x > area.x1 || c.y < area.y0 - 2 || c.y > area.y1) continue;
      const { x, y } = centreOf(c);
      const size = sizeOf(c);
      const waiting = !built(c);
      const doomed = aimed?.act === 'scrap' && !aimed.worm && aimed.x === c.x && aimed.y === c.y;
      add.ghost = c.cut || doomed ? 'scrap' : waiting;
      if (doomed) add.solid = 0.12;
      // Solid from the bottom up, as far as it stands: taken down, it goes from the top.
      if (waiting) add.solid = woven(c) * (size > 1 ? 1.6 : 0.9);
      BUILDINGS[c.type]?.(c, x, y);
      if (rankOf(c) > 1) rankKit(c, x, y, sizeOf(c));
      add.ghost = false;
      add.solid = 0;
      if (waiting) {
        // A hologram inside a scaffold, scanned from the bottom up.
        const frame = c.cut ? 'alarm' : 'holo';
        const out = size / 2 - 0.06;
        const tall = size > 1 ? 1.4 : 0.7;
        for (const a of [-1, 1]) {
          for (const b of [-1, 1]) {
            add('tube', frame, x + a * out, y + b * out, tall / 2, 0.035, tall, 0.035);
            add('bead', frame, x + a * out, y + b * out, tall + 0.02, 0.08);
          }
        }
        const h = 0.05 + woven(c) * tall;
        for (const s of [-1, 1]) {
          add('box', frame, x + s * out, y, h, 0.025, 0.025, out * 2);
          add('box', frame, x, y + s * out, h, out * 2, 0.025, 0.025);
        }
        continue;
      }
      const life = c.hp / maxHp(c);
      if (fine && life < 0.6) {
        for (let i = 0; i < 4; i++) {
          const p = (clock * 0.5 + i / 4 + c.x * 0.3) % 1;
          add('bead', i % 2 ? 'smoke' : 'ember', x + Math.sin(i * 3 + p * 2) * 0.22, y + Math.cos(i * 2) * 0.18, 0.5 + p * 1.1, i % 2 ? 0.14 + p * 0.3 : 0.08 * (1 - p));
        }
      }
      if (cam.zoom < 9) continue;
      for (const p of passing(c)) {
        // Swallowed: a lump through the body, what it holds showing on top.
        const bulge = Math.sin(p.done * Math.PI);
        const high = size > 1 ? 1.05 : 0.62;
        const swell = 0.3 + bulge * 0.22;
        add('sac', 'flesh2', p.x, p.y, high * (0.6 + bulge * 0.4), swell, swell * 0.8, swell);
        cargo(p.item, p.x, p.y, high * (0.6 + bulge * 0.4) + 0.22, 0, 0.42);
      }
      if ((isBelt(c) || isSplit(c) || c.type === 'sort') && c.item) {
        const p = along(c, c.from, exitOf(c), c.t);
        cargo(c.item, p.x, p.y, isBelt(c) ? 0.27 : 0.66, p.angle);
      }
      if (c.type === 'bridge') {
        c.lanes.forEach((lane, axis) => {
          if (!lane) return;
          const p = along(c, lane.dir, lane.dir, lane.t);
          cargo(lane.item, p.x, p.y, axis ? 0.58 : 0.24, p.angle);
        });
      }
    }
    for (const w of Object.values(G.ruins)) {
      if (buried(w)) continue;
      const { x, y } = centreOf(w);
      const wide = sizeOf(w);
      const seed = noise(w.x, w.y) * 6;
      add('stain', 'black', x, y, 0.03, wide, 0.03, wide, seed);
      add('hull', 'wreck', x, y, 0.12 * wide, 0.5 * wide, 0.24 * wide, 0.42 * wide, seed, 0.3);
      for (let i = 0; i < 5; i++) add('rock', 'wreck', ...from(x, y, seed + i * 1.26, 0.34 * wide), 0.08, 0.2, 0.16, 0.2, i);
      limb('steel', ...from(x, y, seed, -0.2), 0.1, ...from(x, y, seed, 0.2), 0.48, 0.06);
      add('bead', 'ember', ...from(x, y, seed + 1, 0.16), 0.26, 0.1 + Math.max(0, Math.sin(clock * 9 + seed)) * 0.04);
    }
  }

  // ---- What moves
  function worms() {
    for (const w of G.worms) {
      const moving = built(w) && !w.docked && !w.stuck;
      const k = moving ? Math.min(1, w.t + owed * WORM.speed) : 0;
      const next = moving && trackAfter(w.path[0]);
      const spots = w.path.map((id, i) => {
        const [x, y] = id.split(',').map((n) => Number(n) + 0.5);
        const to = i ? w.path[i - 1] : next && key(next.x, next.y);
        if (!moving || !to) return [x, y];
        const [tx, ty] = to.split(',').map((n) => Number(n) + 0.5);
        return [x + (tx - x) * k, y + (ty - y) * k];
      });
      const track = G.tracks[w.path[0]];
      add.ghost = w.cut || (aimed?.act === 'scrap' && aimed.worm === w) ? 'scrap' : !built(w);
      add.solid = add.ghost ? woven(w) * 0.7 : 0;
      for (let i = spots.length - 1; i >= 0; i--) {
        const [x, y] = spots[i];
        const before = spots[i - 1];
        const after = spots[i + 1];
        const a = before ? Math.atan2(before[1] - y, before[0] - x) : after ? Math.atan2(y - after[1], x - after[0]) : facing(track ? track.dir : 1);
        const step3 = moving ? Math.sin(clock * 16 - i * 1.4) : 0;
        const h = 0.34 + step3 * 0.04;
        if (before) limb('skin', x, y, 0.3, before[0], before[1], 0.3, 0.46);
        if (fine) {
          for (const s of [-1, 1]) {
            const swing = step3 * s * 0.1;
            limb('skin2', ...from(x, y, a, 0, s * 0.28), 0.22, ...from(x, y, a, swing, s * 0.52), 0.03, 0.1, 'taper');
          }
        }
        if (!i) {
          add('sac', 'skin2', x, y, h, 0.86, 0.6, 0.68, a);
          add('shell', 'bone', ...from(x, y, a, -0.05), h + 0.16, 0.66, 0.4, 0.58, a);
          const bite = Math.sin(clock * (moving ? 7 : 2)) * 0.05;
          for (const s of [-1, 1]) {
            const root = from(x, y, a, 0.3, s * 0.2);
            const bend = from(x, y, a, 0.58, s * (0.26 + bite));
            limb('bone', ...root, 0.3, ...bend, 0.26, 0.12, 'taper');
            limb('C2', ...bend, 0.26, ...from(x, y, a, 0.72, s * (0.08 + bite)), 0.22, 0.07, 'taper');
            add('bead', 'pale', ...from(x, y, a, 0.22, s * 0.16), h + 0.24, 0.12);
            if (fine) add('bead', 'cyan', ...from(x, y, a, 0.3, s * 0.07), h + 0.2, 0.07);
          }
          continue;
        }
        const hold = w.holds[i - 1];
        if (!hold) {
          add('sac', 'skin2', x, y, h - 0.04, 0.66, 0.46, 0.54, a);
          add('horn', 'bone', ...from(x, y, a, -0.22), h, 0.4, 0.44, 0.4, a + Math.PI);
          continue;
        }
        // A cargo segment: bone saddle, see-through belly, as full as its hold.
        add('sac', 'skin', x, y, h - 0.06, 0.94, 0.56, 0.84, a);
        for (const s of [-1, 1]) add('shell', 'bone', ...from(x, y, a, 0, s * 0.3), h + 0.06, 0.6, 0.24, 0.26, a);
        const full = hold.n / WORM.hold;
        if (hold.n) {
          add('ring', 'acid', x, y, h + 0.2, 0.3 + full * 0.3);
          cargo(hold.kind, x, y, h + 0.3, a, 0.46);
        }
        add('dome', 'membraneGlass', x, y, h + 0.14, 0.56, 0.4 + full * 0.36, 0.56);
      }
      add.ghost = false;
      add.solid = 0;
    }
  }

  // Four silhouettes, one per main base of the gene. The back always carries the three bases.
  function silhouette(gene) {
    if (gene[0] === gene[1] || gene[0] === gene[2]) return gene[0];
    return gene[1];
  }
  const BODY = {
    S: { long: 0.6, wide: 0.6, tall: 0.5, legs: 3, reach: 0.4 }, // bloated
    F: { long: 0.86, wide: 0.34, tall: 0.3, legs: 5, reach: 0.34 }, // centipede
    C: { long: 0.64, wide: 0.5, tall: 0.36, legs: 3, reach: 0.42 }, // armoured
    N: { long: 0.5, wide: 0.36, tall: 0.32, legs: 3, reach: 0.56 }, // stilts
  };
  // A swarmling: one insect of a cloud, its three segments the colours of its gene, wings a blur, never still.
  function swarmling(e, a, index) {
    const t = clock + index * 0.73, z = e.z || 0, flinch = flinchOf(e);
    // The cloud seethes: each one weaves round where the game puts it.
    const wx = Math.sin(t * 5.1 + index) * 0.16 + Math.sin(t * 9.7 + index * 2) * 0.05;
    const wy = Math.cos(t * 4.3 + index * 1.7) * 0.16;
    const x = e.x + wx, y = e.y + wy, h = 0.45 + Math.sin(t * 7 + index) * 0.12 + z;
    const head = a + Math.sin(t * 6 + index) * 0.5, s = 1.45 + flinch * 0.3;
    add('stain', 'husk', x, y, 0.02, 0.22, 0.02, 0.16, head);
    // A trail of fading motes where it just flew, in the colours of its gene.
    for (let k = 1; k <= 7; k++) {
      const back = t - k * 0.05, px = e.x + Math.sin(back * 5.1 + index) * 0.16 + Math.sin(back * 9.7 + index * 2) * 0.05;
      const py = e.y + Math.cos(back * 4.3 + index * 1.7) * 0.16, ph = 0.45 + Math.sin(back * 7 + index) * 0.12 + z;
      add('bead', e.gene[k % 3], px, py, ph, 0.1 * (1 - k / 8) * s);
    }
    // A pulse of light runs through the cloud, one insect after another.
    const wave = Math.max(0, Math.sin(clock * 3 - index * 0.8));
    if (wave > 0.6) add('bead', 'holo', x, y, h, 0.22 * s * wave);
    add('sac', 'smoke', x, y, h, 0.42 * s, 0.3 * s, 0.42 * s, head);
    add('bead', e.gene[0], ...from(x, y, head, -0.09 * s), h - 0.01, 0.11 * s);
    add('bead', e.gene[1], x, y, h, 0.09 * s);
    add('bead', e.gene[2], ...from(x, y, head, 0.08 * s), h + 0.01, 0.075 * s);
    add('bead', 'alarm', ...from(x, y, head, 0.12 * s), h + 0.03, 0.03);
    // Wings beat fast: the blur of two pale panes rising and falling.
    const beat = Math.sin(clock * 60 + index * 3);
    for (const side of [-1, 1]) add('box', 'glass', ...from(x, y, head, -0.01, side * 0.08), h + 0.05 + beat * 0.03, 0.12, 0.01, 0.07, head, side * (0.3 + beat * 0.6));
    if (fine) for (const side of [-1, 1]) limb('chitin', x, y, h - 0.03, ...from(x, y, head, 0.03, side * 0.07), h - 0.1, 0.012);
  }
  // A titan: two cells wide, low and heavy like a giant crab, plated in the colours of its gene; slow steps shake the ground.
  function titan(e, a, index) {
    const z = e.z || 0, flinch = flinchOf(e), grow = 1 + flinch * 0.06, t = clock * 0.5 + index;
    const breathe = 1 + Math.sin(t * 2.4) * 0.035;
    const at = (f, side = 0) => from(e.x, e.y, a, f * grow, side * grow);
    const sway = Math.sin(t * Math.PI * 2) * 0.06, h = 0.5 + Math.abs(Math.sin(t * Math.PI * 2)) * 0.03 + z;
    add('stain', 'husk', e.x, e.y, 0.02, 2.6 * grow, 0.02, 2.2 * grow, a);
    // Six legs splayed wide, knees high: one pair lifts at a time and falls with a ring on the ground.
    for (const [f, phase] of [[0.65, 0], [0, 1 / 3], [-0.65, 2 / 3]]) for (const side of [-1, 1]) {
      const k = (t + phase + (side > 0 ? 0.5 : 0)) % 1, up = k < 0.22 ? Math.sin((k / 0.22) * Math.PI) : 0;
      const swing = k < 0.22 ? -0.25 + (k / 0.22) * 0.5 : 0.25 - ((k - 0.22) / 0.78) * 0.5;
      const hip = at(f * 0.8, side * 0.6 + sway), knee = at(f * 0.95 + swing * 0.2, side * 1.05), foot = at(f * 1.1 + swing * 0.4, side * 1.6);
      limb('chitin', ...hip, h + 0.08, ...knee, h + 0.32 + up * 0.18, 0.3, 'taper');
      add('bead', e.gene[(f > 0 ? 0 : f < 0 ? 2 : 1)], ...knee, h + 0.34 + up * 0.18, 0.16);
      limb('chitin', ...knee, h + 0.32 + up * 0.18, ...foot, 0.04 + up * 0.28 + z, 0.2, 'taper');
      const landed = (k - 0.22 + 1) % 1;
      if (landed < 0.16 && !z) add('wave', 'smoke', ...foot, 0.04, 0.3 + landed * 6, 1, 0.3 + landed * 6);
    }
    // A broad low body, then plates laid over it like armour, overlapping back to front.
    add('sac', 'gore', ...at(0, sway), h + 0.1, 2.1 * breathe, 0.62, 1.7 * breathe, a);
    for (let i = 0; i < 3; i++) {
      const f = -0.6 + i * 0.5, glow = 0.85 + Math.sin(clock * 2 + i) * 0.15;
      add('shell', 'chitin', ...at(f, sway), h + 0.3 + i * 0.05, 0.95 * breathe, 0.3, 1.6 - i * 0.12, a, flinch * 0.25 * (i - 1));
      // The gene glows along each plate's crest and in two spots on it.
      add('box', e.gene[2 - i], ...at(f + 0.3, sway), h + 0.44 + i * 0.05, 0.08, 0.05, (1.3 - i * 0.12) * glow, a);
      for (const side of [-1, 1]) add('bead', e.gene[2 - i], ...at(f - 0.05, side * 0.32 + sway), h + 0.47 + i * 0.05, 0.13 * glow);
      for (const side of [-1, 1]) add('horn', 'bone', ...at(f + 0.1, side * (0.62 - i * 0.05) + sway), h + 0.52 + i * 0.05, 0.16, 0.36, 0.16, a + side * 0.6);
    }
    for (let i = 0; i < 4; i++) add('horn', 'bone', ...at(-0.5 + i * 0.35, sway), h + 0.62, 0.2, 0.5 - Math.abs(i - 1.5) * 0.1, 0.2, a);
    // Two vents breathe out gas: each puff rises, swells, drifts back and thins out.
    for (const side of [-1, 1]) {
      const [vx, vy] = at(-0.85, side * 0.42 + sway);
      add('tube', 'chitin', vx, vy, h + 0.45, 0.16, 0.22, 0.16);
      add('ring', 'infected', vx, vy, h + 0.57, 0.2, 0.5, 0.2, 0, LYING);
      for (let k = 0; k < 4; k++) {
        const life = (clock * 0.45 + k / 4 + (side > 0 ? 0.12 : 0) + index * 0.3) % 1;
        const [gx, gy] = from(vx, vy, a + Math.PI, life * 0.9);
        const size = 0.2 + life * 0.9;
        if (life < 0.75) add('sac', life < 0.2 ? 'membraneGlass' : 'smoke', gx, gy + Math.sin(life * 6 + k) * 0.1, h + 0.6 + life * 1.2, size * 0.8, size * 0.65, size * 0.8, a);
      }
    }
    // A wide head held low, mandibles working, two rows of red eyes.
    const head = at(1.2, sway);
    add('shell', 'chitin', ...head, h + 0.2, 0.8, 0.38, 1.0, a);
    add('box', e.gene[0], ...from(head[0], head[1], a, 0.05), h + 0.36, 0.06, 0.04, 0.7, a);
    add('sac', 'chitin', ...head, h + 0.05, 0.75, 0.4, 0.95, a);
    const bite = Math.sin(clock * 3.2 + index) * 0.1;
    for (const side of [-1, 1]) limb('bone', ...from(head[0], head[1], a, 0.3, side * 0.28), h, ...from(head[0], head[1], a, 0.85, side * (0.1 + bite)), h - 0.12, 0.16, 'taper');
    for (let i = 0; i < 8; i++) add('bead', 'alarm', ...from(head[0], head[1], a, 0.42, (i % 4 - 1.5) * 0.14), h + 0.22 + Math.floor(i / 4) * 0.1, 0.07);
    if (flinch > 0.2) add('bead', 'pale', e.x, e.y, h + 0.8, 0.6 * flinch);
  }
  // The dead lie flat and dark on a stain for 20 s, legs folded, then sink into the ground.
  function corpses(area) {
    for (const d of G.corpses || []) {
      if (d.x < area.x0 - 1 || d.x > area.x1 + 1 || d.y < area.y0 - 1 || d.y > area.y1 + 1 || !inSight(d.x, d.y)) continue;
      const sunk = corpseSunk(d);
      if (sunk >= 1) continue;
      const kind = silhouette(d.gene), body = d.kind === 'swarm' ? 0.3 : d.kind === 'titan' ? 3 : 1, long = BODY[kind].long * body, wide = BODY[kind].wide * body, low = 0.06 - sunk * 0.1, s = 1 - sunk * 0.4;
      add('stain', 'black', d.x, d.y, 0.03, long * 1.6 * s, 0.03, wide * 2 * s, d.a);
      add('sac', 'gore', d.x, d.y, low, long * 0.85 * s, 0.12 * s, wide * 0.9 * s, d.a);
      if (!fine) continue;
      for (const side of [-1, 1]) for (let leg = 0; leg < 2; leg++) {
        const f = (leg - 0.5) * long * 0.5;
        limb('chitin', ...from(d.x, d.y, d.a, f, side * wide * 0.25), low + 0.04, ...from(d.x, d.y, d.a, f + 0.08, side * wide * 0.6), low, 0.04);
      }
    }
  }
  // Four bodies, one per leading base, each read at a glance even zoomed out: a pulsing bloat full of spores, a
  // swaying centipede of six segments, a plated beetle with a horn, a spider high on four stilts. The gene glows
  // as three spots on the back, in the colours of its bases; a cluster of red eyes leads; legs step in a real gait.
  function creatures(area) {
    G.enemies.map(creatureAt).forEach((e, index) => {
      if (e.x < area.x0 - 1 || e.x > area.x1 + 1 || e.y < area.y0 - 1 || e.y > area.y1 + 1 || !inSight(e.x, e.y)) return;
      const goal = e.goal || { x: CORE.x + 0.5, y: CORE.y + 0.5 };
      const a = Math.atan2(goal.y - e.y, goal.x - e.x);
      if (e.kind === 'swarm') return swarmling(e, a, index);
      if (e.kind === 'titan') return titan(e, a, index);
      const kind = silhouette(e.gene);
      const flinch = flinchOf(e), grow = (1 + flinch * 0.18) * (1 + (e.tier || 0) * 0.12);
      const t = clock * (kind === 'N' ? 1.5 : kind === 'C' ? 0.7 : 1) + index * 1.7, z = e.z || 0;
      const at = (f, side = 0) => from(e.x, e.y, a, f * grow, side * grow);
      const genes = (f0, step, h) => { for (let i = 0; i < 3; i++) add('bead', e.gene[i], ...at(f0 - i * step), h + z, 0.1 * grow); };
      const eyes = (f, h, n, spread) => { for (let i = 0; i < n; i++) add('bead', 'alarm', ...at(f, (i - (n - 1) / 2) * spread), h + z + (i % 2) * 0.025, 0.05 * grow); };
      const leg = (f, side, reach, hipH, kneeUp, phase, width, paint = 'chitin') => {
        const swing = Math.sin(t * 9 + phase), lift = Math.max(0, Math.cos(t * 9 + phase)) * 0.06;
        const hip = at(f, side * 0.12), knee = at(f + swing * 0.05, side * reach * 0.55), foot = at(f + swing * 0.13, side * reach);
        limb(paint, ...hip, hipH + z, ...knee, hipH + kneeUp + lift + z, width, 'taper');
        limb('chitin', ...knee, hipH + kneeUp + lift + z, ...foot, 0.02 + lift + z, width * 0.7, 'taper');
      };
      if (!z) add('stain', 'husk', e.x, e.y, 0.02, (kind === 'N' ? 0.55 : 0.9) * grow, 0.02, (kind === 'N' ? 0.45 : 0.6) * grow, a);
      if (kind === 'S') {
        const pulse = 1 + Math.sin(t * 4) * 0.07, h = 0.36 + Math.abs(Math.sin(t * 5)) * 0.06;
        add('sac', 'membraneGlass', ...at(-0.05), h + z, 0.64 * pulse * grow, 0.54 * pulse * grow, 0.6 * pulse * grow, a);
        for (let i = 0; i < 5; i++) {
          const s = t * 1.3 + i * 1.26;
          add('bead', i % 2 ? 'S2' : 'S', ...at(-0.05 + Math.cos(s) * 0.13, Math.sin(s) * 0.13), h + z + Math.sin(s * 1.7) * 0.08, 0.09 * grow);
        }
        add('sac', 'flesh', ...at(0.3), h - 0.06 + z, 0.26 * grow, 0.22 * grow, 0.3 * grow, a);
        eyes(0.42, h - 0.02, 3, 0.07);
        genes(0.1, 0.14, h + 0.29 * pulse * grow);
        if (fine) for (const s of [-1, 1]) for (let i = 0; i < 3; i++) leg((i - 1) * 0.18, s, 0.36, h - 0.12, 0.05, i * 2 + (s > 0 ? Math.PI : 0), 0.065, 'flesh2');
      } else if (kind === 'F') {
        const h = 0.17;
        for (let i = 0; i < 6; i++) {
          const f = 0.42 - i * 0.17, c = at(f, Math.sin(t * 6 - i * 0.9) * 0.09 * (0.3 + i / 6));
          add('shell', i % 2 ? 'F' : 'chitin', ...c, h + z, 0.22 * grow, 0.14 * grow, 0.26 * grow, a);
          if (fine) for (const s of [-1, 1]) {
            const ph = t * 12 - i * 1.1 + (s > 0 ? Math.PI : 0);
            limb('chitin', ...c, h + z, ...from(c[0], c[1], a, Math.sin(ph) * 0.06, s * 0.26 * grow), 0.02 + Math.max(0, Math.cos(ph)) * 0.05 + z, 0.035, 'taper');
          }
        }
        const head = at(0.6);
        add('sac', 'gore', ...head, h + 0.02 + z, 0.2 * grow, 0.13 * grow, 0.22 * grow, a);
        for (const s of [-1, 1]) limb('bone', ...from(head[0], head[1], a, 0.05, s * 0.06), h + z, ...from(head[0], head[1], a, 0.2, s * (0.02 + Math.sin(t * 10) * 0.035)), h - 0.02 + z, 0.04, 'taper');
        eyes(0.66, h + 0.07, 2, 0.09);
        genes(0.25, 0.17, h + 0.1);
      } else if (kind === 'C') {
        const h = 0.2, open = flinch * 0.3;
        add('sac', 'gore', ...at(0), h + z, 0.62 * grow, 0.22 * grow, 0.5 * grow, a);
        for (let i = 0; i < 3; i++) add('shell', i === 1 ? 'C' : 'chitin', ...at(0.16 - i * 0.18), h + 0.07 + i * 0.01 + z, (0.38 - i * 0.02) * grow, (0.26 + open) * grow, 0.56 * grow, a, open * (i - 1));
        add('horn', 'C2', ...at(0.38), h + 0.08 + z, 0.28 * grow, 0.36 * grow, 0.28 * grow, a);
        eyes(0.36, h + 0.04, 4, 0.06);
        genes(0.2, 0.18, h + 0.25);
        if (fine) for (const s of [-1, 1]) for (let i = 0; i < 3; i++) leg((i - 1) * 0.2, s, 0.44, h, 0.12, i * 2.1 + (s > 0 ? Math.PI : 0), 0.065);
      } else {
        const h = 0.62 + Math.sin(t * 8) * 0.03;
        add('sac', 'gore', ...at(-0.04), h + z, 0.4 * grow, 0.28 * grow, 0.36 * grow, a);
        add('shell', 'N', ...at(-0.02), h + 0.08 + z, 0.36 * grow, 0.16 * grow, 0.32 * grow, a);
        add('sac', 'gore', ...at(0.2), h - 0.02 + z, 0.18 * grow, 0.16 * grow, 0.2 * grow, a);
        eyes(0.16, h, 4, 0.05);
        genes(0.09, 0.09, h + 0.15);
        for (const s of [-1, 1]) limb('N2', ...at(0.14, s * 0.05), h + 0.08 + z, ...at(0.4, s * 0.22), h + 0.38 + z, 0.022);
        for (const [f, s, ph] of [[0.12, -1, 0], [0.12, 1, Math.PI], [-0.12, -1, Math.PI], [-0.12, 1, 0]]) {
          const swing = Math.sin(t * 10 + ph), lift = Math.max(0, Math.cos(t * 10 + ph)) * 0.1;
          const hip = at(f, s * 0.14), knee = at(f * 1.8 + swing * 0.05, s * 0.42), foot = at(f * 2.6 + swing * 0.16, s * 0.6);
          limb('chitin', ...hip, h + z, ...knee, h + 0.2 + z, 0.075, 'taper');
          add('bead', 'N', ...knee, h + 0.2 + z, 0.07 * grow);
          limb('chitin', ...knee, h + 0.2 + z, ...foot, 0.02 + lift + z, 0.05, 'taper');
        }
      }
      if (flinch > 0.2) add('bead', 'pale', e.x, e.y, 0.5 + z, 0.3 * flinch);
    });
  }

  // Builders: a biomechanical body on four rotors. Legs trail in flight and spread to weave.
  function drones(area) {
    const s = Math.max(1, Math.min(1.8, 17 / cam.zoom));
    G.drones.forEach((d, index) => {
      const { x, y, h, w, a, goal, undo } = dronePose(d);
      if (x < area.x0 - 2 || x > area.x1 + 2 || y < area.y0 - 2 || y > area.y1 + 2) return;
      const flying = Math.max(0, Math.min(1, h - 0.6));
      const speed = Math.min(1, Math.hypot(d.x - d.was.x, d.y - d.was.y) * 2);
      const dip = speed * (1 - w) * 0.36;
      const bob = Math.sin(clock * 7 + index * 2) * 0.05 * flying;
      // Nose down when it travels.
      const part = (f, side, up) => [...from(x, y, a, f * s, side * s), h + bob + (up - f * dip) * s];
      const piece = (shape, paint, f, side, up, sx, sy, sz, roll = 0) => add(shape, paint, ...part(f, side, up), sx * s, sy * s, sz * s, a, roll);
      const bone = (paint, one, two, width, shape) => limb(paint, ...part(...one), ...part(...two), width * s, shape);
      piece('sac', 'skin2', -0.14, 0, 0, 0.3, 0.22, 0.24);
      piece('bead', w > 0.5 ? 'amber' : 'acid', -0.22, 0, 0.09, 0.11, 0.08, 0.11);
      piece('hull', 'steel2', 0.06, 0, 0.02, 0.3, 0.13, 0.2, -dip);
      piece('shell', 'bone', 0.02, 0, 0.07, 0.32, 0.18, 0.24, -dip);
      piece('hull', 'hazard', -0.07, 0, 0.14, 0.05, 0.04, 0.2, -dip);
      piece('bead', 'pale', 0.22, 0, 0.05, 0.12, 0.1, 0.14);
      for (const side of [-1, 1]) piece('bead', 'cyan', 0.19, side * 0.09, 0.1, 0.06, 0.06, 0.06);
      for (const fore of [-1, 1]) {
        for (const side of [-1, 1]) {
          const tip = [fore * 0.19, side * 0.25, 0.12];
          bone('chrome', [fore * 0.06, side * 0.07, 0.05], tip, 0.05, 'taper');
          piece('ring', 'steel2', ...tip, 0.23, 0.5, 0.23);
          if (flying) piece('tube', 'glass', ...tip, 0.2, 0.01, 0.2);
          piece('bead', fore > 0 ? 'cyan' : 'alarm', tip[0] + fore * 0.11, tip[1], tip[2], 0.07, 0.06, 0.07);
          const spin = (flying ? clock * 34 : 0) + fore + side + index;
          const [rx, ry, rh] = part(...tip);
          add('box', 'smoke', rx, ry, rh + 0.02, 0.21 * s, 0.012, 0.03 * s, spin);
          if (flying) add('box', 'smoke', rx, ry, rh + 0.02, 0.21 * s, 0.012, 0.03 * s, spin + 1.57);
          if (!fine) continue;
          const twitch = Math.sin(clock * 16 + fore * 2 + side) * 0.06 * w;
          const knee = [fore * 0.16 - speed * 0.12, side * (0.12 + w * 0.1), -0.08 + twitch];
          const foot = [fore * 0.12 - speed * 0.26 + w * 0.16, side * (0.1 + w * 0.06), -0.2 - w * 0.12 - twitch];
          bone('steel2', [fore * 0.07, side * 0.06, -0.02], knee, 0.05, 'taper');
          bone('bone', knee, foot, 0.04, 'taper');
        }
      }
      if (!goal || w < 0.5) return;
      // Three threads sweep the height the site has reached, and throw sparks.
      const c = cellAt(Math.floor(goal.x), Math.floor(goal.y));
      const level = c && !built(c) ? 0.05 + woven(c) * 0.75 : 0.15;
      for (let i = 0; i < 3; i++) {
        const tx = goal.x + Math.sin(clock * 7 + i * 2.1 + index) * 0.36;
        const ty = goal.y + Math.cos(clock * 5 + i * 2.1 + index) * 0.36;
        limb(undo ? 'alarm' : i ? 'cyan' : 'acid', ...part(0.24, (i - 1) * 0.06, -0.08), tx, ty, level, 0.025);
        add('bead', i ? 'pale' : 'amber', tx, ty, level, 0.1 + Math.sin(clock * 31 + i) * 0.03);
        for (let j = 0; j < (fine ? 4 : 1); j++) {
          const fall = (clock * 2.4 + j / 4 + i * 0.31) % 1;
          const spray = j * 2.4 + i + Math.floor(clock * 2.4 + j / 4 + i * 0.31);
          const away = fall * 0.42;
          add('bead', j % 2 ? 'ember' : 'amber', tx + Math.cos(spray) * away, ty + Math.sin(spray) * away, Math.max(0.03, level + fall * 0.7 - fall * fall * 1.1), 0.07 * (1 - fall));
        }
      }
    });
  }

  function shots() {
    for (const s of G.shots) {
      const paint = { 1: 'steel2', 2: 'pink', 5: 'amber', 12: 'acid' }[s.hurt];
      const a = Math.atan2(s.ty - s.y, s.tx - s.x);
      const far = s.gun === 'sting';
      const muzzle = from(s.x, s.y, a, far ? 0.86 : 0.6, (s.barrel || 0) * 0.19);
      const high = far ? 0.875 : s.gun === 'maw' ? 0.52 : 0.68;
      limb(paint, ...muzzle, high, s.tx, s.ty, 0.36, (s.hurt === 12 ? 0.11 : 0.06) * (far ? 1.5 : 1));
      if (far) {
        for (let i = 1; i < 5; i++) {
          const k = i / 5;
          add('ring', paint, muzzle[0] + (s.tx - muzzle[0]) * k, muzzle[1] + (s.ty - muzzle[1]) * k, high + (0.36 - high) * k, 0.3, 0.24, 0.3, a, LYING);
        }
      }
      add('bead', paint, s.tx, s.ty, 0.36, (s.hurt === 12 ? 0.4 : 0.22) * (far ? 1.5 : 1));
      if (fine && s.hurt >= 5) for (let i = 0; i < 5; i++) add('cone', paint, ...from(s.tx, s.ty, i * 1.257, 0.26), 0.4, 0.07, 0.3, 0.07, i * 1.257, LYING);
    }
  }

  return {
    SHAPES,
    PAINT,
    CASTERS,
    draw(brush, area) {
      add = brush;
      clock = G.time + owed;
      fine = cam.zoom >= 16;
      fields(area);
      breaches(area);
      organism();
      links();
      aimed = preview();
      cells(area);
      ghost();
      worms();
      corpses(area);
      creatures(area);
      shots();
      drones(area);
    },
  };
};
