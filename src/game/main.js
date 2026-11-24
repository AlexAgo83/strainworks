import { LANG_SET } from "./lang.js";
import { hooks } from "../sim/hooks.ts";
import { eaten, harvestersOn, hungryFor, BASE, BIG, BORER, BOX, CALM, CORE, DEPOSIT, DESK, DRONE, DX, DY, FIELDS, G, GLUE, GUNS, GUN_RANK, H, NERVE, NORTH, OUTER, PACK, PRICE, RADAR, RANKS, REAPER, RICH, SIGHT, STAGES, START_DRONES_OF, STEP, TRAITS, TYPES, VEIN, W, WORM, accepts, ahead, allCells, armReach, asked, at, boxOf, built, buried, capOf, carbonSide, carries, cell, cellAt, centreOf, connects, contentOf, coreCell, coreWants, corpseSunk, covering, damage, depositAt, digest, drains, drawGoals, dropRise, eachSector, earn, eat, edgesOf, exitOf, fill, fire, fits, flow, follows, footprint, forgetCells, fresh, fullHp, gateOpen, glueOver, grow, hasTrait, hatchDrones, heardOf, holdCap, hungry, inSight, isBelt, isBig, isGun, isSplit, joinSide, key, labLevel, leaking, lift, listens, live, look, makePatch, matterUnder, mealRate, menace, minable, mutation, mutationTarget, nearest, nest, nestBy, netOf, network, opposite, outSide, owned, paceOf, packTakes, passingBy, patchOf, patches, perSecond, perch, pocketCap, puff, pulse, pumps, put, rankCost, rankOf, reachOf, receive, refund, remove, repair, richAt, richness, sector, sectors, sense, setRecipe, sideExit, sight, simSet, sites, sizeOf, span, spawn, splitExits, spotHash, stamp, stationHead, step, survey, tierAt, trackAfter, trackSize, unlocked, wake, waveGene, wayOf, workAt, workTime } from "../sim/sim.ts";
import { L, LANG, LOCALE } from "../sim/text.ts";
import { actionsSet, packWarning, breachesIn, build, buyLab, creatureAt, diagnose, dronePose, feeders, fieldsIn, incubate, keepIt, known, layTrack, link, netSummary, netWires, portSide, radarWave, raise, rankFollowers, recipe, rowOf, scrap, scrapVein, setHeading, shownNests, siteFor, stagePart, wireUp } from "./actions.js";
import { audioSet, keepMusic, keepSfx, musicTick, paintMusic, paintPlaylist, paintSfx, placeOf, playSound, setLang, shuffleMusic, startSound } from "./audio.js";
import { addPip, problems, animateHud, drawFog, foldSide, forgetEvent, forgetEvents, guideLigase, hudSet, layoutHud, menuPage, openFamily, paint, paintDrones, paintGuide, paintHud, paintInfo, paintMoments, paintSheet, paintStats, placeGuideSpot, refuse, replay, sceneSigns, setMotion, showIntro, showMenu, showStats, spark, startGuide, stopReason, tell, toggleFamily, travelTo } from "./hud.js";
import { cardTypes, closeCard, paintCardList, showCard } from "./unlock.js";
import { mirror, button, choose, drawPorts, drawPreview, extend, flipCorner, holdToDismantle, inputSet, joinVein, place, portsOf, position, preview, refresh, release, say, sayPath, screenPoint, select, showActions, stockOf, stopHold, stretch, turnWay, wipe, wormState, write } from "./input.js";
import { glide, keysSet, loadKeys, paintKeys, pipette } from "./keys.js";
import { frame, labSet, startLab } from "./lab.js";
import { askCurve, drawPlanet, goldberg, hexAt, keepForReload, leavePlanet, noteOnPlanet, onScreen, openPlanet, perfReset, pickHex, planetSet, playPicked, projectSlot, resumeLast, setCurve, setQuality, showPerf, takeFile, timed, turn, watchCurve } from "./planet.js";
import { along, arrow, circle, crate, draw, drawCell, glyph, home, lamp, marker, pan, passing, reading, rect, renderSet, resize, worldAt, zoomAt } from "./render.js";
import { checkGame, findGames, foundGame, freeHex, keep, openGame, openSlot, parsed, planetList, readList, save, savesSet, stored } from "./saves.js";
import { begin, chooseView, growDock, hold, jobDone, letGo, load, markView, noteEarned, onFresh, rotate, script, spacePauses, testLine, viewSet, wormGone } from "./view.js";

import "./actions.js";
import "./render.js";
import "./input.js";
import "./keys.js";
import "./view.js";
import "./hud.js";
import "./saves.js";
import "./planet.js";
import "./audio.js";
import "./lab.js";

// The bindings other modules replace.
export const mainSet = {
  heading: (v) => (heading = v),
  chain: (v) => (chain = v),
  view: (v) => (view = v),
  note: (v) => (note = v),
  wormId: (v) => (wormId = v),
  linking: (v) => (linking = v),
  listening: (v) => (listening = v),
  selected: (v) => (selected = v),
  tool: (v) => (tool = v),
  wiring: (v) => (wiring = v),
  drag: (v) => (drag = v),
  cursor: (v) => (cursor = v),
  gesture: (v) => (gesture = v),
  KEYS: (v) => (KEYS = v),
  switching: (v) => (switching = v),
  made3d: (v) => (made3d = v),
  view3d: (v) => (view3d = v),
  held: (v) => (held = v),
  armed: (v) => (armed = v),
  repaid: (v) => (repaid = v),
  paused: (v) => (paused = v),
  fogFor: (v) => (fogFor = v),
  demoMoved: (v) => (demoMoved = v),
  saveFailed: (v) => (saveFailed = v),
  slotSaved: (v) => (slotSaved = v),
  slotId: (v) => (slotId = v),
  slotKey: (v) => (slotKey = v),
  slotName: (v) => (slotName = v),
  owed: (v) => (owed = v),
  hovered: (v) => (hovered = v),
  downloads: (v) => (downloads = v),
  labTake: (v) => (labTake = v),
  before: (v) => (before = v),
  planetOwed: (v) => (planetOwed = v),
  drawnAt: (v) => (drawnAt = v),
  shownAt: (v) => (shownAt = v),
  savedAt: (v) => (savedAt = v)
};

