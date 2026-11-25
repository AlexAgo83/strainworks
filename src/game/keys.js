// Keys the player can change.
import { RANKS, cellAt, hasTrait, rankOf } from "../sim/sim.ts";
import { L } from "../sim/text.ts";
import { setHeading } from "./actions.js";
import { refuse } from "./hud.js";
import { choose, position, stretch } from "./input.js";
import { $, ACTIONS, GLIDE, KEYS, KEYS_KEY, RESERVED, arrows, drag, gesture, handRank, hovered, hurried, inside, keyName, mainSet, rebinding, tool, view, view3d } from "./main.js";
import { pan } from "./render.js";

export function loadKeys() {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEYS_KEY)) || {}; } catch (_) { /* blocked storage or an unreadable value: the default stays */ }
  mainSet.KEYS(Object.fromEntries(ACTIONS.map(([id, , code]) => [id, typeof saved[id] === 'string' && !RESERVED.test(saved[id]) ? saved[id] : code])));
}
export function paintKeys() {
  $('keys').innerHTML = ACTIONS.map(([id, name]) => `<dt><button type="button" data-action="${id}" aria-pressed="${rebinding === id}">${rebinding === id ? L('Appuie sur une touche…') : keyName(KEYS[id])}</button></dt><dd>${name}</dd>`).join('');
}
// The eyedropper: the building under the pointer, in hand with its heading and rank. Over bare ground it puts down
// what is in hand, as key 1 does.
export function pipette() {
  const at = hovered && (view3d ? view3d.pick(hovered) : position(hovered));
  const c = at && inside(at.x, at.y) ? cellAt(at.x, at.y) : null;
  if (!c) { choose('hand'); return; }
  if (!$('tools').querySelector(`[data-type="${c.type}"]`)) { refuse(L('Pipette : survole un bâtiment à reprendre.')); return; }
  if (RANKS[c.type]) handRank[c.type] = rankOf(c);
  choose(c.type);
  if (tool === c.type && hasTrait(c.type, 'turn')) setHeading(c.dir);
}
export function glide(elapsed) {
  let x = 0, y = 0;
  for (const name of arrows) { x += GLIDE[name][0]; y += GLIDE[name][1]; }
  if (!x && !y) return;
  const far = (hurried ? 1800 : 720) * elapsed / Math.hypot(x, y);
  pan(-x * far, -y * far);
  // A line being drawn follows the pointer over the moving map.
  if (gesture?.mode === 'draw' && drag) {
    const to = position(gesture.now);
    if (inside(to.x, to.y)) stretch(to);
  }
}
export function followEdge(elapsed) {
  if (gesture?.mode !== 'draw' || !drag) return;
  const p = gesture.now, margin = 28, side = (v,max) => v < margin ? 1 : v > max - margin ? -1 : 0;
  const dx = side(p.x,view.w), dy = side(p.y,view.h);
  if (!dx && !dy) return;
  pan(dx * 280 * elapsed,dy * 280 * elapsed);
  const to = position({x:Math.max(1,Math.min(view.w - 1,p.x)), y:Math.max(1,Math.min(view.h - 1,p.y))});
  if (inside(to.x,to.y)) stretch(to);
}

// The bindings other modules replace.
export const keysSet = {

};
