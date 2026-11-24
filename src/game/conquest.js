// The planet's conquest (req_001): a hatching purifies its hexagon and opens the hexagons beside it. The state
// lives beside the games list, never in a game: free mode, its threat and its losses cannot touch it.
import { CORE, G, RING, applyRing, hatchDrones, put, spotHash } from "../sim/sim.ts";
import { L } from "../sim/text.ts";
import { CELLS_OF_GLOBE, dot3 } from "./main.js";

// Each hexagon's neighbours on the globe: the cells whose centres sit at about the nearest distance (five round
// a pentagon, six otherwise). Read when asked: this module loads before main.js has built the globe.
let near = null;
export function neighbours(id) {
  if (!near) {
    const cells = CELLS_OF_GLOBE;
    near = cells.map((one, i) => {
      const far = cells.map((other, j) => [j, i === j ? -2 : dot3(one.c, other.c)]).sort((a, b) => b[1] - a[1]);
      const closest = Math.acos(Math.min(1, far[0][1]));
      return far.filter(([, d]) => Math.acos(Math.min(1, d)) < closest * 1.3).map(([j]) => j);
    });
  }
  return near[Number(id)] || [];
}
export const freshPlanet = () => ({v:1, first:null, purified:{}, mutations:{}});
// The strain mutations (item_026): each hatching offers three of them, the player keeps one for every later
// station on this planet. Each is a small head start of about the same weight; stacking ones have a cap.
export const MUTATIONS = {
  drone:{cap:2, name:L('Drone de plus'), what:L('Chaque nouvelle station démarre avec un drone de plus.')},
  dna:{cap:3, name:L('Réserve d’ADN'), what:L('Chaque nouvelle station démarre avec 60 ADN de plus.')},
  hunger:{cap:1, name:L('Appétit réduit'), what:L('La première demande du cœur passe de 100 à 70.')},
  turret:{cap:1, name:L('Tourelle prête'), what:L('Une tourelle déjà construite attend à côté du cœur au départ.')},
  harvest:{cap:2, name:L('Récolte vive'), what:L('Les récolteurs tirent 15 % plus vite.')},
  rank:{cap:1, name:L('Premier rang moins cher'), what:L('Le rang MK2 coûte 30 % de moins.')},
};
export const START_DNA_MORE = 60, HUNGER_COUNT = 70;
// Three distinct mutations the planet can still take, drawn from the game's seed.
export function drawOffer(state, seed) {
  const open = Object.keys(MUTATIONS).filter(id => (state.mutations[id] || 0) < MUTATIONS[id].cap);
  return open.map((id, i) => [id, spotHash(Number(seed) || 0, i, 911)]).sort((a, b) => Number(a[1]) - Number(b[1])).slice(0, 3).map(([id]) => id);
}
export function takeMutation(state, id, seed = 0) {
  if (!state.offer?.includes(id)) return false;
  state.mutations[id] = (state.mutations[id] || 0) + 1;
  state.owed = Math.max(0, (state.owed || 1) - 1);
  const next = state.owed ? drawOffer(state, Number(seed) + state.owed) : [];
  if (next.length) state.offer = next; else { delete state.offer; state.owed = 0; }
  return true;
}
// Steps from the planet's first purified hexagon, across the globe; 0 before any hatching.
export function ringOfHex(state, id) {
  if (state.first == null) return 0;
  const seen = new Map([[Number(state.first), 0]]), queue = [Number(state.first)];
  while (queue.length) {
    const at = queue.shift();
    if (at === Number(id)) return seen.get(at);
    for (const n of neighbours(at)) if (!seen.has(n)) { seen.set(n, seen.get(at) + 1); queue.push(n); }
  }
  return 0;
}
// What a ring changes, in a few words for the planet.
export function ringText(ring) {
  const k = Math.min(RING.most, ring);
  if (!k) return L`Anneau ${ring} : comme la première station.`;
  return L`Anneau ${ring}${ring > RING.most ? L` (comme l’anneau ${RING.most})` : ''} : ${k * RING.families} famille${k > 1 ? 's' : ''} de créatures de plus, essaims +${Math.round(k * RING.swarm * 100)} %, gisements −${Math.round(k * RING.deposit * 100)} %.`;
}
// A new station starts with its ring's difficulty and what the planet holds; the game keeps its own copy.
export function strainStart(held, ring = 0) {
  if (ring) applyRing(ring);
  const muts = Object.fromEntries(Object.entries(held || {}).filter(([id, n]) => MUTATIONS[id] && n > 0).map(([id, n]) => [id, Math.min(n, MUTATIONS[id].cap)]));
  if (!Object.keys(muts).length) return;
  G.mutations = muts;
  G.dna += START_DNA_MORE * (muts.dna || 0);
  if (muts.drone) hatchDrones();
  // A drawn game asks less; a game with the fixed recipes starts its first count part done.
  if (muts.hunger && G.stage === 0) { if (G.goals?.[0]) G.goals[0].count = HUNGER_COUNT; else G.fed = Math.max(G.fed || 0, 100 - HUNGER_COUNT); }
  if (muts.turret) put('turret', CORE.x + 3, CORE.y, 1);
}
// What a stored list holds, checked: ids must be hexagons, times numbers.
export function planetOf(raw) {
  const state = freshPlanet();
  if (!raw || typeof raw !== 'object') return state;
  for (const [id, at] of Object.entries(raw.purified || {})) if (CELLS_OF_GLOBE[id] && Number.isFinite(at)) state.purified[id] = at;
  for (const [name, n] of Object.entries(raw.mutations || {})) if (Object.hasOwn(MUTATIONS, name) && Number.isInteger(n) && n > 0) state.mutations[name] = Math.min(n, MUTATIONS[name].cap);
  if (Array.isArray(raw.offer)) { const offer = [...new Set(raw.offer.filter(id => Object.hasOwn(MUTATIONS, id)))].slice(0, 3); if (offer.length) state.offer = offer; }
  if (state.offer) state.owed = Number.isInteger(raw.owed) && raw.owed > 0 ? Math.min(raw.owed, 200) : 1;
  state.first = raw.first != null && CELLS_OF_GLOBE[raw.first] ? Number(raw.first) : null;
  if (state.first == null && Object.keys(state.purified).length) state.first = Number(Object.keys(state.purified)[0]);
  return state;
}
export const purified = (state, id) => Object.hasOwn(state.purified, String(id));
export const anyPurified = state => Object.keys(state.purified).length > 0;
// Before the first hatching every hexagon is open; after it, purified ones and their neighbours.
export const isOpen = (state, id) => !anyPurified(state) || purified(state, id) || neighbours(id).some(n => purified(state, n));
// Purifies a hexagon once; returns the hexagons it opened, or null if it was already purified.
export function purify(state, id, at) {
  if (purified(state, id)) return null;
  const before = new Set(CELLS_OF_GLOBE.map((_, i) => i).filter(i => isOpen(state, i) && anyPurified(state)));
  state.purified[String(id)] = at;
  state.first ??= Number(id);
  return neighbours(id).filter(n => !purified(state, n) && !before.has(n));
}