// The window API: every name the browser tests, the build scripts and the other page scripts reach, read live,
// and written through where the binding is not a constant, as when this was one classic script. Set up first:
// the game calls page hooks such as a test's startLine while it loads.
const WINDOW_API = {
  $: [() => $],
  BASE: [() => BASE],
  BIG: [() => BIG],
  BORER: [() => BORER],
  BOX: [() => BOX],
  CALM: [() => CALM],
  CELLS_OF_GLOBE: [() => CELLS_OF_GLOBE],
  CORE: [() => CORE],
  DEMO_HEX: [() => DEMO_HEX],
  DEPOSIT: [() => DEPOSIT, v => { simSet.DEPOSIT(v); }],
  DESK: [() => DESK],
  DRONE: [() => DRONE],
  DX: [() => DX],
  DY: [() => DY],
  FAMILIES: [() => FAMILIES],
  FAMILY_OF: [() => FAMILY_OF],
  FIELDS: [() => FIELDS, v => { simSet.FIELDS(v); }],
  G: [() => G, v => { simSet.G(v); }],
  GAME_KEY: [() => GAME_KEY],
  GLUE: [() => GLUE],
  GUIDE: [() => GUIDE],
  DEFENSE_GUIDE: [() => DEFENSE_GUIDE],
  GUNS: [() => GUNS],
  GUN_RANK: [() => GUN_RANK],
  H: [() => H],
  KEYS: [() => KEYS, v => { KEYS = v; }],
  L: [() => L],
  LAB: [() => LAB],
  LAB_FILES: [() => LAB_FILES],
  LANG: [() => LANG],
  MOST_DRONES: [() => MOST_DRONES],
  MUSIC: [() => MUSIC],
  NEEDS: [() => NEEDS],
  NERVE: [() => NERVE],
  NERVE_COLORS: [() => NERVE_COLORS],
  OUTER: [() => OUTER],
  PACK: [() => PACK],
  PERF: [() => PERF],
  RADAR: [() => RADAR],
  RANKS: [() => RANKS],
  RANK_NEED: [() => RANK_NEED],
  REAPER: [() => REAPER],
  RICH: [() => RICH, v => { simSet.RICH(v); }],
  SAVE: [() => SAVE],
  SIGHT: [() => SIGHT],
  STAGES: [() => STAGES],
  STEP: [() => STEP],
  STILL: [() => STILL],
  TOOLBAR: [() => TOOLBAR],
  TRAITS: [() => TRAITS],
  TYPES: [() => TYPES],
  VEIN: [() => VEIN],
  W: [() => W],
  WORM: [() => WORM],
  accepts: [() => accepts],
  ahead: [() => ahead],
  allCells: [() => allCells],
  along: [() => along],
  armReach: [() => armReach],
  armed: [() => armed, v => { armed = v; }],
  arrow: [() => arrow],
  arrows: [() => arrows],
  asked: [() => asked],
  at: [() => at],
  before: [() => before, v => { before = v; }],
  begin: [() => begin],
  boxOf: [() => boxOf],
  breachesIn: [() => breachesIn],
  build: [() => build],
  buildable: [() => buildable],
  built: [() => built],
  buried: [() => buried],
  button: [() => button],
  buyLab: [() => buyLab],
  cam: [() => cam],
  canvas: [() => canvas],
  capOf: [() => capOf],
  carbonSide: [() => carbonSide],
  carries: [() => carries],
  cell: [() => cell],
  cellAt: [() => cellAt],
  centreOf: [() => centreOf],
  chain: [() => chain, v => { chain = v; }],
  checkGame: [() => checkGame],
  choose: [() => choose],
  circle: [() => circle],
  connects: [() => connects],
  contentOf: [() => contentOf],
  coreCell: [() => coreCell],
  coreWants: [() => coreWants],
  corpseSunk: [() => corpseSunk],
  crate: [() => crate],
  creatureAt: [() => creatureAt],
  crossing: [() => crossing],
  ctx: [() => ctx],
  cursor: [() => cursor, v => { cursor = v; }],
  damage: [() => damage],
  depositAt: [() => depositAt],
  diagnose: [() => diagnose],
  packWarning: [() => packWarning],
  showCard: [() => showCard],
  closeCard: [() => closeCard],
  CARD_TYPES: [() => cardTypes()],
  problems: [() => problems],
  stopReason: [() => stopReason],
  digest: [() => digest],
  drag: [() => drag, v => { drag = v; }],
  drains: [() => drains],
  draw: [() => draw],
  drawCell: [() => drawCell],
  drawFog: [() => drawFog],
  drawGoals: [() => drawGoals],
  drawPlanet: [() => drawPlanet],
  drawPorts: [() => drawPorts],
  drawPreview: [() => drawPreview],
  dronePose: [() => dronePose],
  dropRise: [() => dropRise],
  eachSector: [() => eachSector],
  earn: [() => earn],
  eat: [() => eat],
  edgesOf: [() => edgesOf],
  exitOf: [() => exitOf],
  extend: [() => extend],
  feeders: [() => feeders],
  fieldsIn: [() => fieldsIn],
  fill: [() => fill],
  fire: [() => fire],
  fits: [() => fits],
  flat: [() => flat],
  flinchOf: [() => flinchOf],
  flipCorner: [() => flipCorner],
  flow: [() => flow],
  follows: [() => follows],
  footprint: [() => footprint],
  forgetCells: [() => forgetCells],
  formOf: [() => formOf],
  foundGame: [() => foundGame],
  fr: [() => fr],
  frame: [() => frame],
  freeHex: [() => freeHex],
  fresh: [() => fresh],
  fullHp: [() => fullHp],
  fx: [() => fx],
  gateGreen: [() => gateGreen],
  gesture: [() => gesture, v => { gesture = v; }],
  glide: [() => glide],
  glueOver: [() => glueOver],
  glyph: [() => glyph],
  grow: [() => grow],
  guideLigase: [() => guideLigase],
  handRank: [() => handRank],
  hasTrait: [() => hasTrait],
  hatchDrones: [() => hatchDrones],
  heading: [() => heading, v => { heading = v; }],
  heard: [() => heard],
  heardOf: [() => heardOf],
  held: [() => held, v => { held = v; }],
  hexAt: [() => hexAt],
  hold: [() => hold],
  holdCap: [() => holdCap],
  holdsAnything: [() => holdsAnything],
  home: [() => home],
  hovered: [() => hovered, v => { hovered = v; }],
  hungry: [() => hungry],
  inHand: [() => inHand],
  inSight: [() => inSight],
  incubate: [() => incubate],
  inside: [() => inside],
  intro: [() => intro],
  isBelt: [() => isBelt],
  isBig: [() => isBig],
  isGun: [() => isGun],
  isSplit: [() => isSplit],
  joinSide: [() => joinSide],
  joinVein: [() => joinVein],
  keep: [() => keep],
  keepIt: [() => keepIt],
  key: [() => key],
  known: [() => known, v => { actionsSet.known(v); }],
  lamp: [() => lamp],
  layTrack: [() => layTrack],
  leaking: [() => leaking],
  levelOf: [() => levelOf],
  lift: [() => lift],
  link: [() => link],
  linking: [() => linking, v => { linking = v; }],
  listening: [() => listening, v => { listening = v; }],
  listens: [() => listens],
  live: [() => live, v => { simSet.live(v); }],
  load: [() => load],
  loadDemo: [() => loadDemo],
  look: [() => look],
  makePatch: [() => makePatch],
  marker: [() => marker],
  matterUnder: [() => matterUnder],
  mealRate: [() => mealRate],
  menace: [() => menace],
  menuPage: [() => menuPage],
  minable: [() => minable],
  motionTime: [() => motionTime],
  music: [() => music],
  musicTick: [() => musicTick],
  mutation: [() => mutation],
  mutationTarget: [() => mutationTarget],
  named: [() => named],
  nearest: [() => nearest],
  nest: [() => nest],
  nestHurt: [() => nestHurt],
  netOf: [() => netOf],
  netSummary: [() => netSummary],
  netWires: [() => netWires],
  network: [() => network],
  note: [() => note, v => { note = v; }],
  noteOnPlanet: [() => noteOnPlanet],
  onScreen: [() => onScreen],
  openFamily: [() => openFamily],
  openGame: [() => openGame],
  openSlot: [() => openSlot],
  opposite: [() => opposite],
  orbit: [() => orbit],
  outSide: [() => outSide],
  owed: [() => owed, v => { owed = v; }],
  owned: [() => owned],
  paceOf: [() => paceOf],
  packTakes: [() => packTakes],
  paint: [() => paint],
  paintDrones: [() => paintDrones],
  paintGuide: [() => paintGuide],
  paintHud: [() => paintHud],
  paintInfo: [() => paintInfo],
  paintMoments: [() => paintMoments],
  pan: [() => pan],
  parsed: [() => parsed],
  passing: [() => passing],
  passingBy: [() => passingBy, v => { simSet.passingBy(v); }],
  patchOf: [() => patchOf],
  harvestersOn: [() => harvestersOn],
  patches: [() => patches, v => { simSet.patches(v); }],
  paused: [() => paused, v => { paused = v; }],
  perSecond: [() => perSecond],
  perch: [() => perch],
  pickHex: [() => pickHex],
  place: [() => place],
  placeGuideSpot: [() => placeGuideSpot],
  placeOf: [() => placeOf],
  placeable: [() => placeable],
  planetList: [() => planetList],
  playSound: [() => playSound],
  pocketCap: [() => pocketCap],
  portSide: [() => portSide],
  portsOf: [() => portsOf],
  position: [() => position],
  preview: [() => preview],
  price: [() => price],
  puff: [() => puff],
  pulse: [() => pulse],
  put: [() => put],
  radarWave: [() => radarWave],
  raise: [() => raise],
  rankCost: [() => rankCost],
  rankFollowers: [() => rankFollowers],
  rankOf: [() => rankOf],
  reachOf: [() => reachOf],
  readList: [() => readList],
  reading: [() => reading],
  receive: [() => receive],
  recipe: [() => recipe],
  rect: [() => rect],
  refresh: [() => refresh],
  refund: [() => refund],
  refuse: [() => refuse],
  release: [() => release],
  remove: [() => remove],
  repair: [() => repair],
  replay: [() => replay],
  resize: [() => resize],
  resumeLast: [() => resumeLast],
  richAt: [() => richAt],
  richness: [() => richness],
  rotate: [() => rotate],
  rowOf: [() => rowOf],
  ruinAt: [() => ruinAt],
  save: [() => save, v => { savesSet.save(v); }],
  say: [() => say],
  sceneSigns: [() => sceneSigns],
  scrap: [() => scrap],
  scrapVein: [() => scrapVein],
  screenAt: [() => screenAt],
  script: [() => script],
  sector: [() => sector],
  sectors: [() => sectors, v => { simSet.sectors(v); }],
  select: [() => select],
  selected: [() => selected, v => { selected = v; }],
  sense: [() => sense],
  setRecipe: [() => setRecipe],
  sfx: [() => sfx],
  showActions: [() => showActions],
  showIntro: [() => showIntro],
  showMenu: [() => showMenu],
  showStats: [() => showStats],
  shownAt: [() => shownAt, v => { shownAt = v; }],
  shownNests: [() => shownNests],
  sideExit: [() => sideExit],
  sight: [() => sight],
  siteFor: [() => siteFor],
  sites: [() => sites],
  sizeOf: [() => sizeOf],
  slotKey: [() => slotKey, v => { slotKey = v; }],
  span: [() => span],
  spark: [() => spark],
  spawn: [() => spawn],
  speed: [() => speed, v => { speed = v; }],
  sound: [() => sound],
  eaten: [() => eaten],
  paintSheet: [() => paintSheet],
  hungryFor: [() => hungryFor],
  splitExits: [() => splitExits],
  stagePart: [() => stagePart],
  stamp: [() => stamp],
  startGuide: [() => startGuide],
  station3d: [() => station3d],
  stationHead: [() => stationHead],
  step: [() => step],
  stockOf: [() => stockOf],
  stored: [() => stored],
  stretch: [() => stretch],
  survey: [() => survey],
  tell: [() => tell],
  watchCurve: [() => watchCurve],
  askCurve: [() => askCurve],
  setCurve: [() => setCurve],
  tierAt: [() => tierAt],
  tileCentre: [() => tileCentre],
  timed: [() => timed],
  toggleFamily: [() => toggleFamily],
  tool: [() => tool, v => { tool = v; }],
  trackAfter: [() => trackAfter],
  trackAt: [() => trackAt],
  trackSize: [() => trackSize],
  turn: [() => turn],
  turnWay: [() => turnWay],
  ui: [() => ui],
  unlocked: [() => unlocked],
  view: [() => view, v => { view = v; }],
  view3d: [() => view3d, v => { view3d = v; }],
  wake: [() => wake],
  waveGene: [() => waveGene],
  wayOf: [() => wayOf],
  wipe: [() => wipe],
  wireUp: [() => wireUp],
  wiring: [() => wiring, v => { wiring = v; }],
  within: [() => within],
  workAt: [() => workAt],
  worldAt: [() => worldAt],
  wormId: [() => wormId, v => { wormId = v; }],
  wormState: [() => wormState],
  woven: [() => woven],
  write: [() => write]
};
for (const [name, [get, set]] of Object.entries(WINDOW_API)) Object.defineProperty(globalThis, name, {get, set, configurable:true});
// The simulation's hooks, each calling the interface's function of that name when it is called.
// @ts-expect-error: loose typing, tightened module by module (item_007)
Object.assign(hooks, {noteEarned: (...a) => noteEarned(...a), forgetEvent: (...a) => forgetEvent(...a), onFresh: (...a) => onFresh(...a), testLine: (...a) => testLine(...a), jobDone: (...a) => jobDone(...a), wormGone: (...a) => wormGone(...a), say: (...a) => say(...a), refuse: (...a) => refuse(...a), playNear: (...a) => playNear(...a), playSound: (...a) => playSound(...a), refresh: (...a) => refresh(...a), tell: (...a) => tell(...a), showActions: (...a) => showActions(...a), select: (...a) => select(...a), diagnose: (...a) => diagnose(...a), save: (...a) => save(...a), setHeading: (...a) => setHeading(...a), heard: (...a) => heard(...a), placeOf: (...a) => placeOf(...a), drawsRecipes: (...a) => drawsRecipes(...a), stored: (...a) => stored(...a)});

// ---- Languages: the text and its language live in src/sim/text.ts, the choice in lang.js.
// The lab (?lab): every 3D model on clean ground, its state shown and edited. A dev page, in English.
export const LAB = {on:new URLSearchParams(location.search).has('lab')};
// The lab is not played: no game shortcut takes a key from its fields. Caught on window, before every listener of the game.
if (LAB.on) for (const kind of ['keydown', 'keyup']) window.addEventListener(kind, event => event.stopImmediatePropagation(), true);
// The markup is written in French too.
if (LANG === 'en') {
  document.documentElement.lang = 'en';
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n; (n = walker.nextNode());) {
    const text = n.nodeValue.trim();
    if (text && EN[text] != null && n.parentNode.nodeName !== 'STYLE') n.nodeValue = n.nodeValue.replace(text, EN[text]);
  }
  for (const a of ['title', 'aria-label', 'placeholder', 'alt'])
    for (const el of document.querySelectorAll(`[${a}]`)) if (EN[el.getAttribute(a)] != null) el.setAttribute(a, EN[el.getAttribute(a)]);
}
export const LIMIT = 1e5;
export const GENES = {SFS:L('Moteur'), FFF:L('Soute'), FSF:L('Bouche'), SSS:L('Racine'), CCF:L('Carapace'), CFC:L('Dard'), CCC:L('Lame'), CSC:L('Acide'), NFN:L('Œil'), SSN:L('Soin'), NSN:L('Flair'), FNF:L('Pulsation'), NNN:L('Mémoire'), NCN:L('Commande'), CNS:L('Mutation'), SNS:L('Instinct')};
export const ruinAt = (x, y) => covering(G.ruins, x, y);
export const NEEDS = {desk:2, reaper:5, unbind:5, unjoin:4, glue:1, mist:3, harpoon:4, arm:1, screen:2, flip:1, unpack:1, relay:2, radar:2, split:1, sort:1, pack:1, borer:2, vault:2, pump:4, join:2, wire:2, track:3, pocket:3, worm:3};
// What lay there before the map breathed, to tell what an older game's harvesters stand on.
export const CROWDED = [
  ...OUTER, ['S',34,44,4,3], ['F',28,52,3,4], ['F',41,67,4,3], ['S',66,50,3,4], ['C',20,42,5,5], ['N',74,42,5,5],
  ['S',23,66,6,4], ['F',67,66,6,4], ['N',40,12,5,4], ['S',6,50,5,6], ['F',85,52,5,6]
];
// A game saved with more loses those still asleep. One that woke finishes its fight.
export const inLayout = b => Boolean(b.id) || [NORTH[0], ...OUTER.map(nestBy)].some(spot => spot && spot.x === b.x && spot.y === b.y);
export const levelOf = b => (b.tier || 0) + 1;
export const formOf = b => b.form ?? Math.floor(spotHash(b.x, b.y, 30) * 4);
export const whyNot = (x, y) => !known(x, y) ? L('Zone inconnue : approche tes structures') : !buildable(x, y) ? L('Zone de ruche') : '';
export const placeable = (x, y) => !whyNot(x, y);

export let wormId = null;
// The way the next piece faces is the player's, kept from one piece, one game and one visit to the next.
export const HEADING_KEY = 'strainworks-heading';
export const WAYS = [L('haut'), L('droite'), L('bas'), L('gauche')];
export let heading = 0;
try { heading = [0, 1, 2, 3].find(d => String(d) === localStorage.getItem(HEADING_KEY)) ?? 0; } catch (_) { /* blocked storage or an unreadable value: the default stays */ }
export let tool = 'hand', selected = null, chain = [], paused = false, speed = 1, note = '';

