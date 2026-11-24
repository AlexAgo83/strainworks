// Games: stored one a hexagon, and files checked before a byte is stored.
import { BOX, DESK, G, KINDS, LEVEL, RANKS, STAGES, TYPES, WHEN, coreIn, hasTrait, key, paces, simSet, tierAt } from "../sim/sim.ts";
import { L } from "../sim/text.ts";
import { forgetEvents, paintGuide, showIntro, startGuide, tell } from "./hud.js";
import { choose, refresh } from "./input.js";
import { $, BATCHES, CELLS_OF_GLOBE, DEMO_HEX, DEMO_KEY, FILE, GAME_KEY, INTRO_KEY, LIMIT, LIST_KEY, MATTER, MAX_FAMILIES, MOST_DRONES, NAMES, NERVE_COLORS, OLD_SAVE, PREFERRED, SAVE, UPGRADES, demoMoved, dot3, downloads, drag, gesture, hovered, mainSet, owed, paused, repaid, saveFailed, slotId, slotKey, slotName, slotSaved, ui } from "./main.js";
import { noteOnPlanet } from "./planet.js";
import { home } from "./render.js";
import { begin, load } from "./view.js";


export function stored(key) { try { return localStorage.getItem(key); } catch (_) { return null; } }
export function keep(key, text) { try { localStorage.setItem(key, text); return true; } catch (_) { return false; } }
export function parsed(text) { try { return JSON.parse(text); } catch (_) { return null; } }
export function summaryOf(game) {
  const cells = Object.values(game?.cells || {});
  let level = 0, rank = 1;
  for (const c of cells) { level = Math.max(level, tierAt(c.x, c.y) + 1); rank = Math.max(rank, c.mk || 1); }
  return {
    stage:game?.stage ?? 0, over:Boolean(game?.over), dna:Math.floor(game?.dna || 0), kills:game?.kills || 0,
    // Creatures on the map or a breach awake when it was saved: the planet shows that station fighting.
    fight:!game?.over && ((game?.enemies?.length || 0) > 0 || (Array.isArray(game?.breaches) && game.breaches.some(b => b?.state === 'wake'))),
    played:Math.floor(game?.played ?? game?.time ?? 0), built:cells.length, level, rank,
    spent:(Array.isArray(game?.breaches) ? game.breaches : []).filter(b => b?.state === 'spent').length
  };
}
// Read again before each change: another tab may have changed it.
export function readList() {
  const found = parsed(stored(LIST_KEY)), games = found?.games && typeof found.games === 'object' ? found.games : {};
  const list = {v:1, last:found?.last ?? null, games:{}};
  for (const [id, g] of Object.entries(games)) {
    if (CELLS_OF_GLOBE[id] && typeof g?.key === 'string' && stored(g.key) !== null) list.games[id] = g;
  }
  // The demo's hexagon is kept for it: a game a player had there moves to the nearest free one, untouched.
  if (list.games[DEMO_HEX]) {
    const to = freeHex(list, DEMO_HEX);
    if (to != null) {
      list.games[to] = list.games[DEMO_HEX]; delete list.games[DEMO_HEX];
      if (String(list.last) === String(DEMO_HEX)) list.last = to;
      writeList(list); mainSet.demoMoved(true);
    }
  }
  return list;
}
export function planetList() {
  const list = readList();
  if (DEMO_HEX != null) list.games[DEMO_HEX] = {key:DEMO_KEY, name:L('Démo'), demo:true, ...summaryOf(window.DEMO_GAME || {stage:4})};
  return list;
}
export function writeList(list) { return keep(LIST_KEY, JSON.stringify(list)); }
export function freeHex(list, near) {
  const free = PREFERRED.filter(id => !list.games[id] && id !== DEMO_HEX);
  if (near == null) return free[0];
  const c = CELLS_OF_GLOBE[near].c;
  return free.sort((a, b) => dot3(CELLS_OF_GLOBE[b].c, c) - dot3(CELLS_OF_GLOBE[a].c, c))[0];
}
export function newName(list) {
  const used = new Set(Object.values(list.games).map(g => g.name)), free = NAMES.find(name => !used.has(name));
  return free || L`Souche ${Object.keys(list.games).length + 1}`;
}
// What an older version left, and any game the list lost.
export function findGames() {
  const list = readList(), listed = new Set(Object.values(list.games).map(g => g.key));
  let changed = false;
  const adopt = (key, text, wanted) => {
    const id = wanted != null && CELLS_OF_GLOBE[wanted] && !list.games[wanted] ? wanted : freeHex(list);
    if (id == null) return;
    list.games[id] = {key, name:newName(list), ...summaryOf(parsed(text))};
    listed.add(key); list.last = id; changed = true;
  };
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(GAME_KEY) || listed.has(key)) continue;
      adopt(key, stored(key), key.slice(GAME_KEY.length).split(':')[0]);
    }
  } catch (_) {}
  if (!listed.has(SAVE)) {
    let text = stored(SAVE);
    const older = text === null ? stored(OLD_SAVE) : null;
    // The 11 x 14 board is moved by load(), under the same key as ever.
    if (older !== null && keep(SAVE, older.replace(/^\{/, '{"board":11,'))) text = older;
    if (text !== null) adopt(SAVE, text);
  }
  if (changed) writeList(list);
}
export function save() {
  if (!slotKey || slotKey === DEMO_KEY) return false;
  // Its hexagon emptied from another tab: this one does not bring it back.
  const list = readList(), entry = list.games[slotId];
  if (!entry && stored(slotKey) === null && slotSaved) return false;
  const ok = keep(slotKey, JSON.stringify(G));
  if (!ok) {
    if (!saveFailed) tell(L('Sauvegarde impossible, le stockage du navigateur est plein ou bloqué. Exporte ta partie depuis le menu.'), {bad:true});
    mainSet.saveFailed(true);
    return false;
  }
  mainSet.saveFailed(false); mainSet.slotSaved(true);
  list.games[slotId] = {name:slotName, ...entry, key:slotKey, ...summaryOf(G)};
  list.last = slotId;
  writeList(list);
  return true;
}
export function openSlot(id, key, name) { mainSet.slotId(id); mainSet.slotKey(key); mainSet.slotName(name); mainSet.slotSaved(false); mainSet.saveFailed(false); }
// All that belongs to the game being left.
export function settleIn() {
  ui.dna = ui.stage = null; ui.grown = 0; ui.travel = null;
  $('growth').hidden = true; $('over').hidden = true; $('victory').hidden = true;
  forgetEvents();
  mainSet.paused(false); mainSet.owed(0); mainSet.hovered(null); mainSet.gesture(null); mainSet.drag(null);
  paces.clear(); simSet.NET(new Map());
}
export function foundGame(wanted) {
  const list = readList(), id = wanted != null && !list.games[wanted] ? wanted : freeHex(list);
  if (id == null) { noteOnPlanet(L('La planète est pleine : efface ou exporte une partie.'), true); return false; }
  // The first one keeps the key every earlier version wrote.
  let key = SAVE;
  if (stored(key) !== null || Object.values(list.games).some(g => g.key === key)) {
    key = `${GAME_KEY}${id}`;
    if (stored(key) !== null) key += `:${Date.now()}`;
  }
  openSlot(id, key, newName(list));
  settleIn(); begin(); startGuide(); paintGuide();
  // Every new game opens on its goal; 'off' is only for tests and captures.
  if (stored(INTRO_KEY) !== 'off') showIntro(true);
  return true;
}
export function openGame(id) {
  // The demo: a fresh copy of the built-in game each time, never written back.
  if (id === DEMO_HEX) {
    if (!window.DEMO_GAME) return false;
    openSlot(id, DEMO_KEY, L('Démo')); settleIn();
    if (!load(JSON.stringify(window.DEMO_GAME))) { mainSet.slotKey(mainSet.slotId(null)); return false; }
    try { simSet.NET(new Map()); choose('hand'); home(); refresh(); } catch (_) { mainSet.slotKey(mainSet.slotId(null)); return false; }
    tell(L('Démo : une base au stade 6 qui tourne seule. Rien n’est enregistré, elle repart à neuf à chaque lancement.'));
    return true;
  }
  const game = readList().games[id];
  if (!game) return false;
  openSlot(id, game.key, game.name);
  settleIn();
  let ok = load();
  if (ok) {
    try { simSet.NET(new Map()); choose('hand'); home(); refresh(); } catch (_) { ok = false; }
  }
  if (!ok) {
    // Unreadable is not empty: it stays where it is, to export or erase.
    mainSet.slotKey(mainSet.slotId(null));
    return false;
  }
  mainSet.slotSaved(true);
  if (repaid) tell(L`Le bonus de débit a disparu : ${repaid} ADN remboursés, pour des tapis et récolteurs MK2 ou MK3.`);
  tell(L('Partie reprise. Glisse ou utilise les flèches pour te déplacer, pince pour zoomer.'));
  return true;
}
export function eraseGame(id) {
  const list = readList(), game = list.games[id];
  if (!game) return false;
  try {
    localStorage.removeItem(game.key);
    if (game.key === SAVE) localStorage.removeItem(OLD_SAVE);
  } catch (_) { return false; }
  delete list.games[id];
  if (String(list.last) === String(id)) list.last = Object.keys(list.games)[0] ?? null;
  writeList(list);
  if (String(slotId) === String(id)) mainSet.slotKey(mainSet.slotId(null));
  return true;
}
// Written beside what exists, all or none.
export function graftGames(found, near) {
  const list = readList(), made = [];
  for (const {name, game} of found) {
    const id = !made.length && near != null && !list.games[near] ? near : freeHex(list, made[0]?.id ?? near);
    let key = `${GAME_KEY}${id}`;
    if (stored(key) !== null) key += `:${Date.now()}`;
    if (id == null || !keep(key, JSON.stringify(game))) {
      for (const one of made) { try { localStorage.removeItem(one.key); } catch (_) {} }
      return null;
    }
    made.push({id, key});
    list.games[id] = {key, name:String(name || newName(list)).slice(0, 40), ...summaryOf(game)};
    list.last = made[0].id;
  }
  if (writeList(list)) return made[0]?.id ?? null;
  for (const one of made) { try { localStorage.removeItem(one.key); } catch (_) {} }
  return null;
}

