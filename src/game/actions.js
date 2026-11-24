// What the player does to the game: building, ranks, the lab's upgrades, nerves and stages, as the interface asks.
import { BELT_SPEED, liftable, BORER, BOX, BUILD, BUILDERS, CORE, DRONE, FIELDS, G, GUNS, H, INNER, NERVE, NEST, NET, RADAR, RANKS, SECTOR, STAGES, STEP, TYPES, VEIN, W, WATCHES, WHEN, WORM, accepts, ahead, allCells, asked, atHome, bitAt, boxOf, built, capOf, carbonSide, cellAt, connects, contentOf, depositAt, dice, drains, dropRise, eachSector, edgesOf, exitOf, fill, footprint, gateCondition, gateOpen, gateStore, hasTrait, heardOf, inSight, isBelt, isGun, isSplit, jobId, joinSide, keepsNest, key, leaking, listens, matterUnder, mouthPace, netOf, paceOf, paces, packTakes, perSecond, perch, pocketCap, pumps, put, refund, richAt, richCap, richUnder, richness, sideExit, simSet, sites, span, splitExits, unlink, unlocked, veinKind, wayOf, workTime, wormHolds } from "../sim/sim.ts";
import { DEC, L } from "../sim/text.ts";
import { playSound } from "./audio.js";
import { refuse, tell } from "./hud.js";
import { refresh, say, selectWorm } from "./input.js";
import { CROWDED, DESK_NAMES, HEADING_KEY, MATTER, MOST_DRONES, NERVE_COLORS, UPGRADES, canRise, chain, gateGreen, geneName, heading, inLayout, labNext, mainSet, named, owed, paused, placeable, price, selected, tileAt, tileKey, touchesTrack, trackAt, upCost, whyNot } from "./main.js";