/** @type {(id: string) => any} */
export const $ = id => document.getElementById(id);
export const buildable = (x, y) => inside(x, y) && !breachesIn(x, y, x, y).some(h => h.state !== 'spent' && Math.hypot(x - h.x, y - h.y) < 3.5);
export const inside = (x, y) => Math.abs(x) < LIMIT && Math.abs(y) < LIMIT;
export const MATTER = {...BASE, K:L('Carbone'), I:L('Isotope')};
// A base in a sentence has its name and its drawing.
export const named = base => MATTER[base] ? `${MATTER[base].toLowerCase()} ${base}` : 'rien';
export const geneName = gene => GENES[gene] ? `${GENES[gene]} (${gene})` : gene;
export const price = type => PRICE[type] ? PRICE[type](owned(type)) : 0;
export const MOST_DRONES = 6;
export const UPGRADES = {
  drones:{cat:'drones', name:L('Drones'), what:L('Un drone de plus pour bâtir et réparer'), prices:[60, 150, 300, 600], stages:[1, 2, 4, 5]},
  speed:{cat:'drones', name:L('Vitesse des drones'), what:L('+20 % par niveau'), prices:[80, 200, 400], stages:[1, 3, 5]},
  repair:{cat:'drones', name:L('Réparation'), what:L('Les bâtiments se réparent 30 % plus vite par niveau'), prices:[70, 180, 360], stages:[2, 3, 5]},
  reach:{cat:'defense', name:L('Portée des défenses'), what:L('+10 % de portée par niveau'), prices:[120, 280, 520], stages:[3, 4, 6]},
  holds:{cat:'logistics', name:L('Soutes des vers'), what:L('Une soute de plus par ver, jusqu’à 5'), prices:[300, 600], stages:[5, 5]},
  copy:{cat:'recycler', name:L('Réplication'), what:L('Le Recycleur recopie plus souvent le gène : 65 %, 80 %, puis toujours'), prices:[250, 500, 1000], stages:[6, 6, 6]},
  pull:{cat:'recycler', name:L('Aspiration'), what:L('Le rayon du Recycleur porte 2 cases plus loin par niveau'), prices:[150, 350, 700], stages:[6, 6, 6]},
  sight:{cat:'defense', name:L('Vision'), what:L('Le brouillard se lève 25 % plus loin par niveau'), prices:[50, 120, 240], stages:[1, 2, 4]}
};
// The lab's tabs, in order: a new upgrade names its tab with cat, a new tab is one line here.
export const LAB_TABS = {drones:L('Drones'), defense:L('Défense'), logistics:L('Logistique'), recycler:L('Recycleur')};
// Drones bought: a game from before counts the ones it already had.
export const dronesBought = () => Math.max(0, (G.drones?.length || START_DRONES_OF()) - START_DRONES_OF());
export const labNext = id => id === 'drones' ? dronesBought() : labLevel(id);
// Three ranks of belts and harvesters, paid in ADN: a rank is earned, not given. cost is from the first rank, time is a drone's.
// MK2 opens with the second stage, MK3 with the fourth (the stage to complete first, as NEEDS counts).
export const RANK_NEED = [0, 1, 4];
export const rankOpen = mk => unlocked(RANK_NEED[mk - 1]);
export const upCost = (c, mk) => rankCost(c.type, mk) - rankCost(c.type, rankOf(c));
export const canRise = (c, mk) => Boolean(RANKS[c.type]) && c.up == null && c.out == null && rankOf(c) < mk && rankOpen(mk);
// How much of it stands: grows while it is built, shrinks while it is taken down.
export const woven = c => Math.max(0, Math.min(1, c.cut ? c.out / workTime(c) : 1 - (c.left || 0) / workTime(c)));
// Every gain of ADN, by source: fractions wait in G.dnaBits until they make a whole one.
export const EARN = {core:L('Surplus du cœur'), kills:L('Combats'), breaches:L('Brèches vidées'), stage:L('Stades'), guide:L('Guide')};
export const RECIPES_KEY = 'strainworks-recipes';
export const drawsRecipes = () => stored(RECIPES_KEY) !== 'fixed';
export const tileAt = (x, y) => { const s = trackSize(); return {x:x - ((x % s) + s) % s, y:y - ((y % s) + s) % s}; };
export const tileKey = (x, y) => { const p = tileAt(x, y); return key(p.x, p.y); };
export const trackAt = (x, y) => G.tracks[tileKey(x, y)];
export const tileCentre = id => id.split(',').map(n => Number(n) + trackSize() / 2);
// A pocket touching a track on any side of its footprint.
export const touchesTrack = c => footprint(c).some(p => [0, 1, 2, 3].some(d => trackAt(p.x + DX[d], p.y + DY[d])));
export let wiring = null;
// The colours a nerve network can wear: the 3D paint and the 2D stroke.
export const NERVE_COLORS = [
  {paint:'N', hex:'#2E7F91', name:L('bleu')}, {paint:'acid', hex:'#7FBF3A', name:L('vert')}, {paint:'amber', hex:'#F0A03C', name:L('orange')},
  {paint:'pink', hex:'#E8738A', name:L('rose')}, {paint:'I', hex:'#9B4DE0', name:L('violet')}, {paint:'pale', hex:'#BFEFF5', name:L('blanc')}
];
export const isSource = c => Boolean(c) && (isGun(c) || hasTrait(c.type, 'source'));
export const DESK_NAMES = {most:L('le plus nombreux'), near:L('le plus proche'), cycle:L('chacun son tour'), hand:L('à la main')};
// What a gate shows: green when something may pass.
export const gateGreen = c => !listens(c) ? c.open : c.when && c.when !== 'gene' ? gateOpen(c) : Boolean(heardOf(c)?.focus);
export const BATCHES = [0, 5, 10, 20, 50];
export const MAX_FAMILIES = 8;
export const flinchOf = e => Math.max(0, 1 - (G.time + owed - (e.hitAt ?? -9)) / .25);
export const nestHurt = b => Math.max(0, 1 - (G.time + owed - (b.hitAt ?? -9)) / .35);

// Drawing and camera: cam is the world point at the middle of the canvas, zoom is pixels per cell.
export const canvas = $('game'), ctx = canvas.getContext('2d');
export const cam = {x:0, y:0, zoom:26};
export let view = {w:1, h:1, dpr:1};
// The 3D camera is tilted, which only flattens y: everything else is shared with the 2D view.
export let view3d = null;
export const flat = () => view3d ? view3d.tilt : 1;

// Interface
export const SHAPE = {
  S:'<circle cx="9" cy="9" r="7" fill="#6DAA38" stroke="#C9F77A" stroke-width="2"/>',
  F:'<rect x="1.5" y="5" width="15" height="8" rx="4" fill="#B86B1E" stroke="#FFC06B" stroke-width="2"/>',
  C:'<path d="M2 9L13 2L16 9L13 16Z" fill="#B9AA8C" stroke="#FFF3D9" stroke-width="2"/>',
  K:'<path d="M9 1.5L15.5 5.2V12.8L9 16.5L2.5 12.8V5.2Z" fill="#23282C" stroke="#AEB9BF" stroke-width="2"/>',
  I:'<path d="M9 1.5L15 9L9 16.5L3 9Z" fill="#3A1D4A" stroke="#D08CFF" stroke-width="2"/><circle cx="9" cy="6.5" r="1.6" fill="#F1D6FF"/>',
  N:'<path d="M2 9H16M5.5 3L12.5 15M12.5 3L5.5 15" stroke="#55D6E8" stroke-width="2.5"/><circle cx="9" cy="9" r="3" fill="#D5FAFF"/>'
};
// A code (SFS, C?F, SFSFFF, or a lone base) is never read as letters. C’est, MK2 and words are left alone.
export const CODE = /(?<![\p{L}\p{N}_?’'])([SFCNK?]{6}|[SFCNK?]{3}|[SFCNK])(?![\p{L}\p{N}_?’'])/gu;
export const piecesOf = text => String(text).split(CODE).map((part, i) => ({part, code:i % 2 === 1}));
export const JOKER = '<svg viewBox="0 0 18 18"><circle cx="9" cy="9" r="6" fill="none" stroke="#A9BDB8" stroke-width="2" stroke-dasharray="3 2.5"/></svg>';
// One sign per kind of action, the words stay beside it.
export const ICONS = [
  [/^(Démonter|Retirer|Couper)/, '<path d="M4 4l10 10M14 4L4 14"/>'],
  [/^(Annuler|Garder)/, '<path d="M7 3L3 7l4 4M3 7h8a4 4 0 0 1 0 8H7"/>'],
  [/^(Tourner|Sens|Voie|Sort )/, '<path d="M15 9a6 6 0 1 1-2-4.5M13 1v4H9"/>'],
  [/^Vider/, '<path d="M9 2v9M5 7l4 4 4-4M3 16h12"/>'],
  [/^Recette/, '<path d="M3 2h12l2 5v6l-2 3H3l-2-3V7z"/>'],
  [/^Carbone/, '<path d="M5 2h8l4 7-4 7H5L1 9z"/>'],
  [/^Inverser/, '<path d="M2 6h13l-3-3M16 12H3l3 3"/>'],
  [/^Tir /, '<circle cx="9" cy="9" r="6"/><path d="M9 1v5M9 12v5M1 9h5M12 9h5"/>'],
  [/^Tirer/, '<path d="M2 14C7 14 5 4 10 4h6M13 1l3 3-3 3"/>'],
  [/^(Lit|Si coupé)/, '<path d="M1 9q8-10 16 0-8 10-16 0z"/><circle cx="9" cy="9" r="2"/>'],
  [/^(Passer|Ligne)/, '<path d="M4 9l5-5 5 5M4 14l5-5 5 5"/>'],
  [/^(Partir|Départ|Poche)/, '<path d="M4 3l11 6-11 6z"/>'],
  [/^Réveiller/, '<path d="M1 10h4l2-6 4 11 2-5h4"/>'],
  [/./, '<circle cx="9" cy="9" r="5"/>']
];
// What a machine holds, wherever it keeps it: an item on its way, a stock, its inputs, its ammunition, a bridge's lanes.
export const holdsAnything = c => Boolean(c.item || c.stock?.length || c.ports?.some(p => p.length) || Object.values(c.ammo || {}).some(n => n > 0) || c.lanes?.some(Boolean) || c.outs?.some(Boolean) || c.packets?.length);
export const handRank = {};
export const inHand = type => RANKS[type] && rankOpen(handRank[type] || 1) ? handRank[type] || 1 : 1;
export const costInHand = type => price(type) + rankCost(type, inHand(type));

