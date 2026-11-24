// The concept cards: what a rule of the game is, shown the first time the player meets it as a small looping scene
// drawn with the game's renderer, two lines and the key figures, and replayed from the help (Concepts).
import { L } from "../sim/text.ts";
import { circle, polygon } from "./render.js";

// A hexagon of the planet in scene units, flat side up.
export function hex(g, x, y, r, fill, stroke, width = .04, dash = null) {
  g.save();
  if (dash) g.setLineDash(dash);
  polygon(g, [0, 1, 2, 3, 4, 5].map(i => [x + Math.cos(i * Math.PI / 3) * r, y + Math.sin(i * Math.PI / 3) * r]), fill, stroke, width);
  g.restore();
}
// The six around a hexagon, then the hexagon itself, on a five-unit scene.
const R = .62, AROUND = [0, 1, 2, 3, 4, 5].map(i => [2.5 + Math.cos(i * Math.PI / 3 + Math.PI / 6) * R * Math.sqrt(3), 2.5 + Math.sin(i * Math.PI / 3 + Math.PI / 6) * R * Math.sqrt(3)]);
const INFECTED = '#3A1820', LIVING = '#B7F34A', OPEN = '#66D9EA';
const mix = (a, b, k) => `rgb(${[0, 2, 4].map(i => Math.round(parseInt(a.slice(1 + i, 3 + i), 16) * (1 - k) + parseInt(b.slice(1 + i, 3 + i), 16) * k)).join(',')})`;
const ease = k => Math.max(0, Math.min(1, k));

export const CONCEPTS = {
  purify:{
    kicker:L('Planète'), title:L('Purification'),
    lines:[L('Faire éclore une souche purifie son hexagone pour de bon.'), L('Les hexagones voisins s’ouvrent : la prochaine station se fonde à côté.')],
    facts:[['1', L('hexagone purifié par éclosion')], ['6', L('voisins ouverts autour (5 d’un pentagone)')], ['∞', L('le mode libre ne peut plus le perdre')]],
    draw(g, t) {
      const turn = ease((t - .25) / .15);
      for (const [i, [x, y]] of AROUND.entries()) {
        const shown = ease((t - .45 - i * .05) / .08);
        hex(g, x, y, R * .96, INFECTED, null);
        if (shown) hex(g, x, y, R * .9, `rgba(102,217,234,${.10 * shown})`, OPEN, .05 * shown, [.12, .08]);
      }
      hex(g, 2.5, 2.5, R * .96, mix(INFECTED, '#5E8A2A', turn), turn ? '#D8FF8A' : null, .05);
      if (t > .25 && t < .55) circle(g, 2.5, 2.5, R * 2.4 * ease((t - .25) / .3), null, `rgba(183,243,74,${.8 * (1 - ease((t - .25) / .3))})`, .08);
      circle(g, 2.5, 2.5, .16, turn ? LIVING : '#FF6B74');
      circle(g, 2.5, 2.5, .28 + .05 * Math.sin(t * Math.PI * 8), null, turn ? LIVING : '#FF6B74', .03);
    },
  },
};
export const conceptIds = () => Object.keys(CONCEPTS);
