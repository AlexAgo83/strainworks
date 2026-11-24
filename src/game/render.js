// The 2D view: the map, its pieces, items, creatures and effects drawn on the canvas, and the camera.
import { CORE, CROSS, DESK, DX, DY, G, NERVE, NEST, PACK, RADAR, REAPER, VEIN, WORM, allCells, armReach, boxOf, built, buried, capOf, carbonSide, carries, cellAt, centreOf, contentOf, coreCell, corpseSunk, depositAt, exitOf, forgetCells, hasTrait, healing, heardOf, holdCap, inSight, isBelt, isGun, isSplit, joinSide, key, leaking, listens, matterUnder, paceOf, patchOf, pocketCap, pumps, rankOf, richAt, richCap, sizeOf, trackAfter, trackSize } from "../sim/sim.ts";
import { L } from "../sim/text.ts";
import { creatureAt, dronePose, feeders, fieldsIn, known, portSide, radarWave, shownNests, stagePart } from "./actions.js";
import { drawFog, layoutHud, sceneSigns } from "./hud.js";
import { drawPreview } from "./input.js";
import { $, LIMIT, NERVE_COLORS, STILL, cam, canvas, ctx, drag, flat, flinchOf, formOf, gateGreen, gesture, linking, mainSet, motionTime, nestHurt, orbit, owed, selected, tileCentre, ui, view, view3d, wiring, wormId } from "./main.js";
import { layoutPlanet } from "./planet.js";