// The finger may be on any of the four cells: the first square round it that fits, else why the first does not.
export function siteFor(type, x, y) {
  let first = null;
  for (const [i, j] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
    const site = {type, x:x - i, y:y - j}, cells = footprint(site);
    const bare = cells.find(p => !placeable(p.x, p.y));
    if (bare) site.why = whyNot(bare.x, bare.y);
    else if (cells.some(p => cellAt(p.x, p.y) || (G.bigTracks && trackAt(p.x, p.y)))) site.why = L('Il faut 2 × 2 cases libres');
    else if (type === 'lab' && allCells().some(c => c.type === 'lab')) site.why = L('Le Laboratoire est unique');
    else if (type === 'reaper' && allCells().some(c => c.type === 'reaper')) site.why = L('Le Recycleur est unique');
    else if (type === 'borer') {
      const kind = depositAt(site.x, site.y);
      if (!kind || cells.some(p => depositAt(p.x, p.y) !== kind)) site.why = L('4 cases d’un même gisement');
    }
    if (!site.why) return site;
    first ||= site;
  }
  return first;
}
export function thinNests() {
  const all = G.breaches;
  G.breaches = all.filter(b => b.state !== 'sleep' || (keepsNest(b) && inLayout(b)));
  for (const e of G.enemies || []) if (e.home != null) e.home = G.breaches.indexOf(all[e.home]);
}
// The world as it was dealt before it was spread out, only to know what an older harvester stands on.
export function crowdedField(sx, sy) {
  const left = sx * SECTOR, top = sy * SECTOR, chance = dice(sx, sy, 1);
  if (chance > .72) return chance > .86 ? ['K', left + 12, top + 12, 5 + Math.floor(dice(sx, sy, 9) * 3), 5] : null;
  const roll = n => dice(sx, sy, n), away = Math.hypot(left + SECTOR / 2 - CORE.x, top + SECTOR / 2 - CORE.y);
  const grown = Math.min(3, Math.floor(away / 120)), w = 5 + grown + Math.floor(roll(2) * 3), h = 4 + grown + Math.floor(roll(3) * 3);
  return ['SFCN'[Math.floor(roll(6) * 4)], left + 8 + Math.floor(roll(4) * (17 - w)), top + 8 + Math.floor(roll(5) * (17 - h)), w, h];
}
export function keepHarvests() {
  for (const c of [...allCells(), ...Object.values(G.ruins)]) {
    if ((c.type !== 'mine' && c.type !== 'borer') || c.on) continue;
    const home = atHome(c.x, c.y);
    const found = home ? [...(G.far ? [] : INNER), ...CROWDED] : [crowdedField(Math.floor(c.x / SECTOR), Math.floor(c.y / SECTOR))].filter(Boolean);
    // Inside its rectangle, or on a splash round it.
    const off = ([, x, y, w, h]) => Math.hypot(Math.max(x - c.x, 0, c.x - x - w + 1), Math.max(y - c.y, 0, c.y - y - h + 1));
    // @ts-expect-error: loose typing, tightened module by module (item_007)
    const was = found.filter(f => off(f) <= 5.5).sort((a, b) => off(a) - off(b))[0];
    if (!was) continue;
    // @ts-expect-error: loose typing, tightened module by module (item_007)
    const rich = home ? richness(was[1] + was[3] / 2, was[2] + was[4] / 2) : was[0] === 'K' ? 2 : 4;
    if (footprint(c).every(p => depositAt(p.x, p.y) === was[0] && richAt(p.x, p.y) === rich)) continue;
    c.on = was[0]; c.onRich = rich;
  }
}
// A nest the spread-out world would have dealt over what an older game built is not dealt: none wakes on loading.
export function spreadOut() {
  keepHarvests();
  const built = [...allCells(), ...Object.values(G.tracks)].filter(c => c.type !== 'core'), cleared = new Set(), points = [];
  for (const c of built) {
    for (const p of c.type ? footprint(c) : [c]) points.push(p);
    const to = c.to && G.cells[c.to];
    if (to) for (let i = 1, n = Math.ceil(span(c, to)); i < n; i++) points.push({x:c.x + (to.x - c.x) * i / n, y:c.y + (to.y - c.y) * i / n});
  }
  for (const p of points) eachSector(p.x - SECTOR, p.y - SECTOR, p.x + SECTOR, p.y + SECTOR, s => {
    if (s.breach && Math.hypot(p.x - s.breach.x, p.y - s.breach.y) <= s.breach.r + 1) cleared.add(s.breach.id);
  });
  G.cleared = [...cleared];
  simSet.sectors(new Map());
  G.breaches.forEach((b, i) => { b.form ??= i % 4; });
  G.world = 2;
}
export function radarWave(c, t) {
  if (!built(c)) return null;
  if (selected === key(c.x, c.y)) return (t / RADAR.pulse) % 1;
  const since = G.time - (c.shownAt ?? -1e9);
  return since < RADAR.pulse * 2 ? (since / RADAR.pulse) % 1 : null;
}
export function known(x, y) { return bitAt(id => G.seen?.[id], x, y); }
// A nest as the player knows it, or nothing.
export function shownNests(x0, y0, x1, y1) {
  const shown = [];
  for (const b of breachesIn(x0, y0, x1, y1)) {
    if (!known(b.x, b.y)) continue;
    const as = inSight(b.x, b.y) || (!b.known && b.state !== 'spent') ? b : b.known ? {...b, ...b.known} : null;
    if (as) shown.push(as);
  }
  return shown;
}
export function fieldsIn(x0, y0, x1, y1) {
  // A patch splashes up to four cells out of its rectangle.
  const meets = ([, x, y, w, h]) => x - 4 <= x1 && x + w + 4 >= x0 && y - 4 <= y1 && y + h + 4 >= y0;
  const found = FIELDS.filter(meets);
  eachSector(x0, y0, x1, y1, s => { if (meets(s.field)) found.push(s.field); });
  return found;
}
// Every breach whose circle meets the box, woken or not.
export function breachesIn(x0, y0, x1, y1) {
  const meets = b => b.x + b.r >= x0 && b.x - b.r <= x1 && b.y + b.r >= y0 && b.y - b.r <= y1;
  const found = G.breaches.filter(meets), woken = new Set(G.breaches.map(b => b.id));
  eachSector(x0 - 16, y0 - 16, x1 + 16, y1 + 16, s => { if (s.breach && !woken.has(s.breach.id) && meets(s.breach)) found.push(s.breach); });
  return found;
}
export function setHeading(dir) {
  mainSet.heading(dir);
  try { localStorage.setItem(HEADING_KEY, dir); } catch (_) { /* blocked or full storage: the game goes on without remembering it */ }
}
export function itemName(item) {
  const box = boxOf(item);
  if (box) return `${BOX[box].name.toLowerCase()} ${contentOf(item)}`;
  return MATTER[item] ? named(item) : (item.length === 6 ? L('brin ') : L('gène ')) + item;
}
export function labPrice(id) {
  const price = UPGRADES[id].prices[labNext(id)];
  return price == null ? null : id === 'drones' && G.labDiscount ? Math.ceil(price / 2) : price;
}
// Buys the next level of an upgrade: a lab standing, its stage reached, the DNA paid.
export function buyLab(id) {
  const up = UPGRADES[id], next = labNext(id), price = labPrice(id);
  if (!allCells().some(c => c.type === 'lab' && built(c))) return refuse(L('Il faut un Laboratoire construit pour acheter des améliorations.'));
  if (price == null || (id === 'drones' && G.drones.length >= MOST_DRONES)) return refuse(L`${up.name} : déjà au plus haut.`);
  if (!unlocked(up.stages[next] - 1)) return refuse(L`${up.name} niveau ${next + 1} : stade ${up.stages[next]}.`);
  if (price > G.dna) return refuse(L`Il manque ${price - G.dna} ADN pour ${up.name.toLowerCase()}.`);
  G.dna -= price;
  if (id === 'drones') {
    G.labDiscount = false;
    const {x, y} = perch(G.drones.length);
    G.drones.push({x, y, a:0, h:.55, w:0, trip:'nest', speed:DRONE.speed, job:'', goal:null, was:{x, y, h:.55, w:0}});
  } else (G.lab ||= {})[id] = next + 1;
  playSound('stage_up');
  tell(L`${up.name} : niveau ${next + 1}.`);
  refresh();
  return true;
}
export function raise(list, mk) {
  const todo = list.filter(c => canRise(c, mk)), cost = todo.reduce((sum, c) => sum + upCost(c, mk), 0);
  if (!todo.length) return false;
  if (cost > G.dna) { refuse(L`Il manque ${cost - G.dna} ADN pour passer ${todo.length > 1 ? L('cette ligne') : L('ça')} en MK${mk}.`); return false; }
  G.dna -= cost;
  for (const c of todo) {
    const paid = upCost(c, mk);
    // Not built yet: it is built at that rank.
    if (c.left > 0) { c.mk = mk; continue; }
    Object.assign(c, {up:RANKS[c.type].time, upTo:mk, upPaid:paid, upOrder:G.seq = (G.seq || 0) + 1});
  }
  return true;
}
export function rankFollowers() {
  if (G.ranked) return;
  G.ranked = true;
  const list = allCells().filter(c => hasTrait(c.type, 'capped') && c.mk == null);
  simSet.uncapped(true); paces.clear();
  const ranks = list.map(c => paceOf(c) / BELT_SPEED);
  simSet.uncapped(false); paces.clear();
  list.forEach((c, i) => { if (ranks[i] > 1) c.mk = ranks[i]; });
}
// The row a belt is in: on through bridges and gates, up to a machine or to where another row takes over.
export function rowOf(c) {
  const before = belt => {
    const all = feeders(belt), from = all.find(f => f.dir === belt.dir) || (all.length === 1 ? all[0] : null);
    if (!from) return null;
    let at = from.c;
    while (at?.type === 'bridge') at = ahead(at, (from.dir + 2) % 4);
    return isBelt(at) && at.dir === from.dir ? at : null;
  };
  const after = belt => {
    let at = ahead(belt);
    while (at?.type === 'bridge' && wayOf(at, belt.dir % 2) === belt.dir) at = ahead(at, belt.dir);
    return isBelt(at) && before(at) === belt ? at : null;
  };
  const row = new Set([c]);
  for (let at = before(c); at && !row.has(at); at = before(at)) row.add(at);
  for (let at = after(c); at && !row.has(at); at = after(at)) row.add(at);
  return [...row];
}
export function build(type, x, y, dir) {
  const c = put(type, x, y, dir);
  c.left = BUILD[type] || 0; c.order = G.seq = (G.seq || 0) + 1;
  return c;
}
// Asks for a drone. A site nobody started has nothing to take down: it goes at once.
export function scrap(c, now) {
  if (c.out != null || c.type === 'core') return;
  c.unfinished = (c.left || 0) > 0;
  dropRise(c);
  const total = workTime(c);
  if (c.left >= total - 1e-9) return now();
  c.out = total;
  if (c.left > 0) { c.out = total - c.left; c.left = 0; c.cut = true; }
  c.outOrder = G.seq = (G.seq || 0) + 1;
}
export function scrapVein(c) {
  if (c.veinOut != null) return;
  const total = workTime(c, true);
  if (c.veinLeft >= total - 1e-9) return unlink(c);
  c.veinOut = total;
  if (c.veinLeft > 0) { c.veinOut = total - c.veinLeft; c.veinLeft = 0; c.veinCut = true; }
  c.veinOutOrder = G.seq = (G.seq || 0) + 1;
}
// Changing one's mind: what was undone has to be built again.
export function keepIt(c) {
  if (c.out == null) return;
  if (c.cut) { c.left = Math.max(0, workTime(c) - c.out); c.order = G.seq = (G.seq || 0) + 1; }
  delete c.out; delete c.cut; delete c.outOrder; delete c.unfinished;
}
export function keepVein(c) {
  if (c.veinOut == null) return;
  if (c.veinCut) { c.veinLeft = Math.max(0, workTime(c, true) - c.veinOut); c.veinOrder = G.seq = (G.seq || 0) + 1; }
  delete c.veinOut; delete c.veinCut; delete c.veinOutOrder;
}
// Where to draw a drone: between two ticks, and circling its site while it works.
export function dronePose(d) {
  const k = Math.max(0, Math.min(1, owed / STEP)), mix = name => d.was[name] + (d[name] - d.was[name]) * k;
  const w = mix('w'), turn = (G.time + owed) * 2.6 + G.drones.indexOf(d) * 2.1;
  const x = mix('x') + Math.cos(turn) * .7 * w, y = mix('y') + Math.sin(turn) * .7 * w;
  const facing = d.goal && w > .5 ? Math.atan2(d.goal.y - y, d.goal.x - x) : d.a;
  return {x, y, w, a:facing, h:mix('h'), goal:d.goal, undo:d.undo};
}
// How far the stage is, 0 to 1, or null past the last stage.
export function stagePart() {
  if (G.stage >= STAGES.length) return null;
  if (G.goals) { const all = G.goals.reduce((a, g) => a + g.count, 0); return all ? G.goals.reduce((a, g) => a + Math.min(g.fed, g.count), 0) / all : 0; }
  const want = STAGES[G.stage];
  return want.rate ? G.held / want.hold : G.fed / want.count;
}
export function recipe(item) {
  const box = boxOf(item), genes = contentOf(item).match(/.{3}/g).map(geneName).join(' + ');
  return box ? L`${BOX[box].name.toLowerCase()} de ${fill(box)} ${genes}` : genes;
}
export function portSide(c, port) { return (c.dir + [3, 2, 1][c.flip ? 2 - port : port]) % 4; }
export function link(a, b) {
  if (!a || !b || a === b || b.type !== 'pump') return refuse(L('Une veine va d’une pompe à une autre.'));
  if (span(a, b) > VEIN.reach) return refuse(L`Trop loin : ${Math.ceil(span(a, b))} cases. Pose une pompe relais, 24 au plus entre deux.`);
  for (let p = b, i = 0; p && i < 999; p = G.cells[p.to], i++) if (p === a) return refuse(L('Une veine ne peut pas boucler.'));
  const one = veinKind(a), other = veinKind(b);
  if (one && other && one !== other) return refuse(L('Ces deux veines portent des matières différentes : vide l’une des deux.'));
  for (const p of a.packets) for (let i = 0; i < p.n; i++) a.stock.push(p.item);
  a.packets = []; a.to = key(b.x, b.y); a.veinHp = VEIN.hp;
  delete a.veinOut; delete a.veinCut;
  a.veinLeft = .5 + span(a, b) / 12; a.veinOrder = G.seq = (G.seq || 0) + 1;
  say(L('Veine reliée. Tire depuis la dernière pompe pour continuer.'));
  return true;
}
export function layTrack(x, y, dir) {
  ({x, y} = tileAt(x, y));
  const old = G.tracks[key(x, y)];
  if (old) { old.dir = dir; return old; }
  return G.tracks[key(x, y)] = {x, y, dir, left:BUILD.track, order:G.seq = (G.seq || 0) + 1};
}
export function incubate(x, y) {
  const cost = price('worm'), id = tileKey(x, y);
  if (!G.tracks[id]) return refuse(L('Un ver s’incube sur une piste : trace-la d’abord avec l’outil Piste.'));
  if (G.worms.some(w => w.path.includes(id))) return refuse(L('Un ver occupe déjà cette case.'));
  if (cost > G.dna) return refuse(L`Il manque ${cost - G.dna} ADN pour ce ver.`);
  G.dna -= cost;
  const w = {id:G.seq = (G.seq || 0) + 1, path:[id], t:0, hp:WORM.hp, left:BUILD.worm, docked:false, rule:'auto',
    holds:Array.from({length:wormHolds()}, () => ({kind:'', n:0, part:0}))};
  w.order = w.id;
  G.worms.push(w);
  say(L`Ver en incubation, ${cost} ADN. Il ne part qu’une fois éclos.`);
  selectWorm(w);
}
// Every nerve of the network a cell belongs to, through the cells they join.
export function netWires(id) {
  const seen = new Set([id]), wires = new Set();
  for (const at of seen) for (const w of G.wires) if (w.a === at || w.b === at) { wires.add(w); seen.add(w.a); seen.add(w.b); }
  return [...wires];
}
// Whom a listener hears, in words: the whole network, or its chosen source and how far it is.
export function sourceName(c, src) {
  if (!src) return L('tout le réseau');
  if (!NET.get(key(src.x, src.y)) || NET.get(key(src.x, src.y)) !== netOf(c)) return L('une source qui n’est plus sur son réseau');
  if (src.type === 'core') return L('le cœur');
  return L`${TYPES[src.type].name.toLowerCase()} à ${Math.round(span(c, src))} cases`;
}
// What a net carries, read in words: where its message comes from, what it asks, its stores and who listens.
export function netSummary(c) {
  const net = netOf(c), id = key(c.x, c.y);
  if (!net) return L('Ce réseau ne porte rien : nerf en chantier ou coupé.');
  const ends = new Set(netWires(id).flatMap(w => [w.a, w.b])), cells = [...ends].map(k => G.cells[k]).filter(Boolean);
  const tally = types => cells.filter(o => types.includes(o.type)).length;
  const tint = netWires(id)[0]?.color || 0;
  const sources = [net.turrets && L`${net.turrets} arme(s)`, net.radars && L`${net.radars} radar(s)`, net.core && L('le cœur'), net.desk && L('un pupitre')].filter(Boolean).join(', ') || L('aucune');
  const asks = net.list.length ? net.list.map(gene => net.count?.[gene] ? `${gene} (${net.count[gene]})` : gene).join(', ') : L('rien');
  const listen = [['ligase', L('Ligase')], ['join', L('assembleur')], ['pack', L('encapsuleur')], ['sort', L('trieur')], ['gate', L('feu')], ['screen', L('écran')]]
    .map(([type, name]) => tally([type]) && `${tally([type])} ${name}`).filter(Boolean).join(', ') || L('personne');
  const level = net.stores ? L`${net.stores} stock(s), ${net.full ? L('plein') : L('sous le seuil')}` : L('aucun stock');
  return L`Réseau ${NERVE_COLORS[tint].name}. Sources : ${sources}. Demande : ${asks}, en tête ${net.focus || L('rien')}. Priorité : ${DESK_NAMES[net.mode || 'most']}. ${level}. Écoutent : ${listen}.`;
}
export function wireUp(a, b) {
  const ok = c => c && NERVE.ends.includes(c.type);
  if (!ok(a) || !ok(b) || a === b) return refuse(L('Un nerf relie deux éléments parmi tourelles, radars, relais, feux, trieurs, Ligases, assembleurs, encapsuleurs, écrans, pupitres, kystes et le cœur.'));
  if (span(a, b) > NERVE.reach) return refuse(L`Trop loin : ${Math.ceil(span(a, b))} cases, 24 au plus. Pose un relais entre les deux.`);
  const ka = key(a.x, a.y), kb = key(b.x, b.y);
  if (G.wires.some(w => (w.a === ka && w.b === kb) || (w.a === kb && w.b === ka))) return refuse(L('Ils sont déjà reliés.'));
  const tint = [...netWires(ka), ...netWires(kb)][0]?.color || 0;
  G.wires.push({a:ka, b:kb, hp:NERVE.hp, left:.4 + span(a, b) / 16, order:G.seq = (G.seq || 0) + 1, color:tint});
  say(L('Nerf en chantier. Touche le feu ou le trieur pour choisir ce qu’il lit : gène entier, position 1, 2 ou 3.'));
  return true;
}
// Where to draw a creature: in flight, between two ticks, for the throw is too quick for 20 steps a second.
export function creatureAt(e) {
  if (!e.fly) return e;
  const f = e.fly, k = Math.min(1, f.t + owed / NEST.throw);
  return {...e, x:f.x + (f.tx - f.x) * k, y:f.y + (f.ty - f.y) * k, z:Math.sin(Math.PI * k) * 1.6};
}

