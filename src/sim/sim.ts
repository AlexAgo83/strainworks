// The simulation: the world, its pieces and their rules, stepped at a fixed rate. No DOM and no renderer:
// what it says, sounds and shows goes through hooks the interface fills in.
import { hooks } from "./hooks.ts";
import { L } from "./text.ts";

export const W = 96, H = 96, STEP = .05; // W and H: the landing square, where every game starts the same
export const SECTOR = 32, OUTPOST = 24;
// The starting scenario is written around its own origin, in the middle of the map.
export const OX = 43, OY = 40;
export const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];
export const PAIR = {S:'C', C:'S', F:'N', N:'F'};
export const BASE = {S:L('Spore'), F:L('Fibre'), C:L('Chitine'), N:L('Nerf')};
export const TYPES = {
  hand:{name:L('Inspecter'), help:L('Glisse ou utilise les flèches pour te déplacer, pince pour zoomer, touche une machine pour l’inspecter.')},
  belt:{name:L('Tapis'), help:L('Glisse de la sortie vers l’entrée, la vue suit au bord. Deux doigts pour te déplacer. Pour croiser, pose un pont. Touche-le pour le passer, ou toute sa ligne, en MK2 (8/s) ou MK3 (12/s).'), hp:30},
  gate:{name:L('Feu'), help:L('Rail à interrupteur. Touche-le : vert, ça passe, rouge, la ligne attend derrière. Relié à un nerf, il s’ouvre sur ce que tu choisis : le gène demandé, une menace, ou le stock de son kyste, par lots si tu veux.'), hp:30},
  lab:{name:L('Laboratoire'), help:L('Un seul par partie. Touche-le pour acheter des améliorations avec l’ADN : drones, vitesse, réparation, portée, vision.'), hp:200},
  screen:{name:L('Écran'), help:L('Relie-le à un nerf : il affiche en grand l’antidote que son réseau demande, et clignote quand il change.'), hp:40},
  desk:{name:L('Pupitre'), help:L('Relie-le à un nerf : il choisit ce que le réseau demande. Le plus nombreux, le plus proche, chacun son tour, ou un gène que tu fixes à la main.'), hp:40},
  relay:{name:L('Relais'), help:L('Un poteau qui ne fait que porter un nerf : relie-le comme une tourelle, et le réseau va 24 cases plus loin.'), hp:40},
  radar:{name:L('Pylône radar'), help:L('Garde visible une grande zone autour de lui. Relié par un nerf, il annonce au réseau les créatures qui la traversent.'), hp:120},
  mine:{name:L('Récolteur'), help:L('À poser sur un gisement. Il donne 1 base par seconde, 2 en MK2, 3 en MK3. Touche-le pour l’améliorer.'), hp:60},
  pump:{name:L('Veine'), help:L('Touche pour poser une pompe. Tire d’une pompe à une autre, 24 cases au plus : 16 objets/s d’une seule matière, sous tout.'), hp:90},
  track:{name:L('Piste'), help:L('Glisse pour tracer la boucle des vers. Elle passe sous tout et se referme sur son départ.'), hp:30},
  pocket:{name:L('Poche'), help:L('À poser contre une piste. Trois poches côte à côte s’alignent sur les trois soutes. Touche-la pour charger ou vider.'), hp:90},
  worm:{name:L('Ver'), help:L('Touche une piste pour l’incuber : 3 soutes de 40, 12 cases par seconde.'), hp:150},
  ligase:{name:L('Ligase'), help:L('Trois entrées : 1 à gauche, 2 derrière, 3 à droite. Leur ordre écrit le gène. Reliée à un nerf, elle vide ses entrées quand l’antidote demandé change.'), hp:60},
  pack:{name:L('Encapsuleur'), help:L('Gènes derrière, carbone sur le côté. Règle sa recette : capsule pour le cœur (2 carbones) ou chargeur pour les tourelles (1 carbone), avec 6 objets identiques.'), hp:60},
  glue:{name:L('Glu'), help:L('Elle englue les neuf cases autour d’elle, la sienne comprise : ce qui y passe ralentit et brûle un peu. Elle se nourrit de gènes par n’importe quel côté, un pour quelques passages. Vide, elle ne fait plus rien. MK2 et MK3 ralentissent et brûlent plus.'), hp:120},
  mist:{name:L('Brumisateur'), help:L('Toutes les deux secondes, un nuage d’antidote sur trois cases autour : il touche toute une Nuée d’un coup. Un gène par bouffée. MK2 et MK3 soufflent plus souvent et plus large.'), hp:70},
  harpoon:{name:L('Harpon'), help:L('Un carreau lent et lourd, à très longue portée, qui traverse toute une file. Il ne prend que des capsules d’antidote. La réponse au Titan. MK2 et MK3 tirent plus vite, MK3 plus large.'), hp:90},
  arm:{name:L('Bras'), help:L('Il prend derrière lui, sur un tapis, dans un stock ou en sortie de machine, et dépose devant lui. Touche-le pour ne prendre qu’une chose. MK2 deux fois plus vite, MK3 plus vite encore et deux à la fois.'), hp:50},
  burn:{name:L('Brûleur'), help:L('Tout ce qui entre par l’un de ses quatre côtés part en fumée, 4, 8 ou 12 par seconde selon son rang. Rien en échange : il vide ce qui déborde.'), hp:60},
  unbind:{name:L('Déligase'), help:L('L’inverse de la Ligase : un gène entre derrière, sa base 1 ressort à gauche, la 2 devant, la 3 à droite. 1, 2 ou 3 gènes par seconde selon son rang.'), hp:60},
  unjoin:{name:L('Séparateur'), help:L('L’inverse de l’Assembleur : un brin de deux gènes entre derrière, le gène 1 ressort à gauche, le gène 2 à droite.'), hp:60},
  reaper:{name:L('Recycleur'), help:L('Un seul par partie. Son rayon aspire les cadavres autour de lui et les analyse : une fois sur deux il recopie le gène de la créature, sinon il rend du carbone K. Le Laboratoire améliore la réplication et la portée.'), hp:120},
  flip:{name:L('Inverseur'), help:L('Un gène entre derrière, il ressort devant dans l’ordre inverse : SFN devient NFS. 1, 2 ou 3 par seconde selon son rang.'), hp:60},
  unpack:{name:L('Décapsuleur'), help:L('Une caisse entre derrière : son contenu ressort devant, un à la fois, et son carbone sur la droite. Capsules, chargeurs et capsules lourdes.'), hp:60},
  join:{name:L('Assembleur'), help:L('Gène 1 à gauche, gène 2 à droite : un brin de deux gènes sort devant, le premier en tête.'), hp:60},
  turret:{name:L('Tourelle'), help:L('Tire les gènes livrés. Le brin opposé à celui de la créature fait le plus mal.'), hp:180},
  cyst:{name:L('Kyste'), help:L('Stocke 60 objets, 120 en MK2, 240 en MK3, et les ressort par la flèche. À remplir avant un assaut. Relié à un nerf, il dit au feu le plus proche s’il est plein ou bas.'), hp:80},
  bridge:{name:L('Pont'), help:L('Deux flux s’y croisent sans se mélanger. Touche-le pour régler le sens de chaque voie. Chaque voie va au rythme de ses propres tapis.'), hp:40},
  borer:{name:L('Grand récolteur'), help:L('4 cases d’un même gisement. Tire comme 6 récolteurs : 6 bases par seconde, 12 en MK2, 18 en MK3, et sort par ses 8 bords : branche plusieurs tapis.'), hp:180},
  vault:{name:L('Grand kyste'), help:L('4 cases, 360 objets, 720 en MK2, 1440 en MK3. Entre par ses trois autres faces, ressort par deux bouches côte à côte, devant.'), hp:200},
  split2:{name:L('Diviseur 2'), help:L('Entrée derrière. Répartit à tour de rôle entre la gauche et la droite. Le tout droit est fermé.'), hp:40},
  split:{name:L('Diviseur 3'), help:L('Entrée derrière. Répartit à tour de rôle vers les trois autres côtés branchés.'), hp:40},
  sort:{name:L('Trieur'), help:L('Entrée derrière. Ce qui correspond au filtre sort du côté choisi, le reste va tout droit.'), hp:40},
  wire:{name:L('Nerf'), help:L('Tire entre une tourelle (Dard et Gueule compris), un feu ou un trieur, 24 cases au plus. La tourelle dit ce qu’il lui faut, les autres écoutent.'), hp:30},
  sting:{name:L('Dard'), help:L('Longue portée : 13 cases. Un tir par seconde, qui fait deux fois les dégâts. Fragile, garde-le derrière.'), hp:120},
  maw:{name:L('Gueule'), help:L('Courte portée : 4 cases. Deux coups à la fois, 2,5 fois par seconde. Elle encaisse, mais elle dévore les gènes.'), hp:260},
  wall:{name:L('Mur'), help:L('Bloque et encaisse. Les créatures doivent le casser pour passer.'), hp:260},
  erase:{name:L('Démonter'), help:L('Touche ou balaie ce que tu veux retirer : un drone vient le défaire, le temps de la pose. Glisse depuis le sol nu pour démonter toute une zone. Tourelles et murs rendent leur ADN à la fin, moins les dégâts.')}
};
// What each piece does, read by hasTrait(): every type, the core included, declares its traits here and nowhere else.
// turn: turns in place; capped: its rank caps a line's; ring: rank drawn as rings; rate: makes rank items a second;
// outFront / inBack: hands on ahead, takes from behind, along a bridge; source / listen: speaks on or listens to a nerve;
// single: holds one item out; stock: a stock others take from; reserve: its stock counts as reserve; intake: takes into its stock;
// notFront: takes from any side but its front; backOnly: takes only from behind; anySide: takes from every side;
// make: produces, with a rate shown; lineEnd: where a traced line starts; fork: sends a line several ways;
// aimless: placed with no heading; ownEmpty: empties its own way; retap: turned by placing it again; onBelt: may replace a belt;
// produce: a line in the statistics; traced / drawn: the tool traces a path / draws by dragging; noCell: never a saved cell; noSpecimen: not in the lab view.
export const TRAITS = {
  hand:'aimless noCell noSpecimen',
  belt:'turn traced outFront inBack notFront aimless retap drawn',
  gate:'turn listen outFront inBack notFront onBelt',
  lab:'',
  screen:'turn listen',
  desk:'turn source',
  relay:'',
  radar:'source',
  mine:'turn outFront single make lineEnd retap produce',
  pump:'stock anySide intake aimless ownEmpty reserve drawn',
  track:'traced aimless drawn noCell noSpecimen',
  pocket:'stock intake lineEnd aimless reserve',
  worm:'aimless noCell noSpecimen',
  ligase:'turn ring listen rate outFront single notFront make lineEnd retap produce',
  pack:'turn ring listen rate outFront single make lineEnd ownEmpty retap produce',
  glue:'anySide intake',
  mist:'',
  harpoon:'',
  arm:'turn',
  burn:'ring anySide',
  unbind:'turn rate backOnly make',
  unjoin:'turn rate backOnly make',
  reaper:'turn single',
  flip:'turn rate single backOnly make',
  unpack:'turn rate single backOnly make',
  join:'turn ring listen rate outFront single make lineEnd retap produce',
  turret:'ring aimless',
  cyst:'turn outFront source stock notFront intake reserve retap',
  bridge:'fork aimless onBelt',
  borer:'stock lineEnd produce',
  vault:'turn outFront source stock notFront intake ownEmpty reserve retap',
  split2:'turn capped ring inBack fork retap onBelt',
  split:'turn capped ring outFront inBack fork retap onBelt',
  sort:'turn capped ring listen outFront inBack fork retap onBelt',
  wire:'aimless drawn noCell',
  sting:'ring aimless',
  maw:'ring aimless',
  wall:'ring aimless',
  erase:'traced aimless drawn noCell noSpecimen',
  core:'source anySide ownEmpty'
};
export const TRAIT_SETS = Object.fromEntries(Object.entries(TRAITS).map(([type, words]) => [type, new Set(words.split(' ').filter(Boolean))]));
export const hasTrait = (type, trait) => Boolean(TRAIT_SETS[type]?.has(trait));
export const VEIN = {reach:24, speed:16, pulse:.5, load:8, cap:48, hp:50};
export const WORM = {speed:12, hold:40, load:16, pocket:120, hp:150, idle:2, timer:5};
export const STAGES = [
  {name:L('Cellule'), item:'SFS', count:100, gives:L('Diviseur 3, Trieur, Encapsuleur, Nerfs et Assembleur')},
  {name:L('Tissu'), item:'T:CCF', rate:2, hold:60, gives:L('gisements ×2, Grand récolteur et Grand kyste')},
  {name:L('Organe'), item:'T:SFSFFF', count:10, gives:L('Pistes, poches, vers et gisements ×4 à ×8')},
  // The magazine asked follows the family born on entering the stage.
  {name:L('Système'), count:30, get item() { return `A:${opposite(G.mutant || G.families[G.families.length - 1])}`; }, gives:L('le Séparateur, les Veines, l’isotope, la capsule lourde, un drone à moitié prix au Laboratoire, et une mutation toutes les 5 minutes, jusqu’à 8 familles')},
  {name:L('Noyau'), item:'H:SFSFFF', count:6, gives:L('le Recycleur et la Déligase')},
  // The last: the organism hatches, the game is won, and it goes on in free mode.
  {name:L('Éclosion'), item:'H:SFSFFF', count:10, gives:L('la victoire, puis le mode libre')}
];
// A container is a string too, so whatever carries items carries it: 'A:CNF' is a magazine, 'T:CCF' a capsule.
// K is carbon: matter, never a base, so it has no pair and never enters a gene.
export const BOX = {A:{name:L('Chargeur'), carbon:1}, T:{name:L('Capsule'), carbon:2}, H:{name:L('Capsule lourde'), carbon:2, isotope:1, size:12}};
// How many genes or strands a box holds.
export const fill = box => BOX[box]?.size || PACK.size;
export const PACK = {size:6, genes:12, carbon:4, magazines:24};
// Every turret takes the same genes, they differ by reach, pace and shots in one volley. cost: before the shared rise.
export const GUNS = {
  turret:{range:6.8, pace:3, volley:1, power:1, cost:20},
  sting:{range:13, pace:1, volley:1, power:2, cost:40},
  maw:{range:4, pace:2.5, volley:2, power:1, cost:30},
  mist:{range:3, pace:.5, volley:1, power:.6, cost:60},
  harpoon:{range:16, pace:.35, volley:1, power:5, cost:90}
};
// The Glue: how much it slows by rank, what it burns a second, how many creature-seconds a gene lasts, what it holds.
export const GLUE = {slow:[.35, .25, .15], hurt:[2, 4, 6], per:3, hold:20};
export const isGun = c => Boolean(c && GUNS[c.type]);
// The ways out of a splitter, counted from the way it faces, in the order they take turns.
// 'split' is the three-way one: it was the only one, saved games hold it under that name.
export const SPLIT = {split2:[3, 1], split:[3, 0, 1]};
export const isSplit = c => Boolean(c && SPLIT[c.type]);
export const splitExits = c => SPLIT[c.type].map(turn => (c.dir + turn) % 4);
// These cover 2 x 2 cells. The object stands on its north-west cell: saved games need nothing new.
export const BIG = {borer:true, vault:true, lab:true};
export const BORER = {harvesters:6, hold:24};
// A building's side in cells: its own (the core's 3) or 2 for the big ones.
export const sizeOf = c => c.size || (isBig(c.type) ? 2 : 1);
export const centreOf = c => ({x:c.x + sizeOf(c) / 2, y:c.y + sizeOf(c) / 2});
export function footprint(c) {
  const cells = [];
  for (let j = 0; j < sizeOf(c); j++) for (let i = 0; i < sizeOf(c); i++) cells.push({x:c.x + i, y:c.y + j});
  return cells;
}
// Each cell of it with a face on the outside, side by side in the order of the compass.
export function edgesOf(c) {
  const last = sizeOf(c) - 1, edges = [];
  for (let dir = 0; dir < 4; dir++) for (let i = 0; i <= last; i++) {
    if (dir % 2) edges.push({x:dir === 1 ? c.x + last : c.x, y:c.y + i, dir});
    else edges.push({x:c.x + i, y:dir ? c.y + last : c.y, dir});
  }
  return edges;
}
export function covering(list, x, y) {
  const one = list[x + ',' + y];
  if (one) return one;
  for (const [i, j] of [[1, 0], [0, 1], [1, 1]]) {
    const big = list[(x - i) + ',' + (y - j)];
    if (big && isBig(big.type)) return big;
  }
  // The core's plinth: its nine cells answer as the core.
  if (Math.abs(x - CORE.x) <= 1 && Math.abs(y - CORE.y) <= 1) {
    const core = list[(CORE.x - 1) + ',' + (CORE.y - 1)];
    if (core?.size === 3) return core;
  }
  return undefined;
}
// The core: one cell at CORE in games from before, a 3x3 plinth centred on it in new ones, kept by its corner.
export const coreIn = cells => [key(CORE.x, CORE.y), key(CORE.x - 1, CORE.y - 1)].map(id => cells?.[id]).find(c => c?.type === 'core') || null;
export const coreCell = () => coreIn(G.cells);
export const cellAt = (x, y) => covering(G.cells, x, y);
export const buried = w => footprint(w).some(p => cellAt(p.x, p.y));
export const boxOf = item => item[1] === ':' ? item[0] : '';
export const contentOf = item => boxOf(item) ? item.slice(2) : item;
// A stage pays 100 (40 before item_018): the DNA of a game comes from its stages, not from feeding the core longer.
export const GROWTH_BONUS = 100;
export const CORE = {x:OX + 5, y:OY + 12};
export const NORTH = [{x:48,y:27}, {x:40,y:29}, {x:56,y:29}];
// Saves from before the deposits moved away keep these four, their harvesters stand on them.
export const INNER = [['C',44,46,2,3], ['N',51,46,2,3], ['S',44,51,2,2], ['F',51,51,2,2]];
export const OUTER = [
  ['F',59,43,4,3], ['C',36,56,3,4], ['N',57,57,4,3], ['S',47,63,4,3], ['K',60,50,3,3],
  ['N',32,35,3,3], ['C',62,34,3,3], ['C',46,78,6,5,'free'],
  ['F',12,20,7,6], ['S',78,18,7,6], ['N',10,78,7,7], ['C',80,80,7,7]
];
export let FIELDS = [], DEPOSIT = {}, RICH = {};
// A 16 x 16 square round the core stays free of deposits and nests in new games, room to build (item_020).
export const CLEARING = 8;
export const inClearing = (x, y) => x >= CORE.x - CLEARING && x < CORE.x + CLEARING && y >= CORE.y - CLEARING && y < CORE.y + CLEARING;
export function richness(x, y) { const d = Math.hypot(x - CORE.x - .5, y - CORE.y - .5); return d < 18 ? 1 : d < 34 ? 2 : 4; }
// Round the base one nest is enough: the one the first turret faces. The others start this far from the core.
export const CALM = 30;
export const keepsNest = b => b.id || (b.x === NORTH[0].x && b.y === NORTH[0].y) || Math.hypot(b.x - CORE.x, b.y - CORE.y) >= CALM;
export function nestBy([, x, y, w, h, free]: any[]) {
  // A field marked free has no nest: the one south of the base was too close for a camp.
  if (free) return null;
  const cx = x + w / 2, cy = y + h / 2, rich = richness(cx, cy);
  if (rich < 2) return null;
  const dx = cx - CORE.x, dy = cy - CORE.y, wide = Math.abs(dx) > Math.abs(dy);
  const at = wide ? {x:dx > 0 ? x + w + 3 : x - 4, y:Math.floor(cy)} : {x:Math.floor(cx), y:dy > 0 ? y + h + 3 : y - 4};
  const reach = Math.max(...[[x,y],[x+w-1,y],[x,y+h-1],[x+w-1,y+h-1]].map(([a,b]) => Math.hypot(a - at.x, b - at.y)));
  return {...at, r:Math.ceil(reach) + 1, rich};
}
export function nest() {
  const all = NORTH.map(p => ({...p, r:6, left:24})), guards = [];
  for (const field of OUTER) {
    const spot = nestBy(field);
    if (!spot) continue;
    const {rich, ...at} = spot, b = {...at, left:rich === 2 ? 40 : 70};
    all.push(b);
    // In new games a rich deposit is always guarded, even close in (item_016): its nest is kept, put last.
    if (G.far && !keepsNest(b)) guards.push(b);
  }
  // Thinned last, so each nest keeps the family it always had.
  G.breaches = [...all.filter(keepsNest), ...guards].map((b, i) => ({...b, total:b.left, genes:[G.families[i % 3]], form:i % 4, state:'sleep', wave:0, pending:0, ended:0}));
}
// A deposit is a main blot and a few splashes round it. The rectangle it was written as still sizes it and its guard.
export const spotHash = (x, y, n) => {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(n, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
// The first harvesters stand on these.
export const PINNED = [[38,56], [59,44], [57,57]];
export let patches = new WeakMap();
export function makePatch(field, allowed): any {
  const [kind, x, y, w, h] = field, roll = n => spotHash(x, y, n);
  const cx = x + w / 2, cy = y + h / 2, R = Math.max(1.55, Math.sqrt(w * h / Math.PI) * .94), long = Math.max(.8, Math.min(1.25, Math.sqrt(w / h)));
  const lobes = [{x:cx, y:cy, r:R, sx:long, sy:1 / long, wave:roll(1) * 7}], count = 2 + Math.floor(roll(2) * 2);
  for (let i = 0; i < count; i++) {
    const a = roll(3) * 7 + i * Math.PI * 2 / count + roll(4 + i) * .9, out = R + 1.5 + roll(8 + i) * .7;
    lobes.push({x:cx + Math.cos(a) * out * long, y:cy + Math.sin(a) * out / long, r:.85 + roll(12 + i) * .4, sx:1, sy:1, wave:0});
  }
  for (const [px, py] of PINNED) if (px >= x && px < x + w && py >= y && py < y + h) lobes.push({x:px + .5, y:py + .5, r:.9, sx:1, sy:1, wave:0});
  // How far outside a point is, 0 or less inside.
  const gap = (px, py) => Math.min(...lobes.map(l => {
    const dx = (px - l.x) / l.sx, dy = (py - l.y) / l.sy, a = Math.atan2(dy, dx);
    return Math.hypot(dx, dy) - l.r * (l.wave ? 1 + .14 * Math.sin(a * 2 + l.wave) + .1 * Math.sin(a * 3 + l.wave * 2) : 1);
  }));
  const mx = x + Math.floor(w / 2), my = y + Math.floor(h / 2), cells = new Map();
  for (let i = x - 4; i < x + w + 4; i++) for (let j = y - 4; j < y + h + 4; j++) {
    // Four in the middle are always whole, for a large harvester.
    const heart = i >= mx - 1 && i <= mx && j >= my - 1 && j <= my;
    if ((heart || gap(i + .5, j + .5) < (spotHash(i, j, 20) - .5) * .5) && allowed(i, j)) cells.set(i + ',' + j, {x:i, y:j});
  }
  const list = [...cells.values()];
  return {kind, cells, list, lobes, gap, cx, cy, top:Math.min(...list.map(p => p.y))};
}
export const patchOf = field => patches.get(field);
export function survey() {
  sectors = new Map();
  FIELDS = G.far ? OUTER : [...INNER, ...OUTER]; DEPOSIT = {}; RICH = {};
  const nests = new Map();
  for (const field of OUTER) { const spot = nestBy(field); if (spot && (keepsNest(spot) || G.far)) nests.set(field, spot); }
  const all = [{...NORTH[0], r:6}, ...nests.values()];
  const inRect = ([, x, y, w, h], i, j) => i >= x && i < x + w && j >= y && j < y + h;
  for (const field of FIELDS) {
    // A free field has no nest: in new games it is plain, a rich deposit being always guarded (item_016).
    const own = nests.get(field), rich = G.far && field[5] === 'free' ? 1 : richness(field[1] + field[3] / 2, field[2] + field[4] / 2);
    const patch = makePatch(field, (i, j) => {
      if (DEPOSIT[i + ',' + j] || Math.hypot(i - CORE.x, j - CORE.y) < 4 || (G.far && inClearing(i, j))) return false;
      const mine = inRect(field, i, j);
      if (!mine && FIELDS.some(other => other !== field && inRect(other, i, j))) return false;
      // A bare cell between two deposits, or they read as one.
      if (DX.some((dx, d) => DEPOSIT[(i + dx) + ',' + (j + DY[d])])) return false;
      if (all.some(b => Math.hypot(i - b.x, j - b.y) < 3.5)) return false;
      if (own) return Math.hypot(i - own.x, j - own.y) <= own.r;
      // A free deposit never spills into a nest's circle.
      return mine || !all.some(b => Math.hypot(i - b.x, j - b.y) <= b.r);
    });
    patches.set(field, patch);
    for (const id of patch.cells.keys()) { DEPOSIT[id] = field[0]; RICH[id] = rich; }
  }
}
// What a harvester works: what was under it before deposits became patches, or what is there.
export const matterUnder = c => c.on || depositAt(c.x, c.y);
export const richUnder = c => c.onRich || richAt(c.x, c.y);

// Past the landing square the world is never stored: a sector is a pure function of the seed and where it is.
// Only a breach that woke enters G.breaches, which only ever grows.
export let sectors = new Map(), worldSeed = null;
export const newSeed = () => crypto.getRandomValues(new Uint32Array(1))[0];
export const atHome = (x, y) => x >= 0 && x < W && y >= 0 && y < H;
export function dice(x, y, n) {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(n, 1442695041) + G.seed;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h = Math.imul(h ^ (h >>> 16), 1911520717);
  return ((h ^ (h >>> 15)) >>> 0) / 4294967296;
}
export function sector(sx, sy) {
  if (worldSeed !== G.seed || sectors.size > 6000) { sectors = new Map(); worldSeed = G.seed; }
  const id = sx + ',' + sy;
  if (!sectors.has(id)) {
    const made = generate(sx, sy, id), b = made?.breach;
    if (made) {
      const patch = makePatch(made.field, (i, j) => {
        if (Math.floor(i / SECTOR) !== sx || Math.floor(j / SECTOR) !== sy) return false;
        if (!b) return true;
        const d = Math.hypot(i - b.x, j - b.y);
        return d >= 3.5 && d <= b.r;
      });
      patch.rich = made.rich;
      patches.set(made.field, patch);
    }
    sectors.set(id, made);
  }
  return sectors.get(id);
}
// Levels climb every so many cells from the core and stop at the last one.
export const LEVEL = {every:160, total:[70, 110, 150, 200, 260], tough:[1, 1.4, 1.9, 2.4, 3]};
export const tierAt = (x, y) => Math.min(LEVEL.total.length - 1, Math.floor(Math.hypot(x - CORE.x, y - CORE.y) / LEVEL.every));
export const mod = (a, n) => ((a % n) + n) % n;
// Nests stand on staggered rows two sectors apart, one in five missing, so two never crowd each other.
export function nestSector(sx, sy) {
  const left = sx * SECTOR, top = sy * SECTOR;
  if (atHome(left, top) || mod(sy, 2) || mod(sx + mod(sy / 2, 2), 2) || dice(sx, sy, 1) > .8) return null;
  const roll = n => dice(sx, sy, n), tier = tierAt(left + SECTOR / 2, top + SECTOR / 2);
  // Farther: bigger and richer deposits, fuller breaches, harder creatures.
  const w = 5 + tier + Math.floor(roll(2) * 3), h = 4 + tier + Math.floor(roll(3) * 3);
  // Field and body stay clear of the sector's edge, so they never land on a neighbour's.
  const x = left + 8 + Math.floor(roll(4) * (17 - w)), y = top + 8 + Math.floor(roll(5) * (17 - h));
  const cx = x + w / 2, cy = y + h / 2, dx = cx - CORE.x, dy = cy - CORE.y, wide = Math.abs(dx) > Math.abs(dy);
  const bx = wide ? (dx > 0 ? x + w + 3 : x - 4) : Math.floor(cx), by = wide ? Math.floor(cy) : (dy > 0 ? y + h + 3 : y - 4);
  const reach = Math.max(...[[x,y],[x+w-1,y],[x,y+h-1],[x+w-1,y+h-1]].map(([a,b]) => Math.hypot(a - bx, b - by))), r = Math.ceil(reach) + 1;
  // Never into the landing square, or a game saved before the world grew would wake it on loading.
  if (Math.hypot(Math.max(-bx, 0, bx - W + 1), Math.max(-by, 0, by - H + 1)) <= r) return null;
  return {x, y, w, h, bx, by, r, tier};
}
export function generate(sx, sy, id) {
  const left = sx * SECTOR, top = sy * SECTOR;
  if (atHome(left, top)) return null;
  const roll = n => dice(sx, sy, n), nest = nestSector(sx, sy);
  if (nest) {
    const {x, y, w, h, bx, by, r, tier} = nest, name = 'n' + id, total = LEVEL.total[tier];
    return {
      rich:4 + tier,
      field:['SFCN'[Math.floor(roll(6) * 4)], x, y, w, h],
      breach:G.cleared?.includes(name) ? null : {id:name, x:bx, y:by, r, left:total, total, tier, form:Math.floor(roll(10) * 4), tough:LEVEL.tough[tier], genes:[G.families[Math.floor(roll(7) * 3)]], state:'sleep', wave:0, pending:0, ended:0}
    };
  }
  // Carbon lies between the rows, where no circle reaches. Nothing guards it.
  if (!mod(sy, 2) || roll(1) > .3) return null;
  const w = 5 + Math.floor(roll(9) * 3), cx = left + 12 + w / 2, cy = top + 14.5;
  for (let i = -1; i < 2; i++) for (const j of [-1, 1]) {
    const near = nestSector(sx + i, sy + j);
    if (near && Math.hypot(near.bx - cx, near.by - cy) <= near.r + w / 2 + 3) return null;
  }
  return {rich:2 + tierAt(cx, cy), field:[tierAt(cx, cy) >= 2 && roll(11) < .5 ? 'I' : 'K', left + 12, top + 12, w, 5]};
}
// The fog has three states: never seen, seen before (saved), seen now. A tile is two cells,
// a block sixteen tiles each way and one number a row of tiles.
export const SIGHT = {core:56, built:18, moving:8, nest:6, radar:36};
// A radar pulses every 3 s across what it sees: twice once built, and while selected. Otherwise it stays still.
export const RADAR = {range:36, pulse:3};
export let live = new Map(), passingBy = new Map(), standing = new Map(), movedFrom = '', fogTick = 0;
export function bitAt(get, x, y) {
  const tx = Math.floor(x / 2), ty = Math.floor(y / 2), rows = get(Math.floor(tx / 16) + ',' + Math.floor(ty / 16));
  return Boolean(rows && rows[mod(ty, 16)] >> mod(tx, 16) & 1);
}
export function inSight(x, y) { return bitAt(id => live.get(id), x, y) || bitAt(id => passingBy.get(id), x, y); }
export function lightUp(sets, x, y, r) {
  for (let ty = Math.floor((y - r) / 2); ty <= Math.floor((y + r) / 2); ty++) {
    const dy = ty * 2 + 1 - y, half = Math.sqrt(Math.max(0, r * r - dy * dy));
    if (!half) continue;
    const last = Math.floor((x + half) / 2), by = Math.floor(ty / 16), row = mod(ty, 16);
    for (let tx = Math.floor((x - half) / 2); tx <= last; tx++) {
      const id = Math.floor(tx / 16) + ',' + by, bit = 1 << mod(tx, 16);
      for (const set of sets) set(id)[row] |= bit;
    }
  }
}
// Who sees, how far, and what that uncovers. A nest shows as soon as ground in sight reaches its circle,
// so none is ever woken from out of the fog.
export function look(force?) {
  forgetCells();
  G.seen ||= {};
  const eyes = new Map(), moving = new Map();
  const eye = (x, y, r, into = eyes) => {
    // Neighbours share one eye, or a belt would cost as much as it is long.
    const ex = Math.floor(x / 4) * 4 + 2, ey = Math.floor(y / 4) * 4 + 2, id = ex + ',' + ey;
    if (!(into.get(id)?.r >= r)) into.set(id, {x:ex, y:ey, r});
  };
  for (const c of allCells()) if (c.type === 'core' || built(c)) eye(c.x, c.y, (c.type === 'core' ? SIGHT.core : c.type === 'radar' ? SIGHT.radar : SIGHT.built) * (1 + .25 * labLevel('sight')));
  for (const t of Object.values<any>(G.tracks)) if (built(t)) eye(t.x, t.y, SIGHT.built);
  for (const d of G.drones || []) if (d.job) eye(d.x, d.y, SIGHT.moving, moving);
  for (const w of G.worms) if (built(w)) { const p = at(w.path[0]); eye(p.x, p.y, SIGHT.moving, moving); }
  // What stands is only added to, until something falls. What moves is few and drawn again when it moves.
  const all = force || [...standing].some(([id, e]) => eyes.get(id)?.r !== e.r);
  const added = [...eyes].filter(([id, e]) => all || standing.get(id)?.r !== e.r).map(([, e]) => e);
  const movers = [...moving.values()], from = movers.map(e => `${e.x},${e.y},${e.r}`).join(';'), moved = all || from !== movedFrom;
  if (all || added.length || moved) {
    standing = eyes; movedFrom = from; fogTick++;
    if (all) live = new Map();
    const into = map => id => { if (!map.has(id)) map.set(id, new Array(16).fill(0)); return map.get(id); };
    const ever = id => (G.seen[id] ||= new Array(16).fill(0));
    const now = into(live);
    for (const e of added) lightUp([now, ever], e.x, e.y, e.r);
    if (moved) {
      passingBy = new Map();
      const by = into(passingBy);
      for (const e of movers) lightUp([by, ever], e.x, e.y, e.r);
    }
    const list = moved ? [...added, ...movers] : added;
    const round = new Map(), nests = new Map<any, any>(G.breaches.map(b => [b.id || b, b]));
    for (const e of list) round.set(Math.floor(e.x / SECTOR) + ',' + Math.floor(e.y / SECTOR), e);
    for (const e of round.values()) eachSector(e.x - 72, e.y - 72, e.x + 72, e.y + 72, s => { if (s.breach && !nests.has(s.breach.id)) nests.set(s.breach.id, s.breach); });
    for (const b of nests.values()) if (list.some(e => Math.hypot(e.x - b.x, e.y - b.y) <= e.r + b.r + 4)) lightUp([ever], b.x, b.y, SIGHT.nest);
  }
  // What was last seen of a nest is what the fog keeps showing.
  for (const b of G.breaches) if ((!b.known || b.known.left !== b.left || b.known.state !== b.state) && inSight(b.x, b.y)) b.known = {left:b.left, state:b.state};
}
export function eachSector(x0, y0, x1, y1, visit) {
  for (let sx = Math.floor(x0 / SECTOR); sx <= Math.floor(x1 / SECTOR); sx++)
    for (let sy = Math.floor(y0 / SECTOR); sy <= Math.floor(y1 / SECTOR); sy++) { const s = sector(sx, sy); if (s) visit(s); }
}
export function depositAt(x, y) {
  if (atHome(x, y)) return DEPOSIT[key(x, y)];
  const f = sector(Math.floor(x / SECTOR), Math.floor(y / SECTOR))?.field;
  return f && patchOf(f).cells.has(key(x, y)) ? f[0] : undefined;
}
// The deposit a cell belongs to: the field whose patch holds it.
export function fieldAt(x, y) {
  const id = key(x, y);
  if (atHome(x, y)) return FIELDS.find(f => patchOf(f)?.cells.has(id));
  const f = sector(Math.floor(x / SECTOR), Math.floor(y / SECTOR))?.field;
  return f && patchOf(f).cells.has(id) ? f : undefined;
}
// A deposit feeds a few harvesters only (item_018): past them, one harvester's line is shared with a splitter,
// or ranked up. A large harvester counts as one. Games saved with more keep theirs.
export const HARVESTERS_PER_DEPOSIT = 3;
export function harvestersOn(field) {
  const cells = field && patchOf(field)?.cells;
  return cells ? allCells().filter(c => (c.type === 'mine' || c.type === 'borer') && cells.has(key(c.x, c.y))).length : 0;
}
export const depositFull = (x, y) => harvestersOn(fieldAt(x, y)) >= HARVESTERS_PER_DEPOSIT;
export function richAt(x, y) {
  if (atHome(x, y)) return RICH[key(x, y)];
  return depositAt(x, y) && sector(Math.floor(x / SECTOR), Math.floor(y / SECTOR)).rich;
}
export let G: any;
// A gate is a belt with a switch.
export const isBelt = c => c?.type === 'belt' || c?.type === 'gate';
export const key = (x, y) => x + ',' + y;
// Isotope lies only far out, and is harvested from stage 5 on.
export const minable = kind => kind !== 'I' || unlocked(4);
export const opposite = gene => [...gene].map(b => PAIR[b]).join('');
// Defences cost ADN, each one more than the last: the soft limit on turrets and walls.
export const START_DNA = 80;
export const gunPrice = type => n => GUNS[type].cost + 10 * n;
// The three turrets climb one scale, or taking turns between them would get round it.
export const PRICE = {desk:() => 20, reaper:() => 120, glue:() => 25, mist:gunPrice('mist'), harpoon:gunPrice('harpoon'), arm:() => 12, burn:() => 10, screen:() => 15, lab:() => 150, relay:() => 10, radar:n => 30 + 15 * n, turret:gunPrice('turret'), sting:gunPrice('sting'), maw:gunPrice('maw'), wall:n => 5 + Math.floor(n / 5), worm:n => 20 + 10 * n};
export const owned = type => type === 'worm' ? G.worms.length : allCells().filter(c => GUNS[type] ? GUNS[c.type] : c.type === type).length;
// Taking a finished one down returns half of what the last one cost, less its damage: building and removing
// never earns. A site given up before it was finished returns all of it.
export const refund = c => {
  const worth = (PRICE[c.type] ? PRICE[c.type](owned(c.type) - 1) : 0) + rankCost(c.type, c.mk);
  // Read when the dismantling was asked: a building being taken down no longer counts as built.
  const finished = c.unfinished == null ? (c.left || 0) <= 0 : !c.unfinished;
  return worth ? Math.floor(worth * (finished ? .5 : 1) * Math.max(0, c.hp) / TYPES[c.type].hp) : 0;
};
// Work only advances with the simulation and only with a drone at the site: one drone a site, oldest site first.
export const BUILDERS = 3;
// New games start with two drones; the lab buys up to six. Games from before keep theirs.
export const NEW_DRONES = 2;
// Tests replaying games recorded before the lab start them as they were, with three.
export const START_DRONES_OF = () => (hooks.drawsRecipes() ? NEW_DRONES : BUILDERS) + (G?.mutations?.drone || 0);
export const labLevel = id => G?.lab?.[id] || 0;
// The recycler: its beam pulls the nearest corpse in reach, analyses it, and gives its gene or, when the copy fails, carbon.
export const REAPER = {reach:[4, 6, 8, 10], copy:[.5, .65, .8, 1], time:1.2};
export const reaperReach = () => REAPER.reach[labLevel('pull')];
// Output i of a machine with three: 0 left, 1 ahead, 2 right, the sides swapped when mirrored.
export const outSide = (c, i) => (c.dir + 3 + (c.flip ? 2 - i : i)) % 4;
export function reap(c) {
  if (!built(c) || c.item) return;
  if (c.beam) {
    if (G.time - c.beam.at < REAPER.time) return;
    const copied = Math.random() < REAPER.copy[labLevel('copy')];
    c.item = c.last = copied ? c.beam.gene : 'K';
    c.flash = {ok:copied, at:G.time}; c.beam = null; c.made.push(G.time);
    return;
  }
  c.made = c.made.filter(t => t > G.time - 10);
  const cx = c.x + .5, cy = c.y + .5, reach = reaperReach();
  let best = null, far = Infinity;
  for (const d of G.corpses || []) {
    const away = Math.hypot(d.x - cx, d.y - cy);
    if (away <= reach && away < far && corpseSunk(d) < 1 && /^[SCFN]{3}$/.test(d.gene || '')) { best = d; far = away; }
  }
  if (!best) return;
  G.corpses.splice(G.corpses.indexOf(best), 1);
  c.beam = {x:best.x, y:best.y, gene:best.gene, kind:best.kind, a:best.a, at:G.time};
}
export const reachOf = type => GUNS[type].range * (1 + .1 * labLevel('reach'));
export const DRONE = {speed:20, reach:2, longest:4}; // a flight never takes over 4 s, so far ones cruise faster
export const BUILD = {radar:4, belt:.15, gate:.5, bridge:.5, split2:1, split:1, sort:1, pump:1.5, mine:2, cyst:2, ligase:2.5, wall:3, turret:6, join:2.5, track:.1, pocket:1.5, worm:5, pack:2.5, sting:7, maw:5, borer:6, vault:5};
// cut: a drone has started taking it down. Until then it goes on working.
export const built = c => !(c?.left > 0) && !c?.cut;
// Healing starts after some quiet, so a wall under attack still falls. The core heals more slowly.
export const REPAIR = {quiet:5, share:.02, core:.005};
export const fullHp = c => (TYPES[c.type]?.hp ?? 100) * (GUNS[c.type] ? GUN_RANK : c.type === 'wall' ? WALL_RANK : [1, 1, 1])[(c.mk || 1) - 1];
export const healing = c => !c.cut && c.hp > 0 && c.hp < fullHp(c) && G.time - (c.hitAt ?? -99) >= REPAIR.quiet;
export const unlocked = stage => G.open || G.stage >= stage;
export const richCap = () => unlocked(3) ? 8 : unlocked(2) ? 2 : 1;
// Producers and stores rank up at one and a half times their first prices (item_018): DNA is scarcer.
export const RANKS = {
  belt:{cost:[0, 4, 16], time:.15},
  mine:{cost:[0, 120, 300], time:2},
  borer:{cost:[0, 450, 1200], time:4},
  cyst:{cost:[0, 75, 180], time:2},
  vault:{cost:[0, 225, 600], time:5},
  // Splitters and sorters pass at most the pace of their rank, as a belt of that rank.
  split2:{cost:[0, 10, 30], time:.5},
  split:{cost:[0, 10, 30], time:.5},
  sort:{cost:[0, 16, 40], time:.5},
  // Transformers make 1, 2 or 3 objects a second.
  ligase:{cost:[0, 120, 300], time:2.5},
  join:{cost:[0, 120, 300], time:2.5},
  pack:{cost:[0, 225, 600], time:2.5},
  unpack:{cost:[0, 225, 600], time:2.5},
  flip:{cost:[0, 120, 300], time:2},
  unbind:{cost:[0, 120, 300], time:2},
  unjoin:{cost:[0, 120, 300], time:2},
  arm:{cost:[0, 40, 120], time:1.5},
  // A burner clears what a belt of its rank brings: 4, 8 or 12 a second, the beat it misses between steps carried over.
  burn:{cost:[0, 30, 90], time:1},
  // Defences: turrets fire faster and hold more, walls hold more.
  turret:{cost:[0, 100, 250], time:3},
  sting:{cost:[0, 200, 500], time:4},
  maw:{cost:[0, 150, 380], time:3},
  glue:{cost:[0, 60, 160], time:3},
  mist:{cost:[0, 180, 450], time:4},
  harpoon:{cost:[0, 260, 650], time:5},
  wall:{cost:[0, 24, 80], time:2}
};
// The ones whose drawing does not show their rank itself: one ring a rank above the first.
export const GUN_RANK = [1, 1.5, 2], WALL_RANK = [1, 2, 3];
export const HOLD = {cyst:[60, 120, 240], vault:[360, 720, 1440]};
export const capOf = c => HOLD[c.type][rankOf(c) - 1];
export const BELT_SPEED = 4;
export const rankOf = c => c.mk || 1;
// A strain mutation (item_026) takes 30 % off the MK2 rank.
export const rankCost = (type, mk = 1) => { const cost = RANKS[type]?.cost[mk - 1] || 0; return mk === 2 && G?.mutations?.rank ? Math.round(cost * .7) : cost; };
export function perSecond(c) {
  if (hasTrait(c.type, 'rate')) return rankOf(c);
  if (c.type !== 'mine' && c.type !== 'borer') return 1;
  return rankOf(c) * (c.type === 'borer' ? BORER.harvesters : 1) * Math.min(richCap(), richUnder(c) || 1) * (1 + .15 * (G?.mutations?.harvest || 0)) * (1 - RING.deposit * ringOf());
}
export function dropRise(c) {
  if (c.up == null) return;
  G.dna += c.upPaid;
  delete c.up; delete c.upTo; delete c.upPaid; delete c.upOrder;
}
export function exitsOf(c) {
  if (isSplit(c)) return splitExits(c);
  if (c.type === 'sort') return [c.dir, sideExit(c)];
  if (c.type === 'bridge') return [0, 1].map(axis => wayOf(c, axis)).filter(way => way != null);
  return isBelt(c) ? [c.dir] : [];
}
// A bridge lane, gate, splitter or sorter runs as slow as the slowest rail it joins. Those side by side share one pace.
export let paces = new Map();
export const follows = c => Boolean(c) && (c.type === 'gate' || c.type === 'bridge' || c.type === 'sort' || isSplit(c));
// Splitters and sorters of a game from before their ranks take the rank of their rails, free, so nothing slows down.
export let uncapped = false;
export function paceOf(c, axis = 0) {
  if (c.type === 'belt') return BELT_SPEED * rankOf(c);
  if (!follows(c)) return BELT_SPEED;
  // A bridge's two lanes run apart, each at the pace of its own rails; axis 0 is vertical, 1 horizontal.
  const id = (one, ax) => one.type === 'bridge' ? `${key(one.x, one.y)}|${ax % 2}` : key(one.x, one.y);
  const exits = (one, ax) => one.type === 'bridge' ? [wayOf(one, ax)].filter(way => way != null) : exitsOf(one);
  if (paces.has(id(c, axis))) return paces.get(id(c, axis));
  const group = new Map([[id(c, axis), [c, axis % 2]]]);
  let slow = Infinity, cap = Infinity;
  for (const [one, ax] of group.values()) {
    if (hasTrait(one.type, 'capped') && !uncapped) cap = Math.min(cap, rankOf(one));
    for (let d = 0; d < 4; d++) {
    if (one.type === 'bridge' && d % 2 !== ax) continue;
    const n = ahead(one, d);
    if (!n || (n.type !== 'belt' && !follows(n))) continue;
    const back = (d + 2) % 4;
    if (!(exits(one, ax).includes(d) && connects(n, d)) && !(exits(n, d % 2).includes(back) && connects(one, back))) continue;
    if (n.type === 'belt') slow = Math.min(slow, rankOf(n)); else if (!group.has(id(n, d))) group.set(id(n, d), [n, d % 2]);
    }
  }
  const pace = BELT_SPEED * Math.min(slow === Infinity ? 1 : slow, cap);
  for (const at of group.keys()) paces.set(at, pace);
  return pace;
}
// A storage gives at the pace of the rail it gives to.
export function mouthPace(door, dir) {
  const to = ahead(door, dir);
  return to && (to.type === 'belt' || follows(to)) ? paceOf(to, dir) : BELT_SPEED;
}
export const ahead = (c, dir = c.dir) => cellAt(c.x + DX[dir], c.y + DY[dir]);

export function cell(type, x, y, dir) {
  return {to:null, packets:[], veinHp:VEIN.hp, type, x, y, dir, hp:TYPES[type]?.hp ?? 100, item:null, t:0, clock:0, from:-1,
    ports:[[],[],[]], flip:false, open:true, want:'C', side:3, box:'T', seen:'', stock:[], ammo:{}, lanes:[null,null], made:[], turn:0, last:''};
}
// One list of the factory for every reader of a task, instead of a copy each: put and remove forget it,
// and it never outlives the task, so a change made anywhere else is seen by the next task.
export let cellMemo = null, pumpMemo = null;
export function forgetCells() { cellMemo = pumpMemo = null; }
export function allCells() {
  if (cellMemo?.of !== G.cells) { cellMemo = {of:G.cells, list:Object.values(G.cells)}; pumpMemo = null; queueMicrotask(forgetCells); }
  return cellMemo.list;
}
export function put(type, x, y, dir): any { forgetCells(); return G.cells[key(x, y)] = cell(type, x, y, dir); }
export function sites() {
  const jobs = [];
  const look = c => {
    if (c.left > 0) jobs.push({c, field:'left', order:c.order});
    if (c.out != null) jobs.push({c, field:'out', order:c.outOrder});
    if (c.up != null) jobs.push({c, field:'up', order:c.upOrder});
  };
  for (const c of allCells()) {
    look(c);
    if (c.to && c.veinLeft > 0) jobs.push({c, field:'veinLeft', order:c.veinOrder});
    if (c.to && c.veinOut != null) jobs.push({c, field:'veinOut', order:c.veinOutOrder});
  }
  for (const c of [...Object.values(G.tracks), ...G.worms, ...G.wires]) look(c);
  for (const [id, c] of Object.entries<any>(G.ruins)) if (c.out != null && !buried(c)) jobs.push({c, field:'out', order:c.outOrder});
  return jobs.sort((a, b) => a.order - b.order);
}
export function perch(i) {
  const a = -Math.PI / 2 + i * Math.PI * 2 / Math.max(START_DRONES_OF(), G.drones?.length || 0);
  return {x:CORE.x + .5 + Math.cos(a) * 1.05, y:CORE.y + .5 + Math.sin(a) * 1.05};
}
export function hatchDrones() {
  // h is the height and w how far into its working pose it is. was: one tick ago, for drawing in between.
  G.drones = Array.from({length:START_DRONES_OF()}, (_, i) => {
    const {x, y} = perch(i), a = Math.atan2(y - CORE.y - .5, x - CORE.x - .5);
    return {x, y, a, h:.55, w:0, trip:'nest', speed:DRONE.speed, job:'', goal:null, was:{x, y, h:.55, w:0}};
  });
}
export const jobId = job => job.field + job.order;
export const at = id => { const [x, y] = id.split(',').map(Number); return {x, y}; };
// Taking down lasts what putting up did.
export function workTime(c, vein = false) {
  if (vein) return .5 + span(c, at(c.to)) / 12;
  if (c.a) return .4 + span(at(c.a), at(c.b)) / 16;
  if (c.path) return BUILD.worm;
  if (G.ruins[key(c.x, c.y)] === c) return 1;
  return BUILD[c.type || 'track'] || 1;
}
export function unlink(c) {
  for (const p of c.packets) for (let i = 0; i < p.n; i++) c.stock.push(p.item);
  c.packets = []; c.to = null; c.veinLeft = 0;
  delete c.veinOut; delete c.veinCut; delete c.veinOutOrder;
}
export function finishJob({c, field}) {
  if (field === 'veinOut') return unlink(c);
  if (field === 'left' && c.type === 'radar') c.shownAt = G.time;
  if (field === 'up') {
    c.mk = c.upTo;
    hooks.playNear('rank', c);
    delete c.up; delete c.upTo; delete c.upPaid; delete c.upOrder;
    hooks.jobDone(c);
    return;
  }
  if (field !== 'out') { c[field] = 0; return; }
  if (c.a) { G.wires = G.wires.filter(w => w !== c); sense(); }
  else if (c.path) { dropWorm(c, true); hooks.wormGone(c); }
  else if (G.tracks[key(c.x, c.y)] === c) delete G.tracks[key(c.x, c.y)];
  else { remove(c.x, c.y); if (c.leaves) leave(c); }
}
// A bridge taken down alone leaves the line it was laid over: a belt running that lane's way, what rode it still on.
export function leave(c) {
  const axis = c.dir % 2, lane = c.lanes?.[axis], b = put(c.leaves, c.x, c.y, c.type === 'bridge' ? wayOf(c, axis) ?? c.dir : c.dir);
  if (lane && b.type === 'belt') { b.item = lane.item; b.t = lane.t; }
  return b;
}
// Where a drone has to be. Along a vein or a nerve, that advances with the work.
export function workAt({c, field}) {
  let a, b;
  const vein = field.startsWith('vein');
  if (vein) { a = c; b = at(c.to); }
  else if (c.a) { a = at(c.a); b = at(c.b); }
  else {
    const p = c.path ? at(c.path[0]) : c;
    return c.path ? {x:p.x + .5, y:p.y + .5} : centreOf(c);
  }
  const total = workTime(c, vein);
  const k = Math.max(0, Math.min(1, 1 - c[field] / total));
  return {x:a.x + .5 + (b.x - a.x) * k, y:a.y + .5 + (b.y - a.y) * k};
}
export function construct(dt) {
  let open = new Map(sites().map(job => [jobId(job), job]));
  const held = new Set();
  for (const d of G.drones) {
    d.was = {x:d.x, y:d.y, h:d.h, w:d.w};
    if (open.has(d.job)) held.add(d.job); else d.job = '';
  }
  const free = G.drones.filter(d => !d.job);
  for (const [id, job] of open) {
    if (!free.length) break;
    if (held.has(id)) continue;
    const to = workAt(job), far = d => Math.hypot(d.x - to.x, d.y - to.y);
    const d = free.reduce((best, other) => far(other) < far(best) ? other : best);
    free.splice(free.indexOf(d), 1);
    d.job = id; held.add(id);
  }
  G.drones.forEach((d, i) => {
    const fly = (to, distance) => {
      const dx = to.x - d.x, dy = to.y - d.y, all = Math.hypot(dx, dy);
      if (all < 1e-6 || distance <= 0) return;
      const k = Math.min(1, distance / all);
      d.x += dx * k; d.y += dy * k; d.a = Math.atan2(dy, dx);
    };
    let time = dt, working = false;
    const cruise = to => Math.max(DRONE.speed, Math.hypot(to.x - d.x, to.y - d.y) / DRONE.longest) * (1 + .2 * labLevel('speed'));
    while (d.job && time > 1e-9) {
      const job = open.get(d.job);
      if (!job) { d.job = ''; break; } // gone with what was just taken down
      const to = workAt(job);
      if (d.trip !== d.job) { d.trip = d.job; d.speed = cruise(to); }
      const gap = Math.hypot(to.x - d.x, to.y - d.y) - DRONE.reach;
      d.goal = to;
      if (gap > 1e-6) {
        const used = Math.min(time, gap / d.speed);
        fly(to, used * d.speed); time -= used;
        if (used * d.speed < gap - 1e-6) break;
      }
      // In reach it works, closing in on the middle as it does.
      const used = Math.min(time, job.c[job.field]);
      job.c[job.field] -= used; time -= used; working = true;
      d.undo = job.field === 'out' || job.field === 'veinOut';
      if (job.field === 'out') job.c.cut = true;
      if (job.field === 'veinOut') job.c.veinCut = true;
      fly(to, used * DRONE.speed);
      if (job.c[job.field] > 1e-9) break;
      // Straight on to the oldest site nobody has, without going home.
      if (job.field === 'left') hooks.playNear('done', job.c, .15);
      finishJob(job); open.delete(d.job); d.job = '';
      // Taking something down can end other sites with it: its nerves, a vein that reached it.
      if (d.undo) open = new Map(sites().map(other => [jobId(other), other]));
      for (const id of open.keys()) if (!held.has(id)) { d.job = id; held.add(id); break; }
    }
    const nest = perch(i);
    if (!d.job) {
      if (d.trip !== 'nest') { d.trip = 'nest'; d.speed = cruise(nest); }
      d.goal = null; fly(nest, time * d.speed);
    }
    const landed = !d.job && Math.hypot(nest.x - d.x, nest.y - d.y) < .01;
    if (landed) d.a = Math.atan2(nest.y - CORE.y - .5, nest.x - CORE.x - .5);
    d.h += ((landed ? .55 : working ? 1.05 : 1.7) - d.h) * Math.min(1, dt * 7);
    d.w += ((working ? 1 : 0) - d.w) * Math.min(1, dt * 9);
  });
}
export function repair(dt) {
  for (const w of G.wires) if (w.hp > 0 && w.hp < NERVE.hp && G.time - (w.hitAt ?? -99) >= REPAIR.quiet) w.hp = Math.min(NERVE.hp, w.hp + NERVE.hp * dt * REPAIR.share);
  for (const w of G.worms) if (w.hp < WORM.hp && G.time - (w.hitAt ?? -99) >= REPAIR.quiet) w.hp = Math.min(WORM.hp, w.hp + WORM.hp * dt * REPAIR.share);
  for (const c of allCells()) {
    if (healing(c)) c.hp = Math.min(fullHp(c), c.hp + fullHp(c) * dt * (c.type === 'core' ? REPAIR.core : REPAIR.share * (1 + .3 * labLevel('repair'))));
    // A severed vein needs Reconstruire, a wounded one closes by itself.
    if (c.to && c.veinHp > 0 && c.veinHp < VEIN.hp && G.time - (c.veinHitAt ?? -99) >= REPAIR.quiet)
      c.veinHp = Math.min(VEIN.hp, c.veinHp + VEIN.hp * dt * REPAIR.share);
  }
}
// A creature killed pays 3 DNA (1 until 0.2.4): the swarms pay for the defence they call for.
export const KILL_PAY = 3;
export function earn(source, amount) {
  G.dnaBits = (G.dnaBits || 0) + amount;
  const whole = Math.floor(G.dnaBits + 1e-9);
  G.dna += whole;
  G.dnaBits -= whole;
  hooks.noteEarned(source, amount);
  if (source === 'guide') hooks.playSound('step');
}
// A gene of three bases delivered unasked pays 3 / SURPLUS DNA.
export const SURPLUS = 18;
export function eat(item) {
  // A container is worth what it holds, carbon adds nothing. What the core asks for moves the stage and pays
  // nothing; what it does not ask for pays a sixth of a gene's worth (a third before item_018).
  const holds = boxOf(item) ? fill(boxOf(item)) : 1;
  const want = STAGES[G.stage];
  if (G.base?.includes(item)) (G.baseAt ||= {})[item] = G.time;
  // A base gene the core eats is its food: like a recipe, it pays nothing (item_018), so DNA does not pile up with time.
  const food = eaten().includes(item);
  if (G.goals) {
    // The first recipe this item still counts for; the stage grows once every one is met. A hungry core counts half.
    const goal = G.goals.find(g => g.item === item && g.fed < g.count);
    if (!goal) { if (!food) { earn('core', holds * contentOf(item).length / SURPLUS); hooks.playNear('dna', coreCell() || CORE, .4); } return; }
    const part = hungryFor().length ? HUNGRY_SHARE : 1;
    goal.fed = Math.min(goal.count, goal.fed + part); G.fed += part;
    if (stageDone()) grow();
    hooks.playNear('eat', coreCell() || CORE, .25);
    return;
  }
  if (!want || item !== want.item) { earn('core', holds * contentOf(item).length / SURPLUS); hooks.playNear('dna', coreCell() || CORE, .4); return; }
  if (want.rate) for (let i = 0; i < holds; i++) G.meals.push(G.time);
  else if (++G.fed >= want.count) grow();
  hooks.playNear('eat', coreCell() || CORE, .25);
}
// Capsules come three seconds apart: a short window would see the rate jump between none and double.
export const mealWindow = () => boxOf(STAGES[G.stage]?.item || '') ? 10 : 5;
export function mealRate() { return G.meals.length / mealWindow(); }
export function digest(dt) {
  const want = STAGES[G.stage];
  if (!want?.rate) return;
  G.meals = G.meals.filter(t => t > G.time - mealWindow());
  // A short hiccup costs the time it lasted, never the whole minute.
  G.held = mealRate() >= want.rate * .9 - 1e-9 ? G.held + dt : Math.max(0, G.held - dt);
  if (G.held >= want.hold - 1e-6) grow();
}
// From the second stage, several recipes at once, drawn when the stage begins: more the further it goes. A capsule
// holds one gene, or a strand of two (stage 3 on, with the Assembleur); the magazine is the antidote of the newest
// family; the heavy capsule comes with the isotope. Games from before keep their one recipe a stage (no G.goals).
export const RECIPES = [
  null,
  [{box:'T', genes:1, count:50}, {box:'T', genes:1, count:50}],
  [{box:'T', genes:2, count:10}, {box:'T', genes:2, count:10}, {box:'T', genes:1, count:30}],
  [{anti:true, count:40}, {box:'T', genes:1, count:30}, {box:'T', genes:2, count:10}],
  [{box:'H', genes:2, count:8}, {box:'T', genes:2, count:10}, {box:'T', genes:1, count:30}, {anti:true, count:30}],
  [{box:'H', genes:2, count:12}, {box:'T', genes:2, count:16}, {box:'T', genes:1, count:40}, {box:'T', genes:1, count:40}, {anti:true, count:40}]
];
// A gene of the bases this world has deposits of, never an enemy family nor one already asked this stage.
export function drawGene(taken) {
  const bases = Object.keys(BASE).filter(b => Object.values(DEPOSIT).includes(b));
  for (let tries = 0; tries < 200; tries++) {
    const gene = Array.from({length:3}, () => bases[Math.floor(Math.random() * bases.length)]).join('');
    if (!G.families.includes(gene) && !taken.has(gene)) { taken.add(gene); return gene; }
  }
  return 'SFS';
}
// The base genes: three drawn per game from a designed pool, whose bases the map has, at least one of them near the
// core. Each stage's recipe is built on them, and the core keeps eating them as long as the game lasts.
export const BASE_POOL = ['SFS', 'FFF', 'SSS', 'CCF', 'CSC', 'NFN', 'SSN', 'FNF'];
export const BASE_COUNT = 3;
// The core counts a stage's deliveries in full while every base gene it already eats came in the last BASE_WINDOW
// seconds, and HUNGRY_SHARE of each while one did not (operator decision, 2026-11-24: half, not nothing).
export const BASE_WINDOW = 30;
export const HUNGRY_SHARE = .5;
export function drawBase() {
  const have = new Set(Object.values(DEPOSIT)), near = new Set(INNER.map(([kind]) => kind));
  const pool = BASE_POOL.filter(gene => [...gene].every(b => have.has(b)) && [...gene].some(b => near.has(b)));
  const out = [];
  while (out.length < BASE_COUNT && pool.length) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  return out;
}
// The base genes the core eats at this stage: the first at the start, one more a stage, all three from the third.
export const eaten = () => (G.base || []).slice(0, Math.min(BASE_COUNT, G.stage + 1));
export function hungryFor() { return eaten().filter(gene => !(G.time - (G.baseAt?.[gene] ?? -1e9) <= BASE_WINDOW)); }
// The stages built on the base genes: one, then a strand of two, its capsule and a strand reusing a gene, the
// antidote that asks for the fight (the family born at stage 4 is the one the third base gene answers), then a
// heavy capsule of one gene.
export function layeredGoals(stage) {
  const [a, b, c] = G.base, anti = `A:${opposite(G.mutant || G.families[G.families.length - 1])}`;
  const plans = [
    [[a, 100]],
    [[a + b, 30]],
    [[`T:${a}${b}`, 10], [b + c, 30]],
    [[anti, 40], [`T:${b}${c}`, 10]],
    [[`H:${c}`, 8], [`T:${b}${c}`, 16], [anti, 30]],
    [[`H:${c}`, 12], [`T:${b}${c}`, 16], [anti, 40]],
  ];
  return (plans[stage] || []).map(([item, count]) => ({item, count, fed:0}));
}
// How many lines a recipe takes to the machines that make it (item_020): this game's base genes are already made,
// one line each; any other gene takes its three bases; a box adds its carbon, a heavy one its isotope too. A base
// gene asked on its own takes its three bases.
export function inputLines(item) {
  const box = boxOf(item), genes = contentOf(item).match(/.{3}/g) || [];
  const lines = genes.length === 1 && !box ? 3 : genes.reduce((n, gene) => n + (G.base?.includes(gene) ? 1 : 3), 0);
  return lines + (box ? 1 : 0) + (BOX[box]?.isotope ? 1 : 0);
}
export const MOST_LINES = 3;
// From stage 2 each stage of a drawn game also asks for a mechanic the game already has, counted as it works
// (item_019): creatures a gun kills (the stage 2 swarms; it asked for sorted items until 2026-11-25, and no stage
// may need a sorter), items a nerve lets through, creatures a turret kills with their antidote, seconds a harvester
// holds out by a nest. A stage grows once its recipes and its mechanic are both done.
export const MECHANICS = [null, {need:'kill', count:3}, {need:'nerve', count:30}, {need:'turret', count:10}, {need:'outpost', count:120}, null];
export const drawNeeds = stage => { const m = G.base && MECHANICS[stage]; return m ? [{...m, fed:0}] : []; };
export const needsMet = () => (G.needs || []).every(n => n.fed >= n.count);
const stageDone = () => (G.goals || []).every(g => g.fed >= g.count) && needsMet();
export function credit(need, amount = 1) {
  const n = (G.needs || []).find(o => o.need === need && o.fed < o.count);
  if (!n) return;
  n.fed = Math.min(n.count, n.fed + amount);
  if (G.goals && stageDone()) grow();
}
export function drawGoals(stage) {
  if (G.base) return layeredGoals(stage);
  if (stage === 0) return [{item:STAGES[0].item, count:STAGES[0].count, fed:0}];
  const plan = RECIPES[stage];
  if (!plan) return [];
  const taken = new Set(), items = new Set();
  return plan.map(r => {
    let item;
    for (let tries = 0; tries < 20 && (!item || items.has(item)); tries++) {
      item = r.anti ? `A:${opposite(G.mutant || G.families[G.families.length - 1])}` : `${r.box}:${Array.from({length:r.genes}, () => drawGene(taken)).join('')}`;
    }
    items.add(item);
    return {item, count:r.count, fed:0};
  });
}
export function grow() {
  const done = STAGES[G.stage];
  G.stage++; G.fed = G.held = 0; G.meals = []; G.grownAt = G.time;
  hooks.playSound('stage_up');
  earn('stage', GROWTH_BONUS);
  coreCell().hp = 100;
  hooks.select(null);
  hooks.tell(L`${done.name} achevé : le cœur grandit. ${done.gives}, +${GROWTH_BONUS} ADN.`);
  if (G.stage === 3) { G.mutant = mutation(G.base ? opposite(G.base[2]) : null); G.mutateAt = G.time + MUTATION.every; }
  if (G.goals) { G.goals = drawGoals(G.stage); G.needs = drawNeeds(G.stage); }
  if (G.stage === STAGES.length && G.won == null) G.won = G.time;
  if (G.stage === 4) G.labDiscount = true;
}
export function fresh() {
  G = {time:0, ranked:true, capsules:true, world:2, seed:newSeed(), far:true, paid:true, wires:[], stage:0, fed:0, held:0, meals:[], open:false, tracks:{}, worms:[], cells:{}, ruins:{}, enemies:[], shots:[], threat:0, dna:START_DNA, kills:0, made:0,
    woken:0, breaches:[], families:['SFN','SSC','FNN'], over:false};
  // The core alone, on a 3x3 plinth fed from any of its twelve faces: the guide has the player build the first line.
  put('core', CORE.x - 1, CORE.y - 1, 0).size = 3;
  survey();
  if (hooks.drawsRecipes()) { G.base = drawBase(); G.baseAt = {}; G.goals = drawGoals(0); G.needs = drawNeeds(0); }
  if (hooks.drawsRecipes()) G.bigTracks = true;
  // Tests replaying games recorded on the first line older versions gave lay it again here.
  hooks.testLine();
  nest();
  hatchDrones();
  hooks.onFresh(); NET = new Map();
}

// Side of a ligase an item enters by: 0 left, 1 back, 2 right. Mirroring swaps 1 and 3.
export function portOf(c, travel) {
  const side = (travel + 2 - c.dir + 8) % 4;
  if (!side) return -1;
  const port = {3:0, 2:1, 1:2}[side];
  return c.flip ? 2 - port : port;
}
// A sorter sends what fits its filter to the chosen side (3 left, 1 right). '?' is any base.
// A filter reads what is inside a container.
export function fits(c, item) {
  const inside = contentOf(item);
  return inside.length === c.want.length && [...c.want].every((b, i) => b === '?' || b === inside[i]);
}
export function sideExit(c) { return (c.dir + c.side) % 4; }
// A bridge has two lanes: 0 vertical, 1 horizontal. Each is automatic until the player sets its way.
export function wayOf(c, axis) {
  if (c.ways?.[axis] != null) return c.ways[axis];
  for (const dir of [axis, axis + 2]) {
    let before = c, after = c;
    do before = ahead(before, (dir + 2) % 4); while (before?.type === 'bridge');
    do after = ahead(after, dir); while (after?.type === 'bridge');
    if (before && hasTrait(before.type, 'outFront') && before.dir === dir) return dir;
    if (before?.type === 'sort' && sideExit(before) === dir) return dir;
    if (before?.type === 'split2' && splitExits(before).includes(dir)) return dir;
    if (before && drains(before)) return dir;
    if (after && hasTrait(after.type, 'inBack') && after.dir === dir) return dir;
  }
  return null;
}
// A vein runs straight from a pump to the one named by `to`. A pump without one empties on its four sides.
export function pumps() { const list = allCells(); return pumpMemo ??= list.filter(c => c.type === 'pump'); }
export function drains(c) { return c.type === 'borer' || (c.type === 'pump' && !c.to) || (c.type === 'pocket' && Boolean(c.unload)); }
export function span(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
export function leaking(c) { return c.veinHp > 0 && c.veinHp < VEIN.hp / 2; }
export function nearest(a, b, x, y) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const t = Math.max(0, Math.min(1, ((x - a.x - .5) * dx + (y - a.y - .5) * dy) / (dx * dx + dy * dy || 1)));
  return {x:a.x + .5 + dx * t, y:a.y + .5 + dy * t};
}
export function network(c) {
  const all = pumps(), found = new Set([c]);
  for (const p of found) for (const q of all) if (p.to === key(q.x, q.y) || q.to === key(p.x, p.y)) found.add(q);
  return found;
}
export function veinKind(c) {
  for (const p of network(c)) {
    const kind = p.stock[0] || p.packets[0]?.item;
    if (kind) return kind;
  }
  return '';
}
export function pulse(dt) {
  const all = pumps(), coming = new Map();
  for (const c of all) for (const p of c.packets) coming.set(c.to, (coming.get(c.to) || 0) + p.n);
  for (const c of all) {
    const to = c.to && G.cells[c.to];
    if (to?.type !== 'pump' || c.veinHp <= 0 || !built(c) || !built(to) || c.veinLeft > 0 || c.veinCut) continue;
    const time = span(c, to) / VEIN.speed;
    for (const p of c.packets) p.t += dt / time;
    while (c.packets.length && c.packets[0].t >= 1) {
      const p = c.packets.shift();
      for (let i = 0; i < p.n; i++) to.stock.push(p.item);
      coming.set(c.to, coming.get(c.to) - p.n);
    }
    c.clock += dt;
    if (c.clock < VEIN.pulse - 1e-6) continue;
    c.clock = Math.min(c.clock - VEIN.pulse, VEIN.pulse);
    const load = leaking(c) ? 3.5 : VEIN.load;
    // Half objects are carried over, so a leak gives exactly 7/s.
    c.part = (c.part || 0) % 1 + load;
    const n = Math.min(Math.floor(c.part + 1e-6), settled(c.stock, c.due), VEIN.cap - to.stock.length - (coming.get(c.to) || 0));
    if (n <= 0) continue;
    c.packets.push({item:c.stock[0], n, t:0}); c.stock.splice(0, n);
    coming.set(c.to, (coming.get(c.to) || 0) + n);
  }
}
// A trail is scent on the ground: one way out per cell, under whatever stands there.
// Worm tracks: one cell in games from before, a 2 by 2 tile in new ones, kept by its corner on even cells.
// Pockets follow (2 by 2) and every worm capacity doubles with the tile.
export const trackSize = () => G?.bigTracks ? 2 : 1;
export const wormHolds = () => 3 + labLevel('holds');
export const holdCap = () => WORM.hold * trackSize();
export const pocketCap = c => WORM.pocket * sizeOf(c);
export const isBig = type => Boolean(BIG[type] || (type === 'pocket' && G?.bigTracks));
export function trackAfter(id) {
  const s = trackSize(), at = G.tracks[id], next = at && G.tracks[key(at.x + DX[at.dir] * s, at.y + DY[at.dir] * s)];
  return next && built(next) ? next : null;
}
export function pocketsAt(id) {
  const at = G.tracks[id];
  if (!at) return [];
  // The cell just out of the tile on each side of its way: a pocket covering it serves this tile.
  const s = trackSize(), out = d => cellAt(at.x + (DX[d] > 0 ? s : DX[d]), at.y + (DY[d] > 0 ? s : DY[d]));
  return [(at.dir + 1) % 4, (at.dir + 3) % 4].map(out).filter(c => c?.type === 'pocket' && built(c));
}
// A pocket in a bend touches two cells of trail: it serves the first of them along the station.
export function stationHead(id) {
  if (!pocketsAt(id).length) return false;
  const next = trackAfter(id);
  return !next || !pocketsAt(key(next.x, next.y)).length;
}
export function dropWorm(w, paidBack) {
  if (paidBack) G.dna += Math.floor(PRICE.worm(G.worms.length - 1) * Math.max(0, w.hp) / WORM.hp);
  G.worms.splice(G.worms.indexOf(w), 1);
}
export function transfer(w, dt) {
  let moved = false;
  w.holds.forEach((hold, i) => {
    const at = w.path[i + 1];
    if (!at) return;
    hold.part = Math.min(4, (hold.part || 0) + dt * WORM.load * trackSize());
    for (const c of pocketsAt(at)) {
      const kind = c.stock[0] || '';
      while (hold.part >= 1 - 1e-6) {
        if (c.unload) {
          if (!hold.n || c.stock.length >= pocketCap(c) || (c.stock.length && c.stock[0] !== hold.kind)) break;
          intoStock(c, hold.kind, [0, 1, 2, 3].find(d => key(c.x - DX[d], c.y - DY[d]) === at) ?? 0); hold.n--;
          if (!hold.n) hold.kind = '';
        } else {
          if (!settled(c.stock, c.due) || hold.n >= holdCap() || (hold.n && hold.kind !== kind)) break;
          hold.kind = c.stock.shift(); hold.n++;
        }
        hold.part--; moved = true;
      }
    }
  });
  return moved;
}
export function mayLeave(w) {
  if (w.rule === 'timer') return G.time - w.since >= WORM.timer;
  let aligned = 0, done = true;
  w.holds.forEach((hold, i) => {
    for (const c of pocketsAt(w.path[i + 1])) {
      aligned++;
      if (c.unload ? hold.n > 0 : hold.n < holdCap()) done = false;
    }
  });
  return !aligned || done || (w.rule === 'auto' && G.time - w.lastMove >= WORM.idle);
}
export function crawl(dt) {
  for (const w of G.worms) {
    // Holds bought at the Laboratory join every worm.
    while (w.holds.length < wormHolds()) w.holds.push({kind:'', n:0, part:0});
    if (!built(w)) continue;
    const long = w.holds.length + 2;
    if (w.docked) {
      if (transfer(w, dt)) w.lastMove = G.time;
      if (!mayLeave(w)) continue;
      w.docked = false; w.t = 0;
    }
    w.t += dt * WORM.speed / trackSize();
    while (w.t >= 1 - 1e-6) {
      const next = trackAfter(w.path[0]);
      if (!next) { w.t = 1; w.stuck = L('la piste s’arrête ici'); break; }
      const id = key(next.x, next.y);
      if (G.worms.some(o => o !== w && o.path.includes(id))) { w.t = 1; w.stuck = L('un autre ver occupe la piste'); break; }
      if (w.path.slice(0, long - 1).includes(id)) { w.t = 1; w.stuck = L`boucle trop courte, il lui faut plus de ${long} cases`; break; }
      w.was = w.path.slice();
      w.path.unshift(id); w.path.length = Math.min(long, w.path.length);
      w.t = Math.max(0, w.t - 1); w.stuck = '';
      // It stops when its first hold faces the last pocket of a row.
      if (w.path.length === long && stationHead(w.path[1])) {
        w.docked = true; w.since = w.lastMove = G.time;
        for (const hold of w.holds) hold.part = 0;
        break;
      }
    }
  }
}
export function carbonSide(c) { return (c.dir + (c.flip ? 1 : 3)) % 4; }
// A heavy capsule also takes from the other side, so carbon and isotope can come on lines of their own: on one line
// in any ratio but two to one, the one in excess would block the other for good.
export const isotopeSide = c => (carbonSide(c) + 2) % 4;
// 0 for what gets packed, 1 for carbon (and isotope).
export function packPort(c, travel) {
  const from = (travel + 2) % 4;
  return from === (c.dir + 2) % 4 ? 0 : from === carbonSide(c) || (c.box === 'H' && from === isotopeSide(c)) ? 1 : -1;
}
export function packTakes(c, item, port) {
  if (port === 1) {
    if (c.box !== 'H') return item === 'K' && c.ports[1].length < PACK.carbon;
    const has = kind => c.ports[1].filter(k => k === kind).length;
    return item === 'K' ? has('K') < BOX.H.carbon : item === 'I' && has('I') < BOX.H.isotope;
  }
  const loose = item.length === 3 || (c.box !== 'A' && item.length === 6);
  // One gene at a time: the wrong one waits outside, it never spoils a box.
  return loose && !boxOf(item) && c.ports[0].length < PACK.genes && (!c.ports[0].length || c.ports[0][0] === item);
}
export function setRecipe(c, box) {
  c.box = box;
  if (box === 'A' && c.ports[0][0]?.length === 6) c.ports[0] = [];
  if (box === 'H') { c.ports[1] = c.ports[1].filter(k => k === 'K').slice(0, BOX.H.carbon); if (c.portDue) c.portDue[1] = []; }
  c.last = '';
}
// The half of the asked strand an item is, as the joiner's port: 0 the front gene, 1 the back one, -1 neither.
export function strandPort(c, item) {
  const f = heardOf(c)?.focus;
  if (f?.length !== 6) return null;
  const front = item === f.slice(0, 3), back = item === f.slice(3);
  if (front && back) return c.ports[0].length <= c.ports[1].length ? 0 : 1;
  return front ? 0 : back ? 1 : -1;
}
export function joinSide(c, port) { return (c.dir + ((port === 0) !== c.flip ? 3 : 1)) % 4; }
export function joinPort(c, travel) {
  const from = (travel + 2) % 4;
  return [0, 1].find(port => joinSide(c, port) === from) ?? -1;
}
export const NERVE = {reach:24, hp:30, hold:4, ends:[...Object.keys(GUNS),'gate','sort','radar','relay','ligase','screen','core','join','pack','desk','cyst','vault']};
export let NET = new Map();
// How many nerves each end is from where its network's message starts: the threat's guns and radars, or the core.
export let NET_HOPS = new Map();
export function carries(w) {
  return w.hp > 0 && built(w) && [w.a, w.b].every(id => G.cells[id] && built(G.cells[id]));
}
// What guns and radars see: the antidote each creature needs, counted, and how near the nearest of each is.
export function sight(turrets, radars) {
  const count = {}, nearest = {};
  // A radar watches creatures, nests, or both: a nest counts with the antidote to its next wave.
  const eyes = radars.filter(c => (c.watch || 'creatures') !== 'nests'), lookouts = radars.filter(c => c.watch === 'nests' || c.watch === 'both');
  for (const b of G.breaches) {
    if (b.state !== 'wake' || !lookouts.some(c => Math.hypot(b.x + .5 - c.x - .5, b.y + .5 - c.y - .5) < RADAR.range)) continue;
    const gene = opposite(waveGene(b));
    count[gene] = (count[gene] || 0) + 1;
  }
  for (const e of G.enemies) {
    // What a radar sees counts as much as what a turret has in range: the net gets ready early.
    if (!turrets.some(c => Math.hypot(e.x - c.x - .5, e.y - c.y - .5) < reachOf(c.type)) && !eyes.some(c => Math.hypot(e.x - c.x - .5, e.y - c.y - .5) < RADAR.range)) continue;
    const gene = opposite(e.gene);
    count[gene] = (count[gene] || 0) + 1;
    const away = Math.min(...turrets.map(c => Math.hypot(e.x - c.x - .5, e.y - c.y - .5)), ...radars.map(c => Math.hypot(e.x - c.x - .5, e.y - c.y - .5)));
    nearest[gene] = Math.min(nearest[gene] ?? 1e9, away);
  }
  return {count, nearest};
}
// What a listener hears: its network as a whole, or the one source on it the player chose.
export let VIEW = new Map();
export const heardOf = c => VIEW.get(key(c.x, c.y)) || netOf(c);
// Once per tick: each network gets the antidotes its turrets need, the most needed first.
export function sense() {
  NET = new Map(); NET_HOPS = new Map(); VIEW = new Map();
  const near = new Map();
  for (const w of G.wires) {
    if (!carries(w)) continue;
    for (const [a, b] of [[w.a, w.b], [w.b, w.a]]) near.set(a, [...(near.get(a) || []), b]);
  }
  for (const start of near.keys()) {
    if (NET.has(start)) continue;
    const group = new Set([start]);
    for (const id of group) for (const next of near.get(id)) group.add(next);
    const turrets = [...group].map(id => G.cells[id]).filter(isGun);
    const radars = [...group].map(id => G.cells[id]).filter(c => c?.type === 'radar' && built(c));
    const {count, nearest} = sight(turrets, radars);
    // The desk on the net sets the priority: the most creatures (the default), the nearest, each in turn, or a gene by hand.
    const desk = [...group].map(id => G.cells[id]).find(c => c?.type === 'desk' && built(c)), mode = desk?.mode || 'most';
    const list = Object.keys(count).sort((a, b) => mode === 'near' ? (nearest[a] ?? 1e9) - (nearest[b] ?? 1e9) : count[b] - count[a]);
    // The core on the net adds what it still asks for, after the threats: a quiet net makes the core's recipe.
    const core = [...group].some(id => G.cells[id]?.type === 'core');
    if (core) for (const gene of coreWants()) if (!list.includes(gene)) list.push(gene);
    // One gene leads for all three positions, until none of its creatures is left, or they would mix into hybrids.
    const held = turrets.find(c => c.focus && (count[c.focus] || G.time - c.focusAt < NERVE.hold))?.focus;
    const threats = list.filter(gene => count[gene]);
    let focus = held || list[0] || '';
    if (mode === 'cycle' && threats.length > 1) focus = threats[Math.floor(G.time / DESK.turn) % threats.length];
    else if (mode === 'near' && threats.length) focus = threats[0];
    if (mode === 'hand' && desk.gene) { focus = desk.gene; if (!list.includes(focus)) list.unshift(focus); }
    for (const c of turrets) {
      c.focus = focus;
      if (count[focus]) c.focusAt = G.time;
    }
    if (focus && !count[focus]) list.push(focus);
    // Levels: every store on the net reads as full once over its threshold; the net is full when all are.
    const stores = [...group].map(id => G.cells[id]).filter(c => (c?.type === 'cyst' || c?.type === 'vault') && built(c));
    const full = stores.length > 0 && stores.every(c => c.stock.length >= capOf(c) * (c.level ?? .5));
    const net = {list, focus, count, mode, desk:Boolean(desk), turrets:turrets.length, radars:radars.length, core, stores:stores.length, full, low:stores.length > 0 && !full, threat:threats.length > 0};
    for (const id of group) NET.set(id, net);
    const threat = Boolean(count[focus]), starts = [...group].filter(id => { const c = G.cells[id]; return threat ? isGun(c) || c?.type === 'radar' : c?.type === 'core'; });
    const queue = starts.length ? starts : [start];
    for (const id of queue) NET_HOPS.set(id, 0);
    for (let i = 0; i < queue.length; i++) for (const next of near.get(queue[i]) || []) if (!NET_HOPS.has(next)) { NET_HOPS.set(next, NET_HOPS.get(queue[i]) + 1); queue.push(next); }
    // A listener with a source of its own hears only that one: a gun or radar what it sees, the core its recipe, a
    // console its gene by hand, a store its level. A source no longer on the net is forgotten until it is back.
    const viewOf = c => {
      const src = c.source && group.has(c.source) ? G.cells[c.source] : null;
      if (!src || !built(src)) return net;
      if (isGun(src) || src.type === 'radar') {
        const own = sight(isGun(src) ? [src] : [], src.type === 'radar' ? [src] : []).count;
        const heard = Object.keys(own).sort((a, b) => own[b] - own[a]);
        // The same gene until its creatures are gone, or the bases of two would mix.
        const lead = c.heard && own[c.heard] ? c.heard : heard[0] || '';
        return {...net, list:heard, focus:lead, count:own, threat:heard.length > 0, core:false, source:src, live:true};
      }
      if (src.type === 'core') { const wants = coreWants(); return {...net, list:wants, focus:wants[0] || '', count:{}, threat:false, core:true, source:src, live:true}; }
      if (src.type === 'desk' && src.mode === 'hand' && src.gene) return {...net, list:[src.gene], focus:src.gene, source:src, live:true};
      return {...net, source:src};
    };
    for (const id of group) if (hasTrait(G.cells[id]?.type, 'listen')) VIEW.set(id, viewOf(G.cells[id]));
    // A Ligase on the nerve drops the bases it was given for the last antidote, so it never makes a mix of two.
    for (const id of group) {
      const c = G.cells[id], heard = VIEW.get(id);
      if (c?.type === 'screen') { if ((c.shown ?? '') !== heard.focus) { c.shown = heard.focus; c.shownAt = G.time; } continue; }
      if (c?.type === 'gate' || c?.type === 'sort') {
        // The store it listens to, when one was chosen; otherwise the nearest on its net.
        const own = heard.source && (heard.source.type === 'cyst' || heard.source.type === 'vault') ? heard.source : null;
        const near = own || (WATCHES.includes(c.when) ? stores.reduce((best, o) => !best || span(c, o) < span(c, best) ? o : best, null) : null);
        if (near) c.watch = key(near.x, near.y); else delete c.watch;
        if (c.passed && !gateCondition(c)) c.passed = 0;
        continue;
      }
      if (c?.type === 'pack' && heard.core) {
        const boxed = (G.goals || []).find(g => g.fed < g.count && boxOf(g.item))?.item, box = boxed && boxOf(boxed);
        if (box && box !== c.box && Object.hasOwn(BOX, box) && (box !== 'H' || unlocked(4))) setRecipe(c, box);
        continue;
      }
      if (c?.type !== 'ligase' && c?.type !== 'join') continue;
      if (c.heard != null && c.heard !== heard.focus) { c.ports = [[], [], []]; c.portDue = [[], [], []]; c.item = null; }
      c.heard = heard.focus;
    }
  }
}
// The arm: one item a beat, half the beat to swing over, half to swing back; MK3 lifts two.
export const ARM = {beat:[1.2, .6, .4]};
export const armBeat = c => ARM.beat[rankOf(c) - 1];
export const armHolds = c => rankOf(c) >= 3 ? 2 : 1;
export function armReach(c) {
  if (!G) return 0;
  const half = armBeat(c) / 2;
  return c.hold?.length ? Math.min(1, (G.time - (c.swingAt ?? -9)) / half) : Math.max(0, 1 - (G.time - (c.doneAt ?? -9)) / half);
}
// What lies ready in a cell, in the order it would leave: the item on a rail, a machine's output, a stock.
export function liftable(src) {
  if (!src || !built(src)) return [];
  if (isBelt(src) || isSplit(src) || src.type === 'sort' || hasTrait(src.type, 'single')) return src.item ? [src.item] : [];
  if (hasTrait(src.type, 'stock')) return src.stock.slice(0, settled(src.stock, src.due));
  return [];
}
export function lift(arm, src) {
  const out = [], fits = item => !arm.pick || item === arm.pick || contentOf(item) === arm.pick;
  if (!src || !built(src)) return out;
  if (hasTrait(src.type, 'stock')) {
    let ready = liftable(src).length;
    for (let i = 0; i < ready && out.length < armHolds(arm);) {
      if (fits(src.stock[i])) { out.push(src.stock.splice(i, 1)[0]); ready--; } else i++;
    }
  } else if (liftable(src).length && fits(src.item)) { out.push(src.item); src.item = null; }
  return out;
}
export function netOf(c) { return NET.get(key(c.x, c.y)); }
// The genes the core still asks for this stage, in recipe order.
export function coreWants(): any[] {
  const open = G.goals ? G.goals.filter(g => g.fed < g.count).map(g => g.item) : [STAGES[G.stage]?.item].filter(Boolean);
  return [...new Set(open.map(contentOf))];
}
// Unwired, cut or without a turret, the setting the player left applies.
export function listens(c) {
  if ((c.type === 'gate' || c.type === 'sort') && c.when && c.when !== 'gene') return Boolean(netOf(c));
  const heard = heardOf(c);
  return (c.type === 'gate' || c.type === 'sort') && Boolean(heard) && (heard.live || heard.turrets > 0 || heard.radars > 0 || heard.core || heard.desk);
}
// What a wired gate may open on, or a wired sorter send its filter aside on, besides the gene: the net's threat, the level of its stores, or the two together.
export const WHEN = {
  gene:{name:L('le gène demandé')},
  threat:{name:L('une menace'), test:n => n.threat},
  calm:{name:L('pas de menace'), test:n => !n.threat},
  low:{name:L('stock bas'), test:n => n.low},
  full:{name:L('stock plein'), test:n => n.full},
  threatLow:{name:L('menace ET stock bas'), test:n => n.threat && n.low},
  threatOrLow:{name:L('menace OU stock bas'), test:n => n.threat || n.low}
};
export const DESK = {modes:['most', 'near', 'cycle', 'hand'], turn:20};
// A gate on a condition watches its own store, the nearest one wired to its net, so one net can run several lines.
export function gateStore(c) {
  const store = c.watch && G.cells[c.watch];
  if (!store || !built(store) || !(store.type === 'cyst' || store.type === 'vault')) return null;
  const at = store.stock.length, full = Math.ceil(capOf(store) * (store.level ?? .5));
  return {store, at, cap:capOf(store), full, low:at < full};
}
// The condition alone, then the batch: once open, a gate lets so many through and waits for the condition to drop.
export function gateCondition(c) {
  const net = heardOf(c), kept = gateStore(c);
  return Boolean(net && WHEN[c.when]?.test?.({threat:net.threat, low:Boolean(kept?.low), full:Boolean(kept && !kept.low)}));
}
export const gateOpen = c => gateCondition(c) && !(c.batch && (c.passed || 0) >= c.batch);
export const WATCHES = ['low', 'full', 'threatLow', 'threatOrLow'];
// A capsule is the core's, never ammunition: it passes only where the core is heard and asks for it.
export function asked(c, item) {
  const net = heardOf(c), place = c.read || 0;
  if (place) return item.length === 1 && Boolean(net.focus) && net.focus[place - 1] === item;
  return boxOf(item) === 'T' ? Boolean(net.core) && (G.goals || []).some(g => g.item === item && g.fed < g.count) : net.list.includes(contentOf(item));
}
export function connects(c, travel) {
  if (!c) return false;
  const back = (travel + 2) % 4;
  if (hasTrait(c.type, 'notFront')) return back !== c.dir;
  if (isSplit(c) || c.type === 'sort') return travel === c.dir;
  if (c.type === 'bridge') { const way = c.ways?.[travel % 2]; return way == null || way === travel; }
  if (c.type === 'pocket') return !c.unload;
  if (c.type === 'join') return joinPort(c, travel) >= 0;
  if (c.type === 'pack') return packPort(c, travel) >= 0;
  // The unpacker takes its box from behind only.
  if (hasTrait(c.type, 'backOnly')) return travel === c.dir;
  return isGun(c) || hasTrait(c.type, 'anySide');
}
export function accepts(c, item, travel) {
  if (!built(c) || !connects(c, travel)) return false;
  switch (c.type) {
    case 'belt': case 'split2': case 'split': case 'sort': return !c.item;
    case 'gate': return !c.item && (listens(c) ? (c.when && c.when !== 'gene' ? gateOpen(c) : asked(c, item)) : c.open);
    case 'ligase': return item in BASE && c.ports[portOf(c, travel)].length < 2;
    case 'pack': return packTakes(c, item, packPort(c, travel));
    case 'unpack': return Boolean(boxOf(item)) && c.ports[0].length < 2;
    case 'flip': case 'unbind': return item.length === 3 && !boxOf(item) && c.ports[0].length < 2;
    case 'unjoin': return item.length === 6 && !boxOf(item) && c.ports[0].length < 2;
    case 'join': { const port = strandPort(c, item) ?? joinPort(c, travel); return item.length === 3 && port >= 0 && c.ports[port].length < 2; }
    case 'cyst': case 'vault': return c.stock.length < capOf(c);
    case 'pocket': return c.stock.length < pocketCap(c) && (!c.stock.length || c.stock[0] === item);
    case 'pump': { if (c.stock.length >= VEIN.cap) return false; const kind = veinKind(c); return !kind || kind === item; }
    case 'glue': return item.length === 3 && !boxOf(item) && c.stock.length < GLUE.hold;
    case 'harpoon': return boxOf(item) === 'A' && (c.ammo[contentOf(item)] || 0) + PACK.size <= PACK.magazines;
    case 'turret': case 'sting': case 'maw': case 'mist':
      if (boxOf(item) === 'A') return (c.ammo[contentOf(item)] || 0) + PACK.size <= PACK.magazines;
      return item.length === 3 && (c.ammo[item] || 0) < 12;
    case 'core': return item.length === 3 || item.length === 6 || Boolean(boxOf(item));
    case 'bridge': return !c.lanes[travel % 2];
    case 'burn': return !(c.busy > G.time);
  }
  return false;
}
// Nothing crosses a building at once: what just came in is the tail of its list, and waits.
export const CROSS = .25;
export function stamp(due, list, from, time) {
  while (due.length && (due[0].at <= G.time + 1e-6 || due.length >= list.length)) due.shift();
  due.push({at:G.time + time, from});
}
export function settled(list, due) {
  let waiting = 0;
  if (due) for (let i = due.length - 1; i >= 0 && due[i].at > G.time + 1e-6; i--) waiting++;
  return Math.max(0, list.length - waiting);
}
export function intoStock(c, item, from) {
  c.stock.push(item);
  stamp(c.due ||= [], c.stock, from, CROSS * sizeOf(c));
}
export function intoPort(c, port, item, from) {
  c.ports[port].push(item);
  stamp((c.portDue ||= [[], [], []])[port], c.ports[port], from, CROSS);
}
export const readyPort = (c, port) => settled(c.ports[port], c.portDue?.[port]);
export function receive(c, item, travel, carry = 0) {
  c.from = travel;
  if (c.type === 'sort') c.seen = contentOf(item);
  if (c.type === 'gate' && c.batch) c.passed = (c.passed || 0) + 1;
  if (isBelt(c) || isSplit(c) || c.type === 'sort') { c.item = item; c.t = carry; }
  else if (c.type === 'ligase') intoPort(c, portOf(c, travel), item, travel);
  else if (hasTrait(c.type, 'intake')) intoStock(c, item, travel);
  else if (c.type === 'join') intoPort(c, strandPort(c, item) ?? joinPort(c, travel), item, travel);
  else if (c.type === 'pack') intoPort(c, packPort(c, travel), item, travel);
  else if (hasTrait(c.type, 'backOnly')) intoPort(c, 0, item, travel);
  else if (isGun(c)) { c.gulp = {item, from:travel, t:G.time}; const gene = contentOf(item); c.ammo[gene] = (c.ammo[gene] || 0) + (boxOf(item) ? PACK.size : 1); }
  else if (c.type === 'bridge') c.lanes[travel % 2] = {item, dir:travel, t:carry};
  else if (c.type === 'burn') { c.gulp = {item, from:travel, t:G.time}; c.busy = Math.max(c.busy || 0, G.time - STEP) + 1 / (BELT_SPEED * rankOf(c)); c.burnt = (c.burnt || 0) + 1; }
  else { c.gulp = {item, from:travel, t:G.time}; c.hp = Math.min(100, c.hp + .2); eat(item); }
}

// Keeps what overshoots the end of a cell, unless the item has been waiting there.
export function advance(t, by) { return t >= .999 ? 1 : t + by; }
export function flow(dt) {
  const cells = allCells().filter(built);
  paces.clear();
  pulse(dt);
  crawl(dt);
  for (const c of cells) {
    if (isBelt(c) || isSplit(c) || c.type === 'sort') c.t = c.item ? advance(c.t, dt * paceOf(c)) : 0;
    if (c.type === 'bridge') c.lanes.forEach((lane, axis) => { if (lane) lane.t = advance(lane.t, dt * paceOf(c, axis)); });
    if (c.type === 'cyst') c.t = advance(c.t, dt * mouthPace(c, c.dir));
    // Two mouths, each at the pace of a belt.
    if (c.type === 'vault') {
      const [one, two] = edgesOf(c).filter(door => door.dir === c.dir).map(door => mouthPace(door, c.dir));
      c.t = advance(c.t, dt * one); c.t2 = advance(c.t2 || 0, dt * two);
    }
    if (c.type === 'borer') {
      c.made = c.made.filter(t => t > G.time - 10);
      c.clock += dt * perSecond(c);
      const kind = matterUnder(c), room = minable(kind) ? BORER.hold - c.stock.length : 0;
      for (let n = Math.min(Math.floor(c.clock + 1e-6), room); n > 0; n--) { c.stock.push(kind); c.made.push(G.time); c.clock--; }
      c.clock = Math.min(c.clock, 1);
    }
    if (c.type === 'reaper') { reap(c); continue; }
    if (!hasTrait(c.type, 'make')) continue;
    c.made = c.made.filter(t => t > G.time - 10);
    if (c.item) {
      // Faster than a first belt, it goes on working through the beat it waits for the rail.
      if (c.type === 'mine' && perSecond(c) > BELT_SPEED) c.clock = Math.min(1.9, c.clock + dt * perSecond(c));
      continue;
    }
    c.clock = Math.min(1.999, c.clock + dt * perSecond(c));
    if (c.clock < .999) continue;
    if (c.type === 'mine') { if (!minable(matterUnder(c))) { c.clock = 0; continue; } c.item = matterUnder(c); }
    else if (c.type === 'flip') {
      if (!readyPort(c, 0)) continue;
      c.item = c.last = [...c.ports[0].shift()].reverse().join('');
    } else if (c.type === 'unbind' || c.type === 'unjoin') {
      // Its outputs leave on their own sides: it takes the next one in only once every side is clear.
      c.outs ||= [null, null, null];
      if (c.outs.some(Boolean) || !readyPort(c, 0)) continue;
      const whole = c.last = c.ports[0].shift();
      c.outs = c.type === 'unbind' ? [...whole] : [whole.slice(0, 3), null, whole.slice(3)];
    } else if (c.type === 'unpack') {
      // A box opened empties into the queue, its carbon and isotope set aside; the queue goes out one at a time.
      const [boxes, queue, side] = c.ports;
      if (!queue.length && readyPort(c, 0)) {
        const box = boxes.shift(), kind = BOX[boxOf(box)];
        queue.push(...Array(fill(boxOf(box))).fill(contentOf(box)));
        side.push(...Array(kind?.carbon || 0).fill('K'), ...Array(kind?.isotope || 0).fill('I'));
        side.splice(0, Math.max(0, side.length - 8));
        c.last = box;
      }
      if (!queue.length) continue;
      c.item = queue.shift();
    } else if (c.type === 'join') {
      if (!readyPort(c, 0) || !readyPort(c, 1)) continue;
      c.item = c.last = c.ports[0].shift() + c.ports[1].shift();
    } else if (c.type === 'pack') {
      const [goods, carbon] = c.ports, box = BOX[c.box], need = box.carbon + (box.isotope || 0), size = fill(c.box);
      if (readyPort(c, 0) < size || readyPort(c, 1) < need || carbon.slice(0, need).filter(k => k === 'I').length < (box.isotope || 0)) continue;
      c.item = c.last = `${c.box}:${goods[0]}`;
      goods.splice(0, size); carbon.splice(0, need);
    } else {
      if (!c.ports.every((p, port) => readyPort(c, port))) continue;
      c.item = c.last = c.ports.map(p => p.shift()).join('');
      G.made++;
    }
    c.clock = c.clock >= 1.998 ? 0 : Math.max(0, c.clock - 1); c.made.push(G.time);
    if (c.type === 'ligase') hooks.playNear('gene', c, 1);
  }
  // Repeat so a full line advances together and a stop travels upstream.
  for (let pass = 0; pass < 12; pass++) {
    const offers = new Map();
    // door: the cell of a big building it leaves by.
    const offer = (from, item, dir, take, carry = 0, door = from) => {
      const to = ahead(door, dir);
      if (!to || !accepts(to, item, dir)) return false;
      const current = offers.get(to);
      // A junction prefers the side it did not serve last.
      if (!current || (current.dir === to.from && dir !== to.from)) offers.set(to, {from, to, item, dir, take, carry});
      return true;
    };
    for (const c of cells) {
      if (c.type === 'arm' && built(c)) {
        if (c.hold?.some(item => !item)) c.hold = c.hold.filter(Boolean);
        if (!c.hold?.length && pass === 0 && G.time - (c.doneAt ?? -9) >= armBeat(c) / 2) {
          const got = lift(c, ahead(c, (c.dir + 2) % 4));
          if (got.length) { c.hold = got; c.swingAt = G.time; c.last = got[0]; }
        }
        if (c.hold?.length && armReach(c) >= 1) offer(c, c.hold[0], c.dir, () => { c.hold.shift(); if (!c.hold.length) c.doneAt = G.time; });
      }
      if (hasTrait(c.type, 'single') && c.item) offer(c, c.item, c.dir, () => { c.item = null; });
      // Left, ahead, right.
      if (c.outs) c.outs.forEach((item, i) => { if (item) offer(c, item, outSide(c, i), () => { c.outs[i] = null; }); });
      if (c.type === 'unpack' && c.ports[2].length) offer(c, c.ports[2][0], (c.dir + 1) % 4, () => { c.ports[2].shift(); });
      // A listening gate lets out what it let in, so a change of mind never traps an item.
      if (isBelt(c) && (c.type === 'belt' || c.open || listens(c)) && c.item && c.t >= .999) offer(c, c.item, c.dir, () => { if (c.type === 'gate' && listens(c)) credit('nerve'); c.item = null; }, c.t - 1);
      if (c.type === 'sort' && c.item && c.t >= .999) { const out = exitOf(c); offer(c, c.item, out, () => { if (out !== c.dir) { credit(listens(c) ? 'nerve' : 'sort'); if (c.batch && listens(c)) c.passed = (c.passed || 0) + 1; } c.item = null; }, c.t - 1); }
      if (c.type === 'borer' && c.stock.length) {
        const doors = edgesOf(c);
        let out = 0;
        for (let i = 0; i < doors.length && out < c.stock.length; i++) {
          const at = (c.turn + i) % doors.length, door = doors[at], to = ahead(door, door.dir);
          // A line drawn from the harvester takes from it: a belt heading away, or one starting there. A line only
          // passing along its side, fed from behind, does not.
          const behind = to && isBelt(to) && to.dir !== door.dir ? ahead(to, (to.dir + 2) % 4) : null;
          if (behind && behind !== c) continue;
          if (offer(c, c.stock[0], door.dir, () => { c.stock.shift(); c.turn = (at + 1) % doors.length; }, 0, door)) out++;
        }
      }
      if (c.type === 'vault' && c.stock.length) {
        const ready = settled(c.stock, c.due);
        let out = 0;
        edgesOf(c).filter(door => door.dir === c.dir).forEach((door, i) => {
          const clock = i ? 't2' : 't', item = c.stock[out];
          if (out >= ready || !item || (c[clock] || 0) < .999) return;
          // The stock can hold a mix: each mouth takes its own item out.
          const take = carry => { c.stock.splice(c.stock.indexOf(item), 1); c[clock] = carry; };
          if (offer(c, item, c.dir, take, c[clock] - 1, door)) out++;
        });
      }
      const given = c.type !== 'borer' && drains(c) ? settled(c.stock, c.due) : 0;
      if (given) {
        // One matter, so each side may take one in the same pass. Two pumps side by side need a vein.
        // Every outer face counts: a 2 x 2 silo empties on all its free sides, not only round its first cell.
        let out = 0;
        const doors = edgesOf(c);
        for (let i = 0; i < doors.length && out < given; i++) {
          const at = (c.turn + i) % doors.length, door = doors[at];
          if (!(c.type === 'pump' && ahead(door, door.dir)?.type === 'pump') && offer(c, c.stock[0], door.dir, () => { c.stock.shift(); c.turn = (at + 1) % doors.length; }, 0, door)) out++;
        }
      }
      if (c.type === 'cyst' && c.t >= .999 && settled(c.stock, c.due)) offer(c, c.stock[0], c.dir, carry => { c.stock.shift(); c.t = carry; }, c.t - 1);
      if (c.type === 'bridge') c.lanes.forEach((lane, i) => {
        if (lane && lane.t >= .999) offer(c, lane.item, lane.dir, () => { c.lanes[i] = null; }, lane.t - 1);
      });
      if (isSplit(c) && c.item && c.t >= .999) {
        const exits = splitExits(c), n = exits.length;
        for (let i = 0; i < n; i++) {
          const choice = (c.turn + i) % n;
          if (offer(c, c.item, exits[choice], () => { c.item = null; c.turn = (choice + 1) % n; }, c.t - 1)) break;
        }
      }
    }
    if (!offers.size) break;
    for (const o of offers.values()) {
      const opened = o.to.gapAt === G.time;
      let carry = Math.max(0, o.carry, opened ? o.to.gap : 0);
      if (o.carry > 0 && (o.to.type === 'belt' || follows(o.to))) {
        const slow = paceOf(o.to, o.dir), fast = o.from.type === 'cyst' || o.from.type === 'vault' ? slow : paceOf(o.from, o.dir);
        // Onto a slower rail a head start is the same time, so less of a cell, and never more than the room left.
        if (fast > slow) carry = opened ? o.to.gap : o.carry * slow / fast;
      }
      // A storage restarts its mouth in step with the rail it gave to, or a fast one loses a beat each time.
      o.take(carry);
      // What a cell overshot by goes to whoever fills the gap it leaves, so a full line keeps its speed.
      o.from.gap = Math.max(0, o.carry); o.from.gapAt = G.time;
      receive(o.to, o.item, o.dir, carry);
    }
  }
}

// Stage 4 lets the families grow to eight. MAX_FAMILIES is what a saved game may hold.
export const MUTATION = {every:300, spread:2};
export const familyCap = () => G.stage >= 3 ? 8 : 6;
// A hexagon's ring on the planet (item_027): each step away from the first purified hexagon brings one more enemy
// family from the start, swarms a quarter bigger and deposits a tenth poorer, up to the third ring.
export const RING = {most:3, families:1, swarm:.25, deposit:.1};
export const ringOf = () => Math.min(RING.most, Math.max(0, Number(G?.ring) || 0));
export function applyRing(ring) {
  G.ring = Math.max(0, Math.floor(Number(ring) || 0));
  for (let i = 0; i < ringOf() * RING.families && G.families.length < familyCap(); i++) {
    let born = '', tries = 0;
    // A new family, never one of this game's base genes: those the core eats, not an enemy.
    do born = mutate(G.families[Math.floor(Math.random() * G.families.length)]);
    while ((G.families.includes(born) || born[0] === born[2] || G.base?.includes(born)) && ++tries < 60);
    if (tries < 60) G.families.push(born);
  }
}
// A family one base away from an old one, never a palindrome: swapping entries 1 and 3 must always matter.
// want: the family to bring, for a stage that asks its antidote; it joins the families if new.
export function breed(b, want = null) {
  if (want) { if (!G.families.includes(want)) G.families.push(want); if (b) b.genes.push(want); return want; }
  if (G.families.length >= familyCap()) return '';
  let born;
  do { born = mutate(G.families[Math.floor(Math.random() * G.families.length)]); } while (G.families.includes(born) || born[0] === born[2]);
  G.families.push(born);
  if (b) b.genes.push(born);
  return born;
}
// Which breach a mutation lands on. The nearest belt of live breaches takes them first; once its breaches hold
// MUTATION.spread each on average, the next belt opens too, so mutations spread outward over time. Among the open
// ones the draw is at random, a breach mutated n times weighing 1 / (1 + n)², so they share rather than pile up.
export function mutationTarget() {
  const alive = G.breaches.filter(o => o.state !== 'spent');
  if (!alive.length) return null;
  const belts = [...new Set<number>(alive.map(o => o.tier || 0))].sort((a, c) => a - c);
  let open = 0;
  const within = () => alive.filter(o => (o.tier || 0) <= belts[open]);
  while (open < belts.length - 1 && within().reduce((n, o) => n + (o.mutations || 0), 0) / within().length >= MUTATION.spread) open++;
  const pool = within(), weights = pool.map(o => 1 / (1 + (o.mutations || 0)) ** 2);
  let roll = Math.random() * weights.reduce((a, w) => a + w, 0);
  return pool.find((o, i) => (roll -= weights[i]) <= 0) || pool[pool.length - 1];
}
// Stage 4 on: a mutation now and then, on a breach still alive.
export function mutation(want = null) {
  hooks.playSound('mutation');
  const b = mutationTarget();
  const born = breed(b, want);
  if (born && b) b.mutations = (b.mutations || 0) + 1;
  if (born) hooks.tell(L`Mutation${b ? L` au ${bearing(b)}` : ''} : une nouvelle famille, son antidote est ${opposite(born)}.`, {at:b, gene:born, bad:true});
  return born;
}
export function mutate(gene) {
  const at = Math.floor(Math.random() * 3), choices = Object.keys(BASE).filter(b => b !== gene[at]);
  return gene.slice(0, at) + choices[Math.floor(Math.random() * choices.length)] + gene.slice(at + 1);
}
export function bearing(b) {
  const a = Math.atan2(b.y - CORE.y, b.x - CORE.x);
  return L(['est','sud-est','sud','sud-ouest','ouest','nord-ouest','nord','nord-est'][(Math.round(a / (Math.PI / 4)) + 8) % 8]);
}
// The same as a compass abbreviation, for the short swarm warnings: SO in French, SW in English.
export function compass(b) {
  const a = Math.atan2(b.y - CORE.y, b.x - CORE.x);
  return L(['E','SE','S','SO','O','NO','N','NE'][(Math.round(a / (Math.PI / 4)) + 8) % 8]);
}
export function nearestBuilding(at) {
  let best = null, close = Infinity;
  for (const c of allCells()) {
    const d = Math.hypot(c.x - at.x, c.y - at.y);
    if (d < close) { best = c; close = d; }
  }
  return best;
}
// cause: what was built in its circle. A breach of the open world goes for that, not for the core.
export function wake(found, cause) {
  let b = found;
  if (b.id) {
    const known = G.breaches.find(o => o.id === b.id);
    if (known) b = known;
    else { b = {...b, genes:[...b.genes]}; G.breaches.push(b); }
  }
  if (b.state !== 'sleep') return;
  if (b.id) { const at = cause || nearestBuilding(b); b.post = {x:at.x, y:at.y}; }
  Object.assign(b, {state:'wake', next:G.time + 30, wander:G.time + 10, spit:G.time});
  G.woken++;
  // A mutation adds a family: every line already built keeps an enemy to kill.
  if (G.woken % 2 === 0) { const born = breed(b); if (born) b.born = born; }
  hooks.forgetEvent(hungry());
  hooks.tell(L`Brèche réveillée au ${bearing(b)} : ${b.left} créatures dedans. Premier assaut dans 30 s${b.born ? L(', avec une nouvelle famille') : ''}.${b.id ? L(' Elle vise l’avant-poste qui l’a réveillée.') : ''}`, {at:b, gene:b.born, bad:true});
}
// A harvester standing within a nest's reach, the nest not destroyed: an outpost on a guarded deposit.
export function outpostHeld() {
  const near = new Set<any>(G.breaches);
  for (const c of allCells()) {
    if ((c.type !== 'mine' && c.type !== 'borer') || !built(c)) continue;
    const sx = Math.floor(c.x / SECTOR), sy = Math.floor(c.y / SECTOR);
    for (let i = -1; i < 2; i++) for (let j = -1; j < 2; j++) { const b = sector(sx + i, sy + j)?.breach; if (b) near.add(G.breaches.find(o => o.id && o.id === b.id) || b); }
    for (const b of near) if (b.state !== 'spent' && Math.hypot(c.x - b.x, c.y - b.y) <= b.r) return true;
  }
  return false;
}
export function disturb() {
  const cells = allCells().filter(c => c.type !== 'core');
  const veins = cells.filter(c => c.type === 'pump' && G.cells[c.to]).map(c => [c, G.cells[c.to]]);
  const tracks = Object.values(G.tracks), seen = new Map(G.breaches.map(b => [b.id || b, b])), around = new Set();
  // The world is only looked at round what is built, so it costs what the factory measures.
  const visit = new Map();
  for (const list of [cells, tracks]) for (const c of list) {
    const sx = Math.floor(c.x / SECTOR), sy = Math.floor(c.y / SECTOR);
    visit.set(sx + ',' + sy, [sx, sy]);
  }
  for (const [sx, sy] of visit.values()) for (let i = -1; i < 2; i++) for (let j = -1; j < 2; j++) {
    const b = sector(sx + i, sy + j)?.breach;
    if (b && !seen.has(b.id)) around.add(b);
  }
  for (const b of [...G.breaches, ...around]) {
    if (b.state !== 'sleep') continue;
    const x = b.x + .5, y = b.y + .5, near = c => footprint(c).some(p => Math.hypot(p.x - b.x, p.y - b.y) <= b.r);
    const cause = cells.find(near) || tracks.find(near)
      || veins.find(([a, to]) => { const at = nearest(a, to, x, y); return Math.hypot(at.x - x, at.y - y) <= b.r; })?.[0];
    if (cause) wake(b, cause);
  }
}
// How much a nest still shows its last hit, from 1 at the hit to 0 a third of a second later.
export const CORPSE = {stays:90, sinks:5, most:100};
// How far a body has sunk, 0 lying fresh to 1 gone; the gone ones leave the list.
export const corpseSunk = d => Math.max(0, (G.time - d.at - CORPSE.stays) / CORPSE.sinks);
// A nest's health: 3000 at level 1, up to three times that far out: two fed turrets take about 45 s. It heals when left alone.
export const NEST = {hp:3000, quiet:8, heal:.02, refill:60, throw:.7};
export function nestHp(b) {
  if (b.max == null) { b.max = Math.round(NEST.hp * (b.tough || 1)); b.hp = b.max; }
  return b;
}
// How fast creatures walk, in cells a second: on open ground, and across belts and bridges.
export const CREATURE = {pace:.65, through:.36};
// Two kinds any awake nest can send: a swarm of eight, quick and frail, from stage 2; a titan, slow, ten times as
// tough and three times as hard on buildings, one at a time, from stage 4.
export const KINDS = {swarm:{count:8, hp:1 / 8, pace:2, bite:1, from:1, chance:.2}, drift:{count:1, hp:1, pace:.5, bite:.5, from:99, chance:0}, titan:{count:1, hp:10, pace:.4, bite:3, from:3, chance:.25}};
export const kindOf = e => KINDS[e.kind] || {hp:1, pace:1, bite:1};
// Thrown out of the nest, a creature lands 2 to 5 cells away and only then walks.
export function spawn(b, gene, kind = null) {
  hooks.playNear('throw', b, .3);
  const hp = Math.round((24 + Math.floor(G.threat) * 4) * (b.tough || 1));
  b.left--;
  const a = Math.random() * Math.PI * 2, far = 2 + Math.random() * 3, x = b.x + .5, y = b.y + .5;
  if (kind) {
    // A swarm lands as a cloud round one spot; a titan as one body.
    const k = KINDS[kind], tx = x + Math.cos(a) * far, ty = y + Math.sin(a) * far, each = Math.max(2, Math.round(hp * k.hp));
    for (let i = 0; i < k.count; i++) {
      const s = k.count > 1 ? i * 2.4 : 0, r = k.count > 1 ? .2 + (i % 3) * .18 : 0;
      G.enemies.push({x, y, gene, hp:each, max:each, kind, tier:b.tier || 0, home:G.breaches.indexOf(b), fly:{x, y, tx:tx + Math.cos(s) * r, ty:ty + Math.sin(s) * r, t:0}});
    }
    if (kind === 'titan') hooks.tell(L`Titan en approche au ${bearing(b)} : lent, mais il encaisse et il écrase. Le Dard le travaille de loin.`, {at:b, bad:true});
    return;
  }
  // Its nest's level goes with it: farther nests send bigger bodies.
  G.enemies.push({x, y, gene, hp, max:hp, tier:b.tier || 0, home:G.breaches.indexOf(b), fly:{x, y, tx:x + Math.cos(a) * far, ty:y + Math.sin(a) * far, t:0}});
}
export function destroyNest(b) {
  hooks.playSound('nest_down');
  b.state = 'spent'; b.ended = G.time; b.hp = 0;
  earn('breaches', b.total);
  hooks.tell(L`Nid détruit au ${bearing(b)} : +${b.total} ADN, il s’estompe et le terrain est à toi.`, {at:b});
}
export function waveGene(b) { return b.genes[(b.genes.length - 1 + Math.max(0, b.wave)) % b.genes.length]; }
// Swarms (item_016, operator decisions 2026-11-24 and 2026-11-25): from stage 2 of a drawn game, swarms come to the base
// at announced times, growing with the minutes since the first and with the base's machines; the first ones are few,
// slow and frail, so a learning player loses little. Once a swarm is cleared (or after `clear` s), a quiet minute, then
// the next is announced `lead` s ahead: four minutes at least between two. The nests stay apart: the heavy guards.
export const SWARM = {from:1, lead:180, quiet:60, clear:180, first:3, minutes:8, machines:8, most:40, hp:6, far:30};
export const baseSize = () => allCells().filter(c => c.type !== 'core' && !isBelt(c) && !isSplit(c) && c.type !== 'bridge' && c.type !== 'sort' && c.type !== 'wall' && c.type !== 'relay').length;
// How many come: three, one more every 8 minutes since the first, one more every 8 machines past 10.
export function swarmSize(since, size) {
  return Math.min(SWARM.most, SWARM.first + Math.floor(since / 60 / SWARM.minutes) + Math.floor(Math.max(0, size - 10) / SWARM.machines));
}
// The next swarm: where it comes from, its family, how many, said with the antidote and the time left.
export function planSwarm(at) {
  const w = G.swarm, angle = Math.random() * Math.PI * 2, core = centreOf(coreCell() || {x:CORE.x, y:CORE.y, type:'core'});
  w.next = at; w.from = {x:Math.round(core.x + Math.cos(angle) * SWARM.far), y:Math.round(core.y + Math.sin(angle) * SWARM.far)};
  w.gene = G.families[Math.floor(Math.random() * G.families.length)];
  w.size = Math.min(SWARM.most, Math.round(swarmSize(w.wave ? G.time - w.start : 0, baseSize()) * (1 + RING.swarm * ringOf())));
  hooks.playSound('assault_alarm', 2);
  hooks.tell(L`Essaim du ${compass(w.from)} dans ${Math.round(at - G.time)} s : ${w.size} créatures, antidote ${opposite(w.gene)}.`, {at:w.from, gene:w.gene, bad:true});
}
export function swarms() {
  if (!G.base || G.over || G.stage < SWARM.from) return;
  if (!G.swarm) {
    G.swarm = {wave:0, start:G.time + SWARM.lead};
    // Just before the first one: the guide to a first defence, counted from what stands now.
    const count = type => allCells().filter(c => c.type === type).length;
    G.guide = {kind:'defense', step:0, base:{turret:count('turret'), wall:count('wall'), wire:G.wires.length}, hidden:false};
    planSwarm(G.time + SWARM.lead);
    return;
  }
  const w = G.swarm;
  if (w.next == null) {
    // Landed: the next waits for this one to be cleared, then a quiet minute before it is announced.
    if (G.time - (w.landed ?? -Infinity) < SWARM.clear && G.enemies.some(e => e.home === -1)) return;
    w.calm ??= G.time;
    if (G.time - w.calm >= SWARM.quiet) { delete w.calm; planSwarm(G.time + SWARM.lead); }
    return;
  }
  if (G.time < w.next) return;
  // The first wave walks slowly; every one lands spread round where it was announced.
  const hp = SWARM.hp + w.wave * 2, kind = w.wave === 0 ? 'drift' : null;
  for (let i = 0; i < w.size; i++) {
    const a = i * 2.4, r = .5 + (i % 4) * .6, x = w.from.x + Math.cos(a) * r, y = w.from.y + Math.sin(a) * r;
    G.enemies.push({x, y, gene:w.gene, hp, max:hp, kind, tier:0, home:-1});
  }
  w.wave++;
  w.next = null; w.landed = G.time;
}
export function menace(dt) {
  const awake = G.breaches.filter(b => b.state === 'wake');
  const spent = G.breaches.filter(b => b.state === 'spent').length;
  G.threat = Math.min(10, awake.length + spent * .5 + G.made / 1000);
  if (G.stage >= 3 && !G.over && G.time >= (G.mutateAt ?? Infinity)) { G.mutateAt = G.time + MUTATION.every; mutation(); }
  swarms();
  if (Math.floor(G.time * 2) !== Math.floor((G.time - dt) * 2)) { disturb(); if (G.needs?.length && outpostHeld()) credit('outpost', .5); }
  for (const b of awake) {
    if (b.pending && b.left && G.time >= b.spit) { spawn(b, b.gene, b.swarm ? 'swarm' : null); b.swarm = false; b.pending--; b.spit = G.time + 1.4; }
    nestHp(b);
    if (b.hp < b.max && G.time - (b.hitAt ?? -99) >= NEST.quiet) b.hp = Math.min(b.max, b.hp + b.max * NEST.heal * dt);
    if (!b.left) {
      b.pending = 0;
      if (G.enemies.some(e => e.home === G.breaches.indexOf(b))) continue;
      // Standing, the nest grows its wave again: it has to be destroyed.
      b.refillAt ??= G.time + NEST.refill;
      if (G.time >= b.refillAt) {
        b.left = b.total; b.refillAt = null; b.next = G.time + 30;
        hooks.tell(L`Le nid au ${bearing(b)} s’est régénéré : ${b.total} créatures. Détruis-le pour qu’il cesse.`, {at:b, bad:true});
      }
      continue;
    }
    if (G.time >= b.wander) { spawn(b, b.genes[0]); b.wander = G.time + Math.max(3, 11 - G.threat * .7); }
    if (G.time >= b.next) {
      b.gene = waveGene(b); b.pending += Math.min(b.left, Math.ceil(b.total / 4));
      b.wave++; b.next = G.time + 50;
      // Now and then a wave brings a swarm, or a titan when none walks yet.
      if (G.stage >= KINDS.swarm.from && Math.random() < KINDS.swarm.chance) b.swarm = true;
      if (G.stage >= KINDS.titan.from && b.left && !G.enemies.some(e => e.kind === 'titan') && Math.random() < KINDS.titan.chance) spawn(b, b.gene, 'titan');
      hooks.playSound('assault_alarm', 2);
    }
  }

  // Creatures of the open world go for the outpost that woke their breach. Once it is razed, the nearest
  // thing still standing is the next outpost.
  const outposts = new Map();
  for (const e of G.enemies) {
    const b = G.breaches[e.home];
    if (!b?.post || outposts.has(b)) continue;
    const standing = () => allCells().filter(c => Math.hypot(c.x - b.post.x, c.y - b.post.y) <= OUTPOST);
    let list = standing();
    if (!list.length) { const next = nearestBuilding(b.post); b.post = {x:next.x, y:next.y}; list = standing(); }
    outposts.set(b, list);
  }
  // The others go for a turret whenever one is closer than the core.
  const turrets = allCells().filter(c => isGun(c) && built(c));
  const veins = pumps().filter(p => p.veinHp > 0 && G.cells[p.to]).map(p => [p, G.cells[p.to]]);
  for (const e of G.enemies) {
    if (e.fly) {
      const k = Math.min(1, (e.fly.t += dt / NEST.throw));
      e.x = e.fly.x + (e.fly.tx - e.fly.x) * k; e.y = e.fly.y + (e.fly.ty - e.fly.y) * k; e.z = Math.sin(Math.PI * k) * 1.6;
      if (k >= 1) { delete e.fly; e.z = 0; }
      continue;
    }
    let goal = {x:CORE.x + .5, y:CORE.y + .5}, lure = 6, gnawing = false, prey = null, reach = Infinity;
    for (const c of outposts.get(G.breaches[e.home]) || []) {
      const mid = centreOf(c), d = Math.hypot(mid.x - e.x, mid.y - e.y);
      if (d < reach) { prey = c; reach = d; goal = mid; }
    }
    for (const [from, to] of veins) {
      if (from.veinHp <= 0) continue;
      const at = nearest(from, to, e.x, e.y), d = Math.hypot(at.x - e.x, at.y - e.y);
      const leak = leaking(from);
      if (d < .6) { from.veinHp -= dt * 2; from.veinHitAt = G.time; if (from.veinHp <= 0) { from.veinHp = 0; hooks.tell(L('Veine rompue : le bouton Reconstruire la répare.'), {at:from, bad:true}); } }
      // A leak draws them in until the vein breaks, then they resume.
      if (leak && d < lure) { goal = at; lure = d; gnawing = d < .6; }
    }
    let close = Math.hypot(goal.x - e.x, goal.y - e.y);
    for (const c of turrets) {
      const d = Math.hypot(c.x + .5 - e.x, c.y + .5 - e.y);
      if (d < close) { goal = {x:c.x + .5, y:c.y + .5}; close = d; gnawing = false; }
    }
    e.goal = goal;
    for (const w of [...G.worms]) {
      if (!w.path.some(id => { const [x,y] = id.split(',').map(Number); return Math.abs(x + .5 - e.x) < .6 && Math.abs(y + .5 - e.y) < .6; })) continue;
      w.hp -= dt * 2; w.hitAt = G.time;
      if (w.hp <= 0) { dropWorm(w, false); hooks.tell(L('Ver dévoré : sa cargaison est perdue.'), {at:{x:e.x - .5, y:e.y - .5}, bad:true}); }
    }
    for (const w of G.wires) {
      const a = G.cells[w.a], b = G.cells[w.b];
      if (w.hp <= 0 || !a || !b) continue;
      const at = nearest(a, b, e.x, e.y);
      if (Math.hypot(at.x - e.x, at.y - e.y) >= .5) continue;
      w.hp -= dt * 2; w.hitAt = G.time;
      if (w.hp <= 0) { w.hp = 0; hooks.tell(L('Nerf coupé : feux et trieurs reprennent leur réglage manuel. Reconstruire le répare.'), {at:a, bad:true}); }
    }
    if (gnawing) continue;
    const dx = goal.x - e.x, dy = goal.y - e.y, distance = Math.hypot(dx, dy) || 1;
    const c = cellAt(Math.floor(e.x + dx / distance * .4), Math.floor(e.y + dy / distance * .4));
    let pace = CREATURE.pace * kindOf(e).pace;
    if (c) {
      const passable = c !== prey && (!built(c) || isBelt(c) || c.type === 'bridge' || c.type === 'glue');
      c.hitAt = G.time;
      c.hp -= dt * (c.type === 'core' ? .6 : passable ? .4 : 3.5) * kindOf(e).bite;
      if (c.type === 'core') hooks.playSound('core_hit', 1.2, hooks.heard(c) ? hooks.placeOf(c) : null); else hooks.playNear('damaged', c, .8);
      pace = passable ? CREATURE.through * kindOf(e).pace : 0;
      if (c.hp <= 0) {
        if (c.type === 'core') { G.over = true; c.hp = 0; hooks.playSound('game_over'); }
        else { hooks.playNear('destroyed', c, .2); dropRise(c); delete G.cells[key(c.x, c.y)]; forgetCells(); G.ruins[key(c.x, c.y)] = {type:c.type, x:c.x, y:c.y, dir:c.dir, flip:c.flip, to:c.to, strict:c.strict, unload:c.unload, want:c.want, side:c.side, ways:c.ways, box:c.box, open:c.open, read:c.read, mk:c.mk, on:c.on, onRich:c.onRich, pick:c.pick, watch:c.watch}; hooks.tell(L('Ligne coupée : le bouton Reconstruire remet tout en place.'), {at:c, bad:true}); }
      }
    }
    // A glue holds the nine cells round it, its own among them: what walks there slows and burns.
    const glue = glueOver(e.x, e.y);
    if (glue) {
      const mk = rankOf(glue) - 1;
      pace = Math.min(pace, CREATURE.pace * kindOf(e).pace * GLUE.slow[mk]);
      e.hp -= GLUE.hurt[mk] * dt; e.hitAt = G.time; glue.gulp = {item:glue.stock[0], from:0, t:G.time};
      if ((glue.wear = (glue.wear || 0) + dt) >= GLUE.per) { glue.wear = 0; glue.stock.shift(); }
      if (e.hp <= 0) { slain(e, 0); continue; }
    }
    e.x += dx / distance * pace * dt; e.y += dy / distance * pace * dt;
  }
}
export function glueOver(x, y) {
  const fx = Math.floor(x), fy = Math.floor(y);
  for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
    const g = cellAt(fx + i, fy + j);
    if (g?.type === 'glue' && built(g) && g.stock.length) return g;
  }
  return null;
}
export function damage(ammo, gene) {
  const target = opposite(gene);
  let hits = 0;
  for (let i = 0; i < 3; i++) if (ammo[i] === target[i]) hits++;
  return [1, 2, 5, 12][hits];
}
export function fire(dt) {
  for (const c of allCells()) {
    if (!isGun(c) || !built(c)) continue;
    c.clock -= dt;
    if (c.clock > 0) continue;
    const gun = GUNS[c.type];
    // What the step overshot counts toward the next shot, so a gun keeps its pace. A long wait gives no burst.
    const due = Math.max(c.clock, -dt) + 1 / (gun.pace * GUN_RANK[rankOf(c) - 1]);
    if (c.type === 'mist') { puff(c, gun, due); continue; }
    if (c.type === 'harpoon') { pierce(c, gun, due); continue; }
    // Each shot of a volley chooses again: what the first one killed, the second does not waste a gene on.
    for (let shot = 0; shot < gun.volley; shot++) {
      const loaded = Object.keys(c.ammo).filter(g => c.ammo[g] > 0);
      if (!loaded.length) break;
      let target = null, best = reachOf(c.type);
      for (const e of G.enemies) {
        if (e.fly) continue;
        const d = Math.hypot(e.x - c.x - .5, e.y - c.y - .5);
        // An economical turret skips what it cannot hurt well and takes the next one in range.
        if (e.hp > 0 && d < best && (!c.strict || loaded.some(g => damage(g, e.gene) >= 5))) { target = e; best = d; }
      }
      if (!target) {
        // Nothing alive in range: the nest itself, at its edge.
        const nest = G.breaches.find(b => b.state === 'wake' && Math.hypot(b.x + .5 - c.x - .5, b.y + .5 - c.y - .5) - 1.5 <= reachOf(c.type)
          && (!c.strict || loaded.some(g => damage(g, b.genes[0]) >= 5)));
        if (!nest) break;
        nestHp(nest);
        const shell = loaded.reduce((a, b) => damage(b, nest.genes[0]) > damage(a, nest.genes[0]) ? b : a), hurt = damage(shell, nest.genes[0]);
        c.ammo[shell]--; c.clock = due;
        if (!shot) c.aim = Math.atan2(nest.y - c.y, nest.x - c.x);
        nest.hp -= hurt * gun.power; nest.hitAt = G.time;
        hooks.playNear('hit', nest, .12);
        hooks.playNear(c.type === 'turret' ? 'turret' : c.type, c);
        G.shots.push({x:c.x + .5, y:c.y + .5, tx:nest.x + .5, ty:nest.y + .5, hurt, gun:c.type, barrel:gun.volley > 1 ? shot * 2 - 1 : 0, until:G.time + (c.type === 'sting' ? .3 : .16)});
        if (nest.hp <= 0) destroyNest(nest);
        continue;
      }
      const ammo = loaded.reduce((a, b) => damage(b, target.gene) > damage(a, target.gene) ? b : a);
      const hurt = damage(ammo, target.gene);
      c.ammo[ammo]--; c.clock = due;
      if (!shot) c.aim = Math.atan2(target.y - c.y - .5, target.x - c.x - .5);
      target.hp -= hurt * gun.power;
      hooks.playNear(c.type === 'turret' ? 'turret' : c.type, c);
      hooks.playNear(target.hp <= 0 ? 'kill' : 'hit', {x:target.x - .5, y:target.y - .5});
      // hurt stays how right the gene was, it gives the colour. The gun gives the shape.
      G.shots.push({x:c.x + .5, y:c.y + .5, tx:target.x, ty:target.y, hurt, gun:c.type, barrel:gun.volley > 1 ? shot * 2 - 1 : 0, until:G.time + (c.type === 'sting' ? .3 : .16)});
      target.hitAt = G.time;
      if (target.hp <= 0) {
        G.kills++; earn('kills', KILL_PAY); credit('kill');
        if (ammo === opposite(target.gene)) credit('turret');
        // The body stays a minute and a half, then sinks; a hundred at most, the oldest going first.
        (G.corpses ||= []).push({x:target.x, y:target.y, gene:target.gene, kind:target.kind, at:G.time, a:Math.atan2(target.y - c.y - .5, target.x - c.x - .5)});
        if (G.corpses.length > CORPSE.most) G.corpses.shift();
      }
    }
  }
  G.enemies = G.enemies.filter(e => e.hp > 0);
  G.shots = G.shots.filter(s => s.until > G.time);
}
// A creature killed by something else than a single shot: counted, paid and left on the ground like the others.
export function slain(e, a) {
  G.kills++; earn('kills', KILL_PAY);
  (G.corpses ||= []).push({x:e.x, y:e.y, gene:e.gene, kind:e.kind, at:G.time, a});
  if (G.corpses.length > CORPSE.most) G.corpses.shift();
}
export const loadedOf = c => Object.keys(c.ammo).filter(g => c.ammo[g] > 0);
// The mister: one gene a puff, the one that hurts the creatures in reach most in all, on all of them at once.
export function puff(c, gun, due) {
  const loaded = loadedOf(c), reach = reachOf('mist') + .5 * (rankOf(c) - 1), cx = c.x + .5, cy = c.y + .5;
  const near = G.enemies.filter(e => !e.fly && e.hp > 0 && Math.hypot(e.x - cx, e.y - cy) < reach);
  if (!loaded.length || !near.length) return;
  const sum = g => near.reduce((s, e) => s + damage(g, e.gene), 0), ammo = loaded.reduce((a, b) => sum(b) > sum(a) ? b : a);
  c.ammo[ammo]--; c.clock = due; c.puffAt = G.time; c.puffGene = ammo;
  let best = 1;
  for (const e of near) {
    const hurt = damage(ammo, e.gene);
    best = Math.max(best, hurt);
    e.hp -= hurt * gun.power; e.hitAt = G.time;
    if (e.hp <= 0) slain(e, Math.atan2(e.y - cy, e.x - cx));
  }
  hooks.playNear('maw', c);
  G.shots.push({x:cx, y:cy, tx:cx, ty:cy, hurt:best, gun:'mist', reach, until:G.time + .7});
}
// The harpoon: aims at the nearest creature in reach and runs through every one on that line.
export function pierce(c, gun, due) {
  const loaded = loadedOf(c), reach = reachOf('harpoon'), cx = c.x + .5, cy = c.y + .5, width = rankOf(c) >= 3 ? .6 : .45;
  if (!loaded.length) return;
  let target = null, best = reach;
  for (const e of G.enemies) {
    const d = Math.hypot(e.x - cx, e.y - cy);
    if (!e.fly && e.hp > 0 && d < best) { target = e; best = d; }
  }
  if (!target) return;
  const a = Math.atan2(target.y - cy, target.x - cx), dx = Math.cos(a), dy = Math.sin(a);
  const ammo = loaded.reduce((p, q) => damage(q, target.gene) > damage(p, target.gene) ? q : p);
  c.ammo[ammo]--; c.clock = due; c.aim = a;
  for (const e of G.enemies) {
    if (e.fly || e.hp <= 0) continue;
    const along = (e.x - cx) * dx + (e.y - cy) * dy, off = Math.abs((e.y - cy) * dx - (e.x - cx) * dy);
    if (along < 0 || along > reach || off > width) continue;
    e.hp -= damage(ammo, e.gene) * gun.power; e.hitAt = G.time;
    if (e.hp <= 0) slain(e, a);
  }
  hooks.playNear('sting', c);
  G.shots.push({x:cx, y:cy, tx:cx + dx * reach, ty:cy + dy * reach, hurt:damage(ammo, target.gene), gun:'harpoon', until:G.time + .35});
}
export function step(dt) {
  forgetCells();
  if (G.over) return;
  G.time += dt;
  construct(dt); repair(dt); sense(); flow(dt); digest(dt); menace(dt); fire(dt);
  if (Math.floor(G.time * 2) !== Math.floor((G.time - dt) * 2)) look();
}
export function exitOf(c) {
  if (c.type === 'sort') {
    if (!listens(c)) return fits(c, c.item) ? sideExit(c) : c.dir;
    // On a condition, like a gate: its filter goes aside while the condition holds, up to its batch.
    if (c.when && c.when !== 'gene') return gateOpen(c) && fits(c, c.item) ? sideExit(c) : c.dir;
    if (!asked(c, c.item)) return c.dir;
    const side = sideExit(c), to = ahead(c, side);
    // The same base can be wanted in two positions: what is too much goes on to the next sorter.
    return c.read && !(to && accepts(to, c.item, side)) ? c.dir : side;
  }
  if (!isSplit(c)) return c.dir;
  const exits = splitExits(c), n = exits.length;
  for (let i = 0; i < n; i++) {
    const dir = exits[(c.turn + i) % n], to = ahead(c, dir);
    if (to && accepts(to, c.item, dir)) return dir;
  }
  // Blocked, what waits leans towards a way out it has.
  return exits.includes(c.dir) ? c.dir : exits[c.turn % n];
}

export function remove(x,y) {
  if (G.cells[key(x,y)]?.type === 'core') return;
  const gone = G.cells[key(x,y)];
  G.wires = G.wires.filter(w => w.a !== key(x,y) && w.b !== key(x,y));
  if (gone) { dropRise(gone); G.dna += refund(gone); }
  delete G.cells[key(x,y)]; delete G.ruins[key(x,y)]; forgetCells();
  for (const c of [...pumps(), ...Object.values(G.ruins)]) if (c.to === key(x,y)) { c.to = null; c.packets = []; delete c.veinOut; delete c.veinCut; }
}
// The opening message says the breaches sleep: it goes once one wakes.
export function hungry() { return L('Le cœur a faim : fabrique le gène demandé en haut et amène-le jusqu’à lui. Les brèches dorment.'); }

// The bindings the interface may replace: a new or loaded game, a reset network, the timing probes.
export const simSet = {
  FIELDS: (v) => { FIELDS = v; },
  DEPOSIT: (v) => { DEPOSIT = v; },
  RICH: (v) => { RICH = v; },
  patches: (v) => { patches = v; },
  sectors: (v) => { sectors = v; },
  live: (v) => { live = v; },
  passingBy: (v) => { passingBy = v; },
  fogTick: (v) => { fogTick = v; },
  // @ts-expect-error: a function rebound in place, as a test's stub or the timing probes do
  look: (v) => { look = v; },
  G: (v) => { G = v; },
  uncapped: (v) => { uncapped = v; },
  NET: (v) => { NET = v; },
  // @ts-expect-error: a function rebound in place, as a test's stub or the timing probes do
  step: (v) => { step = v; }
};
