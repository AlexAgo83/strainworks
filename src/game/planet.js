// The opening screen: the globe, the station and the hexagons, in and out of a game.
import { G, STAGES, spotHash } from "../sim/sim.ts";
import { DEC, L, LOCALE } from "../sim/text.ts";
import { playSound } from "./audio.js";
import { MUTATIONS, anyPurified, isOpen, purified, takeMutation } from "./conquest.js";
import { offerConcept } from "./unlock.js";
import { forgetEvent, replay, showMenu, tell } from "./hud.js";
import { $, ART, CURVE_KEY, BABYLON_HASH, BABYLON_SRC, CELLS_OF_GLOBE, DEMO_HEX, EARN, FILE, GLOBE_SHADER, LENS, NARROW, PERF, PERF_KINDS, PREFERRED, STILL, VIEW_KEY, arrows, canvas, cross3, demoMoved, dot3, drag, fx, fxRandom, gesture, loadDemo, made3d, mainSet, orbit, perfZero, slotId, slotKey, station3d, switching, ui, unit3, view, view3d, within } from "./main.js";
import { home, resize } from "./render.js";
import { eraseGame, exportAll, exportGame, foundGame, freeHex, graftGames, keep, openGame, parsed, planetList, readFileGames, readList, save, stored, summaryOf, writeList } from "./saves.js";
import { script, show3D } from "./view.js";

// The dual of a divided icosahedron: 150 hexagons and twelve pentagons.
export function goldberg(freq) {
  const p = (1 + Math.sqrt(5)) / 2;
  const ico = [[-1,p,0],[1,p,0],[-1,-p,0],[1,-p,0],[0,-1,p],[0,1,p],[0,-1,-p],[0,1,-p],[p,0,-1],[p,0,1],[-p,0,-1],[-p,0,1]].map(unit3);
  const faces = [[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]];
  const points = [], known = new Map(), round = new Map();
  for (const [a, b, c] of faces) {
    const grid = [];
    for (let i = 0; i <= freq; i++) {
      grid[i] = [];
      for (let j = 0; j <= freq - i; j++) {
        const v = unit3([0, 1, 2].map(k => ico[a][k] * (freq - i - j) / freq + ico[b][k] * i / freq + ico[c][k] * j / freq));
        const id = v.map(x => Math.round(x * 1e5)).join();
        if (!known.has(id)) { known.set(id, points.length); points.push(v); }
        grid[i][j] = known.get(id);
      }
    }
    for (let i = 0; i < freq; i++) for (let j = 0; j < freq - i; j++) {
      const tris = [[grid[i][j], grid[i + 1][j], grid[i][j + 1]]];
      if (i + j < freq - 1) tris.push([grid[i + 1][j], grid[i + 1][j + 1], grid[i][j + 1]]);
      for (const tri of tris) {
        const mid = unit3([0, 1, 2].map(k => points[tri[0]][k] + points[tri[1]][k] + points[tri[2]][k]));
        for (const at of tri) round.set(at, [...(round.get(at) || []), mid]);
      }
    }
  }
  // Set askew as in the mockup, so no pole faces the player.
  const askew = ([x, y, z]) => {
    const up = y * Math.cos(.3) - z * Math.sin(.3), near = y * Math.sin(.3) + z * Math.cos(.3);
    return [x * Math.cos(.17) + near * Math.sin(.17), up, -x * Math.sin(.17) + near * Math.cos(.17)];
  };
  return points.map((point, at) => {
    const c = askew(point), e1 = unit3(cross3([.31, .9, .17], c)), e2 = cross3(c, e1);
    const ring = round.get(at).map(askew).sort((u, v) => Math.atan2(dot3(u, e2), dot3(u, e1)) - Math.atan2(dot3(v, e2), dot3(v, e1)));
    return {c, ring, size:ring.reduce((sum, q) => sum + Math.hypot(q[0] - c[0], q[1] - c[1], q[2] - c[2]), 0) / ring.length};
  });
}
export function layoutPlanet() {
  const w = view.w, h = view.h, low = h <= 520 && w > h * 1.3, wide = !low && w >= 760 && w / h > 1.1;
  const panel = $('projection').style;
  let box;
  if (wide) {
    const ss = Math.min(h * .62, w * .39), pw = Math.min(590, w * .43);
    box = {cx:Math.min(h * .289, w * .2), cy:h * .567, r:h * .586, sx:w - ss - w * .035, sy:h * .011, ss};
    Object.assign(panel, {left:`${w - pw - w * .035}px`, width:`${pw}px`, bottom:`${h * .045}px`, minHeight:'0'});
  } else if (low) {
    const ss = h * .46, pw = Math.min(420, w * .52);
    box = {cx:w * .17, cy:h * .55, r:h * .68, sx:w - ss - 70, sy:0, ss};
    Object.assign(panel, {left:`${w - pw - 8}px`, width:`${pw}px`, bottom:'6px', minHeight:'0'});
  } else {
    const r = Math.min(w * .77, h * .5), ss = Math.min(w * .374, 240), pw = Math.min(w - 16, 560);
    box = {cx:w * .236, cy:Math.max(r * .95, h * .42), r, sx:w * .57, sy:40, ss};
    Object.assign(panel, {left:`${(w - pw) / 2}px`, width:`${pw}px`, bottom:'calc(6px + var(--b))', minHeight:'0'});
  }
  for (const id of ['station', 'station-live']) Object.assign($(id).style, {left:`${box.sx}px`, top:`${box.sy}px`, width:`${box.ss}px`, height:`${box.ss}px`});
  station3d.st?.resize();
  const side = box.r / 556 * 1180;
  Object.assign($('globe-still').style, {left:`${box.cx - side / 2}px`, top:`${box.cy - side / 2}px`, width:`${side}px`, height:`${side}px`});
  box.lens = [box.sx + box.ss * LENS.x, box.sy + box.ss * LENS.y];
  orbit.box = box; orbit.dirty = true;
}
export function turn([x, y, z]) {
  const a = Math.cos(orbit.yaw), b = Math.sin(orbit.yaw), c = Math.cos(orbit.pitch), d = Math.sin(orbit.pitch);
  const away = -x * b + z * a;
  return [x * a + z * b, y * c - away * d, y * d + away * c];
}
export function onScreen(v) { return [orbit.box.cx + orbit.box.r * v[0], orbit.box.cy - orbit.box.r * v[1]]; }
export function hexAt(x, y) {
  const u = (x - orbit.box.cx) / orbit.box.r, v = -(y - orbit.box.cy) / orbit.box.r, d = u * u + v * v;
  if (d > 1) return null;
  const at = [u, v, Math.sqrt(1 - d)];
  let best = 0, close = -2;
  // @ts-expect-error: loose typing, tightened module by module (item_007)
  CELLS_OF_GLOBE.forEach((cell, id) => { const near = dot3(turn(cell.c), at); if (near > close) { close = near; best = id; } });
  return best;
}
// Turns the planet until that hexagon is where the beam likes it, if it is not already in view.
export function faceHex(id, force) {
  // @ts-expect-error: loose typing, tightened module by module (item_007)
  const v = turn(CELLS_OF_GLOBE[id].c), [x, y] = onScreen(v);
  const panelTop = $('projection').getBoundingClientRect().top || view.h;
  if (!force && v[2] > .4 && x > 24 && x < view.w - 24 && y > 60 && y < Math.max(120, view.h < view.w ? view.h - 30 : panelTop - 20)) return;
  const [cx, cy, cz] = CELLS_OF_GLOBE[id].c, flatR = Math.hypot(cx, cz), tx = flatR > .4 ? .32 : 0, ty = .3;
  let yaw = Math.atan2(tx, Math.sqrt(Math.max(0, flatR * flatR - tx * tx))) - Math.atan2(cx, cz);
  const depth = Math.sqrt(Math.max(1e-6, flatR * flatR - tx * tx));
  const pitch = within(Math.atan2(cy, depth) - Math.atan2(ty, Math.sqrt(1 - tx * tx - ty * ty)), -1.35, 1.35);
  while (yaw - orbit.yaw > Math.PI) yaw -= Math.PI * 2;
  while (yaw - orbit.yaw < -Math.PI) yaw += Math.PI * 2;
  if (STILL.matches) Object.assign(orbit, {yaw, pitch, to:null, dirty:true});
  else orbit.to = {yaw, pitch};
}

