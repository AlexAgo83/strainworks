// The interface around the map: panels, the core card, the guide, the goal and the statistics.
import { eaten, hungryFor, BORER, BOX, CORE, DX, DY, G, GROWTH_BONUS, GUNS, NERVE, RANKS, STAGES, TYPES, VEIN, WORM, ahead, allCells, bearing, boxOf, built, capOf, cellAt, centreOf, contentOf, coreCell, depositAt, earn, fill, fogTick, follows, fullHp, hasTrait, healing, holdCap, inSight, isBelt, isGun, joinSide, jobId, key, listens, matterUnder, mealRate, opposite, paceOf, perSecond, pocketCap, rankOf, reachOf, readyPort, sites, sizeOf, span, spotHash, unlocked, waveGene } from "../sim/sim.ts";
import { DEC, L, LOCALE } from "../sim/text.ts";
import { buyLab, diagnose, packTrouble, packWarning, dronePose, known, labPrice, portSide, rowOf, setHeading, stagePart, upstream } from "./actions.js";
import { paintPlaylist, playSound } from "./audio.js";
import { choose, geneMark, orderHTML, pickedWorm, say, sentenceHTML, stockOf, write } from "./input.js";
import { $, EARN, FAMILIES, FAMILY_OF, FOG_SOFT, GENES, GUIDE, DEFENSE_GUIDE, MATTER, guideGene, LAB_TABS, MODELS, MOST_DRONES, NARROW, NEEDS, PRODUCERS, RANK_NEED, SHAPE, STILL, UPGRADES, cam, chain, drag, fogFor, fogImage, fr, gateGreen, gesture, inHand, inside, intro, labNext, linking, listening, machineOf, mainSet, motionTime, named, note, orbit, paused, placeable, rankOpen, screenAt, selected, speed, tool, ui, view, wiring, within, woven } from "./main.js";
import { circle, glyph, rect, worldAt } from "./render.js";
import { save } from "./saves.js";
import { offerConcept } from "./unlock.js";

export function paint(id, html, el = $(id)) {
  if (ui.html[id] === html) return false;
  ui.html[id] = html; el.innerHTML = html;
  return true;
}
export function replay(el, name) {
  el.classList.remove(name);
  void el.getBoundingClientRect();
  el.classList.add(name);
}
export function showModel(el, type) {
  const i = Math.max(0, MODELS.indexOf(type));
  el.style.backgroundPosition = `${(i % 6) * 20}% ${Math.floor(i / 6) * 100 / 6}%`;
}
export function markOf(base) { return SHAPE[base] ? `<svg viewBox="0 0 18 18">${SHAPE[base]}</svg>` : ''; }

// What happened, kept on the left edge. Touched, it takes the camera there.
// @ts-expect-error: loose typing, tightened module by module (item_007)
export function tell(text, {at, gene, bad, act} = {}) {
  say(text);
  ui.saidAt = 0;
  // It stays until closed, the latest five kept: what happened is not lost while looking away.
  const same = ui.events.find(e => e.text === text);
  if (same) { $('events').append(same.el); ui.events.push(ui.events.splice(ui.events.indexOf(same), 1)[0]); return; }
  const el = document.createElement('div'), body = document.createElement(at || act ? 'button' : 'p'), dot = document.createElement('i'), words = document.createElement('span'), close = document.createElement('button');
  el.className = `event${bad ? ' bad' : ''}`; body.className = 'what'; dot.className = 'dot'; words.className = 'text'; write(words, text);
  body.append(dot, words);
  if (gene) body.insertAdjacentHTML('beforeend', geneMark(gene));
  if (at) { const there = {x:at.x + .5, y:at.y + .5}; body.onclick = () => travelTo(there); }
  if (act) body.onclick = act;
  close.className = 'close'; close.setAttribute('aria-label', L('Fermer')); close.textContent = '×';
  const entry = {el, text};
  close.onclick = () => { el.remove(); ui.events.splice(ui.events.indexOf(entry), 1); };
  el.append(body, close);
  $('events').append(el);
  ui.events.push(entry);
  while (ui.events.length > 5) ui.events.shift().el.remove();
}
export function forgetEvent(text) {
  const at = ui.events.findIndex(e => e.text === text);
  if (at >= 0) ui.events.splice(at, 1)[0].el.remove();
}
export function forgetEvents() {
  for (const e of ui.events) e.el.remove();
  ui.events = [];
}
// A refusal answers where the hand is, never at the other end of the screen.
export function refuse(text) {
  playSound('refuse', .3);
  say(text);
  ui.saidAt = 0; ui.refusedAt = performance.now();
  const el = $('refusal'), p = ui.point || {x:view.w / 2, y:view.h / 2};
  write(el, text); el.hidden = false;
  const wide = el.offsetWidth, tall = el.offsetHeight;
  el.style.left = `${Math.max(8, Math.min(view.w - wide - 8, p.x - wide / 2))}px`;
  el.style.top = `${p.y - tall - 46 > 8 ? p.y - tall - 46 : Math.min(view.h - tall - 8, p.y + 30)}px`;
  replay(el, 'shake');
}
export function travelTo(to) {
  if (STILL.matches) { Object.assign(cam, to); return; }
  ui.travel = {...to};
}
export function moveCamera(elapsed) {
  if (!ui.travel) return;
  const by = Math.min(1, elapsed * 8);
  let far = 0;
  for (const [name, value] of Object.entries(ui.travel)) {
    cam[name] += (value - cam[name]) * by;
    far += Math.abs(value - cam[name]) * (name === 'zoom' ? 1 : cam.zoom);
  }
  if (far < 1) ui.travel = null;
}

export function openFamily(id) {
  if (id && ui.family !== id) playSound('open');
  ui.family = id;
  for (const tray of $('tools').querySelectorAll('.tray')) tray.hidden = tray.dataset.tray !== id;
  $('app').classList.toggle('traying', Boolean(id));
  for (const b of $('tools').querySelectorAll('.family')) {
    const [own, , model] = FAMILIES.find(f => f[0] === b.dataset.family), mine = FAMILY_OF[tool] === own;
    b.setAttribute('aria-expanded', own === id);
    b.setAttribute('aria-pressed', own === id || mine);
    // Folded, the family carries what is in hand.
    showModel(b.querySelector('.model'), mine ? tool : model);
  }
  $('tools').querySelector('[data-type="hand"]').setAttribute('aria-pressed', tool === 'hand' && !id);
  $('hint').hidden = true;
  layoutHud();
}
// The rank a belt or a harvester is put down at, chosen above the dock.
export function paintRanks() {
  const box = $('ranks'), costs = RANKS[tool]?.cost;
  box.hidden = !costs;
  $('app').classList.toggle('ranking', Boolean(costs));
  if (!costs) return;
  [...box.children].forEach((b, i) => {
    const open = rankOpen(i + 1);
    b.setAttribute('aria-pressed', inHand(tool) === i + 1);
    b.disabled = !open;
    b.querySelector('small').textContent = !open ? L`stade ${RANK_NEED[i] + 1}` : costs[i] ? L`${costs[i]} ADN` : L('gratuit');
    b.querySelector('small').classList.toggle('short', open && costs[i] > G.dna);
  });
}
export function toggleFamily(id) {
  if (ui.family === id) return choose('hand');
  // Back to a family, back to the tool last taken from it.
  const last = ui.lastOf?.[id];
  if (last && last !== tool && unlocked(NEEDS[last] || 0)) return choose(last);
  if (FAMILY_OF[tool] !== id) choose('hand');
  openFamily(id);
}
export function menuPage(id) {
  ui.page = id;
  for (const page of $('menu').querySelectorAll('.page')) page.hidden = page.dataset.page !== id;
  if (id === 'playlist') paintPlaylist();
}
export function showMenu(open) {
  if (open && !ui.menu) playSound('open');
  if (open && !ui.menu) menuPage('root');
  ui.menu = open;
  $('menu').hidden = !open;
  $('menu-toggle').setAttribute('aria-expanded', open);
  $('planet-menu').setAttribute('aria-expanded', open);
  $('menu-toggle').classList.toggle('on', open);
}
export function foldSide(off) {
  $('app').classList.toggle('side-off', off);
  $('side-toggle').setAttribute('aria-expanded', String(!off));
}
export function layoutHud() {
  const narrow = NARROW.matches, speedButton = $('speed'), pauseButton = $('pause');
  const menuButton = $('menu-toggle');
  if (narrow) {
    if (menuButton.parentElement !== $('time')) $('time').append(menuButton);
    if (pauseButton.parentElement !== $('time')) $('time').insertBefore(pauseButton, $('menu-toggle'));
    // On a short screen the side toggle sits on the zoom row: the speed goes beside the pause instead.
    if (innerHeight > 520) { if (speedButton.parentElement !== $('zoom')) $('zoom').append(speedButton); }
    else if (speedButton.parentElement !== $('time') || speedButton.nextElementSibling !== pauseButton) $('time').insertBefore(speedButton, pauseButton);
  } else {
    for (const b of [pauseButton, speedButton]) if (b.parentElement !== $('zoom')) $('zoom').append(b);
    if (menuButton.parentElement !== $('brief')) $('brief').insertBefore(menuButton, $('families'));
  }
  ui.safe = {
    left:8,
    top:narrow ? (view.h <= 520 ? 108 : 154) : view.w < 1000 ? 150 : 96,
    right:narrow ? 60 : 72,
    bottom:Math.max(8, view.h - $('tools').getBoundingClientRect().top + 6)
  };
  ui.at = '';
}

