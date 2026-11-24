// The planet's conquest (req_001): a hatching purifies its hexagon and opens the hexagons beside it. The state
// lives beside the games list, never in a game: free mode, its threat and its losses cannot touch it.
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
// What a stored list holds, checked: ids must be hexagons, times numbers.
export function planetOf(raw) {
  const state = freshPlanet();
  if (!raw || typeof raw !== 'object') return state;
  for (const [id, at] of Object.entries(raw.purified || {})) if (CELLS_OF_GLOBE[id] && Number.isFinite(at)) state.purified[id] = at;
  for (const [name, n] of Object.entries(raw.mutations || {})) if (/^[a-z]{2,20}$/.test(name) && Number.isInteger(n) && n > 0 && n < 100) state.mutations[name] = n;
  state.first = raw.first != null && CELLS_OF_GLOBE[raw.first] ? Number(raw.first) : null;
  if (state.first == null && Object.keys(state.purified).length) state.first = Number(Object.keys(state.purified)[0]);
  return state;
}
export const purified = (state, id) => Object.hasOwn(state.purified, String(id));
export const anyPurified = state => Object.keys(state.purified).length > 0;
// Before the first hatching every hexagon is open; after it, purified ones and their neighbours.
export const isOpen = (state, id) => !anyPurified(state) || purified(state, id) || neighbours(id).some(n => purified(state, n));
// Purifies a hexagon once; returns the hexagons it opened, none if it was already purified.
export function purify(state, id, at) {
  if (purified(state, id)) return [];
  const before = new Set(CELLS_OF_GLOBE.map((_, i) => i).filter(i => isOpen(state, i) && anyPurified(state)));
  state.purified[String(id)] = at;
  state.first ??= Number(id);
  return neighbours(id).filter(n => !purified(state, n) && !before.has(n));
}