export let drag = null, linking = null, listening = null;
// Belts, trails and dismantling are drawn first: the line is only a path, shown as a ghost, built when let go.
// A line runs straight. It turns only once the pointer is TURN cells off its way, the corner level with the pointer:
// a diagonal gives one L, never stairs. A turn really taken is kept and the next leg starts at its corner;
// back on the line before a corner, that turn is taken up again. drag.flip lays the L the other leg first (R).
export const TURN = 2;
export const freshOn = p => tool === 'track' ? !trackAt(p.x, p.y) : !cellAt(p.x, p.y);
// A belt met and left straight on the other side is crossed: that one gets a bridge.
export const crossing = (path, i) => i > 0 && path[i + 1]?.dir === path[i].dir && cellAt(path[i].x, path[i].y)?.type === 'belt' && cellAt(path[i].x, path[i].y).dir % 2 !== path[i].dir % 2;
// What a tap here would do, without doing it. It follows place(): a test holds the two together.
export let hovered = null;
export const PREVIEW = {no:'#FF6B6B', scrap:'#FF6B6B', build:'#55D6E8', link:'#55D6E8', turn:'#F0A03C', use:'#F0A03C', select:'#B7F34A', none:'#D5FAFF'};
// The pointer carries the tool in hand, struck out where it cannot act.
export const CURSORS = new Map();
export let cursor = '';
// One finger pans, except with Tapis and Démonter where it draws. Two fingers always pan and zoom.
export const pointers = new Map();
export let gesture = null;
canvas.addEventListener('pointerdown', event => {
  if (G.over) return;
  event.preventDefault();
  // Preventing the default also keeps the keyboard out, in a frame R would never arrive.
  window.focus();
  canvas.focus({preventScroll:true});
  try { canvas.setPointerCapture(event.pointerId); } catch (_) { /* the pointer may be gone already: the gesture works without capture */ }
  if (event.pointerType === 'touch') hovered = null;
  const p = screenPoint(event);
  pointers.set(event.pointerId,p);
  drag = null;
  if (pointers.size > 1) { gesture = {mode:'pinch'}; return; }
  gesture = {mode:event.button > 0 ? 'pan' : 'tap', start:p, now:p};
  if (event.button === 2) holdToDismantle(event, p);
});
// Held still for 0.6 s, the right button dismantles what is under it: a ring fills, letting go or moving gives up.
export const HOLD_MS = 600;
canvas.addEventListener('pointerleave', () => { hovered = null; });
canvas.addEventListener('pointermove', event => {
  hovered = event.pointerType === 'touch' ? null : screenPoint(event);
  const last = pointers.get(event.pointerId);
  if (!last || !gesture) return;
  const p = screenPoint(event);
  if (gesture.mode === 'pinch') {
    if (pointers.size < 2) return;
    const [a,b] = [...pointers.values()];
    pointers.set(event.pointerId,p);
    const [c,d] = [...pointers.values()];
    const was = Math.hypot(a.x - b.x,a.y - b.y), now = Math.hypot(c.x - d.x,c.y - d.y);
    pan((c.x + d.x - a.x - b.x) / 2,(c.y + d.y - a.y - b.y) / 2);
    if (was > 8) zoomAt(now / was,(c.x + d.x) / 2,(c.y + d.y) / 2);
    return;
  }
  pointers.set(event.pointerId,p);
  gesture.now = p;
  if (gesture.hold && Math.hypot(p.x - gesture.start.x,p.y - gesture.start.y) >= 8) stopHold();
  if (gesture.mode === 'tap') {
    if (Math.hypot(p.x - gesture.start.x,p.y - gesture.start.y) < 8) return;
    if (!hasTrait(tool, 'drawn')) { gesture.mode = 'pan'; pan(p.x - gesture.start.x,p.y - gesture.start.y); return; }
    gesture.mode = 'draw';
    const from = position(gesture.start);
    if (!inside(from.x,from.y)) return;
    drag = {...from, moved:false, existing:Boolean(cellAt(from.x,from.y))};
    if (tool === 'wire') {
      if (!NERVE.ends.includes(G.cells[key(from.x,from.y)]?.type)) { drag = null; say(TYPES.wire.help); return; }
      drag.nerve = {...from}; drag.aim = {...from};
    }
    if (tool === 'pump') {
      if (drag.existing && cellAt(from.x,from.y).type !== 'pump') { drag = null; refuse(L('Tire depuis une pompe ou un sol libre.')); return; }
      if (!drag.existing && !placeable(from.x,from.y)) { drag = null; return; }
      drag.vein = {...from}; drag.aim = {...from};
    }
    // Démonter from bare ground takes the whole rectangle the finger opens; from a building, its line (item_017).
    if (tool === 'erase') drag.area = !cellAt(from.x, from.y) && !ruinAt(from.x, from.y) && !G.tracks[tileKey(from.x, from.y)] && !G.worms.some(w => w.path.includes(tileKey(from.x, from.y)));
    if (hasTrait(tool, 'traced')) { drag.path = [tool === 'track' ? {...from, ...tileAt(from.x, from.y)} : {...from}]; sayPath(); }
  }
  if (gesture.mode === 'pan') pan(p.x - last.x,p.y - last.y);
  else if (drag) { const to = position(p); if (inside(to.x,to.y)) stretch(to); }
});
canvas.addEventListener('pointerup',release);
canvas.addEventListener('pointercancel',release);
canvas.addEventListener('contextmenu', event => event.preventDefault());
canvas.addEventListener('wheel', event => {
  event.preventDefault();
  const p = screenPoint(event);
  zoomAt(Math.exp(-event.deltaY * .0015),p.x,p.y);
}, {passive:false});
// The arrows glide the camera at one speed on screen, whatever the zoom. Shift is faster.
export const GLIDE = {ArrowLeft:[-1,0], ArrowRight:[1,0], ArrowUp:[0,-1], ArrowDown:[0,1]};
// ---- Keys the player can change. Named by where they sit (event.code), so W A S D is Z Q S D on a French board.
export const KEYS_KEY = 'strainworks-keys';
export const ACTIONS = [
  ['up', L('Vue vers le haut'), 'KeyW'],
  ['left', L('Vue vers la gauche'), 'KeyA'],
  ['down', L('Vue vers le bas'), 'KeyS'],
  ['right', L('Vue vers la droite'), 'KeyD'],
  ['pick', L('Pipette : reprendre le bâtiment survolé'), 'KeyQ'],
  ['rotate', L('Tourner, avec Maj dans l’autre sens'), 'KeyR'],
  ['mirror', L('Inverser gauche et droite'), 'KeyH'],
  ['reverse', L('Retourner : demi-tour'), 'KeyV'],
  ['pause', L('Pause et reprise'), 'Space'],
];
export const RESERVED = /^(Escape|Tab|Enter|Arrow|Digit|Numpad|Shift|Control|Alt|Meta|F\d)/;
export let KEYS = {};
loadKeys();
export const actionOf = event => event.ctrlKey || event.metaKey || event.altKey || event.target.closest?.('input, textarea') ? null : ACTIONS.find(([id]) => KEYS[id] === event.code)?.[0];
export const PAN_DIRS = {up:'ArrowUp', left:'ArrowLeft', down:'ArrowDown', right:'ArrowRight'};
// The arrow a key stands for: the arrows themselves, or the four keys of the view.
export const dirOf = event => GLIDE[event.key] ? event.key : PAN_DIRS[actionOf(event)];
// What the key shows on this board, where the browser tells. shortcut: without it, a French page guesses AZERTY for the letters that move.
export let layout = null;
// @ts-expect-error: loose typing, tightened module by module (item_007)
navigator.keyboard?.getLayoutMap?.().then(map => { layout = map; paintKeys(); }).catch(() => {});
export const AZERTY = {KeyW:'Z', KeyA:'Q', KeyQ:'A', KeyZ:'W', Semicolon:'M'};
export const keyName = code => code === 'Space' ? L('Espace') : (layout?.get(code) || (LANG === 'fr' && AZERTY[code]) || code.replace(/^(Key|Digit)/, '')).toUpperCase();
export let rebinding = null;
paintKeys();
$('keys').onclick = event => {
  const b = event.target.closest('[data-action]');
  if (!b) return;
  rebinding = rebinding === b.dataset.action ? null : b.dataset.action;
  $('keys-note').textContent = '';
  paintKeys();
};
$('keys-reset').onclick = () => {
  try { localStorage.removeItem(KEYS_KEY); } catch (_) { /* blocked or full storage: the game goes on without remembering it */ }
  rebinding = null; loadKeys(); $('keys-note').textContent = ''; paintKeys();
};
$('commands').addEventListener('close', () => { rebinding = null; paintKeys(); });
// The next key pressed is the new one; Escape gives up. A key another action had is swapped with it.
document.addEventListener('keydown', event => {
  if (!rebinding || !$('commands').open) return;
  event.preventDefault(); event.stopImmediatePropagation();
  if (event.code === 'Escape') { rebinding = null; paintKeys(); return; }
  if (RESERVED.test(event.code) || !event.code) { $('keys-note').textContent = L('Touche réservée : choisis-en une autre.'); return; }
  const other = ACTIONS.find(([id]) => id !== rebinding && KEYS[id] === event.code);
  if (other) KEYS[other[0]] = KEYS[rebinding];
  KEYS[rebinding] = event.code;
  $('keys-note').textContent = other ? L`Échangée avec : ${other[1]}.` : '';
  try { localStorage.setItem(KEYS_KEY, JSON.stringify(KEYS)); } catch (_) { /* blocked or full storage: the game goes on without remembering it */ }
  rebinding = null; paintKeys();
}, true);
document.addEventListener('keydown', event => {
  if (actionOf(event) !== 'pick' || event.repeat || modalOpen() || G.over) return;
  event.preventDefault();
  pipette();
});
export const arrows = new Set();
export let hurried = false;
document.addEventListener('keydown', event => {
  hurried = event.shiftKey;
  const dir = dirOf(event);
  if (!dir || modalOpen() || event.ctrlKey || event.metaKey || event.altKey) return;
  event.preventDefault();
  arrows.add(dir);
});
document.addEventListener('keyup', event => { hurried = event.shiftKey; arrows.delete(dirOf(event)); });
// A key let go outside the page never says so.
window.addEventListener('blur', () => { arrows.clear(); hurried = false; });
document.addEventListener('visibilitychange', () => { if (document.hidden) arrows.clear(); });
// The buttons glide to the same place a jump would reach.
export const glideBy = jump => {
  const was = {...cam};
  jump();
  const to = {...cam};
  Object.assign(cam, was);
  travelTo(to);
};
$('zoom-in').onclick = () => glideBy(() => zoomAt(1.35));
$('zoom-out').onclick = () => glideBy(() => zoomAt(1 / 1.35));
$('home').onclick = () => glideBy(() => home());

// ---- 2D or 3D. Babylon is only fetched when the 3D view is first asked for.
// Both written at build from the installed babylonjs package (scripts/babylon-pin.mjs).
export const BABYLON_SRC = __BABYLON_SRC__;
export const BABYLON_HASH = __BABYLON_SRI__;
export const VIEW_KEY = 'strainworks-view';
export let made3d = null, switching = false;
$('view-toggle').onclick = () => chooseView(!view3d);
$('dimension').onclick = () => chooseView(true);
$('flat').onclick = () => chooseView(false);
$('rebuild').onclick = () => {
  for (const w of G.wires) if (!w.hp && w.out == null) Object.assign(w, {hp:NERVE.hp, left:1, order:G.seq = (G.seq || 0) + 1});
  for (const c of pumps()) {
    if (!c.to || c.veinOut != null || c.veinHp >= VEIN.hp / 2) continue;
    c.veinHp = VEIN.hp; c.veinLeft = 1.5; c.veinOrder = G.seq = (G.seq || 0) + 1;
  }
  let unpaid = 0;
  for (const [id, w] of Object.entries(G.ruins)) {
    if (buried(w)) { delete G.ruins[id]; continue; }
    const cost = Math.ceil((price(w.type) + rankCost(w.type, w.mk)) / 2);
    if (cost > G.dna) { unpaid++; continue; }
    G.dna -= cost;
    delete G.ruins[id];
    Object.assign(build(w.type, w.x, w.y, w.dir), {flip:w.flip, want:w.want || 'C', side:w.side || 3, ways:w.ways || null, open:w.open !== false, to:w.to || null, strict:Boolean(w.strict), unload:Boolean(w.unload), box:w.box || 'T', read:w.read || 0, mk:w.mk, on:w.on, onRich:w.onRich, pick:w.pick || '', watch:w.watch});
  }
  tell(unpaid ? L`${unpaid} débris en attente d’ADN, le reste est en chantier.` : L('Reconstruction lancée à l’identique.')); refresh();
};

// Every tool lives in one family. Within one, what is usable from the start comes first.
export const FAMILIES = [
  ['rec', L('Récolter'), 'mine', ['mine','cyst','borer','vault']],
  ['tra', L('Acheminer'), 'belt', ['belt','bridge','split2','split','pump','track','pocket','worm','arm']],
  ['fab', L('Transformer'), 'ligase', ['ligase','pack','join','unpack','flip','unbind','unjoin','burn','reaper']],
  ['def', L('Défendre'), 'turret', ['turret','sting','maw','wall','glue','mist','harpoon']],
  ['cmd', L('Commander'), 'gate', ['gate','sort','wire','radar','relay','desk','lab','screen']]
];
// Each tray lists what opens first, first; the sort is stable, so equals keep their order.
// @ts-expect-error: loose typing, tightened module by module (item_007)
for (const family of FAMILIES) family[3].sort((x, y) => (NEEDS[x] || 0) - (NEEDS[y] || 0));
// @ts-expect-error: loose typing, tightened module by module (item_007)
export const FAMILY_OF = Object.fromEntries(FAMILIES.flatMap(([id,,,types]) => types.map(type => [type, id])));
export const TOOLBAR = ['hand', ...FAMILIES.flatMap(f => f[3]), 'erase'];
// The order of the sprite behind --models.
export const MODELS = ['belt','mine','ligase','join','pack','turret','sting','maw','wall','cyst','bridge','gate','split2','split','sort','pump','pocket','borer','vault','track','worm','wire','core','drone','radar','relay','unpack','lab','flip','screen','burn','arm','glue','mist','harpoon','unbind','unjoin','reaper','desk'];

