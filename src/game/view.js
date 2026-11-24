// 2D or 3D: Babylon is only fetched when the 3D view is first asked for.
import { BIG, G, OX, OY, PACK, PRICE, SIGHT, START_DNA, TYPES, cell, cellAt, coreIn, fogTick, fresh, hasTrait, hatchDrones, hungry, key, lightUp, look, nest, newSeed, simSet, survey } from "../sim/sim.ts";
import { L } from "../sim/text.ts";
import { rankFollowers, setHeading, spreadOut, thinNests } from "./actions.js";
import { playSound } from "./audio.js";
import { forgetEvents, layoutHud, paintRanks, replay, showMenu, showModel, showStats, tell, toggleFamily } from "./hud.js";
import { choose, preview, refresh, say, select, showActions, turnWay, write } from "./input.js";
import { $, BABYLON_HASH, BABYLON_SRC, FAMILIES, KEYS, NEEDS, OLD_SAVE, SAVE, VIEW_KEY, WAYS, armed, chain, handRank, heading, held, hovered, keyName, made3d, mainSet, modalOpen, orbit, paused, repaid, restartText, selected, slotKey, switching, tabbed, tool, ui, view3d, wormId } from "./main.js";
import { arrow, circle, drawCell, home, polygon, rect } from "./render.js";
import { save } from "./saves.js";

