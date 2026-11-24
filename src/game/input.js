// Tools, placing and dismantling, line drawing and the pointer.
import { perSecond, BASE, BOX, DESK, DX, DY, G, GUNS, NERVE, NET, PACK, PRICE, RANKS, REPAIR, STAGES, TYPES, VEIN, WHEN, WORM, ahead, allCells, bearing, boxOf, built, buried, capOf, carbonSide, cell, cellAt, contentOf, depositAt, dropRise, dropWorm, edgesOf, fill, footprint, forgetCells, fullHp, hasTrait, healing, heardOf, isBelt, isBig, isGun, joinSide, key, liftable, mealRate, netOf, network, opposite, outSide, owned, pumps, rankCost, rankOf, reachOf, refund, remove, richAt, sense, setRecipe, sideExit, sites, sizeOf, span, splitExits, trackAfter, trackSize, unlocked, wake, wayOf } from "../sim/sim.ts";
import { DEC, L } from "../sim/text.ts";
import { breachesIn, build, diagnose, incubate, itemName, keepIt, keepVein, known, layTrack, link, netSummary, netWires, portSide, raise, rowOf, scrap, scrapVein, setHeading, siteFor, sourceName, wireUp } from "./actions.js";
import { playSound } from "./audio.js";
import { markOf, openFamily, paintHud, paintInfo, paintRanks, refuse, replay } from "./hud.js";
import { $, handRank, KEYS, keyName, BATCHES, CURSORS, DESK_NAMES, FAMILY_OF, HOLD_MS, ICONS, JOKER, MATTER, NARROW, NEEDS, NERVE_COLORS, PREVIEW, RANK_NEED, SHAPE, STILL, TURN, WAYS, cam, canRise, canvas, chain, costInHand, crossing, cursor, drag, flat, freshOn, gesture, heading, holdsAnything, hovered, inHand, inside, isSource, levelOf, linking, listening, mainSet, named, note, paused, piecesOf, placeable, playNear, pointers, price, rankOpen, ruinAt, selected, tabbed, tileAt, tileKey, tool, trackAt, ui, upCost, view, view3d, whyNot, wiring, wormId } from "./main.js";
import { arrow, circle, drawCell, glyph, polygon, rect, worldAt } from "./render.js";

