// The card a building shows the first time it is picked once unlocked (docs/design/unlock-card): a small looping
// scene drawn with the game's own renderer, what it is for, its controls. Replayed from the help, Bâtiments.
import { BIG, DX, DY, G, RANKS, TYPES, allCells, cell, hasTrait, hungryFor } from "../sim/sim.ts";
import { L } from "../sim/text.ts";
import { $, FAMILIES, KEYS, NEEDS, STILL, keyName, modalOpen, paused } from "./main.js";
import { packWarning } from "./actions.js";
import { drawCell, rect, token } from "./render.js";
import { keep, stored } from "./saves.js";
import { CONCEPTS, conceptIds } from "./concepts.js";

export const CARDS_KEY = 'strainworks-cards';
// Sides as the building faces east: front, back, left, right. Each scene: what enters where, what leaves where.
const SIDE = {front:1, back:3, left:0, right:2};
const CARDS = {
  mine:{what:L('Posé sur un gisement, il en tire une base par seconde et la pousse par sa flèche.'), out:[['front', 'S']]},
  cyst:{what:L('Un stock : il garde ce qui entre par ses côtés et le rend par sa flèche, à remplir avant un assaut.'), ins:[['back', 'SFS']], out:[['front', 'SFS']]},
  borer:{what:L('Sur quatre cases d’un même gisement, il tire comme six récolteurs et sort par tous ses bords.'), out:[['front', 'F'], ['right', 'F']]},
  vault:{what:L('Un grand stock de quatre cases : il prend par trois faces et rend par deux bouches devant.'), ins:[['back', 'SFS']], out:[['front', 'SFS']]},
  belt:{what:L('Il porte ce qu’on lui donne, de sa sortie vers son entrée : trace-le en glissant.'), ins:[['back', 'S']], out:[['front', 'S']]},
  bridge:{what:L('Deux lignes s’y croisent sans se mélanger, chacune à son rythme.'), ins:[['back', 'S'], ['left', 'F']], out:[['front', 'S'], ['right', 'F']]},
  split2:{what:L('Ce qui entre derrière part à tour de rôle à gauche et à droite.'), ins:[['back', 'S']], out:[['left', 'S'], ['right', 'S']]},
  split:{what:L('Ce qui entre derrière part à tour de rôle vers les trois autres côtés.'), ins:[['back', 'S']], out:[['left', 'S'], ['front', 'S'], ['right', 'S']]},
  pump:{what:L('Une pompe de veine : relie-en deux, une seule matière y file sous tout, jusqu’à 24 cases.'), ins:[['back', 'C']]},
  track:{what:L('La boucle des vers : elle passe sous tout et se referme sur son départ.')},
  pocket:{what:L('Posée contre une piste, elle charge ou vide les soutes des vers qui passent.'), ins:[['back', 'F']]},
  worm:{what:L('Incubé sur une piste, il en fait le tour avec trois soutes : un transport à longue distance.')},
  arm:{what:L('Il prend derrière lui, sur un tapis, un stock ou une machine, et pose devant.'), ins:[['back', 'SFS']], out:[['front', 'SFS']]},
  ligase:{what:L('Elle assemble trois bases en un gène : l’entrée de gauche donne la première, celle de derrière la deuxième, celle de droite la troisième.'), ins:[['left', 'S'], ['back', 'F'], ['right', 'S']], out:[['front', 'SFS']]},
  pack:{what:L('Des gènes derrière, du carbone sur le côté : il les met en boîte, capsule pour le cœur ou chargeur pour les tourelles.'), ins:[['back', 'SFS'], ['left', 'K']], out:[['front', 'T:SFS']]},
  join:{what:L('Gène 1 à gauche, gène 2 à droite : il en fait un brin, le premier en tête.'), ins:[['left', 'SFS'], ['right', 'FFF']], out:[['front', 'SFSFFF']]},
  unpack:{what:L('Une boîte entre derrière : son contenu ressort devant, son carbone à droite.'), ins:[['back', 'T:SFS']], out:[['front', 'SFS'], ['right', 'K']]},
  flip:{what:L('Un gène entre derrière et ressort devant dans l’ordre inverse.'), ins:[['back', 'SFN']], out:[['front', 'NFS']]},
  unbind:{what:L('L’inverse de la Ligase : un gène entre derrière, ses trois bases ressortent à gauche, devant et à droite.'), ins:[['back', 'SFN']], out:[['left', 'S'], ['front', 'F'], ['right', 'N']]},
  unjoin:{what:L('L’inverse de l’Assembleur : un brin entre derrière, son gène 1 sort à gauche, son gène 2 à droite.'), ins:[['back', 'SFSFFF']], out:[['left', 'SFS'], ['right', 'FFF']]},
  burn:{what:L('Tout ce qui entre par ses côtés part en fumée : il vide ce qui déborde.'), ins:[['back', 'S'], ['left', 'F']]},
  reaper:{what:L('Unique : son rayon aspire les cadavres autour de lui et en recopie le gène, ou rend du carbone.')},
  turret:{what:L('Elle tire les gènes qu’on lui livre ; l’antidote de la créature fait le plus mal.'), ins:[['back', 'SFS']]},
  sting:{what:L('Une tourelle à longue portée : un tir lourd par seconde. Fragile, garde-la derrière.'), ins:[['back', 'SFS']]},
  maw:{what:L('Une tourelle de courte portée qui frappe deux fois et encaisse, mais dévore les gènes.'), ins:[['back', 'SFS']]},
  wall:{what:L('Il bloque et encaisse : les créatures doivent le casser pour passer.')},
  glue:{what:L('Elle englue les neuf cases autour d’elle : ce qui y passe ralentit et brûle. Elle mange des gènes.'), ins:[['back', 'SFS']]},
  mist:{what:L('Un nuage d’antidote toutes les deux secondes sur trois cases : il touche toute une Nuée.'), ins:[['back', 'SFS']]},
  harpoon:{what:L('Un carreau lourd à très longue portée qui traverse une file. Il prend des capsules d’antidote.'), ins:[['back', 'T:SFS']]},
  gate:{what:L('Un rail à interrupteur : vert, ça passe ; rouge, la ligne attend. Un nerf peut le commander.'), ins:[['back', 'S']], out:[['front', 'S']]},
  sort:{what:L('Ce qui correspond à son filtre sort du côté choisi, le reste va tout droit.'), ins:[['back', 'S']], out:[['right', 'S']]},
  wire:{what:L('Il relie tourelles, feux et trieurs : la tourelle dit ce qu’il lui faut, les autres écoutent.')},
  radar:{what:L('Il garde visible une grande zone et, relié par un nerf, annonce les créatures qui la traversent.')},
  relay:{what:L('Un poteau qui porte un nerf 24 cases plus loin.')},
  desk:{what:L('Relié à un nerf, il choisit ce que le réseau demande : le plus nombreux, le plus proche, ou un gène fixé.')},
  lab:{what:L('Unique : il vend des améliorations contre de l’ADN, drones, vitesse, portée, vision.')},
  screen:{what:L('Relié à un nerf, il affiche en grand l’antidote que son réseau demande.')},
};
// Read when asked: this module loads before main.js has written its tables.
export const cardTypes = () => FAMILIES.flatMap(f => f[3]).filter(type => CARDS[type]);
const MIRRORED = new Set(['ligase', 'join', 'pack', 'unbind', 'unjoin']);
// Its controls, each with its key: read from what the building can do, so they follow the keys the player chose.
export function controlsOf(type) {
  const rows = [];
  if (hasTrait(type, 'turn')) rows.push([keyName(KEYS.rotate), L('Tourner la machine')]);
  if (MIRRORED.has(type)) rows.push([keyName(KEYS.mirror), L('Inverser gauche et droite')]);
  if (hasTrait(type, 'traced') || hasTrait(type, 'drawn')) rows.push([L('Glisser'), L('Tracer la ligne')]);
  if (RANKS[type]) rows.push([L('Clic'), L('Rang MK2 puis MK3 : plus vite, plus fort')]);
  return rows;
}
function seen() { try { return JSON.parse(stored(CARDS_KEY) || '[]'); } catch (_) { return []; } }
// Picked from the tray: the first time a building opened by a stage is picked, its card.
export function offerCard(type) {
  if (!NEEDS[type] || !CARDS[type] || seen().includes(type)) return false;
  keep(CARDS_KEY, JSON.stringify([...seen(), type]));
  showCard(type);
  return true;
}
let loop = 0;
export function showCard(type, fresh = true) {
  const card = CARDS[type], box = $('unlock');
  if (!card || !box) return;
  box.dataset.type = type;
  $('unlock-kicker').textContent = fresh ? L('Nouveau bâtiment') : L('Bâtiment');
  $('unlock-later').textContent = L('À revoir dans l’aide, rubrique Bâtiments');
  $('unlock-title').textContent = TYPES[type].name;
  $('unlock-what').textContent = card.what;
  $('unlock-keys').innerHTML = controlsOf(type).map(([k, what]) => `<li><kbd>${k}</kbd>${what}</li>`).join('');
  $('unlock-scene').setAttribute('aria-label', L`${TYPES[type].name} au travail`);
  if (!box.open) box.showModal();
  cancelAnimationFrame(loop);
  const g = $('unlock-scene').getContext('2d');
  const frame = () => { if (!box.open) return; drawScene(g, type); loop = requestAnimationFrame(frame); };
  frame();
}
// Five cells a side, the building in the middle facing east, its belts in and out, what they carry moving.
export function drawScene(g, type) {
  // Reduced motion: one still frame, what enters halfway in.
  const card = CARDS[type], size = g.canvas.width / 5, t = STILL.matches ? .3 : (performance.now() / 2400) % 1;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = '#0B1417'; g.fillRect(0, 0, g.canvas.width, g.canvas.height);
  g.setTransform(size, 0, 0, size, 0, 0);
  for (let x = 0; x < 5; x++) for (let y = 0; y < 5; y++) rect(g, x + .04, y + .04, .92, .92, '#0D171A');
  const at = (x, y, c, inputs = []) => { g.save(); g.translate(x + .5, y + .5); drawCell(g, c, inputs); g.restore(); };
  const lanes = [...(card.ins || []).map(([side, item]) => ({side:SIDE[side], item, inward:true})), ...(card.out || []).map(([side, item]) => ({side:SIDE[side], item, inward:false}))];
  for (const {side, inward} of lanes) for (const k of [1, 2]) {
    const dir = inward ? (side + 2) % 4 : side;
    at(2 + DX[side] * k, 2 + DY[side] * k, cell('belt', 0, 0, dir), [(dir + 2) % 4]);
  }
  g.save(); g.translate(2.5, 2.5);
  if (BIG[type]) g.scale(1.5, 1.5);
  drawCell(g, cell(type, 0, 0, 1));
  g.restore();
  // In over the first half, out over the second: what enters becomes what leaves.
  for (const {side, item, inward} of lanes) {
    const part = inward ? t * 2 : t * 2 - 1;
    if (part < 0 || part > 1) continue;
    const reach = inward ? 2.5 - part * 2 : .5 + part * 2, dir = inward ? (side + 2) % 4 : side;
    token(g, item, 2.5 + DX[side] * reach, 2.5 + DY[side] * reach, Math.atan2(DY[dir], DX[dir]));
  }
}
// A rule of the game met for the first time: its card, once; the help shows any of them again.
export const CONCEPTS_KEY = 'strainworks-concepts';
function met() { try { return JSON.parse(stored(CONCEPTS_KEY) || '[]'); } catch (_) { return []; } }
export function offerConcept(id) {
  // One card at a time: another one open now, this one waits for the next meeting.
  if (!CONCEPTS[id] || met().includes(id) || $('unlock')?.open) return false;
  keep(CONCEPTS_KEY, JSON.stringify([...met(), id]));
  showConcept(id);
  return true;
}
// The rules of a running game, each met the first time its moment comes; the harvester cap when a fourth is refused.
const MOMENTS = {
  genes:() => G.base && G.time > 3 && hungryFor().length > 0,
  mechanic:() => G.base && G.goals && G.needs?.length > 0,
  swarm:() => G.swarm?.next != null,
  nest:() => G.breaches?.some(b => b.state === 'wake'),
  pack:() => allCells().some(c => c.type === 'pack' && packWarning(c)),
};
export function meetConcepts() {
  if (!G || G.over || paused || modalOpen() || !$('intro')?.hidden) return;
  const id = Object.keys(MOMENTS).find(one => !met().includes(one) && MOMENTS[one]());
  if (id) offerConcept(id);
}
export function showConcept(id, fresh = true) {
  const concept = CONCEPTS[id], box = $('unlock');
  if (!concept || !box) return;
  box.dataset.type = `concept-${id}`;
  $('unlock-kicker').textContent = fresh ? L`Nouveau · ${concept.kicker}` : concept.kicker;
  $('unlock-title').textContent = concept.title;
  $('unlock-what').replaceChildren(concept.lines[0], document.createElement('br'), concept.lines[1]);
  $('unlock-keys').innerHTML = concept.facts.map(([k, what]) => `<li><kbd>${k}</kbd>${what}</li>`).join('');
  $('unlock-later').textContent = L('À revoir dans l’aide, rubrique Concepts');
  $('unlock-scene').setAttribute('aria-label', concept.title);
  if (!box.open) box.showModal();
  cancelAnimationFrame(loop);
  const g = $('unlock-scene').getContext('2d');
  const frame = () => { if (!box.open) return; drawConcept(g, id); loop = requestAnimationFrame(frame); };
  frame();
}
// The same five-unit scene as a building's card; under reduced motion one still frame, the change done.
export function drawConcept(g, id, t = STILL.matches ? .8 : (performance.now() / 4000) % 1) {
  const size = g.canvas.width / 5;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = '#0B1417'; g.fillRect(0, 0, g.canvas.width, g.canvas.height);
  g.setTransform(size, 0, 0, size, 0, 0);
  CONCEPTS[id].draw(g, t);
}
export function paintConceptList() {
  const list = $('concept-cards');
  if (list) list.innerHTML = conceptIds().map(id => `<button type="button" class="tip" data-concept="${id}">${CONCEPTS[id].title}</button>`).join('');
}
export function closeCard() { cancelAnimationFrame(loop); $('unlock')?.close(); }
// The help lists every building: touched, its card again.
export function paintCardList() {
  const list = $('building-cards');
  if (!list) return;
  list.innerHTML = cardTypes().map(type => `<button type="button" class="tip" data-card="${type}">${TYPES[type].name}</button>`).join('');
}