export function resize() {
  const box = $('board').getBoundingClientRect();
  mainSet.view({w:Math.max(1, box.width), h:Math.max(1, box.height), dpr:Math.min(2, window.devicePixelRatio || 1)});
  canvas.width = view.w * view.dpr; canvas.height = view.h * view.dpr;
  layoutHud();
  if (orbit.on) layoutPlanet();
}
export function worldAt(sx, sy) { return {x:cam.x + (sx - view.w / 2) / cam.zoom, y:cam.y + (sy - view.h / 2) / (cam.zoom * flat())}; }
export function pan(dx, dy) {
  cam.x = Math.max(-LIMIT, Math.min(LIMIT, cam.x - dx / cam.zoom));
  cam.y = Math.max(-LIMIT, Math.min(LIMIT, cam.y - dy / (cam.zoom * flat())));
}
export function zoomAt(factor, sx = view.w / 2, sy = view.h / 2) {
  const before = worldAt(sx, sy);
  cam.zoom = Math.max(4, Math.min(72, cam.zoom * factor));
  const after = worldAt(sx, sy);
  cam.x = Math.max(-LIMIT, Math.min(LIMIT, cam.x + before.x - after.x));
  cam.y = Math.max(-LIMIT, Math.min(LIMIT, cam.y + before.y - after.y));
}
export function home() {
  // Centred on the core: a new game starts from it alone.
  const c = centreOf(coreCell() || {x:CORE.x, y:CORE.y, type:'core'});
  cam.x = c.x; cam.y = c.y;
  cam.zoom = Math.max(11, Math.min(44, Math.min(view.w / 28, view.h / (28 * flat()))));
}
export function circle(g, x, y, r, fill, stroke, width = .04) {
  g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2);
  if (fill) { g.fillStyle = fill; g.fill(); }
  if (stroke) { g.strokeStyle = stroke; g.lineWidth = width; g.stroke(); }
}
// Where an item is in its cell: a curve from the edge it came in by to the edge it leaves by.
// With the middle as control point a straight cell gives a constant speed.
export function along(c, travel, out, progress) {
  const t = Math.min(1, progress + owed * paceOf(c, out)), u = 1 - t;
  const from = travel < 0 || travel === (out + 2) % 4 ? out : travel;
  return {
    x:c.x + .5 - DX[from] * .5 * u * u + DX[out] * .5 * t * t,
    y:c.y + .5 - DY[from] * .5 * u * u + DY[out] * .5 * t * t,
    angle:Math.atan2(DY[from] * u + DY[out] * t, DX[from] * u + DX[out] * t)
  };
}
// What is inside on its way: from the mouth it came in by, through the middle, to the one it leaves by.
export function passing(c) {
  const found = [], size = sizeOf(c), {x, y} = centreOf(c), now = G.time + owed;
  const show = (item, from, done, through) => {
    const half = size / 2, back = through ? Math.max(0, .5 - done) * 2 : 1 - done, on = through ? Math.max(0, done - .5) * 2 : 0;
    found.push({item, done, x:x - DX[from] * half * back + DX[c.dir] * half * on, y:y - DY[from] * half * back + DY[c.dir] * half * on});
  };
  const list = (items, due, time, through) => {
    if (!due) return;
    for (let i = Math.max(0, due.length - 6); i < due.length; i++) {
      const left = due[i].at - now, item = items[items.length - due.length + i];
      if (item && left > 0) show(item, due[i].from, Math.max(0, 1 - left / time), through);
    }
  };
  if (c.due) list(c.stock, c.due, CROSS * size, c.type === 'cyst' || c.type === 'vault');
  if (c.portDue) c.ports.forEach((items, port) => list(items, c.portDue[port], CROSS, false));
  if (c.gulp && now - c.gulp.t < .3) show(c.gulp.item, c.gulp.from, Math.max(0, (now - c.gulp.t) / .3), false);
  return found;
}
export function polygon(g, points, fill, stroke, width = .04) {
  g.beginPath(); points.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath();
  if (fill) { g.fillStyle = fill; g.fill(); }
  if (stroke) { g.strokeStyle = stroke; g.lineWidth = width; g.stroke(); }
}
export function rect(g, x, y, w, h, fill, stroke) {
  polygon(g, [[x,y],[x+w,y],[x+w,y+h],[x,y+h]], fill, stroke);
}
export function glyph(g, base, x, y, r) {
  if (base === 'S') { circle(g, x, y, r * .9, '#6DAA38', '#C9F77A', r * .2); }
  if (base === 'C') polygon(g, [[x-r,y],[x+r*.6,y-r*.95],[x+r,y],[x+r*.6,y+r*.95]], '#B9AA8C', '#FFF3D9', r * .18);
  if (base === 'F') {
    g.lineCap = 'round';
    for (const [width, color] of [[1.15,'#FFC06B'],[.8,'#B86B1E']]) {
      // @ts-expect-error: loose typing, tightened module by module (item_007)
      g.lineWidth = r * width; g.strokeStyle = color;
      g.beginPath(); g.moveTo(x-r*.55,y); g.lineTo(x+r*.55,y); g.stroke();
    }
  }
  if (base === 'I') {
    polygon(g, [[x, y - r * 1.1], [x + r * .75, y], [x, y + r * 1.1], [x - r * .75, y]], '#3A1D4A', '#D08CFF', r * .2);
    circle(g, x, y - r * .25, r * .18, '#F1D6FF');
  }
  if (base === 'K') {
    polygon(g, [0,1,2,3,4,5].map(i => [x + Math.cos(i * Math.PI / 3) * r, y + Math.sin(i * Math.PI / 3) * r]), '#23282C', '#AEB9BF', r * .2);
    circle(g, x - r * .2, y - r * .2, r * .22, '#69757C');
  }
  if (base === 'N') {
    g.lineWidth = r * .3; g.strokeStyle = '#55D6E8'; g.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const a = i * Math.PI / 3, dx = Math.cos(a) * r, dy = Math.sin(a) * r;
      g.beginPath(); g.moveTo(x-dx,y-dy); g.lineTo(x+dx,y+dy); g.stroke();
    }
    circle(g, x, y, r * .35, '#D5FAFF');
  }
}
export function crate(g, box, x, y, w, h) {
  const cut = h * .25, color = box === 'A' ? '#F0A03C' : '#55D6E8';
  polygon(g, [[x-w/2+cut,y-h/2],[x+w/2-cut,y-h/2],[x+w/2,y-h/2+cut],[x+w/2,y+h/2-cut],[x+w/2-cut,y+h/2],[x-w/2+cut,y+h/2],[x-w/2,y+h/2-cut],[x-w/2,y-h/2+cut]], '#23282C', color, h * .12);
  // Six rounds showing on a magazine, two seals on a capsule.
  for (let i = 0; i < (box === 'A' ? 6 : 2); i++) {
    if (box === 'A') rect(g, x + (i - 2.5) * w / 7.5 - w / 30, y - h * .68, w / 15, h * .2, color);
    else circle(g, x + (i - .5) * w * .94, y, h * .13, color);
  }
}
export function sequence(g, item, x, y, room, size) {
  if (boxOf(item)) {
    crate(g, boxOf(item), x, y, room * 1.1, room * .62);
    return sequence(g, contentOf(item), x, y, room * .8, size * .8);
  }
  const n = item.length;
  [...item].forEach((b, i) => glyph(g, b, x + (n === 1 ? 0 : (i - (n - 1) / 2) * room / n), y, n === 1 ? size : Math.min(size, room / n * .55)));
}
export function token(g, item, x, y, angle = 0) {
  if (item.length === 1) return glyph(g, item, x, y, .17);
  if (boxOf(item)) {
    g.save(); g.translate(x, y); g.rotate(angle + Math.PI);
    crate(g, boxOf(item), 0, 0, .78, .44); sequence(g, contentOf(item), 0, 0, .58, .12);
    g.restore(); return;
  }
  // A gene turns with the belt, first base leading.
  g.save(); g.translate(x, y); g.rotate(angle + Math.PI); x = y = 0;
  g.lineCap = 'round'; g.strokeStyle = '#05090B'; g.lineWidth = .34;
  g.beginPath(); g.moveTo(x-.24,y); g.lineTo(x+.24,y); g.stroke();
  if (item.length === 3) [...item].forEach((b, i) => glyph(g, b, x + (i-1) * .24, y, .12));
  else {
    g.lineWidth = .3; g.strokeStyle = '#17301D';
    g.beginPath(); g.moveTo(-.34,0); g.lineTo(.34,0); g.stroke();
    sequence(g,item,0,0,.84,.09); rect(g,-.012,-.15,.024,.3,'#B7F34A');
  }
  g.restore();
}
export function arrow(g, dir, reach = .46, color = '#A3B8B3') {
  const x = DX[dir], y = DY[dir];
  polygon(g, [[x*reach,y*reach],[x*(reach-.15)-y*.12,y*(reach-.15)+x*.12],[x*(reach-.15)+y*.12,y*(reach-.15)-x*.12]], color);
}
export function lamp(g, c) {
  const on = gateGreen(c);
  const color = on ? '#62E06A' : '#FF4D5E';
  // Red also shows as a bar across the rail, so colour is not the only signal.
  if (!on) {
    if (DX[c.dir]) rect(g,-.07,-.46,.14,.92,color); else rect(g,-.46,-.07,.92,.14,color);
  }
  circle(g,-.32,-.32,.17,color,'#05090B',.05);
  arrow(g,c.dir,.49,color);
  if (listens(c) && !(c.when && c.when !== 'gene')) reading(g,c,heardOf(c));
}
// What a listener reads: the shape wanted now, and one tick per position.
export function reading(g, c, net) {
  const place = c.read || 0, x = .3, y = .31;
  circle(g,x,y,.19,'#05090B','#55D6E8',.04);
  if (net.focus) { if (place) glyph(g,net.focus[place - 1],x,y,.12); else sequence(g,net.focus,x,y,.32,.07); }
  for (let i = 0; i < place; i++) rect(g,.2 + i * .1,-.48,.06,.18,'#55D6E8');
}
export function drawCell(g, c, inputs = []) {
  if (c.type === 'relay') {
    circle(g,0,0,.3,'#0B1417','#3FC6DC',.05);
    const beat = .5 + .5 * Math.sin(motionTime() * 4 + c.x);
    g.beginPath(); g.moveTo(0,-.24); g.lineTo(.18,0); g.lineTo(0,.24); g.lineTo(-.18,0); g.closePath();
    g.fillStyle = '#36AFC6'; g.fill();
    circle(g,0,0,.07 + beat * .03,'#B8F3FA');
    return;
  }
  if (c.type === 'radar') {
    rect(g,-.42,-.42,.84,.84,'#0B1417','#3FC6DC');
    circle(g,0,0,.26,'#141F23','#66D9EA',.05);
    const a = motionTime() * 1.6;
    g.beginPath(); g.moveTo(0,0); g.lineTo(Math.cos(a) * .4,Math.sin(a) * .4); g.strokeStyle = '#9FE6F0'; g.lineWidth = .08; g.stroke();
    circle(g,0,0,.09,'#9FE6F0');
    return;
  }
  const type = c.type;
  if (type === 'belt' || type === 'gate') {
    // Half a segment towards the exit, one from each fed side: turns and junctions read as one line.
    const sides = [c.dir, ...(inputs.length ? inputs : [(c.dir + 2) % 4])];
    const paint = ['#263E46','#6B4A22','#553372'][(type === 'belt' ? rankOf(c) : 1) - 1];
    rect(g,-.22,-.22,.44,.44,paint);
    for (const side of sides) rect(g,[-.22,.22,-.22,-.5][side],[-.5,-.22,.22,-.22][side],side % 2 ? .28 : .44,side % 2 ? .44 : .28,paint);
    if (type === 'gate') lamp(g,c); else arrow(g,c.dir,.12,'#5E828C');
    return;
  }
  if (type === 'bridge') {
    rect(g,-.22,-.5,.44,1,'#263E46','#4A6A73'); rect(g,-.5,-.22,1,.44,'#35505A','#6A8D94');
    return;
  }
  g.scale(.86,.86);
  rect(g,-.42,-.32,.84,.8,'#04080A');
  rect(g,-.42,-.44,.84,.82, type === 'wall' ? '#565247' : '#203C42', type === 'wall' ? '#8C8068' : '#55D6E8');
  if (type === 'mine') {
    circle(g,0,0,.27,'#0B1417','#4A6A73');
    glyph(g,matterUnder(c) || 'S',0,0,.16);
    for (let i = 1; i < rankOf(c); i++) circle(g,0,0,.26 + i * .07,null,i > 1 ? '#C77DFF' : '#F0A03C',.05);
  } else if (type === 'ligase') {
    for (let port = 0; port < 3; port++) {
      const side = portSide(c,port), x = DX[side]*.35, y = DY[side]*.35, has = c.ports[port].length;
      circle(g,x,y,.13, has > 1 ? '#8E3048' : '#0B1417', has ? '#FF8FA2' : '#8B989C');
      const base = c.ports[port][0] || c.last[port];
      if (base) { g.globalAlpha = has ? 1 : .35; glyph(g,base,x,y,.1); g.globalAlpha = 1; }
    }
  } else if (type === 'turret') {
    const angle = c.aim ?? -Math.PI / 2, full = Object.values(c.ammo).some(n => n);
    g.strokeStyle = '#A9C2C8'; g.lineWidth = .16; g.lineCap = 'round';
    g.beginPath(); g.moveTo(0,0); g.lineTo(Math.cos(angle)*.5,Math.sin(angle)*.5); g.stroke();
    circle(g,0,0,.21,full ? '#55D6E8' : '#8B989C');
  } else if (type === 'sting') {
    const a = c.aim ?? -Math.PI / 2, full = Object.values(c.ammo).some(n => n), dx = Math.cos(a), dy = Math.sin(a);
    g.strokeStyle = '#A9C2C8'; g.lineWidth = .085; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-dx * .2,-dy * .2); g.lineTo(dx * .74,dy * .74); g.stroke();
    for (const k of [.22,.4,.58]) circle(g,dx * k,dy * k,.075,null,full ? '#B7F34A' : '#8B989C',.04);
    polygon(g,[0,2.5,Math.PI,-2.5].map((turn,i) => [Math.cos(a + turn) * (i % 2 ? .2 : .16),Math.sin(a + turn) * (i % 2 ? .2 : .16)]),full ? '#55D6E8' : '#8B989C');
  } else if (type === 'maw') {
    const a = c.aim ?? -Math.PI / 2, full = Object.values(c.ammo).some(n => n), dx = Math.cos(a), dy = Math.sin(a);
    circle(g,0,0,.3,'#7A2638','#FF8FA2',.05);
    g.lineCap = 'round';
    for (const s of [-1,1]) {
      g.strokeStyle = '#D8CDB6'; g.lineWidth = .17;
      g.beginPath(); g.moveTo(-dy * s * .17,dx * s * .17); g.lineTo(dx * .4 - dy * s * .17,dy * .4 + dx * s * .17); g.stroke();
      circle(g,dx * .42 - dy * s * .17,dy * .42 + dx * s * .17,.07,full ? '#F0A03C' : '#091013');
    }
  } else if (type === 'cyst') {
    const fill = c.stock.length / capOf(c);
    circle(g,0,0,.18 + fill*.22,fill > .95 ? '#FF4D5E' : '#7A2638','#FF8FA2');
    for (let i = 1; i < rankOf(c); i++) circle(g,0,0,.3 + i * .06,null,i > 1 ? '#C77DFF' : '#F0A03C',.045);
  } else if (type === 'borer') {
    // Drawn at half scale and stretched over its four cells.
    for (const [a,b] of [[-.2,-.2],[.2,-.2],[-.2,.2],[.2,.2]]) circle(g,a,b,.12,'#0B1417','#4A6A73',.03);
    circle(g,0,0,.17,'#142126','#55D6E8',.035);
    glyph(g,matterUnder(c) || 'S',0,0,.11);
    for (let i = 1; i < rankOf(c); i++) circle(g,0,0,.25 + i * .07,null,i > 1 ? '#C77DFF' : '#F0A03C',.035);
  } else if (type === 'vault') {
    const fill = c.stock.length / capOf(c);
    [[-.19,-.19],[.19,-.19],[-.19,.19],[.19,.19]].forEach(([a,b],i) => {
      circle(g,a,b,.11 + Math.max(0,Math.min(1,fill * 4 - i)) * .09,fill > .95 ? '#FF4D5E' : '#7A2638','#FF8FA2',.03);
    });
    for (let i = 1; i < rankOf(c); i++) circle(g,0,0,.05 + i * .06,null,i > 1 ? '#C77DFF' : '#F0A03C',.03);
  } else if (type === 'split' || type === 'split2') {
    if (type === 'split') circle(g,0,0,.12,'#6A8D94');
    else {
      // A T, closed straight ahead.
      const fx = DX[c.dir], fy = DY[c.dir];
      g.strokeStyle = '#6A8D94'; g.lineWidth = .1; g.lineCap = 'round';
      g.beginPath(); g.moveTo(fy*.2,-fx*.2); g.lineTo(-fy*.2,fx*.2); g.moveTo(0,0); g.lineTo(-fx*.22,-fy*.22); g.stroke();
    }
  } else if (type === 'sort') {
    if (c.x != null && listens(c)) { reading(g,c,heardOf(c)); return; }
    [...c.want].forEach((b,i) => {
      const n = c.want.length, x = n === 1 ? 0 : (i-(n-1)/2)*.66/n, size = n === 1 ? .17 : n === 3 ? .11 : .065;
      if (b === '?') circle(g,x,0,size,null,'#A3B8B3'); else glyph(g,b,x,0,size);
    });
  } else if (type === 'pump') {
    circle(g,0,0,.36,'#55202E','#FF8FA2',.07);
    circle(g,0,0,.15 + Math.min(1,c.stock.length / VEIN.cap) * .17,'#C85A72');
    const kind = c.stock[0] || c.packets[0]?.item;
    if (kind) sequence(g,kind,0,0,.64,.17);
  } else if (type === 'pocket') {
    circle(g,0,0,.32,'#17301D','#C9F77A',.06);
    circle(g,0,0,.08 + Math.min(1,c.stock.length / pocketCap(c)) * .2,'#4E7F2D');
    const kind = c.stock[0];
    if (kind) sequence(g,kind,0,0,.64,.16);
  } else if (type === 'desk') {
    rect(g,-.4,-.32,.8,.64,'#0B1417','#F0A03C');
    const mode = c?.mode || 'most';
    for (let i = 0; i < 4; i++) circle(g,-.24 + i * .16,.16,.05,DESK.modes[i] === mode ? '#F0A03C' : '#3A2A14');
    if (mode === 'hand' && c.gene) sequence(g, c.gene, 0, -.08, .5, .09);
    else rect(g,-.2,-.12,.4,.08,'#F0A03C');
  } else if (type === 'screen') {
    rect(g,-.42,-.3,.84,.6,'#05090B','#55D6E8');
    const gene = heardOf(c)?.focus || '';
    if (gene) sequence(g, gene, 0, 0, .7, .14);
    else rect(g,-.16,-.03,.32,.06,'#55D6E8');
  } else if (type === 'glue') {
    if (c.stock?.length && built(c)) { g.globalAlpha *= .3; rect(g,-1.5,-1.5,3,3,'#7FBF3A'); g.globalAlpha /= .3; }
    rect(g,-.46,-.46,.92,.92,'#20291A','#8FA9A6');
    const left = c.stock?.length || 0;
    rect(g,-.4,-.4,.8,.8,left ? '#7FBF3A' : '#3A4A2A');
    for (let i = 0; i < 5 && left; i++) circle(g,Math.sin(i * 2.7) * .25,Math.cos(i * 1.9) * .25,.04 + (motionTime() * .7 + i * .37) % 1 * .04,'#C9F28A');
  } else if (type === 'mist') {
    circle(g,0,0,.36,'#0B1417','#3FC6DC',.05);
    circle(g,0,0,.2,'#36AFC6','#B8F3FA',.04);
    const k = c.puffAt != null ? Math.max(0, 1 - (G.time - c.puffAt) / .7) : 0;
    if (k) circle(g,0,0,.2 + (1 - k) * .25,null,'#B8F3FA',.04);
  } else if (type === 'harpoon') {
    const a = c.aim ?? -Math.PI / 2, dx = Math.cos(a), dy = Math.sin(a);
    rect(g,-.38,-.38,.76,.76,'#141F23','#A45CF0');
    g.lineCap = 'round'; g.strokeStyle = '#93AAB0'; g.lineWidth = .12;
    g.beginPath(); g.moveTo(-dx * .3,-dy * .3); g.lineTo(dx * .42,dy * .42); g.stroke();
    g.strokeStyle = '#A45CF0'; g.lineWidth = .06;
    g.beginPath(); g.moveTo(-dy * .32 - dx * .05,dx * .32 - dy * .05); g.lineTo(dx * .1,dy * .1); g.lineTo(dy * .32 - dx * .05,-dx * .32 - dy * .05); g.stroke();
  } else if (type === 'arm') {
    circle(g,0,0,.3,'#141F23',['#5E828C','#E08A3C','#A070E0'][rankOf(c) - 1],.05);
    const back = (c.dir + 2) % 4, a = Math.atan2(DY[back], DX[back]) - armReach(c) * Math.PI, tipX = Math.cos(a) * .36, tipY = Math.sin(a) * .36;
    g.beginPath(); g.moveTo(0,0); g.lineTo(tipX,tipY); g.strokeStyle = '#A3B8B3'; g.lineWidth = .09; g.lineCap = 'round'; g.stroke();
    circle(g,0,0,.09,'#A3B8B3');
    if (c.hold?.[0]) sequence(g, c.hold[0], tipX, tipY, .3, .08);
    arrow(g,c.dir,.1,'#5E828C');
  } else if (type === 'burn') {
    rect(g,-.4,-.4,.8,.8,'#1A0F0B','#FF6A3C');
    for (let i = -1; i <= 1; i++) rect(g,i * .2 - .03,-.28,.06,.56,'#3A2A24');
    const hot = c && c.gulp && G.time - c.gulp.t < .6 ? 1 - (G.time - c.gulp.t) / .6 : .25;
    circle(g,0,.05,.12 + hot * .1,'#FF6A3C',null);
    circle(g,0,-.02,.06 + hot * .06,'#FFD08A',null);
  } else if (type === 'unbind' || type === 'unjoin') {
    rect(g,-.4,-.4,.8,.8,'#0B1417','#B7F34A');
    const shown = c.ports?.[0]?.[0] || c.last;
    if (shown) sequence(g, shown, 0, .12, .5, .09);
    g.beginPath(); g.moveTo(-.2,-.05); g.lineTo(0,-.28); g.lineTo(.2,-.05); g.strokeStyle = '#B7F34A'; g.lineWidth = .06; g.stroke();
  } else if (type === 'reaper') {
    const flash = c?.flash && G.time - c.flash.at < .6 ? 1 - (G.time - c.flash.at) / .6 : 0;
    rect(g,-.42,-.42,.84,.84,'#0B1417','#8FA9A6');
    circle(g,0,0,.3,'#141F23',c?.beam ? '#C9F7FF' : '#55D6E8',.06);
    circle(g,0,0,.13 + flash * .08,flash ? (c.flash.ok ? '#B7F34A' : '#8A8F8C') : c?.beam ? '#C9F7FF' : '#2A5F68');
  } else if (type === 'flip') {
    rect(g,-.4,-.4,.8,.8,'#0B1417','#55D6E8');
    const turn = built(c) ? motionTime() * 2 : 0;
    g.beginPath(); g.arc(0,0,.27,turn,turn + Math.PI * 1.5); g.strokeStyle = '#55D6E8'; g.lineWidth = .06; g.stroke();
    const shown = c.item || c.ports[0][0] || c.last;
    if (shown) sequence(g, shown, 0, 0, .44, .1);
  } else if (type === 'unpack') {
    const box = boxOf(c.ports[0][0] || c.last) || 'T', side = (c.dir + 1) % 4;
    crate(g, box, 0, .04, .56, .36);
    g.beginPath(); g.moveTo(-.28, -.14); g.lineTo(.1, -.36); g.strokeStyle = '#E8738A'; g.lineWidth = .05; g.stroke();
    const inside = c.ports[1][0] || (c.last && contentOf(c.last));
    if (inside) sequence(g, inside, 0, .04, .44, .1);
    g.globalAlpha *= c.ports[2].length ? 1 : .5;
    glyph(g, 'K', DX[side] * .4, DY[side] * .4, .12);
    g.globalAlpha = built(c) ? 1 : .4;
  } else if (type === 'pack') {
    const side = carbonSide(c), color = c.box === 'A' ? '#F0A03C' : '#55D6E8', [goods, carbon] = c.ports;
    crate(g, c.box, 0, -.02, .56, .4);
    const inside = goods[0] || (c.last && contentOf(c.last));
    if (inside) sequence(g, inside, 0, -.02, .44, .1);
    for (let i = 0; i < PACK.size; i++) circle(g, (i - 2.5) * .13, .3, .045, i < goods.length ? color : '#0B1417');
    g.globalAlpha *= carbon.length ? 1 : .5;
    glyph(g, 'K', DX[side] * .4, DY[side] * .4, .12);
    g.globalAlpha = built(c) ? 1 : .4;
  } else if (type === 'join') {
    for (const port of [0,1]) {
      const side = joinSide(c,port), x = DX[side]*.28, y = DY[side]*.28, has = c.ports[port].length;
      circle(g,x,y,.17,'#0B1417',has ? '#FF8FA2' : '#8B989C');
      const gene = c.ports[port][0] || (c.last ? c.last.slice(port * 3,port * 3 + 3) : '');
      if (gene) { g.globalAlpha *= has ? 1 : .35; sequence(g,gene,x,y,.28,.06); g.globalAlpha = built(c) ? 1 : .4; }
    }
  } else if (type === 'core') circle(g,0,0,.31,'#B7F34A','#E2FFB0');
}
export function draw() {
  forgetCells();
  if (view3d) return view3d.draw();
  ctx.setTransform(1,0,0,1,0,0);
  ctx.fillStyle = '#05090B'; ctx.fillRect(0,0,canvas.width,canvas.height);
  const scale = cam.zoom * view.dpr;
  ctx.setTransform(scale,0,0,scale,canvas.width / 2 - cam.x * scale,canvas.height / 2 - cam.y * scale);
  const a = worldAt(0,0), b = worldAt(view.w,view.h);
  const x0 = Math.floor(a.x), y0 = Math.floor(a.y), x1 = Math.ceil(b.x), y1 = Math.ceil(b.y);
  rect(ctx,x0,y0,x1 - x0,y1 - y0,'#0D171A');
  for (const field of fieldsIn(x0,y0,x1,y1)) {
    const [base,x,y,w,h] = field, patch = patchOf(field), soil = {K:'#22262A',I:'#24142B',S:'#1E3A1D',F:'#35220F',C:'#2E2B25',N:'#102F37'}[base];
    ctx.beginPath();
    const seen = patch.list.filter(p => known(p.x,p.y));
    if (!seen.length) continue;
    for (const p of seen) { ctx.moveTo(p.x + 1.18,p.y + .5); ctx.arc(p.x + .5,p.y + .5,.68,0,Math.PI * 2); }
    ctx.fillStyle = soil; ctx.fill();
    // From afar one big glyph names the field.
    const rich = richAt(patch.list[0].x,patch.list[0].y);
    if (rich > 1) {
      ctx.save(); ctx.translate(patch.cx - .5,patch.top); ctx.scale(1/40,1/40);
      ctx.fillStyle = rich > richCap() ? '#8B989C' : '#B7F34A'; ctx.font = L`700 ${Math.min(90,Math.max(18,13 * 40 / cam.zoom))}px Verdana`; ctx.textBaseline = 'bottom';
      ctx.fillText(`×${rich}`,0,-3); ctx.restore();
    }
    if (cam.zoom < 14) { glyph(ctx,base,x + w / 2,y + h / 2,Math.min(w,h) * .32); continue; }
    for (const {x:i,y:j} of seen)
      if (i >= x0 - 1 && i <= x1 && j >= y0 - 1 && j <= y1 && !cellAt(i,j)) glyph(ctx,base,i + .5,j + .5,.22);
  }
  ctx.strokeStyle = '#1B2F35'; ctx.lineWidth = 1 / cam.zoom; ctx.beginPath();
  const every = cam.zoom < 11 ? 8 : 1;
  for (let x = Math.ceil(x0 / every) * every; x <= x1; x += every) { ctx.moveTo(x,y0); ctx.lineTo(x,y1); }
  for (let y = Math.ceil(y0 / every) * every; y <= y1; y += every) { ctx.moveTo(x0,y); ctx.lineTo(x1,y); }
  ctx.stroke();
  drawOrganism();
  for (const b of shownNests(x0,y0,x1,y1)) drawBreach(b);

  const cells = allCells().filter(c => c.x >= x0 - 2 && c.x <= x1 && c.y >= y0 - 2 && c.y <= y1);
  drawVeins();
  drawTracks();
  for (const w of Object.values(G.ruins)) if (!buried(w)) rect(ctx,w.x + .15,w.y + .15,sizeOf(w) - .3,sizeOf(w) - .3,'#321820','#FF6B6B');
  // Radar waves: one every 3 s from the pylon to the edge of what it sees, fading as they go.
  for (const c of allCells()) if (c.type === 'radar' && radarWave(c, motionTime() || G.time) != null) {
    const k = radarWave(c, motionTime() || G.time);
    ctx.globalAlpha = .55 * (1 - k);
    circle(ctx,c.x + .5,c.y + .5,.6 + k * RADAR.range,null,'#66D9EA',Math.max(.05,1.5 / cam.zoom));
    ctx.globalAlpha = .08;
    circle(ctx,c.x + .5,c.y + .5,2.2,'#66D9EA');
    ctx.globalAlpha = 1;
  }
  for (const c of cells) {
    const size = sizeOf(c);
    ctx.save(); ctx.translate(c.x + size / 2,c.y + size / 2); ctx.scale(size,size); if (!built(c)) ctx.globalAlpha = .4; drawCell(ctx,c,isBelt(c) ? feeders(c).map(f => (f.dir + 2) % 4) : []);
    if (hasTrait(c.type, 'ring')) for (let i = 1; i < rankOf(c); i++) circle(ctx,0,0,.36 + i * .06,null,i > 1 ? '#C77DFF' : '#F0A03C',.04);
    ctx.restore();
  }
  for (const c of cells) {
    const x = c.x+.5, y = c.y+.5;
    const detail = cam.zoom >= 11;
    if (detail && (isBelt(c) || isSplit(c) || c.type === 'sort') && c.item) {
      const at = along(c,c.from,exitOf(c),c.t);
      token(ctx,c.item,at.x,at.y,at.angle);
    }
    if (detail && c.type === 'bridge') for (const l of c.lanes) if (l) {
      const at = along(c,l.dir,l.dir,l.t);
      token(ctx,l.item,at.x,at.y,at.angle);
    }
    const base = depositAt(c.x,c.y);
    if (base && c.type !== 'mine' && c.type !== 'borer') { rect(ctx,c.x,c.y + .7,.32,.3,'#05090B'); glyph(ctx,base,c.x + .16,c.y + .85,.12); }
    if (isGun(c) && !Object.values(c.ammo).some(n => n)) circle(ctx,x,y,.48,null,'#FF6B6B',.07);
  }
  if (cam.zoom >= 11) for (const c of cells) for (const p of passing(c)) {
    // Swallowed: a lump that goes through.
    circle(ctx,p.x,p.y,.2 + Math.sin(p.done * Math.PI) * .1,'#A8485C99','#FF8FA2',.04);
    token(ctx,p.item,p.x,p.y,0);
  }
  for (const c of cells) {
    if (c.type !== 'gate') continue;
    ctx.save(); ctx.translate(c.x + .5,c.y + .5); lamp(ctx,c); ctx.restore();
  }
  for (const c of [...cells, ...Object.values(G.ruins).filter(w => w.out != null)]) {
    if (built(c) && c.out == null) continue;
    const color = c.out != null ? '#FF6B6B' : '#55D6E8';
    const size = sizeOf(c);
    ctx.setLineDash([.14,.1]); rect(ctx,c.x + .06,c.y + .06,size - .12,size - .12,null,color); ctx.setLineDash([]);
  }
  drawNerves();
  drawWorms();
  for (const s of G.shots) {
    if (s.gun === 'mist') {
      const k = 1 - Math.max(0, s.until - G.time) / .7;
      ctx.globalAlpha = .5 * (1 - k); ctx.beginPath(); ctx.arc(s.x, s.y, s.reach * Math.min(1, k * 1.6), 0, Math.PI * 2);
      ctx.fillStyle = '#66D9EA'; ctx.fill(); ctx.globalAlpha = 1;
      continue;
    }
    ctx.strokeStyle = {1:'#8B989C',2:'#FFD0D0',5:'#F0A03C',12:'#B7F34A'}[s.hurt]; ctx.lineWidth = (s.hurt === 12 ? .13 : .06) * (s.gun === 'sting' ? 1.6 : s.gun === 'harpoon' ? 2.4 : 1);
    const a = Math.atan2(s.ty - s.y,s.tx - s.x), off = (s.barrel || 0) * .17;
    const out = s.gun === 'sting' ? .66 : s.gun === 'maw' ? .38 : .3;
    ctx.beginPath(); ctx.moveTo(s.x + Math.cos(a) * out - Math.sin(a) * off,s.y + Math.sin(a) * out + Math.cos(a) * off); ctx.lineTo(s.tx,s.ty); ctx.stroke();
  }
  // Bodies lie a while, dark and flat, then sink.
  if (G.corpses) {
    G.corpses = G.corpses.filter(d => corpseSunk(d) < 1);
    for (const d of G.corpses) if (inSight(d.x, d.y)) {
      ctx.globalAlpha = .8 * (1 - corpseSunk(d));
      ctx.beginPath(); ctx.ellipse(d.x, d.y, .42, .24, d.a, 0, Math.PI * 2); ctx.fillStyle = '#21100F'; ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
  // A recycler's beam: the body glides in along it, shrinking, while a bright line sweeps it.
  for (const c of allCells()) if (c.type === 'reaper' && c.beam) {
    const k = Math.min(1, (G.time - c.beam.at) / REAPER.time), cx = c.x + .5, cy = c.y + .5;
    const bx = c.beam.x + (cx - c.beam.x) * k, by = c.beam.y + (cy - c.beam.y) * k, a = Math.atan2(by - cy, bx - cx), w = .32 * (1 - k * .6);
    ctx.globalAlpha = .35; ctx.fillStyle = '#55D6E8';
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(bx - Math.sin(a) * w, by + Math.cos(a) * w); ctx.lineTo(bx + Math.sin(a) * w, by - Math.cos(a) * w); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = .9;
    ctx.beginPath(); ctx.ellipse(bx, by, .42 * (1 - k * .7), .24 * (1 - k * .7), c.beam.a || 0, 0, Math.PI * 2); ctx.fillStyle = '#21100F'; ctx.fill();
    const sweep = Math.sin(motionTime() * 12) * .3 * (1 - k * .7);
    ctx.beginPath(); ctx.moveTo(bx - Math.sin(a) * sweep - Math.cos(a) * .3, by + Math.cos(a) * sweep - Math.sin(a) * .3); ctx.lineTo(bx - Math.sin(a) * sweep + Math.cos(a) * .3, by + Math.cos(a) * sweep + Math.sin(a) * .3);
    ctx.strokeStyle = '#C9F7FF'; ctx.lineWidth = .05; ctx.stroke();
    ctx.globalAlpha = 1;
  }
  const packs = [];
  for (const e of G.enemies.map(creatureAt)) {
    if (!inSight(e.x,e.y)) continue;
    const pack = packs.find(p => p.e.gene === e.gene && Math.abs(p.e.x - e.x) < .8 && Math.abs(p.e.y - e.y) < .6);
    if (pack) pack.n++; else packs.push({e, n:1});
  }
  for (const {e, n} of packs) {
    if (e.z) { ctx.save(); ctx.translate(0, -e.z); }
    if (n > 1) {
      ctx.save(); ctx.translate(e.x + .5,e.y - .34); ctx.scale(1/40,1/40);
      ctx.fillStyle = '#FFD0D0'; ctx.font = '700 14px Verdana'; ctx.fillText('×' + n,0,0); ctx.restore();
    }
    ctx.strokeStyle = '#B34A5A'; ctx.lineWidth = .06; ctx.beginPath();
    for (const dx of [-.16,0,.16]) { ctx.moveTo(e.x+dx,e.y-.24); ctx.lineTo(e.x+dx,e.y+.32); }
    ctx.stroke();
    const body = e.kind === 'swarm' ? .35 : e.kind === 'titan' ? 2.4 : 1;
    ctx.beginPath(); ctx.ellipse(e.x,e.y,.36 * body * (1 + flinchOf(e) * .18),.2 * body * (1 + flinchOf(e) * .18),0,0,Math.PI*2); ctx.fillStyle = flinchOf(e) > .3 ? '#C24A5A' : '#3A1820'; ctx.fill();
    ctx.strokeStyle = '#FF6B6B'; ctx.stroke();
    [...e.gene].forEach((b,i) => glyph(ctx,b,e.x+(i-1)*.22,e.y,.1));
    rect(ctx,e.x-.3,e.y-.38,.6*Math.max(0,e.hp/e.max),.07,'#FF6B6B');
    if (e.z) ctx.restore();
  }
  drawFog(ctx);
  drawDrones();
  sceneSigns(ctx);
  drawPreview(ctx);
  // What is off screen keeps an arrow on the edge.
  ctx.setTransform(view.dpr,0,0,view.dpr,0,0);
  for (const e of G.enemies) if (inSight(e.x,e.y)) marker(e.x,e.y,'#FF6B6B');
  for (const b of G.breaches) if (b.state === 'wake' && known(b.x,b.y)) marker(b.x + .5,b.y + .5,'#F0A03C');
  marker(CORE.x + .5,CORE.y + .5,'#B7F34A');
}
export function drawDrones() {
  const t = G.time + owed, s = Math.max(1, Math.min(1.8, 17 / cam.zoom));
  for (const d of G.drones) {
    const {x, y, w, a, goal, undo} = dronePose(d);
    if (goal && w < .5) {
      ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(goal.x,goal.y);
      ctx.strokeStyle = '#55D6E8AA'; ctx.lineWidth = 1 / cam.zoom; ctx.setLineDash([.3,.3]); ctx.lineDashOffset = -motionTime() % .6; ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset = 0;
    }
    if (goal && w >= .5) for (let i = 0; i < 3; i++) {
      const tx = goal.x + Math.sin(t * 7 + i * 2.1) * .36, ty = goal.y + Math.cos(t * 5 + i * 2.1) * .36;
      ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(tx,ty); ctx.strokeStyle = undo ? '#FF6B6BAA' : '#D5FAFF99'; ctx.lineWidth = .035; ctx.stroke();
      circle(ctx,tx,ty,.06,!i ? '#F0A03C' : undo ? '#FF6B6B' : '#B7F34A');
    }
    ctx.save(); ctx.translate(x,y); ctx.rotate(a); ctx.scale(s,s);
    for (const [ax,ay] of [[.17,.21],[.17,-.21],[-.17,.21],[-.17,-.21]]) {
      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(ax,ay); ctx.strokeStyle = '#8B989C'; ctx.lineWidth = .05; ctx.stroke();
      circle(ctx,ax,ay,.12,'#8FE3EF44','#55D6E8',.025);
    }
    ctx.beginPath(); ctx.ellipse(0,0,.22,.13,0,0,Math.PI * 2); ctx.fillStyle = '#3A5A2B'; ctx.fill();
    ctx.strokeStyle = '#B7F34A'; ctx.lineWidth = .04; ctx.stroke();
    circle(ctx,.17,0,.07,'#D5FAFF');
    ctx.restore();
  }
}
export function drawVeins() {
  const stroke = (a,b,color,width,dash = []) => {
    ctx.beginPath(); ctx.moveTo(a.x + .5,a.y + .5); ctx.lineTo(b.x + .5,b.y + .5);
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.setLineDash(dash); ctx.stroke(); ctx.setLineDash([]);
  };
  for (const c of pumps()) {
    const to = c.to && G.cells[c.to];
    if (!to) continue;
    const broken = c.veinHp <= 0, leak = leaking(c);
    stroke(c,to,broken ? '#FF4D5E' : '#55202E',.7,broken ? [.5,.4] : []);
    if (c.veinOut != null) stroke(c,to,'#FF6B6B',.12,[.3,.3]);
    if (c.veinCut) continue;
    if (c.veinLeft > 0) { stroke(c,to,'#55D6E8',.12,[.3,.3]); continue; }
    if (!broken) stroke(c,to,leak ? '#FF4D5E' : '#A8485C',.16);
    for (const p of c.packets) {
      const k = Math.min(1,p.t), x = c.x + .5 + (to.x - c.x) * k, y = c.y + .5 + (to.y - c.y) * k;
      circle(ctx,x,y,.2 + Math.min(8,p.n) * .022,'#C85A72','#FF8FA2');
      glyph(ctx,contentOf(p.item)[0],x,y,.16);
    }
    if (leak) for (let i = 0; i < 6; i++) {
      const p = (G.time + i / 6) % 1;
      circle(ctx,(c.x + to.x + 1) / 2 + Math.cos(i * 2.4) * p,(c.y + to.y + 1) / 2 + Math.sin(i * 2.4) * p,.14 * (1 - p),'#FF4D5E');
    }
  }
  if (drag?.vein && gesture?.mode === 'draw') {
    const far = Math.hypot(drag.aim.x - drag.vein.x,drag.aim.y - drag.vein.y) > VEIN.reach;
    stroke(drag.vein,drag.aim,far ? '#FF4D5E' : '#FF8FA2',.3,[.4,.3]);
  }
  const from = linking && G.cells[linking];
  if (from) circle(ctx,from.x + .5,from.y + .5,VEIN.reach,null,'#FF8FA2',2 / cam.zoom);
}
export function drawBreach(b) {
  const x = b.x + .5, y = b.y + .5, fade = b.state === 'spent' ? 1 - (G.time - b.ended) / 8 : 1;
  if (fade <= 0) return;
  const asleep = b.state === 'sleep';
  ctx.globalAlpha = fade;
  circle(ctx,x,y,3.5,asleep ? '#171A1B' : '#241016');
  // Hit, it flashes red for a moment.
  const hurt = nestHurt(b);
  if (hurt > 0) { ctx.globalAlpha = fade * hurt * .55; circle(ctx,x,y,2.6 + (1 - hurt) * .8,'#FF6B6B'); ctx.globalAlpha = fade; }
  // The circle is the limit to build up to without waking it.
  if (asleep) { ctx.setLineDash([.6,.6]); circle(ctx,x,y,b.r + Math.sin(motionTime() * 1.1) * .08,null,'#6B5960',Math.max(.06,1 / cam.zoom)); ctx.setLineDash([]); }
  if (!asleep && b.max) {
    circle(ctx,x,y,3.75,null,'#3A1820',.16);
    ctx.beginPath(); ctx.arc(x,y,3.75,-Math.PI / 2,-Math.PI / 2 + Math.PI * 2 * Math.max(0, b.hp / b.max));
    ctx.strokeStyle = b.hp < b.max && G.time - (b.hitAt ?? -99) >= NEST.quiet ? '#B7F34A' : '#FF6B6B'; ctx.lineWidth = .16; ctx.stroke();
  }
  const full = b.left / b.total, beat = asleep ? 0 : Math.sin(G.time * 5) * .1;
  const form = formOf(b), size = (.7 + full * .6 + beat) * (1 + (b.tier || 0) * .12);
  const body = asleep ? '#2A2527' : '#3A1820', edge = asleep ? '#8B989C' : '#FF6B6B';
  if (form === 1) polygon(ctx,Array.from({length:6},(_,i) => [x + Math.cos(i * Math.PI / 3) * size,y + Math.sin(i * Math.PI / 3) * size]),body,edge,.12);
  else if (form === 2) polygon(ctx,[[-1.7,-.2],[-.5,-.75],[.4,-.4],[1.7,-.35],[.7,.5],[-.3,.35],[-1.1,.7]].map(([a,c]) => [x + a * size,y + c * size]),body,edge,.12);
  else if (form === 3) for (let i = 0; i < 5; i++) circle(ctx,x + Math.cos(i * 1.257) * size * .75,y + Math.sin(i * 1.257) * size * .75,size * (.4 + (i % 3) * .08),body,edge,.1);
  else circle(ctx,x,y,size,body,edge,.12);
  // One spine a level above the first.
  for (let i = 0; i < (b.tier || 0) * 3; i++) {
    const a = i * Math.PI * 2 / ((b.tier || 0) * 3);
    polygon(ctx,[[x + Math.cos(a) * 3,y + Math.sin(a) * 3],[x + Math.cos(a + .09) * 2.4,y + Math.sin(a + .09) * 2.4],[x + Math.cos(a - .09) * 2.4,y + Math.sin(a - .09) * 2.4]],edge);
  }
  if (cam.zoom >= 8) {
    b.genes.forEach((gene,row) => [...gene].forEach((base,i) => glyph(ctx,base,x + (i - 1) * .65,y + 2 + row * .65,.24)));
    ctx.save(); ctx.translate(x,y); ctx.scale(1/40,1/40);
    ctx.fillStyle = asleep ? '#A3B8B3' : '#FFD0D0'; ctx.font = '700 28px Verdana'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(b.left,0,0); ctx.restore();
  }
  ctx.globalAlpha = 1;
}
export function drawTracks() {
  const s = trackSize();
  for (const c of Object.values(G.tracks)) {
    const x = c.x + s / 2, y = c.y + s / 2, color = c.out != null ? '#FF6B6B' : built(c) ? '#B7F34A' : '#55D6E8';
    ctx.globalAlpha = built(c) ? .8 : .4;
    if (s > 1) { ctx.strokeStyle = color; ctx.lineWidth = .1; for (const o of [-.9, .9]) { ctx.beginPath(); ctx.moveTo(x - DX[c.dir] - DY[c.dir] * o,y - DY[c.dir] + DX[c.dir] * o); ctx.lineTo(x + DX[c.dir] - DY[c.dir] * o,y + DY[c.dir] + DX[c.dir] * o); ctx.stroke(); } }
    for (const k of [0,.33,.66]) circle(ctx,x + DX[c.dir] * k * s,y + DY[c.dir] * k * s,(k ? .07 : .11) * s,color);
    if (cam.zoom >= 14 && (c.x + c.y) % 3 === 0) { ctx.save(); ctx.translate(x,y); arrow(ctx,c.dir,.36,color); ctx.restore(); }
  }
  ctx.globalAlpha = 1;
}
export function drawWorms() {
  const centre = tileCentre, s = trackSize();
  for (const w of G.worms) {
    const moving = built(w) && !w.docked && !w.stuck, k = moving ? Math.min(1,w.t + owed * WORM.speed) : 0;
    const next = moving && trackAfter(w.path[0]);
    if (!built(w)) ctx.globalAlpha = .45;
    if (w.out != null) { const [x,y] = centre(w.path[0]); circle(ctx,x,y,.62,null,'#FF6B6B',.06); }
    for (let i = w.path.length - 1; i >= 0; i--) {
      let [x,y] = centre(w.path[i]);
      const to = i ? w.path[i - 1] : next && key(next.x,next.y);
      if (moving && to) { const [tx,ty] = centre(to); x += (tx - x) * k; y += (ty - y) * k; }
      const hold = w.holds[i - 1];
      circle(ctx,x,y,(hold ? .5 : .38) * s,hold ? '#2A4A22' : '#4E7F2D','#C9F77A',.07);
      if (!i) { circle(ctx,x - .12,y,.07,'#D5FAFF'); circle(ctx,x + .12,y,.07,'#D5FAFF'); }
      if (hold?.n) {
        circle(ctx,x,y,(.14 + hold.n / holdCap() * .26) * s,'#17301D');
        sequence(ctx,hold.kind,x,y,.76,.2);
      }
      if (w.id === wormId) circle(ctx,x,y,.58,null,'#B7F34A',.05);
    }
    ctx.globalAlpha = 1;
    if (w.hp < WORM.hp - .5) {
      const [x,y] = centre(w.path[0]);
      rect(ctx,x - .4,y - .65,.8 * Math.max(0,w.hp / WORM.hp),.09,healing({...w,type:'worm'}) ? '#62E06A' : '#FF6B6B');
    }
  }
}
export function drawOrganism() {
  const x = CORE.x + .5, y = CORE.y + .5, part = stagePart() ?? 0;
  const born = Math.min(1,(G.time - (G.grownAt ?? -99)) / 3), size = G.stage + part - (1 - born);
  const reach = .9 + Math.max(0,size) * 1.6, arms = 5 + G.stage * 3;
  ctx.lineCap = 'round';
  for (let i = 0; i < arms; i++) {
    const a = i * 2.39996, far = reach * (.8 + (i % 4) * .13), bend = a + Math.sin(G.time * .8 + i) * .22;
    ctx.beginPath(); ctx.moveTo(x,y);
    ctx.quadraticCurveTo(x + Math.cos(bend) * far * .6,y + Math.sin(bend) * far * .6,x + Math.cos(a) * far,y + Math.sin(a) * far);
    ctx.strokeStyle = '#2F5A25'; ctx.lineWidth = .1 + G.stage * .05; ctx.stroke();
    if (G.stage) circle(ctx,x + Math.cos(a) * far,y + Math.sin(a) * far,.08 + G.stage * .06,['#5E9E2B','#A8485C','#2E7F91'][i % G.stage % 3]);
  }
  circle(ctx,x,y,.5 + G.stage * .22 + Math.sin(G.time * 2.5) * .05,'#203C1E','#6DAA38',.07);
  if (part > 0) {
    ctx.beginPath(); ctx.arc(x,y,.75 + G.stage * .22,-Math.PI / 2,-Math.PI / 2 + part * Math.PI * 2);
    ctx.strokeStyle = '#B7F34A'; ctx.lineWidth = .12; ctx.stroke();
  }
}
export function drawNerves() {
  const cable = (a,b,color,dash) => {
    ctx.beginPath(); ctx.moveTo(a.x + .5,a.y + .5); ctx.lineTo(b.x + .5,b.y + .5);
    ctx.strokeStyle = color; ctx.lineWidth = Math.max(.07,1.2 / cam.zoom); ctx.setLineDash(dash); ctx.stroke(); ctx.setLineDash([]);
  };
  for (const w of G.wires) {
    const a = G.cells[w.a], b = G.cells[w.b];
    if (!a || !b) continue;
    const live = carries(w), cut = !w.hp;
    cable(a,b,cut || w.out != null ? '#FF4D5E' : live ? NERVE_COLORS[w.color || 0].hex : '#55D6E8',live ? [] : [.25,.25]);
  }
  const heard = selected && G.cells[selected];
  const ear = heard && (G.cells[heard.source] || (heard.type === 'gate' && G.cells[heard.watch]));
  if (ear && ear !== heard) cable(heard, ear, '#F0A03C', [.15,.15]);
  if (drag?.nerve && gesture?.mode === 'draw') cable(drag.nerve,drag.aim,Math.hypot(drag.aim.x - drag.nerve.x,drag.aim.y - drag.nerve.y) > NERVE.reach ? '#FF4D5E' : '#55D6E8',[.4,.3]);
  const from = wiring && G.cells[wiring];
  if (from) circle(ctx,from.x + .5,from.y + .5,NERVE.reach,null,'#55D6E8',2 / cam.zoom);
}
export function marker(x,y,color) {
  const cx = view.w / 2, cy = view.h / 2, dx = (x - cam.x) * cam.zoom, dy = (y - cam.y) * cam.zoom * flat();
  if (Math.abs(dx) <= cx && Math.abs(dy) <= cy) return;
  const s = ui.safe, roomX = dx < 0 ? cx - 20 : cx - s.right, roomY = dy < 0 ? cy - s.top : cy - s.bottom;
  const k = Math.min(Math.max(20,roomX) / Math.abs(dx || 1e-6),Math.max(20,roomY) / Math.abs(dy || 1e-6));
  const px = cx + dx * k, py = cy + dy * k, a = Math.atan2(dy,dx);
  if (!STILL.matches) { const wave = motionTime() * .8 % 1; circle(ctx,px,py,8 + wave * 12,null,color + Math.round((1 - wave) * 160).toString(16).padStart(2,'0'),1.5); }
  polygon(ctx,[0,2.4,-2.4].map((turn,i) => [px + Math.cos(a + turn) * (i ? 8 : 10),py + Math.sin(a + turn) * (i ? 8 : 10)]),color);
}

// The bindings other modules replace.
export const renderSet = {
  // @ts-expect-error: a function rebound in place, as a test's stub or the timing probes do
  draw: (v) => (draw = v)
};
