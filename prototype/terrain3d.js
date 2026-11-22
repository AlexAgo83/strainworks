// The ground of the 3D view: endless living terrain, with worn steel plates left over it in patches.
// It is made by chunks round the camera, and every part is a function of where it is, so chunks meet seamlessly.
// It is decor: it reads the game state and never changes it. It settles to height 0 under whatever is built,
// so what is built sits on the plane a finger points at.
window.createTerrain3D = (B, scene, glow) => {
  const CHUNK = 32; // cells per piece of ground
  const FINE = 0.5; // cells between two vertices
  const COARSE = 2; // the same seen from very far, without roots or small things
  const BUDGET = 8; // ms a frame may spend making ground
  const PLATE = 0.014; // top of the steel
  const GRAIN = 7.3; // cells one tile of grain covers
  const REACH = 1.4; // how far around a building the ground is packed down
  const TAU = Math.PI * 2;
  const still = STILL; // the system's wish, or the one picked in the menu

  const clamp = (v, low = 0, high = 1) => Math.max(low, Math.min(high, v));
  const mix = (a, b, t) => a + (b - a) * t;
  const smooth = (low, high, v) => {
    const t = clamp((v - low) / (high - low));
    return t * t * (3 - 2 * t);
  };
  function hash(x, y, seed = 0) {
    let n = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 1442695041);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }
  // Value noise. With a period it tiles, for the grain texture.
  function noise(x, y, seed, period = 0) {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const fx = x - ix;
    const fy = y - iy;
    const u = fx * fx * (3 - 2 * fx);
    const v = fy * fy * (3 - 2 * fy);
    const wrap = (n) => (period ? ((n % period) + period) % period : n);
    const a = hash(wrap(ix), wrap(iy), seed);
    const b = hash(wrap(ix + 1), wrap(iy), seed);
    const c = hash(wrap(ix), wrap(iy + 1), seed);
    const d = hash(wrap(ix + 1), wrap(iy + 1), seed);
    return mix(mix(a, b, u), mix(c, d, u), v);
  }
  function fractal(x, y, seed, octaves) {
    let sum = 0;
    let total = 0;
    for (let i = 0, f = 1, weight = 1; i < octaves; i++, f *= 2, weight /= 2) {
      sum += noise(x * f, y * f, seed + i) * weight;
      total += weight;
    }
    return sum / total;
  }

  // ---- Close-up grain: cracked crust, grit and small bumps, tiled every 7.3 cells.
  function grain() {
    const n = 512;
    const cells = 9;
    const tall = new Float32Array(n * n);
    const shade = new Float32Array(n * n);
    for (let py = 0; py < n; py++) {
      for (let px = 0; px < n; px++) {
        const u = px / n;
        const v = py / n;
        const fine = noise(u * 48, v * 48, 21, 48);
        const grit = noise(u * 128, v * 128, 22, 128);
        const soft = noise(u * 8, v * 8, 23, 8);
        const x = u * cells + (noise(u * 16, v * 16, 24, 16) - 0.5) * 0.7;
        const y = v * cells + (noise(u * 16, v * 16, 25, 16) - 0.5) * 0.7;
        let first = 9;
        let second = 9;
        for (let i = -1; i < 2; i++) {
          for (let j = -1; j < 2; j++) {
            const cx = Math.floor(x) + i;
            const cy = Math.floor(y) + j;
            const wx = (cx + cells) % cells;
            const wy = (cy + cells) % cells;
            const d = Math.hypot(cx + hash(wx, wy, 26) - x, cy + hash(wx, wy, 27) - y);
            if (d < first) {
              second = first;
              first = d;
            } else if (d < second) second = d;
          }
        }
        const crack = (1 - smooth(0.015, 0.075, second - first)) * smooth(0.5, 0.68, soft);
        const pebble = smooth(0.78, 0.9, fine);
        const k = py * n + px;
        tall[k] = fine * 0.5 + soft * 0.6 + grit * 0.14 + pebble * 0.35 - crack * 0.7;
        shade[k] = clamp(0.48 + (soft - 0.5) * 0.3 + (fine - 0.5) * 0.22 + (grit - 0.5) * 0.16 + pebble * 0.12 - crack * 0.26);
      }
    }
    // Two maps of the same grain: how bright, and which way it leans.
    const bright = new Uint8Array(n * n * 4);
    const bumps = new Uint8Array(n * n * 4);
    for (let py = 0; py < n; py++) {
      for (let px = 0; px < n; px++) {
        const k = py * n + px;
        const dx = (tall[py * n + ((px + n - 1) % n)] - tall[py * n + ((px + 1) % n)]) * 5;
        const dy = (tall[((py + n - 1) % n) * n + px] - tall[((py + 1) % n) * n + px]) * 5;
        const long = Math.hypot(dx, dy, 1);
        bright.fill(shade[k] * 255, k * 4, k * 4 + 3);
        bumps.set([(dx / long + 1) * 127.5, (dy / long + 1) * 127.5, (1 / long + 1) * 127.5, 255], k * 4);
        bright[k * 4 + 3] = 255;
      }
    }
    return [bright, bumps].map((data) => {
      const texture = B.RawTexture.CreateRGBATexture(data, n, n, scene, true, false, B.Texture.TRILINEAR_SAMPLINGMODE);
      texture.wrapU = texture.wrapV = B.Texture.WRAP_ADDRESSMODE;
      texture.anisotropicFilteringLevel = 8;
      return texture;
    });
  }

  // Four kinds of old plate in one texture: bolted, tread, grating, hazard.
  function steelSheet() {
    const texture = new B.DynamicTexture('plates', { width: 1024, height: 1024 }, scene, true);
    const g = texture.getContext();
    for (let kind = 0; kind < 4; kind++) {
      const roll = (i, seed) => hash(i, kind, seed);
      g.save();
      g.translate((kind % 2) * 512, Math.floor(kind / 2) * 512);
      g.beginPath();
      g.rect(0, 0, 512, 512);
      g.clip();
      g.fillStyle = ['#4B5D62', '#445357', '#3E4B50', '#505B5C'][kind];
      g.fillRect(0, 0, 512, 512);
      if (kind === 1) {
        g.fillStyle = '#6A7E83';
        for (let x = 44; x < 480; x += 34) {
          for (let y = 44; y < 480; y += 34) {
            g.save();
            g.translate(x, y);
            g.rotate((x + y) % 68 ? 0.8 : -0.8);
            g.fillRect(-13, -3, 26, 6);
            g.restore();
          }
        }
      } else if (kind === 2) {
        g.fillStyle = '#0B1214';
        for (let y = 70; y < 440; y += 26) g.fillRect(64, y, 384, 14);
        g.fillStyle = '#5E7075';
        g.fillRect(244, 60, 24, 392);
      } else {
        g.strokeStyle = '#1B2629';
        g.lineWidth = 7;
        g.strokeRect(52, 52, 408, 408);
        g.beginPath();
        g.moveTo(256, 52);
        g.lineTo(256, 460);
        g.stroke();
      }
      if (kind === 3) {
        for (let x = 24; x < 490; x += 60) {
          g.fillStyle = '#7E6528';
          g.beginPath();
          g.moveTo(x, 452);
          g.lineTo(x + 30, 452);
          g.lineTo(x + 2, 492);
          g.lineTo(x - 28, 492);
          g.fill();
        }
      }
      for (let i = 0; i < 46; i++) {
        const x = roll(i, 31) * 512;
        const y = roll(i, 32) * 512;
        const r = 8 + roll(i, 33) ** 3 * 70;
        const rust = g.createRadialGradient(x, y, 0, x, y, r);
        rust.addColorStop(0, i % 3 ? '#6A3B22B0' : '#10191BC0');
        rust.addColorStop(0.6, i % 3 ? '#4B2C1E60' : '#10191B50');
        rust.addColorStop(1, '#10191B00');
        g.fillStyle = rust;
        g.fillRect(x - r, y - r, r * 2, r * 2);
      }
      g.lineWidth = 2;
      for (let i = 0; i < 70; i++) {
        const x = roll(i, 34) * 512;
        const y = roll(i, 35) * 512;
        g.strokeStyle = i % 4 ? '#5C707466' : '#0B121499';
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x + (roll(i, 36) - 0.5) * 70, y + (roll(i, 37) - 0.5) * 24);
        g.stroke();
      }
      g.strokeStyle = '#0B1214';
      g.lineWidth = 14;
      g.strokeRect(0, 0, 512, 512);
      for (const x of [26, 256, 486]) {
        for (const y of [26, 256, 486]) {
          if (x === 256 && y === 256) continue;
          for (const [r, color] of [[11, '#121B1D'], [7, '#6D8185']]) {
            g.fillStyle = color;
            g.beginPath();
            g.arc(x, y, r, 0, TAU);
            g.fill();
          }
        }
      }
      g.restore();
    }
    texture.update();
    texture.anisotropicFilteringLevel = 8;
    return texture;
  }

  const soil = new B.StandardMaterial('soil', scene);
  soil.diffuseColor = new B.Color3(1, 1, 1);
  soil.specularColor = new B.Color3(0.13, 0.13, 0.11);
  soil.specularPower = 26;
  [soil.diffuseTexture, soil.bumpTexture] = grain();
  soil.diffuseTexture.level = 2;
  soil.bumpTexture.level = 0.42;
  const iron = new B.StandardMaterial('iron', scene);
  iron.diffuseTexture = steelSheet();
  iron.specularColor = new B.Color3(0.2, 0.22, 0.22);
  iron.specularPower = 40;
  iron.backFaceCulling = false;

  // Wet bark, and one soft pulse of sap that slides along it. Half the roots never light up.
  function rootSkin() {
    const n = 256;
    const bark = new Uint8Array(n * n * 4);
    const sap = new Uint8Array(n * n * 4);
    for (let py = 0; py < n; py++) {
      const v = py / n;
      const across = (v % 0.5) * 2; // 0 underneath, .5 along the top
      for (let px = 0; px < n; px++) {
        const u = px / n;
        const fibre = noise(u * 8, v * 48 + noise(u * 16, v * 8, 91, 16) * 4, 92, 64);
        const fleck = noise(u * 64, v * 64, 93, 64);
        const k = (py * n + px) * 4;
        const light = 0.45 + fibre * 0.55 + (fleck - 0.5) * 0.3;
        bark.set([clamp(0.4 * light) * 255, clamp(0.2 * light) * 255, clamp(0.19 * light) * 255, 255], k);
        const behind = 0.5 - u; // a sharp front, a long fading tail
        const pulse = behind < 0 ? Math.exp(-((behind / 0.018) ** 2)) : Math.exp(-((behind / 0.07) ** 2));
        const thread = 1 - smooth(0.04, 0.22, Math.abs(across - 0.5 + (noise(u * 32, 0.5, 94, 32) - 0.5) * 0.16));
        const lit = v < 0.5 ? pulse * (0.18 + thread * 0.82) : 0;
        sap.set([lit * 235, lit * 70, lit * 100, 255], k);
      }
    }
    return [bark, sap].map((data) => {
      const texture = B.RawTexture.CreateRGBATexture(data, n, n, scene, true, false, B.Texture.TRILINEAR_SAMPLINGMODE);
      texture.wrapU = texture.wrapV = B.Texture.WRAP_ADDRESSMODE;
      return texture;
    });
  }
  const bark = new B.StandardMaterial('roots', scene);
  [bark.diffuseTexture, bark.emissiveTexture] = rootSkin();
  bark.diffuseTexture.uScale = 7;
  bark.useEmissiveAsIllumination = true;
  bark.specularColor = new B.Color3(0.3, 0.22, 0.2);
  bark.specularPower = 36;

  const outside = (x, y, left, top, right, bottom) => Math.hypot(Math.max(left - x, 0, x - right), Math.max(top - y, 0, y - bottom));
  const nearField = (fields, x, y, room) => fields.some((field) => patchOf(field).gap(x, y) < room);
  const fieldsAround = (x, y, room) => fieldsIn(x - room, y - room, x + room, y + room);
  const onSteel = (plates, x, y) => plates.some((p) => x >= p.x - 1 && x < p.x + 1 && y >= p.y - 1 && y < p.y + 1);

  // What an anchor of the endless world holds is remembered while one is near it.
  let anchors = new Map();
  function anchor(kind, gx, gy, make) {
    const id = `${kind}${gx},${gy}`;
    if (!anchors.has(id)) anchors.set(id, make(gx, gy));
    return anchors.get(id);
  }
  function everyAnchor(size, x0, y0, x1, y1, visit) {
    for (let gx = Math.floor(x0 / size) * size; gx <= x1; gx += size) for (let gy = Math.floor(y0 / size) * size; gy <= y1; gy += size) visit(gx, gy);
  }

  // ---- Patches of station: a few plates in a block, some missing, some knocked askew.
  function patch(cx, cy, across, down, seed) {
    const found = [];
    const fields = fieldsAround(cx, cy, 10);
    for (let i = 0; i < across; i++) {
      for (let j = 0; j < down; j++) {
        const x = cx + (i - (across - 1) / 2) * 2;
        const y = cy + (j - (down - 1) / 2) * 2;
        const border = !i || !j || i === across - 1 || j === down - 1;
        if (hash(i, j, seed) < (border ? 0.3 : 0.06) || nearField(fields, x, y, 1.5)) continue;
        const askew = border && hash(i, j, seed + 1) < 0.3 ? (hash(i, j, seed + 2) - 0.5) * 0.3 : 0;
        found.push({ x, y, angle: askew, kind: Math.floor(hash(i, j, seed + 3) * 4), border, seed: seed + i * 17 + j * 131 });
      }
    }
    return found;
  }
  function makePatch(gx, gy) {
    const cx = Math.round((gx + 2 + hash(gx, gy, 41) * 7) / 2) * 2;
    const cy = Math.round((gy + 2 + hash(gx, gy, 42) * 7) / 2) * 2;
    const away = Math.hypot(cx - CORE.x, cy - CORE.y);
    if (away < 7 || hash(gx, gy, 43) > mix(0.95, 0.4, smooth(12, 60, away))) return [];
    return patch(cx, cy, 1 + Math.floor(hash(gx, gy, 44) * 4), 1 + Math.floor(hash(gx, gy, 45) * 4), 1000 + gx * 97 + gy);
  }
  function platesIn(x0, y0, x1, y1) {
    const found = [];
    const meets = (p) => p.x + 1 >= x0 && p.x - 1 <= x1 && p.y + 1 >= y0 && p.y - 1 <= y1;
    const keep = (list) => {
      for (const p of list) if (meets(p)) found.push(p);
    };
    everyAnchor(10, x0 - 14, y0 - 14, x1 + 4, y1 + 4, (gx, gy) => keep(anchor('plates', gx, gy, makePatch)));
    // The landing: what is left of the station around the core.
    if (outside(CORE.x, CORE.y, x0, y0, x1, y1) < 9) keep(anchor('landing', 0, 0, () => patch(CORE.x + 1, CORE.y, 4, 3, 901)));
    return found;
  }

  function steelMesh(plates) {
    if (!plates.length) return null;
    const positions = [];
    const normals = [];
    const uvs = [];
    const indices = [];
    for (const p of plates) {
      const cos = Math.cos(p.angle);
      const sin = Math.sin(p.angle);
      const vertex = (x, y, h, nx, ny, nz) => {
        positions.push(p.x + x * cos - y * sin, h, -(p.y + x * sin + y * cos));
        normals.push(nx, ny, nz);
        // The atlas runs from the top, texture v from the bottom.
        uvs.push(((p.kind % 2) + 0.5 + x * 0.48) / 2, 1 - (Math.floor(p.kind / 2) + 0.5 + y * 0.48) / 2);
        return positions.length / 3 - 1;
      };
      const ring = [];
      for (let side = 0; side < 4; side++) {
        for (let i = 0; i < 5; i++) {
          const bite = hash(side, i, p.seed);
          const torn = p.border && bite > 0.72;
          const deep = i === 0 && torn ? 0.5 : torn ? 0.28 : bite * 0.05;
          const across = -0.985 + (i / 5) * 1.97;
          const edge = 0.985 - deep;
          const a = i === 0 && torn ? across + deep : across;
          ring.push([[a, -edge], [edge, a], [-a, edge], [-edge, -a]][side]);
        }
      }
      const middle = vertex(0, 0, PLATE, 0, 1, 0);
      const top = ring.map(([x, y]) => vertex(x, y, PLATE, 0, 1, 0));
      const low = ring.map(([x, y]) => vertex(x, y, -0.2, x * 0.7, 0.2, -y * 0.7));
      for (let i = 0; i < ring.length; i++) {
        const next = (i + 1) % ring.length;
        indices.push(middle, top[next], top[i], top[i], top[next], low[next], top[i], low[next], low[i]);
      }
    }
    const steel = new B.Mesh('steel', scene);
    Object.assign(new B.VertexData(), { positions, normals, uvs, indices }).applyToMesh(steel);
    steel.material = iron;
    steel.receiveShadows = true;
    steel.isPickable = false;
    return steel;
  }

  function makePool(gx, gy) {
    if (hash(gx, gy, 61) > 0.4) return null;
    const x = gx + 1 + hash(gx, gy, 62) * 7;
    const y = gy + 1 + hash(gx, gy, 63) * 7;
    const r = 0.6 + hash(gx, gy, 64) * 0.8;
    if (Math.hypot(x - CORE.x, y - CORE.y) < 7 || nearField(fieldsAround(x, y, r + 1), x, y, r + 1)) return null;
    if (platesIn(x - 5, y - 5, x + 5, y + 5).some((p) => Math.hypot(p.x - x, p.y - y) < r + 2.4)) return null;
    return { x, y, r, n: hash(gx, gy, 65) };
  }
  function poolsIn(x0, y0, x1, y1) {
    const found = [];
    everyAnchor(9, x0 - 11, y0 - 11, x1 + 3, y1 + 3, (gx, gy) => {
      const pool = anchor('pool', gx, gy, makePool);
      if (pool) found.push(pool);
    });
    return found;
  }

  // ---- Shape and colour of the ground, worked out once per chunk
  const ROCK = [78, 82, 80];
  const MUD = [42, 37, 33];
  const CRUST = [78, 56, 50];
  const MOSS = [42, 56, 36];
  const SOIL = { S: [36, 64, 27], F: [86, 52, 24], C: [90, 84, 68], N: [17, 58, 65], K: [25, 27, 30] };
  function shapeGround(chunk, fields, plates, pools) {
    const { ox, oy, step: apart, size, natural, tint } = chunk;
    for (let j = 0; j < size; j++) {
      for (let i = 0; i < size; i++) {
        const k = j * size + i;
        const x = ox + (i - 1) * apart;
        const y = oy + (j - 1) * apart;
        const wx = x + (noise(x / 7, y / 7, 1) - 0.5) * 5;
        const wy = y + (noise(x / 7, y / 7, 2) - 0.5) * 5;
        const hills = fractal(wx / 7, wy / 7, 3, 4) - 0.5;
        const lumps = fractal(x / 1.7, y / 1.7, 8, 2) - 0.5;
        const channel = smooth(0.82, 1, 1 - Math.abs(noise(wx / 11, wy / 11, 11) * 2 - 1));
        const knob = smooth(0.7, 0.9, noise(wx / 2.6, wy / 2.6, 12));
        let h = hills * 1.25 + lumps * 0.3 + knob * 0.24 - channel * 0.3;

        let near = 99;
        let kind = 'S';
        for (const field of fields) {
          const away = Math.max(0, patchOf(field).gap(x, y));
          if (away < near) {
            near = away;
            kind = field[0];
          }
        }
        h *= mix(0.3, 1, smooth(0, 1.5, near));
        for (const pool of pools) {
          if (Math.abs(x - pool.x) > 2.5 || Math.abs(y - pool.y) > 2.5) continue;
          const away = Math.hypot(x - pool.x, y - pool.y);
          if (away < pool.r + 1) h = mix(-0.4, h, smooth(pool.r * 0.55, pool.r + 1, away));
        }
        let plated = 9;
        for (const p of plates) {
          if (Math.abs(p.x - x) < 2.6 && Math.abs(p.y - y) < 2.6) plated = Math.min(plated, outside(x, y, p.x - 1, p.y - 1, p.x + 1, p.y + 1));
        }
        if (plated < 1.3) {
          // Matter creeps back over the steel.
          const spill = (fractal(x / 2.4, y / 2.4, 14, 3) - 0.58) * 1.5;
          const under = spill > 0 ? Math.min(0.2, spill) : -0.07;
          h = mix(under, h, smooth(0, 1.3, plated));
        }
        natural[k] = h;

        const wet = smooth(-0.22, 0.4, h + lumps * 0.4);
        const crust = smooth(0.52, 0.68, fractal(x / 9, y / 9, 16, 3)) * 0.8;
        const moss = smooth(0.55, 0.68, fractal(x / 5, y / 5, 18, 3)) * 0.8;
        // The ground takes the colour of what grows out of it, with a ragged edge.
        const ragged = near + (noise(x / 1.4, y / 1.4, 19) - 0.5) * 2;
        const halo = (1 - smooth(0, 5, ragged)) * 0.5 + (1 - smooth(-0.3, 0.8, ragged)) * 0.45;
        const light = (0.84 + noise(x * 1.3, y * 1.3, 20) * 0.32) * mix(1, 0.72, channel);
        for (let c = 0; c < 3; c++) {
          const color = mix(mix(mix(MUD[c], ROCK[c], wet), CRUST[c], crust), MOSS[c], moss);
          tint[k * 3 + c] = (mix(color, SOIL[kind][c], halo) / 255) * light;
        }
      }
    }
  }

  function scatter(chunk, fields) {
    const { ox, oy, decor, metal } = chunk;
    for (let y = oy; y < oy + CHUNK; y++) {
      for (let x = ox; x < ox + CHUNK; x++) {
        if (metal[(y - oy) * CHUNK + x - ox]) continue;
        let kind = '';
        let best = 5;
        if (depositAt(x, y)) continue;
        for (const field of fields) {
          const away = patchOf(field).gap(x + 0.5, y + 0.5);
          if (away < best) {
            best = away;
            kind = field[0];
          }
        }
        const roll = hash(x, y, 51);
        let type = '';
        if (kind && roll < 0.2) type = kind;
        else if (roll > 0.94) type = 'stone';
        else if (roll > 0.91) type = 'slab';
        else if (roll > 0.9) type = 'bones';
        else if (noise(x / 4, y / 4, 52) > 0.66 && roll > 0.45) type = 'cilia';
        else if (roll > 0.85) type = 'grit';
        if (type) decor.push({ x: x + 0.2 + hash(x, y, 53) * 0.6, y: y + 0.2 + hash(x, y, 54) * 0.6, n: hash(x, y, 55), type });
      }
    }
  }

  // Roots are continuous tubes: a trunk that snakes and thins, forks that start inside it, hairs at the ends.
  const SIDES = 6;
  const SAP_RUN = 22; // cells between two pulses
  const SAP_SPEED = 1.6;
  const SPREAD = 30; // how far a root can get from where it starts
  function wander(x, y, bend, length, seed, ground) {
    const path = [[x, y]];
    let turn = bend;
    for (let j = 0; j < length / 0.8; j++) {
      // Drawn back to where it was going, or it would curl into knots.
      turn = mix(turn, bend, 0.18) + (hash(seed, j, 72) - 0.5) * 1.05;
      const nx = x + Math.cos(turn) * 0.8;
      const ny = y + Math.sin(turn) * 0.8;
      if (onSteel(ground.plates, nx, ny) || nearField(ground.fields, nx, ny, 0.8)) break;
      x = nx;
      y = ny;
      path.push([x, y]);
    }
    return path;
  }
  function smoothed(path) {
    const out = [];
    const point = (i) => path[clamp(i, 0, path.length - 1)];
    for (let i = 0; i < path.length - 1; i++) {
      const [a, b, c, d] = [point(i - 1), point(i), point(i + 1), point(i + 2)];
      for (let part3 = 0; part3 < 3; part3++) {
        const u = part3 / 3;
        out.push([0, 1].map((n) => 0.5 * (2 * b[n] + (c[n] - a[n]) * u + (2 * a[n] - 5 * b[n] + 4 * c[n] - d[n]) * u * u + (3 * b[n] - a[n] - 3 * c[n] + d[n]) * u * u * u)));
      }
    }
    out.push(path[path.length - 1]);
    return out;
  }
  // One root and its forks: lines of rings, wherever they go.
  function growRoot(x, y, seed, alive) {
    const ground = { fields: fieldsAround(x, y, SPREAD), plates: platesIn(x - SPREAD, y - SPREAD, x + SPREAD, y + SPREAD) };
    if (onSteel(ground.plates, x, y) || nearField(ground.fields, x, y, 0.8)) return [];
    const lines = [];
    function branch(bx, by, bend, length, thick, run, level, id) {
      const path = wander(bx, by, bend, length, id, ground);
      if (path.length < 3) return;
      const line = smoothed(path);
      const rings = [];
      let travelled = run;
      for (let i = 0; i < line.length; i++) {
        const [px, py] = line[i];
        const before = line[Math.max(0, i - 1)];
        const after = line[Math.min(line.length - 1, i + 1)];
        if (i) travelled += Math.hypot(px - before[0], py - before[1]);
        const part = i / (line.length - 1);
        const knot = 0.8 + noise(i * 0.55, id, 95) * 0.45;
        // A trunk swells out of the ground, a fork out of its parent, and both end in a point.
        const born = level ? mix(1.3, 1, smooth(0, 0.15, part)) : mix(0.15, 1, smooth(0, 0.12, part));
        const size = thick * (1 - part) ** 0.65 * knot * born + 0.004;
        const tangent = Math.atan2(after[1] - before[1], after[0] - before[0]);
        const lift = (noise(i * 0.3, id, 96) - 0.4) * size;
        const u = hash(id % 1000, 0, 97) * 0.02 + travelled / SAP_RUN;
        rings.push({ x: px, y: py, size, lift, u, v: alive ? 0.01 : 0.51, travelled, side: [-Math.sin(tangent), Math.cos(tangent)], twist: i * 0.5 + (id % 1000) });
      }
      lines.push(rings);
      if (level > 1) return;
      const forks = level ? 1 + Math.floor(hash(id, 1, 98) * 2) : 3 + Math.floor(hash(id, 1, 98) * 3);
      for (let k = 0; k < forks; k++) {
        const i = Math.min(line.length - 2, Math.max(1, Math.floor(line.length * (0.15 + ((k + hash(id, k, 99)) / forks) * 0.72))));
        const [fx, fy] = line[i];
        const onward = Math.atan2(line[i + 1][1] - fy, line[i + 1][0] - fx);
        const side = (k + (id % 2)) % 2 ? 1 : -1;
        const sway = onward + side * (0.5 + hash(id, k, 100) * 0.5);
        branch(fx, fy, sway, length * (0.25 + hash(id, k, 101) * 0.2), rings[i].size * 0.68, rings[i].travelled, level + 1, id * 7 + k + 1);
      }
    }
    branch(x, y, hash(seed, 3, 71) * TAU, 8 + hash(seed, 4, 71) * 11, 0.14 + hash(seed, 5, 71) * 0.1, hash(seed, 6, 71) * SAP_RUN, 0, seed);
    return lines;
  }
  function makeRoot(gx, gy) {
    if (hash(gx, gy, 70) > 0.84) return [];
    return growRoot(gx + hash(gx, gy, 74) * 14, gy + hash(gx, gy, 75) * 14, 1 + Math.floor(hash(gx, gy, 73) * 99999), hash(gx, gy, 76) < 0.67);
  }
  function makeCoreRoot(i) {
    // Ten circle the core, where a game opens.
    const round = i * 0.628 + hash(i + 52, 7, 71) * 0.3;
    const far = 7 + hash(i + 52, 8, 71) * 7;
    return growRoot(CORE.x + Math.cos(round) * far, CORE.y + Math.sin(round) * far, i + 53, i % 3 !== 2);
  }
  // The stretch of every root that lies in this chunk. Each segment goes to the chunk it starts in.
  function rootMesh(ox, oy) {
    const rings = [];
    const uvs = [];
    const indices = [];
    const take = (line) => {
      let last = -1;
      let lastAt = -1;
      const ring = (i) => {
        rings.push(line[i]);
        for (let s = 0; s <= SIDES; s++) uvs.push(line[i].u, line[i].v + (s / SIDES) * 0.48);
        return rings.length - 1;
      };
      for (let i = 1; i < line.length; i++) {
        const { x, y } = line[i - 1];
        if (x < ox || x >= ox + CHUNK || y < oy || y >= oy + CHUNK) continue;
        const from = lastAt === i - 1 ? last : ring(i - 1);
        last = ring(i);
        lastAt = i;
        for (let s = 0; s < SIDES; s++) {
          const a = from * (SIDES + 1) + s;
          const b = last * (SIDES + 1) + s;
          indices.push(a, b, a + 1, a + 1, b, b + 1);
        }
      }
    };
    everyAnchor(14, ox - SPREAD, oy - SPREAD, ox + CHUNK + SPREAD, oy + CHUNK + SPREAD, (gx, gy) => anchor('root', gx, gy, makeRoot).forEach(take));
    if (outside(CORE.x, CORE.y, ox, oy, ox + CHUNK, oy + CHUNK) < SPREAD + 14) {
      for (let i = 0; i < 10; i++) anchor('coreRoot', i, 0, makeCoreRoot).forEach(take);
    }
    if (!indices.length) return null;
    const count = rings.length * (SIDES + 1) * 3;
    const part = { rings, indices, positions: new Float32Array(count), normals: new Float32Array(count), mesh: new B.Mesh('roots', scene) };
    const { positions, normals } = part;
    Object.assign(new B.VertexData(), { positions, normals, uvs, indices }).applyToMesh(part.mesh, true);
    part.mesh.material = bark;
    part.mesh.receiveShadows = true;
    part.mesh.isPickable = false;
    glow.addIncludedOnlyMesh(part.mesh);
    return part;
  }
  // Roots lie on the relief, half buried, and dive under what is built.
  // While settling a ring only sinks: its lighting and its box are kept.
  function layRoots(chunk, whole) {
    const { ox, oy, step: apart, size: across, packed } = chunk;
    const { rings, indices, positions, normals, mesh } = chunk.roots;
    let n = 0;
    for (const { x, y, size, lift, side, twist } of rings) {
      const gx = Math.round(clamp((x - ox) / apart + 1, 0, across - 1));
      const gy = Math.round(clamp((y - oy) / apart + 1, 0, across - 1));
      const middle = surface(chunk, x, y) + size * 0.3 + lift - packed[gy * across + gx] * (size * 2.2 + 0.03);
      for (let s = 0; s <= SIDES; s++) {
        const a = (s / SIDES) * TAU - Math.PI / 2;
        const ridge = size * (1 + Math.sin(a * 3 + twist) * 0.17);
        positions[n++] = x + side[0] * Math.cos(a) * ridge;
        positions[n++] = middle + Math.sin(a) * ridge * 0.85;
        positions[n++] = -(y + side[1] * Math.cos(a) * ridge);
      }
    }
    mesh.updateVerticesData(B.VertexBuffer.PositionKind, positions);
    if (!whole) return;
    B.VertexData.ComputeNormals(positions, indices, normals);
    mesh.updateVerticesData(B.VertexBuffer.NormalKind, normals);
    mesh.refreshBoundingInfo();
  }

  // ---- Chunks. Each carries one ring of vertices more than it shows, so lighting matches its neighbour's.
  const chunks = new Map();
  const spot = (cx, cy) => (cx + 4096) * 8192 + cy + 4096;
  let last = null;
  function chunkAt(x, y) {
    if (last && x >= last.ox && x < last.ox + CHUNK && y >= last.oy && y < last.oy + CHUNK) return last;
    const found = chunks.get(spot(Math.floor(x / CHUNK), Math.floor(y / CHUNK)));
    if (found) last = found;
    return found;
  }
  function surface(chunk, x, y) {
    const { ox, oy, step: apart, size, current } = chunk;
    const gx = clamp((x - ox) / apart + 1, 0, size - 1.001);
    const gy = clamp((y - oy) / apart + 1, 0, size - 1.001);
    const i = Math.floor(gx);
    const j = Math.floor(gy);
    const k = j * size + i;
    return mix(mix(current[k], current[k + 1], gx - i), mix(current[k + size], current[k + size + 1], gx - i), gy - j);
  }
  function height(x, y) {
    const chunk = chunkAt(x, y);
    if (!chunk) return 0;
    const h = surface(chunk, x, y);
    return chunk.metal[(Math.floor(y) - chunk.oy) * CHUNK + Math.floor(x) - chunk.ox] ? Math.max(h, PLATE) : h;
  }

  // What presses the ground: a set of cells. 15 bits a side are plenty to tell cells apart.
  let used = new Map();
  const code = (x, y) => ((x & 32767) << 15) | (y & 32767);
  const pressed = (x, y) => used.has(code(Math.floor(x), Math.floor(y)));
  function occupy(box) {
    const now = new Map();
    const mark = (x, y) => now.set(code(x, y), [x, y]);
    for (const list of [G.cells, G.tracks, G.ruins]) for (const c of Object.values(list)) for (const p of footprint(c)) mark(p.x, p.y);
    for (const c of Object.values(G.cells)) {
      const to = c.type === 'pump' && c.to && G.cells[c.to];
      if (!to) continue;
      const steps = Math.ceil(span(c, to) * 2);
      for (let i = 1; i < steps; i++) mark(Math.floor(c.x + 0.5 + ((to.x - c.x) * i) / steps), Math.floor(c.y + 0.5 + ((to.y - c.y) * i) / steps));
    }
    for (let x = -1; x < 2; x++) for (let y = -1; y < 2; y++) mark(CORE.x + x, CORE.y + y);
    for (const b of breachesIn(...box)) {
      if (b.state === 'spent' && G.time - b.ended >= 8) continue;
      for (let x = -3; x < 4; x++) for (let y = -3; y < 4; y++) if (Math.hypot(x, y) < 3.4) mark(b.x + x, b.y + y);
    }
    return now;
  }
  // Coarse vertices are too far apart for the close falloff: they pack down wider, so what is built stays on the plane.
  const falloff = (apart) => (apart === FINE ? [0.2, REACH] : [1, 3.2]);
  function nodesAround(chunk, x, y, visit) {
    const { ox, oy, step: apart, size } = chunk;
    const [, reach] = falloff(apart);
    const i0 = Math.max(0, Math.ceil((x - reach - ox) / apart + 1));
    const i1 = Math.min(size - 1, Math.floor((x + 1 + reach - ox) / apart + 1));
    const j0 = Math.max(0, Math.ceil((y - reach - oy) / apart + 1));
    const j1 = Math.min(size - 1, Math.floor((y + 1 + reach - oy) / apart + 1));
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) visit(j * size + i, ox + (i - 1) * apart, oy + (j - 1) * apart);
  }

  function groundMesh(chunk) {
    const { ox, oy, step: apart, size } = chunk;
    const across = size - 2;
    const count = across * across;
    chunk.positions = new Float32Array(count * 3);
    chunk.normals = new Float32Array(count * 3);
    chunk.colors = new Float32Array(count * 4);
    const uvs = new Float32Array(count * 2);
    const indices = [];
    for (let j = 0, n = 0; j < across; j++) {
      for (let i = 0; i < across; i++, n++) {
        chunk.positions[n * 3] = ox + i * apart;
        chunk.positions[n * 3 + 2] = -(oy + j * apart);
        chunk.normals[n * 3 + 1] = 1;
        chunk.colors[n * 4 + 3] = 1;
        // 73 cells are exactly 10 tiles of grain: the uvs stay small however far it is.
        uvs[n * 2] = ((ox % 73) + i * apart) / GRAIN;
        uvs[n * 2 + 1] = ((oy % 73) + j * apart) / GRAIN;
        if (i < across - 1 && j < across - 1) indices.push(n + 1 + across, n + 1, n, n + across, n + 1 + across, n);
      }
    }
    const { positions, normals, colors } = chunk;
    chunk.mesh = new B.Mesh('ground', scene);
    Object.assign(new B.VertexData(), { positions, normals, colors, uvs, indices }).applyToMesh(chunk.mesh, true);
    chunk.mesh.material = soil;
    chunk.mesh.receiveShadows = true;
    chunk.mesh.isPickable = false;
  }
  function remesh(chunk) {
    const { step: apart, size, current, packed, tint, positions, normals, colors, mesh } = chunk;
    for (let j = 1, n = 0; j < size - 1; j++) {
      for (let i = 1; i < size - 1; i++, n++) {
        const k = j * size + i;
        // Slopes are lit steeper than they are: a lot of relief, very little hidden behind it.
        const steep = 1.15 / apart;
        const slopeX = (current[k + 1] - current[k - 1]) * steep;
        const slopeY = (current[k + size] - current[k - size]) * steep;
        const long = Math.hypot(slopeX, 1, slopeY);
        positions[n * 3 + 1] = current[k];
        normals[n * 3] = -slopeX / long;
        normals[n * 3 + 1] = 1 / long;
        normals[n * 3 + 2] = slopeY / long;
        const trodden = 1 - packed[k] * 0.28;
        for (let c = 0; c < 3; c++) colors[n * 4 + c] = tint[k * 3 + c] * trodden;
      }
    }
    mesh.updateVerticesData(B.VertexBuffer.PositionKind, positions);
    mesh.updateVerticesData(B.VertexBuffer.NormalKind, normals);
    mesh.updateVerticesData(B.VertexBuffer.ColorKind, colors);
    mesh.refreshBoundingInfo();
  }

  function drop(chunk) {
    chunk.mesh.dispose();
    chunk.steel?.dispose();
    if (chunk.roots) {
      glow.removeIncludedOnlyMesh(chunk.roots.mesh);
      chunk.roots.mesh.dispose();
    }
    if (last === chunk) last = null;
    chunks.delete(spot(chunk.cx, chunk.cy));
  }
  function raise(cx, cy, apart) {
    const ox = cx * CHUNK;
    const oy = cy * CHUNK;
    const edgeX = ox + CHUNK;
    const edgeY = oy + CHUNK;
    const size = CHUNK / apart + 3;
    const count = size * size;
    const natural = new Float32Array(count);
    const packed = new Float32Array(count);
    const aim = new Float32Array(count);
    const current = new Float32Array(count);
    const tint = new Float32Array(count * 3);
    const chunk = { cx, cy, ox, oy, step: apart, size, natural, packed, aim, current, tint, decor: [], metal: new Uint8Array(CHUNK * CHUNK), settling: new Set() };
    const fields = fieldsIn(ox - 9, oy - 9, edgeX + 9, edgeY + 9);
    const plates = platesIn(ox - 5, oy - 5, edgeX + 5, edgeY + 5);
    const pools = poolsIn(ox - 5, oy - 5, edgeX + 5, edgeY + 5);
    shapeGround(chunk, fields, plates, pools);
    for (const p of plates) {
      for (const x of [p.x - 1, p.x]) {
        for (const y of [p.y - 1, p.y]) if (x >= ox && x < edgeX && y >= oy && y < edgeY) chunk.metal[(Math.floor(y) - oy) * CHUNK + Math.floor(x) - ox] = 1;
      }
    }
    const mine = (p) => p.x >= ox && p.x < edgeX && p.y >= oy && p.y < edgeY;
    chunk.plates = plates.filter(mine);
    chunk.pools = pools.filter(mine);

    // It arrives already packed under what is built.
    const [near, reach] = falloff(apart);
    for (const [x, y] of used.values()) {
      if (x < ox - 6 || x > edgeX + 6 || y < oy - 6 || y > edgeY + 6) continue;
      nodesAround(chunk, x, y, (k, nx, ny) => {
        packed[k] = Math.max(packed[k], 1 - smooth(near, reach, outside(nx, ny, x, y, x + 1, y + 1)));
      });
    }
    aim.set(packed);
    for (let k = 0; k < count; k++) current[k] = natural[k] * (1 - packed[k]);

    groundMesh(chunk);
    remesh(chunk);
    chunk.steel = steelMesh(chunk.plates);
    if (apart === FINE) chunk.bare = fields;
    const old = chunks.get(spot(cx, cy));
    if (old) drop(old);
    chunks.set(spot(cx, cy), chunk);
    return chunk;
  }

  // Roots and small things come a frame after their ground, so no frame carries the whole chunk.
  function furnish(chunk) {
    scatter(chunk, chunk.bare);
    chunk.bare = null;
    chunk.roots = rootMesh(chunk.ox, chunk.oy);
    if (chunk.roots) layRoots(chunk, true);
  }

  function settle(now, instant) {
    const changed = [];
    for (const [id, cell] of now) if (!used.has(id)) changed.push(cell);
    for (const [id, cell] of used) if (!now.has(id)) changed.push(cell);
    used = now;
    for (const [x, y] of changed) {
      for (let cx = Math.floor((x - 6) / CHUNK); cx <= Math.floor((x + 6) / CHUNK); cx++) {
        for (let cy = Math.floor((y - 6) / CHUNK); cy <= Math.floor((y + 6) / CHUNK); cy++) {
          const chunk = chunks.get(spot(cx, cy));
          if (!chunk) continue;
          const [near, reach] = falloff(chunk.step);
          const around = Math.ceil(reach) + 1;
          nodesAround(chunk, x, y, (k, nx, ny) => {
            let press = 0;
            const px = Math.floor(nx);
            const py = Math.floor(ny);
            for (let i = px - around; i < px + around; i++) {
              for (let j = py - around; j < py + around; j++) {
                if (used.has(code(i, j))) press = Math.max(press, 1 - smooth(near, reach, outside(nx, ny, i, j, i + 1, j + 1)));
              }
            }
            chunk.aim[k] = press;
            chunk.settling.add(k);
          });
        }
      }
    }
    for (const chunk of chunks.values()) {
      if (!chunk.settling.size) continue;
      const { natural, packed, aim, current, settling } = chunk;
      for (const k of settling) {
        const gap = aim[k] - packed[k];
        const done = instant || Math.abs(gap) < 0.01;
        packed[k] = done ? aim[k] : packed[k] + gap * 0.2;
        current[k] = natural[k] * (1 - packed[k]);
        if (done) settling.delete(k);
      }
      remesh(chunk);
      if (chunk.roots) layRoots(chunk, false);
    }
  }

  let known = null;
  let detail = 0;
  function update(area) {
    const world = `${G.seed}|${FIELDS.map((f) => f.join(':')).join()}`;
    if (world !== known) {
      known = world;
      for (const chunk of [...chunks.values()]) drop(chunk);
      anchors = new Map();
      used = new Map();
    }
    if (!detail) detail = cam.zoom < 8.5 ? COARSE : FINE;
    if (cam.zoom < 8) detail = COARSE;
    if (cam.zoom > 9) detail = FINE;

    const x0 = Math.floor(area.x0 / CHUNK);
    const y0 = Math.floor(area.y0 / CHUNK);
    const x1 = Math.floor(area.x1 / CHUNK);
    const y1 = Math.floor(area.y1 / CHUNK);
    settle(occupy([(x0 - 2) * CHUNK, (y0 - 2) * CHUNK, (x1 + 3) * CHUNK, (y1 + 3) * CHUNK]), still.matches);

    // What is on screen first, nearest the middle first, then one ring ahead of the camera.
    const missing = [];
    const upcoming = [];
    let onScreen = false;
    for (let cx = x0 - 1; cx <= x1 + 1; cx++) {
      for (let cy = y0 - 1; cy <= y1 + 1; cy++) {
        const visible = cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1;
        const chunk = chunks.get(spot(cx, cy));
        if (visible && chunk) onScreen = true;
        if (chunk?.step === detail) continue;
        const away = Math.abs((cx + 0.5) * CHUNK - cam.x) + Math.abs((cy + 0.5) * CHUNK - cam.y);
        (visible ? missing : upcoming).push([away, cx, cy]);
      }
    }
    missing.sort((a, b) => a[0] - b[0]);
    const since = performance.now();
    for (const [, cx, cy] of missing) {
      const chunk = raise(cx, cy, detail);
      // Arriving somewhere all at once: no holes and nothing bare on that first frame.
      if (!onScreen && chunk.bare) furnish(chunk);
      if (onScreen && performance.now() - since > BUDGET) break;
    }
    let bare = null;
    if (!missing.length) {
      const inView = (c) => c.cx >= x0 && c.cx <= x1 && c.cy >= y0 && c.cy <= y1;
      for (const chunk of chunks.values()) if (chunk.bare && (!bare || inView(chunk))) bare = chunk;
      if (bare) furnish(bare);
    }
    if (!missing.length && !bare && upcoming.length) {
      upcoming.sort((a, b) => a[0] - b[0]);
      raise(upcoming[0][1], upcoming[0][2], detail);
    }
    for (const chunk of [...chunks.values()]) {
      if (chunk.cx < x0 - 2 || chunk.cx > x1 + 2 || chunk.cy < y0 - 2 || chunk.cy > y1 + 2) drop(chunk);
    }
    if (anchors.size > 12000) anchors = new Map();
  }

  // ---- Small things lying on it. They leave where something is built.
  const PAINT = {
    pebble: ['#4B4C46', 0, 1, 0.35], slate: ['#34332E', 0, 1, 0.3], bonedust: ['#8C836D', 0, 1, 0.3],
    cilia: ['#48543A', 0.04, 1, 0.5], ciliaTip: ['#8E9B63', 0.12, 1, 0.5], water: ['#0A1714', 0.05, 0.9, 1], shore: ['#17120E', 0, 0.55, 1], shine: ['#45685C', 0.05, 0.22, 1],
    ripple: ['#4F8B7A', 0.12, 0.35, 0.8], bubble: ['#79B59E', 0.15, 0.6, 1], dryFibre: ['#6B4526', 0.03, 1, 0.4],
    cable: ['#0B1012', 0, 1, 0.6],
  };
  function piece(add, p, t, close) {
    const { x, y, n, type } = p;
    const a = n * TAU;
    const out = (turn, far) => [x + Math.cos(turn) * far, y + Math.sin(turn) * far];
    if (type === 'stone') {
      add('rock', 'pebble', x, y, 0.06, 0.28 + n * 0.3, 0.22 + n * 0.16, 0.26 + n * 0.2, a);
      if (close) for (let i = 0; i < 3; i++) add('rock', 'slate', ...out(a + i * 2, 0.38), 0.03, 0.14, 0.12, 0.12, i);
    } else if (type === 'slab') {
      add('hull', 'slate', x, y, 0.03, 0.6 + n * 0.3, 0.07, 0.4, a, 0.18);
      if (close) add('hull', 'pebble', ...out(a + 1.4, 0.45), 0.02, 0.3, 0.06, 0.22, a + 1, -0.15);
    } else if (type === 'bones') {
      for (let i = 0; i < 3; i++) add('arch', 'bonedust', ...out(a, i * 0.17 - 0.17), -0.03, 0.4 - i * 0.07, 0.3, 0.7, a + Math.PI / 2);
    } else if (type === 'cilia' || type === 'S') {
      // Only some tufts, in some places, move.
      const alive = n < 0.5;
      for (let i = 0; i < (close ? 5 : 2); i++) {
        const turn = a + i * 1.35;
        const sway = alive ? Math.sin(t * 1.3 - x * 0.7 - y * 0.4 + i * 0.4) * 0.22 : 0;
        const tall = 0.2 + ((n + i * 0.31) % 1) * 0.2;
        const tip = type === 'S' ? i % 2 === 0 : i % 4 === 0;
        add('horn', tip ? (type === 'S' ? 'sprout' : 'ciliaTip') : 'cilia', ...out(turn, 0.14), -0.02, 0.2, tall, 0.2, turn, sway);
      }
    } else if (type === 'F') {
      for (let i = 0; i < (close ? 4 : 2); i++) add('horn', i ? 'dryFibre' : 'F', ...out(a + i * 1.7, 0.1), -0.02, 0.34, 0.2 + ((n + i * 0.3) % 1) * 0.16, 0.34, a + i * 1.7);
    } else if (type === 'C') {
      add('crystal', 'bonedust', x, y, 0.07, 0.14, 0.26, 0.14, a, 0.4);
      if (close) add('rock', 'bonedust', ...out(a, 0.25), 0.02, 0.14, 0.1, 0.12, a);
    } else if (type === 'N') {
      add('taper', 'Nsoil', x, y, 0.03, 0.06, 0.6, 0.06, a, -Math.PI / 2);
      add('bead', Math.sin(t * 0.9 + a) > 0.7 ? 'N2' : 'N', ...out(a, 0.3), 0.04, 0.07);
    } else if (close) {
      for (let i = 0; i < 4; i++) add('rock', i % 2 ? 'slate' : 'pebble', ...out(a + i * 1.7, 0.1 + i * 0.06), 0.02, 0.1 + (i % 2) * 0.05, 0.07, 0.1, i);
    }
  }
  function draw(add, area, clock) {
    const t = still.matches ? 0 : clock;
    bark.emissiveTexture.uOffset = -((t * SAP_SPEED) / SAP_RUN) % 1;
    if (cam.zoom < 9) return;
    const close = cam.zoom >= 18;
    const shown = (x, y, room = 1) => x > area.x0 - room && x < area.x1 + room && y > area.y0 - room && y < area.y1 + room;
    const here = [...chunks.values()].filter((c) => c.ox < area.x1 + 3 && c.ox + CHUNK > area.x0 - 3 && c.oy < area.y1 + 3 && c.oy + CHUNK > area.y0 - 3);
    if (cam.zoom >= 11) {
      for (const chunk of here) for (const p of chunk.decor) if (shown(p.x, p.y, 0) && !pressed(p.x, p.y)) piece(add, p, t, close);
    }
    for (const pool of here.flatMap((chunk) => chunk.pools)) {
      const { x, y, r, n } = pool;
      if (!shown(x, y, 3)) continue;
      // Built on, a pool drains.
      if ([[0, 0], [r, 0], [-r, 0], [0, r], [0, -r]].some(([dx, dy]) => pressed(x + dx, y + dy))) continue;
      const level = -0.22 - height(x, y);
      add('stain', 'shore', x, y, level + 0.04, r * 2.9, 0.02, r * 2.4, n * 6 + 1);
      add('stain', 'water', x, y, level + 0.07, r * 2.1, 0.02, r * 1.7, n * 6);
      add('stain', 'shine', x - r * 0.25, y - r * 0.2, level + 0.1, r * 0.9, 0.01, r * 0.45, n * 3);
      if (!close) continue;
      const wave = (t * 0.22 + n) % 1;
      if (wave < 0.55) add('ring', 'ripple', x + (n - 0.5) * 0.5, y, level + 0.12, 0.15 + wave * r * 1.6, 0.3, 0.15 + wave * r * 1.6);
      const bubble = (t / (4 + n * 4) + n) % 1;
      if (bubble < 0.14) add('bead', 'bubble', x + 0.2, y + (n - 0.5) * 0.6, level + 0.12, 0.06 + bubble * 1.1);
    }
    // Torn cables out of the broken edges.
    if (close) {
      for (const p of here.flatMap((chunk) => chunk.plates)) {
        if (!p.border || hash(p.seed, 0, 81) > 0.3 || !shown(p.x, p.y, 2) || pressed(p.x, p.y)) continue;
        const a = hash(p.seed, 1, 81) * TAU;
        for (let i = 0; i < 2; i++) add('arch', 'cable', p.x + Math.cos(a + i * 0.4) * 0.9, p.y + Math.sin(a + i * 0.4) * 0.9, -0.02, 0.7, 0.22, 0.7, a + i * 0.4);
      }
    }
    // Around a sleeping breach, the ground breathes.
    for (const b of breachesIn(area.x0, area.y0, area.x1, area.y1)) {
      if (b.state !== 'sleep' || !shown(b.x, b.y, 4)) continue;
      for (let i = 0; i < 6; i++) {
        const a = i * 1.047 + b.x;
        const breath = Math.sin(t * 0.8 - i * 0.5 + b.y) * 0.1;
        add('sac', i % 2 ? 'sleep' : 'gore', b.x + 0.5 + Math.cos(a) * 2.6, b.y + 0.5 + Math.sin(a) * 2.6, 0.02, 0.9 + breath, 0.2 + breath, 0.7 + breath, a);
      }
    }
  }

  return {
    PAINT,
    height,
    // The ground of any cell, made on the spot if it is off screen. For checks.
    groundAt(x, y) {
      if (!chunkAt(x, y)) raise(Math.floor(x / CHUNK), Math.floor(y / CHUNK), FINE);
      return height(x, y);
    },
    update,
    draw,
  };
};