// Diagnosis: light the links that explain the selected machine's speed.
export function feeders(c, wanted) {
  const found = [];
  for (const edge of edgesOf(c)) {
    const side = edge.dir;
    if (wanted != null && side !== wanted) continue;
    const from = ahead(edge, side);
    if (!from) continue;
    const dir = (side + 2) % 4;
    const emits = (drains(from) && !(from.type === 'pump' && c.type === 'pump') && !(isBelt(c) && c.dir === (dir + 2) % 4)) || (from.type === 'bridge' && wayOf(from, dir % 2) === dir) || (from.type === 'sort' && (dir === from.dir || dir === sideExit(from))) || (isSplit(from) ? splitExits(from).includes(dir) : 'belt gate mine ligase join pack cyst vault'.split(' ').includes(from.type) && from.dir === dir);
    if (emits && connects(c, dir)) found.push({c:from, dir});
  }
  return found;
}
export function upstream(c, side) {
  const path = [], seen = new Set();
  let links = feeders(c, side);
  while (links.length) {
    const {c:from, dir} = links[0], id = key(from.x, from.y) + dir;
    if (seen.has(id)) break;
    seen.add(id); path.push(from);
    if (hasTrait(from.type, 'lineEnd')) break;
    if (from.type === 'pump') {
      const back = pumps().find(p => p.to === key(from.x, from.y));
      links = back ? [{c:back, dir}] : feeders(from);
      continue;
    }
    links = feeders(from, hasTrait(from.type, 'fork') ? ((from.type === 'bridge' ? dir : from.dir) + 2) % 4 : null);
  }
  return path;
}
// An encapsulator working for nothing: its box is one the core does not ask for this gene while another box is,
// or a second gene waits at its door until a box of the first one is full. Said on the map and in its sheet.
const BOXES_ASKED = {A:L('chargeurs'), T:L('capsules'), H:L('capsules lourdes')};
export function packWarning(c) {
  if (c?.type !== 'pack' || !built(c)) return null;
  const [goods] = c.ports, from = feeders(c, (c.dir + 2) % 4)[0]?.c, waiting = from && liftable(from)[0];
  const gene = goods[0] || (c.last ? contentOf(c.last) : null) || (waiting && !boxOf(waiting) ? waiting : null);
  if (gene) {
    const open = (G.goals || []).filter(g => g.fed < g.count).map(g => g.item);
    const other = Object.keys(BOX).find(box => box !== c.box && open.includes(`${box}:${gene}`));
    if (other && !open.includes(`${c.box}:${gene}`)) return L`Le cœur demande des ${BOXES_ASKED[other]} de ${gene} : passe en ${BOX[other].name.toLowerCase()}.`;
  }
  if (goods.length && waiting && !boxOf(waiting) && waiting !== goods[0] && !packTakes(c, waiting, 0))
    return L`${goods[0]} dans la boîte, ${waiting} attend dehors : vide-la pour changer de gène.`;
  return null;
}
export function diagnose(c) {
  mainSet.chain([]);
  if (c.out != null) {
    const name = TYPES[c.type].name, waits = paused ? L(', en attente de la reprise') : '';
    if (c.cut) return L`${name} en démontage : ${Math.max(0, c.out).toFixed(1).replace('.', DEC)} s de jeu${waits}.${refund(c) ? L` +${refund(c)} ADN à la fin.` : ''}`;
    const id = jobId({order:c.outOrder, field:'out'}), drone = G.drones.find(d => d.job === id);
    return L`${name} à démonter : ${drone ? L('un drone arrive') : L`en file, ${sites().findIndex(job => jobId(job) === id) + 1}e${waits}`}. Il fonctionne jusqu’à ce que le drone commence.`;
  }
  if (!built(c)) {
    const place = sites().findIndex(job => job.c === c && job.field === 'left');
    const drone = G.drones.find(d => d.job === jobId({order:c.order, field:'left'}));
    if (drone) {
      const away = Math.hypot(drone.x - c.x - .5, drone.y - c.y - .5);
      if (away > DRONE.reach + 1e-6) return L`${TYPES[c.type].name} : drone en route, à ${Math.ceil(away)} cases. Le chantier commence quand il arrive.`;
    }
    return place < G.drones.length ? L`${TYPES[c.type].name} en chantier : ${c.left.toFixed(1).replace('.', DEC)} s de jeu${paused ? L(', en attente de la reprise') : ''}.` : L`${TYPES[c.type].name} en attente, position ${place - BUILDERS + 1} dans la file. Trois drones, un par chantier, dans l’ordre de pose.`;
  }
  if (c.type === 'gate' && c.when && c.when !== 'gene' && netOf(c)) {
    const kept = gateStore(c), state = gateOpen(c) ? L('vert, ça passe') : gateCondition(c) ? L('rouge, son lot est passé') : L('rouge, la ligne attend');
    const watching = WATCHES.includes(c.when) ? (kept ? L` Il écoute le ${TYPES[kept.store.type].name.toLowerCase()} à ${Math.round(span(c, kept.store))} cases : ${kept.at} / ${kept.cap}, plein à ${kept.full}.` : L(' Aucun kyste relié à son réseau : relie-en un pour qu’il ait un stock à regarder.')) : '';
    const batch = c.batch ? L` Lot : ${c.passed || 0} / ${c.batch} passés.` : '';
    return L`Feu, s’ouvre sur ${WHEN[c.when].name} : ${state}.${watching}${batch}`;
  }
  if (c.type === 'desk') return L`Pupitre : le réseau demande ${DESK_NAMES[c.mode || 'most']}${c.mode === 'hand' ? L` (${c.gene || L('aucun gène fixé')})` : ''}.${netOf(c) ? '' : L(' Relie-le à un nerf.')}`;
  if ((c.type === 'gate' || c.type === 'sort') && G.wires.some(w => w.a === key(c.x, c.y) || w.b === key(c.x, c.y))) {
    const what = c.read ? L`la position ${c.read}` : L('le gène entier'), name = TYPES[c.type].name;
    const spare = c.type === 'gate' ? (c.open ? 'vert' : 'rouge') : L`filtre ${c.want === '?' ? 'tout' : c.want}`;
    if (!listens(c)) return L`${name} : nerf en chantier, coupé ou sans tourelle. Réglage manuel appliqué : ${spare}.`;
    const net = heardOf(c);
    if (!net.focus) return L`${name}, lit ${what} : rien n’est demandé, ${c.type === 'gate' ? L('il reste rouge') : L('tout va tout droit')}.`;
    const now = c.read ? L`${named(net.focus[c.read - 1])}, position ${c.read} de ${net.focus}` : net.list.join(', ');
    return L`${name}, lit ${what} : ${now}. ${c.type === 'gate' ? L('Le reste attend derrière.') : c.read ? L('Le reste, et le trop-plein, continue tout droit.') : L('Le reste continue tout droit.')}`;
  }
  if (c.type === 'gate') return c.open ? L('Feu vert : ça passe. Touche-le pour couper la ligne.') : L('Feu rouge : la ligne attend derrière. Touche-le pour rouvrir.');
  if (c.type === 'core') {
    const want = STAGES[G.stage];
    if (!want) return L`Organisme au stade ${STAGES.length}, ${G.kills} créatures tuées. Tout ce que tu livres devient de l’ADN.`;
    if (G.goals && G.goals.length > 1) return L`Il veut : ${G.goals.map(g => `${recipe(g.item)} ${Math.floor(g.fed)}/${g.count}`).join(', ')}. En échange : ${want.gives}. Les autres gènes deviennent de l’ADN.`;
    const how = want.rate ? L`${want.rate} par seconde pendant ${want.hold} s, il faut deux lignes en parallèle` : L`${want.count} au total`;
    const carbon = BOX[boxOf(want.item)]?.carbon, isotope = BOX[boxOf(want.item)]?.isotope;
    const pack = carbon ? L` Ça sort d’un Encapsuleur réglé sur ${BOX[boxOf(want.item)].name} : ${fill(boxOf(want.item))} derrière, ${carbon} carbone${carbon > 1 ? 's' : ''}${isotope ? L` et ${isotope} isotope` : ''} sur le côté. Le carbone est juste à l’est du cœur${isotope ? L(', l’isotope loin dehors, au niveau 3') : ''}.` : '';
    return L`Il veut ${recipe(want.item)} : ${how}. Entrées 1, 2, 3 dans cet ordre.${pack} En échange : ${want.gives}. Les autres gènes deviennent de l’ADN.`;
  }
  if (isGun(c)) {
    const gun = GUNS[c.type], name = TYPES[c.type].name;
    const load = Object.entries(c.ammo).filter(([, n]) => n).map(([g, n]) => `${n} ${g}`).join(', ');
    mainSet.chain(upstream(c));
    const net = netOf(c);
    if (net) return L`${name} sur nerf, demande : ${net.list.join(', ') || L('rien, personne à portée')}. En stock : ${load || 'rien'}.`;
    return load ? L`${name} : ${load}. 3, 2, 1 ou 0 bases justes : ${[12, 5, 2, 1].map(n => n * gun.power).slice(0, 3).join(', ')} ou ${gun.power} dégâts${gun.volley > 1 ? L(', deux coups à la fois') : ''}, à ${String(gun.range).replace('.', DEC)} cases. ${c.strict ? L('Économe, elle ne tire qu’à 2 justes ou plus.') : L('Elle tire sur tout.')}` : name + L(' : rien à tirer. Amène-lui des gènes de trois bases.');
  }
  if (c.type === 'cyst') { mainSet.chain(upstream(c)); return L`Kyste : ${c.stock.length} sur ${capOf(c)} objets.`; }
  if (c.type === 'vault') { mainSet.chain(upstream(c)); return L`Grand kyste : ${c.stock.length} sur ${capOf(c)} objets.`; }
  if (c.type === 'borer') {
    const figure = n => n.toFixed(1).replace('.', DEC), per = figure(c.made.length / Math.max(1, Math.min(10, G.time)));
    const rich = richUnder(c), later = rich > richCap() ? L` Ce gisement est ×${rich}, exploitable ainsi au stade ${rich === 2 ? 3 : 4}.` : '';
    const fastest = Math.max(BELT_SPEED, ...edgesOf(c).map(door => mouthPace(door, door.dir))), belts = Math.ceil(perSecond(c) / fastest - 1e-6);
    const full = c.stock.length >= BORER.hold ? L` Il déborde : il lui faut ${belts} tapis MK${fastest / BELT_SPEED}, 8 bords au plus.` : '';
    return L`Grand récolteur de ${named(matterUnder(c))} : ${per} sur ${figure(perSecond(c))}/s.${full}${later}`;
  }
  if (c.type === 'sort') {
    const left = c.side === 3 ? L('à gauche') : L('à droite'), what = {1:L('les bases'), 3:L('les gènes'), 6:L('les brins')}[c.want.length];
    let state = L`Trieur : ${what}${c.want === '?' ? '' : ` ${c.want}`} sortent ${left}, le reste va tout droit.`;
    if (c.item && c.t >= .999) {
      const dir = exitOf(c), to = ahead(c, dir);
      if (!to || !accepts(to, c.item, dir)) state = L`Trieur bloqué : ${itemName(c.item)} doit sortir ${dir === c.dir ? L('tout droit') : left}, et cette sortie est fermée ou pleine.`;
      if (to) mainSet.chain([to]);
    }
    return state;
  }
  if (c.type === 'bridge') {
    for (const lane of c.lanes) {
      if (!lane || lane.t < .999) continue;
      const to = ahead(c, lane.dir);
      if (to && accepts(to, lane.item, lane.dir)) continue;
      if (to) mainSet.chain([to]);
      return L`Pont bloqué vers ${[L('le haut'),L('la droite'),L('le bas'),L('la gauche')][lane.dir]} : sortie absente, à contresens ou pleine.`;
    }
    return L('Pont : deux voies indépendantes. Auto suit les tapis voisins, sinon le sens choisi est imposé.');
  }
  if (c.type === 'pocket') {
    const kind = c.stock[0], what = kind ? itemName(kind) : L('vide');
    if (!touchesTrack(c)) return L('Poche sans piste : elle doit toucher une piste.');
    return L`Poche qui ${c.unload ? L('vide le ver et sort sur ses côtés libres') : L('charge le ver')}, ${what} : ${c.stock.length} sur ${pocketCap(c)}. Une seule matière par poche, 16/s.`;
  }
  if (c.type === 'pump') {
    const kind = veinKind(c), what = kind ? itemName(kind) : L('vide');
    const head = L`Pompe, ${what} : ${c.stock.length} sur ${VEIN.cap}.`;
    for (const side of [0,1,2,3]) {
      const from = ahead(c, side);
      if (kind && from && isBelt(from) && from.dir === (side + 2) % 4 && from.item && from.item !== kind) {
        mainSet.chain([from]);
        return L`${head} Une autre matière attend : une veine n’en porte qu’une. Trie avant, ou vide la veine.`;
      }
    }
    if (c.to) {
      const to = G.cells[c.to];
      if (!to) return L`${head} La pompe d’arrivée est détruite.`;
      if (c.veinHp <= 0) return L`${head} Veine rompue, plus rien ne passe.`;
      mainSet.chain([to]);
      if (leaking(c)) return L`${head} Veine percée : 7/s, et elle attire les créatures.`;
      return `${head} ${to.stock.length >= VEIN.cap - 3 ? L('La pompe d’arrivée est pleine : branche plus de tapis en sortie.') : L('Pousse jusqu’à 16/s.')}`;
    }
    return L`${head} Sans veine au départ, elle se vide sur ses quatre côtés, au rythme de chaque tapis.`;
  }
  if (c.type === 'pack') {
    const warning = packWarning(c);
    if (warning) return L`${TYPES.pack.name} : ${warning}`;
    const [goods, carbon] = c.ports, box = BOX[c.box];
    const head = L`Encapsuleur, ${box.name.toLowerCase()}${goods.length ? ' de ' + goods[0] : ''} : ${Math.min(goods.length, fill(c.box))} sur ${fill(c.box)}${box.isotope ? L`, isotope ${carbon.filter(k => k === 'I').length} sur ${box.isotope}` : ''}, carbone ${Math.min(carbon.length, box.carbon)} sur ${box.carbon}.`;
    if (c.item && !(ahead(c) && accepts(ahead(c), c.item, c.dir))) {
      if (ahead(c)) mainSet.chain([ahead(c)]);
      return L`${head} Sa sortie est fermée ou pleine${boxOf(c.item) === 'A' ? L(' : un chargeur va dans une tourelle') : ''}.`;
    }
    for (const [lacks, side, what] of [[goods.length < fill(c.box), (c.dir + 2) % 4, L('les gènes')], [carbon.length < box.carbon, carbonSide(c), L('le carbone')]]) {
      if (!lacks) continue;
      const from = feeders(c, side)[0];
      if (!from) return L`${head} Branche ${what} ${what === L('le carbone') ? (c.flip ? L('à droite') : L('à gauche')) : L('derrière')}.`;
      const waiting = from.c.item;
      if (what === L('les gènes') && waiting && !packTakes(c, waiting, 0)) {
        mainSet.chain([from.c]);
        return L`${head} ${itemName(waiting)} attend dehors : ${goods.length ? L`la boîte se remplit de ${goods[0]}, vide-la pour changer` : c.box === 'A' ? L('un chargeur ne prend que des gènes de 3 bases') : L('il faut un gène ou un brin en vrac')}.`;
      }
    }
    return L`${head} Il tourne.`;
  }
  if (c.type === 'join') {
    const per = (c.made.length / Math.max(1, Math.min(10, G.time))).toFixed(1).replace('.', DEC);
    const head = L`Assembleur${c.last ? ' ' + recipe(c.last) : ''} : ${per} sur 1,0/s.`;
    if (c.item && !(ahead(c) && accepts(ahead(c), c.item, c.dir))) {
      if (ahead(c)) mainSet.chain([ahead(c)]);
      return L`${head} Sa sortie est fermée ou pleine.`;
    }
    const empty = [0, 1].find(port => !c.ports[port].length);
    if (empty != null) {
      const side = joinSide(c, empty);
      if (!feeders(c, side).length) return L`${head} L’entrée ${empty + 1} n’est pas branchée : le gène 1 arrive à gauche, le 2 à droite.`;
      if (c.clock >= .999) { mainSet.chain(upstream(c, side)); return L`${head} L’entrée ${empty + 1} manque de gènes : suis la ligne rouge.`; }
    }
    return L`${head} Elle tourne.`.replace(L('Elle tourne'), L('Il tourne'));
  }
  if (c.type !== 'mine' && c.type !== 'ligase') return TYPES[c.type].help;

  const per = (c.made.length / Math.max(1, Math.min(10, G.time))).toFixed(1).replace('.', DEC);
  const entries = c.type === 'ligase' ? L(' Entrées : ') + c.ports.map((p, i) => `${i + 1} ${p.length ? named(p[0]) : L('vide')}`).join(', ') + '.' : '';
  const head = L`${c.type === 'mine' ? L('Récolteur de ') + named(matterUnder(c)) : L('Ligase') + (c.last ? ' ' + geneName(c.last) : '')} : ${per} sur ${perSecond(c).toFixed(1).replace('.', DEC)}/s.${entries}${c.type === 'mine' && richUnder(c) > richCap() ? L` Ce gisement est ×${richUnder(c)}, exploitable ainsi au stade ${richUnder(c) === 2 ? 2 : 3}.` : ''}`;
  if (c.item && !(ahead(c) && accepts(ahead(c), c.item, c.dir))) {
    let to = c, dir = c.dir;
    for (let i = 0; i < W * H; i++) {
      to = ahead(to, dir);
      if (!to || chain.includes(to)) break;
      chain.push(to);
      if (to.type === 'gate' && listens(to) && !(to.when && to.when !== 'gene' ? gateOpen(to) : asked(to, c.item))) return L`${head} Un feu intelligent attend autre chose que ${itemName(c.item)}.`;
      if (to.type === 'gate' && !listens(to) && !to.open) return L`${head} Arrêt au feu rouge : touche-le pour rouvrir.`;
      if (isBelt(to)) dir = to.dir; else if (to.type !== 'bridge') break;
    }
    return L`${head} Sortie bloquée : ${to ? L('suis la ligne rouge, le bout refuse ou est plein.') : L('la ligne ne mène nulle part.')}`;
  }
  if (c.type === 'ligase') {
    const empty = c.ports.findIndex(p => !p.length);
    if (empty >= 0) {
      const side = portSide(c, empty);
      if (!feeders(c, side).length) return L`${head} L’entrée ${empty + 1} n’est pas branchée.`;
      mainSet.chain(upstream(c, side));
      if (c.clock >= .999) return L`${head} L’entrée ${empty + 1} manque de matière : ${chain.some(p => p.type === 'gate' && (listens(p) ? !gateGreen(p) : !p.open)) ? L('un feu rouge coupe sa ligne') : L('suis la ligne rouge')}.`;
      mainSet.chain([]);
    }
  }
  return L`${head} Elle tourne.`;
}

// The bindings other modules replace.
export const actionsSet = {
  // @ts-expect-error: a function rebound in place, as a test's stub or the timing probes do
  known: (v) => (known = v)
};