export function jobName({c, field}) {
  if (field === 'out' || field === 'veinOut') return L('Retrait');
  if (field === 'veinLeft') return L('Veine');
  if (field === 'up') return `MK${c.upTo}`;
  return TYPES[c.type]?.name || (c.path ? L('Ver') : c.a ? L('Nerf') : L('Piste'));
}
export function paintOrganism() {
  const part = stagePart() ?? 1;
  $('stage-arc').setAttribute('stroke-dasharray', `${Math.round(Math.min(1, part) * 352)} 352`);
  const life = Math.max(0, Math.ceil(coreCell().hp));
  $('life').setAttribute('stroke-dasharray', `${Math.round(life * 2.96)} 296`);
  $('life-text').textContent = L`Cœur ${life}`;
  $('organism').classList.toggle('ailing', life < 40);
  paint('order', orderHTML());
  if (ui.dna != null && G.dna > ui.dna) { $('gain').textContent = `+${Math.round(G.dna - ui.dna)}`; replay($('gain'), 'up'); }
  ui.dna = G.dna;
}
export function paintThreat() {
  const awake = G.breaches.filter(b => b.state === 'wake' && b.left);
  const first = awake.find(b => b.pending) || awake.reduce((a, b) => !a || b.next < a.next ? b : a, null);
  const active = Boolean(first?.pending), left = first ? Math.max(0, Math.ceil(first.next - G.time)) : 0;
  const here = Object.entries(G.enemies.reduce((n, e) => (n[e.gene] = (n[e.gene] || 0) + 1, n), {})).sort((a, b) => b[1] - a[1]);
  const gene = first ? (active ? first.gene : waveGene(first)) : here[0]?.[0] || '';
  const detail = [];
  let title, short;
  // The next swarm, when it comes sooner than a nest's assault: from where, how many, its antidote.
  const swarm = G.swarm?.next != null && G.swarm.from ? G.swarm : null, swarmIn = swarm ? Math.max(0, Math.ceil(swarm.next - G.time)) : Infinity;
  if (swarm && !active && (!first || swarmIn < left)) {
    const where = bearing(swarm.from);
    title = L`Essaim dans ${swarmIn} s`; short = `${swarmIn} s`;
    detail.push(where[0].toUpperCase() + where.slice(1), L`${swarm.size} créatures`);
    if (G.enemies.length) detail.push(L`${G.enemies.length} sur la carte`);
  } else if (first) {
    const where = bearing(first);
    title = active ? L`Assaut : ${where}` : L`Assaut dans ${left} s`;
    short = active ? L('Assaut') : `${left} s`;
    if (!active) detail.push(where[0].toUpperCase() + where.slice(1));
    if (first.id) detail.push(L`${Math.round(span(first, CORE))} cases`);
    if (G.enemies.length) detail.push(L`${G.enemies.length} sur la carte`);
    if (awake.length > 1) detail.push(L`+${awake.length - 1} brèche${awake.length > 2 ? 's' : ''}`);
  } else if (here.length) {
    title = L`${G.enemies.length} sur la carte`; short = `${G.enemies.length}`;
    detail.push(L('Leur brèche est vide'));
  } else {
    const asleep = G.breaches.filter(b => b.state === 'sleep' && known(b.x, b.y)).length;
    title = asleep ? L`${asleep} brèche${asleep > 1 ? 's' : ''} dormante${asleep > 1 ? 's' : ''}` : L('Rien en vue');
    short = asleep ? L`${asleep} dorment` : L('Calme');
    detail.push(asleep ? (asleep > 1 ? L('repérées') : L('repérée')) : L('le brouillard commence plus loin'));
  }
  const shown = swarm && !active && (!first || swarmIn < left) ? swarm.gene : gene;
  const box = $('brief'), stock = shown ? stockOf(opposite(shown)) : 0;
  paint('title', title, box.querySelector('.title'));
  paint('detail', detail.join(' · '), box.querySelector('.detail'));
  paint('short', short, box.querySelector('.short'));
  paint('versus', shown ? `<span class="foe">${geneMark(shown)}</span><span class="to">→</span>${geneMark(opposite(shown))}<span class="${stock ? 'need' : 'none'}">${stock ? L`${stock} en stock` : L('aucun antidote')}</span>` : '');
  paint('families', here.map(([kind, n]) => {
    const ready = stockOf(opposite(kind));
    return L`<div class="threat"><b>${n} sur la carte</b>${geneMark(kind)}<span>→</span>${geneMark(opposite(kind))}<span class="${ready ? 'need' : 'none'}">${ready ? L`${ready} en stock` : L('aucun antidote')}</span></div>`;
  }).join('') || L('<span class="threat">Personne sur la carte</span>'));
  box.classList.toggle('calm', !first && !here.length && !swarm);
  box.style.setProperty('--pulse', `${(1.7 - Math.min(10, G.threat) * .11).toFixed(2)}s`);
  $('app').classList.toggle('hot', !G.over && (active || G.enemies.length > 0));
}
export function paintDrones() {
  while ($('drones').children.length < MOST_DRONES) addPip($('drones').children.length);
  const price = labPrice('drones');
  [...$('drones').children].forEach((b, i) => {
    const locked = i >= G.drones.length;
    b.classList.toggle('locked', locked);
    b.dataset.price = locked && i === G.drones.length && price != null ? L`${price} ADN` : '';
  });
  const jobs = new Map(sites().map(job => [jobId(job), job]));
  G.drones.forEach((d, i) => {
    const b = $('drones').children[i];
    if (!b) return;
    const job = d.job ? jobs.get(d.job) : null;
    let label = L('Au nid');
    if (job) {
      const pose = dronePose(d), working = pose.goal && pose.w >= .5;
      label = `${jobName(job)}${working ? ` ${Math.ceil(job.c[job.field])} s` : ''}`;
    }
    b.classList.toggle('busy', Boolean(job));
    // The ring: full at the nest, a short arc in flight, what is left of the job at work.
    const pose = job ? dronePose(d) : null, working = Boolean(pose?.goal && pose.w >= .5);
    const state = !job ? 'home' : working ? 'work' : 'fly';
    if (job && (ui.jobOf ||= [])[i] !== d.job) { ui.jobOf[i] = d.job; (ui.jobFull ||= [])[i] = Math.max(.01, job.c[job.field]); }
    const part = state === 'home' ? 1 : state === 'fly' ? .27 : 1 - Math.min(1, job.c[job.field] / ui.jobFull[i]);
    b.dataset.state = state;
    b.querySelector('.run').setAttribute('stroke-dasharray', `${(part * 113).toFixed(1)} 113`);
    const mini = b.querySelector('.mini'), heading = b.querySelector('.heading'), shown = job && MODELS.includes(job.c.type) ? job.c.type : '';
    mini.hidden = !shown || state === 'fly';
    if (shown) showModel(mini, shown);
    heading.hidden = state !== 'fly';
    if (state === 'fly') heading.style.transform = `rotate(${(pose.a * 180 / Math.PI + 90).toFixed(0)}deg)`;
    const words = b.querySelector('.words');
    if (words.textContent !== label) { words.textContent = label; b.setAttribute('aria-label', L`Drone ${i + 1} : ${label}. Aller le voir.`); }
  });
}
export function cellsOf(c, worm) {
  const sac = (n, max, what = '') => `<span class="sac"><i style="width:${Math.min(100, n / max * 100)}%"></i><span>${Math.floor(n)} / ${max}${what}</span></span>`;
  const alveole = (inner, more = '') => `<span class="cellule ${inner ? 'full' : ''} ${more}">${inner}</span>`;
  if (worm) return worm.holds.map(h => sac(h.n, holdCap())).join('');
  if (!c) return '';
  if (c.type === 'ligase') return c.ports.map(p => alveole(p.length ? markOf(p[0]) : '', p.length ? '' : 'next')).join('');
  if (c.type === 'join') return c.ports.slice(0, 2).map(p => p.length ? geneMark(p[0]) : alveole('', 'next')).join('<span>+</span>');
  if (c.type === 'pack') {
    const [goods, carbon] = c.ports, box = BOX[c.box];
    const genes = Array.from({length:fill(c.box)}, (_, i) => i < goods.length ? alveole(markOf(goods[0][0])) : alveole('', i === goods.length ? 'next' : '')).join('');
    return genes + Array.from({length:box.carbon}, (_, i) => i < carbon.length ? alveole(markOf('K') || 'C') : alveole('')).join('');
  }
  if (isGun(c)) return Object.entries(c.ammo).filter(([, n]) => n).slice(0, 4).map(([gene, n]) => `${geneMark(gene)}<b>${n}</b>`).join('');
  if (c.type === 'cyst' || c.type === 'vault') return sac(c.stock.length, capOf(c));
  if (c.type === 'borer') return sac(c.stock.length, BORER.hold);
  if (c.type === 'pump') return sac(c.stock.length, VEIN.cap);
  if (c.type === 'pocket') return sac(c.stock.length, pocketCap(c));
  if (c.type === 'sort' || c.type === 'gate') {
    const id = key(c.x, c.y);
    if (G.wires.some(w => w.a === id || w.b === id)) return [1, 2, 3].map(at => `<span class="cellule ${!c.read || c.read === at ? 'lit' : ''}">${at}</span>`).join('');
  }
  return '';
}
// ---- The core's sheet (docs/design/core-panel-v2): one demand at a time, its recipe drawn from the bases down
// to the core. Green is made already, dashed is still to make, red is a machine set wrong. No gene in letters.
const BOX_EDGE = {A:'#F0A03C', T:'#55D6E8', H:'#D08CFF'};
const picture = item => { const box = boxOf(item), body = contentOf(item); return box ? L`<span class="crate" role="img" aria-label="${BOX[box].name} de ${fill(box)}">${geneMark(body)}</span>` : geneMark(body); };
const kindOf = item => boxOf(item) ? BOX[boxOf(item)].name.toLowerCase() : contentOf(item).length === 6 ? L('brin') : L('gène');
const titleOf = item => boxOf(item) ? BOX[boxOf(item)].name : contentOf(item).length === 6 ? L('Brin') : GENES[item] || L('Gène');
// What the base already makes: the matter under each harvester, and what each machine last gave.
function madeNow() {
  const made = new Set();
  for (const c of allCells()) {
    if (!built(c)) continue;
    if (c.type === 'mine') made.add(matterUnder(c));
    if (c.last) made.add(c.last);
  }
  return made;
}
// The encapsulator set wrong for this recipe, with what it says.
function troubleFor(item) {
  if (!boxOf(item)) return null;
  for (const c of allCells()) { const t = packTrouble(c); if (t && t.gene === contentOf(item)) return {c, ...t}; }
  return null;
}
// The mechanic a stage asks for (item_019): its building, what counts, the card that teaches it.
export const MECHANIC = {
  sort:{type:'sort', unit:'', what:L('Un trieur envoie de côté ce qui correspond à son filtre : chaque objet trié compte.')},
  nerve:{type:'wire', unit:'', what:L('Un feu ou un trieur commandé par un nerf : chaque objet qu’il laisse passer ou trie compte.')},
  turret:{type:'turret', unit:'', what:L('Charge des tourelles en chargeurs d’antidote : chaque créature tuée par son antidote compte.')},
  outpost:{type:'mine', unit:' s', what:L('Un récolteur sur un gisement gardé, à portée d’un nid : chaque seconde où il tient compte.')},
};
export const mechanicName = need => need === 'outpost' ? L('Avant-poste') : TYPES[MECHANIC[need].type].name;
// The goals the sheet shows: drawn recipes, or the one an older stage asks for.
function sheetGoals(want) {
  if (G.goals && (G.goals.length > 1 || (G.base && G.goals.length))) return G.goals;
  if (want.rate) return [{item:want.item, count:want.hold, fed:Math.floor(G.held), rate:true}];
  return [{item:want.item, count:want.count, fed:G.fed}];
}
const glyphAt = (b, x, y, size) => `<svg x="${x - size / 2}" y="${y - size / 2}" width="${size}" height="${size}" viewBox="0 0 18 18">${SHAPE[b] || ''}</svg>`;
const bodyAt = (body, x, y, size) => {
  const step = size + 2, width = body.length * step + (body.length > 3 ? 6 : 0);
  return [...body].map((b, i) => glyphAt(b, x - width / 2 + step / 2 + i * step + (i >= 3 ? 6 : 0), y, size)).join('');
};
const node = (x, y, w, h, state, inner, label = '') => `<g class="node ${state}"${label ? ` role="img" aria-label="${label}"` : ''}><rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="8"/>${inner}</g>`;
const flow = (d, on = false) => `<path class="flow${on ? ' on' : ''}" d="${d}" marker-end="url(#sw-${on ? 'on' : 'to'})"/>`;
const words = (x, y, text, cls = 'small', anchor = 'middle') => `<text class="${cls}" x="${x}" y="${y}" text-anchor="${anchor}">${text}</text>`;
function machineNode(x, y, w, name, note, bad = false) {
  return `<g class="machine${bad ? ' bad' : ''}" role="img" aria-label="${name}"><rect x="${x - w / 2}" y="${y - 22}" width="${w}" height="44" rx="6"/>`
    + (note ? `${words(x, y - 2, name, 'big')}${words(x, y + 15, note, bad ? 'small bad' : 'small')}` : words(x, y + 5, name, 'big')) + '</g>';
}
export function recipeSVG(item, made, trouble, fed) {
  const box = boxOf(item), body = contentOf(item), genes = body.match(/.{3}/g), two = genes.length === 2;
  const sides = [L('gauche'), L('derrière'), L('droite')], out = [];
  const centres = two ? [82, 246] : [164], gap = two ? 44 : 90, size = two ? 34 : 44, top = 22;
  const lig = two ? 78 : 96, geneY = lig + 56;
  genes.forEach((gene, g) => {
    const cx = centres[g];
    [...gene].forEach((b, i) => {
      const x = cx + (i - 1) * gap;
      out.push(node(x, top, size, size * .8, made.has(b) ? 'have' : 'miss', glyphAt(b, x, top, two ? 20 : 24), MATTER[b]));
      if (!two) out.push(words(i === 2 ? x + size / 2 + 5 : x - size / 2 - 5, top + 4, String(i + 1), 'lbl', i === 2 ? 'start' : 'end'));
      if (two) out.push(words(x, top + 26, sides[i]));
      else out.push(words(x, top + 31, MATTER[b]), words(x, top + 43, sides[i]));
      const below = top + (two ? 30 : 47), half = two ? 30 : 38;
      out.push(i === 1 ? flow(`M${x} ${below} V${lig - 24}`) : flow(`M${x} ${below} V${lig} H${cx + (i ? half : -half)}`));
    });
    out.push(machineNode(cx, lig, two ? 60 : 76, L('Ligase')));
    out.push(flow(`M${cx} ${lig + 22} V${geneY - 19}`));
    out.push(node(cx, geneY, 70, 32, made.has(gene) ? 'have' : 'miss', bodyAt(gene, cx, geneY, 14), GENES[gene] || L('Gène')));
  });
  let y = geneY, x = 164;
  if (two) {
    const asm = geneY + 56;
    out.push(flow(`M82 ${geneY + 16} V${asm} H${164 - 52}`), flow(`M246 ${geneY + 16} V${asm} H${164 + 52}`));
    out.push(words(70, asm - 6, '1', 'lbl'), words(258, asm - 6, '2', 'lbl'));
    out.push(machineNode(164, asm, 100, L('Assembleur')));
    y = asm + 54;
    out.push(flow(`M164 ${asm + 22} V${y - 19}`));
    out.push(node(164, y, 120, 32, made.has(body) ? 'have' : 'miss', bodyAt(body, 164, y, 13), L('Brin')));
  }
  if (box) {
    const pack = y + 60, bad = trouble?.want ? trouble.c.box : null;
    out.push(flow(`M164 ${y + 17} V${pack - 24}`));
    const note = bad ? L`réglé sur ${BOX[bad].name.toLowerCase()} ✗` : L`sur ${BOX[box].name.toLowerCase()}`;
    out.push(machineNode(164, pack, 116, L('Encapsuleur'), note, Boolean(trouble)));
    out.push(`<g role="img" aria-label="${L('carbone')}">${glyphAt('K', 276, pack, 26)}</g>`, words(276, pack - 18, L`${BOX[box].carbon} carbone`), words(276, pack + 27, L('à l’est du cœur')));
    out.push(flow(`M260 ${pack} H${164 + 62}`));
    if (BOX[box].isotope) {
      out.push(`<g role="img" aria-label="${MATTER.I}">${glyphAt('I', 52, pack, 26)}</g>`, words(52, pack - 18, L`${BOX[box].isotope} isotope`));
      out.push(flow(`M68 ${pack} H${164 - 62}`));
    }
    y = pack + 58;
    out.push(flow(`M164 ${pack + 22} V${y - 18}`));
    const have = made.has(item) || fed > 0, w = two ? 124 : 90;
    out.push(`<g class="crate-node ${have ? 'have' : 'miss'}" role="img" aria-label="${BOX[box].name}"><path d="M${164 - w / 2} ${y - 16}H${164 + w / 2 - 6}L${164 + w / 2} ${y - 10}V${y + 10}L${164 + w / 2 - 6} ${y + 16}H${164 - w / 2 + 6}L${164 - w / 2} ${y + 10}V${y - 10}Z" style="stroke:${BOX_EDGE[box]}"/>${bodyAt(body, 164, y, 13)}</g>`);
    x = 164 + w / 2;
  } else x = 164 + (two ? 60 : 35);
  // Into the core, on the right of what it eats.
  out.push(flow(`M${x + 4} ${y} H${280 - 24}`, true));
  out.push(`<g class="heart" role="img" aria-label="${L('cœur')}"><circle cx="280" cy="${y}" r="20"/><path transform="translate(280 ${y})" d="M0 7C-11 -1 -9 -10 -3 -9C-1 -9 0 -7 0 -6C0 -7 1 -9 3 -9C9 -10 11 -1 0 7Z"/></g>`, words(280, y + 36, L('cœur')));
  const height = y + 44;
  return `<svg class="recipe" viewBox="0 0 328 ${height}" role="img" aria-label="${L('Recette')}"><defs><marker id="sw-to" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#52707A"/></marker><marker id="sw-on" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#B7F34A"/></marker></defs>${out.join('')}</svg>`;
}
export function coreSheet() {
  const want = STAGES[G.stage];
  if (!want) return '';
  const goals = sheetGoals(want);
  if (ui.goalStage !== G.stage) { ui.goalStage = G.stage; ui.goalPick = null; ui.sheetTab = 'asks'; }
  const all = goals.length + (G.base && G.goals ? (G.needs || []).length : 0);
  const first = Math.max(0, goals.findIndex(g => g.fed < g.count)), pick = (ui.goalPick ?? -1) >= 0 && ui.goalPick < all ? ui.goalPick : first, chosen = goals[Math.min(pick, goals.length - 1)];
  const hungry = G.base ? hungryFor() : [], made = madeNow();
  const part = stagePart() ?? 1;
  const steps = STAGES.map((_, i) => `<i class="${i < G.stage ? 'done' : i === G.stage ? 'now' : ''}"${i === G.stage ? ` style="--part:${(part * 100).toFixed(0)}%"` : ''}></i>`).join('');
  const info = ui.sheetTab === 'info';
  const head = `<div class="core-head"><span><b>${L`Stade ${G.stage + 1}`}</b><small>${L`sur ${STAGES.length} · ${want.name}`}</small></span><span class="steps" aria-hidden="true">${steps}</span>`
    + `<button class="stage-info${hungry.length ? ' alert' : ''}" data-sheet-tab="info" aria-pressed="${info}" aria-label="${L('Le stade : l’histoire, les gènes de base et ce qu’il débloque')}">i</button></div>`;
  const needs = G.base && G.goals ? G.needs || [] : [];
  const tabs = `<div class="demands" role="tablist">${goals.map((g, i) => {
    const met = g.fed >= g.count, blocked = !met && troubleFor(g.item);
    return `<button role="tab" class="demand${met ? ' met' : ''}${blocked ? ' alert' : ''}" data-goal="${i}" aria-selected="${!info && i === pick}">${picture(g.item)}${met ? '<b class="tick">✓</b>' : ''}<small>${kindOf(g.item)}</small></button>`;
  }).join('')}${needs.map((n, k) => {
    const i = goals.length + k, met = n.fed >= n.count;
    return `<button role="tab" class="demand need${met ? ' met' : ''}" data-goal="${i}" aria-selected="${!info && i === pick}">${machineOf(MECHANIC[n.need].type, mechanicName(n.need))}${met ? '<b class="tick">✓</b>' : ''}<small>${mechanicName(n.need)}</small></button>`;
  }).join('')}</div>`;
  if (info) return head + tabs + stageInfo(want, hungry);
  if (pick >= goals.length && needs[pick - goals.length]) return head + tabs + needView(needs[pick - goals.length]);
  const trouble = troubleFor(chosen.item), met = chosen.fed >= chosen.count, done = Math.min(1, chosen.fed / chosen.count);
  const figure = n => n.toFixed(1).replace('.', DEC);
  const count = chosen.rate ? `${Math.floor(chosen.fed)}<small> / ${chosen.count} s</small>` : `${Math.floor(chosen.fed)}<small> / ${chosen.count}</small>`;
  const demand = `<div class="asked"><h4><small>${L('Le cœur veut')}</small>${picture(chosen.item)}<span>${titleOf(chosen.item)}</span></h4><span class="count">${met ? '✓' : count}</span></div>`
    + `<div class="gauge${met ? ' done' : ''}"><i style="width:${(done * 100).toFixed(1)}%"></i></div>`
    + (chosen.rate ? L`<div class="legend"><span>débit <b>${figure(mealRate())} / s</b> sur ${want.rate}</span><span>${L('2 lignes en parallèle')}</span></div>` : '');
  const warns = [];
  if (trouble) warns.push(`<p class="warn"><b>${L('Bloqué :')}</b> ${sentenceHTML(trouble.text)}</p>`);
  const legendKey = `<div class="key"><span>${L('tu le produis')}</span><span class="miss">${L('à faire')}</span></div>`;
  return head + tabs + demand + recipeSVG(chosen.item, made, trouble, chosen.fed) + warns.join('') + legendKey;
}
// A mechanic asked: its count, what counts, and the card that shows how it works.
function needView(n) {
  const m = MECHANIC[n.need], met = n.fed >= n.count, done = Math.min(1, n.fed / n.count);
  return `<div class="asked"><h4><small>${L('Ce stade demande')}</small>${machineOf(m.type, mechanicName(n.need))}<span>${mechanicName(n.need)}</span></h4><span class="count">${met ? '✓' : `${Math.floor(n.fed)}<small> / ${n.count}${m.unit}</small>`}</span></div>`
    + `<div class="gauge${met ? ' done' : ''}"><i style="width:${(done * 100).toFixed(1)}%"></i></div>`
    + `<p class="need-what">${m.what}</p><button type="button" class="tip" data-card="${m.type === 'wire' ? 'wire' : m.type}">${L('Voir comment il marche')}</button>`;
}
// Out of the main view: what it is all for, where the organism stands, the base genes and what comes next.
function stageInfo(want, hungry) {
  const frieze = `<div class="frieze">${STAGES.map((s, i) => `<span class="${i < G.stage ? 'done' : i === G.stage ? 'now' : ''}"><i>${i < G.stage ? '✓' : i + 1}</i>${s.name}</span>`).join('')}</div>`;
  const story = `<p class="story">${L('La souche est malade. Une mutation la ronge de l’intérieur et chaque brèche en crache une forme nouvelle. Tu écris son antidote, gène après gène, jusqu’à ce que l’organisme guérisse et éclose.')}</p><p class="unit">${L`Stade ${G.stage + 1} sur ${STAGES.length} : ${want.name}`}</p>`;
  const base = G.base ? `<h3>${L('Gènes de base')}</h3><div class="base-genes">${eaten().map(gene => `<span class="${hungry.includes(gene) ? 'hungry' : 'fed'}">${picture(gene)}</span>`).join('')}</div>${hungry.length ? `<p class="unit hungry">${L`Le cœur a faim de ${hungry.map(geneMark).join(' ')} : livraisons comptées à moitié.`}</p>` : ''}` : '';
  const gives = Object.keys(NEEDS).filter(type => NEEDS[type] === G.stage + 1).map(type => [type, TYPES[type].name]);
  if (G.stage + 1 > 1 && G.stage + 1 <= 3) gives.push(['mine', L`Gisements ×${G.stage + 1 === 2 ? '2' : L('4 à ×8')}`]);
  for (const mk of [2, 3]) if (RANK_NEED[mk - 1] === G.stage + 1) gives.push(['belt', L`Rang MK${mk}`]);
  const giving = `<h3>${L('Débloque')}</h3>` + (gives.length ? `<div class="gives">${gives.map(([type, name]) => `<span>${machineOf(type, name).replace(' machine', '')}${name}</span>`).join('')}</div>` : `<p class="unit">${want.gives}</p>`);
  const asks = (G.base && G.needs?.length) ? `<h3>${L('Ce stade demande')}</h3><p class="unit">${G.needs.map(n => mechanicName(n.need)).join(', ')}</p>` : '';
  return `<div class="stage-page">${story}${frieze}${base}${asks}${giving}</div>`;
}
export function labSheet() {
  const tab = LAB_TABS[ui.labTab] ? ui.labTab : 'drones';
  // Each tab shows how many levels it has bought, and a dot when one of its upgrades can be bought now.
  const tabs = Object.entries(LAB_TABS).map(([key, name]) => {
    const ups = Object.entries(UPGRADES).filter(([, up]) => up.cat === key);
    const got = ups.reduce((n, [id]) => n + labNext(id), 0), all = ups.reduce((n, [, up]) => n + up.prices.length, 0);
    const ready = ups.some(([id, up]) => { const price = labPrice(id); return price != null && price <= G.dna && unlocked(up.stages[labNext(id)] - 1) && !(id === 'drones' && G.drones.length >= MOST_DRONES); });
    return `<button class="${key === tab ? 'on' : ''}" data-lab-tab="${key}" aria-pressed="${key === tab}">${name}<small>${got}/${all}</small>${ready ? '<i aria-label="' + L('achat possible') + '"></i>' : ''}</button>`;
  }).join('');
  return `<h3>${L('Améliorations')}</h3><div class="labtabs" role="group">${tabs}</div><div class="ups">${Object.entries(UPGRADES).map(([id, up]) => {
    const next = labNext(id), price = labPrice(id), max = price == null || (id === 'drones' && G.drones.length >= MOST_DRONES), open = !max && unlocked(up.stages[next] - 1);
    const pips = up.prices.map((_, k) => `<i class="${k < next ? 'on' : ''}"></i>`).join('');
    const act = max ? `<span class="buy max">${L('Max')}</span>` : !open ? `<span class="buy lock">${L`stade ${up.stages[next]}`}</span>` : `<button class="buy${price > G.dna ? ' short' : ''}" data-up="${id}">${L`${price} ADN`}</button>`;
    return `<div class="up"${up.cat === tab ? '' : ' hidden'}><div><b>${up.name}</b><small>${up.what}</small><div class="pips">${pips}</div></div>${act}</div>`;
  }).join('')}</div>`;
}
export function paintSheet(c) {
  if (c?.type === 'lab' && built(c)) {
    const sheet = $('sheet'), html = labSheet();
    sheet.hidden = false; $('message').hidden = true;
    if (sheet.innerHTML !== html) sheet.innerHTML = html;
    return;
  }
  const sheet = $('sheet'), on = c?.type === 'core' && Boolean(STAGES[G.stage]);
  sheet.hidden = !on;
  $('message').hidden = on;
  if (!on) return;
  const html = coreSheet();
  if (sheet.innerHTML === html) return;
  sheet.innerHTML = html;
  for (const el of sheet.querySelectorAll('[data-model]')) showModel(el, el.dataset.model);
}
export function builtNow() {
  const n = {S:0, F:0, C:0, N:0, ligase:0};
  for (const c of allCells()) {
    if (c.type === 'mine' && n[matterUnder(c)] != null) n[matterUnder(c)]++;
    if (c.type === 'ligase') n.ligase++;
  }
  return n;
}
export function startGuide() {
  G.guide = {step:0, base:builtNow(), hidden:false};
  ui.guideSpot = null;
}
// A belt's way on free ground from beside a building to a cell that suits: the cells a player can follow, or null.
// The goal cell itself may hold a belt already; every other cell of the way must be free and buildable.
export function guideRoute(from, done, goal = null, limit = 1600) {
  const id = (x, y) => `${x},${y}`, back = new Map(), queue = [], size = sizeOf(from);
  // A harvester or a Ligase gives only by its arrow: the way starts there.
  const exit = (from.type === 'mine' || from.type === 'ligase') && size === 1 ? {x:from.x + DX[from.dir], y:from.y + DY[from.dir]} : null;
  // Kept for the guide's other belts: the Ligase's other inputs, and its way out to the core.
  const kept = new Set(), lig = guideLigase(), core = coreCell();
  if (lig && from !== lig) {
    for (let d = 0; d < 4; d++) kept.add(id(lig.x + DX[d], lig.y + DY[d]));
    for (let k = 1; k <= 6 && cellAt(lig.x + DX[lig.dir] * k, lig.y + DY[lig.dir] * k) !== core; k++) kept.add(id(lig.x + DX[lig.dir] * k, lig.y + DY[lig.dir] * k));
  }
  for (let i = -1; i <= size; i++) for (let j = -1; j <= size; j++) {
    if ((i < 0 || i >= size) === (j < 0 || j >= size)) continue;
    const x = from.x + i, y = from.y + j;
    if (exit && (x !== exit.x || y !== exit.y)) continue;
    if (cellAt(x, y) || !placeable(x, y)) continue;
    back.set(id(x, y), null); queue.push({x, y});
  }
  while (queue.length && back.size < limit) {
    const c = queue.shift();
    if (done(c)) { const way = []; for (let n = c; n; n = back.get(id(n.x, n.y))) way.unshift(n); return way; }
    for (let d = 0; d < 4; d++) {
      const n = {x:c.x + DX[d], y:c.y + DY[d]};
      if (back.has(id(n.x, n.y)) || !inside(n.x, n.y)) continue;
      const isGoal = goal && n.x === goal.x && n.y === goal.y, there = cellAt(n.x, n.y);
      if (!isGoal && kept.has(id(n.x, n.y))) continue;
      // A belt crossed square on, straight through to free ground beyond: drawing it there lays a bridge.
      if (!isGoal && there?.type === 'belt' && there.dir % 2 !== d % 2) {
        const past = {x:n.x + DX[d], y:n.y + DY[d]};
        if (!back.has(id(past.x, past.y)) && !kept.has(id(past.x, past.y)) && inside(past.x, past.y) && !cellAt(past.x, past.y) && placeable(past.x, past.y)) {
          back.set(id(n.x, n.y), c); back.set(id(past.x, past.y), n); queue.push(past);
        }
        continue;
      }
      if (!(isGoal && (!there || isBelt(there))) && (there || !placeable(n.x, n.y))) continue;
      back.set(id(n.x, n.y), c); queue.push(n);
    }
  }
  return null;
}
// The Ligase the guide speaks of: the one nearest the core.
export function guideLigase() {
  let best = null;
  for (const c of allCells()) if (c.type === 'ligase' && (!best || Math.hypot(c.x - CORE.x, c.y - CORE.y) < Math.hypot(best.x - CORE.x, best.y - CORE.y))) best = c;
  return best;
}
// Each step is checked on the game itself: a base that reached its input, a gene the core ate.
export function guideDone(step, now) {
  const base = G.guide.base, want = GUIDE[step], fed = G.fed >= 1 || G.stage > 0, placed = now.ligase >= base.ligase + 1;
  // A harvester a base of the gene: the second of a base it holds twice counts on top of the first.
  if (step <= 2) { const gene = guideGene(), b = gene[step]; return now[b] >= (base[b] || 0) + [...gene.slice(0, step + 1)].filter(x => x === b).length; }
  if (step === 3) return tool === 'ligase' || placed || fed;
  if (step === 4) return placed || fed;
  // Read as the input is now: its base waiting there, or a gene already made from all three.
  if (want.port != null) { const lig = guideLigase(); return Boolean(lig?.ports[want.port].includes(guideGene()[want.port]) || lig?.last) || fed; }
  return fed;
}
// What stands in the way, said in the step: a wrong base in an input, or why no gene reaches the core.
export function guideHint(want) {
  const lig = guideLigase();
  if (!lig) return '';
  if (ui.guideNoRoute === 'mine') return L('Aucune sortie de récolteur ne mène librement à cette entrée : touche un récolteur et Tourner pour que sa flèche regarde la Ligase, fais de la place, ou déplace la Ligase.');
  if (ui.guideNoRoute) return L('Aucun chemin libre jusque-là : fais de la place, ou déplace la Ligase.');
  if (want.port != null) {
    const wrong = lig.ports[want.port].find(b => b !== guideGene()[want.port]);
    return wrong ? L`L’entrée ${want.port + 1} reçoit ${named(wrong)} : il lui faut ${named(guideGene()[want.port])}. Démonte ce tapis et relie le bon récolteur.` : '';
  }
  if (!want.core) return '';
  // The red line the diagnosis draws is the player's: it is put back as it was.
  const was = chain, text = diagnose(lig);
  mainSet.chain(was);
  return L`Ligase : ${text}`;
}
// How to reach the machine of a step from the dock, while it is not in hand.
export function howTo(want) {
  if (!want.pick || tool === want.pick) return '';
  const families = [...$('tools').querySelectorAll('.family')], fam = families.findIndex(b => b.dataset.family === want.family);
  const pods = [...$('tools').querySelectorAll(`.tray[data-tray="${want.family}"] [data-type]`)], at = pods.findIndex(b => b.dataset.type === want.pick);
  if (fam < 0 || at < 0) return '';
  return L`Ouvre ${FAMILIES[fam][1]} (touche ${fam + 2}), puis prends ${TYPES[want.pick].name} (Maj+${at + 1}).`;
}
// The free deposit cell of that base nearest the core, kept until something stands on it.
export function guideSpot(step) {
  const want = GUIDE[step];
  ui.guideTrace = null; ui.guidePort = null; ui.guideNoRoute = false;
  const old = ui.guideSpot, middle = s => s && {...s, x:s.x + .5, y:s.y + .5};
  if (want.place) {
    // Two cells clear of the core's right side, level with its middle (three if that is taken), its way out to the
    // core: room for its three inputs and a short belt in. Else the same on the left, below, then above.
    if (old?.step === step && !cellAt(old.x, old.y) && placeable(old.x, old.y)) return middle(old);
    const core = coreCell() || {x:CORE.x, y:CORE.y, type:'core'}, n = sizeOf(core), mid = {x:core.x + Math.floor(n / 2), y:core.y + Math.floor(n / 2)};
    const open = (x, y) => !cellAt(x, y) && !depositAt(x, y) && placeable(x, y);
    let best = null;
    for (const side of [1, 3, 2, 0]) for (const gap of [2, 3]) for (const shift of [0, -1, 1, -2, 2]) {
      if (best) break;
      const along = side % 2 ? {x:side === 1 ? core.x + n - 1 + gap + 1 : core.x - gap - 1, y:mid.y + shift} : {x:mid.x + shift, y:side === 2 ? core.y + n - 1 + gap + 1 : core.y - gap - 1};
      const back = (side + 2) % 4, room = [0, 1, 2, 3].filter(d => d !== back).map(d => ({x:along.x + DX[d], y:along.y + DY[d]}));
      const gapCells = Array.from({length:gap}, (_, i) => ({x:along.x + DX[back] * (i + 1), y:along.y + DY[back] * (i + 1)}));
      if ([along, ...room, ...gapCells].every(c => open(c.x, c.y))) best = along;
    }
    ui.guideSpot = best && {step, x:best.x, y:best.y};
    return middle(ui.guideSpot);
  }
  if (want.port != null || want.core) {
    const lig = guideLigase();
    if (!lig) return null;
    const m = centreOf(lig);
    if (want.core) {
      const out = {x:m.x + DX[lig.dir], y:m.y + DY[lig.dir]}, core = coreCell();
      const touches = n => [0, 1, 2, 3].some(d => cellAt(n.x + DX[d], n.y + DY[d]) === core);
      if (cellAt(Math.floor(out.x), Math.floor(out.y)) === core) return out;
      const route = guideRoute(lig, touches);
      ui.guideNoRoute = !route;
      if (route) ui.guideTrace = [m, ...route.map(n => ({x:n.x + .5, y:n.y + .5})), centreOf(core)];
      return out;
    }
    const side = portSide(lig, want.port), at = {x:m.x + DX[side], y:m.y + DY[side]};
    // A harvester of that base not yet feeding anything first, then the nearest; the trace is a belt's real way to it.
    const goal = {x:Math.floor(at.x), y:Math.floor(at.y)}, free = c => !isBelt(cellAt(c.x + DX[c.dir], c.y + DY[c.dir]));
    const mines = [...allCells()].filter(c => c.type === 'mine' && matterUnder(c) === want.base)
      // @ts-expect-error: loose typing, tightened module by module (item_007)
      .sort((a, b) => (free(b) - free(a)) || Math.hypot(a.x - at.x, a.y - at.y) - Math.hypot(b.x - at.x, b.y - at.y));
    ui.guideNoRoute = mines.length > 0 && 'mine';
    // The shortest real way from a harvester not yet feeding anything, else from any.
    let way = null;
    for (const c of mines) {
      const route = guideRoute(c, n => n.x === goal.x && n.y === goal.y, goal);
      if (route && (!way || free(c) > free(way.c) || (free(c) === free(way.c) && route.length < way.route.length))) way = {c, route};
    }
    if (way) { ui.guideTrace = [centreOf(way.c), ...way.route.map(n => ({x:n.x + .5, y:n.y + .5}))]; ui.guideNoRoute = false; }
    ui.guidePort = want.port;
    return at;
  }
  if (!want.base) return null;
  if (old?.step === step && !cellAt(old.x, old.y)) return middle(old);
  // The second harvester of a base goes on the other side of the core from the first when that is not much
  // farther: the Ligase takes that base on both its sides, and each belt then stays short.
  const first = step > 0 && GUIDE.slice(0, step).some(s => s.base === want.base) ? [...allCells()].find(c => c.type === 'mine' && matterUnder(c) === want.base) : null;
  const across = (x, y) => first && Math.sign(y - CORE.y) === -Math.sign(first.y - CORE.y) && first.y !== CORE.y;
  let best = null, other = null;
  for (let r = 2; r <= 26; r++) for (let x = CORE.x - r; x <= CORE.x + r; x++) for (let y = CORE.y - r; y <= CORE.y + r; y++) {
    if (Math.max(Math.abs(x - CORE.x), Math.abs(y - CORE.y)) !== r || depositAt(x, y) !== want.base || cellAt(x, y) || !placeable(x, y)) continue;
    const d = Math.hypot(x - CORE.x, y - CORE.y);
    if (!best || d < best.d) best = {x, y, d};
    if (across(x, y) && (!other || d < other.d)) other = {x, y, d};
  }
  if (other && other.d <= best.d * 1.6) best = other;
  ui.guideSpot = best && {step, x:best.x, y:best.y};
  return middle(ui.guideSpot);
}
// The steps of the guide under way: the first workshop, or the first defence.
const guideSteps = () => G.guide?.kind === 'defense' ? DEFENSE_GUIDE : GUIDE;
// The first defence, read on the game: one more turret, a turret holding genes, a nerve on a turret, one more wall.
function defenseDone(step) {
  const base = G.guide.base, count = type => allCells().filter(c => c.type === type).length, turrets = allCells().filter(c => c.type === 'turret');
  if (step === 0) return count('turret') > (base.turret || 0);
  if (step === 1) return turrets.some(c => Object.values(c.ammo || {}).some(n => n > 0));
  if (step === 2) return G.wires.length > (base.wire || 0) && G.wires.some(w => turrets.some(c => key(c.x, c.y) === w.a || key(c.x, c.y) === w.b));
  return count('wall') > (base.wall || 0);
}
export function paintGuide() {
  const g = G.guide, GUIDE = guideSteps(), defense = g?.kind === 'defense', live = Boolean(g) && g.step < GUIDE.length && !G.over && !orbit.on;
  if (live) {
    // A base seen in an input stays seen: the Ligase empties its inputs once the gene is made.
    const now = builtNow();
    while (g.step < GUIDE.length && (defense ? defenseDone(g.step) : guideDone(g.step, now))) {
      g.step++;
      earn('guide', 5);
      // A step done shows in the guide's list and the DNA count; only the end gets a note in the events.
      if (g.step >= GUIDE.length) tell(defense ? L('Première défense en place : +5 ADN. Le guide se range dans le menu.') : L('Premier atelier en marche : +5 ADN. Le guide se range dans le menu.'));
    }
  }
  const on = live && g.step < GUIDE.length && !g.hidden;
  $('guide').hidden = !on;
  $('guide-open').hidden = !(live && g.step < GUIDE.length && g.hidden);
  $('app').classList.toggle('guide-folded', !$('guide-open').hidden);
  $('app').classList.toggle('guiding', on);
  // The button to press, in the dock and in the open family, while the machine is not in hand.
  const want = on ? GUIDE[g.step] : null, need = Boolean(want?.pick) && tool !== want.pick;
  for (const b of $('tools').querySelectorAll('.family')) b.classList.toggle('call', need && b.dataset.family === want.family);
  $('tools').querySelectorAll('.tray [data-type]').forEach(b => {
    const call = need && ui.family === want.family && b.dataset.type === want.pick && b.closest('.tray').dataset.tray === want.family;
    b.classList.toggle('call', call);
    if (call) b.dataset.guideKey = `Maj+${[...b.parentElement.querySelectorAll('[data-type]')].indexOf(b) + 1}`; else delete b.dataset.guideKey;
  });
  $('tools').classList.toggle('guide-dim', need);
  const name = defense ? L('Ta première défense') : L('Premier atelier');
  $('guide-name').textContent = name; $('guide-show').textContent = name;
  if (!on) { $('guide-spot').hidden = true; return; }
  const step = GUIDE[g.step], base = step.base ? markOf(step.base) : '';
  $('guide-no').textContent = L`étape ${g.step + 1} sur ${GUIDE.length}`;
  const title = `${step.title}${base}`;
  if ($('guide-title').innerHTML !== title) $('guide-title').innerHTML = title;
  if ((step.pick === 'mine' || step.place) && tool === step.pick && ui.guideTurned !== g.step) {
    // Its arrow is its one way out: turned toward the core as it is taken, the player can still turn it with R.
    const from = guideSpot(g.step), core = centreOf(coreCell() || CORE), dx = core.x - (from?.x ?? core.x), dy = core.y - (from?.y ?? core.y);
    if (from) { ui.guideTurned = g.step; setHeading(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0)); }
  }
  const arrow = step.pick === 'mine' ? L('Sa flèche est sa seule sortie : le guide la tourne vers le cœur, R pour la changer.') : '';
  write($('guide-why'), [step.why, arrow, howTo(step), defense ? '' : guideHint(step)].filter(Boolean).join(' '));
  showModel($('guide-model'), step.model);
  const list = GUIDE.map((s, i) => `<li class="${i < g.step ? 'done' : i === g.step ? 'now' : ''}"><i>${i < g.step ? '✓' : i + 1}</i><span>${s.list}</span>${s.base ? markOf(s.base) : ''}</li>`).join('');
  if ($('guide-steps').innerHTML !== list) $('guide-steps').innerHTML = list;
  $('app').style.setProperty('--guide-h', `${$('guide').offsetHeight}px`);
  ui.guidePoint = defense ? null : guideSpot(g.step);
}
// The map the player sees: inside the screen, clear of the top bar, the side buttons, the dock and the guide.
// gap: how far from what covers it, 20 px for the circle to read, more for the arrow to fit.
export function freeBox(gap) {
  const box = {l:gap, t:70 + gap, r:view.w - 60 - gap, b:view.h - gap};
  const dock = $('tools').getBoundingClientRect();
  if (dock.height) box.b = Math.min(box.b, dock.top - gap);
  if (!$('guide').hidden) {
    const g = $('guide').getBoundingClientRect();
    if (NARROW.matches) box.t = Math.max(box.t, g.bottom + gap); else box.l = Math.max(box.l, g.right + gap);
  }
  return box;
}
export function placeGuideSpot() {
  const spot = $('guide-spot'), arrow = $('guide-arrow'), trace = $('guide-trace'), ports = $('guide-ports');
  const at = !$('guide').hidden && ui.guidePoint, lig = at && ui.guidePort != null ? guideLigase() : null;
  ports.hidden = !lig;
  if (lig) [...ports.children].forEach((b, i) => {
    const side = portSide(lig, i), m = centreOf(lig), p = screenAt({x:m.x + DX[side] * .62, y:m.y + DY[side] * .62});
    b.style.left = `${p.x}px`; b.style.top = `${p.y}px`; b.classList.toggle('now', i === ui.guidePort);
  });
  trace.hidden = !(at && ui.guideTrace);
  if (!trace.hidden) {
    // Cell by cell, the way a belt can really be laid.
    trace.querySelector('path').setAttribute('d', ui.guideTrace.map((n, i) => { const s = screenAt(n); return `${i ? 'L' : 'M'}${s.x.toFixed(1)} ${s.y.toFixed(1)}`; }).join(''));
  }
  if (!at) { spot.hidden = arrow.hidden = true; return; }
  const p = screenAt(at), seen = freeBox(20), out = p.x < seen.l || p.x > seen.r || p.y < seen.t || p.y > seen.b, box = freeBox(50);
  spot.hidden = out; arrow.hidden = !out;
  if (!out) { spot.style.transform = `translate(${p.x}px,${p.y}px)`; return; }
  // Off screen, at its edge or under the interface: a big arrow on the border of the free map points at it.
  const c = {x:(box.l + box.r) / 2, y:(box.t + box.b) / 2}, a = Math.atan2(p.y - c.y, p.x - c.x), cos = Math.cos(a), sin = Math.sin(a);
  const k = Math.min(Math.abs(((cos < 0 ? box.l : box.r) - c.x) / (cos || 1e-9)), Math.abs(((sin < 0 ? box.t : box.b) - c.y) / (sin || 1e-9)));
  arrow.style.left = `${c.x + cos * k}px`; arrow.style.top = `${c.y + sin * k}px`;
  arrow.firstElementChild.style.transform = `rotate(${a}rad)`;
  // Near the bottom its distance reads above it, clear of the dock.
  arrow.classList.toggle('low', sin > .3);
  const far = L`${Math.round(Math.hypot(at.x - cam.x, at.y - cam.y))} cases`;
  if (arrow.lastElementChild.textContent !== far) arrow.lastElementChild.textContent = far;
}
// A creature as the game draws it: a dark body, its legs, the marks of its gene.
export function creatureIcon(gene) {
  const c = document.createElement('canvas'), g = c.getContext('2d');
  c.width = c.height = 72;
  g.setTransform(64, 0, 0, 64, 36, 36);
  g.strokeStyle = '#B34A5A'; g.lineWidth = .06; g.beginPath();
  for (const dx of [-.16, 0, .16]) { g.moveTo(dx, -.24); g.lineTo(dx, .32); }
  g.stroke();
  g.beginPath(); g.ellipse(0, 0, .36, .2, 0, 0, Math.PI * 2); g.fillStyle = '#3A1820'; g.fill(); g.strokeStyle = '#FF6B6B'; g.stroke();
  [...gene].forEach((b, i) => glyph(g, b, (i - 1) * .22, 0, .1));
  return c;
}
export function introHTML() {
  const sprite = (type, x, y, size, more = '') => `<span class="model sprite ${more}" data-model="${type}" style="left:${x}px;top:${y}px;width:${size}px;height:${size}px"></span>`;
  const lanes = ['M52 32 H118 V78 H134', 'M52 84 H134', 'M52 136 H118 V90 H134'];
  const panels = [
    `<div class="scene">${sprite('core', 110, 18, 80, 'grow')}<div class="pips">${STAGES.map(s => `<span><i></i>${s.name}</span>`).join('')}</div></div>
     <h2>${L('Fais grandir le cœur')}</h2><p>${L('Il passe par 5 stades. À chacun, il débloque de nouvelles machines.')}</p>`,
    `<div class="scene"><svg class="lane" viewBox="0 0 300 170">${[...lanes, 'M178 84 H222'].map(d => `<path d="${d}"/>`).join('')}</svg>
       ${['S', 'F', 'S'].map((b, i) => `${sprite('mine', 6, 10 + i * 52, 44)}<span class="tag" style="left:40px;top:${6 + i * 52}px">${markOf(b)}</span><span class="mover" style="offset-path:path('${lanes[i]}')">${markOf(b)}</span>`).join('')}
       ${sprite('ligase', 134, 62, 44)}<span class="mover gene" style="offset-path:path('M178 84 H222')">${geneMark('SFS')}</span>
       ${sprite('core', 220, 46, 72)}<span class="count">${geneMark('SFS')}<b data-fed>0 / 100</b></span></div>
     <h2>${L('Nourris-le de gènes')}</h2><p>${L('Récolte des bases, assemble-les dans l’ordre qu’il réclame, puis achemine le gène jusqu’à lui.')}</p>`,
    `<div class="scene">${sprite('core', 8, 50, 70)}${sprite('turret', 94, 14, 46)}
       <span class="crawler" data-creature="CCN" style="top:70px"></span><span class="crawler later" data-creature="SSF" style="top:108px"></span>
       <svg class="shot" viewBox="0 0 300 170"><line x1="128" y1="44" x2="160" y2="88"/><line class="later" x1="128" y1="44" x2="160" y2="126"/></svg>
       <span class="burst" style="left:146px;top:88px"></span><span class="burst later" style="left:146px;top:126px"></span></div>
     <h2>${L('Défends-le')}</h2><p>${L('Des créatures sortent des nids et visent le cœur. Charge tes tourelles avec le gène opposé au leur : c’est leur antidote.')}</p>`,
  ];
  return `<div class="card"><p class="kicker" id="intro-no"></p>${panels.map((html, i) => `<div data-intro="${i}" hidden>${html}</div>`).join('')}
    <div class="foot"><div class="dots">${panels.map((_, i) => `<button data-dot="${i}" aria-label="${L`Image ${i + 1}`}"></button>`).join('')}</div>
    <div class="ways"><button class="tip" id="intro-skip">${L('Passer')}</button><button class="tip" id="intro-next">${L('Suivant')}</button></div></div></div>`;
}
export function introShow(i) {
  intro.at = i;
  $('intro').querySelectorAll('[data-intro]').forEach((el, k) => { el.hidden = k !== i; });
  $('intro').querySelectorAll('[data-dot]').forEach((el, k) => el.setAttribute('aria-current', k === i));
  $('intro-no').textContent = L`Ton objectif · ${i + 1} sur 3`;
  $('intro-next').textContent = i === 2 ? L('Commencer') : L('Suivant');
  clearTimeout(intro.timer);
  if (!STILL.matches) intro.timer = setTimeout(() => introShow((intro.at + 1) % 3), 6000);
}
export function showIntro(open) {
  const box = $('intro');
  if (open) {
    if (!box.childElementCount) {
      box.innerHTML = introHTML();
      for (const el of box.querySelectorAll('[data-model]')) showModel(el, el.dataset.model);
      for (const el of box.querySelectorAll('[data-creature]')) el.append(creatureIcon(el.dataset.creature));
      box.onclick = event => {
        const dot = event.target.closest('[data-dot]');
        if (dot) introShow(Number(dot.dataset.dot));
        if (event.target.closest('#intro-skip') || (event.target.closest('#intro-next') && intro.at === 2)) showIntro(false);
        else if (event.target.closest('#intro-next')) introShow(intro.at + 1);
      };
      // The counter follows the genes reaching the core; the core grows a stage every 2 s, its stages lighting in turn.
      let fed = 0, stage = 0;
      setInterval(() => { if (!box.hidden) { fed = (fed + 1) % 101; box.querySelector('[data-fed]').textContent = `${fed} / 100`; } }, 3000);
      const grow = () => {
        box.querySelector('.grow').style.transform = `scale(${[.55, .7, .85, 1, 1.15][stage]})`;
        box.querySelectorAll('.pips i').forEach((el, k) => el.classList.toggle('lit', k <= stage));
        stage = (stage + 1) % STAGES.length;
      };
      grow();
      if (!STILL.matches) setInterval(() => { if (!box.hidden) grow(); }, 2000);
    }
    if (box.hidden) { intro.was = paused; mainSet.paused(true); }
    box.hidden = false;
    introShow(0);
  } else if (!box.hidden) {
    box.hidden = true; clearTimeout(intro.timer);
    mainSet.paused(intro.was);
    paintGuide();
  }
}