export const togglePause = () => { paused = !paused; refresh(); };
$('pause').onclick = togglePause;
// Space pauses. It only presses a button for who reached that button with Tab: after a click the focus just lingers.
export let tabbed = false;
document.addEventListener('pointerdown', () => { tabbed = false; }, true);
document.addEventListener('keydown', event => {
  if (event.key === 'Tab') tabbed = true;
  if (spacePauses(event) && !event.repeat && !G.over) togglePause();
});
document.addEventListener('keyup', spacePauses);
// Escape puts everything down: the tool, the line being drawn, the link being made, the selection.
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape' || modalOpen()) return;
  event.preventDefault();
  // A line being drawn is given up, the tool kept.
  if (drag?.path) { drag = null; gesture = null; say(L('Tracé annulé.')); return; }
  if (ui.stats) { showStats(false); return; }
  // In a page of the settings, Escape goes back up one; at the top it closes them.
  if (ui.menu && ui.page && ui.page !== 'root') { menuPage(ui.page === 'playlist' ? 'audio' : 'root'); return; }
  if (ui.menu) { showMenu(false); return; }
  // Nothing left to put down: Escape opens the menu.
  const idle = tool === 'hand' && !selected && !gesture && !drag && !linking && !wiring && !ui.family;
  // Without a gesture, letting the button go builds nothing.
  gesture = null; drag = null;
  if (idle) { showMenu(true); return; }
  choose('hand');
});
// Three speeds, in turn. The button says the next one, so a player sees there is more than one.
const SPEEDS = [1, 3, 6];
function paintSpeed() {
  const next = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length];
  $('speed').textContent = '×' + speed;
  $('speed').title = L`Vitesse ×${speed} : touche pour ×${next}`;
  $('speed').setAttribute('aria-label', $('speed').title);
}
$('speed').onclick = () => { speed = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length]; paintSpeed(); refresh(); };
paintSpeed();
export let armed = 0;
export const restartText = text => { $('restart').querySelector('span').textContent = text; };
export let held = 0;
$('restart').onpointerdown = hold;
for (const name of ['pointerup','pointercancel','pointerleave','blur']) $('restart').addEventListener(name, letGo);
$('restart').onkeydown = event => { if (event.key !== 'Enter') return; event.preventDefault(); if (!event.repeat) hold(); };
$('restart').onkeyup = event => { if (event.key === 'Enter') letGo(); };
// A screen reader cannot hold: it presses twice.
$('restart').onclick = event => {
  if (event.detail) return;
  if (Date.now() > armed) { armed = Date.now() + 3000; restartText(L('Sûr ? Encore une fois')); return; }
  armed = 0; restartText(L('Recommencer : maintenir')); showMenu(false); begin();
};
$('again').onclick = () => {
  // The fallen one keeps its scar: the new one takes another hexagon.
  save();
  if (foundGame()) return;
  openPlanet();
};
// H mirrors the machine under the pointer, or the one selected; V turns it round.
document.addEventListener('keydown', event => {
  const act = actionOf(event);
  if ((act !== 'mirror' && act !== 'reverse') || modalOpen()) return;
  event.preventDefault();
  const p = hovered && preview(), c = (p && cellAt(p.x, p.y)) || (selected && G.cells[selected]);
  if (!c) return;
  if (act === 'mirror' ? mirror(c) : hasTrait(c.type, 'turn') && (c.dir = (c.dir + 2) % 4, true)) { playSound('rotate'); showActions(); }
  else refuse(act === 'mirror' ? L('Rien à inverser ici.') : L('Cette pièce ne se tourne pas.'));
});
document.addEventListener('keydown', event => {
  if (actionOf(event) !== 'rotate' || modalOpen()) return;
  event.preventDefault();
  if (flipCorner()) return;
  rotate(event.shiftKey);
});
// The same on a phone, while a finger draws.
$('flip-corner').addEventListener('pointerdown', event => { event.preventDefault(); event.stopPropagation(); flipCorner(); });

export const SAVE = 'souche-proto-2', OLD_SAVE = 'souche-proto-1';
// The bonus is gone: what it cost comes back.
export let repaid = 0;

// ---- The grafted interface. It reads the game and calls the same actions as a finger: no rule lives here.
export const LESS_MOTION = matchMedia('(prefers-reduced-motion: reduce)'), STILL = {wanted:false, get matches() { return this.wanted || LESS_MOTION.matches; }}, NARROW = matchMedia('(max-width:759px), (max-height:520px)');
export const ui = {family:null, menu:false, html:{}, dna:null, stage:null, locked:new Map(), events:[], point:null, saidAt:0, refusedAt:-1e9, grown:0, travel:null, picked:'', pickedAt:0, safe:{left:8, top:8, right:8, bottom:8}, at:'', dry:[]};
export const motionTime = () => STILL.matches ? 0 : performance.now() / 1000;
export const modalOpen = () => $('commands').open || $('unlock').open || orbit.on;
$('menu').addEventListener('click', event => { const to = event.target.closest('[data-go]'); if (to) menuPage(to.dataset.go); });
// Where floating things may go without landing under the interface.
// Phones fold the side controls away under the chevron; the choice is kept.
export const SIDE_KEY = 'strainworks-side';
$('side-toggle').onclick = () => { const off = !$('app').classList.contains('side-off'); foldSide(off); keep(SIDE_KEY, off ? 'off' : 'on'); };
foldSide(stored(SIDE_KEY) === 'off');
// ---- The core's card: a machine drawn from the sprite sheet, for what a stage unlocks.
export const machineOf = (type, label) => `<span class="porthole model machine" data-model="${type}" role="img" aria-label="${label}"></span>`;
// A row or a tab of the core's sheet, touched.
$('sheet').addEventListener('click', event => {
  const card = event.target.closest('[data-card]');
  if (card) { showCard(card.dataset.card, false); return; }
  const row = event.target.closest('[data-goal]'), tab = event.target.closest('[data-sheet-tab]'), up = event.target.closest('[data-up]'), labTab = event.target.closest('[data-lab-tab]');
  if (up) buyLab(up.dataset.up);
  else if (labTab) ui.labTab = labTab.dataset.labTab;
  else if (row) { ui.goalPick = Number(row.dataset.goal); ui.sheetTab = 'asks'; }
  else if (tab) ui.sheetTab = ui.sheetTab === tab.dataset.sheetTab ? 'asks' : tab.dataset.sheetTab;
  else return;
  paintSheet(G.cells[selected]);
});

// ---- The guided start: five steps to a first line feeding the core, each checked on what is built.
// The guide to a first defence, started by the simulation just before the first swarm (item_016).
export const DEFENSE_GUIDE = [
  {family:'def', pick:'turret', model:'turret', list:L('Une tourelle'), title:L('Pose une tourelle'), why:L('Un essaim arrive : pose une tourelle entre le cœur et l’endroit d’où il vient.')},
  {family:'tra', pick:'belt', model:'belt', list:L('Des gènes pour elle'), title:L('Nourris-la de gènes'), why:L('Un tapis de gènes jusqu’à la tourelle : elle tire ce qu’on lui livre, l’antidote de l’essaim fait le plus mal.')},
  {family:'cmd', pick:'wire', model:'wire', list:L('Un nerf'), title:L('Relie-la par un nerf'), why:L('Un nerf de la tourelle à un feu ou un trieur : elle dit ce qu’il lui faut, sa ligne le lui envoie.')},
  {family:'def', pick:'wall', model:'wall', list:L('Un mur'), title:L('Ajoute un mur'), why:L('Un mur devant la tourelle : les créatures doivent le casser, elle a le temps de tirer.')}
];
// The gene the guide teaches: this game's first base gene, or the Motor (SFS) of older games and the demo.
export const guideGene = () => G.base?.[0] || 'SFS';
export const GUIDE = [
  {family:'rec', pick:'mine', model:'mine', get base() { return guideGene()[0]; }, list:L('Un récolteur sur'), title:L('Pose un récolteur sur'), get why() { return L`Le cœur veut ${guideGene()}, le premier gène de base de cette partie : un récolteur par base, dans l’ordre.`; }},
  {family:'rec', pick:'mine', model:'mine', get base() { return guideGene()[1]; }, list:L('Un récolteur sur'), title:L('Puis un récolteur sur'), why:L('Elle ira au milieu du gène, par l’arrière de la Ligase.')},
  {family:'rec', pick:'mine', model:'mine', get base() { return guideGene()[2]; }, list:L('Un récolteur sur'), title:L('Et un récolteur sur'), why:L('Une base par entrée : la Ligase ne fait jamais attendre un tapis.')},
  {family:'fab', pick:'ligase', model:'ligase', list:L('Prendre la Ligase'), title:L('Prends la Ligase'), get why() { return L`Elle assemble trois bases en un gène, dans l’ordre : ${guideGene()}. Le cœur mange ce gène.`; }},
  {family:'fab', pick:'ligase', model:'ligase', place:true, list:L('Poser la Ligase'), title:L('Pose la Ligase ici'), why:L('Entre tes récolteurs et le cœur. Sa sortie, la flèche, doit regarder le cœur : R pour la tourner avant de la poser.')},
  {family:'tra', pick:'belt', model:'belt', port:0, get base() { return guideGene()[0]; }, list:L('Récolteur → entrée 1'), title:L('Relie à l’entrée 1 un récolteur sur'), why:L('Prends un tapis et glisse du récolteur jusqu’à l’entrée 1 de la Ligase, en suivant le tracé.')},
  {family:'tra', pick:'belt', model:'belt', port:1, get base() { return guideGene()[1]; }, list:L('Récolteur → entrée 2'), title:L('Relie à l’entrée 2 un récolteur sur'), why:L('Même geste vers l’entrée 2 : la base du milieu du gène.')},
  {family:'tra', pick:'belt', model:'belt', port:2, get base() { return guideGene()[2]; }, list:L('Récolteur → entrée 3'), title:L('Relie à l’entrée 3 un récolteur sur'), why:L('Et vers l’entrée 3 : la Ligase assemble le gène dès que ses trois entrées sont servies.')},
  {family:'tra', pick:'belt', model:'belt', core:true, list:L('La Ligase jusqu’au cœur'), title:L('Relie la Ligase au cœur'), why:L('Un tapis de la sortie de la Ligase jusqu’au cœur : il mange le gène, et le premier atelier tourne.')}
];
// ---- The goal: three moving pictures, shown once on a first game and again from the menu. The game waits behind it.
export const INTRO_KEY = 'strainworks-intro';
export const intro = {at:0, timer:0, was:false};
$('intro-again').onclick = () => { showMenu(false); showIntro(true); };
$('guide-arrow').onclick = () => { const at = ui.guidePoint; if (at) travelTo({...cam, x:at.x, y:at.y}); };
$('guide-hide').onclick = () => { if (G.guide) G.guide.hidden = true; paintGuide(); };
$('guide-show').onclick = () => { if (G.guide) G.guide.hidden = false; paintGuide(); };
export const skipGuide = () => { if (G.guide) G.guide.step = (G.guide.kind === 'defense' ? DEFENSE_GUIDE : GUIDE).length; paintGuide(); };
$('guide-skip').onclick = skipGuide;
$('guide-drop').onclick = skipGuide;
$('guide-again').onclick = () => { startGuide(); showMenu(false); paintGuide(); };

export const screenAt = p => ({x:view.w / 2 + (p.x - cam.x) * cam.zoom, y:view.h / 2 + (p.y - cam.y) * cam.zoom * flat()});
export const within = (v, low, high) => Math.max(low, Math.min(high, v));

// The fog itself: a small picture, one point a tile, blurred wide and stretched soft over the map. No line anywhere.
export const fogImage = document.createElement('canvas'), FOG_SOFT = 2;
export let fogFor = '';