export function script(src, integrity) {
  return new Promise((resolve, reject) => {
    const tag = document.createElement('script');
    tag.src = src;
    if (integrity) { tag.integrity = integrity; tag.crossOrigin = 'anonymous'; }
    tag.onload = resolve;
    tag.onerror = () => { tag.remove(); reject(new Error(src)); };
    document.head.append(tag);
  });
}
export async function show3D(on) {
  if (switching) return;
  mainSet.switching(true);
  const toggle = $('dimension');
  try {
    if (on && !made3d) {
      showMenu(false); $('loading').hidden = false;
      if (!window.BABYLON) await script(BABYLON_SRC, BABYLON_HASH);
      if (!window.createModels3D) await script('models3d.js');
      if (!window.createTerrain3D) await script('terrain3d.js');
      if (!window.createView3D) await script('view3d.js');
      // Built while visible, or the engine would start on an empty canvas.
      $('gl').hidden = false;
      mainSet.made3d(window.createView3D($('gl')));
    }
    mainSet.view3d(on ? made3d : null);
    $('gl').hidden = !on;
    try { localStorage.setItem(VIEW_KEY, on ? '3d' : '2d'); } catch (_) {}
  } catch (error) {
    mainSet.view3d(null); $('gl').hidden = true;
    tell(L('Vue 3D indisponible : il faut le réseau au premier chargement et WebGL. Le jeu continue en 2D.'));
    console.warn('3D view unavailable:', error.message);
  }
  toggle.setAttribute('aria-pressed', Boolean(view3d));
  markView(Boolean(view3d));
  $('loading').hidden = true;
  showMenu(false);
  replay($('board'), 'switched');
  mainSet.switching(false);
}
export function chooseView(three) {
  if (!orbit.on) return show3D(three);
  // On the planet it is only noted: the engine loads with the game.
  if (!three) mainSet.view3d(null);
  $('gl').hidden = !view3d;
  try { localStorage.setItem(VIEW_KEY, three ? '3d' : '2d'); } catch (_) {}
  markView(three);
}
// The switch beside the zoom names the view it leads to.
export function markView(three) {
  for (const [id, on] of [['dimension', three], ['flat', !three]]) $(id).setAttribute('aria-pressed', on);
  $('view-toggle').textContent = three ? '2D' : '3D';
  $('view-toggle').setAttribute('aria-label', three ? L('Passer en 2D') : L('Passer en 3D'));
}
export function podOf(name) {
  const b = document.createElement('button'), hole = document.createElement('span'), words = document.createElement('span');
  b.className = 'pod'; hole.className = 'porthole'; hole.setAttribute('aria-hidden', 'true');
  words.className = 'name'; words.textContent = name;
  b.append(hole, words);
  return b;
}
export function toolPod(type) {
  const info = TYPES[type], b = podOf(info.name), hole = b.querySelector('.porthole');
  const icon = document.createElement('canvas'), g = icon.getContext('2d');
  // The drawn icon is the one the pointer carries.
  icon.width = icon.height = 52; b.dataset.type = type;
  g.setTransform(46,0,0,46,26,26);
  if (type === 'hand') { circle(g,-.08,-.08,.25,null,'#A3B8B3',.09); polygon(g,[[.08,.14],[.15,.08],[.42,.34],[.34,.42]],'#A3B8B3'); }
  else if (type === 'erase') { g.strokeStyle='#FF6B6B'; g.lineWidth=.12; g.beginPath(); g.moveTo(-.3,-.3); g.lineTo(.3,.3); g.moveTo(.3,-.3); g.lineTo(-.3,.3); g.stroke(); }
  else if (type === 'bridge') { rect(g,-.22,-.5,.44,1,'#263E46','#4A6A73'); rect(g,-.5,-.22,1,.44,'#35505A','#6A8D94'); arrow(g,0,.49); arrow(g,1,.49); }
  else if (type === 'wire') { polygon(g,[[-.32,.22],[-.08,-.12],[.12,.08],[.34,-.26]],null,'#55D6E8',.07); circle(g,-.32,.22,.11,'#55D6E8'); circle(g,.34,-.26,.11,'#55D6E8'); }
  else if (type === 'track') { for (const x of [-.35,-.12,.11]) circle(g,x,0,.07,'#B7F34A'); arrow(g,1,.46,'#B7F34A'); }
  else if (type === 'worm') { for (const x of [-.3,-.06,.18]) circle(g,x,0,.2,'#2A4A22','#C9F77A',.05); circle(g,.34,0,.13,'#4E7F2D','#C9F77A',.05); }
  else drawCell(g,{...cell(type,1,11,type === 'belt' ? 1 : 0)});
  b.append(icon);
  if (type === 'hand') hole.innerHTML = '<svg width="30" height="30" viewBox="0 0 30 30"><circle cx="12" cy="12" r="8" fill="none" stroke="#E9F3EF" stroke-width="2.5"/><path d="M18 18l8 8" stroke="#E9F3EF" stroke-width="3"/></svg>';
  else if (type === 'erase') hole.innerHTML = '<svg width="28" height="28" viewBox="0 0 28 28"><path d="M5 5l18 18M23 5L5 23" stroke="#FF6B74" stroke-width="3.5" stroke-linecap="round"/></svg>';
  else { hole.classList.add('model'); showModel(hole, type); }
  if (BIG[type]) { const tag = document.createElement('span'); tag.className = 'size'; tag.textContent = '2×2'; b.append(tag); }
  if (NEEDS[type]) { const tag = document.createElement('span'); tag.className = 'price lock'; tag.textContent = L`stade ${NEEDS[type] + 1}`; b.append(tag); }
  if (PRICE[type]) { const tag = document.createElement('span'); tag.className = 'price'; b.append(tag); }
  b.onclick = () => choose(type);
  b.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'mouse') return;
    write($('hint'), TYPES[type].help.split(/(?<=[.!?])\s/)[0]);
    $('hint').hidden = false;
  });
  b.addEventListener('pointerleave', () => { $('hint').hidden = true; });
  return b;
}
export function growDock() {
  const dock = document.createElement('div');
  dock.className = 'dock';
  const key = (b, n) => { const k = document.createElement('kbd'); k.className = 'key'; k.setAttribute('aria-hidden', 'true'); k.textContent = n; b.append(k); b.setAttribute('aria-keyshortcuts', n); };
  const side = (type, n) => { const b = toolPod(type); b.classList.add('side'); key(b, n); dock.append(b); };
  side('hand', 1);
  FAMILIES.forEach(([id, name, model, types], i) => {
    const tray = document.createElement('div'), b = podOf(name);
    tray.className = 'tray'; tray.dataset.tray = id; tray.hidden = true;
    for (const type of types) tray.append(toolPod(type));
    $('tools').append(tray);
    b.classList.add('family'); b.dataset.family = id; b.setAttribute('aria-expanded', 'false');
    b.querySelector('.porthole').classList.add('model');
    showModel(b.querySelector('.porthole'), model);
    key(b, i + 2);
    b.onclick = () => toggleFamily(id);
    dock.append(b);
  });
  side('erase', 7);
  const stats = podOf(L('Statistiques'));
  stats.id = 'stats-pod'; stats.classList.add('side'); stats.setAttribute('aria-pressed', 'false');
  stats.querySelector('.porthole').innerHTML = '<svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true"><path d="M5 22V14M11 22V8M17 22V12M23 22V5" stroke="#66D9EA" stroke-width="3" stroke-linecap="round"/></svg>';
  key(stats, 8);
  stats.onclick = () => showStats(!ui.stats);
  dock.append(stats);
  const ranks = document.createElement('div');
  ranks.id = 'ranks'; ranks.hidden = true;
  for (const mk of [1, 2, 3]) {
    const b = document.createElement('button');
    b.dataset.rank = mk;
    b.append(`MK${mk}`, document.createElement('small'));
    b.onclick = () => { handRank[tool] = mk; paintRanks(); layoutHud(); };
    ranks.append(b);
  }
  $('tools').append(ranks, dock);
}
export function spacePauses(event) {
  if (event.code !== KEYS.pause || modalOpen() || event.ctrlKey || event.metaKey || event.altKey) return false;
  if (tabbed && event.target.closest?.('button')) return false;
  // Both ways, or a focused button clicks itself on the way up.
  event.preventDefault();
  return true;
}
export function hold() {
  clearTimeout(held);
  $('restart').classList.add('holding');
  mainSet.held(setTimeout(() => { letGo(); mainSet.armed(0); restartText(L('Recommencer : maintenir')); showMenu(false); begin(); }, 1000));
}
export function letGo() {
  clearTimeout(held);
  $('restart').classList.remove('holding');
}
// R turns what is under the pointer, or the piece in hand. Shift turns the other way.
export function rotate(back) {
  playSound('rotate');
  const by = back ? 3 : 1, building = tool !== 'hand' && tool !== 'erase';
  const p = hovered && preview(), under = p && cellAt(p.x, p.y);
  // With a piece in hand the last one placed stays selected: it must not take the key from the next.
  const c = under && (hasTrait(under.type, 'turn') || under.type === 'bridge') ? under : !building && selected ? G.cells[selected] : null;
  if (c?.type === 'bridge') turnWay(c, back ? 0 : 1);
  else if (c && hasTrait(c.type, 'turn')) {
    c.dir = (c.dir + by) % 4;
    if (building) setHeading(c.dir);
  } else {
    setHeading((heading + by) % 4);
    if (building) {
      select(null);
      say(L`Sens : ${WAYS[heading]}. ${keyName(KEYS.rotate)} pour tourner, Maj+${keyName(KEYS.rotate)} dans l’autre sens.`);
    }
  }
  showActions();
}
export function repayBonus() {
  mainSet.repaid(G.upgrades > 0 ? 30 * (2 ** G.upgrades - 1) : 0);
  G.dna += repaid;
  delete G.upgrades;
}
// A game from before the fog has seen round all it built and every nest it woke.
export function uncover() {
  const first = !G.seen;
  look(true);
  if (!first) return;
  for (const b of G.breaches) if (b.state !== 'sleep') lightUp([id => (G.seen[id] ||= new Array(16).fill(0))], b.x, b.y, SIGHT.nest);
  simSet.fogTick(fogTick + 1);
}
export function load(text) {
  try {
    const from = slotKey || SAVE;
    let saved = JSON.parse(text ?? localStorage.getItem(from));
    const old = !saved && from === SAVE;
    if (old) saved = JSON.parse(localStorage.getItem(OLD_SAVE));
    if (old || saved?.board === 11) {
      // A game from the 11 x 14 board continues in the middle of the big map.
      if (saved?.cells) {
        delete saved.board;
        const moved = {};
        for (const c of Object.values(saved.cells)) { c.x += OX; c.y += OY; moved[key(c.x,c.y)] = c; }
        saved.cells = moved; saved.shots = [];
        for (const e of saved.enemies || []) { e.x += OX; e.y += OY; }
      }
    }
    if (saved && !saved.over && coreIn(saved.cells) && Array.isArray(saved.families)) { simSet.G(saved); if (!G.paid) { G.dna += START_DNA; G.paid = true; } G.ruins ||= {}; G.tracks ||= {}; G.worms ||= []; G.wires ||= []; for (const c of Object.values(G.cells)) if (Array.isArray(c.hold)) c.hold = c.hold.filter(Boolean); if (!G.drones) hatchDrones(); if (!G.capsules) { G.capsules = true; G.meals = []; if (G.stage === 2) G.fed = Math.floor(G.fed / PACK.size); } G.seed ??= newSeed(); if (G.stage == null) Object.assign(G, {stage:0, fed:0, held:0, meals:[], open:true}); survey(); repayBonus(); rankFollowers(); if (!G.breaches) { G.woken = 0; nest(); } else thinNests(); if (G.world !== 2) spreadOut(); uncover(); return true; }
  } catch (_) {}
  return false;
}
// What the simulation leaves to the interface around a fresh game, a finished job and a worm gone.
export function noteEarned(source, amount) { (ui.earned ||= []).push({at:G.time, source, amount}); }
export function onFresh() { mainSet.selected(null); mainSet.chain([]); mainSet.paused(false); }
export function testLine() { window.startLine?.(); }
export function jobDone(c) { if (selected === key(c.x, c.y)) showActions(); }
export function wormGone(c) { if (wormId === c.id) { mainSet.wormId(null); showActions(); } }
export function begin() {
  fresh();
  ui.dna = ui.stage = null; ui.grown = 0; ui.travel = null;
  $('growth').hidden = true;
  look(true);
  forgetEvents(); choose('hand'); home();
  tell(hungry());
  save(); refresh();
}

// The bindings other modules replace.
export const viewSet = {
  begin: (v) => (begin = v),
  hold: (v) => (hold = v),
  load: (v) => (load = v),
  rotate: (v) => (rotate = v),
  script: (v) => (script = v)
};