// ---- What a game looks like from orbit: more of it the farther it went.
export function dotsOf(points) { return points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' '); }
export function settlementSVG(to, game, seed, k) {
  const tier = game.over ? 5 : within((Number(game.stage) || 0) + 1, 1, 4), roll = n => spotHash(Number(seed) || 0, n, 77);
  const [base, spread] = [[3, .45], [6, .62], [9, .74], [14, .82], [6, .62]][tier - 1];
  const arms = base + within(Math.floor((Number(game.built) || 0) / 180), 0, 4), dead = tier === 5, ends = [], out = [];
  const glow = (points, color, width, extra = '') => out.push(`<polyline class="glow" points="${dotsOf(points.map(p => to(...p)))}" fill="none" stroke="${color}" stroke-width="${(width * 3.2 * k).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"${extra}/>`);
  const pulse = (points, color, width, i) => out.push(`<polyline class="pulse" style="animation-duration:${(1.8 + roll(i + 300) * 1.6).toFixed(2)}s;animation-delay:-${(roll(i + 400) * 3).toFixed(2)}s" points="${dotsOf(points.map(p => to(...p)))}" fill="none" stroke="${color}" stroke-width="${(width * 1.4 * k).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${(2 * k).toFixed(1)} ${(16 * k).toFixed(1)}"/>`);
  const line = (points, color, width) => out.push(`<polyline points="${dotsOf(points.map(p => to(...p)))}" fill="none" stroke="${color}" stroke-width="${(width * k).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/>`);
  const spotted = (p, color, size, cls = '') => {
    const [x, y] = to(...p);
    out.push(`<circle class="${cls}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(size * k).toFixed(1)}" fill="${color}"/>`);
  };
  for (let i = 0; i < arms; i++) {
    const a = i * 2.39996 + roll(i) * .3, long = spread * (.55 + roll(i + 40) * .45), x = Math.cos(a) * long, y = Math.sin(a) * long;
    const rail = dead ? '#6B2531' : game.rank >= 3 && i % 4 === 0 ? '#A45CF0' : game.rank >= 2 && i % 3 === 0 ? '#F0A03C' : '#66D9EA';
    const path = i % 2 ? [[0, 0], [x, 0], [x, y]] : [[0, 0], [0, y], [x, y]];
    if (!dead) glow(path, rail, 1.5);
    line(path, rail, 1.5);
    if (!dead || i === 0) pulse(path, dead ? '#FF6B74' : '#E9F3EF', 1.5, i);
    spotted([x, y], dead ? (i % 3 ? '#4A1B25' : '#FF6B74') : ['#B7F34A', '#F0A03C', '#F3E6C8', '#66D9EA'][i % 4], 2.6, dead ? '' : `twinkle t${i % 4}`);
    ends.push([x, y]);
  }
  if (tier === 3 || tier === 4) ends.forEach(([x, y], i) => {
    line([[x, y], ends[(i + 3) % ends.length]], '#66D9EA59', .8);
    for (let j = 0; j < 3; j++) {
      const bx = x + (roll(i * 3 + j + 100) - .5) * .22, by = y + (roll(i * 3 + j + 200) - .5) * .22;
      line([[bx, by], [bx + .06, by]], '#E9F3EF', 1.6);
    }
  });
  // A crown of outposts: past the last stage, or out in the far levels.
  if (tier === 4 || (!dead && game.level > 1)) {
    const ring = Array.from({length:25}, (_, i) => [Math.cos(i * Math.PI / 12) * .88, Math.sin(i * Math.PI / 12) * .88]);
    line(ring, '#B7F34A', 1.1);
    for (let i = 0; i < 24; i += Math.max(2, 7 - within(Number(game.level) || 1, 1, 5))) spotted(ring[i], '#E9F3EF', 2);
  }
  if (dead) line([[-.6, .5], [-.2, .15], [-.1, -.2], [.2, -.1], [.55, -.6]], '#0A0405', 3);
  const core = [4, 6, 8, 10, 6][tier - 1];
  if (!dead) { spotted([0, 0], '#B7F34A1F', core * 3.2, 'breath'); spotted([0, 0], '#B7F34A33', core * 2, 'breath late'); }
  spotted([0, 0], dead ? '#32151C' : '#366426', core + 2.5);
  spotted([0, 0], dead ? '#FF6B74' : '#B7F34A', core * .7, 'heartbeat');
  return out.join('');
}
export function drawGrid() {
  const {r, lens} = orbit.box, games = orbit.list.games;
  let grid = '', taken = '', picked = '', hovered = '';
  // The beam has soft edges: a blur, not a cut-out triangle.
  let defs = '<defs><filter id="beam-soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="7"/></filter></defs>';
  const buttons = new Map([...$('games').children].map(b => [b.dataset.hex, b]));
  CELLS_OF_GLOBE.forEach(({c, ring, size}, id) => {
    // @ts-expect-error: loose typing, tightened module by module (item_007)
    const v = turn(c), b = buttons.get(String(id));
    if (b) {
      const [x, y] = onScreen(v);
      b.style.left = `${x}px`; b.style.top = `${y}px`;
    }
    if (v[2] < .08) return;
    // @ts-expect-error: loose typing, tightened module by module (item_007)
    const turned = ring.map(q => onScreen(unit3(turn([0, 1, 2].map(k => c[k] * .06 + q[k] * .94)))));
    const shape = dotsOf(turned), game = games[id], state = orbit.list.planet;
    grid += `<polygon class="grid" points="${shape}" stroke-opacity="${(.06 + v[2] * .24).toFixed(2)}"/>`;
    // The conquest: purified ground turns living green, the open hexagons beside it are outlined, the rest infected.
    if (state && purified(state, id)) grid += `<polygon class="purified" points="${shape}"/>`;
    else if (state && anyPurified(state) && !game) grid += `<polygon class="${isOpen(state, id) ? 'open' : 'locked'}" points="${shape}"/>`;
    if (game) {
      const e1 = unit3(cross3([0, 1, .001], c)), e2 = cross3(c, e1);
      const to = (u, w) => onScreen(turn(unit3([0, 1, 2].map(k => c[k] + e1[k] * u * size + e2[k] * w * size))));
      taken += `<polygon class="taken${game.demo ? ' demo' : game.over ? ' fallen' : game.fight ? ' fight' : ''}" points="${shape}"/>${settlementSVG(to, game, id, r / 527.7)}`;
      if (game.demo) { const [bx, by] = to(0, -.55); taken += `<g class="demo-badge"><rect x="${(bx - 19).toFixed(1)}" y="${(by - 8).toFixed(1)}" width="38" height="15" rx="7.5"/><text x="${bx.toFixed(1)}" y="${(by + 3.5).toFixed(1)}">${L('DÉMO')}</text></g>`; }
    }
    if (id === orbit.hover && id !== orbit.pick) hovered = `<polygon class="hover" points="${shape}"/>`;
    if (id !== orbit.pick) return;
    const [x, y] = onScreen(v);
    // The cone is the two edges the lens sees widest apart.
    const aim = Math.atan2(y - lens[1], x - lens[0]);
    const off = ([px, py]) => Math.sin(Math.atan2(py - lens[1], px - lens[0]) - aim);
    const left = turned.reduce((a, q) => off(q) < off(a) ? q : a), right = turned.reduce((a, q) => off(q) > off(a) ? q : a);
    defs = `<defs><filter id="beam-soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="7"/></filter><linearGradient id="beam-light" gradientUnits="userSpaceOnUse" x1="${lens[0]}" y1="${lens[1]}" x2="${x}" y2="${y}"><stop offset="0" stop-color="#9FE6F0" stop-opacity=".5"/><stop offset=".35" stop-color="#66D9EA" stop-opacity=".18"/><stop offset="1" stop-color="#66D9EA" stop-opacity=".05"/></linearGradient></defs>`;
    picked = `<polygon class="beam" points="${dotsOf([lens, left, right])}" fill="url(#beam-light)" filter="url(#beam-soft)"/><line class="flow" x1="${lens[0]}" y1="${lens[1]}" x2="${x}" y2="${y}"/><polygon class="lit" points="${shape}"/>`;
  });
  const panel = $('projection').getBoundingClientRect();
  const down = dotsOf([lens, [panel.left + panel.width * .14, panel.top + 8], [panel.left + panel.width * .86, panel.top + 8]]);
  $('hexes').setAttribute('viewBox', `0 0 ${view.w} ${view.h}`);
  $('hexes').innerHTML = `${defs}${grid}${taken}${hovered}<polygon class="beam" points="${down}" fill="#66D9EA14" filter="url(#beam-soft)"/>${picked}`;
}
export function globeFailed(error) {
  orbit.gl = null;
  $('globe').hidden = true;
  $('globe-still').src = ART.still;
  $('globe-still').hidden = false;
  console.warn('planet without WebGL:', error?.message || error);
}
export function makeGlobe() {
  try {
    const gl = $('globe').getContext('webgl', {premultipliedAlpha:true, antialias:false});
    if (!gl) return globeFailed('no context');
    const program = gl.createProgram();
    for (const [kind, text] of [[gl.VERTEX_SHADER, 'attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }'], [gl.FRAGMENT_SHADER, GLOBE_SHADER]]) {
      const part = gl.createShader(kind);
      gl.shaderSource(part, text); gl.compileShader(part);
      if (!gl.getShaderParameter(part, gl.COMPILE_STATUS)) return globeFailed(gl.getShaderInfoLog(part));
      gl.attachShader(program, part);
    }
    gl.bindAttribLocation(program, 0, 'p');
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return globeFailed('link');
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const at = {};
    for (const name of ['size', 'centre', 'radius', 'back', 'ground', 'glow']) at[name] = gl.getUniformLocation(program, name);
    const made = {gl, at, ready:0};
    [['ground', ART.ground], ['glow', ART.glow]].forEach(([name, src], i) => {
      const picture = new Image();
      picture.onerror = () => globeFailed(`no ${name}`);
      picture.onload = () => {
        try {
          gl.activeTexture(gl.TEXTURE0 + i);
          gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, picture);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.uniform1i(at[name], i);
          made.ready++; orbit.dirty = true;
        } catch (error) { globeFailed(error); }
      };
      picture.src = src;
    });
    $('globe').addEventListener('webglcontextlost', () => globeFailed('context lost'));
    orbit.gl = made;
  } catch (error) { globeFailed(error); }
}
export function drawGlobe() {
  if (!orbit.gl || orbit.gl.ready < 2) return;
  const {gl, at} = orbit.gl, canvasOf = $('globe'), dpr = Math.min(1.6, window.devicePixelRatio || 1);
  const w = Math.round(view.w * dpr), h = Math.round(view.h * dpr);
  if (canvasOf.width !== w || canvasOf.height !== h) { canvasOf.width = w; canvasOf.height = h; }
  gl.viewport(0, 0, w, h);
  gl.uniform2f(at.size, w, h);
  gl.uniform2f(at.centre, orbit.box.cx * dpr, orbit.box.cy * dpr);
  gl.uniform1f(at.radius, orbit.box.r * dpr);
  // The columns of the matrix back are the rows of the one turn() applies.
  const x = turn([1, 0, 0]), y = turn([0, 1, 0]), z = turn([0, 0, 1]);
  gl.uniformMatrix3fv(at.back, false, new Float32Array([x[0], y[0], z[0], x[1], y[1], z[1], x[2], y[2], z[2]]));
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}
export async function wakeStation() {
  if (station3d.st || station3d.loading) return;
  station3d.loading = true;
  try {
    if (!window.BABYLON) await script(BABYLON_SRC, BABYLON_HASH);
    if (!window.createStation3D) await script('station3d.js');
    if (!orbit.on || station3d.st) return;
    $('station-live').hidden = false;
    station3d.st = window.createStation3D($('station-live'), {still:STILL.matches});
    station3d.st.resize();
    $('station').hidden = true;
    orbit.dirty = true;
  } catch (error) {
    $('station-live').hidden = true;
    console.warn('the station stays a picture:', error.message);
  } finally {
    station3d.loading = false;
  }
}
// Leaving the planet frees the station's graphics for the game.
export function sleepStation() {
  station3d.st?.dispose();
  station3d.st = null;
  $('station-live').hidden = true;
  $('station').hidden = false;
}
export function drawFx(now) {
  if (!orbit.on || STILL.matches) return;
  const sp = $('spores'), w = innerWidth, h = innerHeight;
  if (sp.width !== w || sp.height !== h) { sp.width = w; sp.height = h; }
  fx.motes ||= Array.from({length:NARROW.matches ? 30 : 70}, () => ({x:fxRandom() * w, y:fxRandom() * h, z:fxRandom() ** 2, p:fxRandom() * 6}));
  const dt = Math.min(.1, (now - (fx.last || now)) / 1000), g = sp.getContext('2d');
  fx.last = now;
  g.clearRect(0, 0, w, h);
  for (const m of fx.motes) {
    m.y -= (8 + m.z * 40) * dt; m.x += Math.sin(now / 1400 + m.p) * (4 + m.z * 10) * dt;
    if (m.y < -20) { m.y = h + 20; m.x = fxRandom() * w; }
    const r = (1 + m.z * 4) * 4, a = .25 + .5 * (1 - m.z) * (.6 + .4 * Math.sin(now / 500 + m.p));
    const glow = g.createRadialGradient(m.x, m.y, 0, m.x, m.y, r);
    glow.addColorStop(0, m.p > 3 ? `rgba(183,243,74,${a})` : `rgba(85,214,232,${a})`); glow.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = glow; g.beginPath(); g.arc(m.x, m.y, r, 0, Math.PI * 2); g.fill();
  }
  if (!NARROW.matches && now - fx.grainAt > 83) {
    fx.grainAt = now;
    const gr = $('grain').getContext('2d'), img = fx.grain ||= gr.createImageData(320, 200);
    for (let i = 0; i < img.data.length; i += 4) { const v = fxRandom() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
    gr.putImageData(img, 0, 0);
  }
}
export function drawPlanet(elapsed) {
  drawFx(performance.now());
  if (station3d.st && orbit.box) {
    station3d.st.draw(elapsed);
    const [x, y] = station3d.st.lens(), b = orbit.box, lens = [b.sx + b.ss * x, b.sy + b.ss * y];
    if (Math.hypot(lens[0] - b.lens[0], lens[1] - b.lens[1]) > .5) { b.lens = lens; orbit.dirty = true; }
  }
  if (orbit.to) {
    const by = Math.min(1, elapsed * 4.5), {yaw, pitch} = orbit.to;
    orbit.yaw += (yaw - orbit.yaw) * by; orbit.pitch += (pitch - orbit.pitch) * by;
    if (Math.abs(yaw - orbit.yaw) + Math.abs(pitch - orbit.pitch) < .002) Object.assign(orbit, {yaw, pitch, to:null});
    orbit.dirty = true;
  }
  if (!orbit.dirty || !orbit.box) return;
  orbit.dirty = false;
  drawGlobe(); drawGrid();
}

// ---- The projection
export function holdToDo(b, done) {
  let wait = 0, twice = 0;
  const stop = () => { clearTimeout(wait); b.classList.remove('holding'); };
  const start = () => { stop(); b.classList.add('holding'); wait = setTimeout(() => { stop(); done(); }, 1000); };
  b.onpointerdown = start;
  for (const name of ['pointerup', 'pointercancel', 'pointerleave', 'blur']) b.addEventListener(name, stop);
  b.onkeydown = event => { if (event.key !== 'Enter') return; event.preventDefault(); if (!event.repeat) start(); };
  b.onkeyup = event => { if (event.key === 'Enter') stop(); };
  // A screen reader cannot hold: it presses twice.
  b.onclick = event => {
    if (event.detail) return;
    if (Date.now() < twice) done(); else twice = Date.now() + 3000;
  };
}
export function noteOnPlanet(text, bad) {
  $('slot-note').textContent = text;
  $('slot-note').classList.toggle('bad', Boolean(bad));
  orbit.dirty = true;
}
export function durationText(seconds) {
  const min = Math.floor((Number(seconds) || 0) / 60);
  return min < 60 ? `${min} min` : `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')}`;
}
export function stageText(game) {
  const stage = within(Math.floor(Number(game.stage) || 0), 0, STAGES.length);
  if (game.over) return L`Le cœur est tombé au stade ${Math.min(STAGES.length, stage + 1)}`;
  const far = game.level > 1 ? L` · avant-postes au niveau ${game.level}` : '';
  if (game.won != null) return L('Éclosion · victoire') + far;
  return (stage === STAGES.length ? L`Stade ${stage} achevé` : L`Stade ${stage + 1} · ${STAGES[stage].name}`) + far;
}
export function projectSlot(note = '', bad = false) {
  const id = orbit.pick, game = orbit.list.games[id], incoming = !game && orbit.incoming;
  const first = incoming && {name:incoming[0].name || L('Partie sans nom'), ...summaryOf(incoming[0].game)};
  const shown = game || first, box = $('projection');
  box.classList.toggle('free', !shown);
  box.classList.toggle('fallen', Boolean(shown?.over));
  const state = orbit.list.planet, locked = !game && !incoming && state && !isOpen(state, id);
  $('slot-kicker').textContent = incoming ? L('Fichier reçu') : locked ? L('Hexagone infecté') : !game && state && purified(state, id) ? L('Hexagone purifié') : !game && state && anyPurified(state) ? L('Hexagone ouvert') : !game ? L('Hexagone libre') : game.demo ? L('Démo · repart à neuf à chaque lancement') : game.over ? L('Station tombée') : game.fight ? L('En combat') : L('Partie en cours');
  $('slot-kicker').classList.toggle('fight', Boolean(game?.fight && !game.over && !game.demo));
  $('slot-name').textContent = incoming?.length > 1 ? L`${incoming.length} parties` : shown ? shown.name : locked ? L('Terre infectée') : L('Terre vierge');
  $('slot-sub').textContent = incoming?.length > 1 ? L('Elles prendront les hexagones libres autour de celui-ci.') : shown ? stageText(shown) : locked ? L('Fais éclore une souche sur un hexagone voisin pour l’ouvrir.') : L('Fonde une station, ou greffes-y une partie exportée.');
  const six = dotsOf(Array.from({length:6}, (_, i) => [66 + Math.cos(i * Math.PI / 3) * 63, 66 + Math.sin(i * Math.PI / 3) * 63]));
  const color = locked ? '#8A3040' : !shown ? '#B7F34A' : shown.over ? '#FF6B74' : '#66D9EA';
  const inner = shown ? settlementSVG((u, v) => [66 + u * 55, 66 - v * 55], shown, id, .85) : locked ? '<circle cx="66" cy="66" r="14" fill="#3A1820" stroke="#8A3040" stroke-width="2"/><circle cx="60" cy="62" r="3" fill="#8A3040"/><circle cx="71" cy="70" r="4" fill="#8A3040"/>' : '<path d="M52 66h28M66 52v28" stroke="#B7F34A" stroke-width="3"/>';
  $('slot-icon').innerHTML = `<polygon points="${six}" fill="#040A0C99" stroke="${color}" stroke-width="1.5"/>${inner}`;
  const facts = game ? [[durationText(game.played), L('de jeu')], [Math.floor(Number(game.dna) || 0).toLocaleString(LOCALE), L('ADN')], [Number(game.spent) || 0, L('nids détruits')], [(Number(game.kills) || 0).toLocaleString(LOCALE), L('tuées')]] : [];
  $('slot-facts').replaceChildren(...facts.map(([value, label]) => {
    const p = document.createElement('p'), b = document.createElement('b');
    // @ts-expect-error: loose typing, tightened module by module (item_007)
    b.textContent = value; p.append(b, label);
    return p;
  }));
  $('slot-actions').replaceChildren();
  const act = (label, cls, done, held) => {
    const b = document.createElement('button');
    b.className = `act ${cls}`; b.textContent = label;
    if (held) { b.append(document.createElement('i')); holdToDo(b, done); } else b.onclick = done;
    $('slot-actions').append(b);
  };
  const gone = () => {
    if (!eraseGame(id)) return noteOnPlanet(L('Impossible d’effacer cette partie.'), true);
    orbit.list = planetList(); nameGames(); projectSlot(L('Hexagone libéré.'));
  };
  if (incoming) {
    act(incoming.length > 1 ? L`Greffer les ${incoming.length} parties` : L('Greffer dans cet hexagone'), 'go', () => {
      const made = graftGames(orbit.incoming, orbit.pick);
      if (made == null) return noteOnPlanet(L('Import impossible : le stockage du navigateur est plein, ou la planète l’est.'), true);
      orbit.incoming = null; orbit.list = planetList(); nameGames();
      pickHex(Number(made), L('Greffe réussie.'));
    });
    act(L('Annuler'), '', () => { orbit.incoming = null; projectSlot(); });
  } else if (!game) {
    if (!locked) act(L('Fonder une station'), 'go', () => leavePlanet(() => foundGame(orbit.pick)));
    act(L('Importer un fichier'), '', () => $('file').click());
    act(L('Tout exporter'), '', async () => noteOnPlanet(await exportAll()));
  } else if (game.demo) {
    // Fetched only once its hexagon is picked: the planet opens without it.
    if (!window.DEMO_GAME) loadDemo().then(() => { if (orbit.pick === DEMO_HEX) projectSlot(); });
    act(window.DEMO_GAME ? L('Lancer la démo') : L('Démo en chargement…'), 'go', () => { if (window.DEMO_GAME) playPicked(); else loadDemo().then(() => projectSlot()); });
  } else {
    if (game.over) {
      act(L('Refonder ici : maintenir'), 'go', () => { if (eraseGame(id)) leavePlanet(() => foundGame(id)); }, true);
    } else act(L('Reprendre'), 'go', () => playPicked());
    act(L('Exporter'), '', async () => noteOnPlanet(await exportGame(id)));
    if (!game.over) act(L('Dupliquer'), '', () => {
      const copy = parsed(stored(game.key));
      const made = copy && graftGames([{name:L`${game.name} bis`, game:copy}], freeHex(orbit.list, id));
      if (made == null) return noteOnPlanet(L('Copie impossible : partie illisible ou stockage plein.'), true);
      orbit.list = planetList(); nameGames();
      pickHex(Number(made), L('Copie faite.'));
    });
    act(L('Effacer : maintenir'), 'bad', gone, true);
  }
  noteOnPlanet(note || (incoming ? L('Rien n’est écrit avant ta validation. Aucune partie n’est écrasée.') : ''), bad);
  const held = Object.entries(state?.mutations || {});
  $('planet-mutations').hidden = !held.length;
  $('planet-mutations').innerHTML = held.length ? L`<span class="label">Mutations de souche</span>` + held.map(([id, n]) => `<span class="chip">${mutationPic(id)}${MUTATIONS[id].name}${n > 1 ? ` ×${n}` : ''}</span>`).join('') : '';
}
// The drawn hexagons are for pointers, these for keyboards and screen readers.
export function nameGames() {
  $('games').replaceChildren(...Object.entries(orbit.list.games).map(([id, game]) => {
    const b = document.createElement('button');
    b.dataset.hex = id;
    b.setAttribute('aria-label', `${game.name}, ${stageText(game)}`);
    b.onclick = () => pickHex(Number(id));
    b.onfocus = () => faceHex(Number(id));
    return b;
  }));
  orbit.dirty = true;
}
export function pickHex(id, note) {
  if (orbit.pick !== id) playSound('hex');
  orbit.pick = id;
  // What came in a file waits for a free hexagon.
  if (orbit.incoming && orbit.list.games[id]) orbit.incoming = null;
  replay($('projection'), 'open');
  projectSlot(note);
  faceHex(id);
}
export async function takeFile(file) {
  if (!file) return;
  showMenu(false);
  if (file.size > FILE.bytes) return noteOnPlanet(L('Ce fichier est trop gros pour être une partie Strainworks.'), true);
  let text;
  try { text = await file.text(); } catch (_) { return noteOnPlanet(L('Ce fichier n’a pas pu être lu.'), true); }
  if (!orbit.on) return;
  const {found, error} = readFileGames(text);
  if (error) return noteOnPlanet(error, true);
  const id = orbit.list.games[orbit.pick] ? freeHex(orbit.list, orbit.pick) : orbit.pick;
  if (id == null || Object.keys(orbit.list.games).length + found.length > CELLS_OF_GLOBE.length) return noteOnPlanet(L('Pas assez d’hexagones libres.'), true);
  orbit.incoming = found;
  pickHex(id);
}

// ---- In and out
export function backgroundInert(on) {
  for (const el of $('app').children) if (!['planet', 'menu', 'commands', 'file', 'lang-pick', 'unlock', 'mutations'].includes(el.id)) el.inert = on;
}
export function openPlanet(intro) {
  if (slotKey) save();
  orbit.on = true;
  mainSet.slotKey(mainSet.slotId(null));
  arrows.clear(); mainSet.gesture(null); mainSet.drag(null);
  showMenu(false);
  orbit.list = planetList();
  orbit.incoming = null;
  const last = Number(orbit.list.last), mine = Object.keys(orbit.list.games).filter(id => Number(id) !== DEMO_HEX);
  orbit.pick = orbit.list.last != null && orbit.list.games[last] ? last : Number(mine[0] ?? PREFERRED[0]);
  if (demoMoved) { mainSet.demoMoved(false); setTimeout(() => noteOnPlanet(L('Ta partie a été déplacée sur un hexagone voisin pour laisser place à la démo.')), 0); }
  if (!$('station').src) {
    $('space').src = ART.space; $('station').src = ART.station;
    makeGlobe();
  }
  const el = $('planet');
  el.classList.remove('leaving');
  el.hidden = false;
  $('app').classList.add('on-planet');
  backgroundInert(true);
  // A hatching's mutation not yet chosen waits here.
  if (orbit.list.planet?.offer?.length) setTimeout(() => { if (orbit.on) openMutations(); }, 0);
  nameGames(); projectSlot(); layoutPlanet();
  orbit.yaw = orbit.pitch = 0; orbit.to = null;
  faceHex(orbit.pick);
  if (intro && !STILL.matches) {
    // It swings in from its far side.
    const to = orbit.to || {yaw:0, pitch:0};
    orbit.yaw = to.yaw - 1.1; orbit.pitch = to.pitch + .25; orbit.to = to;
  }
  wakeStation();
}
// enter readies the game and says whether it could.
export function leavePlanet(enter, at) {
  if (!orbit.on) return false;
  orbit.on = false;
  if (!enter()) {
    orbit.on = true;
    return false;
  }
  // @ts-expect-error: loose typing, tightened module by module (item_007)
  const el = $('planet'), [x, y] = onScreen(turn(CELLS_OF_GLOBE[slotId].c));
  $('app').classList.remove('on-planet');
  backgroundInert(false);
  showMenu(false);
  orbit.seenAt = performance.now();
  el.style.transformOrigin = `${x}px ${y}px`;
  // The live station stays through the zoom: its picture is an older model.
  if (at === 'now' || STILL.matches) { el.hidden = true; sleepStation(); }
  else {
    playSound('zoom');
    el.classList.add('leaving');
    setTimeout(() => { if (!orbit.on) { el.hidden = true; sleepStation(); } }, 720);
  }
  resize(); home();
  canvas.focus({preventScroll:true});
  // 3D unless the player picked 2D.
  if (stored(VIEW_KEY) !== '2d' && !view3d) show3D(true);
  return true;
}
export function playPicked(at) {
  const id = orbit.pick;
  if (!leavePlanet(() => openGame(id), at)) projectSlot(L('Cette partie est illisible. Elle n’a pas été modifiée : exporte-la ou efface-la.'), true);
}
// The last game played, or a first one.
export function resumeLast() {
  if (!orbit.on) return;
  const game = orbit.list.games[orbit.pick];
  if (game && !game.over) playPicked('now');
  else leavePlanet(() => foundGame(game ? null : orbit.pick), 'now');
}
// Exclusive time: what a nested scope costs is taken off its parent.
export function timed(kindOf, f) {
  return function (...args) {
    if (!PERF.on) return f.apply(this, args);
    const kind = typeof kindOf === 'function' ? kindOf() : kindOf, scope = {since:performance.now(), inner:0};
    PERF.stack.push(scope);
    try { return f.apply(this, args); }
    finally {
      const spent = performance.now() - scope.since;
      PERF.stack.pop();
      PERF.cost[kind] += spent - scope.inner;
      if (PERF.stack.length) PERF.stack.at(-1).inner += spent;
    }
  };
}

export function perfReset() {
  Object.assign(PERF, {stack:[], cost:perfZero(), frames:0, gaps:0, frameSum:0, framePeak:0, cpu:0, cpuPeak:0, since:performance.now(), lastFrame:0, history:[]});
}
// Called once a frame, after it is drawn: one sample every 100 ms, averaged per frame.
export function perfFrame(now, cpu) {
  const fps = watchCurve(now);
  if (fps) askCurve(fps);
  if (!PERF.on || document.hidden) return;
  if (PERF.lastFrame) { const gap = now - PERF.lastFrame; PERF.gaps++; PERF.frameSum += gap; PERF.framePeak = Math.max(PERF.framePeak, gap); }
  PERF.lastFrame = now;
  PERF.frames++; PERF.cpu += cpu; PERF.cpuPeak = Math.max(PERF.cpuPeak, cpu);
  if (now - PERF.since < 100) return;
  const n = PERF.frames, costs = Object.fromEntries(Object.entries(PERF.cost).map(([id, ms]) => [id, ms / n]));
  PERF.history.push({at:now, costs, gpu:view3d?.gpu?.() ?? null, cpu:PERF.cpu / n, cpuPeak:PERF.cpuPeak, frame:PERF.gaps ? PERF.frameSum / PERF.gaps : 0, framePeak:PERF.framePeak});
  while (PERF.history.length && PERF.history[0].at < now - 30000) PERF.history.shift();
  Object.assign(PERF, {cost:perfZero(), frames:0, gaps:0, frameSum:0, framePeak:0, cpu:0, cpuPeak:0, since:now});
  drawPerf();
}
export function drawPerf() {
  const canvas = $('perf-chart'), width = canvas.clientWidth, height = 150;
  if (!width) return;
  const ratio = Math.min(window.devicePixelRatio || 1, 2), g = canvas.getContext('2d');
  if (canvas.width !== Math.round(width * ratio)) { canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio); }
  g.setTransform(ratio, 0, 0, ratio, 0, 0);
  g.clearRect(0, 0, width, height);
  const list = PERF.history, last = list.at(-1), now = last?.at ?? performance.now();
  // The scale follows the usual frame, a rare stall keeps its value written above the chart.
  const tops = list.map(s => Math.max(s.cpu, s.frame, s.gpu ?? 0)).sort((a, b) => a - b);
  const ceiling = Math.max(36, Math.ceil((tops[Math.max(0, Math.ceil(tops.length * .9) - 1)] ?? 0) / 10) * 10);
  const left = 30, right = 6, top = 8, bottom = 18;
  const x = at => left + (at - now + 30000) / 30000 * (width - left - right);
  const y = ms => height - bottom - Math.min(ms, ceiling) / ceiling * (height - top - bottom);
  g.font = '10px Barlow, system-ui'; g.lineWidth = 1;
  for (const tick of [0, 1000 / 60, 1000 / 30]) {
    g.strokeStyle = tick ? '#FFFFFF2A' : '#FFFFFF14'; g.setLineDash(tick ? [4, 4] : []);
    g.beginPath(); g.moveTo(left, y(tick)); g.lineTo(width - right, y(tick)); g.stroke();
    g.fillStyle = '#A9BDB8'; g.textAlign = 'right';
    g.fillText(tick ? tick.toFixed(1) : '0', left - 4, y(tick) + 3);
  }
  g.setLineDash([]); g.textAlign = 'center';
  for (const s of [30, 20, 10, 0]) g.fillText(s ? `-${s} s` : 'maintenant', Math.min(width - 28, Math.max(left + 14, x(now - s * 1000))), height - 4);
  g.save(); g.beginPath(); g.rect(left, top, width - left - right, height - top - bottom); g.clip();
  const under = list.map(() => 0);
  for (const [id, , color] of PERF_KINDS) {
    g.beginPath();
    list.forEach((s, i) => { const px = x(s.at), py = y(under[i] + s.costs[id]); i ? g.lineTo(px, py) : g.moveTo(px, py); });
    for (let i = list.length - 1; i >= 0; i--) g.lineTo(x(list[i].at), y(under[i]));
    g.closePath(); g.fillStyle = color + 'CC'; g.fill();
    list.forEach((s, i) => { under[i] += s.costs[id]; });
  }
  const line = (field, color, width, dash = []) => {
    g.beginPath(); g.strokeStyle = color; g.lineWidth = width; g.setLineDash(dash);
    list.forEach((s, i) => (i ? g.lineTo : g.moveTo).call(g, x(s.at), y(s[field])));
    g.stroke();
  };
  line('cpuPeak', '#F0A03C88', 1, [2, 3]);
  line('framePeak', '#FFFFFF44', 1, [2, 3]);
  line('frame', '#FFFFFF', 1.6);
  g.beginPath(); g.strokeStyle = '#66D9EA'; g.lineWidth = 1.6; g.setLineDash([]);
  let on = false;
  for (const s of list) { if (s.gpu == null) { on = false; continue; } (on ? g.lineTo : g.moveTo).call(g, x(s.at), y(s.gpu)); on = true; }
  g.stroke();
  g.restore();
  const peak = Math.max(0, ...list.map(s => Math.max(s.framePeak, s.cpuPeak)));
  if (peak > ceiling) { g.fillStyle = '#F0A03C'; g.textAlign = 'right'; g.fillText(L`pic ${peak.toFixed(0)} ms`, width - right, top + 9); }
  if (!last) return;
  const fps = last.frame ? 1000 / last.frame : 0, figure = n => n.toFixed(1).replace('.', DEC);
  $('perf-sum').textContent = L`${Math.round(fps)} images/s · ${figure(last.frame)} ms entre deux · CPU ${figure(last.cpu)} ms par image`;
  for (const [id] of PERF_KINDS) $(`perf-${id}`).textContent = `${figure(last.costs[id])} ms`;
  $('perf-gpu').textContent = last.gpu == null ? (view3d ? 'indisponible' : L('en 3D seulement')) : `${figure(last.gpu)} ms`;
  const minute = (ui.earned || []).filter(e => e.at > G.time - 60), by = {};
  ui.earned = minute;
  for (const e of minute) by[e.source] = (by[e.source] || 0) + e.amount;
  const span = Math.min(60, Math.max(1, G.time - (ui.perfFrom ?? 0)));
  const rate = n => Math.round(n * 60 / span);
  $('perf-dna').textContent = L`ADN / min : ${rate(Object.values(by).reduce((a, b) => a + b, 0))}` + Object.entries(EARN).filter(([id]) => by[id]).map(([id, name]) => ` · ${name.toLowerCase()} ${rate(by[id])}`).join('');
  $('perf-other').textContent = `${figure(Math.max(0, last.cpu - Object.values(last.costs).reduce((a, b) => a + b, 0)))} ms`;
}
export function showPerf(on) {
  PERF.on = on;
  ui.perfFrom = G?.time ?? 0;
  perfReset();
  $('perf').hidden = !on;
  $('perf-toggle').setAttribute('aria-pressed', on);
  $('perf-toggle').textContent = on ? L('Masquer') : L('Afficher');
}
export function setQuality(fast, remake) {
  window.quality3d = fast ? 'fast' : 'high';
  $('quality-high').setAttribute('aria-pressed', !fast);
  $('quality-fast').setAttribute('aria-pressed', fast);
  if (!remake || !made3d || switching) return;
  const open = Boolean(view3d);
  made3d.dispose(); mainSet.made3d(mainSet.view3d(null));
  if (open) show3D(true);
}
export function setCurve(value) {
  // Never set: flat ground; curvature costs frames on a weak graphics card, so the player opts in.
  const named = {none:0, soft:.5, strong:1}[value], amount = value == null ? 0 : named ?? Math.max(0, Math.min(1, Number(value) || 0));
  window.curve3d = amount;
  $('curve-amount').value = Math.round(amount * 100);
  $('curve-shown').textContent = `${Math.round(amount * 100)} %`;
}
// Curvature can cost frames on a weak graphics card. In 3D with curvature on, once the view's first seconds have
// passed, a rate under the floor for `hold` one-second windows in a row offers to cut it, once a page session.
// The floor sits a little under 60 so a 60 Hz screen's own jitter never asks. A gap (hidden tab) starts over.
export const CURVE_SLOW = {floor:55, hold:3, warm:2000, gap:500};
export const curveWatch = {asked:false, last:0, from:0, frames:0, slow:0};
// Returns the measured rate when it is time to ask, else null.
export function watchCurve(now, on = Boolean(view3d) && window.curve3d > 0 && !document.hidden, w = curveWatch) {
  const gap = w.last ? now - w.last : 0;
  w.last = now;
  if (w.asked || !on || gap > CURVE_SLOW.gap) { w.from = 0; return null; }
  if (!w.from) { Object.assign(w, {from:now + CURVE_SLOW.warm, frames:0, slow:0}); return null; }
  if (now < w.from) return null;
  w.frames++;
  if (now - w.from < 1000) return null;
  const fps = w.frames * 1000 / (now - w.from);
  w.slow = fps < CURVE_SLOW.floor ? w.slow + 1 : 0;
  Object.assign(w, {from:now, frames:0});
  if (w.slow < CURVE_SLOW.hold) return null;
  w.asked = true;
  return Math.round(fps);
}
// A note among the game's events, with two answers; it never blocks play.
export function askCurve(fps) {
  const text = L`La courbure 3D ralentit l’affichage (${fps} images/s). La couper ?`;
  tell(text);
  const entry = ui.events.find(e => e.text === text);
  if (!entry) return;
  const row = document.createElement('span');
  row.className = 'choices';
  const answer = (label, act) => { const b = document.createElement('button'); b.textContent = label; b.onclick = () => { act(); forgetEvent(text); }; row.append(b); };
  answer(L('Couper'), () => { setCurve(0); keep(CURVE_KEY, '0'); });
  answer(L('Garder'), () => {});
  entry.el.insertBefore(row, entry.el.lastChild);
}
// ---- The strain mutation choice (item_026, docs/design/endgame-mutations): three cards, one kept for good.
const MUTATION_PICS = {
  drone:'<ellipse cx="18" cy="18" rx="12" ry="6" fill="none" stroke="#66D9EA" stroke-width="2"/><circle cx="18" cy="18" r="4.5" fill="#E9F3EF"/><circle cx="18" cy="18" r="2" fill="#B7F34A"/>',
  dna:'<path d="M12 7c12 6 0 16 12 22M24 7c-12 6 0 16-12 22" fill="none" stroke="#B7F34A" stroke-width="2.4" stroke-linecap="round"/><path d="M14 13h8M14 23h8" stroke="#66D9EA" stroke-width="2" stroke-linecap="round"/>',
  hunger:'<circle cx="18" cy="18" r="11" fill="#1D3317" stroke="#B7F34A" stroke-width="2"/><path d="M12 18h12" stroke="#E9F3EF" stroke-width="3" stroke-linecap="round"/>',
  turret:'<rect x="11" y="18" width="14" height="9" rx="2" fill="#2C3A3D" stroke="#A9BDB8" stroke-width="1.5"/><path d="M18 18V8" stroke="#E9F3EF" stroke-width="3" stroke-linecap="round"/><circle cx="18" cy="8" r="2.5" fill="#F0A03C"/>',
  harvest:'<path d="M9 26h18" stroke="#A9BDB8" stroke-width="2"/><circle cx="14" cy="20" r="4" fill="#6DAA38" stroke="#C9F77A" stroke-width="1.2"/><path d="M20 12l6 0M22 9l4 3-4 3" fill="none" stroke="#B7F34A" stroke-width="2" stroke-linecap="round"/>',
  rank:'<path d="M18 7l3.5 7 7.5 1-5.5 5 1.5 7.5L18 24l-7 3.5 1.5-7.5-5.5-5 7.5-1z" fill="none" stroke="#F0A03C" stroke-width="2" stroke-linejoin="round"/>',
};
export const mutationPic = id => `<svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true">${MUTATION_PICS[id] || ''}</svg>`;
export function openMutations() {
  const state = readList().planet, box = $('mutations');
  if (!state.offer?.length || !box) return false;
  let picked = null;
  const take = $('mutation-take');
  take.disabled = true; take.textContent = L('Choisis une carte');
  $('mutation-cards').replaceChildren(...state.offer.map(id => {
    const m = MUTATIONS[id], b = document.createElement('button'), have = state.mutations[id] || 0;
    b.type = 'button'; b.className = 'card'; b.dataset.mutation = id; b.setAttribute('aria-pressed', 'false');
    b.innerHTML = `<span class="pic">${mutationPic(id)}</span><h3>${m.name}</h3><p>${m.what}</p><span class="stack">${m.cap > 1 ? L`Cumulable · <b>${have} / ${m.cap}</b> déjà pris` : L('Une seule fois')}</span>`;
    b.onclick = () => {
      picked = id;
      for (const one of $('mutation-cards').children) one.setAttribute('aria-pressed', String(one === b));
      take.disabled = false; take.textContent = L`Prendre ${m.name}`;
    };
    return b;
  }));
  take.onclick = () => {
    const list = readList();
    if (!picked || !takeMutation(list.planet, picked, Date.now() % 1e6) || !writeList(list)) return;
    box.close();
    $('won-mutation').hidden = !list.planet.offer?.length;
    if (orbit.on) { orbit.list = planetList(); projectSlot(); }
    if (list.planet.offer?.length) openMutations(); else offerConcept('mutation');
  };
  if (!box.open) box.showModal();
  return true;
}
// A game in progress is saved and reopened after the page reloads.
export function keepForReload() {
  if (slotKey && !orbit.on) { save(); try { sessionStorage.setItem('strainworks-resume', '1'); } catch (_) { /* blocked or full storage: the game goes on without remembering it */ } }
}

// The bindings other modules replace.
export const planetSet = {

};