$('threat-toggle').onclick = () => {
  const open = $('families').hidden;
  $('families').hidden = !open;
  $('threat-toggle').setAttribute('aria-expanded', open);
};
$('menu-toggle').onclick = () => showMenu(!ui.menu);
// @ts-expect-error: loose typing, tightened module by module (item_007)
for (const [id, less] of [['motion-auto', false], ['motion-less', true]]) $(id).onclick = () => { setMotion(less); keep(MOTION_KEY, less ? 'less' : 'auto'); };
$('help').onclick = () => { showMenu(false); paintCardList(); $('commands').showModal(); };
$('building-cards').addEventListener('click', event => { const b = event.target.closest('[data-card]'); if (b) showCard(b.dataset.card, false); });
$('unlock-ok').onclick = closeCard;
$('unlock').addEventListener('close', closeCard);
// Not a form: the frame the game is served in may refuse to submit one.
$('help-close').onclick = () => $('commands').close();
$('open-all').onclick = () => {
  G.open = true; showMenu(false); showActions();
  tell(L('Tout est débloqué pour tester. Les stades continuent de compter.'));
  refresh();
};
$('continue').onclick = () => { ui.grown = 0; $('growth').hidden = true; };
$('free-play').onclick = () => { $('victory').hidden = true; };
// Developer: every Laboratory upgrade at its top, free, and DNA on demand.
$('lab-all').onclick = () => {
  for (const [id, up] of Object.entries(UPGRADES)) if (id !== 'drones') (G.lab ||= {})[id] = up.prices.length;
  while (G.drones.length < MOST_DRONES) { const {x, y} = perch(G.drones.length); G.drones.push({x, y, a:0, h:.55, w:0, trip:'nest', speed:DRONE.speed, job:'', goal:null, was:{x, y, h:.55, w:0}}); }
  tell(L('Toutes les améliorations du Labo sont acquises.')); refresh();
};
$('dna-more').onclick = () => { G.dna += 100; refresh(); };
// Developer: the stage under way is completed as if its recipes were all delivered.
$('next-stage').onclick = () => {
  if (G.stage >= STAGES.length) return refuse(L('Le dernier stade est déjà achevé.'));
  if (G.goals) for (const g of [...G.goals, ...(G.needs || [])]) g.fed = g.count;
  showMenu(false); grow(); refresh();
};
$('won-planet').onclick = () => { $('victory').hidden = true; openPlanet(); };
for (let i = 0; i < MOST_DRONES; i++) addPip(i);
document.addEventListener('pointerdown', event => {
  ui.point = {x:event.clientX, y:event.clientY};
  // @ts-expect-error: loose typing, tightened module by module (item_007)
  if (ui.menu && !event.target.closest?.('#menu, #menu-toggle, #planet-menu')) showMenu(false);
  if (event.target === canvas) ui.travel = null;
}, true);
canvas.addEventListener('wheel', () => { ui.travel = null; }, {passive:true});
// The physical key, so 1 to 7 also answer on a French keyboard.
document.addEventListener('keydown', event => {
  if (dirOf(event)) ui.travel = null;
  if (modalOpen() || G.over || event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
  const n = /^(?:Digit|Numpad)([1-8])$/.exec(event.code)?.[1];
  if (!n) return;
  event.preventDefault();
  // With Shift, inside what is open: the machines of a family, or the tabs of the statistics.
  if (event.shiftKey && (ui.family || ui.stats)) {
    // @ts-expect-error: loose typing, tightened module by module (item_007)
    const pick = ui.family ? $('tools').querySelectorAll(`.tray[data-tray="${ui.family}"] [data-type]`)[n - 1] : $('stats').querySelectorAll('.tab')[n - 1];
    if (pick) { replay(pick, 'pressed'); pick.click(); }
    return;
  }
  // @ts-expect-error: loose typing, tightened module by module (item_007)
  const b = n === '8' ? $('stats-pod') : n === '1' || n === '7' ? $('tools').querySelector(`[data-type="${n === '1' ? 'hand' : 'erase'}"]`) : $('tools').querySelectorAll('.family')[n - 2];
  const box = b.getBoundingClientRect();
  ui.point = {x:box.x + box.width / 2, y:box.y};
  replay(b, 'pressed'); b.click();
});
NARROW.addEventListener('change', layoutHud);

// ---- Statistics: read from the running factory, sampled every 10 s for five minutes of history.
export const STAT_TABS = [
  ['prod', L('Production'), '<path d="M2 13V7l3 2V7l3 2V4l6 4v5z"/>'],
  ['eco', L('Économie'), '<circle cx="8" cy="8" r="6"/><path d="M8 4v8"/>'],
  ['def', L('Défense'), '<path d="M8 1l6 2v5c0 3.5-2.6 6-6 7-3.4-1-6-3.5-6-7V3z"/>'],
  ['threat', L('Menace'), '<path d="M1 8h4l1.5-4 3 8 1.5-4h4"/>'],
  ['logi', L('Logistique'), '<path d="M1 5h10l-2-2M15 11H5l2 2"/>']
];
// The statistics' order; which pieces produce is their 'produce' trait.
export const PRODUCERS = ['mine', 'borer', 'ligase', 'join', 'pack'];
$('stats').querySelector('.tabs').innerHTML = STAT_TABS.map(([id, name, d]) => `<button class="tab" role="tab" data-tab="${id}" aria-selected="false"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">${d}</svg><span>${name}</span></button>`).join('');
$('stats').querySelector('.tabs').onclick = event => {
  const tab = event.target.closest('[data-tab]');
  if (tab) { ui.statsTab = ui.stats = tab.dataset.tab; ui.statsAt = -Infinity; paintStats(); }
};
$('stats-close').onclick = () => showStats(false);
$('stats-body').onclick = event => {
  const at = event.target.closest('[data-at]')?.dataset.at.split(',').map(Number);
  if (!at) return;
  showStats(false);
  travelTo({x:at[0] + .5, y:at[1] + .5});
};
export const fr = n => (Math.round(n * 10) / 10).toLocaleString(LOCALE);

// ---- Games: one a hexagon, each under its own key. The list can be rebuilt from the keys, never the reverse.
// Nothing here writes over a game, except its own autosave and what a held press asked for.
export const LIST_KEY = 'strainworks-planet', GAME_KEY = 'strainworks-game:', MOTION_KEY = 'strainworks-motion';
export const NAMES = [L('Rhizome'), L('Synapse'), L('Moelle'), L('Chitine'), L('Mycélium'), L('Spirale'), L('Écorce'), L('Plasmide'), L('Axone'), L('Spore'), L('Ganglion'), L('Lymphe'), L('Tendon'), L('Cilium'), L('Germe'), L('Kératine')];
export const FILE = {one:'strainworks', all:'strainworks-planet', bytes:16e6, cells:60000, values:3e6};
export let slotKey = null, slotId = null, saveFailed = false;
// What the planet shows: the player's games and the demo.
export const DEMO_KEY = 'strainworks-demo';
export let demoMoved = false, demoReady = null;
export const loadDemo = () => demoReady ||= script('demo.js').catch(() => null);
export let slotSaved = false, slotName = '';
export let downloads;

// ---- The opening screen. The globe and its grid share one rotation, the station projects the hexagon picked.
export const ART = {space:'planet/space.webp', station:'planet/station.webp', ground:'planet/globe.webp', glow:'planet/globe-glow.webp', still:'planet/planet.webp'};
// Where the projector's lens is in the station's picture.
export const LENS = {x:.3296, y:.5522};
export const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const unit3 = v => { const n = Math.hypot(...v); return v.map(x => x / n); };
export const CELLS_OF_GLOBE = goldberg(4);
// New games take the mockup's places first, then whatever faces the player most.
export const PREFERRED = (() => {
  const order = [];
  const take = v => {
    let best = -1;
    CELLS_OF_GLOBE.forEach((cell, id) => { if (!order.includes(id) && (best < 0 || dot3(cell.c, v) > dot3(CELLS_OF_GLOBE[best].c, v))) best = id; });
    order.push(best);
  };
  for (const [x, y] of [[430,300],[560,470],[370,600],[610,250],[240,420],[600,660],[690,400],[440,160]]) {
    const u = (x - 260) / 527.7, v = -(y - 510) / 527.7;
    take([u, v, Math.sqrt(Math.max(0, 1 - u * u - v * v))]);
  }
  while (order.length < CELLS_OF_GLOBE.length) take([.45, .12, .88]);
  return order;
})();
// The demo's hexagon: the one beside where a first game is founded.
export const DEMO_HEX = PREFERRED[1];

export const orbit = {on:false, yaw:0, pitch:0, to:null, pick:null, list:null, incoming:null, dirty:true, drag:null, gl:null, box:null, seenAt:0};

// ---- The globe: one quad, the sphere worked out for each point of it.
export const GLOBE_SHADER = `precision highp float;
uniform vec2 size, centre;
uniform float radius;
uniform mat3 back;
uniform sampler2D ground, glow;
const float PI = 3.14159265;
void main() {
  vec2 at = (vec2(gl_FragCoord.x, size.y - gl_FragCoord.y) - centre) / radius;
  vec2 p = vec2(at.x, -at.y);
  float d = length(p);
  vec3 sun = normalize(vec3(.84, .48, .12));
  if (d >= 1.0) {
    float halo = pow(1.0 - smoothstep(1.0, 1.062, d), 2.0) * clamp(.3 + dot(p / d, sun.xy) * .8, 0.0, 1.0) * .67;
    gl_FragColor = vec4(vec3(.35, .88, .8) * halo, halo);
    return;
  }
  vec3 n = vec3(p, sqrt(1.0 - d * d));
  vec3 w = back * n;
  vec2 uv = vec2(atan(w.x, w.z) / (2.0 * PI) + .5, .5 - asin(clamp(w.y, -1.0, 1.0)) / PI);
  float facing = dot(n, sun);
  float day = smoothstep(-.2, .85, facing);
  float night = 1.0 - smoothstep(-.05, .45, facing);
  vec3 colour = texture2D(ground, uv).rgb * (.16 + day * 1.65) / 1.4 + texture2D(glow, uv).rgb * (.3 + night * .8);
  colour += vec3(.27, .75, .69) * pow(1.0 - n.z, 3.2) * clamp(.25 + facing, 0.0, 1.0) * .75;
  float edge = smoothstep(1.0, 1.0 - 1.5 / radius, d);
  gl_FragColor = vec4(mix(vec3(.2, .55, .5), colour, edge), 1.0);
}`;
// The live station: the picture stands in until it is ready, and for good if the engine cannot load.
export const station3d = {st:null, loading:false};
// The title's letters and helix, made once.
(() => {
  const h1 = $('brand').querySelector('h1');
  h1.innerHTML = [...h1.textContent].map((c, i) => `<span class="l" aria-hidden="true" style="--i:${i}">${c}</span>`).join('');
  // The strands drawn three periods wider than shown, so sliding one period loops without a seam.
  const strand = k => { let d = ''; for (let x = 0; x <= 150; x += 1.5) d += `${x ? 'L' : 'M'}${x} ${(11 + Math.sin(x / 100 * Math.PI * 6 + k * Math.PI) * 8).toFixed(2)}`; return d; };
  h1.insertAdjacentHTML('afterend', `<svg class="helix" viewBox="0 0 100 22" preserveAspectRatio="none" aria-hidden="true"><clipPath id="helix-in"><rect width="100" height="22"/></clipPath><g clip-path="url(#helix-in)"><path class="a" d="${strand(0)}"/><path class="b" d="${strand(1)}"/></g></svg>`);
})();
// Spores and grain run only while the planet is on screen, fewer on a phone, none with reduced motion.
export const fx = {motes:null, last:0, grainAt:0, seed:12345};
// The finish draws its own chance: the game's Math.random stays the game's, so a seeded game plays the same.
export const fxRandom = () => (fx.seed = fx.seed * 16807 % 2147483647) / 2147483647;

$('hexes').addEventListener('pointerdown', event => {
  try { $('hexes').setPointerCapture(event.pointerId); } catch (_) { /* the pointer may be gone already: the gesture works without capture */ }
  orbit.drag = {id:event.pointerId, x:event.clientX, y:event.clientY, far:0};
  showMenu(false);
});
$('hexes').addEventListener('pointermove', event => {
  const d = orbit.drag;
  if (!d && event.pointerType === 'mouse') {
    const id = hexAt(event.clientX, event.clientY);
    if (id !== orbit.hover) { orbit.hover = id; orbit.dirty = true; $('hexes').style.cursor = id == null ? '' : 'pointer'; }
  }
  if (!d || d.id !== event.pointerId) return;
  const dx = event.clientX - d.x, dy = event.clientY - d.y;
  d.far += Math.hypot(dx, dy);
  if (d.far < 8) return;
  $('hexes').classList.add('dragged');
  orbit.to = null;
  orbit.yaw += dx / orbit.box.r;
  orbit.pitch = within(orbit.pitch + dy / orbit.box.r, -1.35, 1.35);
  d.x = event.clientX; d.y = event.clientY;
  orbit.dirty = true;
});
$('hexes').addEventListener('pointerup', event => {
  const d = orbit.drag;
  orbit.drag = null;
  $('hexes').classList.remove('dragged');
  if (!d || d.id !== event.pointerId || d.far >= 8) return;
  const id = hexAt(event.clientX, event.clientY);
  if (id != null) pickHex(id);
});
$('hexes').addEventListener('pointerleave', () => { if (orbit.hover != null) { orbit.hover = null; orbit.dirty = true; } });
$('hexes').addEventListener('pointercancel', () => { orbit.drag = null; $('hexes').classList.remove('dragged'); });
$('planet').addEventListener('dragover', event => event.preventDefault());
$('planet').addEventListener('drop', event => { event.preventDefault(); takeFile(event.dataTransfer.files[0]); });
$('file').onchange = () => { takeFile($('file').files[0]); $('file').value = ''; };
$('planet-menu').onclick = () => showMenu(!ui.menu);
$('to-planet').onclick = () => openPlanet();
$('over-planet').onclick = () => openPlanet();
document.addEventListener('keydown', event => {
  if (!orbit.on || $('commands').open || event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    if (ui.menu) showMenu(false);
    else if (orbit.incoming) { orbit.incoming = null; projectSlot(); }
  // @ts-expect-error: loose typing, tightened module by module (item_007)
  } else if (event.key === 'Enter' && !event.repeat && !event.target.closest?.('button, input')) {
    event.preventDefault();
    if (orbit.incoming) return;
    const game = orbit.list.games[orbit.pick];
    if (!game) leavePlanet(() => foundGame(orbit.pick));
    else if (!game.over) playPicked();
  } else if (dirOf(event)) {
    event.preventDefault();
    const [x, y] = GLIDE[dirOf(event)];
    orbit.to = null; orbit.yaw -= x * .12; orbit.pitch = within(orbit.pitch - y * .12, -1.35, 1.35); orbit.dirty = true;
  }
});
window.addEventListener('pagehide', () => { save(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });

// The live performance graph: 30 s of the CPU each drawn frame costs, by kind, with the real time between frames.
// Off, the wrapped functions pay one test of PERF.on and nothing is timed, kept or drawn.
export const PERF_KEY = 'strainworks-perf';
export const PERF_KINDS = [['sim', L('Simulation'), '#418EE8'], ['fog', L('Brouillard'), '#9C8CF0'], ['draw', 'Dessin 2D', '#E6C94C'],
  ['three', 'Vue 3D', '#E07CC8'], ['ui', L('Interface'), '#45BFC9'], ['save', L('Sauvegarde'), '#F49445']];
export const PERF = {on:false, stack:[], cost:{}, frames:0, gaps:0, frameSum:0, framePeak:0, cpu:0, cpuPeak:0, since:0, lastFrame:0, history:[]};
export const perfZero = () => Object.fromEntries(PERF_KINDS.map(([id]) => [id, 0]));
simSet.step(timed('sim', step));
simSet.look(timed('fog', look));
hudSet.drawFog(timed('fog', drawFog));
renderSet.draw(timed(() => view3d ? 'three' : 'draw', draw));
inputSet.refresh(timed('ui', refresh));
hudSet.animateHud(timed('ui', animateHud));
hudSet.layoutHud(timed('ui', layoutHud));
savesSet.save(timed('save', save));
$('perf-legend').innerHTML = [...PERF_KINDS, ['other', L('Autre code de l’image'), '#84909C'], ['gpu', L('Carte graphique (trait)'), '#66D9EA']].map(([id, name, color]) =>
  `<p><i style="background:${color}"></i><span>${name}</span><b id="perf-${id}">–</b></p>`).join('');
// The 3D view reads it when it is made: a change remakes an open one.
export const QUALITY_KEY = 'strainworks-3d-quality';
// @ts-expect-error: loose typing, tightened module by module (item_007)
for (const [id, fast] of [['quality-high', false], ['quality-fast', true]]) $(id).onclick = () => { setQuality(fast, true); keep(QUALITY_KEY, fast ? 'fast' : 'high'); };
setQuality(stored(QUALITY_KEY) === 'fast', false);
// The 3D view reads it on every frame, from 0 (flat) to 1. Choices kept from before become their nearest strength.
export const CURVE_KEY = 'strainworks-3d-curve';
$('curve-amount').oninput = () => { setCurve(Number($('curve-amount').value) / 100); keep(CURVE_KEY, String(window.curve3d)); };
setCurve(stored(CURVE_KEY));
// ---- Music: the main theme on the planet, two calm pieces in turn in a game, the fight piece while it is hot.
// It starts with the first press, as browsers want, and is not kept for offline play: the game runs without it.
export const MUSIC_KEY = 'strainworks-music';
// The calm pieces and the fight pieces each go round their list in a shuffled order.
export const MUSIC = {
  // The planet's two themes take turns.
  theme:['music/strainworks_theme_b_1.mp3', 'music/strainworks_theme_b_2.mp3'],
  calm:['music/strainworks_music_01.mp3', 'music/strainworks_theme_a_1.mp3', 'music/strainworks_theme_a_2.mp3', 'music/strainworks_music_02.mp3', 'music/strainworks_calm_a_1.mp3', 'music/strainworks_calm_b_1.mp3', 'music/strainworks_music_04.mp3', 'music/strainworks_calm_c_1.mp3', 'music/strainworks_calm_a_2.mp3', 'music/strainworks_calm_b_2.mp3', 'music/strainworks_calm_c_2.mp3', 'music/strainworks_calm_d_1.mp3', 'music/strainworks_calm_d_2.mp3', 'music/strainworks_calm_e_2.mp3', 'music/strainworks_calm_f_1.mp3', 'music/strainworks_calm_f_2.mp3'],
  fight:['music/strainworks_music_03.mp3', 'music/strainworks_fight_a_1.mp3', 'music/strainworks_fight_b_1.mp3', 'music/strainworks_fight_a_2.mp3', 'music/strainworks_fight_b_2.mp3', 'music/strainworks_fight_c_2.mp3', 'music/strainworks_fight_d_1.mp3', 'music/strainworks_fight_d_2.mp3', 'music/strainworks_fight_e_1.mp3', 'music/strainworks_fight_e_2.mp3'],
};
// The music draws its own chance, so the game's seeded Math.random is left alone.
export const musicRandom = n => crypto.getRandomValues(new Uint32Array(1))[0] % n;
export const shuffleCalm = () => shuffleMusic(MUSIC.calm);
shuffleCalm();
shuffleMusic(MUSIC.fight);
// The master volume scales the music and the effects. Hidden, the game pauses unless the player asked it to go on.
const SOUND_KEY = 'strainworks-sound';
export const sound = {master:1, background:false};
try {
  const saved = JSON.parse(localStorage.getItem(SOUND_KEY));
  if (saved) { sound.master = Math.max(0, Math.min(1, Number(saved.master ?? 1) || 0)); sound.background = saved.background === true; }
} catch (_) { /* blocked storage or an unreadable value: the default stays */ }
function keepSound() { try { localStorage.setItem(SOUND_KEY, JSON.stringify(sound)); } catch (_) { /* blocked or full storage: the game goes on without remembering it */ } }
function paintSound() {
  $('master-volume').value = Math.round(sound.master * 100);
  $('background-play').setAttribute('aria-pressed', sound.background);
  $('background-play').textContent = sound.background ? L('Le jeu continue') : L('En pause');
}
// A first start plays the music quietly: the player turns it up.
export const music = {manual:null, volume:.3, on:true, started:false, players:[new Audio(), new Audio()], level:[0, 0], gains:null, live:0, src:'', calm:0, theme:musicRandom(2), fight:-1, fightUntil:0, force:null};
try {
  const saved = JSON.parse(localStorage.getItem(MUSIC_KEY));
  if (saved) { music.volume = Math.max(0, Math.min(1, Number(saved.volume) || 0)); music.on = saved.on !== false; }
} catch (_) { /* blocked storage or an unreadable value: the default stays */ }
for (const a of music.players) {
  a.preload = 'auto';
  // A calm piece played to its end hands over to the other.
  a.addEventListener('ended', () => {
    if (MUSIC.theme.includes(music.src)) { music.theme = (music.theme + 1) % MUSIC.theme.length; musicTick(); return; }
    if (!MUSIC.calm.includes(music.src)) return;
    music.calm++;
    if (music.calm >= MUSIC.calm.length) { music.calm = 0; shuffleCalm(); }
    musicTick();
  });
}
// Each piece's title, the same in both languages, and its length.
export const TRACKS = {calm_d_1:['Abyssal Glow', '2:59'], calm_d_2:['Lantern Drift', '3:00'], calm_e_2:['Night Culture', '3:00'], calm_f_1:['Pollen Clock', '3:00'], calm_f_2:['Seed Waltz', '2:59'],
  fight_c_2:['Breach Protocol', '3:00'], fight_d_1:['Chitin War', '2:59'], fight_d_2:['Drums of the Hive', '2:59'], fight_e_1:['Acid Bloom', '3:00'], fight_e_2:['Infection', '3:00'],
  theme_b_1:['Strainworks', '2:59'], theme_b_2:['First Light', '3:00'], music_01:['Germination', '3:57'], theme_a_1:['Glass Bells', '2:59'], theme_a_2:['Pulse Garden', '2:59'],
  music_02:['Membrane', '3:30'], calm_a_1:['Living Factory', '3:00'], calm_b_1:['Lab Hours', '3:00'], music_04:['Spore Drift', '3:12'], calm_c_1:['Microcosm', '2:59'], calm_a_2:['Root Network', '2:59'],
  calm_b_2:['Enzyme', '2:59'], calm_c_2:['Cell Dream', '2:59'], music_03:['Breach', '3:32'], fight_a_1:['Antibody', '2:59'], fight_b_1:['Swarm', '2:59'], fight_a_2:['Immune Response', '3:00'], fight_b_2:['Hive Assault', '2:58']};
export const trackOf = src => TRACKS[/strainworks_(\w+?_\d+)/.exec(src)?.[1]] || ['?', ''];
$('playlist').onclick = event => {
  const b = event.target.closest('[data-track]');
  if (!b) return;
  startSound();
  // Touched while it plays, it stops; any other starts and loops. Either way the game no longer chooses.
  const playing = music.on && music.src === b.dataset.track && (music.manual ?? b.dataset.track) === b.dataset.track;
  music.manual = playing ? '' : b.dataset.track;
  music.on = true; paintMusic(); musicTick(); paintPlaylist();
};
$('playlist-auto').onclick = () => { music.manual = music.manual == null ? (music.src || '') : null; musicTick(); paintPlaylist(); };
$('music-volume').oninput = () => { music.volume = Number($('music-volume').value) / 100; if (music.volume > 0) music.on = true; keepMusic(); paintMusic(); musicTick(); };
$('music-on').onclick = () => { music.on = !music.on; keepMusic(); paintMusic(); musicTick(); };
$('master-volume').oninput = () => { sound.master = Number($('master-volume').value) / 100; keepSound(); paintSfx(); musicTick(); };
$('background-play').onclick = () => { sound.background = !sound.background; keepSound(); paintSound(); };
paintSound();
paintMusic();
// One audio context for the music and the effects, made on a press as browsers want.
// @ts-expect-error: loose typing, tightened module by module (item_007)
addEventListener('click', event => { if (event.target.closest?.('button')) playSound('click'); }, {capture:true});
// Hidden, it stops at once: a phone slows or freezes the fade's timer, and the piece would play on behind the lock screen.
document.addEventListener('visibilitychange', () => {
  if (!document.hidden || sound.background) { musicTick(); return; }
  music.players.forEach((a, i) => { a.pause(); music.level[i] = 0; if (music.gains) music.gains[i].gain.value = 0; });
});
if (!LAB.on) for (const kind of ['pointerdown', 'keydown']) addEventListener(kind, startSound, {once:true, capture:true});
// An iPhone unlocks sound only when a finger lifts: every lift or click resumes it until it runs.
for (const kind of ['pointerup', 'touchend', 'click', 'keydown']) addEventListener(kind, () => {
  if (!music.started || sfx.ctx?.state === 'running') return;
  sfx.ctx?.resume?.();
  if (music.on && music.src && music.manual !== '') music.players[music.live].play().catch(() => {});
}, {capture:true, passive:true});
setInterval(musicTick, 100);
// Hidden, the browser stops drawing frames: when the player asked the game to go on, a timer steps it instead.
let hiddenAt = performance.now();
setInterval(() => {
  const now = performance.now(), elapsed = Math.min(1.5, (now - hiddenAt) / 1000);
  hiddenAt = now;
  if (!document.hidden || !sound.background || paused || orbit.on || LAB.on || !G || G.over) return;
  G.played = (G.played ?? G.time) + elapsed;
  owed += elapsed * speed;
  while (owed >= STEP) { step(STEP); owed -= STEP; }
}, 500);

// ---- Effects: drawn by Web Audio, a little different each time, never more than ten at once.
// By default the effects play at half the music's volume.
export const sfx = {volume:music.volume / 2, on:true, ctx:null, out:null, voices:0, buffers:{}, last:{}, loop:null};
export const SFX_KEY = 'strainworks-sfx';
try {
  const saved = JSON.parse(localStorage.getItem(SFX_KEY));
  if (saved) { sfx.volume = Math.max(0, Math.min(1, Number(saved.volume) || 0)); sfx.on = saved.on !== false; }
} catch (_) { /* blocked storage or an unreadable value: the default stays */ }
$('sfx-volume').oninput = () => { sfx.volume = Number($('sfx-volume').value) / 100; if (sfx.volume > 0) sfx.on = true; keepSfx(); paintSfx(); };
$('sfx-on').onclick = () => { sfx.on = !sfx.on; keepSfx(); paintSfx(); };
paintSfx();
// Each effect's generated takes, by the name of their files; the game picks one at random each time.
export const SOUND_FILE = {click:'ui_click', open:'ui_open', refuse:'ui_refuse', step:'ui_step', place:'build_place', belt:'build_belt', bridge:'build_bridge', rotate:'build_rotate', done:'build_done', dismantle:'build_dismantle', rank:'build_rank', gene:'prod_gene', eat:'prod_eat', turret:'turret_fire', sting:'fight_sting', maw:'fight_maw', hit:'fight_hit', kill:'fight_kill', throw:'fight_throw', damaged:'fight_damaged', destroyed:'fight_destroyed', core_hit:'fight_core_hit', hex:'planet_hex', zoom:'planet_zoom', stage_up:'stage_up', game_over:'game_over', nest_down:'nest_down', mutation:'mutation', assault_alarm:'assault_alarm', station_loop:'station_loop'};
// Heard while it is in view or close to it: a fight, a site or a machine far away stays silent.
export const heard = c => !orbit.on && c?.x != null && placeOf(c).gain > .03;
export const playNear = (id, c, gap) => heard(c) && playSound(id, gap, placeOf(c));
// What repeats while a factory runs or a fight goes on stays well under the one-off sounds.
export const SOUND_LEVEL = {gene:.1, eat:.22, dna:.3, click:.6, rotate:.6, hit:.3, turret:.4, sting:.4, maw:.45, damaged:.35, throw:.5, done:.6};
// Each effect: its family for the lab, its name, and how it is drawn (b = blip at an offset in seconds).
export const SOUNDS = {
  click:{group:'Interface', name:'Button', play:b => b(0, {wave:'square', from:1800, to:1200, dur:.05, gain:.08})},
  open:{group:'Interface', name:'Family or menu opens', play:b => { b(0, {from:300, to:620, dur:.18, gain:.18}); b(0, {noise:true, from:800, to:2400, dur:.18, gain:.06, band:2}); }},
  refuse:{group:'Interface', name:'Refused', play:b => { b(0, {wave:'square', from:220, to:180, dur:.1, gain:.1}); b(.11, {wave:'square', from:180, to:140, dur:.14, gain:.1}); }},
  step:{group:'Interface', name:'Guide step done', play:b => { b(0, {from:880, dur:.18, gain:.16}); b(.09, {from:1320, dur:.3, gain:.14}); }},
  dna:{group:'Interface', name:'DNA earned', play:b => { b(0, {from:320, to:190, dur:.14, gain:.16}); b(0, {noise:true, from:500, to:260, dur:.1, gain:.04, band:3}); }},
  place:{group:'Building', name:'Building placed', play:b => { b(0, {noise:true, from:900, to:300, dur:.18, gain:.22, band:1.5}); b(0, {from:180, to:90, dur:.16, gain:.25}); }},
  belt:{group:'Building', name:'Belt laid', play:b => b(0, {noise:true, from:2500, to:1100, dur:.25, gain:.12, band:3})},
  bridge:{group:'Building', name:'Bridge laid', play:b => { b(0, {wave:'triangle', from:400, to:380, dur:.3, gain:.16}); b(.02, {wave:'triangle', from:600, to:590, dur:.25, gain:.1}); }},
  rotate:{group:'Building', name:'Rotate', play:b => { b(0, {wave:'square', from:2600, dur:.03, gain:.06}); b(.05, {wave:'square', from:2200, dur:.03, gain:.06}); }},
  done:{group:'Building', name:'Construction done', play:b => { b(0, {from:660, dur:.25, gain:.14}); b(.08, {from:990, dur:.35, gain:.12}); }},
  dismantle:{group:'Building', name:'Dismantled', play:b => { b(0, {noise:true, from:1200, to:200, dur:.35, gain:.18, band:1}); b(0, {wave:'sawtooth', from:200, to:60, dur:.3, gain:.08}); }},
  rank:{group:'Building', name:'Rank up', play:b => { b(0, {from:440, to:880, dur:.3, gain:.14}); b(.12, {from:660, to:1320, dur:.35, gain:.12}); }},
  gene:{group:'Production', name:'Ligase makes a gene', play:b => { b(0, {from:500, to:900, dur:.12, gain:.14}); b(.03, {noise:true, from:1200, to:600, dur:.1, gain:.05, band:4}); }},
  eat:{group:'Production', name:'Core eats a gene', play:b => b(0, {from:220, to:110, dur:.3, gain:.22})},
  turret:{group:'Fight', name:'Turret fires', play:b => { b(0, {noise:true, from:3000, to:800, dur:.09, gain:.16, band:1}); b(0, {wave:'square', from:900, to:300, dur:.06, gain:.05}); }},
  sting:{group:'Fight', name:'Sting fires', play:b => b(0, {from:2400, to:1200, dur:.08, gain:.12})},
  maw:{group:'Fight', name:'Maw fires', play:b => { b(0, {wave:'sawtooth', from:160, to:60, dur:.25, gain:.12}); b(0, {noise:true, from:600, to:200, dur:.2, gain:.1, band:1}); }},
  hit:{group:'Fight', name:'Creature hit', play:b => b(0, {noise:true, from:1500, to:900, dur:.06, gain:.12, band:2})},
  kill:{group:'Fight', name:'Creature killed', play:b => { b(0, {noise:true, from:800, to:100, dur:.3, gain:.2, band:1}); b(0, {from:300, to:80, dur:.25, gain:.12}); }},
  throw:{group:'Fight', name:'Creature thrown out', play:b => b(0, {noise:true, from:400, to:1400, dur:.3, gain:.12, band:2})},
  damaged:{group:'Fight', name:'Building damaged', play:b => b(0, {wave:'square', from:140, to:100, dur:.15, gain:.1})},
  destroyed:{group:'Fight', name:'Building destroyed', play:b => { b(0, {noise:true, from:1500, to:80, dur:.7, gain:.24, band:.8}); b(0, {wave:'sawtooth', from:120, to:40, dur:.6, gain:.1}); }},
  core_hit:{group:'Fight', name:'Core hit', play:b => b(0, {from:90, to:50, dur:.4, gain:.3})},
  stage_up:{group:'Moments', name:'Stage reached', play:b => { b(0, {from:523, dur:.4, gain:.16}); b(.15, {from:659, dur:.4, gain:.16}); b(.3, {from:784, dur:.8, gain:.16}); }},
  game_over:{group:'Moments', name:'Game over', play:b => { b(0, {from:392, to:196, dur:1.6, gain:.2}); }},
  nest_down:{group:'Moments', name:'Nest destroyed', play:b => b(0, {noise:true, from:600, to:60, dur:1, gain:.25, band:.7})},
  mutation:{group:'Moments', name:'Mutation', play:b => { b(0, {wave:'sawtooth', from:110, to:104, dur:1.2, gain:.08}); b(0, {from:1400, to:1310, dur:1, gain:.06}); }},
  assault_alarm:{group:'Moments', name:'Assault coming', play:b => { b(0, {wave:'square', from:440, to:660, dur:.4, gain:.08}); b(.45, {wave:'square', from:440, to:660, dur:.4, gain:.08}); }},
  hex:{group:'Planet', name:'Hexagon picked', play:b => b(0, {from:1200, dur:.06, gain:.08})},
  zoom:{group:'Planet', name:'Zoom into a game', play:b => b(0, {noise:true, from:300, to:2000, dur:.9, gain:.12, band:1.5})},
};
// gap: the least time between two of the same, in seconds, so a fight does not pile one sound up.
// where: its loudness and side from placeOf, for a sound that comes from a place on the map.
// Moments, not noises: while one plays the music steps back to a third, then comes back with its fade.
export const DUCKED = new Set(['stage_up', 'mutation', 'nest_down', 'game_over', 'assault_alarm']);
export const duck = seconds => { music.duckUntil = Math.max(music.duckUntil || 0, performance.now() + seconds * 1000 + 250); };
// The installed site found a new version (site/register.js): during a game the player chooses when, elsewhere it applies at once.
window.offerUpdate = apply => {
  if (!slotKey || orbit.on) { apply(); return; }
  tell(L('Nouvelle version disponible : touche ici pour mettre à jour.'), {act: () => { keepForReload(); apply(); }});
};
for (const id of ['fr', 'en']) {
  $(`lang-${id}`).setAttribute('aria-pressed', id === LANG);
  $(`lang-${id}`).onclick = () => setLang(id);
  $(`pick-${id}`).onclick = () => { $('lang-pick').close(); setLang(id); };
}
$('lang-pick').addEventListener('cancel', event => event.preventDefault());
document.addEventListener('DOMContentLoaded', () => {
  if (LAB.on) { startLab(); return; }
  if (!LANG_SET) $('lang-pick').showModal();
  try { if (sessionStorage.getItem('strainworks-resume')) { sessionStorage.removeItem('strainworks-resume'); resumeLast(); } } catch (_) { /* blocked storage: the planet opens instead of the last game */ }
});
$('perf-toggle').onclick = () => { showPerf(!PERF.on); keep(PERF_KEY, PERF.on ? 'on' : 'off'); };
// Time spent in the background is not a stall of the game.
document.addEventListener('visibilitychange', () => { if (PERF.on && !document.hidden) perfReset(); });
showPerf(stored(PERF_KEY) === 'on');

growDock();
resize();
setMotion(stored(MOTION_KEY) === 'less');
markView(stored(VIEW_KEY) !== '2d');
// A world to stand on, kept nowhere, until a hexagon is picked.
begin();
forgetEvents();
findGames();
openPlanet(true);
new ResizeObserver(resize).observe($('board'));


// ---- The lab. A throwaway game: never saved (no slot key), drawn in 3D, one specimen on ground with no deposit.
export const LAB_GENES = {S:'SSF', F:'FFC', C:'CCN', N:'NNS'};
// The sounds of the game in one place: each piece, each moment as the game plays it, each effect.
// Generated sounds waiting to be chosen, each in two takes. The build serves every file named here.
export const LAB_FILES = [
  'sounds/stage_up_1.mp3',
  'sounds/stage_up_2.mp3',
  'sounds/game_over_1.mp3',
  'sounds/game_over_2.mp3',
  'sounds/nest_down_1.mp3',
  'sounds/nest_down_2.mp3',
  'sounds/mutation_1.mp3',
  'sounds/mutation_2.mp3',
  'sounds/assault_alarm_1.mp3',
  'sounds/assault_alarm_2.mp3',
  'sounds/station_loop_1.mp3',
  'sounds/station_loop_2.mp3',
  'sounds/ui_click_1.mp3',
  'sounds/ui_click_2.mp3',
  'sounds/ui_dna_1.mp3',
  'sounds/ui_dna_2.mp3',
  'sounds/ui_open_1.mp3',
  'sounds/ui_open_2.mp3',
  'sounds/ui_refuse_1.mp3',
  'sounds/ui_refuse_2.mp3',
  'sounds/ui_step_1.mp3',
  'sounds/ui_step_2.mp3',
  'sounds/build_belt_1.mp3',
  'sounds/build_belt_2.mp3',
  'sounds/build_bridge_1.mp3',
  'sounds/build_bridge_2.mp3',
  'sounds/build_dismantle_1.mp3',
  'sounds/build_dismantle_2.mp3',
  'sounds/build_done_1.mp3',
  'sounds/build_done_2.mp3',
  'sounds/build_place_1.mp3',
  'sounds/build_place_2.mp3',
  'sounds/build_rank_1.mp3',
  'sounds/build_rank_2.mp3',
  'sounds/build_rotate_1.mp3',
  'sounds/build_rotate_2.mp3',
  'sounds/prod_eat_1.mp3',
  'sounds/prod_eat_2.mp3',
  'sounds/prod_gene_1.mp3',
  'sounds/prod_gene_2.mp3',
  'sounds/turret_fire_1.mp3',
  'sounds/turret_fire_2.mp3',
  'sounds/fight_core_hit_1.mp3',
  'sounds/fight_core_hit_2.mp3',
  'sounds/fight_damaged_1.mp3',
  'sounds/fight_damaged_2.mp3',
  'sounds/fight_destroyed_1.mp3',
  'sounds/fight_destroyed_2.mp3',
  'sounds/fight_hit_1.mp3',
  'sounds/fight_hit_2.mp3',
  'sounds/fight_kill_1.mp3',
  'sounds/fight_kill_2.mp3',
  'sounds/fight_maw_1.mp3',
  'sounds/fight_maw_2.mp3',
  'sounds/fight_sting_1.mp3',
  'sounds/fight_sting_2.mp3',
  'sounds/fight_throw_1.mp3',
  'sounds/fight_throw_2.mp3',
  'sounds/planet_hex_1.mp3',
  'sounds/planet_hex_2.mp3',
  'sounds/planet_zoom_1.mp3',
  'sounds/planet_zoom_2.mp3',
];
export const pieceName = src => src.split('/').pop().replace('strainworks_', '').replace(/(-[0-9a-f]+)?\.mp3$/, '');
export const LAB_PIECES = [['As on the planet', 'theme'], ...MUSIC.theme.map(src => [`Theme · ${pieceName(src)}`, src]), ...MUSIC.calm.map(src => [`Calm · ${pieceName(src)}`, src]), ...MUSIC.fight.map(src => [`Fight · ${pieceName(src)}`, src])];
export let labTake = null;
export let before = performance.now(), owed = 0, shownAt = 0, savedAt = 0;
// Untouched, a still screen is drawn less often: 15 images a second in pause, 30 on the planet.
export let stirred = performance.now(), drawnAt = 0, planetOwed = 0;
for (const kind of ['pointerdown', 'pointermove', 'wheel', 'keydown', 'resize']) addEventListener(kind, () => { stirred = performance.now(); }, {capture:true, passive:true});
export const resting = (now, after, every) => now - stirred > after && now - drawnAt < every;
refresh();
requestAnimationFrame(frame);