export function paintInfo() {
  const c = selected && G.cells[selected], worm = !c && pickedWorm(), any = Boolean(c || worm);
  const busy = tool !== 'hand' || linking || wiring || listening, offers = $('actions').childElementCount > 0;
  const recent = ui.saidAt > 0 && performance.now() - ui.saidAt < 5000 && note !== TYPES.hand.help;
  const info = $('info');
  info.hidden = G.over || !(any || offers || recent || linking || wiring || listening);
  info.classList.toggle('slim', !any && !recent && !linking && !wiring && tool !== 'hand');
  info.classList.toggle('holding', Boolean(busy));
  info.querySelector('.card-head').hidden = !any;
  if (any) {
    const type = worm ? 'worm' : c.type;
    $('card-title').textContent = type === 'core' ? L('Cœur') : TYPES[type].name + (RANKS[type] ? ` MK${rankOf(c)}` : '');
    const parts = [];
    if (c?.type === 'pack') parts.push(BOX[c.box].name);
    if (c?.type === 'bridge') parts.push(`${paceOf(c, 0)}/s ↕ ${paceOf(c, 1)}/s ↔`);
    else if (c?.type === 'belt' || follows(c)) parts.push(`${paceOf(c)}/s`);
    if (c?.up != null) parts.push(L`vers MK${c.upTo}`);
    if (c && isGun(c)) parts.push(L`${String(Math.round(reachOf(c.type) * 10) / 10).replace('.', DEC)} cases`);
    if (c && hasTrait(c.type, 'turn')) parts.push(L(['vers le haut', 'vers la droite', 'vers le bas', 'vers la gauche'][c.dir]));
    const life = worm ? [worm.hp, WORM.hp] : [c.hp, fullHp(c)];
    parts.push(life[0] < life[1] - .5 ? `${Math.ceil(life[0])} / ${life[1]} PV` : `${life[1]} PV`);
    $('card-sub').textContent = parts.join(' · ');
    showModel($('card-model'), type);
  }
  paint('cells', cellsOf(c, worm));
  paintSheet(c);
  paintGuide();
  const row = $('actions');
  row.classList.toggle('more', row.scrollWidth - row.clientWidth - row.scrollLeft > 8);
  $('card').classList.toggle('alert', Boolean(c && ((!isGun(c) && chain.length) || /bloqué|manque|pas branchée|rien à tirer|déborde|rompue|fermée|percée|Branche|blocked|lacks|not connected|nothing to fire|overflows|broken|closed|pierced|Connect/.test($('message').textContent))));
  const picked = c ? `c${selected}` : worm ? `w${worm.id}` : '';
  if (picked !== ui.picked) {
    ui.picked = picked; ui.pickedAt = performance.now();
    if (picked && !busy) { replay(info, 'fresh'); replay($('filament'), 'draw'); }
    else info.classList.remove('fresh');
  } else if (performance.now() - ui.pickedAt > 800) info.classList.remove('fresh'); // Else each rebuilt petal would sprout again.
  ui.at = '';
}
export function paintMoments() {
  if (G.won != null && !G.wonShown) { G.wonShown = true; showVictory(); }
  if (ui.stage != null && G.stage === ui.stage + 1 && G.stage < STAGES.length && G.time - (G.grownAt ?? -1e9) < 3) {
    $('growth').querySelector('.stage').textContent = L`Stade ${G.stage} achevé · +${GROWTH_BONUS} ADN`;
    const got = Object.keys(NEEDS).filter(type => NEEDS[type] === G.stage).map(type => [type, TYPES[type].name]);
    if (G.stage > 1 && G.stage <= 3) got.push(['mine', L`Gisements ×${G.stage === 2 ? '2' : L('4 à ×8')}`]);
    for (const mk of [2, 3]) if (RANK_NEED[mk - 1] === G.stage) got.push(['belt', L`Rang MK${mk}`]);
    $('rewards').replaceChildren(...got.map(([type, name]) => {
      const item = document.createElement('div'), hole = document.createElement('span'), words = document.createElement('span');
      item.className = 'pod'; hole.className = 'porthole model'; words.className = 'name'; words.textContent = name;
      showModel(hole, type); item.append(hole, words);
      return item;
    }));
    $('growth').hidden = false;
    ui.grown = performance.now() + 7000;
  }
  ui.stage = G.stage;
  if (G.over) {
    $('growth').hidden = true;
    const made = Math.floor(G.made).toLocaleString(LOCALE);
    paint('score', [[G.breaches.filter(b => b.state === 'spent').length, L('brèches vidées')], [G.kills, L('créatures tuées')], [made, L('gènes produits')]].map(([n, what]) => `<span><b>${n}</b>${what}</span>`).join(''));
  }
}
// The organism hatched: the tally of the game, then free play or the planet.
export function showVictory() {
  const box = $('victory');
  if (!box.querySelector('svg')) box.prepend($('growth').querySelector('svg').cloneNode(true));
  const minutes = Math.max(1, Math.round(G.won / 60)), made = Math.floor(G.made).toLocaleString(LOCALE);
  box.querySelector('.stage').textContent = L`Victoire en ${minutes} min`;
  paint('victory-score', [[G.kills, L('créatures tuées')], [G.breaches.filter(b => b.state === 'spent').length, L('brèches vidées')], [made, L('gènes produits')], [G.families.length, L('familles affrontées')]].map(([n, what]) => `<span><b>${n}</b>${what}</span>`).join(''));
  // The hatching purifies this hexagon on the planet (req_001); saved now, so leaving at once keeps it.
  ui.opened = null;
  const kept = save();
  $('victory-planet').hidden = !kept;
  $('victory-planet').textContent = ui.opened?.length ? L`Hexagone purifié : ${ui.opened.length} hexagones voisins s’ouvrent sur la planète.` : L('Hexagone purifié sur la planète.');
  $('growth').hidden = true;
  box.hidden = false;
  playSound('stage_up');
  if (kept) offerConcept('purify');
}
export function paintDry() {
  ui.dry = G.over || !G.enemies.length ? [] : allCells().filter(c => isGun(c) && built(c) && !Object.values(c.ammo).some(n => n) && G.enemies.some(e => Math.hypot(e.x - c.x - .5, e.y - c.y - .5) < GUNS[c.type].range * 2)).slice(0, 4);
  const box = $('dry');
  while (box.children.length > ui.dry.length) box.lastChild.remove();
  while (box.children.length < ui.dry.length) box.insertAdjacentHTML('beforeend', L('<i><b></b><span>Tourelle à sec</span></i>'));
}
export function paintHud() {
  paintRanks();
  paintOrganism(); paintThreat(); paintDrones(); paintInfo(); paintMoments(); paintDry();
  sampleStats(); if (ui.stats) paintStats();
  $('app').classList.toggle('paused', paused);
  $('app').classList.toggle('fast', speed > 1);
  $('speed').classList.toggle('on', speed > 1);
  $('pause').classList.toggle('on', paused);
  $('open-row').hidden = Boolean(G.open);
}
// Petals bloom round the object and its card hangs from it. Without room, or with a piece in hand, both dock.
export function followSelection() {
  const c = selected && G.cells[selected], worm = !c && pickedWorm(), info = $('info');
  let p = null, sized = 1;
  if (!info.hidden && !ui.family && !NARROW.matches && tool === 'hand' && !linking && !wiring && (c || worm)) {
    if (c) { p = screenAt(centreOf(c)); sized = sizeOf(c); }
    else { const [x, y] = worm.path[0].split(',').map(Number); p = screenAt({x:x + .5, y:y + .5}); }
    const s = ui.safe;
    if (p.x < s.left || p.x > view.w - s.right || p.y < s.top - 40 || p.y > view.h - s.bottom + 40) p = null;
  }
  const at = p ? `${Math.round(p.x)},${Math.round(p.y)},${Math.round(cam.zoom)},${sized}` : 'docked';
  if (at === ui.at) return;
  ui.at = at;
  const petals = [...$('actions').children], card = $('card'), s = ui.safe;
  let side = 0, reach = 0, wide = 0;
  if (p) {
    info.classList.add('bloom'); info.classList.remove('docked');
    wide = Math.max(0, ...petals.map(el => el.offsetWidth));
    reach = Math.max(38, cam.zoom * sized * .62);
    const toRight = view.w - s.right - p.x, toLeft = p.x - s.left, forCard = reach + 60 + card.offsetWidth, forPetals = reach + 30 + wide;
    if (toRight >= forCard && toLeft >= forPetals) side = 1;
    else if (toLeft >= forCard && toRight >= forPetals) side = -1;
    else p = null;
  }
  info.classList.toggle('bloom', Boolean(p));
  info.classList.toggle('docked', !p);
  $('tether').toggleAttribute('hidden', !p);
  $('events').classList.remove('under');
  // The card never runs under the dock or above the screen: past the room it has, it scrolls.
  const room = view.h - s.top - s.bottom - (p ? 0 : $('actions').offsetHeight + 12);
  card.style.maxHeight = `${Math.max(120, Math.floor(room))}px`;
  if (!p) {
    card.style.left = card.style.top = '';
    for (const el of petals) { el.style.left = el.style.top = ''; el.classList.remove('left'); }
    return;
  }
  const bottom = view.h - s.bottom, gap = 52, n = petals.length, far = reach + 24;
  const first = within(p.y - (n - 1) * gap / 2, s.top + 22, Math.max(s.top + 22, bottom - 22 - (n - 1) * gap));
  const bend = Math.max(far, (n - 1) * gap / 2 + 18);
  petals.forEach((el, i) => {
    const y = first + i * gap, off = Math.abs(y - p.y);
    const out = Math.max(Math.min(far, 34), Math.sqrt(Math.max(0, bend * bend - off * off)) - (bend - far));
    el.classList.toggle('left', side > 0);
    el.style.left = `${p.x - side * out}px`; el.style.top = `${y}px`;
  });
  const cw = card.offsetWidth, ch = card.offsetHeight, log = $('events').getBoundingClientRect();
  const left = side > 0 ? p.x + reach + 56 : p.x - reach - 56 - cw;
  const top = within(p.y - ch - 24, s.top, Math.max(s.top, bottom - ch));
  card.style.left = `${left}px`; card.style.top = `${top}px`;
  const bloomLeft = side > 0 ? p.x - reach - 24 - wide : left, bloomTop = Math.min(first - 22, top);
  $('events').classList.toggle('under', bloomLeft < log.right && bloomTop < log.bottom);
  const endX = side > 0 ? left + 8 : left + cw - 8, endY = within(p.y, top + 24, top + ch - 24);
  const angle = Math.atan2(endY - p.y, endX - p.x), fromX = p.x + Math.cos(angle) * reach, fromY = p.y + Math.sin(angle) * reach;
  $('filament').setAttribute('d', `M${fromX} ${fromY} C${(fromX + endX) / 2} ${fromY} ${(fromX + endX) / 2} ${endY} ${endX} ${endY}`);
  $('aim').setAttribute('transform', `translate(${p.x} ${p.y})`);
  $('aim-ring').setAttribute('r', reach);
}
export function animateHud(elapsed) {
  moveCamera(elapsed);
  followSelection();
  ui.dry.forEach((c, i) => {
    const el = $('dry').children[i], p = screenAt(centreOf(c));
    if (el) el.style.transform = `translate(${p.x}px,${p.y}px)`;
  });
  placeGuideSpot();
  const now = performance.now();
  if (!$('refusal').hidden && now - ui.refusedAt > 3200) $('refusal').hidden = true;
  if (ui.grown && now > ui.grown) { ui.grown = 0; $('growth').hidden = true; }
}
export function drawFog(g) {
  const a = worldAt(0, 0), b = worldAt(view.w, view.h), pad = FOG_SOFT * 2 + 3;
  const x0 = Math.floor(a.x / 2) - pad, y0 = Math.floor(a.y / 2) - pad, w = Math.ceil(b.x / 2) + pad - x0, h = Math.ceil(b.y / 2) + pad - y0;
  const now = `${fogTick},${x0},${y0},${w},${h}`;
  if (now !== fogFor) {
    mainSet.fogFor(now);
    fogImage.width = w; fogImage.height = h;
    const f = fogImage.getContext('2d'), picture = f.createImageData(w, h), dark = new Float32Array(w * h), unwatched = new Float32Array(w * h);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const x = (x0 + i) * 2, y = (y0 + j) * 2, at = j * w + i;
      if (!known(x, y)) dark[at] = unwatched[at] = 1;
      else if (!inSight(x, y)) unwatched[at] = 1;
    }
    for (const field of [dark, unwatched]) soften(field, w, h);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const at = j * w + i, d = dark[at];
      // Uneven where it thins, like smoke, and whole where it is whole.
      const wisp = d * (1 - d) * (spotHash(x0 + i, y0 + j, 63) - .5) * 1.1;
      const k = Math.max(0, Math.min(1, d + wisp)), veil = k * k * (3 - 2 * k);
      picture.data[at * 4] = 4; picture.data[at * 4 + 1] = 8; picture.data[at * 4 + 2] = 10;
      picture.data[at * 4 + 3] = Math.round(255 * (veil + (1 - veil) * unwatched[at] * .42));
    }
    f.putImageData(picture, 0, 0);
  }
  g.save();
  // Normal smoothing: 'high' only helps to shrink a picture, and enlarging this one to a Retina screen
  // with it held the game at 28 images a second on an M3 Pro, against 120 with it.
  g.imageSmoothingEnabled = true;
  g.imageSmoothingQuality = 'low';
  g.drawImage(fogImage, x0 * 2, y0 * 2, w * 2, h * 2);
  // It breathes: a thin second veil drifts over the first.
  const t = motionTime();
  if (t) {
    g.globalAlpha = .22 + Math.sin(t * .5) * .08;
    g.drawImage(fogImage, x0 * 2 + Math.sin(t * .23) * 1.3, y0 * 2 + Math.cos(t * .17) * 1.3, w * 2, h * 2);
  }
  g.restore();
}
// Two box blurs each way, close to a round one.
export function soften(field, w, h) {
  const line = new Float32Array(Math.max(w, h)), r = FOG_SOFT, over = r * 2 + 1;
  const pass = (start, stride, n) => {
    for (let i = 0; i < n; i++) line[i] = field[start + i * stride];
    let sum = 0;
    for (let i = -r; i <= r; i++) sum += line[Math.max(0, Math.min(n - 1, i))];
    for (let i = 0; i < n; i++) {
      field[start + i * stride] = sum / over;
      sum += line[Math.min(n - 1, i + r + 1)] - line[Math.max(0, i - r)];
    }
  };
  for (let again = 0; again < 2; again++) {
    for (let j = 0; j < h; j++) pass(j * w, 1, w);
    for (let i = 0; i < w; i++) pass(i, w, h);
  }
}

