// The concept cards: what a rule of the game is, shown the first time the player meets it as a small looping scene
// drawn with the game's renderer, two lines and the key figures, and replayed from the help (Concepts).
import { BASE_COUNT, BASE_WINDOW, HARVESTERS_PER_DEPOSIT, MECHANICS, SWARM, cell } from "../sim/sim.ts";
import { L } from "../sim/text.ts";
import { circle, drawCell, glyph, polygon, rect, token } from "./render.js";

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
// A piece of the factory at a scene cell's middle, drawn by the game itself.
function piece(g, x, y, type, dir = 1, extra = {}) {
  g.save(); g.translate(x, y); drawCell(g, Object.assign(cell(type, 0, 0, dir), extra)); g.restore();
}
// A creature as the map draws it: its body, its legs, its gene.
function creature(g, x, y, gene, size = 1) {
  g.save(); g.translate(x, y); g.scale(size, size);
  g.strokeStyle = '#B34A5A'; g.lineWidth = .06; g.beginPath();
  for (const dx of [-.16, 0, .16]) { g.moveTo(dx, -.24); g.lineTo(dx, .32); }
  g.stroke();
  g.beginPath(); g.ellipse(0, 0, .36, .2, 0, 0, Math.PI * 2); g.fillStyle = '#3A1820'; g.fill(); g.strokeStyle = '#FF6B6B'; g.lineWidth = .04; g.stroke();
  [...gene].forEach((b, i) => glyph(g, b, (i - 1) * .22, 0, .1));
  g.restore();
}
// A deposit cell, tinted by its matter.
const deposit = (g, x, y, base) => { rect(g, x - .46, y - .46, .92, .92, '#1E2A1A', '#36592A'); glyph(g, base, x, y, .16); };
// A gauge under the core: how much of what it asks is done.
function gauge(g, x, y, k, color) { rect(g, x - .8, y, 1.6, .14, '#1A262A'); rect(g, x - .8, y, 1.6 * ease(k), .14, color); }