export function geneMark(gene) {
  if (!/^([SFCN]{3}){1,2}$/.test(gene)) return '';
  return `<span class="gene" role="img" aria-label="${[...gene].map(b => BASE[b]).join(', ')}">${[...gene].map((b, i) => `${i === 3 ? '<i class="cut"></i>' : ''}<svg viewBox="0 0 18 18">${SHAPE[b]}</svg>`).join('')}</span>`;
}
// The code stays in the text for copying and for what reads it, hidden behind its drawing.
export function write(el, text) {
  if (el.textContent === text) return;
  el.replaceChildren(...piecesOf(text).map(({part, code}) => {
    if (!code) return document.createTextNode(part);
    const mark = document.createElement('span'), letters = document.createElement('span');
    mark.className = 'gene inline';
    mark.setAttribute('role', 'img');
    mark.setAttribute('aria-label', [...part].map(base => MATTER[base] || L('n’importe laquelle')).join(', '));
    mark.innerHTML = [...part].map((base, i) => `${i === 3 ? '<i class="cut"></i>' : ''}${markOf(base) || JOKER}`).join('');
    letters.hidden = true; letters.textContent = part;
    mark.append(letters);
    return mark;
  }));
}
export function sentenceWidth(g, text) {
  return piecesOf(text).reduce((wide, {part, code}) => wide + (code ? part.length * 14 + 2 : g.measureText(part).width), 0);
}
// From the left, y in the middle of the line.
export function drawSentence(g, text, x, y) {
  const color = g.fillStyle;
  g.textAlign = 'left'; g.textBaseline = 'middle';
  for (const {part, code} of piecesOf(text)) {
    g.fillStyle = color;
    if (!code) { g.fillText(part, x, y); x += g.measureText(part).width; continue; }
    [...part].forEach((base, i) => {
      if (base === '?') circle(g, x + 7 + i * 14, y, 5, null, '#A9BDB8', 1.5);
      else glyph(g, base, x + 7 + i * 14, y, 6);
    });
    x += part.length * 14 + 2;
  }
}
export function say(text) { mainSet.note(text); ui.saidAt = performance.now(); write($('message'), text); }
export function button(text, action) {
  const b = document.createElement('button'), icon = document.createElement('span');
  icon.className = 'icon'; icon.setAttribute('aria-hidden', 'true');
  // @ts-expect-error: loose typing, tightened module by module (item_007)
  icon.innerHTML = `<svg viewBox="0 0 18 18">${ICONS.find(([sign]) => sign.test(text))[1]}</svg>`;
  b.append(icon, document.createTextNode(text));
  if (/^(Démonter|Retirer)/.test(text)) b.classList.add('danger');
  b.onclick = () => {
    action(); refresh();
    const again = [...$('actions').querySelectorAll('button')].find(o => !o.classList.contains('slot') && o.textContent.split(' :')[0] === text.split(' :')[0]);
    if (!again) return;
    if (again.textContent !== text) again.classList.add('flip');
    // Rebuilt petals would drop who walks them with Tab.
    if (tabbed) again.focus();
  };
  $('actions').append(b);
  return b;
}
// Auto, then one way, then the other. From auto, the first tap reverses what was guessed.
export function turnWay(c, axis) {
  c.ways ||= [null, null];
  const guess = wayOf({...c, ways:null}, axis) ?? axis + 2, first = (guess + 2) % 4, set = c.ways[axis];
  c.ways[axis] = set == null ? first : set === first ? guess : null;
  // What is already on the lane follows the new way.
  if (c.ways[axis] != null && c.lanes[axis]) c.lanes[axis].dir = c.ways[axis];
}
export function emptyOut(c) {
  c.item = null; c.t = 0;
  if (c.stock) { c.stock = []; c.due = []; }
  if (c.ports) { c.ports = c.ports.map(() => []); c.portDue = c.ports.map(() => []); }
  if (c.ammo) c.ammo = {};
  if (c.lanes) c.lanes = c.lanes.map(() => null);
  if (c.packets) c.packets = [];
  if (c.outs) c.outs = [null, null, null];
}
const fmtRate = n => String(Math.round(n * 10) / 10).replace('.', DEC);
// Mirrors a machine left for right, from its sheet or the key: false for a piece that has no sides to swap.
export function mirror(c) {
  if (c.type === 'ligase') { c.flip = !c.flip; c.ports.reverse(); c.portDue?.reverse(); c.last = [...c.last].reverse().join(''); }
  else if (c.type === 'join') {
    c.flip = !c.flip; c.ports = [c.ports[1], c.ports[0], []];
    if (c.portDue) c.portDue = [c.portDue[1], c.portDue[0], []];
    c.last = c.last ? c.last.slice(3) + c.last.slice(0, 3) : '';
  } else if (c.type === 'pack' || c.type === 'unbind' || c.type === 'unjoin') c.flip = !c.flip;
  else return false;
  return true;
}
export function showActions() {
  ui.at = '';
  $('actions').replaceChildren();
  const c = selected && G.cells[selected];
  const w = pickedWorm();
  if (!c && w) {
    button(L`Départ : ${{auto:'auto', full:L('plein ou vide'), timer:'5 s'}[w.rule]}`, () => { w.rule = {auto:'full', full:'timer', timer:'auto'}[w.rule]; showActions(); });
    if (w.docked) button(L('Partir'), () => { w.docked = false; w.t = 0; });
    button(L('Vider'), () => { for (const h of w.holds) { h.n = 0; h.kind = ''; } });
    if (w.out != null) button(L('Annuler le retrait'), () => { keepIt(w); showActions(); });
    else button(L('Retirer'), () => { scrap(w, () => { dropWorm(w, true); mainSet.wormId(null); }); showActions(); });
    return;
  }
  if (!c) {
    if (!hasTrait(tool, 'aimless'))
      button(L`Sens : ${WAYS[heading]}`, () => { setHeading((heading + 1) % 4); showActions(); });
    return;
  }
  if (c.type === 'core') {
    return;
  }
  // Each action names its key, so the keys are learnt where they act.
  if (hasTrait(c.type, 'turn')) button(L`Tourner (${keyName(KEYS.rotate)})`, () => { c.dir = (c.dir + 1) % 4; if (tool === c.type) setHeading(c.dir); });
  if (c.type !== 'core' && $('tools').querySelector(`[data-type="${c.type}"]`)) button(L`En prendre un autre (${keyName(KEYS.pick)})`, () => {
    if (RANKS[c.type]) handRank[c.type] = rankOf(c);
    choose(c.type);
    if (hasTrait(c.type, 'turn')) setHeading(c.dir);
  });
  if (c.type === 'ligase') button(L`Inverser 1↔3 (${keyName(KEYS.mirror)})`, () => mirror(c));
  if (c.type === 'bridge') [0, 1].forEach(axis => {
    const set = c.ways?.[axis] ?? null, name = axis ? 'Voie ↔' : 'Voie ↕';
    button(`${name} : ${set == null ? 'auto' : ['↑','→','↓','←'][set]}`, () => { turnWay(c, axis); showActions(); });
  });
  if (c.type === 'pump') {
    button(L('Tirer une veine'), () => { mainSet.linking(key(c.x, c.y)); say(L('Touche la pompe d’arrivée, ou un sol libre pour en poser une. 24 cases au plus.')); const hint = note; select(null); say(hint); });
    if (c.to) button(c.veinOut != null ? L('Annuler la coupe') : L('Couper la veine'), () => { if (c.veinOut != null) keepVein(c); else scrapVein(c); showActions(); });
    button(L('Vider'), () => { for (const p of network(c)) { p.stock = []; p.packets = []; } });
  }
  // Any machine holding something can be emptied; pumps and encapsulators keep their own, which empty more.
  // Offered as long as the machine can hold something, emptied or not: a player empties again.
  if (!hasTrait(c.type, 'ownEmpty') && (holdsAnything(c) || c.ports || c.stock || hasTrait(c.type, 'single'))) button(L('Vider'), () => { emptyOut(c); refresh(); showActions(); });
  if (c.type === 'desk') {
    button(L`Priorité : ${DESK_NAMES[c.mode || 'most']}`, () => { c.mode = DESK.modes[(DESK.modes.indexOf(c.mode || 'most') + 1) % DESK.modes.length]; sense(); showActions(); });
    if (c.mode === 'hand') {
      const genes = [...new Set(G.families.map(opposite))];
      button(c.gene ? L`Gène fixé : ${c.gene}` : L('Gène fixé : aucun'), () => { c.gene = genes[(genes.indexOf(c.gene) + 1) % genes.length]; sense(); showActions(); });
    }
  }
  if (c.type === 'pocket') button(c.unload ? L('Poche : vide') : L('Poche : charge'), () => { c.unload = !c.unload; showActions(); });
  if (c.type === 'pack') {
    button(L`Recette : ${BOX[c.box].name}`, () => { const order = unlocked(4) ? ['T', 'A', 'H'] : ['T', 'A']; setRecipe(c, order[(order.indexOf(c.box) + 1) % order.length]); showActions(); });
    button(L`Carbone : ${c.flip ? L('à droite') : L('à gauche')} (${keyName(KEYS.mirror)})`, () => { mirror(c); showActions(); });
    button(L('Vider'), () => { c.ports = [[], [], []]; c.item = null; c.last = ''; });
  }
  // Mirrored, the left output goes right and the right one left.
  if (c.type === 'unbind' || c.type === 'unjoin') button(L`Inverser gauche↔droite (${keyName(KEYS.mirror)})`, () => mirror(c));
  if (c.type === 'join') button(L`Inverser 1↔2 (${keyName(KEYS.mirror)})`, () => mirror(c));
  if (c.type === 'radar') {
    const modes = ['creatures', 'nests', 'both'], names = {creatures:L('Détecte : créatures'), nests:L('Détecte : nids'), both:L('Détecte : nids et créatures')};
    button(names[c.watch || 'creatures'], () => { c.watch = modes[(modes.indexOf(c.watch || 'creatures') + 1) % modes.length]; showActions(); });
  }
  if (c.type === 'arm') {
    const seen = [...new Set(liftable(ahead(c, (c.dir + 2) % 4)).map(contentOf))], order = ['', ...new Set([c.pick || '', ...seen].filter(Boolean))];
    button(c.pick ? L`Ne prend que ${c.pick}` : L('Prend tout'), () => { c.pick = order[(order.indexOf(c.pick || '') + 1) % order.length]; showActions(); });
  }
  if (isGun(c)) button(c.strict ? L('Tir : 2 justes min.') : L('Tir : sur tout'), () => { c.strict = !c.strict; showActions(); });
  if (c.type === 'sort') {
    const change = work => () => { work(); showActions(); };
    button(c.side === 3 ? L('Sort à gauche') : L('Sort à droite'), change(() => { c.side = c.side === 3 ? 1 : 3; }));
    // On a nerve the manual filter is only the fallback: its controls would cover the board on a phone.
    const onNerve = G.wires.some(w => w.a === key(c.x,c.y) || w.b === key(c.x,c.y));
    if (!onNerve) {
    button({1:L('Base'), 3:L('Gène'), 6:L('Brin')}[c.want.length], change(() => { c.want = c.want.length === 1 ? (c.want === 'K' ? '?' : c.want) + '??' : c.want.length === 3 && unlocked(2) ? c.want + '???' : c.want[0]; }));
    const row = document.createElement('span');
    row.className = 'slots';
    [...c.want].forEach((base, i) => {
      const b = button('?', change(() => {
        const order = c.want.length === 1 ? (unlocked(4) ? 'SFCNKI?' : 'SFCNK?') : 'SFCN?';
        c.want = c.want.slice(0, i) + order[(order.indexOf(base) + 1) % order.length] + c.want.slice(i + 1);
      }));
      b.classList.add('slot');
      b.setAttribute('aria-label', L`Filtre, position ${i + 1} : ${MATTER[base] || 'joker'}. Toucher pour changer.`);
      b.innerHTML = SHAPE[base] ? `<svg viewBox="0 0 18 18" width="20" height="20">${SHAPE[base]}</svg>` : JOKER.replace('<svg', '<svg width="20" height="20"');
      row.append(b);
    });
    $('actions').append(row);
      button(L('= dernier passé'), change(() => { if (c.seen) c.want = c.seen; else refuse(L('Rien n’est encore passé dans ce trieur.')); })).disabled = !c.seen;
    }
  }
  if (NERVE.ends.includes(c.type) && G.wires.some(w => w.a === key(c.x,c.y) || w.b === key(c.x,c.y))) {
    if (c.type === 'gate') {
      const order = Object.keys(WHEN);
      button(L`S’ouvre sur : ${WHEN[c.when || 'gene'].name}`, () => { c.when = order[(order.indexOf(c.when || 'gene') + 1) % order.length]; c.passed = 0; sense(); showActions(); });
      if (c.when && c.when !== 'gene') button(c.batch ? L`Lot : ${c.batch} à chaque ouverture` : L('Lot : sans limite'), () => { c.batch = BATCHES[(BATCHES.indexOf(c.batch || 0) + 1) % BATCHES.length]; c.passed = 0; showActions(); });
    }
    if (hasTrait(c.type, 'listen') && !(c.type === 'gate' && c.when && c.when !== 'gene')) {
      button(c.read ? L`Lit : position ${c.read}` : L('Lit : gène entier'), () => { c.read = ((c.read || 0) + 1) % ((heardOf(c)?.focus?.length || 3) > 3 ? 7 : 4); showActions(); });
    }
    if (c.type === 'gate') button(L`Si coupé : ${c.open ? 'vert' : 'rouge'}`, () => { c.open = !c.open; showActions(); });
    if (c.type === 'cyst' || c.type === 'vault') button(L`Plein à : ${Math.ceil(capOf(c) * (c.level ?? .5))} / ${capOf(c)}`, () => { c.level = [.25, .5, .75, 1][([.25, .5, .75, 1].indexOf(c.level ?? .5) + 1) % 4]; sense(); showActions(); });
    if (hasTrait(c.type, 'listen')) {
      const src = c.source && G.cells[c.source];
      button(L`Écoute : ${sourceName(c, src)}. Changer`, () => {
        mainSet.listening(key(c.x, c.y)); select(null);
        say(L('Touche ce que cet élément doit écouter sur son réseau : une arme, un radar, le cœur, un kyste ou un pupitre. Touche-le lui-même pour écouter tout le réseau.'));
      });
    }
    button(L('Lire le réseau'), () => say(netSummary(c)));
    const mine = () => G.wires.filter(w => w.a === key(c.x,c.y) || w.b === key(c.x,c.y));
    const cutting = mine().every(w => w.out != null), net = netWires(key(c.x,c.y)), tint = net[0]?.color || 0;
    button(L`Couleur du réseau : ${NERVE_COLORS[tint].name}`, () => { for (const w of net) w.color = (tint + 1) % NERVE_COLORS.length; showActions(); });
    button(cutting ? L('Garder ses nerfs') : L('Couper ses nerfs'), () => {
      for (const w of mine()) { if (cutting) keepIt(w); else scrap(w, () => { G.wires = G.wires.filter(o => o !== w); }); }
      sense(); showActions();
    });
  }
  if (RANKS[c.type] || c.type === 'gate') {
    if (c.up != null) button(L('Annuler l’amélioration'), () => { dropRise(c); showActions(); });
    else if (RANKS[c.type]) for (const mk of [2, 3]) {
      // What the rank gives, where the machine has a rate: from now to after.
      const gain = perSecond(c) !== perSecond({...c, mk}) ? L` · ${fmtRate(perSecond(c))} → ${fmtRate(perSecond({...c, mk}))}/s` : '';
      if (canRise(c, mk)) button(L`Passer en MK${mk} · ${upCost(c, mk)} ADN${gain}`, () => { raise([c], mk); showActions(); });
      else if (!rankOpen(mk) && rankOf(c) < mk) button(L`MK${mk} : stade ${RANK_NEED[mk - 1] + 1}`, () => refuse(L`Le rang MK${mk} s’ouvre au stade ${RANK_NEED[mk - 1] + 1}.`));
    }
    const row = isBelt(c) ? rowOf(c) : [];
    if (row.length > 1) for (const mk of [2, 3]) {
      const todo = row.filter(o => canRise(o, mk));
      if (todo.length > (todo[0] === c ? 1 : 0)) button(L`Ligne en MK${mk} (${todo.length}) · ${todo.reduce((sum, o) => sum + upCost(o, mk), 0)} ADN`, () => { raise(rowOf(c), mk); showActions(); });
    }
  }
  if (c.type === 'vault') button(L('Vider'), () => { c.stock = []; });
  if (c.type === 'ligase') button(L('Vider'), () => { c.ports = [[],[],[]]; c.item = null; });
  if (c.out != null) button(L('Annuler le démontage'), () => { keepIt(c); showActions(); });
  else button(refund(c) ? L`Démonter +${refund(c)}` : L('Démonter'), () => {
    scrap(c, () => { remove(c.x,c.y); mainSet.selected(null); });
    showActions();
  });
}
export function pickedWorm() { return G.worms.find(w => w.id === wormId); }
export function wormState(w) {
  if (w.out != null) return w.cut ? L`Ver en retrait : ${Math.max(0, w.out).toFixed(1).replace('.', DEC)} s de jeu.` : L('Ver à retirer : un drone le rejoint, il roule en attendant.');
  if (!built(w)) return L`Ver en incubation : ${w.left.toFixed(1).replace('.', DEC)} s de jeu.`;
  const cargo = w.holds.map(h => h.n ? `${h.n} ${itemName(h.kind)}` : L('vide')).join(', ');
  const doing = w.docked ? L('à quai') : w.stuck ? L`arrêté, ${w.stuck}` : L('en route');
  const why = w.docked && w.rule === 'full' ? L(' Il attend que tout soit plein ou vide.') : '';
  return L`Ver ${doing}, de la tête à la queue : ${cargo}.${why} ${Math.ceil(w.hp)} PV sur ${WORM.hp}.`;
}
export function selectWorm(w) {
  mainSet.selected(null); mainSet.chain([]); mainSet.wormId(w.id);
  showActions(); refresh();
}
export function select(id) {
  mainSet.wormId(null);
  mainSet.selected(id); mainSet.chain([]); mainSet.note('');
  showActions(); refresh();
}
export function choose(type) {
  if (type === 'lab' && allCells().some(c => c.type === 'lab')) return refuse(L('Le Laboratoire est unique : il est déjà construit. Touche-le pour ses améliorations.'));
  if (type === 'reaper' && allCells().some(c => c.type === 'reaper')) return refuse(L('Le Recycleur est unique : il est déjà construit.'));
  if (!unlocked(NEEDS[type] || 0)) {
    const want = STAGES[NEEDS[type] - 1];
    return refuse(L`${TYPES[type].name} s’ouvre quand le stade ${NEEDS[type]}, ${want.name}, est achevé. Touche le cœur pour voir ce qu’il réclame.`);
  }
  mainSet.tool(type); mainSet.linking(null); mainSet.wiring(null); mainSet.listening(null); select(null); say(TYPES[type].help);
  if (FAMILY_OF[type]) (ui.lastOf ||= {})[FAMILY_OF[type]] = type;
  for (const b of $('tools').querySelectorAll('[data-type]')) b.setAttribute('aria-pressed', b.dataset.type === type);
  paintRanks();
  // On a phone the fan folds once picked: the ground is needed.
  openFamily(NARROW.matches || !FAMILY_OF[type] ? null : FAMILY_OF[type]);
  paintInfo();
}
export function orderHTML() {
  const want = STAGES[G.stage];
  if (!want) return L('<b>Éclosion réussie</b><span class="unit">mode libre : tout ce que tu livres devient de l’ADN</span>');
  if (G.goals && G.goals.length > 1) {
    // The next recipe to make, and how many others wait: the whole list is in the core's sheet.
    const open = G.goals.filter(g => g.fed < g.count), next = open[0] || G.goals[0], gene = geneMark(contentOf(next.item));
    const more = open.length > 1 ? `<span class="more" title="${L('Toutes les recettes sont dans la fiche du cœur')}">+${open.length - 1}</span>` : '';
    return `<b>${L`Stade ${G.stage + 1} · ${want.name}`}</b><div class="wanted">${boxOf(next.item) ? `<span class="crate">${gene}</span>` : gene}<output>${next.fed} / ${next.count}</output>${more}</div>`;
  }
  const done = want.rate ? `${mealRate().toFixed(1).replace('.', DEC)} / ${want.rate}` : `${G.fed} / ${want.count}`;
  const unit = [boxOf(want.item) ? L`${BOX[boxOf(want.item)].name.toLowerCase()} de ${fill(boxOf(want.item))}` : '', want.rate ? L`gènes/s, tenus ${Math.floor(G.held)} sur ${want.hold} s` : ''].filter(Boolean).join(' · ');
  const gene = geneMark(contentOf(want.item)), asked = boxOf(want.item) ? `<span class="crate">${gene}</span>` : gene;
  return `<b>${L`Stade ${G.stage + 1} · ${want.name}`}</b><div class="wanted">${asked}<output>${done}</output></div>${unit ? `<span class="unit">${unit}</span>` : ''}`;
}
export function stockOf(gene) {
  let n = 0;
  for (const c of allCells()) {
    if (isGun(c)) n += c.ammo[gene] || 0;
    if (hasTrait(c.type, 'reserve')) for (const item of c.stock) { if (item === gene) n++; else if (item === `A:${gene}`) n += PACK.size; }
  }
  return n;
}
export function refresh() {
  forgetCells();
  const jobs = sites().length;
  $('works').hidden = !jobs || G.over;
  $('works').textContent = L`${jobs} chantier${jobs > 1 ? 's' : ''}${paused ? L(' en pause') : ''}`;
  $('dna').textContent = L`${G.dna} ADN`;
  for (const [type, stage] of Object.entries(NEEDS)) {
    const b = $('tools').querySelector(`[data-type="${type}"]`);
    if (!b) continue;
    const shut = !unlocked(stage);
    b.classList.toggle('locked', shut);
    if (ui.locked.get(type) && !shut) replay(b, 'unlocked');
    ui.locked.set(type, shut);
    b.querySelector('.lock').hidden = !shut;
    const tag = b.querySelector('.price:not(.lock)');
    if (tag) tag.hidden = shut;
  }
  for (const type of Object.keys(PRICE)) {
    const tag = $('tools').querySelector(`[data-type="${type}"] .price:not(.lock)`), cost = price(type);
    if (tag) { tag.textContent = cost; tag.classList.toggle('short', cost > G.dna); }
  }
  const copy = selected && G.cells[selected]?.seen && [...$('actions').querySelectorAll('button')].find(b => b.disabled);
  if (copy) copy.disabled = false;
  if (selected && G.cells[selected]) {
    const c = G.cells[selected], hurt = c.hp < fullHp(c) - .5;
    const state = hurt ? L` ${Math.floor(c.hp)} PV sur ${fullHp(c)}, ${healing(c) ? L('en réparation') : L`réparation dans ${Math.ceil(REPAIR.quiet - (G.time - c.hitAt))} s sans coup`}.` : '';
    write($('message'), diagnose(c) + state);
  }
  else if (selected) { mainSet.selected(null); mainSet.chain([]); showActions(); }
  else if (pickedWorm()) write($('message'), wormState(pickedWorm()));
  else write($('message'), note);
  $('pause').textContent = paused ? '▶' : 'II';
  $('pause').setAttribute('aria-label', paused ? L('Reprendre') : L('Mettre en pause'));
  const lost = Object.values(G.ruins).filter(w => !buried(w)).length;
  const torn = pumps().filter(c => c.to && c.veinHp < VEIN.hp / 2).length + G.wires.filter(w => !w.hp).length;
  $('rebuild').hidden = !(lost + torn) || G.over;
  if (lost + torn) {
    const bill = {}, count = {};
    for (const [id, w] of Object.entries(G.ruins)) {
      if (buried(w) || (!PRICE[w.type] && !rankCost(w.type, w.mk))) continue;
      let worth = rankCost(w.type, w.mk);
      if (PRICE[w.type]) {
        const scale = GUNS[w.type] ? 'turret' : w.type;
        count[scale] ??= owned(w.type);
        worth += PRICE[w.type](count[scale]++);
      }
      bill.total = (bill.total || 0) + Math.ceil(worth / 2);
    }
    $('rebuild').textContent = L`Reconstruire (${lost + torn})${bill.total ? L` · ${bill.total} ADN` : ''}`;
  }
  $('over').hidden = !G.over;
  paintHud();
}
// Démonter takes what is on top first: worm, building, then trail.
export function wipe(x,y) {
  const id = tileKey(x,y), w = G.worms.find(o => o.path.includes(id));
  if (w) return scrap(w, () => dropWorm(w, true));
  const top = cellAt(x,y) || ruinAt(x,y);
  // A bridge taken down on its own gives its line back: a belt the way it ran. Swept with a line, it goes with it.
  if (top?.type === 'bridge' && !drag) top.leaves = 'belt';
  if (top) return scrap(top, () => remove(top.x,top.y));
  if (G.tracks[id]) scrap(G.tracks[id], () => { delete G.tracks[id]; });
}
// Put down at the rank in hand. Whoever calls has checked the price.
export function buildRanked(type, x, y, dir) {
  const c = build(type, x, y, dir), mk = inHand(type);
  if (mk > 1) { c.mk = mk; G.dna -= rankCost(type, mk); }
  return c;
}
export function place(x,y) {
  const id = key(x,y), old = cellAt(x,y);
  if (linking) {
    const from = G.cells[linking];
    mainSet.linking(null);
    joinVein(from,x,y);
    return;
  }
  // A listener choosing its source: something on its own network, or itself for the whole network.
  if (listening) {
    const ear = G.cells[listening];
    mainSet.listening(null);
    if (!ear) return;
    select(key(ear.x, ear.y));
    if (old === ear) { delete ear.source; ear.passed = 0; sense(); showActions(); return say(L('Il écoute maintenant tout le réseau.')); }
    if (!isSource(old) || NET.get(key(old.x, old.y)) !== netOf(ear)) return refuse(L('Il faut toucher une arme, un radar, le cœur, un kyste ou un pupitre relié au même réseau.'));
    ear.source = key(old.x, old.y); ear.passed = 0; sense(); showActions();
    const note = (old.type === 'cyst' || old.type === 'vault') && ear.type !== 'gate' ? L(' Un kyste ne donne pas de gène : seul un feu s’en sert, pour son niveau.') : '';
    return say(L`Il écoute maintenant ${sourceName(ear, old)}.${note}`);
  }
  if (wiring || tool === 'wire') {
    const from = wiring && G.cells[wiring];
    if (from && old === from) { mainSet.wiring(null); return say(TYPES.wire.help); }
    if (from) {
      mainSet.wiring(null);
      if (!old) return refuse(L('Un nerf finit sur une tourelle, un feu ou un trieur.'));
      if (wireUp(from, old)) { const message = note; select(id); say(message); }
      return;
    }
    mainSet.wiring(null);
    if (!NERVE.ends.includes(old?.type)) return say(TYPES.wire.help);
    select(null); mainSet.wiring(id);
    return say(L('Touche maintenant l’élément à relier.'));
  }
  // A gate on a nerve is not a switch any more.
  if (old?.type === 'gate' && tool !== 'erase' && G.wires.some(w => w.a === id || w.b === id)) return select(id);
  if (old?.type === 'gate' && tool !== 'erase') { old.open = !old.open; select(id); return; }
  const worm = G.worms.find(w => w.path.includes(tileKey(x, y)));
  if (worm && (tool === 'hand' || tool === 'worm')) return selectWorm(worm);
  if (tool === 'worm') return incubate(x,y);
  if (tool === 'track') {
    if (!placeable(x,y)) return refuse(`${whyNot(x,y)}.`);
    const t = trackAt(x, y);
    if (t) { t.dir = (t.dir + 1) % 4; setHeading(t.dir); } else layTrack(x,y,heading);
    return say(TYPES.track.help);
  }
  if (tool === 'hand') {
    if (old) return select(key(old.x,old.y));
    select(null); say(TYPES.hand.help);
    if (trackAt(x, y)) return say(trackAfter(tileKey(x, y)) || !built(trackAt(x, y)) ? L('Piste de phéromones. Pose une poche contre elle, ou un ver dessus.') : L('Fin de piste : les vers s’arrêtent ici. Referme la boucle.'));
    if (!known(x,y)) return say(L('Zone inconnue. Construis dans sa direction : tes structures y verront.'));
    const b = breachesIn(x,y,x,y).find(h => h.state !== 'spent' && known(h.x,h.y) && Math.hypot(h.x - x, h.y - y) < 3);
    if (!b) return;
    say(L`Brèche au ${bearing(b)}, niveau ${levelOf(b)} sur 5 : ${b.left} créatures, gène faible ${b.genes.join(' et ')}, antidote ${b.genes.map(opposite).join(' et ')}. ${b.state === 'sleep' ? L('Elle dort tant que rien n’est bâti dans son cercle.') : L('Elle est réveillée. Vide-la pour qu’elle disparaisse.')}`);
    // @ts-expect-error: loose typing, tightened module by module (item_007)
    if (b.state === 'sleep') button(L('Réveiller'), () => { wake(b); $('actions').replaceChildren(); });
    return;
  }
  if (tool === 'erase') return wipe(x,y);
  if (old) {
    // A first tap on a piece like the one in hand selects it; only a second tap turns it, never by surprise.
    if (old.type === tool && hasTrait(tool, 'retap') && selected === key(old.x, old.y)) { old.dir = (old.dir + 1) % 4; setHeading(old.dir); }
    // A bridge may replace a belt, to make a crossing on an existing line.
    else if (old.type === 'belt' && hasTrait(tool, 'onBelt')) { dropRise(old); G.dna += refund(old); build(tool,x,y,old.dir); }
    select(key(old.x,old.y));
    return;
  }
  if (isBig(tool)) {
    const site = siteFor(tool,x,y);
    if (site.why) return refuse(`${site.why}.`);
    const due = costInHand(tool);
    if (due > G.dna) return refuse(L`Il manque ${due - G.dna} ADN pour ce rang.`);
    buildRanked(tool,site.x,site.y,heading); select(key(site.x,site.y)); return say(TYPES[tool].help);
  }
  if (!placeable(x,y)) return refuse(`${whyNot(x,y)}.`);
  const cost = costInHand(tool);
  if (cost > G.dna) return refuse(L`Il manque ${cost - G.dna} ADN. Envoie des gènes au cœur, 1 ADN chacun, ou vide une brèche.`);
  if (tool === 'mine' && !depositAt(x,y)) return refuse(L('Un récolteur se pose sur un gisement coloré.'));
  G.dna -= price(tool);
  buildRanked(tool,x,y,heading); select(id); say(TYPES[tool].help + (cost ? L` Payé ${cost} ADN.` : ''));
}
export function screenPoint(event) {
  const r = canvas.getBoundingClientRect();
  return {x:event.clientX - r.left, y:event.clientY - r.top};
}
export function joinVein(from,x,y) {
  if (from?.type !== 'pump') return;
  let to = cellAt(x,y);
  if (!to) {
    if (!placeable(x,y)) return refuse(`${whyNot(x,y)}.`);
    if (Math.hypot(x - from.x,y - from.y) > VEIN.reach) return link(from,{x,y,type:'pump'});
    to = build('pump',x,y,0);
  }
  const linked = link(from,to), message = note;
  if (linked) { select(key(x,y)); say(message); }
}
export function position(p) {
  const w = worldAt(p.x, p.y);
  return {x:Math.floor(w.x), y:Math.floor(w.y)};
}
// Drawn across a belt going the other way, the line crosses it on a bridge: both flows keep their way,
// what rode the belt goes on in its lane, and a rank paid on it comes back.
export function bridgeOver(c, dir) {
  const axis = c.dir % 2, item = c.item ? {item:c.item, dir:c.dir, t:c.t} : null;
  dropRise(c);
  G.dna += refund(c);
  const b = build('bridge', c.x, c.y, c.dir);
  b.ways = [null, null];
  b.ways[axis] = c.dir;
  b.ways[dir % 2] = dir;
  if (item) b.lanes[axis] = item;
  return b;
}
export function stretch(to) {
  if (!drag?.path) return extend(to);
  drag.to = to;
  const path = drag.path, legs = drag.legs ||= [{start:0, axis:null}];
  while (legs.length > 1) {
    const corner = path[legs.at(-1).start], before = legs.at(-2).axis;
    if ((before === 'x' ? to.y - corner.y : to.x - corner.x) !== 0) break;
    const gone = legs.pop();
    legs.at(-1).axis = gone.was; drag.flip = false;
  }
  const leg = legs.at(-1), a = path[leg.start], step = tool === 'track' ? trackSize() : 1;
  const dx = Math.trunc((to.x - a.x) / step), dy = Math.trunc((to.y - a.y) / step);
  if (leg.axis == null && (dx || dy)) leg.axis = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y';
  const axis = leg.axis || 'x', other = axis === 'x' ? 'y' : 'x';
  const along = axis === 'x' ? dx : dy, across = axis === 'x' ? dy : dx;
  // Close to where the leg starts a one-cell step turns, so a tight corner can be closed; farther, a wavering hand
  // stays straight until TURN cells off.
  const turns = Math.abs(across) >= (Math.abs(along) <= 1 ? 1 : TURN), flip = turns && drag.flip;
  const runs = !turns ? [[axis, along]] : flip ? [[other, across], [axis, along]] : [[axis, along], [other, across]];
  const was = path.map(c => key(c.x, c.y)).join(';');
  path.length = leg.start + 1;
  let last = a, corner = -1;
  runs.forEach(([ax, n], i) => {
    const dir = ax === 'x' ? (n > 0 ? 1 : 3) : (n > 0 ? 2 : 0);
    for (let k = 0; k < Math.abs(n); k++) {
      const next = {x:last.x + DX[dir] * step, y:last.y + DY[dir] * step, dir};
      if (!inside(next.x, next.y)) break;
      path.push(next); last = next;
    }
    if (i === 0 && runs.length > 1) corner = path.length - 1;
  });
  // A real turn: the pointer goes on two more cells across while it no longer moves along. Moving both ways at
  // once is a diagonal, and the L stays live.
  if (!turns || flip) drag.turn = null;
  else if (!drag.turn || Math.abs(along - drag.turn.along) > 1) drag.turn = {along, across};
  else if (Math.abs(across) >= Math.abs(drag.turn.across) + 2 && corner > leg.start && path.length - 1 > corner) {
    legs.push({start:corner, axis:runs[1][0], was:leg.axis, flipped:flip});
    leg.axis = runs[0][0]; drag.flip = false; drag.turn = null;
  }
  if (path.map(c => key(c.x, c.y)).join(';') !== was) sayPath();
  // The piece in hand turns with the line: it points the way the line now runs, and the next one starts so.
  const way = path.at(-1).dir;
  if (tool !== 'erase' && way != null && way !== heading) setHeading(way);
}
// R while drawing: the last L laid the other leg first, its two ends kept.
export function flipCorner() {
  if (!drag?.path || tool === 'erase') return false;
  const legs = drag.legs ||= [{start:0, axis:null}];
  if (legs.length > 1) { const gone = legs.pop(); legs.at(-1).axis = gone.was; drag.flip = !gone.flipped; }
  else drag.flip = !drag.flip;
  stretch(drag.to || drag.path.at(-1));
  playSound('rotate');
  return true;
}
export function sayPath() {
  const path = drag.path;
  if (tool === 'erase') { say(L`Démontage : ${path.length} cases. Lâche pour démonter, Échap pour annuler.`); return; }
  const fresh = path.filter(freshOn).length;
  say(L`Tracé : ${fresh} cases, ${fresh * costInHand(tool)} ADN. Lâche pour construire, Échap pour annuler.`);
}
export function commitPath() {
  const path = drag.path, cross = new Set(path.filter((p, i) => crossing(path, i)).map(p => key(p.x, p.y))), s = path[0];
  mainSet.drag({x:s.x, y:s.y, moved:false, existing:Boolean(cellAt(s.x, s.y)), cross});
  if (tool === 'erase') wipe(s.x, s.y);
  for (const p of path.slice(1)) { if (!drag) break; extend(p); }
  mainSet.drag(null);
}
export function drawPath(g) {
  const path = drag.path, erase = tool === 'erase';
  let spent = 0;
  path.forEach((p, i) => {
    const fresh = !erase && freshOn(p), over = !erase && tool === 'belt' && crossing(path, i);
    if (fresh) spent += costInHand(tool);
    const color = erase ? PREVIEW.scrap : fresh && spent > G.dna ? PREVIEW.no : over ? PREVIEW.turn : PREVIEW.build;
    const side = tool === 'track' ? trackSize() : 1;
    g.beginPath(); g.rect(p.x + .04, p.y + .04, side - .08, side - .08);
    g.fillStyle = color + '33'; g.fill(); g.strokeStyle = color + 'CC'; g.lineWidth = 1.5 / cam.zoom; g.stroke();
    if (fresh || over) { g.save(); g.globalAlpha = .75; g.translate(p.x + side / 2, p.y + side / 2); arrow(g, path[i + 1]?.dir ?? p.dir ?? 0, .4, color); g.restore(); }
  });
}
export function extend(to) {
  if (drag?.vein || drag?.nerve) { drag.aim = to; return; }
  while (drag && (drag.x !== to.x || drag.y !== to.y)) {
    const horizontal = Math.abs(to.x-drag.x) >= Math.abs(to.y-drag.y);
    const dir = horizontal ? (to.x > drag.x ? 1 : 3) : (to.y > drag.y ? 2 : 0), step = tool === 'track' ? trackSize() : 1;
    const x = drag.x + DX[dir] * step, y = drag.y + DY[dir] * step;
    if (!inside(x,y)) return;
    if (tool === 'erase') { wipe(x,y); drag.x = x; drag.y = y; drag.moved = true; continue; }
    if (tool === 'track') {
      const clear = (tx, ty) => footprint({x:tx, y:ty, size:step}).every(c => placeable(c.x, c.y) && (step === 1 || !cellAt(c.x, c.y)));
      if (!clear(drag.x,drag.y) || !clear(x,y)) { mainSet.drag(null); return; }
      const here = trackAt(drag.x,drag.y), joins = trackAt(x,y);
      if (drag.moved && drag.onTrack && here && here.dir !== dir) { refuse(L('La piste rejoint la ligne existante. Une case n’a qu’une sortie.')); mainSet.drag(null); return; }
      layTrack(drag.x,drag.y,dir);
      if (drag.start && x === drag.start.x && y === drag.start.y) { say(L('Boucle fermée. Pose des poches contre elle, puis un ver dessus.')); mainSet.drag(null); return; }
      if (!joins) layTrack(x,y,dir);
      mainSet.drag({x, y, moved:true, onTrack:Boolean(joins), start:drag.start || {x:drag.x, y:drag.y}});
      continue;
    }
    if (tool !== 'belt') { mainSet.drag(null); return; }
    const from = cellAt(drag.x,drag.y);
    // Still inside a big one: the line starts at the face it leaves by.
    if (from && sizeOf(from) > 1 && from === cellAt(x,y)) { mainSet.drag({...drag, x, y}); continue; }
    // Drawn over again, a belt on its way out stays.
    for (const c of [from, cellAt(x,y)]) if (isBelt(c)) keepIt(c);
    if (from && !isBelt(from) && from.type !== 'bridge' && drag.moved) { mainSet.drag(null); return; }
    if (from && drag.existing && drag.moved && isBelt(from) && from.dir !== dir) {
      refuse(L('Ce tapis existe déjà : la ligne s’y raccorde. Pour le traverser, pose un pont.'));
      mainSet.drag(null); return;
    }
    const short = cells => {
      const due = rankCost('belt', inHand('belt')) * cells;
      if (due <= G.dna) return false;
      refuse(L`Il manque ${due - G.dna} ADN pour continuer en MK${inHand('belt')}.`);
      mainSet.drag(null);
      return true;
    };
    if (!from) {
      if (!placeable(drag.x,drag.y)) { mainSet.drag(null); return; }
      if (short(1)) return;
      buildRanked('belt',drag.x,drag.y,dir);
    } else if (isBelt(from) || (!drag.moved && ['mine','cyst'].includes(from.type))) from.dir = dir;
    let next = cellAt(x,y);
    // A bridge only where the line goes on across; ending or turning on the belt joins it.
    if (next?.type === 'belt' && next.dir % 2 !== dir % 2 && (!drag.cross || drag.cross.has(key(x,y)))) next = bridgeOver(next, dir);
    // A belt drawn through a bridge takes that lane with it.
    for (const c of [from, next]) if (c?.type === 'bridge' && c.ways?.[dir % 2] != null) c.ways[dir % 2] = dir;
    if (!next) { if (!placeable(x,y)) { refuse(`${whyNot(x,y)}.`); mainSet.drag(null); return; } if (short(1)) return; buildRanked('belt',x,y,dir); }
    mainSet.drag({x, y, moved:true, existing:Boolean(next), heading:dir, cross:drag.cross});
    if (next && !isBelt(next) && next.type !== 'bridge') { mainSet.drag(null); return; }
  }
}
export function preview() {
  if (G.over || gesture?.mode === 'pan' || gesture?.mode === 'pinch') return null;
  const point = gesture ? gesture.now : hovered;
  if (!point) return null;
  const drawing = gesture?.mode === 'draw';
  const {x, y} = view3d && !drawing ? view3d.pick(point) : position(point);
  if (!inside(x, y)) return null;
  const id = key(x, y), old = cellAt(x, y);
  // A big one answers as a whole, from its corner.
  const whole = old || (tool === 'erase' ? ruinAt(x, y) : null), over = whole && sizeOf(whole) > 1 ? {x:whole.x, y:whole.y, size:sizeOf(whole)} : {};
  const to = (act, more) => ({x, y, act, ...over, ...more}), no = (why, more) => to('no', {why, ...more});
  const hive = whyNot(x, y), free = () => !hive;
  const fromVein = (drawing && drag?.vein) || (linking && G.cells[linking]);
  if (fromVein) {
    if (old && (old.type !== 'pump' || (old.x === fromVein.x && old.y === fromVein.y))) return no(L('Finit sur une pompe'), {from:fromVein});
    if (!old && !free()) return no(hive, {from:fromVein});
    const ghost = old ? {} : {type:'pump', dir:0};
    return span(fromVein, {x, y}) > VEIN.reach ? no(L`Trop loin : ${VEIN.reach} cases au plus`, {from:fromVein, ...ghost}) : to('link', {from:fromVein, ...ghost});
  }
  const fromWire = (drawing && drag?.nerve) || (wiring && G.cells[wiring]);
  if (fromWire) {
    if (x === fromWire.x && y === fromWire.y) return to('select');
    if (!NERVE.ends.includes(old?.type)) return no(L('Tourelle, feu ou trieur'), {from:fromWire});
    if (span(fromWire, old) > NERVE.reach) return no(L`Trop loin : ${NERVE.reach} cases au plus`, {from:fromWire});
    const a = key(fromWire.x, fromWire.y);
    if (G.wires.some(w => (w.a === a && w.b === id) || (w.a === id && w.b === a))) return no(L('Déjà reliés'), {from:fromWire});
    return to('link', {from:fromWire});
  }
  if (tool === 'wire') return NERVE.ends.includes(old?.type) ? to('link') : no(L('Tourelle, feu ou trieur'));
  const worm = G.worms.find(w => w.path.includes(tileKey(x, y)));
  if (tool === 'erase') {
    const ruin = ruinAt(x, y), track = trackAt(x, y), top = worm || old || ruin || track;
    if (!top) return to('none');
    if (top.type === 'core') return no(L('Le cœur ne se démonte pas'));
    if (top.out != null) return to('none', {label:L('Déjà dans la file')});
    const name = worm ? 'ver' : old ? TYPES[old.type].name.toLowerCase() : ruin ? L('débris') : 'piste';
    const back = !worm && old ? refund(old) : 0;
    return to('scrap', {worm, label:L`Démonter : ${name}${back ? L` · +${back} ADN` : ''}`});
  }
  if (old?.type === 'gate') return G.wires.some(w => w.a === id || w.b === id) ? to('select', {label:L('Feu intelligent')}) : to('use', {label:old.open ? L('Passer au rouge') : L('Passer au vert')});
  if (worm && (tool === 'hand' || tool === 'worm')) return to('select', {worm, label:L('Ver')});
  if (tool === 'worm') {
    const cost = price('worm'), ghost = {type:'worm', cost};
    if (!trackAt(x, y)) return no(L('Sur une piste seulement'), ghost);
    if (worm) return no(L('Case occupée'), ghost);
    return cost > G.dna ? no(L`Il manque ${cost - G.dna} ADN`, ghost) : to('build', ghost);
  }
  if (tool === 'track') {
    if (!free()) return no(hive);
    const track = trackAt(x, y), tile = trackSize() > 1 ? {...tileAt(x, y), size:2} : {};
    if (!track) return to('build', {type:'track', dir:heading, ...tile});
    return drawing ? to('select') : to('turn', {type:'track', dir:track.dir, label:L('Tourner')});
  }
  if (tool === 'hand') {
    if (old) return to('select', {label:old.type === 'core' ? L('Cœur') : TYPES[old.type].name});
    if (trackAt(x, y)) return to('select', {label:L('Piste')});
    if (!known(x, y)) return to('none', {label:L('Zone inconnue')});
    const b = breachesIn(x, y, x, y).find(h => h.state !== 'spent' && known(h.x, h.y) && Math.hypot(h.x - x, h.y - y) < 3);
    if (b) return to('select', {label:L`Brèche niveau ${levelOf(b)} : ${b.left} créatures`});
    const base = depositAt(x, y);
    return to('none', base ? {label:L`Gisement : ${named(base)} ×${richAt(x, y)}`} : {});
  }
  if (old) {
    if (drawing) return to('select');
    // The ghost shows the way it faces now; a tap on the selected piece turns it.
    if (old.type === tool && hasTrait(tool, 'retap') && selected === key(old.x, old.y)) return to('turn', {type:tool, dir:old.dir, label:L('Tourner')});
    if (old.type === 'belt' && hasTrait(tool, 'onBelt')) return to('build', {type:tool, dir:old.dir});
    return to('select', {label:old.type === 'core' ? L('Cœur') : TYPES[old.type].name});
  }
  const cost = costInHand(tool), ghost = {type:tool, mk:inHand(tool), dir:drawing && drag?.heading != null ? drag.heading : heading, cost};
  if (isBig(tool)) {
    const site = siteFor(tool, x, y), big = {...ghost, x:site.x, y:site.y, size:2};
    if (site.why) return no(site.why, big);
    return cost > G.dna ? no(L`Il manque ${cost - G.dna} ADN`, big) : to('build', big);
  }
  if (!free()) return no(hive, ghost);
  if (cost > G.dna) return no(L`Il manque ${cost - G.dna} ADN`, ghost);
  if (tool === 'mine' && !depositAt(x, y)) return no(L('Sur un gisement seulement'), ghost);
  return to('build', ghost);
}
// Both views use it: their canvas is in map units, squashed or not. It stays on the plane where things get built.
export function drawPreview(g, models) {
  const flipping = Boolean(drag?.path && tool !== 'erase' && drag.path.length > 2);
  if ($('flip-corner').hidden === flipping) $('flip-corner').hidden = !flipping;
  if (drag?.path && gesture?.mode === 'draw') { drawPath(g); drawPorts(g, null); return; }
  const p = preview();
  if (!p) { drawPorts(g, null); return; }
  const {x, y, act} = p, color = PREVIEW[act], size = p.size || (p.type && isBig(p.type) ? 2 : 1), mx = x + size / 2, my = y + size / 2;
  const at = `${x},${y},${act},${p.type},${size}`, now = performance.now();
  // @ts-expect-error: loose typing, tightened module by module (item_007)
  if (at !== drawPreview.at) {
    // @ts-expect-error: loose typing, tightened module by module (item_007)
    drawPreview.at = at; drawPreview.since = now;
    // @ts-expect-error: loose typing, tightened module by module (item_007)
    if (p.type !== drawPreview.type) { drawPreview.type = p.type; drawPreview.held = now; }
  }
  // @ts-expect-error: loose typing, tightened module by module (item_007)
  const age = STILL.matches ? 9 : (now - drawPreview.since) / 1000, held = STILL.matches ? 9 : (now - drawPreview.held) / 1000;
  if (age < .3) { g.globalAlpha = 1 - age / .3; rect(g, x - age, y - age, size + age * 2, size + age * 2, null, color); g.globalAlpha = 1; }
  if (p.type && act === 'build' && age < 9) { g.globalAlpha = .4; rect(g, x + .04, y + (age * .9 % 1) * (size - .06), size - .08, .06, color); g.globalAlpha = 1; }
  if (p.type && !models) {
    g.save(); g.globalAlpha = .55; g.translate(mx, my); g.scale(size, size);
    if (p.type === 'worm') circle(g, 0, 0, .42, '#2A4A22', '#C9F77A', .07);
    else if (p.type === 'track') arrow(g, p.dir, .46, '#B7F34A');
    else drawCell(g, {...cell(p.type, x, y, p.dir), mk:p.mk});
    g.restore();
  }
  if (p.from) {
    g.beginPath(); g.moveTo(p.from.x + .5, p.from.y + .5); g.lineTo(x + .5, y + .5);
    g.strokeStyle = color + 'AA'; g.lineWidth = .1; g.setLineDash([.3, .25]); g.stroke(); g.setLineDash([]);
  }
  const cells = p.worm ? p.worm.path.map(id => id.split(',').map(Number)) : [[x, y]];
  for (const [cx, cy] of cells) {
    const wideAs = p.worm ? 1 : size;
    g.beginPath(); g.rect(cx + .02, cy + .02, wideAs - .04, wideAs - .04);
    g.fillStyle = color + (act === 'none' ? '18' : '2A'); g.fill();
    g.strokeStyle = color + (act === 'none' ? '55' : 'DD'); g.lineWidth = 1.5 / cam.zoom; g.stroke();
  }
  // The way out, where it matters.
  // How far it would reach, before paying for it.
  if (GUNS[p.type]) {
    g.setLineDash([.4, .3]); circle(g, x + .5, y + .5, reachOf(p.type) * Math.max(.08, 1 - (1 - Math.min(1, held / .42)) ** 3), null, color + '99', 1.5 / cam.zoom); g.setLineDash([]);
  }
  const reach = drawPorts(g, p);
  if (act === 'no' || act === 'scrap') {
    const r = size * .2; g.beginPath(); g.moveTo(mx - r, my - r); g.lineTo(mx + r, my + r); g.moveTo(mx + r, my - r); g.lineTo(mx - r, my + r);
    g.strokeStyle = color; g.lineWidth = 2 / cam.zoom; g.stroke();
  }
  const touched = gesture && !hovered, keys = act === 'build' && !touched && !NARROW.matches;
  const piece = keys && p.type ? [TYPES[p.type]?.name + (p.mk > 1 ? ` MK${p.mk}` : ''), p.cost ? L`${p.cost} ADN` : '', p.dir != null && hasTrait(p.type, 'turn') ? L('R tourner') : '', L('Échap lâcher')].filter(Boolean).join(' · ') : '';
  const text = p.why || p.label || piece || (p.cost ? L`${p.cost} ADN` : '');
  if (!text) return;
  // The words keep one size at every zoom, and stay on the board.
  g.save(); g.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
  g.font = '600 13px Barlow, Verdana';
  const wide = sentenceWidth(g, text) + 12, squash = cam.zoom * flat();
  const left = Math.max(4, Math.min(view.w - wide - 4, view.w / 2 + (mx - cam.x) * cam.zoom - wide / 2));
  let top = view.h / 2 + (y + size - cam.y) * squash + 14 + reach;
  // Under a finger nobody reads: the words go above it.
  if (touched) top = view.h / 2 + (y - cam.y) * squash - 64;
  else if (top > view.h - ui.safe.bottom - 24) top -= squash * size + 48;
  if (act === 'no' && age < .35) g.translate(Math.sin(age * 55) * 5 * (1 - age / .35), 0);
  g.fillStyle = '#05090BE6'; g.fillRect(left, top, wide, 20);
  g.fillStyle = act === 'none' ? '#E6F0EC' : color; g.textAlign = 'left'; g.textBaseline = 'middle';
  drawSentence(g, text, left + 6, top + 10);
  g.restore();
}
// The ways in and out of one object, as the transport reads them. dir is the side of the cell, label what it wants there.
export function portsOf(c) {
  const out = (dir, more) => ({x:c.x, y:c.y, dir, out:true, ...more}), into = (dir, more) => ({x:c.x, y:c.y, dir, out:false, ...more});
  const round = [0, 1, 2, 3], back = (c.dir + 2) % 4;
  switch (c.type) {
    case 'belt': case 'gate': case 'mine': return [out(c.dir)];
    case 'cyst': return [out(c.dir), ...round.filter(d => d !== c.dir).map(d => into(d))];
    case 'vault': return edgesOf(c).map(d => ({...d, out:d.dir === c.dir}));
    case 'borer': return edgesOf(c).map(d => ({...d, out:true}));
    case 'ligase': return [out(c.dir), ...[0, 1, 2].map(port => into(portSide(c, port), {label:String(port + 1)}))];
    case 'join': return [out(c.dir), ...[0, 1].map(port => into(joinSide(c, port), {label:String(port + 1)}))];
    case 'pack': return [out(c.dir), into(back, {label:L('gènes')}), into(carbonSide(c), {label:L('carbone K')})];
    case 'split2': case 'split': return [into(back), ...splitExits(c).map(d => out(d))];
    case 'sort': return [into(back), out(c.dir, {label:'reste'}), out(sideExit(c), {label:c.want && c.want !== '?' ? c.want : 'filtre'})];
    case 'bridge': return [0, 1].flatMap(axis => {
      const way = wayOf(c, axis);
      // Grey while guessed from the neighbours, green once set.
      return way == null ? [] : [into((way + 2) % 4), out(way, {guessed:c.ways?.[axis] == null})];
    });
    case 'pump': return round.filter(d => !c.to || ahead(c, d)?.type !== 'pump').map(d => c.to ? into(d) : out(d));
    case 'pocket': return round.filter(d => !trackAt(c.x + DX[d], c.y + DY[d])).map(d => c.unload ? out(d) : into(d));
    case 'track': return [out(c.dir)];
    case 'unpack': return [into(back, {label:L('caisses')}), out(c.dir), out((c.dir + 1) % 4, {label:L('carbone K')})];
    case 'flip': case 'arm': return [into(back), out(c.dir)];
    case 'unbind': return [into(back), out(outSide(c, 0)), out(c.dir), out(outSide(c, 2))];
    case 'unjoin': return [into(back), out(outSide(c, 0)), out(outSide(c, 2))];
    case 'reaper': return [out(c.dir)];
    case 'core': if (sizeOf(c) > 1) return edgesOf(c).map(d => ({...d, out:false})); return round.map(d => into(d));
    case 'turret': case 'sting': case 'maw': case 'mist': case 'harpoon': case 'glue': return round.map(d => into(d));
  }
  return [];
}
// One size on screen at any zoom: nobody should zoom in to know where it comes out.
export function drawPorts(g, p) {
  const shown = [], picked = tool === 'hand' && selected ? G.cells[selected] : null;
  if (p?.type && p.act !== 'link') shown.push(cell(p.type, p.x, p.y, p.dir ?? 0));
  else if (p && p.act !== 'scrap') {
    const under = cellAt(p.x, p.y) || (p.worm ? null : trackAt(p.x, p.y) && {...trackAt(p.x, p.y), type:'track', x:p.x, y:p.y});
    if (under) shown.push(under);
  }
  if (picked && !shown.some(c => c.x === picked.x && c.y === picked.y)) shown.push(picked);
  const ports = shown.flatMap(portsOf);
  if (!ports.length) return 0;
  const tilt = flat(), tags = [];
  g.save();
  g.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
  g.lineJoin = 'round';
  for (const port of ports) {
    const dx = DX[port.dir], dy = DY[port.dir], wide = Math.min(9, Math.max(6, cam.zoom * .45));
    const ex = view.w / 2 + (port.x + .5 + dx * .5 - cam.x) * cam.zoom, ey = view.h / 2 + (port.y + .5 + dy * .5 - cam.y) * cam.zoom * tilt;
    // Out: a solid arrow leaving the edge. In: a cyan head resting on it.
    const tip = port.out ? 24 : 1, tail = port.out ? 2 : 15, head = port.out ? 12 : 14;
    const point = (along, side) => [ex + dx * along - dy * side, ey + dy * along + dx * side];
    const shape = port.out
      ? [point(tip, 0), point(tip - head, wide), point(tip - head, wide * .45), point(tail, wide * .45), point(tail, -wide * .45), point(tip - head, -wide * .45), point(tip - head, -wide)]
      : [point(tip, 0), point(tail, wide), point(tail - 3, 0), point(tail, -wide)];
    g.beginPath(); shape.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath();
    g.strokeStyle = '#05090B'; g.lineWidth = 4; g.stroke();
    g.fillStyle = !port.out ? '#66D9EA' : port.guessed ? '#C5D0CD' : '#B7F34A'; g.fill();
    if (port.label) tags.push({...port, at:point(port.out ? 35 : 27, 0), dx, dy});
  }
  g.font = '700 14px Barlow, Verdana'; g.textAlign = 'center'; g.textBaseline = 'middle';
  for (const tag of tags) {
    const said = sentenceWidth(g, tag.label), wide = Math.max(22, said + 12);
    const x = tag.at[0] + tag.dx * (wide / 2 - 11), y = tag.at[1];
    g.beginPath(); g.roundRect(x - wide / 2, y - 11, wide, 22, 11);
    g.fillStyle = '#05090B'; g.fill();
    g.strokeStyle = tag.out ? '#B7F34A' : '#66D9EA'; g.lineWidth = 2; g.stroke();
    g.fillStyle = '#FFFFFF'; drawSentence(g, tag.label, x - said / 2, y + .5);
  }
  g.restore();
  // How far down they reach, for the words that go under the object.
  return Math.max(0, ...ports.filter(port => port.dir === 2).map(port => (port.label ? 46 : 22)));
}
export function setCursor() {
  let next = 'grabbing';
  if (gesture?.mode !== 'pan' && gesture?.mode !== 'pinch') {
    const p = hovered && preview(), held = linking ? 'pump' : wiring ? 'wire' : tool, id = held + (p?.act === 'no' ? '-no' : '');
    if (!CURSORS.has(id)) {
      const c = document.createElement('canvas'), g = c.getContext('2d');
      c.width = c.height = 32;
      polygon(g, [[1.5,1.5],[1.5,16],[5.5,12.5],[8.5,18],[11.5,16.5],[9,11.5],[14,11]], '#E6F0EC', '#05090B', 1.5);
      const icon = $('tools').querySelector(`[data-type="${held}"] canvas`);
      circle(g, 22, 22, 9.5, '#091013', p?.act === 'no' ? '#FF6B6B' : held === 'erase' ? '#FF6B6B' : '#55D6E8', 1.5);
      if (icon) g.drawImage(icon, 13.5, 13.5, 17, 17);
      if (p?.act === 'no') { g.beginPath(); g.moveTo(16, 28); g.lineTo(28, 16); g.strokeStyle = '#FF6B6B'; g.lineWidth = 2.5; g.stroke(); }
      CURSORS.set(id, `url(${c.toDataURL()}) 2 2, crosshair`);
    }
    next = CURSORS.get(id);
  }
  if (next !== cursor) { mainSet.cursor(next); canvas.style.cursor = next; }
}
export function holdToDismantle(event, p) {
  const ring = $('hold-ring');
  ring.style.left = `${event.clientX}px`; ring.style.top = `${event.clientY}px`;
  ring.hidden = false; ring.classList.remove('filling'); void ring.offsetWidth; ring.classList.add('filling');
  gesture.hold = setTimeout(() => {
    stopHold();
    const at = view3d ? view3d.pick(p) : position(p);
    if (inside(at.x, at.y)) { wipe(at.x, at.y); playNear('dismantle', at); refresh(); }
  }, HOLD_MS);
}
export function stopHold() {
  if (gesture?.hold) { clearTimeout(gesture.hold); gesture.hold = null; }
  $('hold-ring').hidden = true; $('hold-ring').classList.remove('filling');
}
export function release(event) {
  if (!pointers.delete(event.pointerId) || pointers.size) return;
  stopHold();
  if (event.type === 'pointerup' && gesture?.mode === 'tap') {
    const p = view3d ? view3d.pick(gesture.start) : position(gesture.start);
    if (inside(p.x,p.y)) { const before = G.dna, count = Object.keys(G.cells).length; place(p.x,p.y); if (G.dna !== before || Object.keys(G.cells).length !== count) playNear(tool === 'erase' ? 'dismantle' : 'place', p); }
  }
  if (event.type === 'pointerup' && drag?.path && gesture?.mode === 'draw') {
    const bridged = tool === 'belt' && drag.path.some((p, i) => crossing(drag.path, i));
    // Heard from where the line ends, where the pointer let go.
    playNear(tool === 'erase' ? 'dismantle' : bridged ? 'bridge' : 'belt', drag.path.at(-1));
    commitPath();
  }
  if (event.type === 'pointerup' && drag?.nerve && gesture?.mode === 'draw') {
    const a = drag.nerve, b = drag.aim;
    if (a.x !== b.x || a.y !== b.y) wireUp(G.cells[key(a.x,a.y)], G.cells[key(b.x,b.y)]);
  }
  if (event.type === 'pointerup' && drag?.vein && gesture?.mode === 'draw') {
    const {vein, aim} = drag;
    if (vein.x !== aim.x || vein.y !== aim.y) {
      // The first pump is only created when the vein can be made.
      if (Math.hypot(aim.x - vein.x,aim.y - vein.y) > VEIN.reach) link({...vein,type:'pump'},{...aim,type:'pump'});
      else if (cellAt(aim.x,aim.y) && cellAt(aim.x,aim.y).type !== 'pump') refuse(L('Termine la veine sur une pompe ou un sol libre, juste à côté du bâtiment.'));
      else joinVein(G.cells[key(vein.x,vein.y)] || build('pump',vein.x,vein.y,0),aim.x,aim.y);
    }
  }
  mainSet.gesture(null); mainSet.drag(null); refresh();
}

// The bindings other modules replace.
export const inputSet = {
  // @ts-expect-error: a function rebound in place, as a test's stub or the timing probes do
  refresh: (v) => (refresh = v)
};
