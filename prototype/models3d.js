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
    Nsoil: ['#0C2A31', 0.06, 1, 0.4],
    flesh: ['#7C2A3D', 0.07, 1, 0.9], flesh2: ['#A8485C', 0.12, 1, 0.9], pink: ['#E8738A', 0.28, 1, 0.8],
    gore: ['#32151C', 0.02, 1, 0.8], chitin: ['#241319', 0.02, 1, 1], bone: ['#A89C84', 0.03, 1, 0.5],
    skin: ['#22401D', 0.03, 1, 0.7], skin2: ['#366426', 0.07, 1, 0.8], sprout: ['#5E9E2B', 0.22, 1, 0.8],
    sleep: ['#302B29', 0.02, 1, 0.3], sleep2: ['#4C3D3C', 0.03, 1, 0.3], wreck: ['#231E1D', 0, 1, 0.15], ember: ['#FF6A3C', 0.8, 1, 0.2],
    infected: ['#4A1420', 0.08, 0.45, 0.2], husk: ['#15191A', 0, 0.45, 0.05], smoke: ['#59605F', 0, 0.22, 0],
    site: ['#55D6E8', 0.25, 0.26, 0.1], scrap: ['#FF5A5A', 0.25, 0.28, 0.1], holo: ['#55D6E8', 0.6, 0.7, 0.1], scent: ['#9FDC3C', 0.45, 0.75, 0.1],
  };
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
  function nozzle(x, y, dir, h, light) {
    const a = facing(dir);
    const [bx, by] = from(x, y, a, 0.39);
    add('hull', 'steel2', bx, by, h, 0.2, 0.2, 0.3, a);
    add('box', 'black', bx, by, h + 0.02, 0.22, 0.1, 0.16, a);
    arrow(light, ...from(x, y, a, 0.4), h + 0.12, dir, 0.16);
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
    const speed = 4 * rate();
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
        piece('box', 'rail', 0.25, 0.16, 0.07, 0.12, (0.4 / n) * 1.2);
        piece('box', 'rail', 0.75, 0.16, 0.07, 0.12, (1.2 / n) * 1.12);
        if (fine) piece('box', 'slat', 0.5, 0.147, 0.4, 0.012, 0.03);
      }
      return sides;
    }
    const open = new Set([c.dir, ...sides]);
    add('box', 'rubber', x, y, 0.08, 0.46, 0.13, 0.46);
    for (let side = 0; side < 4; side++) {
      const a = facing(side);
      if (!open.has(side)) {
        add('box', 'rail', ...from(x, y, a, 0.25), 0.16, 0.07, 0.12, 0.56, a);
        continue;
      }
      add('box', 'rubber', ...from(x, y, a, 0.365), 0.08, 0.27, 0.13, 0.46, a);
      for (const s of [-1, 1]) {
        add('box', 'rail', ...from(x, y, a, 0.385, s * 0.25), 0.16, 0.25, 0.12, 0.07, a);
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
      arrow(on ? 'lime' : 'alarm', ...from(x, y, a, 0.4), 0.24, c.dir, 0.17);
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
        arrow(c.ways?.[axis] != null ? 'acid' : 'chrome', x + DX[way] * 0.42, y + DY[way] * 0.42, axis ? 0.42 : 0.2, way, 0.17);
      }
    },

    // A rotor whose blade shows where the next item leaves.
    split(c, x, y) {
      footing(x, y, 0.84);
      add('hull', 'steel', x, y, 0.28, 0.66, 0.3, 0.66);
      const exits = [3, 0, 1].map((t) => (c.dir + t) % 4);
      for (const d of exits) nozzle(x, y, d, 0.24, 'chrome');
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
      nozzle(x, y, c.dir, 0.22, 'chrome');
      nozzle(x, y, side, 0.22, 'acid');
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
      const kind = depositAt(c.x, c.y) || 'S';
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
      nozzle(x, y, c.dir, 0.24, 'pink');
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
      nozzle(x, y, c.dir, 0.27, 'acid');
      if (c.item) cargo(c.item, ...from(x, y, out, 0.3), 0.5, out, 0.34);
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
      nozzle(x, y, c.dir, 0.25, 'acid');
    },

    // A sac in a bone cradle, swelling and lighting its nodes as it fills.
    cyst(c, x, y) {
      const full = c.stock.length / 60;
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
      nozzle(x, y, c.dir, 0.22, 'pink');
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
        const out = c.unload ? (d + 2) % 4 : d;
        limb('skin2', x + DX[d] * 0.2, y + DY[d] * 0.2, 0.3, x + DX[d] * 0.56, y + DY[d] * 0.56, 0.12, 0.2, 'taper');
        arrow('acid', x + DX[out] * 0.43, y + DY[out] * 0.43, 0.36, out, 0.17);
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

  // ---- The ground
  function fields(area) {
    for (const [kind, x, y, w, h] of fieldsIn(area.x0, area.y0, area.x1, area.y1)) {
      // From very far, one big sign for a field.
      if (cam.zoom < 6.5) {
        base(kind, x + w / 2, y + h / 2, 0.8, Math.min(w, h) * 0.22);
        continue;
      }
      for (let i = x; i < x + w; i++) {
        for (let j = y; j < y + h; j++) {
          if (i < area.x0 - 1 || i > area.x1 + 1 || j < area.y0 - 1 || j > area.y1 + 1) continue;
          const n = noise(i, j);
          const m = noise(j + 4, i + 9);
          const cx = i + 0.5;
          const cy = j + 0.5;
          const covered = G.cells[key(i, j)];
          if (covered) {
            if (covered.type !== 'mine') base(kind, cx - 0.38, cy + 0.38, 0.12, 0.08);
            continue;
          }
          if (cam.zoom < 9 && (i + j) % 2) continue;
          GROWTH[kind](cx + (n - 0.5) * 0.4, cy + (m - 0.5) * 0.4, n, m, i, j);
        }
      }
    }
  }
  const GROWTH = {
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
      if (depositAt(ni, nj) !== 'N' || G.cells[key(ni, nj)]) return;
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
  function breaches(area) {
    for (const b of breachesIn(area.x0, area.y0, area.x1, area.y1)) {
      if (cam.zoom < 6.5 && b.state !== 'spent') {
        const sleeping = b.state === 'sleep';
        add('lip', sleeping ? 'sleep2' : 'flesh', b.x + 0.5, b.y + 0.5, 0.3, 3.4, 1.6, 3.4);
        add('ball', sleeping ? 'sleep' : 'alarm', b.x + 0.5, b.y + 0.5, 0.4, 1.5);
        continue;
      }
      if (b.x < area.x0 - 6 || b.x > area.x1 + 6 || b.y < area.y0 - 6 || b.y > area.y1 + 6) continue;
      const fade = b.state === 'spent' ? 1 - (G.time - b.ended) / 8 : 1;
      if (fade <= 0) continue;
      const x = b.x + 0.5;
      const y = b.y + 0.5;
      const asleep = b.state === 'sleep';
      const left = b.left / b.total;
      const breath = asleep ? Math.sin(clock * 0.8 + b.x) * 0.02 : Math.sin(clock * 5) * 0.08;
      add('stain', asleep ? 'husk' : 'infected', x, y, 0.035, 7.2 * fade, 0.04, 7.2 * fade, b.x);
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
    const want = STAGES[G.stage];
    const part = !want ? 0 : want.rate ? G.held / want.hold : G.fed / want.count;
    const born = Math.min(1, (G.time - (G.grownAt ?? -99)) / 3);
    const reach = 1.3 + Math.max(0, G.stage + part - (1 - born)) * 1.6;
    const arms = 6 + G.stage * 3;
    const joints = fine ? 9 : 4;
    for (let i = 0; i < arms; i++) {
      const a0 = i * 2.39996;
      const far = reach * (0.8 + (i % 4) * 0.13);
      let [px, py] = from(x, y, a0, 0.55);
      let ph = 0.2;
      let a = a0;
      for (let j = 1; j <= joints; j++) {
        const k = j / joints;
        a = a0 + Math.sin(i * 1.7 + k * 5) * 0.34 + Math.sin(clock * 0.9 + i + k * 4) * 0.16 * k;
        const [nx, ny] = from(px, py, a, Math.max(0.1, far - 0.55) / joints);
        const nh = 0.04 + Math.max(0, 0.16 * (1 - k * 2)) + (k === 1 ? 0.12 : 0);
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
      add('sac', ['S', 'pink', 'N'][kind], px, py, ph + 0.06, size, size * 1.2, size, a);
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
        base(p.item[0], px, py, 0.42, 0.12);
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
      if (b.type === 'turret') [a, b] = [b, a];
      const live = carries(w);
      const length = span(a, b);
      const at = (k) => [a.x + 0.5 + (b.x - a.x) * k, a.y + 0.5 + (b.y - a.y) * k, 0.9 - Math.sin(k * Math.PI) * Math.min(0.5, length * 0.05)];
      const n = fine ? Math.max(4, Math.ceil(length)) : 2;
      for (let i = 0; i < n; i++) limb(!w.hp || w.out != null ? 'alarm' : live ? 'N' : 'site', ...at(i / n), ...at((i + 1) / n), 0.055);
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
    const x = aimed.x + 0.5;
    const y = aimed.y + 0.5;
    add.plane = true;
    add.ghost = act === 'no' ? 'scrap' : 'site';
    add.solid = 0;
    if (type === 'worm') add('sac', 'skin2', x, y, 0.34, 0.86, 0.6, 0.68);
    else if (type === 'track') arrow('scent', x, y, 0.06, dir, 0.3);
    else BUILDINGS[type]?.(cell(type, aimed.x, aimed.y, dir), x, y);
    add.ghost = false;
    add.plane = false;
  }
  function cells(area) {
    for (const c of Object.values(G.cells)) {
      if (c.x < area.x0 - 1 || c.x > area.x1 || c.y < area.y0 - 1 || c.y > area.y1) continue;
      const x = c.x + 0.5;
      const y = c.y + 0.5;
      const waiting = !built(c);
      const doomed = aimed?.act === 'scrap' && !aimed.worm && aimed.x === c.x && aimed.y === c.y;
      add.ghost = c.cut || doomed ? 'scrap' : waiting;
      if (doomed) add.solid = 0.12;
      // Solid from the bottom up, as far as it stands: taken down, it goes from the top.
      if (waiting) add.solid = woven(c) * 0.9;
      BUILDINGS[c.type]?.(c, x, y);
      add.ghost = false;
      add.solid = 0;
      if (waiting) {
        // A hologram inside a scaffold, scanned from the bottom up.
        const frame = c.cut ? 'alarm' : 'holo';
        for (const a of [-1, 1]) {
          for (const b of [-1, 1]) {
            add('tube', frame, x + a * 0.44, y + b * 0.44, 0.35, 0.035, 0.7, 0.035);
            add('bead', frame, x + a * 0.44, y + b * 0.44, 0.72, 0.08);
          }
        }
        const h = 0.05 + woven(c) * 0.7;
        for (const s of [-1, 1]) {
          add('box', frame, x + s * 0.44, y, h, 0.025, 0.025, 0.88);
          add('box', frame, x, y + s * 0.44, h, 0.88, 0.025, 0.025);
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
      if ((isBelt(c) || c.type === 'split' || c.type === 'sort') && c.item) {
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
    for (const [id, w] of Object.entries(G.ruins)) {
      if (G.cells[id]) continue;
      const x = w.x + 0.5;
      const y = w.y + 0.5;
      const seed = noise(w.x, w.y) * 6;
      add('stain', 'black', x, y, 0.03, 1, 0.03, 1, seed);
      add('hull', 'wreck', x, y, 0.12, 0.5, 0.24, 0.42, seed, 0.3);
      for (let i = 0; i < 5; i++) add('rock', 'wreck', ...from(x, y, seed + i * 1.26, 0.34), 0.08, 0.2, 0.16, 0.2, i);
      limb('steel', ...from(x, y, seed, -0.2), 0.1, ...from(x, y, seed, 0.2), 0.48, 0.06);
      add('bead', 'ember', ...from(x, y, seed + 1, 0.16), 0.26, 0.1 + Math.max(0, Math.sin(clock * 9 + seed)) * 0.04);
    }
  }

  // ---- What moves
  function worms() {
    for (const w of G.worms) {
      const moving = built(w) && !w.docked && !w.stuck;
      const k = moving ? Math.min(1, w.t + owed * WORM.speed * rate()) : 0;
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
  function creatures(area) {
    G.enemies.forEach((e, index) => {
      if (e.x < area.x0 - 1 || e.x > area.x1 + 1 || e.y < area.y0 - 1 || e.y > area.y1 + 1) return;
      const goal = e.goal || { x: CORE.x + 0.5, y: CORE.y + 0.5 };
      const a = Math.atan2(goal.y - e.y, goal.x - e.x);
      const kind = silhouette(e.gene);
      const { long, wide, tall, legs, reach } = BODY[kind];
      const h = (kind === 'N' ? 0.4 : 0.26) + Math.sin(clock * 10 + index) * 0.025;
      const rear = from(e.x, e.y, a, -long * 0.24);
      const head = from(e.x, e.y, a, long * 0.48);
      add('sac', kind === 'S' ? 'flesh' : 'gore', ...rear, h, long * 0.8, tall, wide, a);
      add('shell', 'chitin', ...from(e.x, e.y, a, long * 0.12), h + 0.03, long * 0.56, tall * 1.1, wide * 0.82, a);
      add('sac', 'flesh', ...head, h, 0.24, 0.22, 0.26, a);
      for (let i = 0; i < 3; i++) base(e.gene[i], ...from(e.x, e.y, a, (0.5 - i * 0.5) * long * 0.8), h + tall * 0.62, 0.065, a);
      const bite = Math.sin(clock * 12 + index) * 0.04;
      for (const s of [-1, 1]) {
        add('bead', 'alarm', ...from(head[0], head[1], a, 0.08, s * 0.07), h + 0.09, 0.075);
        limb('bone', ...from(head[0], head[1], a, 0.08, s * 0.09), h, ...from(head[0], head[1], a, 0.26, s * (0.05 + bite)), h - 0.06, 0.07, 'taper');
        if (!fine) continue;
        for (let leg = 0; leg < legs; leg++) {
          const step3 = Math.sin(clock * 14 + leg * 2 + s + index);
          const f = (leg / (legs - 1) - 0.5) * long * 0.8;
          const hip = from(e.x, e.y, a, f, s * wide * 0.3);
          const knee = from(e.x, e.y, a, f + step3 * 0.04, s * reach * 0.75);
          const foot = from(e.x, e.y, a, f + step3 * 0.1, s * reach);
          const lift = h + 0.16 + Math.max(0, step3) * 0.04;
          limb('flesh', ...hip, h, ...knee, lift, 0.075, 'taper');
          limb('chitin', ...knee, lift, ...foot, 0.02, 0.06, 'taper');
        }
      }
      if (!fine) return;
      if (kind === 'S') for (let i = 0; i < 4; i++) add('bead', 'flesh2', ...from(rear[0], rear[1], i * 1.57 + 0.7, 0.18), h + 0.16, 0.14);
      if (kind === 'F') for (let i = 0; i < 3; i++) add('ring', 'flesh', ...from(e.x, e.y, a, -0.3 + i * 0.22), h, 0.32, 0.32, 0.34, a, LYING);
      if (kind === 'C') for (const s of [-1, 1]) add('horn', 'bone', ...from(head[0], head[1], a, -0.04, s * 0.14), h + 0.06, 0.3, 0.32, 0.3, a);
      if (kind === 'N') for (const s of [-1, 1]) limb('N', ...head, h + 0.08, ...from(head[0], head[1], a, 0.3, s * 0.16), h + 0.3, 0.03);
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
      const c = G.cells[`${Math.floor(goal.x)},${Math.floor(goal.y)}`];
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
      const muzzle = from(s.x, s.y, a, 0.6);
      limb(paint, ...muzzle, 0.68, s.tx, s.ty, 0.36, s.hurt === 12 ? 0.11 : 0.06);
      add('bead', paint, s.tx, s.ty, 0.36, s.hurt === 12 ? 0.4 : 0.22);
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
      creatures(area);
      shots();
      drones(area);
    },
  };
};
