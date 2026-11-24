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
  mutation:{
    kicker:L('Planète'), title:L('Mutation de souche'),
    lines:[L('Chaque éclosion te laisse choisir une mutation parmi trois.'), L('Elle reste pour toutes tes prochaines stations sur cette planète.')],
    facts:[['3', L('mutations proposées à chaque éclosion')], ['1', L('gardée pour toutes les stations suivantes')], ['max', L('chacune a un plafond, puis ne sort plus')]],
    draw(g, t) {
      const pick = ease((t - .45) / .1);
      for (const [i, x] of [[0, .95], [1, 2.5], [2, 4.05]]) {
        const shown = ease((t - i * .08) / .15), chosen = i === 1, k = chosen ? 1 + .12 * pick : 1 - .5 * pick;
        if (!shown) continue;
        g.save(); g.globalAlpha = shown * (chosen ? 1 : 1 - .55 * pick);
        g.translate(x, 2.6 + (1 - shown) * .6); g.scale(k, k);
        polygon(g, [[-.62, -1], [.62, -1], [.62, 1], [-.62, 1]], chosen && pick ? '#111F12' : '#0D171A', chosen && pick ? LIVING : '#2A3C41', .05);
        circle(g, 0, -.45, .3, '#1D3317', '#36592A', .03);
        circle(g, 0, -.45, .1 + i * .03, [OPEN, LIVING, '#F0A03C'][i]);
        for (const y of [.15, .38, .6]) polygon(g, [[-.42, y], [.42 - (y > .5 ? .25 : 0), y], [.42 - (y > .5 ? .25 : 0), y + .07], [-.42, y + .07]], '#2A3C41', null);
        g.restore();
      }
      if (t > .65) circle(g, 2.5, 2.6, 1.3 + (t - .65) * 1.5, null, `rgba(183,243,74,${Math.max(0, .6 - (t - .65) * 2)})`, .06);
    },
  },
  ring:{
    kicker:L('Planète'), title:L('Anneaux'),
    lines:[L('Plus un hexagone est loin de ta première souche, plus il est dur.'), L('Tes mutations de souche sont là pour tenir l’anneau suivant.')],
    facts:[['+1', L('famille de créatures par anneau')], ['+25 %', L('de créatures dans chaque essaim')], ['−10 %', L('de débit sur les gisements, jusqu’à l’anneau 3')]],
    draw(g, t) {
      // The first hexagon, then ring after ring lighting up, each a shade more hostile.
      const step = Math.floor(ease(t / .8) * 3.999);
      for (let q = -3; q <= 3; q++) for (let r = -3; r <= 3; r++) {
        if (Math.abs(q + r) > 3) continue;
        const x = 2.5 + R * .62 * 1.5 * q, y = 2.5 + R * .62 * Math.sqrt(3) * (r + q / 2), k = Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r));
        const lit = k <= step;
        hex(g, x, y, R * .58, k === 0 ? '#5E8A2A' : lit ? ['', '#4A3A1E', '#5A2E1E', '#6A2228'][k] : INFECTED, k === 0 ? '#D8FF8A' : lit ? ['', '#F0A03C', '#F07A3C', '#FF6B74'][k] : null, .035);
        if (lit && k > 0) for (let e = 0; e < k; e++) circle(g, x - .12 + e * .12, y, .045, '#FF6B74');
      }
      circle(g, 2.5, 2.5, .1, LIVING);
    },
  },
};
export const conceptIds = () => Object.keys(CONCEPTS);