// The signs both views draw over the scene, in map units.
export function sceneSigns(g) {
  const t = motionTime(), still = STILL.matches, px = 1 / cam.zoom, a = worldAt(0, 0), b = worldAt(view.w, view.h);
  const seen = c => c.x >= a.x - 2 && c.x <= b.x + 1 && c.y >= a.y - 2 && c.y <= b.y + 1;
  const cells = allCells().filter(seen);
  g.save();
  g.lineCap = 'round';
  for (const c of [...cells, ...Object.values(G.ruins).filter(w => w.out != null && seen(w))]) {
    if (built(c) && c.out == null) continue;
    const done = woven(c);
    if (!(done > 0)) continue;
    // Woven round the object, unpicked the same way.
    const size = sizeOf(c) - .08;
    g.beginPath(); g.rect(c.x + .04, c.y + .04, size, size);
    g.setLineDash([Math.min(1, done) * size * 4, size * 4]);
    g.strokeStyle = c.out != null ? '#FF6B74' : '#66D9EA'; g.lineWidth = Math.max(.07, 2 * px); g.stroke(); g.setLineDash([]);
  }
  for (const c of cells) {
    const full = fullHp(c);
    if (c.hp >= full - .5) continue;
    const {x, y} = centreOf(c), r = sizeOf(c) * .5, mends = healing(c), from = Math.PI * .88, sweep = -Math.PI * .76;
    const arc = (part, color) => { g.beginPath(); g.arc(x, y, r, from, from + sweep * part, true); g.strokeStyle = color; g.lineWidth = Math.max(.09, 3 * px); g.stroke(); };
    arc(1, '#05090B');
    g.globalAlpha = mends && !still ? .75 + Math.sin(t * 7) * .25 : 1;
    arc(Math.max(.02, c.hp / full), mends ? '#62E06A' : '#FF6B74');
    g.globalAlpha = 1;
  }
  for (const c of cells) {
    if (c.up == null) continue;
    const size = sizeOf(c) - .08, done = 1 - c.up / RANKS[c.type].time;
    g.beginPath(); g.rect(c.x + .04, c.y + .04, size, size);
    g.setLineDash([.12, .1]); g.strokeStyle = c.upTo > 2 ? '#C77DFF88' : '#F0A03C88'; g.lineWidth = Math.max(.05, 1.5 * px); g.stroke();
    if (done > 0) { g.setLineDash([done * size * 4, size * 4]); g.strokeStyle = c.upTo > 2 ? '#C77DFF' : '#F0A03C'; g.lineWidth = Math.max(.08, 2.5 * px); g.stroke(); }
    g.setLineDash([]);
  }
  // The row an upgrade would take.
  if (tool === 'hand' && selected && isBelt(G.cells[selected])) for (const c of rowOf(G.cells[selected])) rect(g, c.x + .06, c.y + .06, .88, .88, '#66D9EA22', '#66D9EA99');
  chain.forEach((c, i) => {
    // The wave climbs from the symptom to the cause.
    g.globalAlpha = still ? 1 : .55 + .45 * Math.max(0, Math.sin(t * 5 - i * .7));
    rect(g, c.x + .04, c.y + .04, sizeOf(c) - .08, sizeOf(c) - .08, null, '#FF6B6B');
  });
  g.globalAlpha = 1;
  const linkFrom = (linking && G.cells[linking]) || (wiring && G.cells[wiring]) || (gesture?.mode === 'draw' && (drag?.vein || drag?.nerve));
  const nerve = wiring || tool === 'wire', vein = linking || (gesture?.mode === 'draw' && drag?.vein);
  if (nerve || vein) for (const c of cells) {
    if (!(vein ? c.type === 'pump' : NERVE.ends.includes(c.type))) continue;
    if (linkFrom && ((c.x === linkFrom.x && c.y === linkFrom.y) || span(linkFrom, c) > (vein ? VEIN.reach : NERVE.reach))) continue;
    circle(g, c.x + .5, c.y + .5, .62 + (still ? 0 : Math.sin(t * 5) * .06), null, vein ? '#FF8FA2' : '#66D9EA', 2 * px);
  }
  const picked = selected && G.cells[selected];
  if (picked) {
    rect(g, picked.x, picked.y, sizeOf(picked), sizeOf(picked), null, '#B7F34A');
    if (isGun(picked)) {
      const grown = still ? 1 : 1 - (1 - Math.min(1, (performance.now() - ui.pickedAt) / 420)) ** 3, range = Math.max(.1, reachOf(picked.type) * grown);
      circle(g, picked.x + .5, picked.y + .5, range, null, '#55D6E8', 2 * px);
      if (picked.strict) { g.setLineDash([.25, .25]); circle(g, picked.x + .5, picked.y + .5, range - .3, null, '#B7F34A', px); g.setLineDash([]); }
    }
  }
  for (const s of G.shots) if (s.hurt === 12) circle(g, s.tx, s.ty, .3 + (still ? 0 : (t * 4 % 1) * .3), null, '#B7F34A', 2 * px);
  g.restore();
}
export function setMotion(less) {
  STILL.wanted = less;
  $('app').classList.toggle('calm-motion', less);
  document.documentElement.classList.toggle('still', less);
  $('motion-auto').setAttribute('aria-pressed', !less);
  $('motion-less').setAttribute('aria-pressed', less);
}
export function addPip(i) {
  const b = document.createElement('button');
  b.className = 'pip';
  b.innerHTML = '<svg class="ring" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18"/><circle class="run" cx="20" cy="20" r="18"/></svg><span class="porthole model hull" aria-hidden="true"></span><span class="mini porthole model" aria-hidden="true" hidden></span><svg class="heading" viewBox="0 0 12 12" aria-hidden="true" hidden><path d="M6 1l4 6H2z"/></svg><span class="words"></span>';
  showModel(b.querySelector('.hull'), 'drone');
  b.onclick = () => { const d = G.drones[i]; if (d) travelTo({x:d.x, y:d.y}); else buyLab('drones'); };
  $('drones').append(b);
}
export function showStats(open) {
  ui.stats = open ? ui.statsTab || 'prod' : '';
  $('stats').hidden = !open;
  $('stats-pod').setAttribute('aria-pressed', open);
  if (open) { if (ui.menu) showMenu(false); ui.statsAt = -Infinity; paintStats(); }
}
export function outputOf(c) { return c.type === 'mine' || c.type === 'borer' ? matterUnder(c) : c.item || c.last || ''; }
export function itemMark(item) {
  if (!item) return L('<span class="dim">en attente</span>');
  if (boxOf(item)) return `<span class="crate">${geneMark(contentOf(item))}</span>`;
  return item.length === 1 ? `<span class="base">${markOf(item)}</span>` : geneMark(item);
}
export function holeOf(type) {
  const i = Math.max(0, MODELS.indexOf(type));
  return `<span class="porthole model" style="background-position:${(i % 6) * 20}% ${Math.floor(i / 6) * 100 / 6}%" aria-hidden="true"></span>`;
}
// Per output: machines, what they made over the last 10 s as a rate per minute, and what they could make.
export function production() {
  const lines = new Map();
  for (const c of allCells()) {
    if (!hasTrait(c.type, 'produce') || !built(c)) continue;
    const item = outputOf(c), id = `${c.type}|${item}`;
    const line = lines.get(id) || {type:c.type, item, n:0, now:0, max:0, why:null};
    line.n++; line.why ||= stopReason(c); line.now += (c.made?.length || 0) * 6; line.max += perSecond(c) * 60;
    lines.set(id, line);
  }
  return [...lines.entries()].sort((a, b) => PRODUCERS.indexOf(a[1].type) - PRODUCERS.indexOf(b[1].type) || b[1].now - a[1].now);
}
export function sampleStats() {
  if (G.time < (ui.sampledAt ?? -Infinity) + 10 && ui.sampledAt <= G.time) return;
  ui.sampledAt = G.time;
  const rates = Object.fromEntries(production().map(([id, line]) => [id, line.now]));
  (ui.history ||= []).push(rates);
  if (ui.history.length > 30) ui.history.shift();
}
export function spark(values) {
  const top = Math.max(1, ...values), w = 120, step = w / Math.max(1, values.length - 1);
  return `<svg width="${w}" height="28" viewBox="0 0 ${w} 28" aria-hidden="true"><polyline points="${values.map((v, i) => `${(i * step).toFixed(1)},${(26 - v / top * 22).toFixed(1)}`).join(' ')}" fill="none" stroke="#66D9EA" stroke-width="1.6"/></svg>`;
}
export function problems() {
  const out = [];
  for (const c of allCells()) {
    if (!built(c)) continue;
    const name = TYPES[c.type]?.name || '';
    if (isGun(c) && !Object.values(c.ammo).some(n => n)) out.push([c, 'red', L`${name} à sec`, L('plus de munitions')]);
    else if (packWarning(c)) out.push([c, 'red', L`${name} pour rien`, packWarning(c)]);
    else if (stopReason(c)) out.push([c, c.item ? 'amber' : 'red', c.item ? L`${name} bloqué` : L`${name} à l’arrêt`, stopReason(c)]);
  }
  return out.sort((a, b) => (a[1] === 'red' ? 0 : 1) - (b[1] === 'red' ? 0 : 1) || span(a[0], CORE) - span(b[0], CORE));
}
// Why a producer made nothing in the last 10 s, in the few words the simulation can back (item_015).
// Null while it works, or while it only waits out its own clock.
export function stopReason(c) {
  if (!hasTrait(c.type, 'produce') || !built(c) || c.made?.length) return null;
  if (packWarning(c)) return L('mauvais réglage');
  const red = gate => gate.type === 'gate' && !gateGreen(gate) ? (listens(gate) ? L('en attente d’un nerf') : L('feu fermé')) : null;
  if (c.item || (c.type === 'borer' && c.stock.length >= BORER.hold)) {
    // Down the line it feeds: a red light holding it is the cause, else the end refuses or is full.
    const seen = new Set();
    for (let to = ahead(c, c.dir), dir = c.dir; to && !seen.has(to); to = ahead(to, dir)) {
      seen.add(to);
      if (red(to)) return red(to);
      if (isBelt(to)) dir = to.dir; else if (to.type !== 'bridge') break;
    }
    return L('sortie bloquée');
  }
  if (c.type === 'pack' && readyPort(c, 0) >= fill(c.box)) {
    const side = c.ports[1].slice(0, readyPort(c, 1)), box = BOX[c.box];
    return side.filter(k => k === 'K').length < box.carbon ? L('pas de carbone') : side.filter(k => k === 'I').length < (box.isotope || 0) ? L('pas d’isotope') : null;
  }
  // Every cell carries three port lists: a Ligase reads three, an assembler two; harvesters and borers read none.
  // An encapsulator here still lacks genes for its box.
  const port = c.type === 'pack' ? 0 : c.ports.slice(0, {ligase:3, join:2}[c.type] ?? 0).findIndex((p, i) => !readyPort(c, i));
  if (port < 0) return null;
  const side = c.type === 'ligase' ? portSide(c, port) : c.type === 'join' ? joinSide(c, port) : (c.dir + 2) % 4;
  for (const from of upstream(c, side)) if (red(from)) return red(from);
  return L('rien n’arrive');
}
export function statsHTML(tab) {
  if (tab === 'prod') {
    const lines = production(), want = STAGES[G.stage];
    if (!lines.length) return L('<p class="empty">Aucune machine ne produit encore. Pose un récolteur sur un gisement.</p>');
    const askedOf = G.goals ? G.goals.filter(g => g.fed < g.count).map(g => g.item) : want ? [want.item] : [];
    const asked = askedOf.length ? L`<p class="note">Le cœur réclame ${askedOf.map(itemMark).join(' ')}</p>` : '';
    return L`<div class="head"><p class="label">Production · par minute, sur les 10 dernières secondes</p>${asked}</div>`
      + L('<div class="row prod cols label"><span>Ce qui sort</span><span>Débit</span><span>/ min</span><span>Capacité</span><span>5 minutes</span></div>')
      + lines.map(([id, l]) => `<div class="row prod"><span class="what">${holeOf(l.type)}${itemMark(l.item)}${l.n > 1 ? `<span class="dim">×${l.n}</span>` : ''}</span>`
        + `<span class="bar"><i style="width:${Math.min(100, l.now / Math.max(1, l.max) * 100).toFixed(0)}%"></i></span><span class="n">${fr(l.now)}</span><span class="dim">${fr(l.max)}</span>`
        + `${spark((ui.history || []).map(h => h[id] || 0))}${!l.now && l.why ? `<span class="why">${l.why}</span>` : ''}</div>`).join('');
  }
  if (tab === 'eco') {
    const recent = {}, total = {};
    for (const e of ui.earned || []) {
      total[e.source] = (total[e.source] || 0) + e.amount;
      if (e.at > G.time - 60) recent[e.source] = (recent[e.source] || 0) + e.amount;
    }
    const rows = Object.keys(total).sort((a, b) => total[b] - total[a]);
    return L`<div class="tiles"><p class="tile"><b>${G.dna}</b><span>ADN en réserve</span></p><p class="tile"><b>${fr(Object.values(recent).reduce((s, n) => s + n, 0))}</b><span>ADN gagné la dernière minute</span></p></div>`
      + L('<div class="row pair cols label"><span>D’où vient l’ADN</span><span>dernière min</span><span>depuis l’ouverture</span></div>')
      + (rows.map(s => `<div class="row pair"><span>${EARN[s] || s}</span><span class="n">${fr(recent[s] || 0)}</span><span class="dim">${fr(total[s])}</span></div>`).join('') || L('<p class="empty">Rien gagné depuis l’ouverture de la partie.</p>'));
  }
  if (tab === 'def') {
    const guns = allCells().filter(c => isGun(c) && built(c)), ammo = {};
    for (const c of guns) for (const [gene, n] of Object.entries(c.ammo)) if (n) ammo[gene] = (ammo[gene] || 0) + n;
    const types = [...new Set(guns.map(c => c.type))];
    return L`<div class="tiles"><p class="tile"><b>${guns.length}</b><span>défenses</span></p><p class="tile"><b>${guns.filter(c => !Object.values(c.ammo).some(n => n)).length}</b><span>à sec</span></p><p class="tile"><b>${G.kills}</b><span>créatures tuées</span></p></div>`
      + L('<div class="row pair cols label"><span>Défense</span><span>posées</span><span>à sec</span></div>')
      + types.map(type => `<div class="row pair"><span class="what">${holeOf(type)}${TYPES[type].name}</span><span class="n">${guns.filter(c => c.type === type).length}</span><span class="dim">${guns.filter(c => c.type === type && !Object.values(c.ammo).some(n => n)).length}</span></div>`).join('')
      + L('<div class="row pair cols label" style="margin-top:14px"><span>Munitions chargées</span><span>coups</span><span></span></div>')
      + (Object.entries(ammo).sort((a, b) => b[1] - a[1]).map(([gene, n]) => `<div class="row pair"><span>${geneMark(gene)}</span><span class="n">${n}</span><span></span></div>`).join('') || L('<p class="empty">Aucune munition chargée.</p>'));
  }
  if (tab === 'threat') {
    const count = state => G.breaches.filter(b => b.state === state).length;
    const here = Object.entries(G.enemies.reduce((n, e) => (n[e.gene] = (n[e.gene] || 0) + 1, n), {})).sort((a, b) => b[1] - a[1]);
    return L`<div class="tiles"><p class="tile"><b>${count('wake')}</b><span>brèches éveillées</span></p><p class="tile"><b>${count('sleep')}</b><span>dorment</span></p><p class="tile"><b>${count('spent')}</b><span>détruites</span></p><p class="tile"><b>${fr(G.threat || 0)} / 10</b><span>niveau de menace</span></p></div>`
      + L('<div class="row pair cols label"><span>Sur la carte</span><span>créatures</span><span>antidote</span></div>')
      + (here.map(([gene, n]) => `<div class="row pair"><span>${geneMark(gene)} → ${geneMark(opposite(gene))}</span><span class="n">${n}</span><span class="${stockOf(opposite(gene)) ? 'dim' : 'none'}">${stockOf(opposite(gene)) || 'aucun'}</span></div>`).join('') || L('<p class="empty">Personne sur la carte.</p>'));
  }
  const list = problems();
  return L`<div class="head"><p class="label">Ce qui freine l’usine · ${list.length} point${list.length > 1 ? 's' : ''}</p><p class="note">touche une ligne : la caméra y va</p></div>`
    + (list.slice(0, 14).map(([c, level, title, why]) => `<button class="row issue" data-at="${c.x},${c.y}">${holeOf(c.type)}<span><b>${title}</b><br><span class="dim">${why}</span></span><span class="badge ${level}">${level === 'red' ? L('bloquant') : L('ralentit')}</span><span class="go">${L`${bearing(c)}, ${Math.round(span(c, CORE))} cases →`}</span></button>`).join('') || L('<p class="empty">Rien ne freine l’usine.</p>'));
}
export function paintStats() {
  if (G.time - (ui.statsAt ?? -Infinity) < 1 && ui.statsAt <= G.time) return;
  ui.statsAt = G.time;
  for (const b of $('stats').querySelectorAll('[data-tab]')) b.setAttribute('aria-selected', b.dataset.tab === ui.stats);
  paint('stats-body', statsHTML(ui.stats));
}

// The bindings other modules replace.
export const hudSet = {
  // @ts-expect-error: a function rebound in place, as a test's stub or the timing probes do
  drawFog: (v) => (drawFog = v),
  // @ts-expect-error: a function rebound in place, as a test's stub or the timing probes do
  animateHud: (v) => (animateHud = v),
  // @ts-expect-error: a function rebound in place, as a test's stub or the timing probes do
  layoutHud: (v) => (layoutHud = v)
};