// ---- A file is somebody else's data: every value is looked at before a byte is stored.
export function checkGame(game) {
  const plain = v => Boolean(v) && typeof v === 'object' && !Array.isArray(v);
  const list = (v, test) => Array.isArray(v) && v.every(test);
  const code = v => typeof v === 'string' && /^[SFCN]{3}$/.test(v);
  const thing = v => typeof v === 'string' && /^([SFCNKI]|[SFCN]{3}|[SFCN]{6}|[ATH]:([SFCN]{3}|[SFCN]{6}))$/.test(v);
  const where = v => typeof v === 'string' && /^-?\d{1,6},-?\d{1,6}$/.test(v);
  const place = v => plain(v) && Number.isInteger(v.x) && Number.isInteger(v.y) && Math.abs(v.x) < LIMIT && Math.abs(v.y) < LIMIT;
  const spot = v => plain(v) && Number.isFinite(v.x) && Number.isFinite(v.y) && Math.abs(v.x) <= LIMIT && Math.abs(v.y) <= LIMIT;
  const side = v => [0, 1, 2, 3].includes(v);
  const count = v => Number.isFinite(v) && v >= 0;
  if (!plain(game)) return false;

  // No markup, no key that reaches a prototype, nothing endless.
  let values = 0;
  const clean = (v, deep) => {
    if (++values > FILE.values || deep > 12) return false;
    if (v === null || typeof v === 'boolean') return true;
    if (typeof v === 'number') return Number.isFinite(v) && Math.abs(v) < 1e15;
    if (typeof v === 'string') return v.length <= 300 && !/[<>&"`\\]/.test(v);
    if (Array.isArray(v)) return v.every(one => clean(one, deep + 1));
    if (typeof v !== 'object') return false;
    return Object.entries(v).every(([name, one]) => name.length < 80 && !/[<>&"`\\]/.test(name) && !['__proto__', 'constructor', 'prototype'].includes(name) && clean(one, deep + 1));
  };
  if (!clean(game, 0)) return false;

  for (const name of ['time', 'dna', 'kills', 'made', 'threat', 'fed', 'held', 'seed', 'played', 'upgrades', 'woken', 'stage']) {
    if (game[name] != null && !count(game[name])) return false;
  }
  if (!count(game.time) || !count(game.dna) || !count(game.kills)) return false;
  if (game.stage != null && !(Number.isInteger(game.stage) && game.stage <= STAGES.length)) return false;
  if (game.upgrades > 20 || game.threat > 10) return false;
  if (game.guide != null && !(plain(game.guide) && Number.isInteger(game.guide.step) && game.guide.step >= 0 && game.guide.step <= 9 && plain(game.guide.base) && Object.values(game.guide.base).every(count))) return false;
  if (!list(game.families, code) || !game.families.length || game.families.length > MAX_FAMILIES) return false;
  if (!plain(game.cells) || Object.keys(game.cells).length > FILE.cells || !coreIn(game.cells)) return false;

  const rank = c => c.mk == null || [1, 2, 3].includes(c.mk);
  const known = c => c.type === 'core' || (Object.hasOwn(TYPES, c.type) && !hasTrait(c.type, 'noCell'));
  const pieces = c => count(c.hp) && side(c.dir)
    && (c.to == null || where(c.to)) && (c.box == null || Object.hasOwn(BOX, c.box)) && (c.side == null || [1, 3].includes(c.side))
    && (c.read == null || (Number.isInteger(c.read) && c.read >= 0 && c.read <= 6)) && (c.want == null || /^([SFCNKI?]|[SFCN?]{3}|[SFCN?]{6})$/.test(c.want))
    && (c.on == null || Object.hasOwn(MATTER, c.on)) && (c.ways == null || list(c.ways, w => w === null || side(w)))
    && (c.item == null || thing(c.item)) && (!c.last || thing(c.last)) && (c.from == null || c.from === -1 || side(c.from))
    && (c.turn == null || Number.isInteger(c.turn) && c.turn >= 0)
    && (c.when == null || Object.hasOwn(WHEN, c.when)) && (c.mode == null || DESK.modes.includes(c.mode)) && (c.gene == null || code(c.gene))
    && (c.level == null || [.25, .5, .75, 1].includes(c.level)) && (c.batch == null || BATCHES.includes(c.batch))
    && (c.passed == null || count(c.passed)) && (c.watch == null || where(c.watch)) && (c.source == null || where(c.source))
    && Array.isArray(c.ports) && c.ports.length === 3 && c.ports.every(port => list(port, thing))
    && list(c.stock, thing) && Array.isArray(c.made) && plain(c.ammo) && Object.entries(c.ammo).every(([gene, n]) => code(gene) && count(n))
    && (c.packets == null ? c.type !== 'pump' : list(c.packets, p => plain(p) && thing(p.item) && count(p.n) && p.n <= 64 && count(p.t)))
    && (c.lanes == null ? c.type !== 'bridge' : c.lanes.length === 2 && list(c.lanes, l => l === null || (plain(l) && thing(l.item) && side(l.dir) && count(l.t))))
    && (c.due == null || list(c.due, d => plain(d) && count(d.at) && side(d.from)))
    && (c.portDue == null || list(c.portDue, port => list(port, d => plain(d) && count(d.at) && side(d.from))))
    && (c.gulp == null || (thing(c.gulp.item) && side(c.gulp.from) && count(c.gulp.t)))
    && (c.up == null || (Object.hasOwn(RANKS, c.type) && count(c.up) && [2, 3].includes(c.upTo) && count(c.upPaid)));
  for (const [id, c] of Object.entries(game.cells)) if (!place(c) || id !== key(c.x, c.y) || !known(c) || !rank(c) || !pieces(c)) return false;

  if (game.ruins != null) {
    if (!plain(game.ruins)) return false;
    for (const [id, c] of Object.entries(game.ruins)) if (!place(c) || id !== key(c.x, c.y) || !known(c) || !rank(c) || (c.to != null && !where(c.to)) || (c.dir != null && !side(c.dir))) return false;
  }
  if (game.bigTracks != null && typeof game.bigTracks !== 'boolean') return false;
  if (game.tracks != null) {
    if (!plain(game.tracks)) return false;
    for (const [id, t] of Object.entries(game.tracks)) if (!place(t) || id !== key(t.x, t.y) || !side(t.dir)) return false;
  }
  if (game.worms != null && !list(game.worms, w => plain(w) && count(w.hp) && list(w.path, where) && w.path.length > 0 && w.path.length <= 7 && list(w.holds, h => plain(h) && count(h.n) && (!h.kind || thing(h.kind))) && w.holds.length >= 3 && w.holds.length <= 5)) return false;
  if (game.wires != null && !list(game.wires, w => plain(w) && where(w.a) && where(w.b) && count(w.hp) && (w.color == null || (Number.isInteger(w.color) && w.color >= 0 && w.color < NERVE_COLORS.length)))) return false;
  if (game.enemies != null && !list(game.enemies, e => spot(e) && code(e.gene) && (e.kind == null || Object.hasOwn(KINDS, e.kind)) && Number.isFinite(e.hp) && count(e.max) && (!e.goal || spot(e.goal)))) return false;
  if (game.shots != null && !list(game.shots, s => spot(s) && [1, 2, 5, 12].includes(s.hurt) && Number.isFinite(s.tx) && Number.isFinite(s.ty))) return false;
  if (game.breaches != null && !list(game.breaches, b => (b.hp == null || Number.isFinite(b.hp)) && (b.max == null || count(b.max)) && place(b) && count(b.r) && b.r < 40 && count(b.left) && count(b.total) && ['sleep', 'wake', 'spent'].includes(b.state) && list(b.genes, code) && b.genes.length > 0 && (b.form == null || side(b.form)) && (b.tier == null || (Number.isInteger(b.tier) && b.tier >= 0 && b.tier < LEVEL.total.length)) && (!b.post || spot(b.post)) && (!b.gene || code(b.gene)) && (!b.born || code(b.born)))) return false;
  if (game.drones != null && !(game.drones.length >= 1 && game.drones.length <= MOST_DRONES && list(game.drones, d => spot(d) && count(d.h) && count(d.w) && typeof d.job === 'string' && spot(d.was) && (!d.goal || spot(d.goal))))) return false;
  if (game.seen != null && !(plain(game.seen) && Object.entries(game.seen).every(([id, rows]) => where(id) && rows?.length === 16 && list(rows, n => Number.isInteger(n) && n >= 0 && n < 65536)))) return false;
  if (game.cleared != null && !list(game.cleared, id => typeof id === 'string')) return false;
  if (game.meals != null && !list(game.meals, count)) return false;
  if (game.won != null && !count(game.won)) return false;
  if (game.lab != null && !(plain(game.lab) && Object.entries(game.lab).every(([id, n]) => Object.hasOwn(UPGRADES, id) && Number.isInteger(n) && n >= 0 && n <= 4))) return false;
  if (game.goals != null && !(list(game.goals, g => plain(g) && thing(g.item) && count(g.count) && count(g.fed)) && game.goals.length <= 6)) return false;
  return true;
}
// Either one game, a whole planet, or a bare save.
export function readFileGames(text) {
  if (text.length > FILE.bytes) return {error:L('Ce fichier est trop gros pour être une partie Strainworks.')};
  const data = parsed(text);
  if (!data || typeof data !== 'object') return {error:L('Ce fichier est illisible. Rien n’a été modifié.')};
  const many = data.format === FILE.all && Array.isArray(data.games);
  const found = many ? data.games : data.format === FILE.one ? [{name:data.name, game:data.game}] : [{name:'', game:data}];
  const fine = found.length > 0 && found.length <= CELLS_OF_GLOBE.length && found.every(one => {
    if (one?.name != null && typeof one.name !== 'string') return false;
    try { return checkGame(one?.game); } catch (_) { return false; }
  });
  return fine ? {found} : {error:L('Ce n’est pas une partie Strainworks valide. Rien n’a été modifié.')};
}
export async function handFile(name, data) {
  const filename = `${name.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'partie'}.strainworks.json`;
  if (window.claude?.use) {
    mainSet.downloads(downloads ?? (await window.claude.use('downloads')));
    if (!downloads) return L('Cette vue ne permet pas de télécharger. Ouvre le jeu dans claude.ai.');
    try {
      await downloads.save({filename, data});
      return L`${filename} exporté.`;
    } catch (error) {
      return error?.code === 'declined' ? L('Export annulé.') : L('Export impossible ici, réessaie dans un instant.');
    }
  }
  const link = document.createElement('a'), href = URL.createObjectURL(new Blob([data], {type:'application/json'}));
  link.href = href; link.download = filename;
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(href), 10000);
  return L`${filename} exporté.`;
}
export async function exportGame(id) {
  const entry = readList().games[id], text = entry && stored(entry.key);
  if (!text) return L('Cette partie est introuvable.');
  const game = parsed(text);
  // Unreadable, it still leaves as it is.
  return handFile(entry.name, game ? JSON.stringify({format:FILE.one, v:1, name:entry.name, game}) : text);
}
export async function exportAll() {
  const games = Object.values(readList().games).map(g => ({name:g.name, game:parsed(stored(g.key))})).filter(one => one.game);
  if (!games.length) return L('Aucune partie à exporter.');
  return handFile('planete', JSON.stringify({format:FILE.all, v:1, games}));
}

// The bindings other modules replace.
export const savesSet = {
  checkGame: (v) => (checkGame = v),
  foundGame: (v) => (foundGame = v),
  freeHex: (v) => (freeHex = v),
  keep: (v) => (keep = v),
  openGame: (v) => (openGame = v),
  openSlot: (v) => (openSlot = v),
  parsed: (v) => (parsed = v),
  planetList: (v) => (planetList = v),
  readList: (v) => (readList = v),
  save: (v) => (save = v),
  stored: (v) => (stored = v)
};