export const CONCEPTS = {
  genes:{
    kicker:L('Cœur'), title:L('Gènes de base et faim'),
    lines:[L`Chaque partie tire ${BASE_COUNT} gènes de base : le cœur en mange un dès le départ, un de plus à chaque stade.`, L`Sans l’un d’eux depuis ${BASE_WINDOW} s, il a faim : ses livraisons ne comptent qu’à moitié.`],
    facts:[[String(BASE_COUNT), L('gènes de base tirés pour cette partie')], [`${BASE_WINDOW} s`, L('sans l’un d’eux, le cœur a faim')], ['½', L('ce qu’il reçoit compte à moitié tant qu’il a faim')]],
    draw(g, t) {
      // A base gene rides to the core and keeps it fed; then none comes, and the core turns hungry.
      for (const x of [.5, 1.5]) piece(g, x, 2.5, 'belt', 1);
      const fed = t < .55;
      if (fed) token(g, 'SFS', .2 + (t * 4 % 1) * 1.6, 2.5, 0);
      piece(g, 2.9, 2.5, 'core');
      const hungry = ease((t - .55) / .1), beat = .06 * Math.sin(t * Math.PI * 16);
      circle(g, 2.9, 2.5, .55 + (fed ? 0 : beat), null, fed ? LIVING : '#F0A03C', .07);
      for (const [i, gene] of ['SFS', 'FFF', 'CCF'].entries()) {
        const on = i === 0 || t > .3 + i * .1;
        g.save(); g.globalAlpha = on ? 1 : .3; token(g, gene, 1.9 + i * 1, 3.9, 0); g.restore();
      }
      gauge(g, 2.9, 1.35, fed ? t / .55 : 1 - hungry * .5, fed ? LIVING : '#F0A03C');
    },
  },
  swarm:{
    kicker:L('Défense'), title:L('Essaims et alarme'),
    lines:[L`Dès le stade 2, des essaims marchent sur la base, annoncés ${SWARM.lead} s à l’avance avec leur direction et leur antidote.`, L`Un essaim nettoyé, ${SWARM.quiet} s de calme avant l’annonce du suivant : ils grossissent avec le temps et la base.`],
    facts:[[`${SWARM.lead} s`, L('d’alarme avant chaque essaim')], [String(SWARM.first), L('créatures au premier, lentes et fragiles')], [`${SWARM.quiet} s`, L('de calme après chaque essaim nettoyé')]],
    draw(g, t) {
      // The alarm on the edge, then the swarm walks in and the turret fed with its antidote takes it down.
      if (t < .3) { const k = Math.sin(t * Math.PI * 20) > 0 ? 1 : .35; circle(g, 4.4, .6, .3, `rgba(255,107,116,${.3 * k})`, '#FF6B74', .05); }
      piece(g, 1.2, 3.8, 'core');
      piece(g, 2.2, 2.9, 'turret', 3);
      for (let i = 0; i < 3; i++) {
        const walk = ease((t - .25 - i * .04) / .45), dead = t > .6 + i * .1;
        if (t < .25 || dead) continue;
        const x = 4.4 - walk * 1.6 + i * .25, y = .7 + walk * 1.3 + (i % 2) * .3;
        creature(g, x, y, 'CCF', .8);
        if (t > .55 + i * .1) { g.beginPath(); g.moveTo(2.2, 2.9); g.lineTo(x, y); g.strokeStyle = LIVING; g.lineWidth = .05; g.stroke(); }
      }
    },
  },
  nest:{
    kicker:L('Défense'), title:L('Nids et gisements riches'),
    lines:[L('Un nid garde chaque gisement riche : il dort tant que rien n’est bâti dans son cercle.'), L('Réveillé, il envoie ses créatures ; détruit, il paie ses créatures en ADN et le terrain est à toi.')],
    facts:[['×2', L('à ×4 : le débit d’un gisement riche')], ['○', L('bâtir dans son cercle le réveille')], ['ADN', L('une par créature du nid, quand il tombe')]],
    draw(g, t) {
      const awake = t > .3, gone = ease((t - .75) / .15);
      for (const [x, y] of [[2.8, 2.6], [3.6, 2.6], [2.8, 3.4], [3.6, 3.4]]) deposit(g, x, y, 'C');
      g.save(); g.globalAlpha = 1 - gone;
      g.setLineDash([.2, .15]); circle(g, 2.2, 2.2, 2, null, awake ? '#FF6B74' : '#6B5960', .05); g.setLineDash([]);
      circle(g, 1.3, 1.3, .55 + (awake ? .06 * Math.sin(t * 40) : 0), awake ? '#3A1820' : '#2A2527', awake ? '#FF6B6B' : '#8B989C', .08);
      g.restore();
      if (t > .2) piece(g, 2.8, 2.6, 'mine', 1);
      if (awake && t < .75) creature(g, 1.3 + (t - .3) * 2.2, 1.3 + (t - .3) * 1.8, 'SFN', .7);
      if (gone) for (let i = 0; i < 5; i++) circle(g, 1.3 + Math.cos(i * 1.26) * gone * .9, 1.3 + Math.sin(i * 1.26) * gone * .9, .09, LIVING);
    },
  },
  mechanic:{
    kicker:L('Cœur'), title:L('La mécanique du stade'),
    lines:[L('Dès le stade 2, chaque stade demande aussi une mécanique : abattre, commander par nerf, tirer l’antidote, tenir un avant-poste.'), L('Le stade grandit quand ses recettes et sa mécanique sont faites : l’onglet du cœur la compte.')],
    facts:[[String(MECHANICS[1].count), L('créatures abattues au stade 2')], [String(MECHANICS[2].count), L('objets passés ou triés par un nerf au stade 3')], [String(MECHANICS[3].count), L('créatures tuées par leur antidote au stade 4')], [`${MECHANICS[4].count / 60} min`, L('d’avant-poste tenu près d’un nid au stade 5')]],
    draw(g, t) {
      // The recipes fill, then the mechanic: the core grows only once both are done.
      const recipes = ease(t / .4), mechanic = ease((t - .35) / .35), grown = ease((t - .75) / .1);
      piece(g, 2.5, 2.2, 'core');
      circle(g, 2.5, 2.2, .6 + grown * .4, null, grown ? LIVING : '#2A3C41', .08);
      gauge(g, 2.5, 3.4, recipes, OPEN);
      gauge(g, 2.5, 3.85, mechanic, LIVING);
      piece(g, .9, 3.6, 'turret', 1);
      if (t > .35 && t < .7) creature(g, .9, 4.4 - (t - .35) * 1.2, 'CCF', .6);
    },
  },
  cap:{
    kicker:L('Récolte'), title:L('Gisement plein'),
    lines:[L`Un gisement nourrit ${HARVESTERS_PER_DEPOSIT} récolteurs au plus : le suivant est refusé.`, L('Pour tirer plus, passe-les en MK2 ou MK3, ou partage la sortie de l’un d’eux avec un diviseur.')],
    facts:[[String(HARVESTERS_PER_DEPOSIT), L('récolteurs au plus par gisement')], ['MK2', L('plus de débit sans récolteur de plus')], ['✕', L('le suivant ne se pose pas')]],
    draw(g, t) {
      const spots = [[1.5, 1.5], [2.5, 1.5], [1.5, 2.5], [2.5, 2.5]];
      for (const [x, y] of spots) deposit(g, x, y, 'S');
      spots.forEach(([x, y], i) => {
        if (t < .1 + i * .18) return;
        if (i < HARVESTERS_PER_DEPOSIT) { piece(g, x, y, 'mine', 1); return; }
        // The one too many: a ghost, crossed out.
        g.save(); g.globalAlpha = .45; piece(g, x, y, 'mine', 1); g.restore();
        g.beginPath(); g.moveTo(x - .35, y - .35); g.lineTo(x + .35, y + .35); g.moveTo(x + .35, y - .35); g.lineTo(x - .35, y + .35);
        g.strokeStyle = '#FF6B74'; g.lineWidth = .09; g.stroke();
      });
      if (t > .1) token(g, 'S', 3.3 + (t * 3 % 1) * 1.2, 1.5, 0);
    },
  },
  pack:{
    kicker:L('Usine'), title:L('Encapsuleur mal réglé'),
    lines:[L('Un encapsuleur réglé sur une boîte que le cœur ne demande pas travaille pour rien : il passe en rouge.'), L('Touche-le et change sa recette, capsule ou chargeur, pour la boîte que la recette demande.')],
    facts:[['✕', L('la mauvaise boîte ne compte pas au cœur')], ['✓', L('capsule pour le cœur, chargeur pour les tourelles')], ['!', L('la fiche du cœur montre la machine fautive en rouge')]],
    draw(g, t) {
      // Set wrong, its boxes go nowhere and it glows red; switched, the right box rides to the core.
      const right = t > .5;
      for (const x of [.5, 1.5]) piece(g, x, 2.5, 'belt', 1);
      for (const x of [3.5]) piece(g, x, 2.5, 'belt', 1);
      piece(g, 2.5, 2.5, 'pack', 1, {box:right ? 'T' : 'A'});
      piece(g, 4.5, 2.5, 'core');
      token(g, 'SFS', .2 + (t * 4 % 1) * 1.8, 2.5, 0);
      if (!right) circle(g, 2.5, 2.5, .62 + .05 * Math.sin(t * 40), null, '#FF6B74', .08);
      else token(g, 'T:SFS', 3.1 + ((t - .5) * 4 % 1) * 1, 2.5, 0);
    },
  },
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
  region:{
    kicker:L('Planète'), title:L('Grande victoire'),
    lines:[L('Purifie une région entière : un hexagone et tous ses voisins.'), L('C’est la grande victoire ; la planète continue ensuite.')],
    facts:[['7', L('hexagones dans une région (6 autour d’un pentagone)')], ['✓', L('les hexagones marqués sont ceux qui manquent')], ['∞', L('le mode libre ne peut ni la donner ni la reprendre')]],
    draw(g, t) {
      // The six around light up one after another, then the whole region glows.
      const lit = Math.floor(ease(t / .7) * 6.999);
      for (const [i, [x, y]] of AROUND.entries()) {
        const on = i < lit;
        hex(g, x, y, R * .96, on ? '#5E8A2A' : INFECTED, on ? '#D8FF8A' : LIVING, on ? .05 : .04, on ? null : [.1, .07]);
      }
      hex(g, 2.5, 2.5, R * .96, '#5E8A2A', '#D8FF8A', .05);
      if (t > .72) circle(g, 2.5, 2.5, R * 2.2 + (t - .72) * 1.2, null, `rgba(183,243,74,${Math.max(0, .8 - (t - .72) * 3)})`, .08);
      circle(g, 2.5, 2.5, .16, LIVING);
    },
  },
};
export const conceptIds = () => Object.keys(CONCEPTS);
