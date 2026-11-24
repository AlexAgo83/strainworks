import { LANG_KEY, LANG_SET } from "./lang.js";
import { DEC, L, LANG, LOCALE } from "../sim/text.ts";
import { hooks } from "../sim/hooks.ts";
import { W, H, STEP, SECTOR, OUTPOST, OX, OY, DX, DY, PAIR, BASE, TYPES, TRAITS, TRAIT_SETS, hasTrait, VEIN, WORM, STAGES, BOX, fill, PACK, GUNS, GLUE, isGun, SPLIT, isSplit, splitExits, BIG, BORER, sizeOf, centreOf, footprint, edgesOf, covering, coreIn, coreCell, cellAt, buried, boxOf, contentOf, GROWTH_BONUS, CORE, NORTH, INNER, OUTER, FIELDS, DEPOSIT, RICH, richness, CALM, keepsNest, nestBy, nest, spotHash, PINNED, patches, makePatch, patchOf, survey, matterUnder, richUnder, sectors, worldSeed, newSeed, atHome, dice, sector, LEVEL, tierAt, mod, nestSector, generate, SIGHT, RADAR, live, passingBy, standing, movedFrom, fogTick, bitAt, inSight, lightUp, look, eachSector, depositAt, richAt, G, isBelt, key, minable, opposite, START_DNA, gunPrice, PRICE, owned, refund, BUILDERS, NEW_DRONES, START_DRONES_OF, labLevel, REAPER, reaperReach, outSide, reap, reachOf, DRONE, BUILD, built, REPAIR, fullHp, healing, unlocked, richCap, RANKS, GUN_RANK, WALL_RANK, HOLD, capOf, BELT_SPEED, rankOf, rankCost, perSecond, dropRise, exitsOf, paces, follows, uncapped, paceOf, mouthPace, ahead, cell, cellMemo, pumpMemo, forgetCells, allCells, put, sites, perch, hatchDrones, jobId, at, workTime, unlink, finishJob, workAt, construct, repair, earn, eat, mealWindow, mealRate, digest, RECIPES, drawGene, drawGoals, grow, fresh, portOf, fits, sideExit, wayOf, pumps, drains, span, leaking, nearest, network, veinKind, pulse, trackSize, wormHolds, holdCap, pocketCap, isBig, trackAfter, pocketsAt, stationHead, dropWorm, transfer, mayLeave, crawl, carbonSide, packPort, packTakes, setRecipe, strandPort, joinSide, joinPort, NERVE, NET, NET_HOPS, carries, sight, VIEW, heardOf, sense, ARM, armBeat, armHolds, armReach, liftable, lift, netOf, coreWants, listens, WHEN, DESK, gateStore, gateCondition, gateOpen, WATCHES, asked, connects, accepts, CROSS, stamp, settled, intoStock, intoPort, readyPort, receive, advance, flow, MUTATION, familyCap, breed, mutationTarget, mutation, mutate, bearing, nearestBuilding, wake, disturb, CORPSE, corpseSunk, NEST, nestHp, CREATURE, KINDS, kindOf, spawn, destroyNest, waveGene, menace, glueOver, damage, fire, slain, loadedOf, puff, pierce, step, exitOf, remove, hungry, simSet } from "../sim/sim.ts";
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
  accepts: [() => accepts, v => { simSet.accepts(v); }],
  ahead: [() => ahead],
  allCells: [() => allCells, v => { simSet.allCells(v); }],
  along: [() => along, v => { along = v; }],
  armReach: [() => armReach, v => { simSet.armReach(v); }],
  armed: [() => armed, v => { armed = v; }],
  arrow: [() => arrow, v => { arrow = v; }],
  arrows: [() => arrows],
  asked: [() => asked, v => { simSet.asked(v); }],
  at: [() => at],
  before: [() => before, v => { before = v; }],
  begin: [() => begin, v => { begin = v; }],
  boxOf: [() => boxOf],
  breachesIn: [() => breachesIn, v => { breachesIn = v; }],
  build: [() => build, v => { build = v; }],
  buildable: [() => buildable],
  built: [() => built],
  buried: [() => buried],
  button: [() => button, v => { button = v; }],
  buyLab: [() => buyLab, v => { buyLab = v; }],
  cam: [() => cam],
  canvas: [() => canvas],
  capOf: [() => capOf],
  carbonSide: [() => carbonSide, v => { simSet.carbonSide(v); }],
  carries: [() => carries, v => { simSet.carries(v); }],
  cell: [() => cell, v => { simSet.cell(v); }],
  cellAt: [() => cellAt],
  centreOf: [() => centreOf],
  chain: [() => chain, v => { chain = v; }],
  checkGame: [() => checkGame, v => { checkGame = v; }],
  choose: [() => choose, v => { choose = v; }],
  circle: [() => circle, v => { circle = v; }],
  connects: [() => connects, v => { simSet.connects(v); }],
  contentOf: [() => contentOf],
  coreCell: [() => coreCell],
  coreWants: [() => coreWants, v => { simSet.coreWants(v); }],
  corpseSunk: [() => corpseSunk],
  crate: [() => crate, v => { crate = v; }],
  creatureAt: [() => creatureAt, v => { creatureAt = v; }],
  crossing: [() => crossing],
  ctx: [() => ctx],
  cursor: [() => cursor, v => { cursor = v; }],
  damage: [() => damage, v => { simSet.damage(v); }],
  depositAt: [() => depositAt, v => { simSet.depositAt(v); }],
  diagnose: [() => diagnose, v => { diagnose = v; }],
  digest: [() => digest, v => { simSet.digest(v); }],
  drag: [() => drag, v => { drag = v; }],
  drains: [() => drains, v => { simSet.drains(v); }],
  draw: [() => draw, v => { draw = v; }],
  drawCell: [() => drawCell, v => { drawCell = v; }],
  drawFog: [() => drawFog, v => { drawFog = v; }],
  drawGoals: [() => drawGoals, v => { simSet.drawGoals(v); }],
  drawPlanet: [() => drawPlanet, v => { drawPlanet = v; }],
  drawPorts: [() => drawPorts, v => { drawPorts = v; }],
  drawPreview: [() => drawPreview, v => { drawPreview = v; }],
  dronePose: [() => dronePose, v => { dronePose = v; }],
  dropRise: [() => dropRise, v => { simSet.dropRise(v); }],
  eachSector: [() => eachSector, v => { simSet.eachSector(v); }],
  earn: [() => earn, v => { simSet.earn(v); }],
  eat: [() => eat, v => { simSet.eat(v); }],
  edgesOf: [() => edgesOf, v => { simSet.edgesOf(v); }],
  exitOf: [() => exitOf, v => { simSet.exitOf(v); }],
  extend: [() => extend, v => { extend = v; }],
  feeders: [() => feeders, v => { feeders = v; }],
  fieldsIn: [() => fieldsIn, v => { fieldsIn = v; }],
  fill: [() => fill],
  fire: [() => fire, v => { simSet.fire(v); }],
  fits: [() => fits, v => { simSet.fits(v); }],
  flat: [() => flat],
  flinchOf: [() => flinchOf],
  flipCorner: [() => flipCorner, v => { flipCorner = v; }],
  flow: [() => flow, v => { simSet.flow(v); }],
  follows: [() => follows],
  footprint: [() => footprint, v => { simSet.footprint(v); }],
  forgetCells: [() => forgetCells, v => { simSet.forgetCells(v); }],
  formOf: [() => formOf],
  foundGame: [() => foundGame, v => { foundGame = v; }],
  fr: [() => fr],
  frame: [() => frame, v => { frame = v; }],
  freeHex: [() => freeHex, v => { freeHex = v; }],
  fresh: [() => fresh, v => { simSet.fresh(v); }],
  fullHp: [() => fullHp],
  fx: [() => fx],
  gateGreen: [() => gateGreen],
  gesture: [() => gesture, v => { gesture = v; }],
  glide: [() => glide, v => { glide = v; }],
  glueOver: [() => glueOver, v => { simSet.glueOver(v); }],
  glyph: [() => glyph, v => { glyph = v; }],
  grow: [() => grow, v => { simSet.grow(v); }],
  guideLigase: [() => guideLigase, v => { guideLigase = v; }],
  handRank: [() => handRank],
  hasTrait: [() => hasTrait],
  hatchDrones: [() => hatchDrones, v => { simSet.hatchDrones(v); }],
  heading: [() => heading, v => { heading = v; }],
  heard: [() => heard],
  heardOf: [() => heardOf],
  held: [() => held, v => { held = v; }],
  hexAt: [() => hexAt, v => { hexAt = v; }],
  hold: [() => hold, v => { hold = v; }],
  holdCap: [() => holdCap],
  holdsAnything: [() => holdsAnything],
  home: [() => home, v => { home = v; }],
  hovered: [() => hovered, v => { hovered = v; }],
  hungry: [() => hungry, v => { simSet.hungry(v); }],
  inHand: [() => inHand],
  inSight: [() => inSight, v => { simSet.inSight(v); }],
  incubate: [() => incubate, v => { incubate = v; }],
  inside: [() => inside],
  intro: [() => intro],
  isBelt: [() => isBelt],
  isBig: [() => isBig],
  isGun: [() => isGun],
  isSplit: [() => isSplit],
  joinSide: [() => joinSide, v => { simSet.joinSide(v); }],
  joinVein: [() => joinVein, v => { joinVein = v; }],
  keep: [() => keep, v => { keep = v; }],
  keepIt: [() => keepIt, v => { keepIt = v; }],
  key: [() => key],
  known: [() => known, v => { known = v; }],
  lamp: [() => lamp, v => { lamp = v; }],
  layTrack: [() => layTrack, v => { layTrack = v; }],
  leaking: [() => leaking, v => { simSet.leaking(v); }],
  levelOf: [() => levelOf],
  lift: [() => lift, v => { simSet.lift(v); }],
  link: [() => link, v => { link = v; }],
  linking: [() => linking, v => { linking = v; }],
  listening: [() => listening, v => { listening = v; }],
  listens: [() => listens, v => { simSet.listens(v); }],
  live: [() => live, v => { simSet.live(v); }],
  load: [() => load, v => { load = v; }],
  loadDemo: [() => loadDemo],
  look: [() => look, v => { simSet.look(v); }],
  makePatch: [() => makePatch, v => { simSet.makePatch(v); }],
  marker: [() => marker, v => { marker = v; }],
  matterUnder: [() => matterUnder],
  mealRate: [() => mealRate, v => { simSet.mealRate(v); }],
  menace: [() => menace, v => { simSet.menace(v); }],
  menuPage: [() => menuPage, v => { menuPage = v; }],
  minable: [() => minable],
  motionTime: [() => motionTime],
  music: [() => music],
  musicTick: [() => musicTick, v => { musicTick = v; }],
  mutation: [() => mutation, v => { simSet.mutation(v); }],
  mutationTarget: [() => mutationTarget, v => { simSet.mutationTarget(v); }],
  named: [() => named],
  nearest: [() => nearest, v => { simSet.nearest(v); }],
  nest: [() => nest, v => { simSet.nest(v); }],
  nestHurt: [() => nestHurt],
  netOf: [() => netOf, v => { simSet.netOf(v); }],
  netSummary: [() => netSummary, v => { netSummary = v; }],
  netWires: [() => netWires, v => { netWires = v; }],
  network: [() => network, v => { simSet.network(v); }],
  note: [() => note, v => { note = v; }],
  noteOnPlanet: [() => noteOnPlanet, v => { noteOnPlanet = v; }],
  onScreen: [() => onScreen, v => { onScreen = v; }],
  openFamily: [() => openFamily, v => { openFamily = v; }],
  openGame: [() => openGame, v => { openGame = v; }],
  openSlot: [() => openSlot, v => { openSlot = v; }],
  opposite: [() => opposite],
  orbit: [() => orbit],
  outSide: [() => outSide],
  owed: [() => owed, v => { owed = v; }],
  owned: [() => owned],
  paceOf: [() => paceOf, v => { simSet.paceOf(v); }],
  packTakes: [() => packTakes, v => { simSet.packTakes(v); }],
  paint: [() => paint, v => { paint = v; }],
  paintDrones: [() => paintDrones, v => { paintDrones = v; }],
  paintGuide: [() => paintGuide, v => { paintGuide = v; }],
  paintHud: [() => paintHud, v => { paintHud = v; }],
  paintInfo: [() => paintInfo, v => { paintInfo = v; }],
  paintMoments: [() => paintMoments, v => { paintMoments = v; }],
  pan: [() => pan, v => { pan = v; }],
  parsed: [() => parsed, v => { parsed = v; }],
  passing: [() => passing, v => { passing = v; }],
  passingBy: [() => passingBy, v => { simSet.passingBy(v); }],
  patchOf: [() => patchOf],
  patches: [() => patches, v => { simSet.patches(v); }],
  paused: [() => paused, v => { paused = v; }],
  perSecond: [() => perSecond, v => { simSet.perSecond(v); }],
  perch: [() => perch, v => { simSet.perch(v); }],
  pickHex: [() => pickHex, v => { pickHex = v; }],
  place: [() => place, v => { place = v; }],
  placeGuideSpot: [() => placeGuideSpot, v => { placeGuideSpot = v; }],
  placeOf: [() => placeOf, v => { placeOf = v; }],
  placeable: [() => placeable],
  planetList: [() => planetList, v => { planetList = v; }],
  playSound: [() => playSound, v => { playSound = v; }],
  pocketCap: [() => pocketCap],
  portSide: [() => portSide, v => { portSide = v; }],
  portsOf: [() => portsOf, v => { portsOf = v; }],
  position: [() => position, v => { position = v; }],
  preview: [() => preview, v => { preview = v; }],
  price: [() => price],
  puff: [() => puff, v => { simSet.puff(v); }],
  pulse: [() => pulse, v => { simSet.pulse(v); }],
  put: [() => put, v => { simSet.put(v); }],
  radarWave: [() => radarWave, v => { radarWave = v; }],
  raise: [() => raise, v => { raise = v; }],
  rankCost: [() => rankCost],
  rankFollowers: [() => rankFollowers, v => { rankFollowers = v; }],
  rankOf: [() => rankOf],
  reachOf: [() => reachOf],
  readList: [() => readList, v => { readList = v; }],
  reading: [() => reading, v => { reading = v; }],
  receive: [() => receive, v => { simSet.receive(v); }],
  recipe: [() => recipe, v => { recipe = v; }],
  rect: [() => rect, v => { rect = v; }],
  refresh: [() => refresh, v => { refresh = v; }],
  refund: [() => refund],
  refuse: [() => refuse, v => { refuse = v; }],
  release: [() => release, v => { release = v; }],
  remove: [() => remove, v => { simSet.remove(v); }],
  repair: [() => repair, v => { simSet.repair(v); }],
  replay: [() => replay, v => { replay = v; }],
  resize: [() => resize, v => { resize = v; }],
  resumeLast: [() => resumeLast, v => { resumeLast = v; }],
  richAt: [() => richAt, v => { simSet.richAt(v); }],
  richness: [() => richness, v => { simSet.richness(v); }],
  rotate: [() => rotate, v => { rotate = v; }],
  rowOf: [() => rowOf, v => { rowOf = v; }],
  ruinAt: [() => ruinAt],
  save: [() => save, v => { save = v; }],
  say: [() => say, v => { say = v; }],
  sceneSigns: [() => sceneSigns, v => { sceneSigns = v; }],
  scrap: [() => scrap, v => { scrap = v; }],
  scrapVein: [() => scrapVein, v => { scrapVein = v; }],
  screenAt: [() => screenAt],
  script: [() => script, v => { script = v; }],
  sector: [() => sector, v => { simSet.sector(v); }],
  sectors: [() => sectors, v => { simSet.sectors(v); }],
  select: [() => select, v => { select = v; }],
  selected: [() => selected, v => { selected = v; }],
  sense: [() => sense, v => { simSet.sense(v); }],
  setRecipe: [() => setRecipe, v => { simSet.setRecipe(v); }],
  sfx: [() => sfx],
  showActions: [() => showActions, v => { showActions = v; }],
  showIntro: [() => showIntro, v => { showIntro = v; }],
  showMenu: [() => showMenu, v => { showMenu = v; }],
  showStats: [() => showStats, v => { showStats = v; }],
  shownAt: [() => shownAt, v => { shownAt = v; }],
  shownNests: [() => shownNests, v => { shownNests = v; }],
  sideExit: [() => sideExit, v => { simSet.sideExit(v); }],
  sight: [() => sight, v => { simSet.sight(v); }],
  siteFor: [() => siteFor, v => { siteFor = v; }],
  sites: [() => sites, v => { simSet.sites(v); }],
  sizeOf: [() => sizeOf],
  slotKey: [() => slotKey, v => { slotKey = v; }],
  span: [() => span, v => { simSet.span(v); }],
  spark: [() => spark, v => { spark = v; }],
  spawn: [() => spawn, v => { simSet.spawn(v); }],
  speed: [() => speed, v => { speed = v; }],
  splitExits: [() => splitExits],
  stagePart: [() => stagePart, v => { stagePart = v; }],
  stamp: [() => stamp, v => { simSet.stamp(v); }],
  startGuide: [() => startGuide, v => { startGuide = v; }],
  station3d: [() => station3d],
  stationHead: [() => stationHead, v => { simSet.stationHead(v); }],
  step: [() => step, v => { simSet.step(v); }],
  stockOf: [() => stockOf, v => { stockOf = v; }],
  stored: [() => stored, v => { stored = v; }],
  stretch: [() => stretch, v => { stretch = v; }],
  survey: [() => survey, v => { simSet.survey(v); }],
  tell: [() => tell, v => { tell = v; }],
  tierAt: [() => tierAt],
  tileCentre: [() => tileCentre],
  timed: [() => timed, v => { timed = v; }],
  toggleFamily: [() => toggleFamily, v => { toggleFamily = v; }],
  tool: [() => tool, v => { tool = v; }],
  trackAfter: [() => trackAfter, v => { simSet.trackAfter(v); }],
  trackAt: [() => trackAt],
  trackSize: [() => trackSize],
  turn: [() => turn, v => { turn = v; }],
  turnWay: [() => turnWay, v => { turnWay = v; }],
  ui: [() => ui],
  unlocked: [() => unlocked],
  view: [() => view, v => { view = v; }],
  view3d: [() => view3d, v => { view3d = v; }],
  wake: [() => wake, v => { simSet.wake(v); }],
  waveGene: [() => waveGene, v => { simSet.waveGene(v); }],
  wayOf: [() => wayOf, v => { simSet.wayOf(v); }],
  wipe: [() => wipe, v => { wipe = v; }],
  wireUp: [() => wireUp, v => { wireUp = v; }],
  wiring: [() => wiring, v => { wiring = v; }],
  within: [() => within],
  workAt: [() => workAt, v => { simSet.workAt(v); }],
  worldAt: [() => worldAt, v => { worldAt = v; }],
  wormId: [() => wormId, v => { wormId = v; }],
  wormState: [() => wormState, v => { wormState = v; }],
  woven: [() => woven],
  write: [() => write, v => { write = v; }]
};
for (const [name, [get, set]] of Object.entries(WINDOW_API)) Object.defineProperty(globalThis, name, {get, set, configurable:true});
// The simulation's hooks, each calling the interface's function of that name when it is called.
Object.assign(hooks, {noteEarned: (...a) => noteEarned(...a), forgetEvent: (...a) => forgetEvent(...a), onFresh: (...a) => onFresh(...a), testLine: (...a) => testLine(...a), jobDone: (...a) => jobDone(...a), wormGone: (...a) => wormGone(...a), say: (...a) => say(...a), refuse: (...a) => refuse(...a), playNear: (...a) => playNear(...a), playSound: (...a) => playSound(...a), refresh: (...a) => refresh(...a), tell: (...a) => tell(...a), showActions: (...a) => showActions(...a), select: (...a) => select(...a), diagnose: (...a) => diagnose(...a), save: (...a) => save(...a), setHeading: (...a) => setHeading(...a), heard: (...a) => heard(...a), placeOf: (...a) => placeOf(...a), drawsRecipes: (...a) => drawsRecipes(...a), stored: (...a) => stored(...a)});

// ---- Languages: the text and its language live in src/sim/text.ts, the choice in lang.js.
// The lab (?lab): every 3D model on clean ground, its state shown and edited. A dev page, in English.
const LAB = {on:new URLSearchParams(location.search).has('lab')};
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
const LIMIT = 1e5;
const GENES = {SFS:L('Moteur'), FFF:L('Soute'), FSF:L('Bouche'), SSS:L('Racine'), CCF:L('Carapace'), CFC:L('Dard'), CCC:L('Lame'), CSC:L('Acide'), NFN:L('Œil'), SSN:L('Soin'), NSN:L('Flair'), FNF:L('Pulsation'), NNN:L('Mémoire'), NCN:L('Commande'), CNS:L('Mutation'), SNS:L('Instinct')};
const ruinAt = (x, y) => covering(G.ruins, x, y);
// The finger may be on any of the four cells: the first square round it that fits, else why the first does not.
function siteFor(type, x, y) {
  let first = null;
  for (const [i, j] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
    const site = {type, x:x - i, y:y - j}, cells = footprint(site);
    const bare = cells.find(p => !placeable(p.x, p.y));
    if (bare) site.why = whyNot(bare.x, bare.y);
    else if (cells.some(p => cellAt(p.x, p.y) || (G.bigTracks && trackAt(p.x, p.y)))) site.why = L('Il faut 2 × 2 cases libres');
    else if (type === 'lab' && allCells().some(c => c.type === 'lab')) site.why = L('Le Laboratoire est unique');
    else if (type === 'reaper' && allCells().some(c => c.type === 'reaper')) site.why = L('Le Recycleur est unique');
    else if (type === 'borer') {
      const kind = depositAt(site.x, site.y);
      if (!kind || cells.some(p => depositAt(p.x, p.y) !== kind)) site.why = L('4 cases d’un même gisement');
    }
    if (!site.why) return site;
    first ||= site;
  }
  return first;
}
const NEEDS = {desk:2, reaper:5, unbind:5, unjoin:4, glue:1, mist:3, harpoon:4, arm:1, screen:2, flip:1, unpack:1, relay:2, radar:2, split:1, sort:1, pack:1, borer:2, vault:2, pump:4, join:2, wire:2, track:3, pocket:3, worm:3};
// What lay there before the map breathed, to tell what an older game's harvesters stand on.
const CROWDED = [
  ...OUTER, ['S',34,44,4,3], ['F',28,52,3,4], ['F',41,67,4,3], ['S',66,50,3,4], ['C',20,42,5,5], ['N',74,42,5,5],
  ['S',23,66,6,4], ['F',67,66,6,4], ['N',40,12,5,4], ['S',6,50,5,6], ['F',85,52,5,6]
];
// A game saved with more loses those still asleep. One that woke finishes its fight.
const inLayout = b => Boolean(b.id) || [NORTH[0], ...OUTER.map(nestBy)].some(spot => spot && spot.x === b.x && spot.y === b.y);
function thinNests() {
  const all = G.breaches;
  G.breaches = all.filter(b => b.state !== 'sleep' || (keepsNest(b) && inLayout(b)));
  for (const e of G.enemies || []) if (e.home != null) e.home = G.breaches.indexOf(all[e.home]);
}
// The world as it was dealt before it was spread out, only to know what an older harvester stands on.
function crowdedField(sx, sy) {
  const left = sx * SECTOR, top = sy * SECTOR, chance = dice(sx, sy, 1);
  if (chance > .72) return chance > .86 ? ['K', left + 12, top + 12, 5 + Math.floor(dice(sx, sy, 9) * 3), 5] : null;
  const roll = n => dice(sx, sy, n), away = Math.hypot(left + SECTOR / 2 - CORE.x, top + SECTOR / 2 - CORE.y);
  const grown = Math.min(3, Math.floor(away / 120)), w = 5 + grown + Math.floor(roll(2) * 3), h = 4 + grown + Math.floor(roll(3) * 3);
  return ['SFCN'[Math.floor(roll(6) * 4)], left + 8 + Math.floor(roll(4) * (17 - w)), top + 8 + Math.floor(roll(5) * (17 - h)), w, h];
}
function keepHarvests() {
  for (const c of [...allCells(), ...Object.values(G.ruins)]) {
    if ((c.type !== 'mine' && c.type !== 'borer') || c.on) continue;
    const home = atHome(c.x, c.y);
    const found = home ? [...(G.far ? [] : INNER), ...CROWDED] : [crowdedField(Math.floor(c.x / SECTOR), Math.floor(c.y / SECTOR))].filter(Boolean);
    // Inside its rectangle, or on a splash round it.
    const off = ([, x, y, w, h]) => Math.hypot(Math.max(x - c.x, 0, c.x - x - w + 1), Math.max(y - c.y, 0, c.y - y - h + 1));
    const was = found.filter(f => off(f) <= 5.5).sort((a, b) => off(a) - off(b))[0];
    if (!was) continue;
    const rich = home ? richness(was[1] + was[3] / 2, was[2] + was[4] / 2) : was[0] === 'K' ? 2 : 4;
    if (footprint(c).every(p => depositAt(p.x, p.y) === was[0] && richAt(p.x, p.y) === rich)) continue;
    c.on = was[0]; c.onRich = rich;
  }
}
// A nest the spread-out world would have dealt over what an older game built is not dealt: none wakes on loading.
function spreadOut() {
  keepHarvests();
  const built = [...allCells(), ...Object.values(G.tracks)].filter(c => c.type !== 'core'), cleared = new Set(), points = [];
  for (const c of built) {
    for (const p of c.type ? footprint(c) : [c]) points.push(p);
    const to = c.to && G.cells[c.to];
    if (to) for (let i = 1, n = Math.ceil(span(c, to)); i < n; i++) points.push({x:c.x + (to.x - c.x) * i / n, y:c.y + (to.y - c.y) * i / n});
  }
  for (const p of points) eachSector(p.x - SECTOR, p.y - SECTOR, p.x + SECTOR, p.y + SECTOR, s => {
    if (s.breach && Math.hypot(p.x - s.breach.x, p.y - s.breach.y) <= s.breach.r + 1) cleared.add(s.breach.id);
  });
  G.cleared = [...cleared];
  simSet.sectors(new Map());
  G.breaches.forEach((b, i) => { b.form ??= i % 4; });
  G.world = 2;
}
const levelOf = b => (b.tier || 0) + 1;
const formOf = b => b.form ?? Math.floor(spotHash(b.x, b.y, 30) * 4);
function radarWave(c, t) {
  if (!built(c)) return null;
  if (selected === key(c.x, c.y)) return (t / RADAR.pulse) % 1;
  const since = G.time - (c.shownAt ?? -1e9);
  return since < RADAR.pulse * 2 ? (since / RADAR.pulse) % 1 : null;
}
function known(x, y) { return bitAt(id => G.seen?.[id], x, y); }
// A nest as the player knows it, or nothing.
function shownNests(x0, y0, x1, y1) {
  const shown = [];
  for (const b of breachesIn(x0, y0, x1, y1)) {
    if (!known(b.x, b.y)) continue;
    const as = inSight(b.x, b.y) || (!b.known && b.state !== 'spent') ? b : b.known ? {...b, ...b.known} : null;
    if (as) shown.push(as);
  }
  return shown;
}
const whyNot = (x, y) => !known(x, y) ? L('Zone inconnue : approche tes structures') : !buildable(x, y) ? L('Zone de ruche') : '';
const placeable = (x, y) => !whyNot(x, y);
function fieldsIn(x0, y0, x1, y1) {
  // A patch splashes up to four cells out of its rectangle.
  const meets = ([, x, y, w, h]) => x - 4 <= x1 && x + w + 4 >= x0 && y - 4 <= y1 && y + h + 4 >= y0;
  const found = FIELDS.filter(meets);
  eachSector(x0, y0, x1, y1, s => { if (meets(s.field)) found.push(s.field); });
  return found;
}
// Every breach whose circle meets the box, woken or not.
function breachesIn(x0, y0, x1, y1) {
  const meets = b => b.x + b.r >= x0 && b.x - b.r <= x1 && b.y + b.r >= y0 && b.y - b.r <= y1;
  const found = G.breaches.filter(meets), woken = new Set(G.breaches.map(b => b.id));
  eachSector(x0 - 16, y0 - 16, x1 + 16, y1 + 16, s => { if (s.breach && !woken.has(s.breach.id) && meets(s.breach)) found.push(s.breach); });
  return found;
}

let wormId = null;
// The way the next piece faces is the player's, kept from one piece, one game and one visit to the next.
const HEADING_KEY = 'strainworks-heading';
const WAYS = [L('haut'), L('droite'), L('bas'), L('gauche')];
let heading = 0;
try { heading = [0, 1, 2, 3].find(d => String(d) === localStorage.getItem(HEADING_KEY)) ?? 0; } catch (_) {}
function setHeading(dir) {
  heading = dir;
  try { localStorage.setItem(HEADING_KEY, dir); } catch (_) {}
}
let tool = 'hand', selected = null, chain = [], paused = false, speed = 1, note = '';

const $ = id => document.getElementById(id);
const buildable = (x, y) => inside(x, y) && !breachesIn(x, y, x, y).some(h => h.state !== 'spent' && Math.hypot(x - h.x, y - h.y) < 3.5);
const inside = (x, y) => Math.abs(x) < LIMIT && Math.abs(y) < LIMIT;
const MATTER = {...BASE, K:L('Carbone'), I:L('Isotope')};
// A base in a sentence has its name and its drawing.
const named = base => MATTER[base] ? `${MATTER[base].toLowerCase()} ${base}` : 'rien';
function itemName(item) {
  const box = boxOf(item);
  if (box) return `${BOX[box].name.toLowerCase()} ${contentOf(item)}`;
  return MATTER[item] ? named(item) : (item.length === 6 ? L('brin ') : L('gène ')) + item;
}
const geneName = gene => GENES[gene] ? `${GENES[gene]} (${gene})` : gene;
const price = type => PRICE[type] ? PRICE[type](owned(type)) : 0;
const MOST_DRONES = 6;
const UPGRADES = {
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
const LAB_TABS = {drones:L('Drones'), defense:L('Défense'), logistics:L('Logistique'), recycler:L('Recycleur')};
// Drones bought: a game from before counts the ones it already had.
const dronesBought = () => Math.max(0, (G.drones?.length || START_DRONES_OF()) - START_DRONES_OF());
const labNext = id => id === 'drones' ? dronesBought() : labLevel(id);
function labPrice(id) {
  const price = UPGRADES[id].prices[labNext(id)];
  return price == null ? null : id === 'drones' && G.labDiscount ? Math.ceil(price / 2) : price;
}
// Buys the next level of an upgrade: a lab standing, its stage reached, the DNA paid.
function buyLab(id) {
  const up = UPGRADES[id], next = labNext(id), price = labPrice(id);
  if (!allCells().some(c => c.type === 'lab' && built(c))) return refuse(L('Il faut un Laboratoire construit pour acheter des améliorations.'));
  if (price == null || (id === 'drones' && G.drones.length >= MOST_DRONES)) return refuse(L`${up.name} : déjà au plus haut.`);
  if (!unlocked(up.stages[next] - 1)) return refuse(L`${up.name} niveau ${next + 1} : stade ${up.stages[next]}.`);
  if (price > G.dna) return refuse(L`Il manque ${price - G.dna} ADN pour ${up.name.toLowerCase()}.`);
  G.dna -= price;
  if (id === 'drones') {
    G.labDiscount = false;
    const {x, y} = perch(G.drones.length);
    G.drones.push({x, y, a:0, h:.55, w:0, trip:'nest', speed:DRONE.speed, job:'', goal:null, was:{x, y, h:.55, w:0}});
  } else (G.lab ||= {})[id] = next + 1;
  playSound('stage_up');
  tell(L`${up.name} : niveau ${next + 1}.`);
  refresh();
  return true;
}
// Three ranks of belts and harvesters, paid in ADN: a rank is earned, not given. cost is from the first rank, time is a drone's.
// MK2 opens with the second stage, MK3 with the fourth (the stage to complete first, as NEEDS counts).
const RANK_NEED = [0, 1, 4];
const rankOpen = mk => unlocked(RANK_NEED[mk - 1]);
const upCost = (c, mk) => rankCost(c.type, mk) - rankCost(c.type, rankOf(c));
const canRise = (c, mk) => Boolean(RANKS[c.type]) && c.up == null && c.out == null && rankOf(c) < mk && rankOpen(mk);
function raise(list, mk) {
  const todo = list.filter(c => canRise(c, mk)), cost = todo.reduce((sum, c) => sum + upCost(c, mk), 0);
  if (!todo.length) return false;
  if (cost > G.dna) { refuse(L`Il manque ${cost - G.dna} ADN pour passer ${todo.length > 1 ? L('cette ligne') : L('ça')} en MK${mk}.`); return false; }
  G.dna -= cost;
  for (const c of todo) {
    const paid = upCost(c, mk);
    // Not built yet: it is built at that rank.
    if (c.left > 0) { c.mk = mk; continue; }
    Object.assign(c, {up:RANKS[c.type].time, upTo:mk, upPaid:paid, upOrder:G.seq = (G.seq || 0) + 1});
  }
  return true;
}
function rankFollowers() {
  if (G.ranked) return;
  G.ranked = true;
  const list = allCells().filter(c => hasTrait(c.type, 'capped') && c.mk == null);
  simSet.uncapped(true); paces.clear();
  const ranks = list.map(c => paceOf(c) / BELT_SPEED);
  simSet.uncapped(false); paces.clear();
  list.forEach((c, i) => { if (ranks[i] > 1) c.mk = ranks[i]; });
}
// The row a belt is in: on through bridges and gates, up to a machine or to where another row takes over.
function rowOf(c) {
  const before = belt => {
    const all = feeders(belt), from = all.find(f => f.dir === belt.dir) || (all.length === 1 ? all[0] : null);
    if (!from) return null;
    let at = from.c;
    while (at?.type === 'bridge') at = ahead(at, (from.dir + 2) % 4);
    return isBelt(at) && at.dir === from.dir ? at : null;
  };
  const after = belt => {
    let at = ahead(belt);
    while (at?.type === 'bridge' && wayOf(at, belt.dir % 2) === belt.dir) at = ahead(at, belt.dir);
    return isBelt(at) && before(at) === belt ? at : null;
  };
  const row = new Set([c]);
  for (let at = before(c); at && !row.has(at); at = before(at)) row.add(at);
  for (let at = after(c); at && !row.has(at); at = after(at)) row.add(at);
  return [...row];
}
function build(type, x, y, dir) {
  const c = put(type, x, y, dir);
  c.left = BUILD[type] || 0; c.order = G.seq = (G.seq || 0) + 1;
  return c;
}
// How much of it stands: grows while it is built, shrinks while it is taken down.
const woven = c => Math.max(0, Math.min(1, c.cut ? c.out / workTime(c) : 1 - (c.left || 0) / workTime(c)));
// Asks for a drone. A site nobody started has nothing to take down: it goes at once.
function scrap(c, now) {
  if (c.out != null || c.type === 'core') return;
  c.unfinished = (c.left || 0) > 0;
  dropRise(c);
  const total = workTime(c);
  if (c.left >= total - 1e-9) return now();
  c.out = total;
  if (c.left > 0) { c.out = total - c.left; c.left = 0; c.cut = true; }
  c.outOrder = G.seq = (G.seq || 0) + 1;
}
function scrapVein(c) {
  if (c.veinOut != null) return;
  const total = workTime(c, true);
  if (c.veinLeft >= total - 1e-9) return unlink(c);
  c.veinOut = total;
  if (c.veinLeft > 0) { c.veinOut = total - c.veinLeft; c.veinLeft = 0; c.veinCut = true; }
  c.veinOutOrder = G.seq = (G.seq || 0) + 1;
}
// Changing one's mind: what was undone has to be built again.
function keepIt(c) {
  if (c.out == null) return;
  if (c.cut) { c.left = Math.max(0, workTime(c) - c.out); c.order = G.seq = (G.seq || 0) + 1; }
  delete c.out; delete c.cut; delete c.outOrder; delete c.unfinished;
}
function keepVein(c) {
  if (c.veinOut == null) return;
  if (c.veinCut) { c.veinLeft = Math.max(0, workTime(c, true) - c.veinOut); c.veinOrder = G.seq = (G.seq || 0) + 1; }
  delete c.veinOut; delete c.veinCut; delete c.veinOutOrder;
}
// Where to draw a drone: between two ticks, and circling its site while it works.
function dronePose(d) {
  const k = Math.max(0, Math.min(1, owed / STEP)), mix = name => d.was[name] + (d[name] - d.was[name]) * k;
  const w = mix('w'), turn = (G.time + owed) * 2.6 + G.drones.indexOf(d) * 2.1;
  const x = mix('x') + Math.cos(turn) * .7 * w, y = mix('y') + Math.sin(turn) * .7 * w;
  const facing = d.goal && w > .5 ? Math.atan2(d.goal.y - y, d.goal.x - x) : d.a;
  return {x, y, w, a:facing, h:mix('h'), goal:d.goal, undo:d.undo};
}
// Every gain of ADN, by source: fractions wait in G.dnaBits until they make a whole one.
const EARN = {core:L('Surplus du cœur'), kills:L('Combats'), breaches:L('Brèches vidées'), stage:L('Stades'), guide:L('Guide')};
const RECIPES_KEY = 'strainworks-recipes';
const drawsRecipes = () => stored(RECIPES_KEY) !== 'fixed';
// How far the stage is, 0 to 1, or null past the last stage.
function stagePart() {
  if (G.stage >= STAGES.length) return null;
  if (G.goals) { const all = G.goals.reduce((a, g) => a + g.count, 0); return all ? G.goals.reduce((a, g) => a + Math.min(g.fed, g.count), 0) / all : 0; }
  const want = STAGES[G.stage];
  return want.rate ? G.held / want.hold : G.fed / want.count;
}
function recipe(item) {
  const box = boxOf(item), genes = contentOf(item).match(/.{3}/g).map(geneName).join(' + ');
  return box ? L`${BOX[box].name.toLowerCase()} de ${fill(box)} ${genes}` : genes;
}
function portSide(c, port) { return (c.dir + [3, 2, 1][c.flip ? 2 - port : port]) % 4; }
function link(a, b) {
  if (!a || !b || a === b || b.type !== 'pump') return refuse(L('Une veine va d’une pompe à une autre.'));
  if (span(a, b) > VEIN.reach) return refuse(L`Trop loin : ${Math.ceil(span(a, b))} cases. Pose une pompe relais, 24 au plus entre deux.`);
  for (let p = b, i = 0; p && i < 999; p = G.cells[p.to], i++) if (p === a) return refuse(L('Une veine ne peut pas boucler.'));
  const one = veinKind(a), other = veinKind(b);
  if (one && other && one !== other) return refuse(L('Ces deux veines portent des matières différentes : vide l’une des deux.'));
  for (const p of a.packets) for (let i = 0; i < p.n; i++) a.stock.push(p.item);
  a.packets = []; a.to = key(b.x, b.y); a.veinHp = VEIN.hp;
  delete a.veinOut; delete a.veinCut;
  a.veinLeft = .5 + span(a, b) / 12; a.veinOrder = G.seq = (G.seq || 0) + 1;
  say(L('Veine reliée. Tire depuis la dernière pompe pour continuer.'));
  return true;
}
const tileAt = (x, y) => { const s = trackSize(); return {x:x - ((x % s) + s) % s, y:y - ((y % s) + s) % s}; };
const tileKey = (x, y) => { const p = tileAt(x, y); return key(p.x, p.y); };
const trackAt = (x, y) => G.tracks[tileKey(x, y)];
const tileCentre = id => id.split(',').map(n => Number(n) + trackSize() / 2);
// A pocket touching a track on any side of its footprint.
const touchesTrack = c => footprint(c).some(p => [0, 1, 2, 3].some(d => trackAt(p.x + DX[d], p.y + DY[d])));
function layTrack(x, y, dir) {
  ({x, y} = tileAt(x, y));
  const old = G.tracks[key(x, y)];
  if (old) { old.dir = dir; return old; }
  return G.tracks[key(x, y)] = {x, y, dir, left:BUILD.track, order:G.seq = (G.seq || 0) + 1};
}
function incubate(x, y) {
  const cost = price('worm'), id = tileKey(x, y);
  if (!G.tracks[id]) return refuse(L('Un ver s’incube sur une piste : trace-la d’abord avec l’outil Piste.'));
  if (G.worms.some(w => w.path.includes(id))) return refuse(L('Un ver occupe déjà cette case.'));
  if (cost > G.dna) return refuse(L`Il manque ${cost - G.dna} ADN pour ce ver.`);
  G.dna -= cost;
  const w = {id:G.seq = (G.seq || 0) + 1, path:[id], t:0, hp:WORM.hp, left:BUILD.worm, docked:false, rule:'auto',
    holds:Array.from({length:wormHolds()}, () => ({kind:'', n:0, part:0}))};
  w.order = w.id;
  G.worms.push(w);
  say(L`Ver en incubation, ${cost} ADN. Il ne part qu’une fois éclos.`);
  selectWorm(w);
}
let wiring = null;
// The colours a nerve network can wear: the 3D paint and the 2D stroke.
const NERVE_COLORS = [
  {paint:'N', hex:'#2E7F91', name:L('bleu')}, {paint:'acid', hex:'#7FBF3A', name:L('vert')}, {paint:'amber', hex:'#F0A03C', name:L('orange')},
  {paint:'pink', hex:'#E8738A', name:L('rose')}, {paint:'I', hex:'#9B4DE0', name:L('violet')}, {paint:'pale', hex:'#BFEFF5', name:L('blanc')}
];
// Every nerve of the network a cell belongs to, through the cells they join.
function netWires(id) {
  const seen = new Set([id]), wires = new Set();
  for (const at of seen) for (const w of G.wires) if (w.a === at || w.b === at) { wires.add(w); seen.add(w.a); seen.add(w.b); }
  return [...wires];
}
const isSource = c => Boolean(c) && (isGun(c) || hasTrait(c.type, 'source'));
const DESK_NAMES = {most:L('le plus nombreux'), near:L('le plus proche'), cycle:L('chacun son tour'), hand:L('à la main')};
// Whom a listener hears, in words: the whole network, or its chosen source and how far it is.
function sourceName(c, src) {
  if (!src) return L('tout le réseau');
  if (!NET.get(key(src.x, src.y)) || NET.get(key(src.x, src.y)) !== netOf(c)) return L('une source qui n’est plus sur son réseau');
  if (src.type === 'core') return L('le cœur');
  return L`${TYPES[src.type].name.toLowerCase()} à ${Math.round(span(c, src))} cases`;
}
// What a net carries, read in words: where its message comes from, what it asks, its stores and who listens.
function netSummary(c) {
  const net = netOf(c), id = key(c.x, c.y);
  if (!net) return L('Ce réseau ne porte rien : nerf en chantier ou coupé.');
  const ends = new Set(netWires(id).flatMap(w => [w.a, w.b])), cells = [...ends].map(k => G.cells[k]).filter(Boolean);
  const tally = types => cells.filter(o => types.includes(o.type)).length;
  const tint = netWires(id)[0]?.color || 0;
  const sources = [net.turrets && L`${net.turrets} arme(s)`, net.radars && L`${net.radars} radar(s)`, net.core && L('le cœur'), net.desk && L('un pupitre')].filter(Boolean).join(', ') || L('aucune');
  const asks = net.list.length ? net.list.map(gene => net.count?.[gene] ? `${gene} (${net.count[gene]})` : gene).join(', ') : L('rien');
  const listen = [['ligase', L('Ligase')], ['join', L('assembleur')], ['pack', L('encapsuleur')], ['sort', L('trieur')], ['gate', L('feu')], ['screen', L('écran')]]
    .map(([type, name]) => tally([type]) && `${tally([type])} ${name}`).filter(Boolean).join(', ') || L('personne');
  const level = net.stores ? L`${net.stores} stock(s), ${net.full ? L('plein') : L('sous le seuil')}` : L('aucun stock');
  return L`Réseau ${NERVE_COLORS[tint].name}. Sources : ${sources}. Demande : ${asks}, en tête ${net.focus || L('rien')}. Priorité : ${DESK_NAMES[net.mode || 'most']}. ${level}. Écoutent : ${listen}.`;
}
// What a gate shows: green when something may pass.
const gateGreen = c => !listens(c) ? c.open : c.when && c.when !== 'gene' ? gateOpen(c) : Boolean(heardOf(c)?.focus);
const BATCHES = [0, 5, 10, 20, 50];
function wireUp(a, b) {
  const ok = c => c && NERVE.ends.includes(c.type);
  if (!ok(a) || !ok(b) || a === b) return refuse(L('Un nerf relie deux éléments parmi tourelles, radars, relais, feux, trieurs, Ligases, assembleurs, encapsuleurs, écrans, pupitres, kystes et le cœur.'));
  if (span(a, b) > NERVE.reach) return refuse(L`Trop loin : ${Math.ceil(span(a, b))} cases, 24 au plus. Pose un relais entre les deux.`);
  const ka = key(a.x, a.y), kb = key(b.x, b.y);
  if (G.wires.some(w => (w.a === ka && w.b === kb) || (w.a === kb && w.b === ka))) return refuse(L('Ils sont déjà reliés.'));
  const tint = [...netWires(ka), ...netWires(kb)][0]?.color || 0;
  G.wires.push({a:ka, b:kb, hp:NERVE.hp, left:.4 + span(a, b) / 16, order:G.seq = (G.seq || 0) + 1, color:tint});
  say(L('Nerf en chantier. Touche le feu ou le trieur pour choisir ce qu’il lit : gène entier, position 1, 2 ou 3.'));
  return true;
}
const MAX_FAMILIES = 8;
const flinchOf = e => Math.max(0, 1 - (G.time + owed - (e.hitAt ?? -9)) / .25);
const nestHurt = b => Math.max(0, 1 - (G.time + owed - (b.hitAt ?? -9)) / .35);
// Where to draw a creature: in flight, between two ticks, for the throw is too quick for 20 steps a second.
function creatureAt(e) {
  if (!e.fly) return e;
  const f = e.fly, k = Math.min(1, f.t + owed / NEST.throw);
  return {...e, x:f.x + (f.tx - f.x) * k, y:f.y + (f.ty - f.y) * k, z:Math.sin(Math.PI * k) * 1.6};
}

// Diagnosis: light the links that explain the selected machine's speed.
function feeders(c, wanted) {
  const found = [];
  for (const edge of edgesOf(c)) {
    const side = edge.dir;
    if (wanted != null && side !== wanted) continue;
    const from = ahead(edge, side);
    if (!from) continue;
    const dir = (side + 2) % 4;
    const emits = (drains(from) && !(from.type === 'pump' && c.type === 'pump') && !(isBelt(c) && c.dir === (dir + 2) % 4)) || (from.type === 'bridge' && wayOf(from, dir % 2) === dir) || (from.type === 'sort' && (dir === from.dir || dir === sideExit(from))) || (isSplit(from) ? splitExits(from).includes(dir) : 'belt gate mine ligase join pack cyst vault'.split(' ').includes(from.type) && from.dir === dir);
    if (emits && connects(c, dir)) found.push({c:from, dir});
  }
  return found;
}
function upstream(c, side) {
  const path = [], seen = new Set();
  let links = feeders(c, side);
  while (links.length) {
    const {c:from, dir} = links[0], id = key(from.x, from.y) + dir;
    if (seen.has(id)) break;
    seen.add(id); path.push(from);
    if (hasTrait(from.type, 'lineEnd')) break;
    if (from.type === 'pump') {
      const back = pumps().find(p => p.to === key(from.x, from.y));
      links = back ? [{c:back, dir}] : feeders(from);
      continue;
    }
    links = feeders(from, hasTrait(from.type, 'fork') ? ((from.type === 'bridge' ? dir : from.dir) + 2) % 4 : null);
  }
  return path;
}
function diagnose(c) {
  chain = [];
  if (c.out != null) {
    const name = TYPES[c.type].name, waits = paused ? L(', en attente de la reprise') : '';
    if (c.cut) return L`${name} en démontage : ${Math.max(0, c.out).toFixed(1).replace('.', DEC)} s de jeu${waits}.${refund(c) ? L` +${refund(c)} ADN à la fin.` : ''}`;
    const id = jobId({order:c.outOrder, field:'out'}), drone = G.drones.find(d => d.job === id);
    return L`${name} à démonter : ${drone ? L('un drone arrive') : L`en file, ${sites().findIndex(job => jobId(job) === id) + 1}e${waits}`}. Il fonctionne jusqu’à ce que le drone commence.`;
  }
  if (!built(c)) {
    const place = sites().findIndex(job => job.c === c && job.field === 'left');
    const drone = G.drones.find(d => d.job === jobId({order:c.order, field:'left'}));
    if (drone) {
      const away = Math.hypot(drone.x - c.x - .5, drone.y - c.y - .5);
      if (away > DRONE.reach + 1e-6) return L`${TYPES[c.type].name} : drone en route, à ${Math.ceil(away)} cases. Le chantier commence quand il arrive.`;
    }
    return place < G.drones.length ? L`${TYPES[c.type].name} en chantier : ${c.left.toFixed(1).replace('.', DEC)} s de jeu${paused ? L(', en attente de la reprise') : ''}.` : L`${TYPES[c.type].name} en attente, position ${place - BUILDERS + 1} dans la file. Trois drones, un par chantier, dans l’ordre de pose.`;
  }
  if (c.type === 'gate' && c.when && c.when !== 'gene' && netOf(c)) {
    const kept = gateStore(c), state = gateOpen(c) ? L('vert, ça passe') : gateCondition(c) ? L('rouge, son lot est passé') : L('rouge, la ligne attend');
    const watching = WATCHES.includes(c.when) ? (kept ? L` Il écoute le ${TYPES[kept.store.type].name.toLowerCase()} à ${Math.round(span(c, kept.store))} cases : ${kept.at} / ${kept.cap}, plein à ${kept.full}.` : L(' Aucun kyste relié à son réseau : relie-en un pour qu’il ait un stock à regarder.')) : '';
    const batch = c.batch ? L` Lot : ${c.passed || 0} / ${c.batch} passés.` : '';
    return L`Feu, s’ouvre sur ${WHEN[c.when].name} : ${state}.${watching}${batch}`;
  }
  if (c.type === 'desk') return L`Pupitre : le réseau demande ${DESK_NAMES[c.mode || 'most']}${c.mode === 'hand' ? L` (${c.gene || L('aucun gène fixé')})` : ''}.${netOf(c) ? '' : L(' Relie-le à un nerf.')}`;
  if ((c.type === 'gate' || c.type === 'sort') && G.wires.some(w => w.a === key(c.x, c.y) || w.b === key(c.x, c.y))) {
    const what = c.read ? L`la position ${c.read}` : L('le gène entier'), name = TYPES[c.type].name;
    const spare = c.type === 'gate' ? (c.open ? 'vert' : 'rouge') : L`filtre ${c.want === '?' ? 'tout' : c.want}`;
    if (!listens(c)) return L`${name} : nerf en chantier, coupé ou sans tourelle. Réglage manuel appliqué : ${spare}.`;
    const net = heardOf(c);
    if (!net.focus) return L`${name}, lit ${what} : rien n’est demandé, ${c.type === 'gate' ? L('il reste rouge') : L('tout va tout droit')}.`;
    const now = c.read ? L`${named(net.focus[c.read - 1])}, position ${c.read} de ${net.focus}` : net.list.join(', ');
    return L`${name}, lit ${what} : ${now}. ${c.type === 'gate' ? L('Le reste attend derrière.') : c.read ? L('Le reste, et le trop-plein, continue tout droit.') : L('Le reste continue tout droit.')}`;
  }
  if (c.type === 'gate') return c.open ? L('Feu vert : ça passe. Touche-le pour couper la ligne.') : L('Feu rouge : la ligne attend derrière. Touche-le pour rouvrir.');
  if (c.type === 'core') {
    const want = STAGES[G.stage];
    if (!want) return L`Organisme au stade ${STAGES.length}, ${G.kills} créatures tuées. Tout ce que tu livres devient de l’ADN.`;
    if (G.goals && G.goals.length > 1) return L`Il veut : ${G.goals.map(g => `${recipe(g.item)} ${g.fed}/${g.count}`).join(', ')}. En échange : ${want.gives}. Les autres gènes deviennent de l’ADN.`;
    const how = want.rate ? L`${want.rate} par seconde pendant ${want.hold} s, il faut deux lignes en parallèle` : L`${want.count} au total`;
    const carbon = BOX[boxOf(want.item)]?.carbon, isotope = BOX[boxOf(want.item)]?.isotope;
    const pack = carbon ? L` Ça sort d’un Encapsuleur réglé sur ${BOX[boxOf(want.item)].name} : ${fill(boxOf(want.item))} derrière, ${carbon} carbone${carbon > 1 ? 's' : ''}${isotope ? L` et ${isotope} isotope` : ''} sur le côté. Le carbone est juste à l’est du cœur${isotope ? L(', l’isotope loin dehors, au niveau 3') : ''}.` : '';
    return L`Il veut ${recipe(want.item)} : ${how}. Entrées 1, 2, 3 dans cet ordre.${pack} En échange : ${want.gives}. Les autres gènes deviennent de l’ADN.`;
  }
  if (isGun(c)) {
    const gun = GUNS[c.type], name = TYPES[c.type].name;
    const load = Object.entries(c.ammo).filter(([, n]) => n).map(([g, n]) => `${n} ${g}`).join(', ');
    chain = upstream(c);
    const net = netOf(c);
    if (net) return L`${name} sur nerf, demande : ${net.list.join(', ') || L('rien, personne à portée')}. En stock : ${load || 'rien'}.`;
    return load ? L`${name} : ${load}. 3, 2, 1 ou 0 bases justes : ${[12, 5, 2, 1].map(n => n * gun.power).slice(0, 3).join(', ')} ou ${gun.power} dégâts${gun.volley > 1 ? L(', deux coups à la fois') : ''}, à ${String(gun.range).replace('.', DEC)} cases. ${c.strict ? L('Économe, elle ne tire qu’à 2 justes ou plus.') : L('Elle tire sur tout.')}` : name + L(' : rien à tirer. Amène-lui des gènes de trois bases.');
  }
  if (c.type === 'cyst') { chain = upstream(c); return L`Kyste : ${c.stock.length} sur ${capOf(c)} objets.`; }
  if (c.type === 'vault') { chain = upstream(c); return L`Grand kyste : ${c.stock.length} sur ${capOf(c)} objets.`; }
  if (c.type === 'borer') {
    const figure = n => n.toFixed(1).replace('.', DEC), per = figure(c.made.length / Math.max(1, Math.min(10, G.time)));
    const rich = richUnder(c), later = rich > richCap() ? L` Ce gisement est ×${rich}, exploitable ainsi au stade ${rich === 2 ? 3 : 4}.` : '';
    const fastest = Math.max(BELT_SPEED, ...edgesOf(c).map(door => mouthPace(door, door.dir))), belts = Math.ceil(perSecond(c) / fastest - 1e-6);
    const full = c.stock.length >= BORER.hold ? L` Il déborde : il lui faut ${belts} tapis MK${fastest / BELT_SPEED}, 8 bords au plus.` : '';
    return L`Grand récolteur de ${named(matterUnder(c))} : ${per} sur ${figure(perSecond(c))}/s.${full}${later}`;
  }
  if (c.type === 'sort') {
    const left = c.side === 3 ? L('à gauche') : L('à droite'), what = {1:L('les bases'), 3:L('les gènes'), 6:L('les brins')}[c.want.length];
    let state = L`Trieur : ${what}${c.want === '?' ? '' : ` ${c.want}`} sortent ${left}, le reste va tout droit.`;
    if (c.item && c.t >= .999) {
      const dir = exitOf(c), to = ahead(c, dir);
      if (!to || !accepts(to, c.item, dir)) state = L`Trieur bloqué : ${itemName(c.item)} doit sortir ${dir === c.dir ? L('tout droit') : left}, et cette sortie est fermée ou pleine.`;
      if (to) chain = [to];
    }
    return state;
  }
  if (c.type === 'bridge') {
    for (const lane of c.lanes) {
      if (!lane || lane.t < .999) continue;
      const to = ahead(c, lane.dir);
      if (to && accepts(to, lane.item, lane.dir)) continue;
      if (to) chain = [to];
      return L`Pont bloqué vers ${[L('le haut'),L('la droite'),L('le bas'),L('la gauche')][lane.dir]} : sortie absente, à contresens ou pleine.`;
    }
    return L('Pont : deux voies indépendantes. Auto suit les tapis voisins, sinon le sens choisi est imposé.');
  }
  if (c.type === 'pocket') {
    const kind = c.stock[0], what = kind ? itemName(kind) : L('vide');
    if (!touchesTrack(c)) return L('Poche sans piste : elle doit toucher une piste.');
    return L`Poche qui ${c.unload ? L('vide le ver et sort sur ses côtés libres') : L('charge le ver')}, ${what} : ${c.stock.length} sur ${pocketCap(c)}. Une seule matière par poche, 16/s.`;
  }
  if (c.type === 'pump') {
    const kind = veinKind(c), what = kind ? itemName(kind) : L('vide');
    const head = L`Pompe, ${what} : ${c.stock.length} sur ${VEIN.cap}.`;
    for (const side of [0,1,2,3]) {
      const from = ahead(c, side);
      if (kind && from && isBelt(from) && from.dir === (side + 2) % 4 && from.item && from.item !== kind) {
        chain = [from];
        return L`${head} Une autre matière attend : une veine n’en porte qu’une. Trie avant, ou vide la veine.`;
      }
    }
    if (c.to) {
      const to = G.cells[c.to];
      if (!to) return L`${head} La pompe d’arrivée est détruite.`;
      if (c.veinHp <= 0) return L`${head} Veine rompue, plus rien ne passe.`;
      chain = [to];
      if (leaking(c)) return L`${head} Veine percée : 7/s, et elle attire les créatures.`;
      return `${head} ${to.stock.length >= VEIN.cap - 3 ? L('La pompe d’arrivée est pleine : branche plus de tapis en sortie.') : L('Pousse jusqu’à 16/s.')}`;
    }
    return L`${head} Sans veine au départ, elle se vide sur ses quatre côtés, au rythme de chaque tapis.`;
  }
  if (c.type === 'pack') {
    const [goods, carbon] = c.ports, box = BOX[c.box];
    const head = L`Encapsuleur, ${box.name.toLowerCase()}${goods.length ? ' de ' + goods[0] : ''} : ${Math.min(goods.length, fill(c.box))} sur ${fill(c.box)}${box.isotope ? L`, isotope ${carbon.filter(k => k === 'I').length} sur ${box.isotope}` : ''}, carbone ${Math.min(carbon.length, box.carbon)} sur ${box.carbon}.`;
    if (c.item && !(ahead(c) && accepts(ahead(c), c.item, c.dir))) {
      if (ahead(c)) chain = [ahead(c)];
      return L`${head} Sa sortie est fermée ou pleine${boxOf(c.item) === 'A' ? L(' : un chargeur va dans une tourelle') : ''}.`;
    }
    for (const [lacks, side, what] of [[goods.length < fill(c.box), (c.dir + 2) % 4, L('les gènes')], [carbon.length < box.carbon, carbonSide(c), L('le carbone')]]) {
      if (!lacks) continue;
      const from = feeders(c, side)[0];
      if (!from) return L`${head} Branche ${what} ${what === L('le carbone') ? (c.flip ? L('à droite') : L('à gauche')) : L('derrière')}.`;
      const waiting = from.c.item;
      if (what === L('les gènes') && waiting && !packTakes(c, waiting, 0)) {
        chain = [from.c];
        return L`${head} ${itemName(waiting)} attend dehors : ${goods.length ? L`la boîte se remplit de ${goods[0]}, vide-la pour changer` : c.box === 'A' ? L('un chargeur ne prend que des gènes de 3 bases') : L('il faut un gène ou un brin en vrac')}.`;
      }
    }
    return L`${head} Il tourne.`;
  }
  if (c.type === 'join') {
    const per = (c.made.length / Math.max(1, Math.min(10, G.time))).toFixed(1).replace('.', DEC);
    const head = L`Assembleur${c.last ? ' ' + recipe(c.last) : ''} : ${per} sur 1,0/s.`;
    if (c.item && !(ahead(c) && accepts(ahead(c), c.item, c.dir))) {
      if (ahead(c)) chain = [ahead(c)];
      return L`${head} Sa sortie est fermée ou pleine.`;
    }
    const empty = [0, 1].find(port => !c.ports[port].length);
    if (empty != null) {
      const side = joinSide(c, empty);
      if (!feeders(c, side).length) return L`${head} L’entrée ${empty + 1} n’est pas branchée : le gène 1 arrive à gauche, le 2 à droite.`;
      if (c.clock >= .999) { chain = upstream(c, side); return L`${head} L’entrée ${empty + 1} manque de gènes : suis la ligne rouge.`; }
    }
    return L`${head} Elle tourne.`.replace(L('Elle tourne'), L('Il tourne'));
  }
  if (c.type !== 'mine' && c.type !== 'ligase') return TYPES[c.type].help;

  const per = (c.made.length / Math.max(1, Math.min(10, G.time))).toFixed(1).replace('.', DEC);
  const entries = c.type === 'ligase' ? L(' Entrées : ') + c.ports.map((p, i) => `${i + 1} ${p.length ? named(p[0]) : L('vide')}`).join(', ') + '.' : '';
  const head = L`${c.type === 'mine' ? L('Récolteur de ') + named(matterUnder(c)) : L('Ligase') + (c.last ? ' ' + geneName(c.last) : '')} : ${per} sur ${perSecond(c).toFixed(1).replace('.', DEC)}/s.${entries}${c.type === 'mine' && richUnder(c) > richCap() ? L` Ce gisement est ×${richUnder(c)}, exploitable ainsi au stade ${richUnder(c) === 2 ? 2 : 3}.` : ''}`;
  if (c.item && !(ahead(c) && accepts(ahead(c), c.item, c.dir))) {
    let to = c, dir = c.dir;
    for (let i = 0; i < W * H; i++) {
      to = ahead(to, dir);
      if (!to || chain.includes(to)) break;
      chain.push(to);
      if (to.type === 'gate' && listens(to) && !(to.when && to.when !== 'gene' ? gateOpen(to) : asked(to, c.item))) return L`${head} Un feu intelligent attend autre chose que ${itemName(c.item)}.`;
      if (to.type === 'gate' && !listens(to) && !to.open) return L`${head} Arrêt au feu rouge : touche-le pour rouvrir.`;
      if (isBelt(to)) dir = to.dir; else if (to.type !== 'bridge') break;
    }
    return L`${head} Sortie bloquée : ${to ? L('suis la ligne rouge, le bout refuse ou est plein.') : L('la ligne ne mène nulle part.')}`;
  }
  if (c.type === 'ligase') {
    const empty = c.ports.findIndex(p => !p.length);
    if (empty >= 0) {
      const side = portSide(c, empty);
      if (!feeders(c, side).length) return L`${head} L’entrée ${empty + 1} n’est pas branchée.`;
      chain = upstream(c, side);
      if (c.clock >= .999) return L`${head} L’entrée ${empty + 1} manque de matière : ${chain.some(p => p.type === 'gate' && (listens(p) ? !gateGreen(p) : !p.open)) ? L('un feu rouge coupe sa ligne') : L('suis la ligne rouge')}.`;
      chain = [];
    }
  }
  return L`${head} Elle tourne.`;
}

// Drawing and camera: cam is the world point at the middle of the canvas, zoom is pixels per cell.
const canvas = $('game'), ctx = canvas.getContext('2d');
const cam = {x:0, y:0, zoom:26};
let view = {w:1, h:1, dpr:1};
function resize() {
  const box = $('board').getBoundingClientRect();
  view = {w:Math.max(1, box.width), h:Math.max(1, box.height), dpr:Math.min(2, window.devicePixelRatio || 1)};
  canvas.width = view.w * view.dpr; canvas.height = view.h * view.dpr;
  layoutHud();
  if (orbit.on) layoutPlanet();
}
// The 3D camera is tilted, which only flattens y: everything else is shared with the 2D view.
let view3d = null;
const flat = () => view3d ? view3d.tilt : 1;
function worldAt(sx, sy) { return {x:cam.x + (sx - view.w / 2) / cam.zoom, y:cam.y + (sy - view.h / 2) / (cam.zoom * flat())}; }
function pan(dx, dy) {
  cam.x = Math.max(-LIMIT, Math.min(LIMIT, cam.x - dx / cam.zoom));
  cam.y = Math.max(-LIMIT, Math.min(LIMIT, cam.y - dy / (cam.zoom * flat())));
}
function zoomAt(factor, sx = view.w / 2, sy = view.h / 2) {
  const before = worldAt(sx, sy);
  cam.zoom = Math.max(4, Math.min(72, cam.zoom * factor));
  const after = worldAt(sx, sy);
  cam.x = Math.max(-LIMIT, Math.min(LIMIT, cam.x + before.x - after.x));
  cam.y = Math.max(-LIMIT, Math.min(LIMIT, cam.y + before.y - after.y));
}
function home() {
  // Centred on the core: a new game starts from it alone.
  const c = centreOf(coreCell() || {x:CORE.x, y:CORE.y, type:'core'});
  cam.x = c.x; cam.y = c.y;
  cam.zoom = Math.max(11, Math.min(44, Math.min(view.w / 28, view.h / (28 * flat()))));
}
function circle(g, x, y, r, fill, stroke, width = .04) {
  g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2);
  if (fill) { g.fillStyle = fill; g.fill(); }
  if (stroke) { g.strokeStyle = stroke; g.lineWidth = width; g.stroke(); }
}
// Where an item is in its cell: a curve from the edge it came in by to the edge it leaves by.
// With the middle as control point a straight cell gives a constant speed.
function along(c, travel, out, progress) {
  const t = Math.min(1, progress + owed * paceOf(c, out)), u = 1 - t;
  const from = travel < 0 || travel === (out + 2) % 4 ? out : travel;
  return {
    x:c.x + .5 - DX[from] * .5 * u * u + DX[out] * .5 * t * t,
    y:c.y + .5 - DY[from] * .5 * u * u + DY[out] * .5 * t * t,
    angle:Math.atan2(DY[from] * u + DY[out] * t, DX[from] * u + DX[out] * t)
  };
}
// What is inside on its way: from the mouth it came in by, through the middle, to the one it leaves by.
function passing(c) {
  const found = [], size = sizeOf(c), {x, y} = centreOf(c), now = G.time + owed;
  const show = (item, from, done, through) => {
    const half = size / 2, back = through ? Math.max(0, .5 - done) * 2 : 1 - done, on = through ? Math.max(0, done - .5) * 2 : 0;
    found.push({item, done, x:x - DX[from] * half * back + DX[c.dir] * half * on, y:y - DY[from] * half * back + DY[c.dir] * half * on});
  };
  const list = (items, due, time, through) => {
    if (!due) return;
    for (let i = Math.max(0, due.length - 6); i < due.length; i++) {
      const left = due[i].at - now, item = items[items.length - due.length + i];
      if (item && left > 0) show(item, due[i].from, Math.max(0, 1 - left / time), through);
    }
  };
  if (c.due) list(c.stock, c.due, CROSS * size, c.type === 'cyst' || c.type === 'vault');
  if (c.portDue) c.ports.forEach((items, port) => list(items, c.portDue[port], CROSS, false));
  if (c.gulp && now - c.gulp.t < .3) show(c.gulp.item, c.gulp.from, Math.max(0, (now - c.gulp.t) / .3), false);
  return found;
}
function polygon(g, points, fill, stroke, width = .04) {
  g.beginPath(); points.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath();
  if (fill) { g.fillStyle = fill; g.fill(); }
  if (stroke) { g.strokeStyle = stroke; g.lineWidth = width; g.stroke(); }
}
function rect(g, x, y, w, h, fill, stroke) {
  polygon(g, [[x,y],[x+w,y],[x+w,y+h],[x,y+h]], fill, stroke);
}
function glyph(g, base, x, y, r) {
  if (base === 'S') { circle(g, x, y, r * .9, '#6DAA38', '#C9F77A', r * .2); }
  if (base === 'C') polygon(g, [[x-r,y],[x+r*.6,y-r*.95],[x+r,y],[x+r*.6,y+r*.95]], '#B9AA8C', '#FFF3D9', r * .18);
  if (base === 'F') {
    g.lineCap = 'round';
    for (const [width, color] of [[1.15,'#FFC06B'],[.8,'#B86B1E']]) {
      g.lineWidth = r * width; g.strokeStyle = color;
      g.beginPath(); g.moveTo(x-r*.55,y); g.lineTo(x+r*.55,y); g.stroke();
    }
  }
  if (base === 'I') {
    polygon(g, [[x, y - r * 1.1], [x + r * .75, y], [x, y + r * 1.1], [x - r * .75, y]], '#3A1D4A', '#D08CFF', r * .2);
    circle(g, x, y - r * .25, r * .18, '#F1D6FF');
  }
  if (base === 'K') {
    polygon(g, [0,1,2,3,4,5].map(i => [x + Math.cos(i * Math.PI / 3) * r, y + Math.sin(i * Math.PI / 3) * r]), '#23282C', '#AEB9BF', r * .2);
    circle(g, x - r * .2, y - r * .2, r * .22, '#69757C');
  }
  if (base === 'N') {
    g.lineWidth = r * .3; g.strokeStyle = '#55D6E8'; g.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const a = i * Math.PI / 3, dx = Math.cos(a) * r, dy = Math.sin(a) * r;
      g.beginPath(); g.moveTo(x-dx,y-dy); g.lineTo(x+dx,y+dy); g.stroke();
    }
    circle(g, x, y, r * .35, '#D5FAFF');
  }
}
function crate(g, box, x, y, w, h) {
  const cut = h * .25, color = box === 'A' ? '#F0A03C' : '#55D6E8';
  polygon(g, [[x-w/2+cut,y-h/2],[x+w/2-cut,y-h/2],[x+w/2,y-h/2+cut],[x+w/2,y+h/2-cut],[x+w/2-cut,y+h/2],[x-w/2+cut,y+h/2],[x-w/2,y+h/2-cut],[x-w/2,y-h/2+cut]], '#23282C', color, h * .12);
  // Six rounds showing on a magazine, two seals on a capsule.
  for (let i = 0; i < (box === 'A' ? 6 : 2); i++) {
    if (box === 'A') rect(g, x + (i - 2.5) * w / 7.5 - w / 30, y - h * .68, w / 15, h * .2, color);
    else circle(g, x + (i - .5) * w * .94, y, h * .13, color);
  }
}
function sequence(g, item, x, y, room, size) {
  if (boxOf(item)) {
    crate(g, boxOf(item), x, y, room * 1.1, room * .62);
    return sequence(g, contentOf(item), x, y, room * .8, size * .8);
  }
  const n = item.length;
  [...item].forEach((b, i) => glyph(g, b, x + (n === 1 ? 0 : (i - (n - 1) / 2) * room / n), y, n === 1 ? size : Math.min(size, room / n * .55)));
}
function token(g, item, x, y, angle = 0) {
  if (item.length === 1) return glyph(g, item, x, y, .17);
  if (boxOf(item)) {
    g.save(); g.translate(x, y); g.rotate(angle + Math.PI);
    crate(g, boxOf(item), 0, 0, .78, .44); sequence(g, contentOf(item), 0, 0, .58, .12);
    g.restore(); return;
  }
  // A gene turns with the belt, first base leading.
  g.save(); g.translate(x, y); g.rotate(angle + Math.PI); x = y = 0;
  g.lineCap = 'round'; g.strokeStyle = '#05090B'; g.lineWidth = .34;
  g.beginPath(); g.moveTo(x-.24,y); g.lineTo(x+.24,y); g.stroke();
  if (item.length === 3) [...item].forEach((b, i) => glyph(g, b, x + (i-1) * .24, y, .12));
  else {
    g.lineWidth = .3; g.strokeStyle = '#17301D';
    g.beginPath(); g.moveTo(-.34,0); g.lineTo(.34,0); g.stroke();
    sequence(g,item,0,0,.84,.09); rect(g,-.012,-.15,.024,.3,'#B7F34A');
  }
  g.restore();
}
function arrow(g, dir, reach = .46, color = '#A3B8B3') {
  const x = DX[dir], y = DY[dir];
  polygon(g, [[x*reach,y*reach],[x*(reach-.15)-y*.12,y*(reach-.15)+x*.12],[x*(reach-.15)+y*.12,y*(reach-.15)-x*.12]], color);
}
function lamp(g, c) {
  const on = gateGreen(c);
  const color = on ? '#62E06A' : '#FF4D5E';
  // Red also shows as a bar across the rail, so colour is not the only signal.
  if (!on) {
    if (DX[c.dir]) rect(g,-.07,-.46,.14,.92,color); else rect(g,-.46,-.07,.92,.14,color);
  }
  circle(g,-.32,-.32,.17,color,'#05090B',.05);
  arrow(g,c.dir,.49,color);
  if (listens(c) && !(c.when && c.when !== 'gene')) reading(g,c,heardOf(c));
}
// What a listener reads: the shape wanted now, and one tick per position.
function reading(g, c, net) {
  const place = c.read || 0, x = .3, y = .31;
  circle(g,x,y,.19,'#05090B','#55D6E8',.04);
  if (net.focus) { if (place) glyph(g,net.focus[place - 1],x,y,.12); else sequence(g,net.focus,x,y,.32,.07); }
  for (let i = 0; i < place; i++) rect(g,.2 + i * .1,-.48,.06,.18,'#55D6E8');
}
function drawCell(g, c, inputs = []) {
  if (c.type === 'relay') {
    circle(g,0,0,.3,'#0B1417','#3FC6DC',.05);
    const beat = .5 + .5 * Math.sin(motionTime() * 4 + c.x);
    g.beginPath(); g.moveTo(0,-.24); g.lineTo(.18,0); g.lineTo(0,.24); g.lineTo(-.18,0); g.closePath();
    g.fillStyle = '#36AFC6'; g.fill();
    circle(g,0,0,.07 + beat * .03,'#B8F3FA');
    return;
  }
  if (c.type === 'radar') {
    rect(g,-.42,-.42,.84,.84,'#0B1417','#3FC6DC');
    circle(g,0,0,.26,'#141F23','#66D9EA',.05);
    const a = motionTime() * 1.6;
    g.beginPath(); g.moveTo(0,0); g.lineTo(Math.cos(a) * .4,Math.sin(a) * .4); g.strokeStyle = '#9FE6F0'; g.lineWidth = .08; g.stroke();
    circle(g,0,0,.09,'#9FE6F0');
    return;
  }
  const type = c.type;
  if (type === 'belt' || type === 'gate') {
    // Half a segment towards the exit, one from each fed side: turns and junctions read as one line.
    const sides = [c.dir, ...(inputs.length ? inputs : [(c.dir + 2) % 4])];
    const paint = ['#263E46','#6B4A22','#553372'][(type === 'belt' ? rankOf(c) : 1) - 1];
    rect(g,-.22,-.22,.44,.44,paint);
    for (const side of sides) rect(g,[-.22,.22,-.22,-.5][side],[-.5,-.22,.22,-.22][side],side % 2 ? .28 : .44,side % 2 ? .44 : .28,paint);
    if (type === 'gate') lamp(g,c); else arrow(g,c.dir,.12,'#5E828C');
    return;
  }
  if (type === 'bridge') {
    rect(g,-.22,-.5,.44,1,'#263E46','#4A6A73'); rect(g,-.5,-.22,1,.44,'#35505A','#6A8D94');
    return;
  }
  g.scale(.86,.86);
  rect(g,-.42,-.32,.84,.8,'#04080A');
  rect(g,-.42,-.44,.84,.82, type === 'wall' ? '#565247' : '#203C42', type === 'wall' ? '#8C8068' : '#55D6E8');
  if (type === 'mine') {
    circle(g,0,0,.27,'#0B1417','#4A6A73');
    glyph(g,matterUnder(c) || 'S',0,0,.16);
    for (let i = 1; i < rankOf(c); i++) circle(g,0,0,.26 + i * .07,null,i > 1 ? '#C77DFF' : '#F0A03C',.05);
  } else if (type === 'ligase') {
    for (let port = 0; port < 3; port++) {
      const side = portSide(c,port), x = DX[side]*.35, y = DY[side]*.35, has = c.ports[port].length;
      circle(g,x,y,.13, has > 1 ? '#8E3048' : '#0B1417', has ? '#FF8FA2' : '#8B989C');
      const base = c.ports[port][0] || c.last[port];
      if (base) { g.globalAlpha = has ? 1 : .35; glyph(g,base,x,y,.1); g.globalAlpha = 1; }
    }
  } else if (type === 'turret') {
    const angle = c.aim ?? -Math.PI / 2, full = Object.values(c.ammo).some(n => n);
    g.strokeStyle = '#A9C2C8'; g.lineWidth = .16; g.lineCap = 'round';
    g.beginPath(); g.moveTo(0,0); g.lineTo(Math.cos(angle)*.5,Math.sin(angle)*.5); g.stroke();
    circle(g,0,0,.21,full ? '#55D6E8' : '#8B989C');
  } else if (type === 'sting') {
    const a = c.aim ?? -Math.PI / 2, full = Object.values(c.ammo).some(n => n), dx = Math.cos(a), dy = Math.sin(a);
    g.strokeStyle = '#A9C2C8'; g.lineWidth = .085; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-dx * .2,-dy * .2); g.lineTo(dx * .74,dy * .74); g.stroke();
    for (const k of [.22,.4,.58]) circle(g,dx * k,dy * k,.075,null,full ? '#B7F34A' : '#8B989C',.04);
    polygon(g,[0,2.5,Math.PI,-2.5].map((turn,i) => [Math.cos(a + turn) * (i % 2 ? .2 : .16),Math.sin(a + turn) * (i % 2 ? .2 : .16)]),full ? '#55D6E8' : '#8B989C');
  } else if (type === 'maw') {
    const a = c.aim ?? -Math.PI / 2, full = Object.values(c.ammo).some(n => n), dx = Math.cos(a), dy = Math.sin(a);
    circle(g,0,0,.3,'#7A2638','#FF8FA2',.05);
    g.lineCap = 'round';
    for (const s of [-1,1]) {
      g.strokeStyle = '#D8CDB6'; g.lineWidth = .17;
      g.beginPath(); g.moveTo(-dy * s * .17,dx * s * .17); g.lineTo(dx * .4 - dy * s * .17,dy * .4 + dx * s * .17); g.stroke();
      circle(g,dx * .42 - dy * s * .17,dy * .42 + dx * s * .17,.07,full ? '#F0A03C' : '#091013');
    }
  } else if (type === 'cyst') {
    const fill = c.stock.length / capOf(c);
    circle(g,0,0,.18 + fill*.22,fill > .95 ? '#FF4D5E' : '#7A2638','#FF8FA2');
    for (let i = 1; i < rankOf(c); i++) circle(g,0,0,.3 + i * .06,null,i > 1 ? '#C77DFF' : '#F0A03C',.045);
  } else if (type === 'borer') {
    // Drawn at half scale and stretched over its four cells.
    for (const [a,b] of [[-.2,-.2],[.2,-.2],[-.2,.2],[.2,.2]]) circle(g,a,b,.12,'#0B1417','#4A6A73',.03);
    circle(g,0,0,.17,'#142126','#55D6E8',.035);
    glyph(g,matterUnder(c) || 'S',0,0,.11);
    for (let i = 1; i < rankOf(c); i++) circle(g,0,0,.25 + i * .07,null,i > 1 ? '#C77DFF' : '#F0A03C',.035);
  } else if (type === 'vault') {
    const fill = c.stock.length / capOf(c);
    [[-.19,-.19],[.19,-.19],[-.19,.19],[.19,.19]].forEach(([a,b],i) => {
      circle(g,a,b,.11 + Math.max(0,Math.min(1,fill * 4 - i)) * .09,fill > .95 ? '#FF4D5E' : '#7A2638','#FF8FA2',.03);
    });
    for (let i = 1; i < rankOf(c); i++) circle(g,0,0,.05 + i * .06,null,i > 1 ? '#C77DFF' : '#F0A03C',.03);
  } else if (type === 'split' || type === 'split2') {
    if (type === 'split') circle(g,0,0,.12,'#6A8D94');
    else {
      // A T, closed straight ahead.
      const fx = DX[c.dir], fy = DY[c.dir];
      g.strokeStyle = '#6A8D94'; g.lineWidth = .1; g.lineCap = 'round';
      g.beginPath(); g.moveTo(fy*.2,-fx*.2); g.lineTo(-fy*.2,fx*.2); g.moveTo(0,0); g.lineTo(-fx*.22,-fy*.22); g.stroke();
    }
  } else if (type === 'sort') {
    if (c.x != null && listens(c)) { reading(g,c,heardOf(c)); return; }
    [...c.want].forEach((b,i) => {
      const n = c.want.length, x = n === 1 ? 0 : (i-(n-1)/2)*.66/n, size = n === 1 ? .17 : n === 3 ? .11 : .065;
      if (b === '?') circle(g,x,0,size,null,'#A3B8B3'); else glyph(g,b,x,0,size);
    });
  } else if (type === 'pump') {
    circle(g,0,0,.36,'#55202E','#FF8FA2',.07);
    circle(g,0,0,.15 + Math.min(1,c.stock.length / VEIN.cap) * .17,'#C85A72');
    const kind = c.stock[0] || c.packets[0]?.item;
    if (kind) sequence(g,kind,0,0,.64,.17);
  } else if (type === 'pocket') {
    circle(g,0,0,.32,'#17301D','#C9F77A',.06);
    circle(g,0,0,.08 + Math.min(1,c.stock.length / pocketCap(c)) * .2,'#4E7F2D');
    const kind = c.stock[0];
    if (kind) sequence(g,kind,0,0,.64,.16);
  } else if (type === 'desk') {
    rect(g,-.4,-.32,.8,.64,'#0B1417','#F0A03C');
    const mode = c?.mode || 'most';
    for (let i = 0; i < 4; i++) circle(g,-.24 + i * .16,.16,.05,DESK.modes[i] === mode ? '#F0A03C' : '#3A2A14');
    if (mode === 'hand' && c.gene) sequence(g, c.gene, 0, -.08, .5, .09);
    else rect(g,-.2,-.12,.4,.08,'#F0A03C');
  } else if (type === 'screen') {
    rect(g,-.42,-.3,.84,.6,'#05090B','#55D6E8');
    const gene = heardOf(c)?.focus || '';
    if (gene) sequence(g, gene, 0, 0, .7, .14);
    else rect(g,-.16,-.03,.32,.06,'#55D6E8');
  } else if (type === 'glue') {
    if (c.stock?.length && built(c)) { g.globalAlpha *= .3; rect(g,-1.5,-1.5,3,3,'#7FBF3A'); g.globalAlpha /= .3; }
    rect(g,-.46,-.46,.92,.92,'#20291A','#8FA9A6');
    const left = c.stock?.length || 0;
    rect(g,-.4,-.4,.8,.8,left ? '#7FBF3A' : '#3A4A2A');
    for (let i = 0; i < 5 && left; i++) circle(g,Math.sin(i * 2.7) * .25,Math.cos(i * 1.9) * .25,.04 + (motionTime() * .7 + i * .37) % 1 * .04,'#C9F28A');
  } else if (type === 'mist') {
    circle(g,0,0,.36,'#0B1417','#3FC6DC',.05);
    circle(g,0,0,.2,'#36AFC6','#B8F3FA',.04);
    const k = c.puffAt != null ? Math.max(0, 1 - (G.time - c.puffAt) / .7) : 0;
    if (k) circle(g,0,0,.2 + (1 - k) * .25,null,'#B8F3FA',.04);
  } else if (type === 'harpoon') {
    const a = c.aim ?? -Math.PI / 2, dx = Math.cos(a), dy = Math.sin(a);
    rect(g,-.38,-.38,.76,.76,'#141F23','#A45CF0');
    g.lineCap = 'round'; g.strokeStyle = '#93AAB0'; g.lineWidth = .12;
    g.beginPath(); g.moveTo(-dx * .3,-dy * .3); g.lineTo(dx * .42,dy * .42); g.stroke();
    g.strokeStyle = '#A45CF0'; g.lineWidth = .06;
    g.beginPath(); g.moveTo(-dy * .32 - dx * .05,dx * .32 - dy * .05); g.lineTo(dx * .1,dy * .1); g.lineTo(dy * .32 - dx * .05,-dx * .32 - dy * .05); g.stroke();
  } else if (type === 'arm') {
    circle(g,0,0,.3,'#141F23',['#5E828C','#E08A3C','#A070E0'][rankOf(c) - 1],.05);
    const back = (c.dir + 2) % 4, a = Math.atan2(DY[back], DX[back]) - armReach(c) * Math.PI, tipX = Math.cos(a) * .36, tipY = Math.sin(a) * .36;
    g.beginPath(); g.moveTo(0,0); g.lineTo(tipX,tipY); g.strokeStyle = '#A3B8B3'; g.lineWidth = .09; g.lineCap = 'round'; g.stroke();
    circle(g,0,0,.09,'#A3B8B3');
    if (c.hold?.[0]) sequence(g, c.hold[0], tipX, tipY, .3, .08);
    arrow(g,c.dir,.1,'#5E828C');
  } else if (type === 'burn') {
    rect(g,-.4,-.4,.8,.8,'#1A0F0B','#FF6A3C');
    for (let i = -1; i <= 1; i++) rect(g,i * .2 - .03,-.28,.06,.56,'#3A2A24');
    const hot = c && c.gulp && G.time - c.gulp.t < .6 ? 1 - (G.time - c.gulp.t) / .6 : .25;
    circle(g,0,.05,.12 + hot * .1,'#FF6A3C',null);
    circle(g,0,-.02,.06 + hot * .06,'#FFD08A',null);
  } else if (type === 'unbind' || type === 'unjoin') {
    rect(g,-.4,-.4,.8,.8,'#0B1417','#B7F34A');
    const shown = c.ports?.[0]?.[0] || c.last;
    if (shown) sequence(g, shown, 0, .12, .5, .09);
    g.beginPath(); g.moveTo(-.2,-.05); g.lineTo(0,-.28); g.lineTo(.2,-.05); g.strokeStyle = '#B7F34A'; g.lineWidth = .06; g.stroke();
  } else if (type === 'reaper') {
    const flash = c?.flash && G.time - c.flash.at < .6 ? 1 - (G.time - c.flash.at) / .6 : 0;
    rect(g,-.42,-.42,.84,.84,'#0B1417','#8FA9A6');
    circle(g,0,0,.3,'#141F23',c?.beam ? '#C9F7FF' : '#55D6E8',.06);
    circle(g,0,0,.13 + flash * .08,flash ? (c.flash.ok ? '#B7F34A' : '#8A8F8C') : c?.beam ? '#C9F7FF' : '#2A5F68');
  } else if (type === 'flip') {
    rect(g,-.4,-.4,.8,.8,'#0B1417','#55D6E8');
    const turn = built(c) ? motionTime() * 2 : 0;
    g.beginPath(); g.arc(0,0,.27,turn,turn + Math.PI * 1.5); g.strokeStyle = '#55D6E8'; g.lineWidth = .06; g.stroke();
    const shown = c.item || c.ports[0][0] || c.last;
    if (shown) sequence(g, shown, 0, 0, .44, .1);
  } else if (type === 'unpack') {
    const box = boxOf(c.ports[0][0] || c.last) || 'T', side = (c.dir + 1) % 4;
    crate(g, box, 0, .04, .56, .36);
    g.beginPath(); g.moveTo(-.28, -.14); g.lineTo(.1, -.36); g.strokeStyle = '#E8738A'; g.lineWidth = .05; g.stroke();
    const inside = c.ports[1][0] || (c.last && contentOf(c.last));
    if (inside) sequence(g, inside, 0, .04, .44, .1);
    g.globalAlpha *= c.ports[2].length ? 1 : .5;
    glyph(g, 'K', DX[side] * .4, DY[side] * .4, .12);
    g.globalAlpha = built(c) ? 1 : .4;
  } else if (type === 'pack') {
    const side = carbonSide(c), color = c.box === 'A' ? '#F0A03C' : '#55D6E8', [goods, carbon] = c.ports;
    crate(g, c.box, 0, -.02, .56, .4);
    const inside = goods[0] || (c.last && contentOf(c.last));
    if (inside) sequence(g, inside, 0, -.02, .44, .1);
    for (let i = 0; i < PACK.size; i++) circle(g, (i - 2.5) * .13, .3, .045, i < goods.length ? color : '#0B1417');
    g.globalAlpha *= carbon.length ? 1 : .5;
    glyph(g, 'K', DX[side] * .4, DY[side] * .4, .12);
    g.globalAlpha = built(c) ? 1 : .4;
  } else if (type === 'join') {
    for (const port of [0,1]) {
      const side = joinSide(c,port), x = DX[side]*.28, y = DY[side]*.28, has = c.ports[port].length;
      circle(g,x,y,.17,'#0B1417',has ? '#FF8FA2' : '#8B989C');
      const gene = c.ports[port][0] || (c.last ? c.last.slice(port * 3,port * 3 + 3) : '');
      if (gene) { g.globalAlpha *= has ? 1 : .35; sequence(g,gene,x,y,.28,.06); g.globalAlpha = built(c) ? 1 : .4; }
    }
  } else if (type === 'core') circle(g,0,0,.31,'#B7F34A','#E2FFB0');
}
function draw() {
  forgetCells();
  if (view3d) return view3d.draw();
  ctx.setTransform(1,0,0,1,0,0);
  ctx.fillStyle = '#05090B'; ctx.fillRect(0,0,canvas.width,canvas.height);
  const scale = cam.zoom * view.dpr;
  ctx.setTransform(scale,0,0,scale,canvas.width / 2 - cam.x * scale,canvas.height / 2 - cam.y * scale);
  const a = worldAt(0,0), b = worldAt(view.w,view.h);
  const x0 = Math.floor(a.x), y0 = Math.floor(a.y), x1 = Math.ceil(b.x), y1 = Math.ceil(b.y);
  rect(ctx,x0,y0,x1 - x0,y1 - y0,'#0D171A');
  for (const field of fieldsIn(x0,y0,x1,y1)) {
    const [base,x,y,w,h] = field, patch = patchOf(field), soil = {K:'#22262A',I:'#24142B',S:'#1E3A1D',F:'#35220F',C:'#2E2B25',N:'#102F37'}[base];
    ctx.beginPath();
    const seen = patch.list.filter(p => known(p.x,p.y));
    if (!seen.length) continue;
    for (const p of seen) { ctx.moveTo(p.x + 1.18,p.y + .5); ctx.arc(p.x + .5,p.y + .5,.68,0,Math.PI * 2); }
    ctx.fillStyle = soil; ctx.fill();
    // From afar one big glyph names the field.
    const rich = richAt(patch.list[0].x,patch.list[0].y);
    if (rich > 1) {
      ctx.save(); ctx.translate(patch.cx - .5,patch.top); ctx.scale(1/40,1/40);
      ctx.fillStyle = rich > richCap() ? '#8B989C' : '#B7F34A'; ctx.font = L`700 ${Math.min(90,Math.max(18,13 * 40 / cam.zoom))}px Verdana`; ctx.textBaseline = 'bottom';
      ctx.fillText(`×${rich}`,0,-3); ctx.restore();
    }
    if (cam.zoom < 14) { glyph(ctx,base,x + w / 2,y + h / 2,Math.min(w,h) * .32); continue; }
    for (const {x:i,y:j} of seen)
      if (i >= x0 - 1 && i <= x1 && j >= y0 - 1 && j <= y1 && !cellAt(i,j)) glyph(ctx,base,i + .5,j + .5,.22);
  }
  ctx.strokeStyle = '#1B2F35'; ctx.lineWidth = 1 / cam.zoom; ctx.beginPath();
  const every = cam.zoom < 11 ? 8 : 1;
  for (let x = Math.ceil(x0 / every) * every; x <= x1; x += every) { ctx.moveTo(x,y0); ctx.lineTo(x,y1); }
  for (let y = Math.ceil(y0 / every) * every; y <= y1; y += every) { ctx.moveTo(x0,y); ctx.lineTo(x1,y); }
  ctx.stroke();
  drawOrganism();
  for (const b of shownNests(x0,y0,x1,y1)) drawBreach(b);

  const cells = allCells().filter(c => c.x >= x0 - 2 && c.x <= x1 && c.y >= y0 - 2 && c.y <= y1);
  drawVeins();
  drawTracks();
  for (const w of Object.values(G.ruins)) if (!buried(w)) rect(ctx,w.x + .15,w.y + .15,sizeOf(w) - .3,sizeOf(w) - .3,'#321820','#FF6B6B');
  // Radar waves: one every 3 s from the pylon to the edge of what it sees, fading as they go.
  for (const c of allCells()) if (c.type === 'radar' && radarWave(c, motionTime() || G.time) != null) {
    const k = radarWave(c, motionTime() || G.time);
    ctx.globalAlpha = .55 * (1 - k);
    circle(ctx,c.x + .5,c.y + .5,.6 + k * RADAR.range,null,'#66D9EA',Math.max(.05,1.5 / cam.zoom));
    ctx.globalAlpha = .08;
    circle(ctx,c.x + .5,c.y + .5,2.2,'#66D9EA');
    ctx.globalAlpha = 1;
  }
  for (const c of cells) {
    const size = sizeOf(c);
    ctx.save(); ctx.translate(c.x + size / 2,c.y + size / 2); ctx.scale(size,size); if (!built(c)) ctx.globalAlpha = .4; drawCell(ctx,c,isBelt(c) ? feeders(c).map(f => (f.dir + 2) % 4) : []);
    if (hasTrait(c.type, 'ring')) for (let i = 1; i < rankOf(c); i++) circle(ctx,0,0,.36 + i * .06,null,i > 1 ? '#C77DFF' : '#F0A03C',.04);
    ctx.restore();
  }
  for (const c of cells) {
    const x = c.x+.5, y = c.y+.5;
    const detail = cam.zoom >= 11;
    if (detail && (isBelt(c) || isSplit(c) || c.type === 'sort') && c.item) {
      const at = along(c,c.from,exitOf(c),c.t);
      token(ctx,c.item,at.x,at.y,at.angle);
    }
    if (detail && c.type === 'bridge') for (const l of c.lanes) if (l) {
      const at = along(c,l.dir,l.dir,l.t);
      token(ctx,l.item,at.x,at.y,at.angle);
    }
    const base = depositAt(c.x,c.y);
    if (base && c.type !== 'mine' && c.type !== 'borer') { rect(ctx,c.x,c.y + .7,.32,.3,'#05090B'); glyph(ctx,base,c.x + .16,c.y + .85,.12); }
    if (isGun(c) && !Object.values(c.ammo).some(n => n)) circle(ctx,x,y,.48,null,'#FF6B6B',.07);
  }
  if (cam.zoom >= 11) for (const c of cells) for (const p of passing(c)) {
    // Swallowed: a lump that goes through.
    circle(ctx,p.x,p.y,.2 + Math.sin(p.done * Math.PI) * .1,'#A8485C99','#FF8FA2',.04);
    token(ctx,p.item,p.x,p.y,0);
  }
  for (const c of cells) {
    if (c.type !== 'gate') continue;
    ctx.save(); ctx.translate(c.x + .5,c.y + .5); lamp(ctx,c); ctx.restore();
  }
  for (const c of [...cells, ...Object.values(G.ruins).filter(w => w.out != null)]) {
    if (built(c) && c.out == null) continue;
    const color = c.out != null ? '#FF6B6B' : '#55D6E8';
    const size = sizeOf(c);
    ctx.setLineDash([.14,.1]); rect(ctx,c.x + .06,c.y + .06,size - .12,size - .12,null,color); ctx.setLineDash([]);
  }
  drawNerves();
  drawWorms();
  for (const s of G.shots) {
    if (s.gun === 'mist') {
      const k = 1 - Math.max(0, s.until - G.time) / .7;
      ctx.globalAlpha = .5 * (1 - k); ctx.beginPath(); ctx.arc(s.x, s.y, s.reach * Math.min(1, k * 1.6), 0, Math.PI * 2);
      ctx.fillStyle = '#66D9EA'; ctx.fill(); ctx.globalAlpha = 1;
      continue;
    }
    ctx.strokeStyle = {1:'#8B989C',2:'#FFD0D0',5:'#F0A03C',12:'#B7F34A'}[s.hurt]; ctx.lineWidth = (s.hurt === 12 ? .13 : .06) * (s.gun === 'sting' ? 1.6 : s.gun === 'harpoon' ? 2.4 : 1);
    const a = Math.atan2(s.ty - s.y,s.tx - s.x), off = (s.barrel || 0) * .17;
    const out = s.gun === 'sting' ? .66 : s.gun === 'maw' ? .38 : .3;
    ctx.beginPath(); ctx.moveTo(s.x + Math.cos(a) * out - Math.sin(a) * off,s.y + Math.sin(a) * out + Math.cos(a) * off); ctx.lineTo(s.tx,s.ty); ctx.stroke();
  }
  // Bodies lie a while, dark and flat, then sink.
  if (G.corpses) {
    G.corpses = G.corpses.filter(d => corpseSunk(d) < 1);
    for (const d of G.corpses) if (inSight(d.x, d.y)) {
      ctx.globalAlpha = .8 * (1 - corpseSunk(d));
      ctx.beginPath(); ctx.ellipse(d.x, d.y, .42, .24, d.a, 0, Math.PI * 2); ctx.fillStyle = '#21100F'; ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
  // A recycler's beam: the body glides in along it, shrinking, while a bright line sweeps it.
  for (const c of allCells()) if (c.type === 'reaper' && c.beam) {
    const k = Math.min(1, (G.time - c.beam.at) / REAPER.time), cx = c.x + .5, cy = c.y + .5;
    const bx = c.beam.x + (cx - c.beam.x) * k, by = c.beam.y + (cy - c.beam.y) * k, a = Math.atan2(by - cy, bx - cx), w = .32 * (1 - k * .6);
    ctx.globalAlpha = .35; ctx.fillStyle = '#55D6E8';
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(bx - Math.sin(a) * w, by + Math.cos(a) * w); ctx.lineTo(bx + Math.sin(a) * w, by - Math.cos(a) * w); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = .9;
    ctx.beginPath(); ctx.ellipse(bx, by, .42 * (1 - k * .7), .24 * (1 - k * .7), c.beam.a || 0, 0, Math.PI * 2); ctx.fillStyle = '#21100F'; ctx.fill();
    const sweep = Math.sin(motionTime() * 12) * .3 * (1 - k * .7);
    ctx.beginPath(); ctx.moveTo(bx - Math.sin(a) * sweep - Math.cos(a) * .3, by + Math.cos(a) * sweep - Math.sin(a) * .3); ctx.lineTo(bx - Math.sin(a) * sweep + Math.cos(a) * .3, by + Math.cos(a) * sweep + Math.sin(a) * .3);
    ctx.strokeStyle = '#C9F7FF'; ctx.lineWidth = .05; ctx.stroke();
    ctx.globalAlpha = 1;
  }
  const packs = [];
  for (const e of G.enemies.map(creatureAt)) {
    if (!inSight(e.x,e.y)) continue;
    const pack = packs.find(p => p.e.gene === e.gene && Math.abs(p.e.x - e.x) < .8 && Math.abs(p.e.y - e.y) < .6);
    if (pack) pack.n++; else packs.push({e, n:1});
  }
  for (const {e, n} of packs) {
    if (e.z) { ctx.save(); ctx.translate(0, -e.z); }
    if (n > 1) {
      ctx.save(); ctx.translate(e.x + .5,e.y - .34); ctx.scale(1/40,1/40);
      ctx.fillStyle = '#FFD0D0'; ctx.font = '700 14px Verdana'; ctx.fillText('×' + n,0,0); ctx.restore();
    }
    ctx.strokeStyle = '#B34A5A'; ctx.lineWidth = .06; ctx.beginPath();
    for (const dx of [-.16,0,.16]) { ctx.moveTo(e.x+dx,e.y-.24); ctx.lineTo(e.x+dx,e.y+.32); }
    ctx.stroke();
    const body = e.kind === 'swarm' ? .35 : e.kind === 'titan' ? 2.4 : 1;
    ctx.beginPath(); ctx.ellipse(e.x,e.y,.36 * body * (1 + flinchOf(e) * .18),.2 * body * (1 + flinchOf(e) * .18),0,0,Math.PI*2); ctx.fillStyle = flinchOf(e) > .3 ? '#C24A5A' : '#3A1820'; ctx.fill();
    ctx.strokeStyle = '#FF6B6B'; ctx.stroke();
    [...e.gene].forEach((b,i) => glyph(ctx,b,e.x+(i-1)*.22,e.y,.1));
    rect(ctx,e.x-.3,e.y-.38,.6*Math.max(0,e.hp/e.max),.07,'#FF6B6B');
    if (e.z) ctx.restore();
  }
  drawFog(ctx);
  drawDrones();
  sceneSigns(ctx);
  drawPreview(ctx);
  // What is off screen keeps an arrow on the edge.
  ctx.setTransform(view.dpr,0,0,view.dpr,0,0);
  for (const e of G.enemies) if (inSight(e.x,e.y)) marker(e.x,e.y,'#FF6B6B');
  for (const b of G.breaches) if (b.state === 'wake' && known(b.x,b.y)) marker(b.x + .5,b.y + .5,'#F0A03C');
  marker(CORE.x + .5,CORE.y + .5,'#B7F34A');
}
function drawDrones() {
  const t = G.time + owed, s = Math.max(1, Math.min(1.8, 17 / cam.zoom));
  for (const d of G.drones) {
    const {x, y, w, a, goal, undo} = dronePose(d);
    if (goal && w < .5) {
      ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(goal.x,goal.y);
      ctx.strokeStyle = '#55D6E8AA'; ctx.lineWidth = 1 / cam.zoom; ctx.setLineDash([.3,.3]); ctx.lineDashOffset = -motionTime() % .6; ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset = 0;
    }
    if (goal && w >= .5) for (let i = 0; i < 3; i++) {
      const tx = goal.x + Math.sin(t * 7 + i * 2.1) * .36, ty = goal.y + Math.cos(t * 5 + i * 2.1) * .36;
      ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(tx,ty); ctx.strokeStyle = undo ? '#FF6B6BAA' : '#D5FAFF99'; ctx.lineWidth = .035; ctx.stroke();
      circle(ctx,tx,ty,.06,!i ? '#F0A03C' : undo ? '#FF6B6B' : '#B7F34A');
    }
    ctx.save(); ctx.translate(x,y); ctx.rotate(a); ctx.scale(s,s);
    for (const [ax,ay] of [[.17,.21],[.17,-.21],[-.17,.21],[-.17,-.21]]) {
      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(ax,ay); ctx.strokeStyle = '#8B989C'; ctx.lineWidth = .05; ctx.stroke();
      circle(ctx,ax,ay,.12,'#8FE3EF44','#55D6E8',.025);
    }
    ctx.beginPath(); ctx.ellipse(0,0,.22,.13,0,0,Math.PI * 2); ctx.fillStyle = '#3A5A2B'; ctx.fill();
    ctx.strokeStyle = '#B7F34A'; ctx.lineWidth = .04; ctx.stroke();
    circle(ctx,.17,0,.07,'#D5FAFF');
    ctx.restore();
  }
}
function drawVeins() {
  const stroke = (a,b,color,width,dash = []) => {
    ctx.beginPath(); ctx.moveTo(a.x + .5,a.y + .5); ctx.lineTo(b.x + .5,b.y + .5);
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.setLineDash(dash); ctx.stroke(); ctx.setLineDash([]);
  };
  for (const c of pumps()) {
    const to = c.to && G.cells[c.to];
    if (!to) continue;
    const broken = c.veinHp <= 0, leak = leaking(c);
    stroke(c,to,broken ? '#FF4D5E' : '#55202E',.7,broken ? [.5,.4] : []);
    if (c.veinOut != null) stroke(c,to,'#FF6B6B',.12,[.3,.3]);
    if (c.veinCut) continue;
    if (c.veinLeft > 0) { stroke(c,to,'#55D6E8',.12,[.3,.3]); continue; }
    if (!broken) stroke(c,to,leak ? '#FF4D5E' : '#A8485C',.16);
    for (const p of c.packets) {
      const k = Math.min(1,p.t), x = c.x + .5 + (to.x - c.x) * k, y = c.y + .5 + (to.y - c.y) * k;
      circle(ctx,x,y,.2 + Math.min(8,p.n) * .022,'#C85A72','#FF8FA2');
      glyph(ctx,contentOf(p.item)[0],x,y,.16);
    }
    if (leak) for (let i = 0; i < 6; i++) {
      const p = (G.time + i / 6) % 1;
      circle(ctx,(c.x + to.x + 1) / 2 + Math.cos(i * 2.4) * p,(c.y + to.y + 1) / 2 + Math.sin(i * 2.4) * p,.14 * (1 - p),'#FF4D5E');
    }
  }
  if (drag?.vein && gesture?.mode === 'draw') {
    const far = Math.hypot(drag.aim.x - drag.vein.x,drag.aim.y - drag.vein.y) > VEIN.reach;
    stroke(drag.vein,drag.aim,far ? '#FF4D5E' : '#FF8FA2',.3,[.4,.3]);
  }
  const from = linking && G.cells[linking];
  if (from) circle(ctx,from.x + .5,from.y + .5,VEIN.reach,null,'#FF8FA2',2 / cam.zoom);
}
function drawBreach(b) {
  const x = b.x + .5, y = b.y + .5, fade = b.state === 'spent' ? 1 - (G.time - b.ended) / 8 : 1;
  if (fade <= 0) return;
  const asleep = b.state === 'sleep';
  ctx.globalAlpha = fade;
  circle(ctx,x,y,3.5,asleep ? '#171A1B' : '#241016');
  // Hit, it flashes red for a moment.
  const hurt = nestHurt(b);
  if (hurt > 0) { ctx.globalAlpha = fade * hurt * .55; circle(ctx,x,y,2.6 + (1 - hurt) * .8,'#FF6B6B'); ctx.globalAlpha = fade; }
  // The circle is the limit to build up to without waking it.
  if (asleep) { ctx.setLineDash([.6,.6]); circle(ctx,x,y,b.r + Math.sin(motionTime() * 1.1) * .08,null,'#6B5960',Math.max(.06,1 / cam.zoom)); ctx.setLineDash([]); }
  if (!asleep && b.max) {
    circle(ctx,x,y,3.75,null,'#3A1820',.16);
    ctx.beginPath(); ctx.arc(x,y,3.75,-Math.PI / 2,-Math.PI / 2 + Math.PI * 2 * Math.max(0, b.hp / b.max));
    ctx.strokeStyle = b.hp < b.max && G.time - (b.hitAt ?? -99) >= NEST.quiet ? '#B7F34A' : '#FF6B6B'; ctx.lineWidth = .16; ctx.stroke();
  }
  const full = b.left / b.total, beat = asleep ? 0 : Math.sin(G.time * 5) * .1;
  const form = formOf(b), size = (.7 + full * .6 + beat) * (1 + (b.tier || 0) * .12);
  const body = asleep ? '#2A2527' : '#3A1820', edge = asleep ? '#8B989C' : '#FF6B6B';
  if (form === 1) polygon(ctx,Array.from({length:6},(_,i) => [x + Math.cos(i * Math.PI / 3) * size,y + Math.sin(i * Math.PI / 3) * size]),body,edge,.12);
  else if (form === 2) polygon(ctx,[[-1.7,-.2],[-.5,-.75],[.4,-.4],[1.7,-.35],[.7,.5],[-.3,.35],[-1.1,.7]].map(([a,c]) => [x + a * size,y + c * size]),body,edge,.12);
  else if (form === 3) for (let i = 0; i < 5; i++) circle(ctx,x + Math.cos(i * 1.257) * size * .75,y + Math.sin(i * 1.257) * size * .75,size * (.4 + (i % 3) * .08),body,edge,.1);
  else circle(ctx,x,y,size,body,edge,.12);
  // One spine a level above the first.
  for (let i = 0; i < (b.tier || 0) * 3; i++) {
    const a = i * Math.PI * 2 / ((b.tier || 0) * 3);
    polygon(ctx,[[x + Math.cos(a) * 3,y + Math.sin(a) * 3],[x + Math.cos(a + .09) * 2.4,y + Math.sin(a + .09) * 2.4],[x + Math.cos(a - .09) * 2.4,y + Math.sin(a - .09) * 2.4]],edge);
  }
  if (cam.zoom >= 8) {
    b.genes.forEach((gene,row) => [...gene].forEach((base,i) => glyph(ctx,base,x + (i - 1) * .65,y + 2 + row * .65,.24)));
    ctx.save(); ctx.translate(x,y); ctx.scale(1/40,1/40);
    ctx.fillStyle = asleep ? '#A3B8B3' : '#FFD0D0'; ctx.font = '700 28px Verdana'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(b.left,0,0); ctx.restore();
  }
  ctx.globalAlpha = 1;
}
function drawTracks() {
  const s = trackSize();
  for (const c of Object.values(G.tracks)) {
    const x = c.x + s / 2, y = c.y + s / 2, color = c.out != null ? '#FF6B6B' : built(c) ? '#B7F34A' : '#55D6E8';
    ctx.globalAlpha = built(c) ? .8 : .4;
    if (s > 1) { ctx.strokeStyle = color; ctx.lineWidth = .1; for (const o of [-.9, .9]) { ctx.beginPath(); ctx.moveTo(x - DX[c.dir] - DY[c.dir] * o,y - DY[c.dir] + DX[c.dir] * o); ctx.lineTo(x + DX[c.dir] - DY[c.dir] * o,y + DY[c.dir] + DX[c.dir] * o); ctx.stroke(); } }
    for (const k of [0,.33,.66]) circle(ctx,x + DX[c.dir] * k * s,y + DY[c.dir] * k * s,(k ? .07 : .11) * s,color);
    if (cam.zoom >= 14 && (c.x + c.y) % 3 === 0) { ctx.save(); ctx.translate(x,y); arrow(ctx,c.dir,.36,color); ctx.restore(); }
  }
  ctx.globalAlpha = 1;
}
function drawWorms() {
  const centre = tileCentre, s = trackSize();
  for (const w of G.worms) {
    const moving = built(w) && !w.docked && !w.stuck, k = moving ? Math.min(1,w.t + owed * WORM.speed) : 0;
    const next = moving && trackAfter(w.path[0]);
    if (!built(w)) ctx.globalAlpha = .45;
    if (w.out != null) { const [x,y] = centre(w.path[0]); circle(ctx,x,y,.62,null,'#FF6B6B',.06); }
    for (let i = w.path.length - 1; i >= 0; i--) {
      let [x,y] = centre(w.path[i]);
      const to = i ? w.path[i - 1] : next && key(next.x,next.y);
      if (moving && to) { const [tx,ty] = centre(to); x += (tx - x) * k; y += (ty - y) * k; }
      const hold = w.holds[i - 1];
      circle(ctx,x,y,(hold ? .5 : .38) * s,hold ? '#2A4A22' : '#4E7F2D','#C9F77A',.07);
      if (!i) { circle(ctx,x - .12,y,.07,'#D5FAFF'); circle(ctx,x + .12,y,.07,'#D5FAFF'); }
      if (hold?.n) {
        circle(ctx,x,y,(.14 + hold.n / holdCap() * .26) * s,'#17301D');
        sequence(ctx,hold.kind,x,y,.76,.2);
      }
      if (w.id === wormId) circle(ctx,x,y,.58,null,'#B7F34A',.05);
    }
    ctx.globalAlpha = 1;
    if (w.hp < WORM.hp - .5) {
      const [x,y] = centre(w.path[0]);
      rect(ctx,x - .4,y - .65,.8 * Math.max(0,w.hp / WORM.hp),.09,healing({...w,type:'worm'}) ? '#62E06A' : '#FF6B6B');
    }
  }
}
function drawOrganism() {
  const x = CORE.x + .5, y = CORE.y + .5, part = stagePart() ?? 0;
  const born = Math.min(1,(G.time - (G.grownAt ?? -99)) / 3), size = G.stage + part - (1 - born);
  const reach = .9 + Math.max(0,size) * 1.6, arms = 5 + G.stage * 3;
  ctx.lineCap = 'round';
  for (let i = 0; i < arms; i++) {
    const a = i * 2.39996, far = reach * (.8 + (i % 4) * .13), bend = a + Math.sin(G.time * .8 + i) * .22;
    ctx.beginPath(); ctx.moveTo(x,y);
    ctx.quadraticCurveTo(x + Math.cos(bend) * far * .6,y + Math.sin(bend) * far * .6,x + Math.cos(a) * far,y + Math.sin(a) * far);
    ctx.strokeStyle = '#2F5A25'; ctx.lineWidth = .1 + G.stage * .05; ctx.stroke();
    if (G.stage) circle(ctx,x + Math.cos(a) * far,y + Math.sin(a) * far,.08 + G.stage * .06,['#5E9E2B','#A8485C','#2E7F91'][i % G.stage % 3]);
  }
  circle(ctx,x,y,.5 + G.stage * .22 + Math.sin(G.time * 2.5) * .05,'#203C1E','#6DAA38',.07);
  if (part > 0) {
    ctx.beginPath(); ctx.arc(x,y,.75 + G.stage * .22,-Math.PI / 2,-Math.PI / 2 + part * Math.PI * 2);
    ctx.strokeStyle = '#B7F34A'; ctx.lineWidth = .12; ctx.stroke();
  }
}
function drawNerves() {
  const cable = (a,b,color,dash) => {
    ctx.beginPath(); ctx.moveTo(a.x + .5,a.y + .5); ctx.lineTo(b.x + .5,b.y + .5);
    ctx.strokeStyle = color; ctx.lineWidth = Math.max(.07,1.2 / cam.zoom); ctx.setLineDash(dash); ctx.stroke(); ctx.setLineDash([]);
  };
  for (const w of G.wires) {
    const a = G.cells[w.a], b = G.cells[w.b];
    if (!a || !b) continue;
    const live = carries(w), cut = !w.hp;
    cable(a,b,cut || w.out != null ? '#FF4D5E' : live ? NERVE_COLORS[w.color || 0].hex : '#55D6E8',live ? [] : [.25,.25]);
  }
  const heard = selected && G.cells[selected];
  const ear = heard && (G.cells[heard.source] || (heard.type === 'gate' && G.cells[heard.watch]));
  if (ear && ear !== heard) cable(heard, ear, '#F0A03C', [.15,.15]);
  if (drag?.nerve && gesture?.mode === 'draw') cable(drag.nerve,drag.aim,Math.hypot(drag.aim.x - drag.nerve.x,drag.aim.y - drag.nerve.y) > NERVE.reach ? '#FF4D5E' : '#55D6E8',[.4,.3]);
  const from = wiring && G.cells[wiring];
  if (from) circle(ctx,from.x + .5,from.y + .5,NERVE.reach,null,'#55D6E8',2 / cam.zoom);
}
function marker(x,y,color) {
  const cx = view.w / 2, cy = view.h / 2, dx = (x - cam.x) * cam.zoom, dy = (y - cam.y) * cam.zoom * flat();
  if (Math.abs(dx) <= cx && Math.abs(dy) <= cy) return;
  const s = ui.safe, roomX = dx < 0 ? cx - 20 : cx - s.right, roomY = dy < 0 ? cy - s.top : cy - s.bottom;
  const k = Math.min(Math.max(20,roomX) / Math.abs(dx || 1e-6),Math.max(20,roomY) / Math.abs(dy || 1e-6));
  const px = cx + dx * k, py = cy + dy * k, a = Math.atan2(dy,dx);
  if (!STILL.matches) { const wave = motionTime() * .8 % 1; circle(ctx,px,py,8 + wave * 12,null,color + Math.round((1 - wave) * 160).toString(16).padStart(2,'0'),1.5); }
  polygon(ctx,[0,2.4,-2.4].map((turn,i) => [px + Math.cos(a + turn) * (i ? 8 : 10),py + Math.sin(a + turn) * (i ? 8 : 10)]),color);
}

// Interface
const SHAPE = {
  S:'<circle cx="9" cy="9" r="7" fill="#6DAA38" stroke="#C9F77A" stroke-width="2"/>',
  F:'<rect x="1.5" y="5" width="15" height="8" rx="4" fill="#B86B1E" stroke="#FFC06B" stroke-width="2"/>',
  C:'<path d="M2 9L13 2L16 9L13 16Z" fill="#B9AA8C" stroke="#FFF3D9" stroke-width="2"/>',
  K:'<path d="M9 1.5L15.5 5.2V12.8L9 16.5L2.5 12.8V5.2Z" fill="#23282C" stroke="#AEB9BF" stroke-width="2"/>',
  I:'<path d="M9 1.5L15 9L9 16.5L3 9Z" fill="#3A1D4A" stroke="#D08CFF" stroke-width="2"/><circle cx="9" cy="6.5" r="1.6" fill="#F1D6FF"/>',
  N:'<path d="M2 9H16M5.5 3L12.5 15M12.5 3L5.5 15" stroke="#55D6E8" stroke-width="2.5"/><circle cx="9" cy="9" r="3" fill="#D5FAFF"/>'
};
function geneMark(gene) {
  if (!/^([SFCN]{3}){1,2}$/.test(gene)) return '';
  return `<span class="gene" role="img" aria-label="${[...gene].map(b => BASE[b]).join(', ')}">${[...gene].map((b, i) => `${i === 3 ? '<i class="cut"></i>' : ''}<svg viewBox="0 0 18 18">${SHAPE[b]}</svg>`).join('')}</span>`;
}
// A code (SFS, C?F, SFSFFF, or a lone base) is never read as letters. C’est, MK2 and words are left alone.
const CODE = /(?<![\p{L}\p{N}_?’'])([SFCNK?]{6}|[SFCNK?]{3}|[SFCNK])(?![\p{L}\p{N}_?’'])/gu;
const piecesOf = text => String(text).split(CODE).map((part, i) => ({part, code:i % 2 === 1}));
// The code stays in the text for copying and for what reads it, hidden behind its drawing.
function write(el, text) {
  if (el.textContent === text) return;
  el.replaceChildren(...piecesOf(text).map(({part, code}) => {
    if (!code) return document.createTextNode(part);
    const mark = document.createElement('span'), letters = document.createElement('span');
    mark.className = 'gene inline';
    mark.setAttribute('role', 'img');
    mark.setAttribute('aria-label', [...part].map(base => MATTER[base] || L('n’importe laquelle')).join(', '));
    mark.innerHTML = [...part].map((base, i) => `${i === 3 ? '<i class="cut"></i>' : ''}${markOf(base) || JOKER}`).join('');
    letters.hidden = true; letters.textContent = part;
    mark.append(letters);
    return mark;
  }));
}
const JOKER = '<svg viewBox="0 0 18 18"><circle cx="9" cy="9" r="6" fill="none" stroke="#A9BDB8" stroke-width="2" stroke-dasharray="3 2.5"/></svg>';
function sentenceWidth(g, text) {
  return piecesOf(text).reduce((wide, {part, code}) => wide + (code ? part.length * 14 + 2 : g.measureText(part).width), 0);
}
// From the left, y in the middle of the line.
function drawSentence(g, text, x, y) {
  const color = g.fillStyle;
  g.textAlign = 'left'; g.textBaseline = 'middle';
  for (const {part, code} of piecesOf(text)) {
    g.fillStyle = color;
    if (!code) { g.fillText(part, x, y); x += g.measureText(part).width; continue; }
    [...part].forEach((base, i) => {
      if (base === '?') circle(g, x + 7 + i * 14, y, 5, null, '#A9BDB8', 1.5);
      else glyph(g, base, x + 7 + i * 14, y, 6);
    });
    x += part.length * 14 + 2;
  }
}
function say(text) { note = text; ui.saidAt = performance.now(); write($('message'), text); }
// One sign per kind of action, the words stay beside it.
const ICONS = [
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
function button(text, action) {
  const b = document.createElement('button'), icon = document.createElement('span');
  icon.className = 'icon'; icon.setAttribute('aria-hidden', 'true');
  icon.innerHTML = `<svg viewBox="0 0 18 18">${ICONS.find(([sign]) => sign.test(text))[1]}</svg>`;
  b.append(icon, document.createTextNode(text));
  if (/^(Démonter|Retirer)/.test(text)) b.classList.add('danger');
  b.onclick = () => {
    action(); refresh();
    const again = [...$('actions').querySelectorAll('button')].find(o => !o.classList.contains('slot') && o.textContent.split(' :')[0] === text.split(' :')[0]);
    if (!again) return;
    if (again.textContent !== text) again.classList.add('flip');
    // Rebuilt petals would drop who walks them with Tab.
    if (tabbed) again.focus();
  };
  $('actions').append(b);
  return b;
}
// Auto, then one way, then the other. From auto, the first tap reverses what was guessed.
function turnWay(c, axis) {
  c.ways ||= [null, null];
  const guess = wayOf({...c, ways:null}, axis) ?? axis + 2, first = (guess + 2) % 4, set = c.ways[axis];
  c.ways[axis] = set == null ? first : set === first ? guess : null;
  // What is already on the lane follows the new way.
  if (c.ways[axis] != null && c.lanes[axis]) c.lanes[axis].dir = c.ways[axis];
}
// What a machine holds, wherever it keeps it: an item on its way, a stock, its inputs, its ammunition, a bridge's lanes.
const holdsAnything = c => Boolean(c.item || c.stock?.length || c.ports?.some(p => p.length) || Object.values(c.ammo || {}).some(n => n > 0) || c.lanes?.some(Boolean) || c.outs?.some(Boolean) || c.packets?.length);
function emptyOut(c) {
  c.item = null; c.t = 0;
  if (c.stock) { c.stock = []; c.due = []; }
  if (c.ports) { c.ports = c.ports.map(() => []); c.portDue = c.ports.map(() => []); }
  if (c.ammo) c.ammo = {};
  if (c.lanes) c.lanes = c.lanes.map(() => null);
  if (c.packets) c.packets = [];
  if (c.outs) c.outs = [null, null, null];
}
function showActions() {
  ui.at = '';
  $('actions').replaceChildren();
  const c = selected && G.cells[selected];
  const w = pickedWorm();
  if (!c && w) {
    button(L`Départ : ${{auto:'auto', full:L('plein ou vide'), timer:'5 s'}[w.rule]}`, () => { w.rule = {auto:'full', full:'timer', timer:'auto'}[w.rule]; showActions(); });
    if (w.docked) button(L('Partir'), () => { w.docked = false; w.t = 0; });
    button(L('Vider'), () => { for (const h of w.holds) { h.n = 0; h.kind = ''; } });
    if (w.out != null) button(L('Annuler le retrait'), () => { keepIt(w); showActions(); });
    else button(L('Retirer'), () => { scrap(w, () => { dropWorm(w, true); wormId = null; }); showActions(); });
    return;
  }
  if (!c) {
    if (!hasTrait(tool, 'aimless'))
      button(L`Sens : ${WAYS[heading]}`, () => { setHeading((heading + 1) % 4); showActions(); });
    return;
  }
  if (c.type === 'core') {
    return;
  }
  if (hasTrait(c.type, 'turn')) button(L('Tourner'), () => { c.dir = (c.dir + 1) % 4; if (tool === c.type) setHeading(c.dir); });
  if (c.type === 'ligase') button(L('Inverser 1↔3'), () => { c.flip = !c.flip; c.ports.reverse(); c.portDue?.reverse(); c.last = [...c.last].reverse().join(''); });
  if (c.type === 'bridge') [0, 1].forEach(axis => {
    const set = c.ways?.[axis] ?? null, name = axis ? 'Voie ↔' : 'Voie ↕';
    button(`${name} : ${set == null ? 'auto' : ['↑','→','↓','←'][set]}`, () => { turnWay(c, axis); showActions(); });
  });
  if (c.type === 'pump') {
    button(L('Tirer une veine'), () => { linking = key(c.x, c.y); say(L('Touche la pompe d’arrivée, ou un sol libre pour en poser une. 24 cases au plus.')); const hint = note; select(null); say(hint); });
    if (c.to) button(c.veinOut != null ? L('Annuler la coupe') : L('Couper la veine'), () => { if (c.veinOut != null) keepVein(c); else scrapVein(c); showActions(); });
    button(L('Vider'), () => { for (const p of network(c)) { p.stock = []; p.packets = []; } });
  }
  // Any machine holding something can be emptied; pumps and encapsulators keep their own, which empty more.
  if (!hasTrait(c.type, 'ownEmpty') && holdsAnything(c)) button(L('Vider'), () => { emptyOut(c); refresh(); showActions(); });
  if (c.type === 'desk') {
    button(L`Priorité : ${DESK_NAMES[c.mode || 'most']}`, () => { c.mode = DESK.modes[(DESK.modes.indexOf(c.mode || 'most') + 1) % DESK.modes.length]; sense(); showActions(); });
    if (c.mode === 'hand') {
      const genes = [...new Set(G.families.map(opposite))];
      button(c.gene ? L`Gène fixé : ${c.gene}` : L('Gène fixé : aucun'), () => { c.gene = genes[(genes.indexOf(c.gene) + 1) % genes.length]; sense(); showActions(); });
    }
  }
  if (c.type === 'pocket') button(c.unload ? L('Poche : vide') : L('Poche : charge'), () => { c.unload = !c.unload; showActions(); });
  if (c.type === 'pack') {
    button(L`Recette : ${BOX[c.box].name}`, () => { const order = unlocked(4) ? ['T', 'A', 'H'] : ['T', 'A']; setRecipe(c, order[(order.indexOf(c.box) + 1) % order.length]); showActions(); });
    button(L`Carbone : ${c.flip ? L('à droite') : L('à gauche')}`, () => { c.flip = !c.flip; showActions(); });
    button(L('Vider'), () => { c.ports = [[], [], []]; c.item = null; c.last = ''; });
  }
  // Mirrored, the left output goes right and the right one left.
  if (c.type === 'unbind' || c.type === 'unjoin') button(L('Inverser gauche↔droite'), () => { c.flip = !c.flip; });
  if (c.type === 'join') button(L('Inverser 1↔2'), () => {
    c.flip = !c.flip; c.ports = [c.ports[1], c.ports[0], []];
    if (c.portDue) c.portDue = [c.portDue[1], c.portDue[0], []];
    c.last = c.last ? c.last.slice(3) + c.last.slice(0, 3) : '';
  });
  if (c.type === 'radar') {
    const modes = ['creatures', 'nests', 'both'], names = {creatures:L('Détecte : créatures'), nests:L('Détecte : nids'), both:L('Détecte : nids et créatures')};
    button(names[c.watch || 'creatures'], () => { c.watch = modes[(modes.indexOf(c.watch || 'creatures') + 1) % modes.length]; showActions(); });
  }
  if (c.type === 'arm') {
    const seen = [...new Set(liftable(ahead(c, (c.dir + 2) % 4)).map(contentOf))], order = ['', ...new Set([c.pick || '', ...seen].filter(Boolean))];
    button(c.pick ? L`Ne prend que ${c.pick}` : L('Prend tout'), () => { c.pick = order[(order.indexOf(c.pick || '') + 1) % order.length]; showActions(); });
  }
  if (isGun(c)) button(c.strict ? L('Tir : 2 justes min.') : L('Tir : sur tout'), () => { c.strict = !c.strict; showActions(); });
  if (c.type === 'sort') {
    const change = work => () => { work(); showActions(); };
    button(c.side === 3 ? L('Sort à gauche') : L('Sort à droite'), change(() => { c.side = c.side === 3 ? 1 : 3; }));
    // On a nerve the manual filter is only the fallback: its controls would cover the board on a phone.
    const onNerve = G.wires.some(w => w.a === key(c.x,c.y) || w.b === key(c.x,c.y));
    if (!onNerve) {
    button({1:L('Base'), 3:L('Gène'), 6:L('Brin')}[c.want.length], change(() => { c.want = c.want.length === 1 ? (c.want === 'K' ? '?' : c.want) + '??' : c.want.length === 3 && unlocked(2) ? c.want + '???' : c.want[0]; }));
    const row = document.createElement('span');
    row.className = 'slots';
    [...c.want].forEach((base, i) => {
      const b = button('?', change(() => {
        const order = c.want.length === 1 ? (unlocked(4) ? 'SFCNKI?' : 'SFCNK?') : 'SFCN?';
        c.want = c.want.slice(0, i) + order[(order.indexOf(base) + 1) % order.length] + c.want.slice(i + 1);
      }));
      b.classList.add('slot');
      b.setAttribute('aria-label', L`Filtre, position ${i + 1} : ${MATTER[base] || 'joker'}. Toucher pour changer.`);
      b.innerHTML = SHAPE[base] ? `<svg viewBox="0 0 18 18" width="20" height="20">${SHAPE[base]}</svg>` : JOKER.replace('<svg', '<svg width="20" height="20"');
      row.append(b);
    });
    $('actions').append(row);
      button(L('= dernier passé'), change(() => { if (c.seen) c.want = c.seen; else refuse(L('Rien n’est encore passé dans ce trieur.')); })).disabled = !c.seen;
    }
  }
  if (NERVE.ends.includes(c.type) && G.wires.some(w => w.a === key(c.x,c.y) || w.b === key(c.x,c.y))) {
    if (c.type === 'gate') {
      const order = Object.keys(WHEN);
      button(L`S’ouvre sur : ${WHEN[c.when || 'gene'].name}`, () => { c.when = order[(order.indexOf(c.when || 'gene') + 1) % order.length]; c.passed = 0; sense(); showActions(); });
      if (c.when && c.when !== 'gene') button(c.batch ? L`Lot : ${c.batch} à chaque ouverture` : L('Lot : sans limite'), () => { c.batch = BATCHES[(BATCHES.indexOf(c.batch || 0) + 1) % BATCHES.length]; c.passed = 0; showActions(); });
    }
    if (hasTrait(c.type, 'listen') && !(c.type === 'gate' && c.when && c.when !== 'gene')) {
      button(c.read ? L`Lit : position ${c.read}` : L('Lit : gène entier'), () => { c.read = ((c.read || 0) + 1) % ((heardOf(c)?.focus?.length || 3) > 3 ? 7 : 4); showActions(); });
    }
    if (c.type === 'gate') button(L`Si coupé : ${c.open ? 'vert' : 'rouge'}`, () => { c.open = !c.open; showActions(); });
    if (c.type === 'cyst' || c.type === 'vault') button(L`Plein à : ${Math.ceil(capOf(c) * (c.level ?? .5))} / ${capOf(c)}`, () => { c.level = [.25, .5, .75, 1][([.25, .5, .75, 1].indexOf(c.level ?? .5) + 1) % 4]; sense(); showActions(); });
    if (hasTrait(c.type), 'listen') {
      const src = c.source && G.cells[c.source];
      button(L`Écoute : ${sourceName(c, src)}. Changer`, () => {
        listening = key(c.x, c.y); select(null);
        say(L('Touche ce que cet élément doit écouter sur son réseau : une arme, un radar, le cœur, un kyste ou un pupitre. Touche-le lui-même pour écouter tout le réseau.'));
      });
    }
    button(L('Lire le réseau'), () => say(netSummary(c)));
    const mine = () => G.wires.filter(w => w.a === key(c.x,c.y) || w.b === key(c.x,c.y));
    const cutting = mine().every(w => w.out != null), net = netWires(key(c.x,c.y)), tint = net[0]?.color || 0;
    button(L`Couleur du réseau : ${NERVE_COLORS[tint].name}`, () => { for (const w of net) w.color = (tint + 1) % NERVE_COLORS.length; showActions(); });
    button(cutting ? L('Garder ses nerfs') : L('Couper ses nerfs'), () => {
      for (const w of mine()) { if (cutting) keepIt(w); else scrap(w, () => { G.wires = G.wires.filter(o => o !== w); }); }
      sense(); showActions();
    });
  }
  if (RANKS[c.type] || c.type === 'gate') {
    if (c.up != null) button(L('Annuler l’amélioration'), () => { dropRise(c); showActions(); });
    else if (RANKS[c.type]) for (const mk of [2, 3]) {
      if (canRise(c, mk)) button(L`Passer en MK${mk} · ${upCost(c, mk)} ADN`, () => { raise([c], mk); showActions(); });
      else if (!rankOpen(mk) && rankOf(c) < mk) button(L`MK${mk} : stade ${RANK_NEED[mk - 1] + 1}`, () => refuse(L`Le rang MK${mk} s’ouvre au stade ${RANK_NEED[mk - 1] + 1}.`));
    }
    const row = isBelt(c) ? rowOf(c) : [];
    if (row.length > 1) for (const mk of [2, 3]) {
      const todo = row.filter(o => canRise(o, mk));
      if (todo.length > (todo[0] === c ? 1 : 0)) button(L`Ligne en MK${mk} (${todo.length}) · ${todo.reduce((sum, o) => sum + upCost(o, mk), 0)} ADN`, () => { raise(rowOf(c), mk); showActions(); });
    }
  }
  if (c.type === 'vault') button(L('Vider'), () => { c.stock = []; });
  if (c.type === 'ligase') button(L('Vider'), () => { c.ports = [[],[],[]]; c.item = null; });
  if (c.out != null) button(L('Annuler le démontage'), () => { keepIt(c); showActions(); });
  else button(refund(c) ? L`Démonter +${refund(c)}` : L('Démonter'), () => {
    scrap(c, () => { remove(c.x,c.y); selected = null; });
    showActions();
  });
}
function pickedWorm() { return G.worms.find(w => w.id === wormId); }
function wormState(w) {
  if (w.out != null) return w.cut ? L`Ver en retrait : ${Math.max(0, w.out).toFixed(1).replace('.', DEC)} s de jeu.` : L('Ver à retirer : un drone le rejoint, il roule en attendant.');
  if (!built(w)) return L`Ver en incubation : ${w.left.toFixed(1).replace('.', DEC)} s de jeu.`;
  const cargo = w.holds.map(h => h.n ? `${h.n} ${itemName(h.kind)}` : L('vide')).join(', ');
  const doing = w.docked ? L('à quai') : w.stuck ? L`arrêté, ${w.stuck}` : L('en route');
  const why = w.docked && w.rule === 'full' ? L(' Il attend que tout soit plein ou vide.') : '';
  return L`Ver ${doing}, de la tête à la queue : ${cargo}.${why} ${Math.ceil(w.hp)} PV sur ${WORM.hp}.`;
}
function selectWorm(w) {
  selected = null; chain = []; wormId = w.id;
  showActions(); refresh();
}
function select(id) {
  wormId = null;
  selected = id; chain = []; note = '';
  showActions(); refresh();
}
function choose(type) {
  if (type === 'lab' && allCells().some(c => c.type === 'lab')) return refuse(L('Le Laboratoire est unique : il est déjà construit. Touche-le pour ses améliorations.'));
  if (type === 'reaper' && allCells().some(c => c.type === 'reaper')) return refuse(L('Le Recycleur est unique : il est déjà construit.'));
  if (!unlocked(NEEDS[type] || 0)) {
    const want = STAGES[NEEDS[type] - 1];
    return refuse(L`${TYPES[type].name} s’ouvre quand le stade ${NEEDS[type]}, ${want.name}, est achevé. Touche le cœur pour voir ce qu’il réclame.`);
  }
  tool = type; linking = null; wiring = null; listening = null; select(null); say(TYPES[type].help);
  if (FAMILY_OF[type]) (ui.lastOf ||= {})[FAMILY_OF[type]] = type;
  for (const b of $('tools').querySelectorAll('[data-type]')) b.setAttribute('aria-pressed', b.dataset.type === type);
  paintRanks();
  // On a phone the fan folds once picked: the ground is needed.
  openFamily(NARROW.matches || !FAMILY_OF[type] ? null : FAMILY_OF[type]);
  paintInfo();
}
function orderHTML() {
  const want = STAGES[G.stage];
  if (!want) return L('<b>Éclosion réussie</b><span class="unit">mode libre : tout ce que tu livres devient de l’ADN</span>');
  if (G.goals && G.goals.length > 1) {
    // The next recipe to make, and how many others wait: the whole list is in the core's sheet.
    const open = G.goals.filter(g => g.fed < g.count), next = open[0] || G.goals[0], gene = geneMark(contentOf(next.item));
    const more = open.length > 1 ? `<span class="more" title="${L('Toutes les recettes sont dans la fiche du cœur')}">+${open.length - 1}</span>` : '';
    return `<b>${L`Stade ${G.stage + 1} · ${want.name}`}</b><div class="wanted">${boxOf(next.item) ? `<span class="crate">${gene}</span>` : gene}<output>${next.fed} / ${next.count}</output>${more}</div>`;
  }
  const done = want.rate ? `${mealRate().toFixed(1).replace('.', DEC)} / ${want.rate}` : `${G.fed} / ${want.count}`;
  const unit = [boxOf(want.item) ? L`${BOX[boxOf(want.item)].name.toLowerCase()} de ${fill(boxOf(want.item))}` : '', want.rate ? L`gènes/s, tenus ${Math.floor(G.held)} sur ${want.hold} s` : ''].filter(Boolean).join(' · ');
  const gene = geneMark(contentOf(want.item)), asked = boxOf(want.item) ? `<span class="crate">${gene}</span>` : gene;
  return `<b>${L`Stade ${G.stage + 1} · ${want.name}`}</b><div class="wanted">${asked}<output>${done}</output></div>${unit ? `<span class="unit">${unit}</span>` : ''}`;
}
function stockOf(gene) {
  let n = 0;
  for (const c of allCells()) {
    if (isGun(c)) n += c.ammo[gene] || 0;
    if (hasTrait(c.type, 'reserve')) for (const item of c.stock) { if (item === gene) n++; else if (item === `A:${gene}`) n += PACK.size; }
  }
  return n;
}
function refresh() {
  forgetCells();
  const jobs = sites().length;
  $('works').hidden = !jobs || G.over;
  $('works').textContent = L`${jobs} chantier${jobs > 1 ? 's' : ''}${paused ? L(' en pause') : ''}`;
  $('dna').textContent = L`${G.dna} ADN`;
  for (const [type, stage] of Object.entries(NEEDS)) {
    const b = $('tools').querySelector(`[data-type="${type}"]`);
    if (!b) continue;
    const shut = !unlocked(stage);
    b.classList.toggle('locked', shut);
    if (ui.locked.get(type) && !shut) replay(b, 'unlocked');
    ui.locked.set(type, shut);
    b.querySelector('.lock').hidden = !shut;
    const tag = b.querySelector('.price:not(.lock)');
    if (tag) tag.hidden = shut;
  }
  for (const type of Object.keys(PRICE)) {
    const tag = $('tools').querySelector(`[data-type="${type}"] .price:not(.lock)`), cost = price(type);
    if (tag) { tag.textContent = cost; tag.classList.toggle('short', cost > G.dna); }
  }
  const copy = selected && G.cells[selected]?.seen && [...$('actions').querySelectorAll('button')].find(b => b.disabled);
  if (copy) copy.disabled = false;
  if (selected && G.cells[selected]) {
    const c = G.cells[selected], hurt = c.hp < fullHp(c) - .5;
    const state = hurt ? L` ${Math.floor(c.hp)} PV sur ${fullHp(c)}, ${healing(c) ? L('en réparation') : L`réparation dans ${Math.ceil(REPAIR.quiet - (G.time - c.hitAt))} s sans coup`}.` : '';
    write($('message'), diagnose(c) + state);
  }
  else if (selected) { selected = null; chain = []; showActions(); }
  else if (pickedWorm()) write($('message'), wormState(pickedWorm()));
  else write($('message'), note);
  $('pause').textContent = paused ? '▶' : 'II';
  $('pause').setAttribute('aria-label', paused ? L('Reprendre') : L('Mettre en pause'));
  const lost = Object.values(G.ruins).filter(w => !buried(w)).length;
  const torn = pumps().filter(c => c.to && c.veinHp < VEIN.hp / 2).length + G.wires.filter(w => !w.hp).length;
  $('rebuild').hidden = !(lost + torn) || G.over;
  if (lost + torn) {
    const bill = {}, count = {};
    for (const [id, w] of Object.entries(G.ruins)) {
      if (buried(w) || (!PRICE[w.type] && !rankCost(w.type, w.mk))) continue;
      let worth = rankCost(w.type, w.mk);
      if (PRICE[w.type]) {
        const scale = GUNS[w.type] ? 'turret' : w.type;
        count[scale] ??= owned(w.type);
        worth += PRICE[w.type](count[scale]++);
      }
      bill.total = (bill.total || 0) + Math.ceil(worth / 2);
    }
    $('rebuild').textContent = L`Reconstruire (${lost + torn})${bill.total ? L` · ${bill.total} ADN` : ''}`;
  }
  $('over').hidden = !G.over;
  paintHud();
}
// Démonter takes what is on top first: worm, building, then trail.
function wipe(x,y) {
  const id = tileKey(x,y), w = G.worms.find(o => o.path.includes(id));
  if (w) return scrap(w, () => dropWorm(w, true));
  const top = cellAt(x,y) || ruinAt(x,y);
  if (top) return scrap(top, () => remove(top.x,top.y));
  if (G.tracks[id]) scrap(G.tracks[id], () => { delete G.tracks[id]; });
}
const handRank = {};
const inHand = type => RANKS[type] && rankOpen(handRank[type] || 1) ? handRank[type] || 1 : 1;
const costInHand = type => price(type) + rankCost(type, inHand(type));
// Put down at the rank in hand. Whoever calls has checked the price.
function buildRanked(type, x, y, dir) {
  const c = build(type, x, y, dir), mk = inHand(type);
  if (mk > 1) { c.mk = mk; G.dna -= rankCost(type, mk); }
  return c;
}
function place(x,y) {
  const id = key(x,y), old = cellAt(x,y);
  if (linking) {
    const from = G.cells[linking];
    linking = null;
    joinVein(from,x,y);
    return;
  }
  // A listener choosing its source: something on its own network, or itself for the whole network.
  if (listening) {
    const ear = G.cells[listening];
    listening = null;
    if (!ear) return;
    select(key(ear.x, ear.y));
    if (old === ear) { delete ear.source; ear.passed = 0; sense(); showActions(); return say(L('Il écoute maintenant tout le réseau.')); }
    if (!isSource(old) || NET.get(key(old.x, old.y)) !== netOf(ear)) return refuse(L('Il faut toucher une arme, un radar, le cœur, un kyste ou un pupitre relié au même réseau.'));
    ear.source = key(old.x, old.y); ear.passed = 0; sense(); showActions();
    const note = (old.type === 'cyst' || old.type === 'vault') && ear.type !== 'gate' ? L(' Un kyste ne donne pas de gène : seul un feu s’en sert, pour son niveau.') : '';
    return say(L`Il écoute maintenant ${sourceName(ear, old)}.${note}`);
  }
  if (wiring || tool === 'wire') {
    const from = wiring && G.cells[wiring];
    if (from && old === from) { wiring = null; return say(TYPES.wire.help); }
    if (from) {
      wiring = null;
      if (!old) return refuse(L('Un nerf finit sur une tourelle, un feu ou un trieur.'));
      if (wireUp(from, old)) { const message = note; select(id); say(message); }
      return;
    }
    wiring = null;
    if (!NERVE.ends.includes(old?.type)) return say(TYPES.wire.help);
    select(null); wiring = id;
    return say(L('Touche maintenant l’élément à relier.'));
  }
  // A gate on a nerve is not a switch any more.
  if (old?.type === 'gate' && tool !== 'erase' && G.wires.some(w => w.a === id || w.b === id)) return select(id);
  if (old?.type === 'gate' && tool !== 'erase') { old.open = !old.open; select(id); return; }
  const worm = G.worms.find(w => w.path.includes(tileKey(x, y)));
  if (worm && (tool === 'hand' || tool === 'worm')) return selectWorm(worm);
  if (tool === 'worm') return incubate(x,y);
  if (tool === 'track') {
    if (!placeable(x,y)) return refuse(`${whyNot(x,y)}.`);
    const t = trackAt(x, y);
    if (t) { t.dir = (t.dir + 1) % 4; setHeading(t.dir); } else layTrack(x,y,heading);
    return say(TYPES.track.help);
  }
  if (tool === 'hand') {
    if (old) return select(key(old.x,old.y));
    select(null); say(TYPES.hand.help);
    if (trackAt(x, y)) return say(trackAfter(tileKey(x, y)) || !built(trackAt(x, y)) ? L('Piste de phéromones. Pose une poche contre elle, ou un ver dessus.') : L('Fin de piste : les vers s’arrêtent ici. Referme la boucle.'));
    if (!known(x,y)) return say(L('Zone inconnue. Construis dans sa direction : tes structures y verront.'));
    const b = breachesIn(x,y,x,y).find(h => h.state !== 'spent' && known(h.x,h.y) && Math.hypot(h.x - x, h.y - y) < 3);
    if (!b) return;
    say(L`Brèche au ${bearing(b)}, niveau ${levelOf(b)} sur 5 : ${b.left} créatures, gène faible ${b.genes.join(' et ')}, antidote ${b.genes.map(opposite).join(' et ')}. ${b.state === 'sleep' ? L('Elle dort tant que rien n’est bâti dans son cercle.') : L('Elle est réveillée. Vide-la pour qu’elle disparaisse.')}`);
    if (b.state === 'sleep') button(L('Réveiller'), () => { wake(b); $('actions').replaceChildren(); });
    return;
  }
  if (tool === 'erase') return wipe(x,y);
  if (old) {
    if (old.type === tool && hasTrait(tool, 'retap')) { old.dir = (old.dir + 1) % 4; setHeading(old.dir); }
    // A bridge may replace a belt, to make a crossing on an existing line.
    else if (old.type === 'belt' && hasTrait(tool, 'onBelt')) { dropRise(old); G.dna += refund(old); build(tool,x,y,old.dir); }
    select(key(old.x,old.y));
    return;
  }
  if (isBig(tool)) {
    const site = siteFor(tool,x,y);
    if (site.why) return refuse(`${site.why}.`);
    const due = costInHand(tool);
    if (due > G.dna) return refuse(L`Il manque ${due - G.dna} ADN pour ce rang.`);
    buildRanked(tool,site.x,site.y,heading); select(key(site.x,site.y)); return say(TYPES[tool].help);
  }
  if (!placeable(x,y)) return refuse(`${whyNot(x,y)}.`);
  const cost = costInHand(tool);
  if (cost > G.dna) return refuse(L`Il manque ${cost - G.dna} ADN. Envoie des gènes au cœur, 1 ADN chacun, ou vide une brèche.`);
  if (tool === 'mine' && !depositAt(x,y)) return refuse(L('Un récolteur se pose sur un gisement coloré.'));
  G.dna -= price(tool);
  buildRanked(tool,x,y,heading); select(id); say(TYPES[tool].help + (cost ? L` Payé ${cost} ADN.` : ''));
}

let drag = null, linking = null, listening = null;
function screenPoint(event) {
  const r = canvas.getBoundingClientRect();
  return {x:event.clientX - r.left, y:event.clientY - r.top};
}
function joinVein(from,x,y) {
  if (from?.type !== 'pump') return;
  let to = cellAt(x,y);
  if (!to) {
    if (!placeable(x,y)) return refuse(`${whyNot(x,y)}.`);
    if (Math.hypot(x - from.x,y - from.y) > VEIN.reach) return link(from,{x,y,type:'pump'});
    to = build('pump',x,y,0);
  }
  const linked = link(from,to), message = note;
  if (linked) { select(key(x,y)); say(message); }
}
function position(p) {
  const w = worldAt(p.x, p.y);
  return {x:Math.floor(w.x), y:Math.floor(w.y)};
}
// Drawn across a belt going the other way, the line crosses it on a bridge: both flows keep their way,
// what rode the belt goes on in its lane, and a rank paid on it comes back.
function bridgeOver(c, dir) {
  const axis = c.dir % 2, item = c.item ? {item:c.item, dir:c.dir, t:c.t} : null;
  dropRise(c);
  G.dna += refund(c);
  const b = build('bridge', c.x, c.y, c.dir);
  b.ways = [null, null];
  b.ways[axis] = c.dir;
  b.ways[dir % 2] = dir;
  if (item) b.lanes[axis] = item;
  return b;
}
// Belts, trails and dismantling are drawn first: the line is only a path, shown as a ghost, built when let go.
// A line runs straight. It turns only once the pointer is TURN cells off its way, the corner level with the pointer:
// a diagonal gives one L, never stairs. A turn really taken is kept and the next leg starts at its corner;
// back on the line before a corner, that turn is taken up again. drag.flip lays the L the other leg first (R).
const TURN = 2;
function stretch(to) {
  if (!drag?.path) return extend(to);
  drag.to = to;
  const path = drag.path, legs = drag.legs ||= [{start:0, axis:null}];
  while (legs.length > 1) {
    const corner = path[legs.at(-1).start], before = legs.at(-2).axis;
    if ((before === 'x' ? to.y - corner.y : to.x - corner.x) !== 0) break;
    const gone = legs.pop();
    legs.at(-1).axis = gone.was; drag.flip = false;
  }
  const leg = legs.at(-1), a = path[leg.start], step = tool === 'track' ? trackSize() : 1;
  const dx = Math.trunc((to.x - a.x) / step), dy = Math.trunc((to.y - a.y) / step);
  if (leg.axis == null && (dx || dy)) leg.axis = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y';
  const axis = leg.axis || 'x', other = axis === 'x' ? 'y' : 'x';
  const along = axis === 'x' ? dx : dy, across = axis === 'x' ? dy : dx;
  // Close to where the leg starts a one-cell step turns, so a tight corner can be closed; farther, a wavering hand
  // stays straight until TURN cells off.
  const turns = Math.abs(across) >= (Math.abs(along) <= 1 ? 1 : TURN), flip = turns && drag.flip;
  const runs = !turns ? [[axis, along]] : flip ? [[other, across], [axis, along]] : [[axis, along], [other, across]];
  const was = path.map(c => key(c.x, c.y)).join(';');
  path.length = leg.start + 1;
  let last = a, corner = -1;
  runs.forEach(([ax, n], i) => {
    const dir = ax === 'x' ? (n > 0 ? 1 : 3) : (n > 0 ? 2 : 0);
    for (let k = 0; k < Math.abs(n); k++) {
      const next = {x:last.x + DX[dir] * step, y:last.y + DY[dir] * step, dir};
      if (!inside(next.x, next.y)) break;
      path.push(next); last = next;
    }
    if (i === 0 && runs.length > 1) corner = path.length - 1;
  });
  // A real turn: the pointer goes on two more cells across while it no longer moves along. Moving both ways at
  // once is a diagonal, and the L stays live.
  if (!turns || flip) drag.turn = null;
  else if (!drag.turn || Math.abs(along - drag.turn.along) > 1) drag.turn = {along, across};
  else if (Math.abs(across) >= Math.abs(drag.turn.across) + 2 && corner > leg.start && path.length - 1 > corner) {
    legs.push({start:corner, axis:runs[1][0], was:leg.axis, flipped:flip});
    leg.axis = runs[0][0]; drag.flip = false; drag.turn = null;
  }
  if (path.map(c => key(c.x, c.y)).join(';') !== was) sayPath();
  // The piece in hand turns with the line: it points the way the line now runs, and the next one starts so.
  const way = path.at(-1).dir;
  if (tool !== 'erase' && way != null && way !== heading) setHeading(way);
}
// R while drawing: the last L laid the other leg first, its two ends kept.
function flipCorner() {
  if (!drag?.path || tool === 'erase') return false;
  const legs = drag.legs ||= [{start:0, axis:null}];
  if (legs.length > 1) { const gone = legs.pop(); legs.at(-1).axis = gone.was; drag.flip = !gone.flipped; }
  else drag.flip = !drag.flip;
  stretch(drag.to || drag.path.at(-1));
  playSound('rotate');
  return true;
}
const freshOn = p => tool === 'track' ? !trackAt(p.x, p.y) : !cellAt(p.x, p.y);
function sayPath() {
  const path = drag.path;
  if (tool === 'erase') { say(L`Démontage : ${path.length} cases. Lâche pour démonter, Échap pour annuler.`); return; }
  const fresh = path.filter(freshOn).length;
  say(L`Tracé : ${fresh} cases, ${fresh * costInHand(tool)} ADN. Lâche pour construire, Échap pour annuler.`);
}
// A belt met and left straight on the other side is crossed: that one gets a bridge.
const crossing = (path, i) => i > 0 && path[i + 1]?.dir === path[i].dir && cellAt(path[i].x, path[i].y)?.type === 'belt' && cellAt(path[i].x, path[i].y).dir % 2 !== path[i].dir % 2;
function commitPath() {
  const path = drag.path, cross = new Set(path.filter((p, i) => crossing(path, i)).map(p => key(p.x, p.y))), s = path[0];
  drag = {x:s.x, y:s.y, moved:false, existing:Boolean(cellAt(s.x, s.y)), cross};
  if (tool === 'erase') wipe(s.x, s.y);
  for (const p of path.slice(1)) { if (!drag) break; extend(p); }
  drag = null;
}
function drawPath(g) {
  const path = drag.path, erase = tool === 'erase';
  let spent = 0;
  path.forEach((p, i) => {
    const fresh = !erase && freshOn(p), over = !erase && tool === 'belt' && crossing(path, i);
    if (fresh) spent += costInHand(tool);
    const color = erase ? PREVIEW.scrap : fresh && spent > G.dna ? PREVIEW.no : over ? PREVIEW.turn : PREVIEW.build;
    const side = tool === 'track' ? trackSize() : 1;
    g.beginPath(); g.rect(p.x + .04, p.y + .04, side - .08, side - .08);
    g.fillStyle = color + '33'; g.fill(); g.strokeStyle = color + 'CC'; g.lineWidth = 1.5 / cam.zoom; g.stroke();
    if (fresh || over) { g.save(); g.globalAlpha = .75; g.translate(p.x + side / 2, p.y + side / 2); arrow(g, path[i + 1]?.dir ?? p.dir ?? 0, .4, color); g.restore(); }
  });
}
function extend(to) {
  if (drag?.vein || drag?.nerve) { drag.aim = to; return; }
  while (drag && (drag.x !== to.x || drag.y !== to.y)) {
    const horizontal = Math.abs(to.x-drag.x) >= Math.abs(to.y-drag.y);
    const dir = horizontal ? (to.x > drag.x ? 1 : 3) : (to.y > drag.y ? 2 : 0), step = tool === 'track' ? trackSize() : 1;
    const x = drag.x + DX[dir] * step, y = drag.y + DY[dir] * step;
    if (!inside(x,y)) return;
    if (tool === 'erase') { wipe(x,y); drag.x = x; drag.y = y; drag.moved = true; continue; }
    if (tool === 'track') {
      const clear = (tx, ty) => footprint({x:tx, y:ty, size:step}).every(c => placeable(c.x, c.y) && (step === 1 || !cellAt(c.x, c.y)));
      if (!clear(drag.x,drag.y) || !clear(x,y)) { drag = null; return; }
      const here = trackAt(drag.x,drag.y), joins = trackAt(x,y);
      if (drag.moved && drag.onTrack && here && here.dir !== dir) { refuse(L('La piste rejoint la ligne existante. Une case n’a qu’une sortie.')); drag = null; return; }
      layTrack(drag.x,drag.y,dir);
      if (drag.start && x === drag.start.x && y === drag.start.y) { say(L('Boucle fermée. Pose des poches contre elle, puis un ver dessus.')); drag = null; return; }
      if (!joins) layTrack(x,y,dir);
      drag = {x, y, moved:true, onTrack:Boolean(joins), start:drag.start || {x:drag.x, y:drag.y}};
      continue;
    }
    if (tool !== 'belt') { drag = null; return; }
    const from = cellAt(drag.x,drag.y);
    // Still inside a big one: the line starts at the face it leaves by.
    if (from && sizeOf(from) > 1 && from === cellAt(x,y)) { drag = {...drag, x, y}; continue; }
    // Drawn over again, a belt on its way out stays.
    for (const c of [from, cellAt(x,y)]) if (isBelt(c)) keepIt(c);
    if (from && !isBelt(from) && from.type !== 'bridge' && drag.moved) { drag = null; return; }
    if (from && drag.existing && drag.moved && isBelt(from) && from.dir !== dir) {
      refuse(L('Ce tapis existe déjà : la ligne s’y raccorde. Pour le traverser, pose un pont.'));
      drag = null; return;
    }
    const short = cells => {
      const due = rankCost('belt', inHand('belt')) * cells;
      if (due <= G.dna) return false;
      refuse(L`Il manque ${due - G.dna} ADN pour continuer en MK${inHand('belt')}.`);
      drag = null;
      return true;
    };
    if (!from) {
      if (!placeable(drag.x,drag.y)) { drag = null; return; }
      if (short(1)) return;
      buildRanked('belt',drag.x,drag.y,dir);
    } else if (isBelt(from) || (!drag.moved && ['mine','cyst'].includes(from.type))) from.dir = dir;
    let next = cellAt(x,y);
    // A bridge only where the line goes on across; ending or turning on the belt joins it.
    if (next?.type === 'belt' && next.dir % 2 !== dir % 2 && (!drag.cross || drag.cross.has(key(x,y)))) next = bridgeOver(next, dir);
    // A belt drawn through a bridge takes that lane with it.
    for (const c of [from, next]) if (c?.type === 'bridge' && c.ways?.[dir % 2] != null) c.ways[dir % 2] = dir;
    if (!next) { if (!placeable(x,y)) { refuse(`${whyNot(x,y)}.`); drag = null; return; } if (short(1)) return; buildRanked('belt',x,y,dir); }
    drag = {x, y, moved:true, existing:Boolean(next), heading:dir, cross:drag.cross};
    if (next && !isBelt(next) && next.type !== 'bridge') { drag = null; return; }
  }
}
// What a tap here would do, without doing it. It follows place(): a test holds the two together.
let hovered = null;
function preview() {
  if (G.over || gesture?.mode === 'pan' || gesture?.mode === 'pinch') return null;
  const point = gesture ? gesture.now : hovered;
  if (!point) return null;
  const drawing = gesture?.mode === 'draw';
  const {x, y} = view3d && !drawing ? view3d.pick(point) : position(point);
  if (!inside(x, y)) return null;
  const id = key(x, y), old = cellAt(x, y);
  // A big one answers as a whole, from its corner.
  const whole = old || (tool === 'erase' ? ruinAt(x, y) : null), over = whole && sizeOf(whole) > 1 ? {x:whole.x, y:whole.y, size:sizeOf(whole)} : {};
  const to = (act, more) => ({x, y, act, ...over, ...more}), no = (why, more) => to('no', {why, ...more});
  const hive = whyNot(x, y), free = () => !hive;
  const fromVein = (drawing && drag?.vein) || (linking && G.cells[linking]);
  if (fromVein) {
    if (old && (old.type !== 'pump' || (old.x === fromVein.x && old.y === fromVein.y))) return no(L('Finit sur une pompe'), {from:fromVein});
    if (!old && !free()) return no(hive, {from:fromVein});
    const ghost = old ? {} : {type:'pump', dir:0};
    return span(fromVein, {x, y}) > VEIN.reach ? no(L`Trop loin : ${VEIN.reach} cases au plus`, {from:fromVein, ...ghost}) : to('link', {from:fromVein, ...ghost});
  }
  const fromWire = (drawing && drag?.nerve) || (wiring && G.cells[wiring]);
  if (fromWire) {
    if (x === fromWire.x && y === fromWire.y) return to('select');
    if (!NERVE.ends.includes(old?.type)) return no(L('Tourelle, feu ou trieur'), {from:fromWire});
    if (span(fromWire, old) > NERVE.reach) return no(L`Trop loin : ${NERVE.reach} cases au plus`, {from:fromWire});
    const a = key(fromWire.x, fromWire.y);
    if (G.wires.some(w => (w.a === a && w.b === id) || (w.a === id && w.b === a))) return no(L('Déjà reliés'), {from:fromWire});
    return to('link', {from:fromWire});
  }
  if (tool === 'wire') return NERVE.ends.includes(old?.type) ? to('link') : no(L('Tourelle, feu ou trieur'));
  const worm = G.worms.find(w => w.path.includes(tileKey(x, y)));
  if (tool === 'erase') {
    const ruin = ruinAt(x, y), track = trackAt(x, y), top = worm || old || ruin || track;
    if (!top) return to('none');
    if (top.type === 'core') return no(L('Le cœur ne se démonte pas'));
    if (top.out != null) return to('none', {label:L('Déjà dans la file')});
    const name = worm ? 'ver' : old ? TYPES[old.type].name.toLowerCase() : ruin ? L('débris') : 'piste';
    const back = !worm && old ? refund(old) : 0;
    return to('scrap', {worm, label:L`Démonter : ${name}${back ? L` · +${back} ADN` : ''}`});
  }
  if (old?.type === 'gate') return G.wires.some(w => w.a === id || w.b === id) ? to('select', {label:L('Feu intelligent')}) : to('use', {label:old.open ? L('Passer au rouge') : L('Passer au vert')});
  if (worm && (tool === 'hand' || tool === 'worm')) return to('select', {worm, label:L('Ver')});
  if (tool === 'worm') {
    const cost = price('worm'), ghost = {type:'worm', cost};
    if (!trackAt(x, y)) return no(L('Sur une piste seulement'), ghost);
    if (worm) return no(L('Case occupée'), ghost);
    return cost > G.dna ? no(L`Il manque ${cost - G.dna} ADN`, ghost) : to('build', ghost);
  }
  if (tool === 'track') {
    if (!free()) return no(hive);
    const track = trackAt(x, y), tile = trackSize() > 1 ? {...tileAt(x, y), size:2} : {};
    if (!track) return to('build', {type:'track', dir:heading, ...tile});
    return drawing ? to('select') : to('turn', {type:'track', dir:track.dir, label:L('Tourner')});
  }
  if (tool === 'hand') {
    if (old) return to('select', {label:old.type === 'core' ? L('Cœur') : TYPES[old.type].name});
    if (trackAt(x, y)) return to('select', {label:L('Piste')});
    if (!known(x, y)) return to('none', {label:L('Zone inconnue')});
    const b = breachesIn(x, y, x, y).find(h => h.state !== 'spent' && known(h.x, h.y) && Math.hypot(h.x - x, h.y - y) < 3);
    if (b) return to('select', {label:L`Brèche niveau ${levelOf(b)} : ${b.left} créatures`});
    const base = depositAt(x, y);
    return to('none', base ? {label:L`Gisement : ${named(base)} ×${richAt(x, y)}`} : {});
  }
  if (old) {
    if (drawing) return to('select');
    // The ghost shows the way it faces now; a tap turns it.
    if (old.type === tool && hasTrait(tool, 'retap')) return to('turn', {type:tool, dir:old.dir, label:L('Tourner')});
    if (old.type === 'belt' && hasTrait(tool, 'onBelt')) return to('build', {type:tool, dir:old.dir});
    return to('select', {label:old.type === 'core' ? L('Cœur') : TYPES[old.type].name});
  }
  const cost = costInHand(tool), ghost = {type:tool, mk:inHand(tool), dir:drawing && drag?.heading != null ? drag.heading : heading, cost};
  if (isBig(tool)) {
    const site = siteFor(tool, x, y), big = {...ghost, x:site.x, y:site.y, size:2};
    if (site.why) return no(site.why, big);
    return cost > G.dna ? no(L`Il manque ${cost - G.dna} ADN`, big) : to('build', big);
  }
  if (!free()) return no(hive, ghost);
  if (cost > G.dna) return no(L`Il manque ${cost - G.dna} ADN`, ghost);
  if (tool === 'mine' && !depositAt(x, y)) return no(L('Sur un gisement seulement'), ghost);
  return to('build', ghost);
}
const PREVIEW = {no:'#FF6B6B', scrap:'#FF6B6B', build:'#55D6E8', link:'#55D6E8', turn:'#F0A03C', use:'#F0A03C', select:'#B7F34A', none:'#D5FAFF'};
// Both views use it: their canvas is in map units, squashed or not. It stays on the plane where things get built.
function drawPreview(g, models) {
  const flipping = Boolean(drag?.path && tool !== 'erase' && drag.path.length > 2);
  if ($('flip-corner').hidden === flipping) $('flip-corner').hidden = !flipping;
  if (drag?.path && gesture?.mode === 'draw') { drawPath(g); drawPorts(g, null); return; }
  const p = preview();
  if (!p) { drawPorts(g, null); return; }
  const {x, y, act} = p, color = PREVIEW[act], size = p.size || (p.type && isBig(p.type) ? 2 : 1), mx = x + size / 2, my = y + size / 2;
  const at = `${x},${y},${act},${p.type},${size}`, now = performance.now();
  if (at !== drawPreview.at) {
    drawPreview.at = at; drawPreview.since = now;
    if (p.type !== drawPreview.type) { drawPreview.type = p.type; drawPreview.held = now; }
  }
  const age = STILL.matches ? 9 : (now - drawPreview.since) / 1000, held = STILL.matches ? 9 : (now - drawPreview.held) / 1000;
  if (age < .3) { g.globalAlpha = 1 - age / .3; rect(g, x - age, y - age, size + age * 2, size + age * 2, null, color); g.globalAlpha = 1; }
  if (p.type && act === 'build' && age < 9) { g.globalAlpha = .4; rect(g, x + .04, y + (age * .9 % 1) * (size - .06), size - .08, .06, color); g.globalAlpha = 1; }
  if (p.type && !models) {
    g.save(); g.globalAlpha = .55; g.translate(mx, my); g.scale(size, size);
    if (p.type === 'worm') circle(g, 0, 0, .42, '#2A4A22', '#C9F77A', .07);
    else if (p.type === 'track') arrow(g, p.dir, .46, '#B7F34A');
    else drawCell(g, {...cell(p.type, x, y, p.dir), mk:p.mk});
    g.restore();
  }
  if (p.from) {
    g.beginPath(); g.moveTo(p.from.x + .5, p.from.y + .5); g.lineTo(x + .5, y + .5);
    g.strokeStyle = color + 'AA'; g.lineWidth = .1; g.setLineDash([.3, .25]); g.stroke(); g.setLineDash([]);
  }
  const cells = p.worm ? p.worm.path.map(id => id.split(',').map(Number)) : [[x, y]];
  for (const [cx, cy] of cells) {
    const wideAs = p.worm ? 1 : size;
    g.beginPath(); g.rect(cx + .02, cy + .02, wideAs - .04, wideAs - .04);
    g.fillStyle = color + (act === 'none' ? '18' : '2A'); g.fill();
    g.strokeStyle = color + (act === 'none' ? '55' : 'DD'); g.lineWidth = 1.5 / cam.zoom; g.stroke();
  }
  // The way out, where it matters.
  // How far it would reach, before paying for it.
  if (GUNS[p.type]) {
    g.setLineDash([.4, .3]); circle(g, x + .5, y + .5, reachOf(p.type) * Math.max(.08, 1 - (1 - Math.min(1, held / .42)) ** 3), null, color + '99', 1.5 / cam.zoom); g.setLineDash([]);
  }
  const reach = drawPorts(g, p);
  if (act === 'no' || act === 'scrap') {
    const r = size * .2; g.beginPath(); g.moveTo(mx - r, my - r); g.lineTo(mx + r, my + r); g.moveTo(mx + r, my - r); g.lineTo(mx - r, my + r);
    g.strokeStyle = color; g.lineWidth = 2 / cam.zoom; g.stroke();
  }
  const touched = gesture && !hovered, keys = act === 'build' && !touched && !NARROW.matches;
  const piece = keys && p.type ? [TYPES[p.type]?.name + (p.mk > 1 ? ` MK${p.mk}` : ''), p.cost ? L`${p.cost} ADN` : '', p.dir != null && hasTrait(p.type, 'turn') ? L('R tourner') : '', L('Échap lâcher')].filter(Boolean).join(' · ') : '';
  const text = p.why || p.label || piece || (p.cost ? L`${p.cost} ADN` : '');
  if (!text) return;
  // The words keep one size at every zoom, and stay on the board.
  g.save(); g.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
  g.font = '600 13px Barlow, Verdana';
  const wide = sentenceWidth(g, text) + 12, squash = cam.zoom * flat();
  const left = Math.max(4, Math.min(view.w - wide - 4, view.w / 2 + (mx - cam.x) * cam.zoom - wide / 2));
  let top = view.h / 2 + (y + size - cam.y) * squash + 14 + reach;
  // Under a finger nobody reads: the words go above it.
  if (touched) top = view.h / 2 + (y - cam.y) * squash - 64;
  else if (top > view.h - ui.safe.bottom - 24) top -= squash * size + 48;
  if (act === 'no' && age < .35) g.translate(Math.sin(age * 55) * 5 * (1 - age / .35), 0);
  g.fillStyle = '#05090BE6'; g.fillRect(left, top, wide, 20);
  g.fillStyle = act === 'none' ? '#E6F0EC' : color; g.textAlign = 'left'; g.textBaseline = 'middle';
  drawSentence(g, text, left + 6, top + 10);
  g.restore();
}
// The ways in and out of one object, as the transport reads them. dir is the side of the cell, label what it wants there.
function portsOf(c) {
  const out = (dir, more) => ({x:c.x, y:c.y, dir, out:true, ...more}), into = (dir, more) => ({x:c.x, y:c.y, dir, out:false, ...more});
  const round = [0, 1, 2, 3], back = (c.dir + 2) % 4;
  switch (c.type) {
    case 'belt': case 'gate': case 'mine': return [out(c.dir)];
    case 'cyst': return [out(c.dir), ...round.filter(d => d !== c.dir).map(d => into(d))];
    case 'vault': return edgesOf(c).map(d => ({...d, out:d.dir === c.dir}));
    case 'borer': return edgesOf(c).map(d => ({...d, out:true}));
    case 'ligase': return [out(c.dir), ...[0, 1, 2].map(port => into(portSide(c, port), {label:String(port + 1)}))];
    case 'join': return [out(c.dir), ...[0, 1].map(port => into(joinSide(c, port), {label:String(port + 1)}))];
    case 'pack': return [out(c.dir), into(back, {label:L('gènes')}), into(carbonSide(c), {label:L('carbone K')})];
    case 'split2': case 'split': return [into(back), ...splitExits(c).map(d => out(d))];
    case 'sort': return [into(back), out(c.dir, {label:'reste'}), out(sideExit(c), {label:c.want && c.want !== '?' ? c.want : 'filtre'})];
    case 'bridge': return [0, 1].flatMap(axis => {
      const way = wayOf(c, axis);
      // Grey while guessed from the neighbours, green once set.
      return way == null ? [] : [into((way + 2) % 4), out(way, {guessed:c.ways?.[axis] == null})];
    });
    case 'pump': return round.filter(d => !c.to || ahead(c, d)?.type !== 'pump').map(d => c.to ? into(d) : out(d));
    case 'pocket': return round.filter(d => !trackAt(c.x + DX[d], c.y + DY[d])).map(d => c.unload ? out(d) : into(d));
    case 'track': return [out(c.dir)];
    case 'unpack': return [into(back, {label:L('caisses')}), out(c.dir), out((c.dir + 1) % 4, {label:L('carbone K')})];
    case 'flip': case 'arm': return [into(back), out(c.dir)];
    case 'unbind': return [into(back), out(outSide(c, 0)), out(c.dir), out(outSide(c, 2))];
    case 'unjoin': return [into(back), out(outSide(c, 0)), out(outSide(c, 2))];
    case 'reaper': return [out(c.dir)];
    case 'core': if (sizeOf(c) > 1) return edgesOf(c).map(d => ({...d, out:false})); return round.map(d => into(d));
    case 'turret': case 'sting': case 'maw': case 'mist': case 'harpoon': case 'glue': return round.map(d => into(d));
  }
  return [];
}
// One size on screen at any zoom: nobody should zoom in to know where it comes out.
function drawPorts(g, p) {
  const shown = [], picked = tool === 'hand' && selected ? G.cells[selected] : null;
  if (p?.type && p.act !== 'link') shown.push(cell(p.type, p.x, p.y, p.dir ?? 0));
  else if (p && p.act !== 'scrap') {
    const under = cellAt(p.x, p.y) || (p.worm ? null : trackAt(p.x, p.y) && {...trackAt(p.x, p.y), type:'track', x:p.x, y:p.y});
    if (under) shown.push(under);
  }
  if (picked && !shown.some(c => c.x === picked.x && c.y === picked.y)) shown.push(picked);
  const ports = shown.flatMap(portsOf);
  if (!ports.length) return 0;
  const tilt = flat(), tags = [];
  g.save();
  g.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
  g.lineJoin = 'round';
  for (const port of ports) {
    const dx = DX[port.dir], dy = DY[port.dir], wide = Math.min(9, Math.max(6, cam.zoom * .45));
    const ex = view.w / 2 + (port.x + .5 + dx * .5 - cam.x) * cam.zoom, ey = view.h / 2 + (port.y + .5 + dy * .5 - cam.y) * cam.zoom * tilt;
    // Out: a solid arrow leaving the edge. In: a cyan head resting on it.
    const tip = port.out ? 24 : 1, tail = port.out ? 2 : 15, head = port.out ? 12 : 14;
    const point = (along, side) => [ex + dx * along - dy * side, ey + dy * along + dx * side];
    const shape = port.out
      ? [point(tip, 0), point(tip - head, wide), point(tip - head, wide * .45), point(tail, wide * .45), point(tail, -wide * .45), point(tip - head, -wide * .45), point(tip - head, -wide)]
      : [point(tip, 0), point(tail, wide), point(tail - 3, 0), point(tail, -wide)];
    g.beginPath(); shape.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath();
    g.strokeStyle = '#05090B'; g.lineWidth = 4; g.stroke();
    g.fillStyle = !port.out ? '#66D9EA' : port.guessed ? '#C5D0CD' : '#B7F34A'; g.fill();
    if (port.label) tags.push({...port, at:point(port.out ? 35 : 27, 0), dx, dy});
  }
  g.font = '700 14px Barlow, Verdana'; g.textAlign = 'center'; g.textBaseline = 'middle';
  for (const tag of tags) {
    const said = sentenceWidth(g, tag.label), wide = Math.max(22, said + 12);
    const x = tag.at[0] + tag.dx * (wide / 2 - 11), y = tag.at[1];
    g.beginPath(); g.roundRect(x - wide / 2, y - 11, wide, 22, 11);
    g.fillStyle = '#05090B'; g.fill();
    g.strokeStyle = tag.out ? '#B7F34A' : '#66D9EA'; g.lineWidth = 2; g.stroke();
    g.fillStyle = '#FFFFFF'; drawSentence(g, tag.label, x - said / 2, y + .5);
  }
  g.restore();
  // How far down they reach, for the words that go under the object.
  return Math.max(0, ...ports.filter(port => port.dir === 2).map(port => (port.label ? 46 : 22)));
}
// The pointer carries the tool in hand, struck out where it cannot act.
const CURSORS = new Map();
let cursor = '';
function setCursor() {
  let next = 'grabbing';
  if (gesture?.mode !== 'pan' && gesture?.mode !== 'pinch') {
    const p = hovered && preview(), held = linking ? 'pump' : wiring ? 'wire' : tool, id = held + (p?.act === 'no' ? '-no' : '');
    if (!CURSORS.has(id)) {
      const c = document.createElement('canvas'), g = c.getContext('2d');
      c.width = c.height = 32;
      polygon(g, [[1.5,1.5],[1.5,16],[5.5,12.5],[8.5,18],[11.5,16.5],[9,11.5],[14,11]], '#E6F0EC', '#05090B', 1.5);
      const icon = $('tools').querySelector(`[data-type="${held}"] canvas`);
      circle(g, 22, 22, 9.5, '#091013', p?.act === 'no' ? '#FF6B6B' : held === 'erase' ? '#FF6B6B' : '#55D6E8', 1.5);
      if (icon) g.drawImage(icon, 13.5, 13.5, 17, 17);
      if (p?.act === 'no') { g.beginPath(); g.moveTo(16, 28); g.lineTo(28, 16); g.strokeStyle = '#FF6B6B'; g.lineWidth = 2.5; g.stroke(); }
      CURSORS.set(id, `url(${c.toDataURL()}) 2 2, crosshair`);
    }
    next = CURSORS.get(id);
  }
  if (next !== cursor) { cursor = next; canvas.style.cursor = next; }
}
// One finger pans, except with Tapis and Démonter where it draws. Two fingers always pan and zoom.
const pointers = new Map();
let gesture = null;
canvas.addEventListener('pointerdown', event => {
  if (G.over) return;
  event.preventDefault();
  // Preventing the default also keeps the keyboard out, in a frame R would never arrive.
  window.focus();
  canvas.focus({preventScroll:true});
  try { canvas.setPointerCapture(event.pointerId); } catch (_) {}
  if (event.pointerType === 'touch') hovered = null;
  const p = screenPoint(event);
  pointers.set(event.pointerId,p);
  drag = null;
  if (pointers.size > 1) { gesture = {mode:'pinch'}; return; }
  gesture = {mode:event.button > 0 ? 'pan' : 'tap', start:p, now:p};
  if (event.button === 2) holdToDismantle(event, p);
});
// Held still for 0.6 s, the right button dismantles what is under it: a ring fills, letting go or moving gives up.
const HOLD_MS = 600;
function holdToDismantle(event, p) {
  const ring = $('hold-ring');
  ring.style.left = `${event.clientX}px`; ring.style.top = `${event.clientY}px`;
  ring.hidden = false; ring.classList.remove('filling'); void ring.offsetWidth; ring.classList.add('filling');
  gesture.hold = setTimeout(() => {
    stopHold();
    const at = view3d ? view3d.pick(p) : position(p);
    if (inside(at.x, at.y)) { wipe(at.x, at.y); playNear('dismantle', at); refresh(); }
  }, HOLD_MS);
}
function stopHold() {
  if (gesture?.hold) { clearTimeout(gesture.hold); gesture.hold = null; }
  $('hold-ring').hidden = true; $('hold-ring').classList.remove('filling');
}
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
    if (hasTrait(tool, 'traced')) { drag.path = [tool === 'track' ? {...from, ...tileAt(from.x, from.y)} : {...from}]; sayPath(); }
  }
  if (gesture.mode === 'pan') pan(p.x - last.x,p.y - last.y);
  else if (drag) { const to = position(p); if (inside(to.x,to.y)) stretch(to); }
});
function release(event) {
  if (!pointers.delete(event.pointerId) || pointers.size) return;
  stopHold();
  if (event.type === 'pointerup' && gesture?.mode === 'tap') {
    const p = view3d ? view3d.pick(gesture.start) : position(gesture.start);
    if (inside(p.x,p.y)) { const before = G.dna, count = Object.keys(G.cells).length; place(p.x,p.y); if (G.dna !== before || Object.keys(G.cells).length !== count) playNear(tool === 'erase' ? 'dismantle' : 'place', p); }
  }
  if (event.type === 'pointerup' && drag?.path && gesture?.mode === 'draw') {
    const bridged = tool === 'belt' && drag.path.some((p, i) => crossing(drag.path, i));
    // Heard from where the line ends, where the pointer let go.
    playNear(tool === 'erase' ? 'dismantle' : bridged ? 'bridge' : 'belt', drag.path.at(-1));
    commitPath();
  }
  if (event.type === 'pointerup' && drag?.nerve && gesture?.mode === 'draw') {
    const a = drag.nerve, b = drag.aim;
    if (a.x !== b.x || a.y !== b.y) wireUp(G.cells[key(a.x,a.y)], G.cells[key(b.x,b.y)]);
  }
  if (event.type === 'pointerup' && drag?.vein && gesture?.mode === 'draw') {
    const {vein, aim} = drag;
    if (vein.x !== aim.x || vein.y !== aim.y) {
      // The first pump is only created when the vein can be made.
      if (Math.hypot(aim.x - vein.x,aim.y - vein.y) > VEIN.reach) link({...vein,type:'pump'},{...aim,type:'pump'});
      else if (cellAt(aim.x,aim.y) && cellAt(aim.x,aim.y).type !== 'pump') refuse(L('Termine la veine sur une pompe ou un sol libre, juste à côté du bâtiment.'));
      else joinVein(G.cells[key(vein.x,vein.y)] || build('pump',vein.x,vein.y,0),aim.x,aim.y);
    }
  }
  gesture = null; drag = null; refresh();
}
canvas.addEventListener('pointerup',release);
canvas.addEventListener('pointercancel',release);
canvas.addEventListener('contextmenu', event => event.preventDefault());
canvas.addEventListener('wheel', event => {
  event.preventDefault();
  const p = screenPoint(event);
  zoomAt(Math.exp(-event.deltaY * .0015),p.x,p.y);
}, {passive:false});
// The arrows glide the camera at one speed on screen, whatever the zoom. Shift is faster.
const GLIDE = {ArrowLeft:[-1,0], ArrowRight:[1,0], ArrowUp:[0,-1], ArrowDown:[0,1]};
// ---- Keys the player can change. Named by where they sit (event.code), so W A S D is Z Q S D on a French board.
const KEYS_KEY = 'strainworks-keys';
const ACTIONS = [
  ['up', L('Vue vers le haut'), 'KeyW'],
  ['left', L('Vue vers la gauche'), 'KeyA'],
  ['down', L('Vue vers le bas'), 'KeyS'],
  ['right', L('Vue vers la droite'), 'KeyD'],
  ['pick', L('Pipette : reprendre le bâtiment survolé'), 'KeyQ'],
  ['rotate', L('Tourner, avec Maj dans l’autre sens'), 'KeyR'],
  ['pause', L('Pause et reprise'), 'Space'],
];
const RESERVED = /^(Escape|Tab|Enter|Arrow|Digit|Numpad|Shift|Control|Alt|Meta|F\d)/;
let KEYS = {};
function loadKeys() {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEYS_KEY)) || {}; } catch (_) {}
  KEYS = Object.fromEntries(ACTIONS.map(([id, , code]) => [id, typeof saved[id] === 'string' && !RESERVED.test(saved[id]) ? saved[id] : code]));
}
loadKeys();
const actionOf = event => event.ctrlKey || event.metaKey || event.altKey || event.target.closest?.('input, textarea') ? null : ACTIONS.find(([id]) => KEYS[id] === event.code)?.[0];
const PAN_DIRS = {up:'ArrowUp', left:'ArrowLeft', down:'ArrowDown', right:'ArrowRight'};
// The arrow a key stands for: the arrows themselves, or the four keys of the view.
const dirOf = event => GLIDE[event.key] ? event.key : PAN_DIRS[actionOf(event)];
// What the key shows on this board, where the browser tells. shortcut: without it, a French page guesses AZERTY for the letters that move.
let layout = null;
navigator.keyboard?.getLayoutMap?.().then(map => { layout = map; paintKeys(); }).catch(() => {});
const AZERTY = {KeyW:'Z', KeyA:'Q', KeyQ:'A', KeyZ:'W', Semicolon:'M'};
const keyName = code => code === 'Space' ? L('Espace') : (layout?.get(code) || (LANG === 'fr' && AZERTY[code]) || code.replace(/^(Key|Digit)/, '')).toUpperCase();
let rebinding = null;
function paintKeys() {
  $('keys').innerHTML = ACTIONS.map(([id, name]) => `<dt><button type="button" data-action="${id}" aria-pressed="${rebinding === id}">${rebinding === id ? L('Appuie sur une touche…') : keyName(KEYS[id])}</button></dt><dd>${name}</dd>`).join('');
}
paintKeys();
$('keys').onclick = event => {
  const b = event.target.closest('[data-action]');
  if (!b) return;
  rebinding = rebinding === b.dataset.action ? null : b.dataset.action;
  $('keys-note').textContent = '';
  paintKeys();
};
$('keys-reset').onclick = () => {
  try { localStorage.removeItem(KEYS_KEY); } catch (_) {}
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
  try { localStorage.setItem(KEYS_KEY, JSON.stringify(KEYS)); } catch (_) {}
  rebinding = null; paintKeys();
}, true);
// The eyedropper: the building under the pointer, in hand with its heading and rank.
function pipette() {
  const at = hovered && (view3d ? view3d.pick(hovered) : position(hovered));
  const c = at && inside(at.x, at.y) ? cellAt(at.x, at.y) : null;
  if (!c || !$('tools').querySelector(`[data-type="${c.type}"]`)) { refuse(L('Pipette : survole un bâtiment à reprendre.')); return; }
  if (RANKS[c.type]) handRank[c.type] = rankOf(c);
  choose(c.type);
  if (tool === c.type && hasTrait(c.type, 'turn')) setHeading(c.dir);
}
document.addEventListener('keydown', event => {
  if (actionOf(event) !== 'pick' || event.repeat || modalOpen() || G.over) return;
  event.preventDefault();
  pipette();
});
const arrows = new Set();
let hurried = false;
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
function glide(elapsed) {
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
function followEdge(elapsed) {
  if (gesture?.mode !== 'draw' || !drag) return;
  const p = gesture.now, margin = 28, side = (v,max) => v < margin ? 1 : v > max - margin ? -1 : 0;
  const dx = side(p.x,view.w), dy = side(p.y,view.h);
  if (!dx && !dy) return;
  pan(dx * 280 * elapsed,dy * 280 * elapsed);
  const to = position({x:Math.max(1,Math.min(view.w - 1,p.x)), y:Math.max(1,Math.min(view.h - 1,p.y))});
  if (inside(to.x,to.y)) stretch(to);
}
// The buttons glide to the same place a jump would reach.
const glideBy = jump => {
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
const BABYLON_SRC = 'https://cdn.jsdelivr.net/npm/babylonjs@9.37.1/babylon.js';
const BABYLON_HASH = 'sha384-qYzjOfcTLS9fbKXcTpEu5bNZu++fEsJlkTmKPFSFiV4hEWt+d3Xo4cZGJndCKesO';
const VIEW_KEY = 'strainworks-view';
let made3d = null, switching = false;
function script(src, integrity) {
  return new Promise((resolve, reject) => {
    const tag = document.createElement('script');
    tag.src = src;
    if (integrity) { tag.integrity = integrity; tag.crossOrigin = 'anonymous'; }
    tag.onload = resolve;
    tag.onerror = () => { tag.remove(); reject(new Error(src)); };
    document.head.append(tag);
  });
}
async function show3D(on) {
  if (switching) return;
  switching = true;
  const toggle = $('dimension');
  try {
    if (on && !made3d) {
      showMenu(false); $('loading').hidden = false;
      if (!window.BABYLON) await script(BABYLON_SRC, BABYLON_HASH);
      if (!window.createModels3D) await script('models3d.js');
      if (!window.createTerrain3D) await script('terrain3d.js');
      if (!window.createView3D) await script('view3d.js');
      // Built while visible, or the engine would start on an empty canvas.
      $('gl').hidden = false;
      made3d = window.createView3D($('gl'));
    }
    view3d = on ? made3d : null;
    $('gl').hidden = !on;
    try { localStorage.setItem(VIEW_KEY, on ? '3d' : '2d'); } catch (_) {}
  } catch (error) {
    view3d = null; $('gl').hidden = true;
    tell(L('Vue 3D indisponible : il faut le réseau au premier chargement et WebGL. Le jeu continue en 2D.'));
    console.warn('3D view unavailable:', error.message);
  }
  toggle.setAttribute('aria-pressed', Boolean(view3d));
  markView(Boolean(view3d));
  $('loading').hidden = true;
  showMenu(false);
  replay($('board'), 'switched');
  switching = false;
}
function chooseView(three) {
  if (!orbit.on) return show3D(three);
  // On the planet it is only noted: the engine loads with the game.
  if (!three) view3d = null;
  $('gl').hidden = !view3d;
  try { localStorage.setItem(VIEW_KEY, three ? '3d' : '2d'); } catch (_) {}
  markView(three);
}
// The switch beside the zoom names the view it leads to.
function markView(three) {
  for (const [id, on] of [['dimension', three], ['flat', !three]]) $(id).setAttribute('aria-pressed', on);
  $('view-toggle').textContent = three ? '2D' : '3D';
  $('view-toggle').setAttribute('aria-label', three ? L('Passer en 2D') : L('Passer en 3D'));
}
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
const FAMILIES = [
  ['rec', L('Récolter'), 'mine', ['mine','cyst','borer','vault']],
  ['tra', L('Acheminer'), 'belt', ['belt','bridge','split2','split','pump','track','pocket','worm','arm']],
  ['fab', L('Transformer'), 'ligase', ['ligase','pack','join','unpack','flip','unbind','unjoin','burn','reaper']],
  ['def', L('Défendre'), 'turret', ['turret','sting','maw','wall','glue','mist','harpoon']],
  ['cmd', L('Commander'), 'gate', ['gate','sort','wire','radar','relay','desk','lab','screen']]
];
// Each tray lists what opens first, first; the sort is stable, so equals keep their order.
for (const family of FAMILIES) family[3].sort((x, y) => (NEEDS[x] || 0) - (NEEDS[y] || 0));
const FAMILY_OF = Object.fromEntries(FAMILIES.flatMap(([id,,,types]) => types.map(type => [type, id])));
const TOOLBAR = ['hand', ...FAMILIES.flatMap(f => f[3]), 'erase'];
// The order of the sprite behind --models.
const MODELS = ['belt','mine','ligase','join','pack','turret','sting','maw','wall','cyst','bridge','gate','split2','split','sort','pump','pocket','borer','vault','track','worm','wire','core','drone','radar','relay','unpack','lab','flip','screen','burn','arm','glue','mist','harpoon','unbind','unjoin','reaper','desk'];
function podOf(name) {
  const b = document.createElement('button'), hole = document.createElement('span'), words = document.createElement('span');
  b.className = 'pod'; hole.className = 'porthole'; hole.setAttribute('aria-hidden', 'true');
  words.className = 'name'; words.textContent = name;
  b.append(hole, words);
  return b;
}
function toolPod(type) {
  const info = TYPES[type], b = podOf(info.name), hole = b.querySelector('.porthole');
  const icon = document.createElement('canvas'), g = icon.getContext('2d');
  // The drawn icon is the one the pointer carries.
  icon.width = icon.height = 52; b.dataset.type = type;
  g.setTransform(46,0,0,46,26,26);
  if (type === 'hand') { circle(g,-.08,-.08,.25,null,'#A3B8B3',.09); polygon(g,[[.08,.14],[.15,.08],[.42,.34],[.34,.42]],'#A3B8B3'); }
  else if (type === 'erase') { g.strokeStyle='#FF6B6B'; g.lineWidth=.12; g.beginPath(); g.moveTo(-.3,-.3); g.lineTo(.3,.3); g.moveTo(.3,-.3); g.lineTo(-.3,.3); g.stroke(); }
  else if (type === 'bridge') { rect(g,-.22,-.5,.44,1,'#263E46','#4A6A73'); rect(g,-.5,-.22,1,.44,'#35505A','#6A8D94'); arrow(g,0,.49); arrow(g,1,.49); }
  else if (type === 'wire') { polygon(g,[[-.32,.22],[-.08,-.12],[.12,.08],[.34,-.26]],null,'#55D6E8',.07); circle(g,-.32,.22,.11,'#55D6E8'); circle(g,.34,-.26,.11,'#55D6E8'); }
  else if (type === 'track') { for (const x of [-.35,-.12,.11]) circle(g,x,0,.07,'#B7F34A'); arrow(g,1,.46,'#B7F34A'); }
  else if (type === 'worm') { for (const x of [-.3,-.06,.18]) circle(g,x,0,.2,'#2A4A22','#C9F77A',.05); circle(g,.34,0,.13,'#4E7F2D','#C9F77A',.05); }
  else drawCell(g,{...cell(type,1,11,type === 'belt' ? 1 : 0)});
  b.append(icon);
  if (type === 'hand') hole.innerHTML = '<svg width="30" height="30" viewBox="0 0 30 30"><circle cx="12" cy="12" r="8" fill="none" stroke="#E9F3EF" stroke-width="2.5"/><path d="M18 18l8 8" stroke="#E9F3EF" stroke-width="3"/></svg>';
  else if (type === 'erase') hole.innerHTML = '<svg width="28" height="28" viewBox="0 0 28 28"><path d="M5 5l18 18M23 5L5 23" stroke="#FF6B74" stroke-width="3.5" stroke-linecap="round"/></svg>';
  else { hole.classList.add('model'); showModel(hole, type); }
  if (BIG[type]) { const tag = document.createElement('span'); tag.className = 'size'; tag.textContent = '2×2'; b.append(tag); }
  if (NEEDS[type]) { const tag = document.createElement('span'); tag.className = 'price lock'; tag.textContent = L`stade ${NEEDS[type] + 1}`; b.append(tag); }
  if (PRICE[type]) { const tag = document.createElement('span'); tag.className = 'price'; b.append(tag); }
  b.onclick = () => choose(type);
  b.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'mouse') return;
    write($('hint'), TYPES[type].help.split(/(?<=[.!?])\s/)[0]);
    $('hint').hidden = false;
  });
  b.addEventListener('pointerleave', () => { $('hint').hidden = true; });
  return b;
}
function growDock() {
  const dock = document.createElement('div');
  dock.className = 'dock';
  const key = (b, n) => { const k = document.createElement('kbd'); k.className = 'key'; k.setAttribute('aria-hidden', 'true'); k.textContent = n; b.append(k); b.setAttribute('aria-keyshortcuts', n); };
  const side = (type, n) => { const b = toolPod(type); b.classList.add('side'); key(b, n); dock.append(b); };
  side('hand', 1);
  FAMILIES.forEach(([id, name, model, types], i) => {
    const tray = document.createElement('div'), b = podOf(name);
    tray.className = 'tray'; tray.dataset.tray = id; tray.hidden = true;
    for (const type of types) tray.append(toolPod(type));
    $('tools').append(tray);
    b.classList.add('family'); b.dataset.family = id; b.setAttribute('aria-expanded', 'false');
    b.querySelector('.porthole').classList.add('model');
    showModel(b.querySelector('.porthole'), model);
    key(b, i + 2);
    b.onclick = () => toggleFamily(id);
    dock.append(b);
  });
  side('erase', 7);
  const stats = podOf(L('Statistiques'));
  stats.id = 'stats-pod'; stats.classList.add('side'); stats.setAttribute('aria-pressed', 'false');
  stats.querySelector('.porthole').innerHTML = '<svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true"><path d="M5 22V14M11 22V8M17 22V12M23 22V5" stroke="#66D9EA" stroke-width="3" stroke-linecap="round"/></svg>';
  key(stats, 8);
  stats.onclick = () => showStats(!ui.stats);
  dock.append(stats);
  const ranks = document.createElement('div');
  ranks.id = 'ranks'; ranks.hidden = true;
  for (const mk of [1, 2, 3]) {
    const b = document.createElement('button');
    b.dataset.rank = mk;
    b.append(`MK${mk}`, document.createElement('small'));
    b.onclick = () => { handRank[tool] = mk; paintRanks(); layoutHud(); };
    ranks.append(b);
  }
  $('tools').append(ranks, dock);
}

const togglePause = () => { paused = !paused; refresh(); };
$('pause').onclick = togglePause;
// Space pauses. It only presses a button for who reached that button with Tab: after a click the focus just lingers.
let tabbed = false;
document.addEventListener('pointerdown', () => { tabbed = false; }, true);
function spacePauses(event) {
  if (event.code !== KEYS.pause || modalOpen() || event.ctrlKey || event.metaKey || event.altKey) return false;
  if (tabbed && event.target.closest?.('button')) return false;
  // Both ways, or a focused button clicks itself on the way up.
  event.preventDefault();
  return true;
}
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
$('speed').onclick = () => { speed = speed === 1 ? 3 : 1; $('speed').textContent = '×' + speed; refresh(); };
let armed = 0;
const restartText = text => { $('restart').querySelector('span').textContent = text; };
let held = 0;
function hold() {
  clearTimeout(held);
  $('restart').classList.add('holding');
  held = setTimeout(() => { letGo(); armed = 0; restartText(L('Recommencer : maintenir')); showMenu(false); begin(); }, 1000);
}
function letGo() {
  clearTimeout(held);
  $('restart').classList.remove('holding');
}
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
// R turns what is under the pointer, or the piece in hand. Shift turns the other way.
function rotate(back) {
  playSound('rotate');
  const by = back ? 3 : 1, building = tool !== 'hand' && tool !== 'erase';
  const p = hovered && preview(), under = p && cellAt(p.x, p.y);
  // With a piece in hand the last one placed stays selected: it must not take the key from the next.
  const c = under && (hasTrait(under.type, 'turn') || under.type === 'bridge') ? under : !building && selected ? G.cells[selected] : null;
  if (c?.type === 'bridge') turnWay(c, back ? 0 : 1);
  else if (c && hasTrait(c.type, 'turn')) {
    c.dir = (c.dir + by) % 4;
    if (building) setHeading(c.dir);
  } else {
    setHeading((heading + by) % 4);
    if (building) {
      select(null);
      say(L`Sens : ${WAYS[heading]}. ${keyName(KEYS.rotate)} pour tourner, Maj+${keyName(KEYS.rotate)} dans l’autre sens.`);
    }
  }
  showActions();
}
document.addEventListener('keydown', event => {
  if (actionOf(event) !== 'rotate' || modalOpen()) return;
  event.preventDefault();
  if (flipCorner()) return;
  rotate(event.shiftKey);
});
// The same on a phone, while a finger draws.
$('flip-corner').addEventListener('pointerdown', event => { event.preventDefault(); event.stopPropagation(); flipCorner(); });

const SAVE = 'souche-proto-2', OLD_SAVE = 'souche-proto-1';
// The bonus is gone: what it cost comes back.
let repaid = 0;
function repayBonus() {
  repaid = G.upgrades > 0 ? 30 * (2 ** G.upgrades - 1) : 0;
  G.dna += repaid;
  delete G.upgrades;
}
// A game from before the fog has seen round all it built and every nest it woke.
function uncover() {
  const first = !G.seen;
  look(true);
  if (!first) return;
  for (const b of G.breaches) if (b.state !== 'sleep') lightUp([id => (G.seen[id] ||= new Array(16).fill(0))], b.x, b.y, SIGHT.nest);
  simSet.fogTick(fogTick + 1);
}
function load(text) {
  try {
    const from = slotKey || SAVE;
    let saved = JSON.parse(text ?? localStorage.getItem(from));
    const old = !saved && from === SAVE;
    if (old) saved = JSON.parse(localStorage.getItem(OLD_SAVE));
    if (old || saved?.board === 11) {
      // A game from the 11 x 14 board continues in the middle of the big map.
      if (saved?.cells) {
        delete saved.board;
        const moved = {};
        for (const c of Object.values(saved.cells)) { c.x += OX; c.y += OY; moved[key(c.x,c.y)] = c; }
        saved.cells = moved; saved.shots = [];
        for (const e of saved.enemies || []) { e.x += OX; e.y += OY; }
      }
    }
    if (saved && !saved.over && coreIn(saved.cells) && Array.isArray(saved.families)) { simSet.G(saved); if (!G.paid) { G.dna += START_DNA; G.paid = true; } G.ruins ||= {}; G.tracks ||= {}; G.worms ||= []; G.wires ||= []; for (const c of Object.values(G.cells)) if (Array.isArray(c.hold)) c.hold = c.hold.filter(Boolean); if (!G.drones) hatchDrones(); if (!G.capsules) { G.capsules = true; G.meals = []; if (G.stage === 2) G.fed = Math.floor(G.fed / PACK.size); } G.seed ??= newSeed(); if (G.stage == null) Object.assign(G, {stage:0, fed:0, held:0, meals:[], open:true}); survey(); repayBonus(); rankFollowers(); if (!G.breaches) { G.woken = 0; nest(); } else thinNests(); if (G.world !== 2) spreadOut(); uncover(); return true; }
  } catch (_) {}
  return false;
}
// What the simulation leaves to the interface around a fresh game, a finished job and a worm gone.
function noteEarned(source, amount) { (ui.earned ||= []).push({at:G.time, source, amount}); }
function onFresh() { selected = null; chain = []; paused = false; }
function testLine() { window.startLine?.(); }
function jobDone(c) { if (selected === key(c.x, c.y)) showActions(); }
function wormGone(c) { if (wormId === c.id) { wormId = null; showActions(); } }
function begin() {
  fresh();
  ui.dna = ui.stage = null; ui.grown = 0; ui.travel = null;
  $('growth').hidden = true;
  look(true);
  forgetEvents(); choose('hand'); home();
  tell(hungry());
  save(); refresh();
}

// ---- The grafted interface. It reads the game and calls the same actions as a finger: no rule lives here.
const LESS_MOTION = matchMedia('(prefers-reduced-motion: reduce)'), STILL = {wanted:false, get matches() { return this.wanted || LESS_MOTION.matches; }}, NARROW = matchMedia('(max-width:759px), (max-height:520px)');
const ui = {family:null, menu:false, html:{}, dna:null, stage:null, locked:new Map(), events:[], point:null, saidAt:0, refusedAt:-1e9, grown:0, travel:null, picked:'', pickedAt:0, safe:{left:8, top:8, right:8, bottom:8}, at:'', dry:[]};
const motionTime = () => STILL.matches ? 0 : performance.now() / 1000;
const modalOpen = () => $('commands').open || orbit.on;
function paint(id, html, el = $(id)) {
  if (ui.html[id] === html) return false;
  ui.html[id] = html; el.innerHTML = html;
  return true;
}
function replay(el, name) {
  el.classList.remove(name);
  void el.getBoundingClientRect();
  el.classList.add(name);
}
function showModel(el, type) {
  const i = Math.max(0, MODELS.indexOf(type));
  el.style.backgroundPosition = `${(i % 6) * 20}% ${Math.floor(i / 6) * 100 / 6}%`;
}
function markOf(base) { return SHAPE[base] ? `<svg viewBox="0 0 18 18">${SHAPE[base]}</svg>` : ''; }

// What happened, kept on the left edge. Touched, it takes the camera there.
function tell(text, {at, gene, bad, act} = {}) {
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
function forgetEvent(text) {
  const at = ui.events.findIndex(e => e.text === text);
  if (at >= 0) ui.events.splice(at, 1)[0].el.remove();
}
function forgetEvents() {
  for (const e of ui.events) e.el.remove();
  ui.events = [];
}
// A refusal answers where the hand is, never at the other end of the screen.
function refuse(text) {
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
function travelTo(to) {
  if (STILL.matches) { Object.assign(cam, to); return; }
  ui.travel = {...to};
}
function moveCamera(elapsed) {
  if (!ui.travel) return;
  const by = Math.min(1, elapsed * 8);
  let far = 0;
  for (const [name, value] of Object.entries(ui.travel)) {
    cam[name] += (value - cam[name]) * by;
    far += Math.abs(value - cam[name]) * (name === 'zoom' ? 1 : cam.zoom);
  }
  if (far < 1) ui.travel = null;
}

function openFamily(id) {
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
function paintRanks() {
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
function toggleFamily(id) {
  if (ui.family === id) return choose('hand');
  // Back to a family, back to the tool last taken from it.
  const last = ui.lastOf?.[id];
  if (last && last !== tool && unlocked(NEEDS[last] || 0)) return choose(last);
  if (FAMILY_OF[tool] !== id) choose('hand');
  openFamily(id);
}
function menuPage(id) {
  ui.page = id;
  for (const page of $('menu').querySelectorAll('.page')) page.hidden = page.dataset.page !== id;
  if (id === 'playlist') paintPlaylist();
}
$('menu').addEventListener('click', event => { const to = event.target.closest('[data-go]'); if (to) menuPage(to.dataset.go); });
function showMenu(open) {
  if (open && !ui.menu) playSound('open');
  if (open && !ui.menu) menuPage('root');
  ui.menu = open;
  $('menu').hidden = !open;
  $('menu-toggle').setAttribute('aria-expanded', open);
  $('planet-menu').setAttribute('aria-expanded', open);
  $('menu-toggle').classList.toggle('on', open);
}
// Where floating things may go without landing under the interface.
// Phones fold the side controls away under the chevron; the choice is kept.
const SIDE_KEY = 'strainworks-side';
function foldSide(off) {
  $('app').classList.toggle('side-off', off);
  $('side-toggle').setAttribute('aria-expanded', String(!off));
}
$('side-toggle').onclick = () => { const off = !$('app').classList.contains('side-off'); foldSide(off); keep(SIDE_KEY, off ? 'off' : 'on'); };
foldSide(stored(SIDE_KEY) === 'off');
function layoutHud() {
  const narrow = NARROW.matches, speedButton = $('speed'), pauseButton = $('pause');
  const menuButton = $('menu-toggle');
  if (narrow) {
    if (menuButton.parentElement !== $('time')) $('time').append(menuButton);
    if (speedButton.parentElement !== $('zoom')) $('zoom').append(speedButton);
    if (pauseButton.parentElement !== $('time')) $('time').insertBefore(pauseButton, $('menu-toggle'));
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

function jobName({c, field}) {
  if (field === 'out' || field === 'veinOut') return L('Retrait');
  if (field === 'veinLeft') return L('Veine');
  if (field === 'up') return `MK${c.upTo}`;
  return TYPES[c.type]?.name || (c.path ? L('Ver') : c.a ? L('Nerf') : L('Piste'));
}
function paintOrganism() {
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
function paintThreat() {
  const awake = G.breaches.filter(b => b.state === 'wake' && b.left);
  const first = awake.find(b => b.pending) || awake.reduce((a, b) => !a || b.next < a.next ? b : a, null);
  const active = Boolean(first?.pending), left = first ? Math.max(0, Math.ceil(first.next - G.time)) : 0;
  const here = Object.entries(G.enemies.reduce((n, e) => (n[e.gene] = (n[e.gene] || 0) + 1, n), {})).sort((a, b) => b[1] - a[1]);
  const gene = first ? (active ? first.gene : waveGene(first)) : here[0]?.[0] || '';
  const detail = [];
  let title, short;
  if (first) {
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
  const box = $('brief'), stock = gene ? stockOf(opposite(gene)) : 0;
  paint('title', title, box.querySelector('.title'));
  paint('detail', detail.join(' · '), box.querySelector('.detail'));
  paint('short', short, box.querySelector('.short'));
  paint('versus', gene ? `<span class="foe">${geneMark(gene)}</span><span class="to">→</span>${geneMark(opposite(gene))}<span class="${stock ? 'need' : 'none'}">${stock ? L`${stock} en stock` : L('aucun antidote')}</span>` : '');
  paint('families', here.map(([kind, n]) => {
    const ready = stockOf(opposite(kind));
    return L`<div class="threat"><b>${n} sur la carte</b>${geneMark(kind)}<span>→</span>${geneMark(opposite(kind))}<span class="${ready ? 'need' : 'none'}">${ready ? L`${ready} en stock` : L('aucun antidote')}</span></div>`;
  }).join('') || L('<span class="threat">Personne sur la carte</span>'));
  box.classList.toggle('calm', !first && !here.length);
  box.style.setProperty('--pulse', `${(1.7 - Math.min(10, G.threat) * .11).toFixed(2)}s`);
  $('app').classList.toggle('hot', !G.over && (active || G.enemies.length > 0));
}
function paintDrones() {
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
function cellsOf(c, worm) {
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
// ---- The core's card as a diagram: what it wants, how to make it, what it gives.
const ARROW = '<svg class="to" viewBox="0 0 16 10" aria-hidden="true"><path d="M1 5h12M9 1l5 4-5 4" fill="none" stroke="#66D9EA" stroke-width="1.5"/></svg>';
const CARBON = '<svg viewBox="0 0 18 18" role="img" aria-label="' + L('carbone') + '"><path d="M9 2l6 3.5v7L9 16l-6-3.5v-7z" fill="#8C949A" stroke="#C9D2D0" stroke-width="1.2"/></svg>';
const machineOf = (type, label) => `<span class="porthole model machine" data-model="${type}" role="img" aria-label="${label}"></span>`;
// The steps that make an item: each gene at a Ligase, two joined at an Assembleur, then the box.
function stepsOf(item) {
  const box = boxOf(item), body = contentOf(item), genes = body.match(/.{3}/g);
  const picture = box ? L`<span class="crate" role="img" aria-label="${BOX[box].name} de ${fill(box)}">${geneMark(body)}<b>×${fill(box)}</b></span>` : geneMark(body);
  const steps = [...new Set(genes)].map(gene => `<div class="step">${[...gene].map((b, i) => `<span class="in"><span class="num">${i + 1}</span>${markOf(b)}</span>`).join('')}${ARROW}${machineOf('ligase', L('Ligase'))}${ARROW}${geneMark(gene)}</div>`);
  if (genes.length === 2) steps.push(`<div class="step"><span class="in">${geneMark(genes[0])}</span><span class="side">+</span><span class="in">${geneMark(genes[1])}</span>${ARROW}${machineOf('join', L('Assembleur'))}${ARROW}${geneMark(body)}</div>`);
  if (box) steps.push(`<div class="step"><span class="in">${fill(box)}×${geneMark(body)}</span><span class="side">+</span><span class="in">${BOX[box].carbon}×${CARBON}</span>${BOX[box].isotope ? `<span class="side">+</span><span class="in">${BOX[box].isotope}×${markOf('I')}</span>` : ''}${ARROW}${machineOf('pack', L('Encapsuleur'))}${ARROW}${picture.replace(`<b>×${fill(box)}</b>`, '')}</div>`);
  return steps;
}
function coreSheet() {
  const want = STAGES[G.stage];
  if (!want) return '';
  if (G.goals && G.goals.length > 1) return goalsSheet(want);
  if (!want.rate) return goalsSheet(want, [{item:want.item, count:want.count, fed:G.fed}]);
  const box = boxOf(want.item), body = contentOf(want.item), genes = body.match(/.{3}/g);
  const figure = n => n.toFixed(1).replace('.', DEC);
  const picture = box ? L`<span class="crate" role="img" aria-label="${BOX[box].name} de ${fill(box)}">${geneMark(body)}<b>×${fill(box)}</b></span>` : geneMark(body);
  const rate = mealRate(), part = want.rate ? Math.min(1, G.held / want.hold) : Math.min(1, G.fed / want.count);
  const goal = want.rate
    ? `<div class="goal"><b>${want.rate}<small> / s</small></b><span>pendant ${want.hold} s</span></div>`
    : L`<div class="goal"><b>${G.fed}<small> / ${want.count}</small></b><span>livrés</span></div>`;
  const legend = want.rate
    ? L`<div class="legend"><span>débit <b>${figure(rate)} / s</b></span><span>tenu <b>${Math.floor(G.held)} / ${want.hold} s</b></span></div>`
    : '';
  const steps = stepsOf(want.item);
  const hints = [];
  if (want.rate) hints.push(L('<p><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 5h12M2 11h12" stroke="#F0A03C" stroke-width="2.2"/></svg>2 lignes en parallèle</p>'));
  if (box) hints.push(L`<p>${CARBON}carbone à l’est du cœur<svg viewBox="0 0 16 10" aria-hidden="true"><path d="M1 5h12M9 1l5 4-5 4" fill="none" stroke="#A9BDB8" stroke-width="1.5"/></svg></p>`);
  const gives = Object.keys(NEEDS).filter(type => NEEDS[type] === G.stage + 1).map(type => [type, TYPES[type].name]);
  if (G.stage + 1 > 1 && G.stage + 1 <= 3) gives.push(['mine', L`Gisements ×${G.stage + 1 === 2 ? '2' : L('4 à ×8')}`]);
  for (const mk of [2, 3]) if (RANK_NEED[mk - 1] === G.stage + 1) gives.push(['belt', L`Rang MK${mk}`]);
  const frieze = `<div class="frieze">${STAGES.map((s, i) => `<span class="${i < G.stage ? 'done' : i === G.stage ? 'now' : ''}"><i>${i < G.stage ? '✓' : i + 1}</i>${s.name}</span>`).join('')}</div>`;
  return `<h3>${L('Stades')}</h3>` + frieze + L`<h3>Il réclame</h3><div class="want">${picture}${goal}</div><div class="gauge${part >= 1 ? ' done' : ''}"><i style="width:${(part * 100).toFixed(1)}%"></i></div>${legend}`
    + L`<h3>Recette</h3>${steps.join('')}${hints.length ? `<div class="hints">${hints.join('')}</div>` : ''}`
    + (gives.length ? L`<h3>Débloque</h3><div class="gives">${gives.map(([type, name]) => `<span>${machineOf(type, name).replace(' machine', '')}${name}</span>`).join('')}</div>` : '');
}
// Several recipes: each with its count and gauge, then every step still to make, once.
function goalsSheet(want, goals = G.goals) {
  const frieze = `<div class="frieze">${STAGES.map((s, i) => `<span class="${i < G.stage ? 'done' : i === G.stage ? 'now' : ''}"><i>${i < G.stage ? '✓' : i + 1}</i>${s.name}</span>`).join('')}</div>`;
  const picture = item => { const box = boxOf(item), body = contentOf(item); return box ? L`<span class="crate" role="img" aria-label="${BOX[box].name} de ${fill(box)}">${geneMark(body)}<b>×${fill(box)}</b></span>` : geneMark(body); };
  // One row a recipe, its crate, a thin gauge and its count; the recipe shown is the row picked, else the first to make.
  if (ui.goalStage !== G.stage) { ui.goalStage = G.stage; ui.goalPick = null; ui.sheetTab = 'asks'; }
  const first = Math.max(0, goals.findIndex(g => g.fed < g.count)), pick = ui.goalPick ?? first, chosen = goals[pick] || goals[0];
  const rows = goals.map((g, i) => {
    const part = Math.min(1, g.fed / g.count), met = g.fed >= g.count;
    return `<button class="ask${met ? ' met' : ''}" data-goal="${i}" aria-pressed="${i === pick}">${picture(g.item)}<span class="gauge${met ? ' done' : ''}"><i style="width:${(part * 100).toFixed(1)}%"></i></span><span class="count">${met ? '✓' : `${g.fed}<small> / ${g.count}</small>`}</span></button>`;
  }).join('');
  const open = [chosen];
  const hints = open.some(g => boxOf(g.item)) ? `<div class="hints">${L`<p>${CARBON}carbone à l’est du cœur<svg viewBox="0 0 16 10" aria-hidden="true"><path d="M1 5h12M9 1l5 4-5 4" fill="none" stroke="#A9BDB8" stroke-width="1.5"/></svg></p>`}</div>` : '';
  const gives = Object.keys(NEEDS).filter(type => NEEDS[type] === G.stage + 1).map(type => [type, TYPES[type].name]);
  if (G.stage + 1 > 1 && G.stage + 1 <= 3) gives.push(['mine', L`Gisements ×${G.stage + 1 === 2 ? '2' : L('4 à ×8')}`]);
  for (const mk of [2, 3]) if (RANK_NEED[mk - 1] === G.stage + 1) gives.push(['belt', L`Rang MK${mk}`]);
  const giving = gives.length ? `<div class="gives">${gives.map(([type, name]) => `<span>${machineOf(type, name).replace(' machine', '')}${name}</span>`).join('')}</div>` : `<p class="unit">${want.gives}</p>`;
  const tab = ui.sheetTab === 'gives' ? 'gives' : 'asks';
  const tabs = `<div class="sheet-tabs" role="tablist"><button role="tab" data-sheet-tab="asks" aria-selected="${tab === 'asks'}">${L('Il réclame')}</button><button role="tab" data-sheet-tab="gives" aria-selected="${tab === 'gives'}">${L('Débloque')}</button></div>`;
  const body = tab === 'gives' ? giving : `<div class="asks">${rows}</div><h3>${L('Recette')}</h3>${stepsOf(chosen.item).join('')}${hints}`;
  return frieze + tabs + body;
}
// A row or a tab of the core's sheet, touched.
$('sheet').addEventListener('click', event => {
  const row = event.target.closest('[data-goal]'), tab = event.target.closest('[data-sheet-tab]'), up = event.target.closest('[data-up]'), labTab = event.target.closest('[data-lab-tab]');
  if (up) buyLab(up.dataset.up);
  else if (labTab) ui.labTab = labTab.dataset.labTab;
  else if (row) ui.goalPick = Number(row.dataset.goal);
  else if (tab) ui.sheetTab = tab.dataset.sheetTab;
  else return;
  paintSheet(G.cells[selected]);
});
function labSheet() {
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
function paintSheet(c) {
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

// ---- The guided start: five steps to a first line feeding the core, each checked on what is built.
const GUIDE = [
  {family:'rec', pick:'mine', model:'mine', base:'S', list:L('Un récolteur sur'), title:L('Pose un récolteur sur'), why:L('Le cœur veut ce gène : il faut deux fois cette base pour une de l’autre.')},
  {family:'rec', pick:'mine', model:'mine', base:'F', list:L('Un récolteur sur'), title:L('Puis un récolteur sur'), why:L('Elle ira au milieu du gène, par l’arrière de la Ligase.')},
  {family:'rec', pick:'mine', model:'mine', base:'S', list:L('Un second récolteur sur'), title:L('Un second récolteur sur'), why:L('Deux de l’une et une de l’autre : la Ligase ne fait jamais attendre un tapis.')},
  {family:'fab', pick:'ligase', model:'ligase', list:L('Prendre la Ligase'), title:L('Prends la Ligase'), why:L('Elle assemble trois bases en un gène, dans l’ordre : S, F, S. Le cœur mange ce gène.')},
  {family:'fab', pick:'ligase', model:'ligase', place:true, list:L('Poser la Ligase'), title:L('Pose la Ligase ici'), why:L('Entre tes récolteurs et le cœur. Sa sortie, la flèche, doit regarder le cœur : R pour la tourner avant de la poser.')},
  {family:'tra', pick:'belt', model:'belt', port:0, base:'S', list:L('Récolteur → entrée 1'), title:L('Relie à l’entrée 1 un récolteur sur'), why:L('Prends un tapis et glisse du récolteur jusqu’à l’entrée 1 de la Ligase, en suivant le tracé.')},
  {family:'tra', pick:'belt', model:'belt', port:1, base:'F', list:L('Récolteur → entrée 2'), title:L('Relie à l’entrée 2 un récolteur sur'), why:L('Même geste vers l’entrée 2 : la base du milieu du gène.')},
  {family:'tra', pick:'belt', model:'belt', port:2, base:'S', list:L('Récolteur → entrée 3'), title:L('Relie à l’entrée 3 un récolteur sur'), why:L('Et vers l’entrée 3 : la Ligase assemble le gène dès que ses trois entrées sont servies.')},
  {family:'tra', pick:'belt', model:'belt', core:true, list:L('La Ligase jusqu’au cœur'), title:L('Relie la Ligase au cœur'), why:L('Un tapis de la sortie de la Ligase jusqu’au cœur : il mange le gène, et le premier atelier tourne.')}
];
function builtNow() {
  const n = {S:0, F:0, ligase:0};
  for (const c of allCells()) {
    if (c.type === 'mine' && (matterUnder(c) === 'S' || matterUnder(c) === 'F')) n[matterUnder(c)]++;
    if (c.type === 'ligase') n.ligase++;
  }
  return n;
}
function startGuide() {
  G.guide = {step:0, base:builtNow(), hidden:false};
  ui.guideSpot = null;
}
// A belt's way on free ground from beside a building to a cell that suits: the cells a player can follow, or null.
// The goal cell itself may hold a belt already; every other cell of the way must be free and buildable.
function guideRoute(from, done, goal = null, limit = 1600) {
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
function guideLigase() {
  let best = null;
  for (const c of allCells()) if (c.type === 'ligase' && (!best || Math.hypot(c.x - CORE.x, c.y - CORE.y) < Math.hypot(best.x - CORE.x, best.y - CORE.y))) best = c;
  return best;
}
// Each step is checked on the game itself: a base that reached its input, a gene the core ate.
function guideDone(step, now) {
  const base = G.guide.base, want = GUIDE[step], fed = G.fed >= 1 || G.stage > 0, placed = now.ligase >= base.ligase + 1;
  if (step === 0) return now.S >= base.S + 1;
  if (step === 1) return now.F >= base.F + 1;
  if (step === 2) return now.S >= base.S + 2;
  if (step === 3) return tool === 'ligase' || placed || fed;
  if (step === 4) return placed || fed;
  // Read as the input is now: its base waiting there, or a gene already made from all three.
  if (want.port != null) { const lig = guideLigase(); return Boolean(lig?.ports[want.port].includes(GUIDE_GENE[want.port]) || lig?.last) || fed; }
  return fed;
}
const GUIDE_GENE = ['S', 'F', 'S'];
// What stands in the way, said in the step: a wrong base in an input, or why no gene reaches the core.
function guideHint(want) {
  const lig = guideLigase();
  if (!lig) return '';
  if (ui.guideNoRoute === 'mine') return L('Aucune sortie de récolteur ne mène librement à cette entrée : touche un récolteur et Tourner pour que sa flèche regarde la Ligase, fais de la place, ou déplace la Ligase.');
  if (ui.guideNoRoute) return L('Aucun chemin libre jusque-là : fais de la place, ou déplace la Ligase.');
  if (want.port != null) {
    const wrong = lig.ports[want.port].find(b => b !== GUIDE_GENE[want.port]);
    return wrong ? L`L’entrée ${want.port + 1} reçoit ${named(wrong)} : il lui faut ${named(GUIDE_GENE[want.port])}. Démonte ce tapis et relie le bon récolteur.` : '';
  }
  if (!want.core) return '';
  // The red line the diagnosis draws is the player's: it is put back as it was.
  const was = chain, text = diagnose(lig);
  chain = was;
  return L`Ligase : ${text}`;
}
// How to reach the machine of a step from the dock, while it is not in hand.
function howTo(want) {
  if (!want.pick || tool === want.pick) return '';
  const families = [...$('tools').querySelectorAll('.family')], fam = families.findIndex(b => b.dataset.family === want.family);
  const pods = [...$('tools').querySelectorAll(`.tray[data-tray="${want.family}"] [data-type]`)], at = pods.findIndex(b => b.dataset.type === want.pick);
  if (fam < 0 || at < 0) return '';
  return L`Ouvre ${FAMILIES[fam][1]} (touche ${fam + 2}), puis prends ${TYPES[want.pick].name} (Maj+${at + 1}).`;
}
// The free deposit cell of that base nearest the core, kept until something stands on it.
function guideSpot(step) {
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
function paintGuide() {
  const g = G.guide, live = Boolean(g) && g.step < GUIDE.length && !G.over && !orbit.on;
  if (live) {
    // A base seen in an input stays seen: the Ligase empties its inputs once the gene is made.
    const now = builtNow();
    while (g.step < GUIDE.length && guideDone(g.step, now)) {
      g.step++;
      earn('guide', 5);
      // A step done shows in the guide's list and the DNA count; only the end gets a note in the events.
      if (g.step >= GUIDE.length) tell(L('Premier atelier en marche : +5 ADN. Le guide se range dans le menu.'));
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
  write($('guide-why'), [step.why, arrow, howTo(step), guideHint(step)].filter(Boolean).join(' '));
  showModel($('guide-model'), step.model);
  const list = GUIDE.map((s, i) => `<li class="${i < g.step ? 'done' : i === g.step ? 'now' : ''}"><i>${i < g.step ? '✓' : i + 1}</i><span>${s.list}</span>${s.base ? markOf(s.base) : ''}</li>`).join('');
  if ($('guide-steps').innerHTML !== list) $('guide-steps').innerHTML = list;
  $('app').style.setProperty('--guide-h', `${$('guide').offsetHeight}px`);
  ui.guidePoint = guideSpot(g.step);
}
// The map the player sees: inside the screen, clear of the top bar, the side buttons, the dock and the guide.
// gap: how far from what covers it, 20 px for the circle to read, more for the arrow to fit.
function freeBox(gap) {
  const box = {l:gap, t:70 + gap, r:view.w - 60 - gap, b:view.h - gap};
  const dock = $('tools').getBoundingClientRect();
  if (dock.height) box.b = Math.min(box.b, dock.top - gap);
  if (!$('guide').hidden) {
    const g = $('guide').getBoundingClientRect();
    if (NARROW.matches) box.t = Math.max(box.t, g.bottom + gap); else box.l = Math.max(box.l, g.right + gap);
  }
  return box;
}
function placeGuideSpot() {
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
// ---- The goal: three moving pictures, shown once on a first game and again from the menu. The game waits behind it.
const INTRO_KEY = 'strainworks-intro';
const intro = {at:0, timer:0, was:false};
// A creature as the game draws it: a dark body, its legs, the marks of its gene.
function creatureIcon(gene) {
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
function introHTML() {
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
function introShow(i) {
  intro.at = i;
  $('intro').querySelectorAll('[data-intro]').forEach((el, k) => { el.hidden = k !== i; });
  $('intro').querySelectorAll('[data-dot]').forEach((el, k) => el.setAttribute('aria-current', k === i));
  $('intro-no').textContent = L`Ton objectif · ${i + 1} sur 3`;
  $('intro-next').textContent = i === 2 ? L('Commencer') : L('Suivant');
  clearTimeout(intro.timer);
  if (!STILL.matches) intro.timer = setTimeout(() => introShow((intro.at + 1) % 3), 6000);
}
function showIntro(open) {
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
    if (box.hidden) { intro.was = paused; paused = true; }
    box.hidden = false;
    introShow(0);
  } else if (!box.hidden) {
    box.hidden = true; clearTimeout(intro.timer);
    paused = intro.was;
    paintGuide();
  }
}
$('intro-again').onclick = () => { showMenu(false); showIntro(true); };
$('guide-arrow').onclick = () => { const at = ui.guidePoint; if (at) travelTo({...cam, x:at.x, y:at.y}); };
$('guide-hide').onclick = () => { if (G.guide) G.guide.hidden = true; paintGuide(); };
$('guide-show').onclick = () => { if (G.guide) G.guide.hidden = false; paintGuide(); };
const skipGuide = () => { if (G.guide) G.guide.step = GUIDE.length; paintGuide(); };
$('guide-skip').onclick = skipGuide;
$('guide-drop').onclick = skipGuide;
$('guide-again').onclick = () => { startGuide(); showMenu(false); paintGuide(); };

function paintInfo() {
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
function paintMoments() {
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
function showVictory() {
  const box = $('victory');
  if (!box.querySelector('svg')) box.prepend($('growth').querySelector('svg').cloneNode(true));
  const minutes = Math.max(1, Math.round(G.won / 60)), made = Math.floor(G.made).toLocaleString(LOCALE);
  box.querySelector('.stage').textContent = L`Victoire en ${minutes} min`;
  paint('victory-score', [[G.kills, L('créatures tuées')], [G.breaches.filter(b => b.state === 'spent').length, L('brèches vidées')], [made, L('gènes produits')], [G.families.length, L('familles affrontées')]].map(([n, what]) => `<span><b>${n}</b>${what}</span>`).join(''));
  $('growth').hidden = true;
  box.hidden = false;
  playSound('stage_up');
}
function paintDry() {
  ui.dry = G.over || !G.enemies.length ? [] : allCells().filter(c => isGun(c) && built(c) && !Object.values(c.ammo).some(n => n) && G.enemies.some(e => Math.hypot(e.x - c.x - .5, e.y - c.y - .5) < GUNS[c.type].range * 2)).slice(0, 4);
  const box = $('dry');
  while (box.children.length > ui.dry.length) box.lastChild.remove();
  while (box.children.length < ui.dry.length) box.insertAdjacentHTML('beforeend', L('<i><b></b><span>Tourelle à sec</span></i>'));
}
function paintHud() {
  paintRanks();
  paintOrganism(); paintThreat(); paintDrones(); paintInfo(); paintMoments(); paintDry();
  sampleStats(); if (ui.stats) paintStats();
  $('app').classList.toggle('paused', paused);
  $('app').classList.toggle('fast', speed > 1);
  $('speed').classList.toggle('on', speed > 1);
  $('pause').classList.toggle('on', paused);
  $('open-row').hidden = Boolean(G.open);
}

const screenAt = p => ({x:view.w / 2 + (p.x - cam.x) * cam.zoom, y:view.h / 2 + (p.y - cam.y) * cam.zoom * flat()});
const within = (v, low, high) => Math.max(low, Math.min(high, v));
// Petals bloom round the object and its card hangs from it. Without room, or with a piece in hand, both dock.
function followSelection() {
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
function animateHud(elapsed) {
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

// The fog itself: a small picture, one point a tile, blurred wide and stretched soft over the map. No line anywhere.
const fogImage = document.createElement('canvas'), FOG_SOFT = 2;
let fogFor = '';
function drawFog(g) {
  const a = worldAt(0, 0), b = worldAt(view.w, view.h), pad = FOG_SOFT * 2 + 3;
  const x0 = Math.floor(a.x / 2) - pad, y0 = Math.floor(a.y / 2) - pad, w = Math.ceil(b.x / 2) + pad - x0, h = Math.ceil(b.y / 2) + pad - y0;
  const now = `${fogTick},${x0},${y0},${w},${h}`;
  if (now !== fogFor) {
    fogFor = now;
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
function soften(field, w, h) {
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
function sceneSigns(g) {
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

$('threat-toggle').onclick = () => {
  const open = $('families').hidden;
  $('families').hidden = !open;
  $('threat-toggle').setAttribute('aria-expanded', open);
};
$('menu-toggle').onclick = () => showMenu(!ui.menu);
function setMotion(less) {
  STILL.wanted = less;
  $('app').classList.toggle('calm-motion', less);
  document.documentElement.classList.toggle('still', less);
  $('motion-auto').setAttribute('aria-pressed', !less);
  $('motion-less').setAttribute('aria-pressed', less);
}
for (const [id, less] of [['motion-auto', false], ['motion-less', true]]) $(id).onclick = () => { setMotion(less); keep(MOTION_KEY, less ? 'less' : 'auto'); };
$('help').onclick = () => { showMenu(false); $('commands').showModal(); };
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
  if (G.goals) for (const g of G.goals) g.fed = g.count;
  showMenu(false); grow(); refresh();
};
$('won-planet').onclick = () => { $('victory').hidden = true; openPlanet(); };
function addPip(i) {
  const b = document.createElement('button');
  b.className = 'pip';
  b.innerHTML = '<svg class="ring" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18"/><circle class="run" cx="20" cy="20" r="18"/></svg><span class="porthole model hull" aria-hidden="true"></span><span class="mini porthole model" aria-hidden="true" hidden></span><svg class="heading" viewBox="0 0 12 12" aria-hidden="true" hidden><path d="M6 1l4 6H2z"/></svg><span class="words"></span>';
  showModel(b.querySelector('.hull'), 'drone');
  b.onclick = () => { const d = G.drones[i]; if (d) travelTo({x:d.x, y:d.y}); else buyLab('drones'); };
  $('drones').append(b);
}
for (let i = 0; i < MOST_DRONES; i++) addPip(i);
document.addEventListener('pointerdown', event => {
  ui.point = {x:event.clientX, y:event.clientY};
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
    const pick = ui.family ? $('tools').querySelectorAll(`.tray[data-tray="${ui.family}"] [data-type]`)[n - 1] : $('stats').querySelectorAll('.tab')[n - 1];
    if (pick) { replay(pick, 'pressed'); pick.click(); }
    return;
  }
  const b = n === '8' ? $('stats-pod') : n === '1' || n === '7' ? $('tools').querySelector(`[data-type="${n === '1' ? 'hand' : 'erase'}"]`) : $('tools').querySelectorAll('.family')[n - 2];
  const box = b.getBoundingClientRect();
  ui.point = {x:box.x + box.width / 2, y:box.y};
  replay(b, 'pressed'); b.click();
});
NARROW.addEventListener('change', layoutHud);

// ---- Statistics: read from the running factory, sampled every 10 s for five minutes of history.
const STAT_TABS = [
  ['prod', L('Production'), '<path d="M2 13V7l3 2V7l3 2V4l6 4v5z"/>'],
  ['eco', L('Économie'), '<circle cx="8" cy="8" r="6"/><path d="M8 4v8"/>'],
  ['def', L('Défense'), '<path d="M8 1l6 2v5c0 3.5-2.6 6-6 7-3.4-1-6-3.5-6-7V3z"/>'],
  ['threat', L('Menace'), '<path d="M1 8h4l1.5-4 3 8 1.5-4h4"/>'],
  ['logi', L('Logistique'), '<path d="M1 5h10l-2-2M15 11H5l2 2"/>']
];
// The statistics' order; which pieces produce is their 'produce' trait.
const PRODUCERS = ['mine', 'borer', 'ligase', 'join', 'pack'];
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
function showStats(open) {
  ui.stats = open ? ui.statsTab || 'prod' : '';
  $('stats').hidden = !open;
  $('stats-pod').setAttribute('aria-pressed', open);
  if (open) { if (ui.menu) showMenu(false); ui.statsAt = -Infinity; paintStats(); }
}
function outputOf(c) { return c.type === 'mine' || c.type === 'borer' ? matterUnder(c) : c.item || c.last || ''; }
function itemMark(item) {
  if (!item) return L('<span class="dim">en attente</span>');
  if (boxOf(item)) return `<span class="crate">${geneMark(contentOf(item))}</span>`;
  return item.length === 1 ? `<span class="base">${markOf(item)}</span>` : geneMark(item);
}
function holeOf(type) {
  const i = Math.max(0, MODELS.indexOf(type));
  return `<span class="porthole model" style="background-position:${(i % 6) * 20}% ${Math.floor(i / 6) * 100 / 6}%" aria-hidden="true"></span>`;
}
// Per output: machines, what they made over the last 10 s as a rate per minute, and what they could make.
function production() {
  const lines = new Map();
  for (const c of allCells()) {
    if (!hasTrait(c.type, 'produce') || !built(c)) continue;
    const item = outputOf(c), id = `${c.type}|${item}`;
    const line = lines.get(id) || {type:c.type, item, n:0, now:0, max:0};
    line.n++; line.now += (c.made?.length || 0) * 6; line.max += perSecond(c) * 60;
    lines.set(id, line);
  }
  return [...lines.entries()].sort((a, b) => PRODUCERS.indexOf(a[1].type) - PRODUCERS.indexOf(b[1].type) || b[1].now - a[1].now);
}
function sampleStats() {
  if (G.time < (ui.sampledAt ?? -Infinity) + 10 && ui.sampledAt <= G.time) return;
  ui.sampledAt = G.time;
  const rates = Object.fromEntries(production().map(([id, line]) => [id, line.now]));
  (ui.history ||= []).push(rates);
  if (ui.history.length > 30) ui.history.shift();
}
function spark(values) {
  const top = Math.max(1, ...values), w = 120, step = w / Math.max(1, values.length - 1);
  return `<svg width="${w}" height="28" viewBox="0 0 ${w} 28" aria-hidden="true"><polyline points="${values.map((v, i) => `${(i * step).toFixed(1)},${(26 - v / top * 22).toFixed(1)}`).join(' ')}" fill="none" stroke="#66D9EA" stroke-width="1.6"/></svg>`;
}
const fr = n => (Math.round(n * 10) / 10).toLocaleString(LOCALE);
function problems() {
  const out = [];
  for (const c of allCells()) {
    if (!built(c)) continue;
    const name = TYPES[c.type]?.name || '';
    if (isGun(c) && !Object.values(c.ammo).some(n => n)) out.push([c, 'red', L`${name} à sec`, L('plus de munitions')]);
    else if (hasTrait(c.type, 'produce') && !c.made?.length) {
      if (c.item) out.push([c, 'amber', L`${name} bloqué`, L('sortie pleine')]);
      else if (c.ports) {
        const empty = c.type === 'pack' ? (readyPort(c, 0) < PACK.size ? L('gènes manquants') : L('carbone manquant')) : L`entrée ${c.ports.findIndex((p, i) => !readyPort(c, i)) + 1} vide`;
        out.push([c, 'red', L`${name} à l’arrêt`, empty]);
      }
    }
  }
  return out.sort((a, b) => (a[1] === 'red' ? 0 : 1) - (b[1] === 'red' ? 0 : 1) || span(a[0], CORE) - span(b[0], CORE));
}
function statsHTML(tab) {
  if (tab === 'prod') {
    const lines = production(), want = STAGES[G.stage];
    if (!lines.length) return L('<p class="empty">Aucune machine ne produit encore. Pose un récolteur sur un gisement.</p>');
    const askedOf = G.goals ? G.goals.filter(g => g.fed < g.count).map(g => g.item) : want ? [want.item] : [];
    const asked = askedOf.length ? L`<p class="note">Le cœur réclame ${askedOf.map(itemMark).join(' ')}</p>` : '';
    return L`<div class="head"><p class="label">Production · par minute, sur les 10 dernières secondes</p>${asked}</div>`
      + L('<div class="row prod cols label"><span>Ce qui sort</span><span>Débit</span><span>/ min</span><span>Capacité</span><span>5 minutes</span></div>')
      + lines.map(([id, l]) => `<div class="row prod"><span class="what">${holeOf(l.type)}${itemMark(l.item)}${l.n > 1 ? `<span class="dim">×${l.n}</span>` : ''}</span>`
        + `<span class="bar"><i style="width:${Math.min(100, l.now / Math.max(1, l.max) * 100).toFixed(0)}%"></i></span><span class="n">${fr(l.now)}</span><span class="dim">${fr(l.max)}</span>`
        + `${spark((ui.history || []).map(h => h[id] || 0))}</div>`).join('');
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
function paintStats() {
  if (G.time - (ui.statsAt ?? -Infinity) < 1 && ui.statsAt <= G.time) return;
  ui.statsAt = G.time;
  for (const b of $('stats').querySelectorAll('[data-tab]')) b.setAttribute('aria-selected', b.dataset.tab === ui.stats);
  paint('stats-body', statsHTML(ui.stats));
}

// ---- Games: one a hexagon, each under its own key. The list can be rebuilt from the keys, never the reverse.
// Nothing here writes over a game, except its own autosave and what a held press asked for.
const LIST_KEY = 'strainworks-planet', GAME_KEY = 'strainworks-game:', MOTION_KEY = 'strainworks-motion';
const NAMES = [L('Rhizome'), L('Synapse'), L('Moelle'), L('Chitine'), L('Mycélium'), L('Spirale'), L('Écorce'), L('Plasmide'), L('Axone'), L('Spore'), L('Ganglion'), L('Lymphe'), L('Tendon'), L('Cilium'), L('Germe'), L('Kératine')];
const FILE = {one:'strainworks', all:'strainworks-planet', bytes:16e6, cells:60000, values:3e6};
let slotKey = null, slotId = null, saveFailed = false;

function stored(key) { try { return localStorage.getItem(key); } catch (_) { return null; } }
function keep(key, text) { try { localStorage.setItem(key, text); return true; } catch (_) { return false; } }
function parsed(text) { try { return JSON.parse(text); } catch (_) { return null; } }
function summaryOf(game) {
  const cells = Object.values(game?.cells || {});
  let level = 0, rank = 1;
  for (const c of cells) { level = Math.max(level, tierAt(c.x, c.y) + 1); rank = Math.max(rank, c.mk || 1); }
  return {
    stage:game?.stage ?? 0, over:Boolean(game?.over), dna:Math.floor(game?.dna || 0), kills:game?.kills || 0,
    // Creatures on the map or a breach awake when it was saved: the planet shows that station fighting.
    fight:!game?.over && ((game?.enemies?.length || 0) > 0 || (Array.isArray(game?.breaches) && game.breaches.some(b => b?.state === 'wake'))),
    played:Math.floor(game?.played ?? game?.time ?? 0), built:cells.length, level, rank,
    spent:(Array.isArray(game?.breaches) ? game.breaches : []).filter(b => b?.state === 'spent').length
  };
}
// Read again before each change: another tab may have changed it.
function readList() {
  const found = parsed(stored(LIST_KEY)), games = found?.games && typeof found.games === 'object' ? found.games : {};
  const list = {v:1, last:found?.last ?? null, games:{}};
  for (const [id, g] of Object.entries(games)) {
    if (CELLS_OF_GLOBE[id] && typeof g?.key === 'string' && stored(g.key) !== null) list.games[id] = g;
  }
  // The demo's hexagon is kept for it: a game a player had there moves to the nearest free one, untouched.
  if (list.games[DEMO_HEX]) {
    const to = freeHex(list, DEMO_HEX);
    if (to != null) {
      list.games[to] = list.games[DEMO_HEX]; delete list.games[DEMO_HEX];
      if (String(list.last) === String(DEMO_HEX)) list.last = to;
      writeList(list); demoMoved = true;
    }
  }
  return list;
}
// What the planet shows: the player's games and the demo.
const DEMO_KEY = 'strainworks-demo';
let demoMoved = false, demoReady = null;
const loadDemo = () => demoReady ||= script('demo.js').catch(() => null);
function planetList() {
  const list = readList();
  if (DEMO_HEX != null) list.games[DEMO_HEX] = {key:DEMO_KEY, name:L('Démo'), demo:true, ...summaryOf(window.DEMO_GAME || {stage:4})};
  return list;
}
function writeList(list) { return keep(LIST_KEY, JSON.stringify(list)); }
function freeHex(list, near) {
  const free = PREFERRED.filter(id => !list.games[id] && id !== DEMO_HEX);
  if (near == null) return free[0];
  const c = CELLS_OF_GLOBE[near].c;
  return free.sort((a, b) => dot3(CELLS_OF_GLOBE[b].c, c) - dot3(CELLS_OF_GLOBE[a].c, c))[0];
}
function newName(list) {
  const used = new Set(Object.values(list.games).map(g => g.name)), free = NAMES.find(name => !used.has(name));
  return free || L`Souche ${Object.keys(list.games).length + 1}`;
}
// What an older version left, and any game the list lost.
function findGames() {
  const list = readList(), listed = new Set(Object.values(list.games).map(g => g.key));
  let changed = false;
  const adopt = (key, text, wanted) => {
    const id = wanted != null && CELLS_OF_GLOBE[wanted] && !list.games[wanted] ? wanted : freeHex(list);
    if (id == null) return;
    list.games[id] = {key, name:newName(list), ...summaryOf(parsed(text))};
    listed.add(key); list.last = id; changed = true;
  };
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(GAME_KEY) || listed.has(key)) continue;
      adopt(key, stored(key), key.slice(GAME_KEY.length).split(':')[0]);
    }
  } catch (_) {}
  if (!listed.has(SAVE)) {
    let text = stored(SAVE);
    const older = text === null ? stored(OLD_SAVE) : null;
    // The 11 x 14 board is moved by load(), under the same key as ever.
    if (older !== null && keep(SAVE, older.replace(/^\{/, '{"board":11,'))) text = older;
    if (text !== null) adopt(SAVE, text);
  }
  if (changed) writeList(list);
}
function save() {
  if (!slotKey || slotKey === DEMO_KEY) return false;
  // Its hexagon emptied from another tab: this one does not bring it back.
  const list = readList(), entry = list.games[slotId];
  if (!entry && stored(slotKey) === null && slotSaved) return false;
  const ok = keep(slotKey, JSON.stringify(G));
  if (!ok) {
    if (!saveFailed) tell(L('Sauvegarde impossible, le stockage du navigateur est plein ou bloqué. Exporte ta partie depuis le menu.'), {bad:true});
    saveFailed = true;
    return false;
  }
  saveFailed = false; slotSaved = true;
  list.games[slotId] = {name:slotName, ...entry, key:slotKey, ...summaryOf(G)};
  list.last = slotId;
  writeList(list);
  return true;
}
let slotSaved = false, slotName = '';
function openSlot(id, key, name) { slotId = id; slotKey = key; slotName = name; slotSaved = false; saveFailed = false; }
// All that belongs to the game being left.
function settleIn() {
  ui.dna = ui.stage = null; ui.grown = 0; ui.travel = null;
  $('growth').hidden = true; $('over').hidden = true; $('victory').hidden = true;
  forgetEvents();
  paused = false; owed = 0; hovered = null; gesture = null; drag = null;
  paces.clear(); simSet.NET(new Map());
}
function foundGame(wanted) {
  const list = readList(), id = wanted != null && !list.games[wanted] ? wanted : freeHex(list);
  if (id == null) { noteOnPlanet(L('La planète est pleine : efface ou exporte une partie.'), true); return false; }
  // The first one keeps the key every earlier version wrote.
  let key = SAVE;
  if (stored(key) !== null || Object.values(list.games).some(g => g.key === key)) {
    key = `${GAME_KEY}${id}`;
    if (stored(key) !== null) key += `:${Date.now()}`;
  }
  openSlot(id, key, newName(list));
  settleIn(); begin(); startGuide(); paintGuide();
  // Every new game opens on its goal; 'off' is only for tests and captures.
  if (stored(INTRO_KEY) !== 'off') showIntro(true);
  return true;
}
function openGame(id) {
  // The demo: a fresh copy of the built-in game each time, never written back.
  if (id === DEMO_HEX) {
    if (!window.DEMO_GAME) return false;
    openSlot(id, DEMO_KEY, L('Démo')); settleIn();
    if (!load(JSON.stringify(window.DEMO_GAME))) { slotKey = slotId = null; return false; }
    try { simSet.NET(new Map()); choose('hand'); home(); refresh(); } catch (_) { slotKey = slotId = null; return false; }
    tell(L('Démo : une base au stade 6 qui tourne seule. Rien n’est enregistré, elle repart à neuf à chaque lancement.'));
    return true;
  }
  const game = readList().games[id];
  if (!game) return false;
  openSlot(id, game.key, game.name);
  settleIn();
  let ok = load();
  if (ok) {
    try { simSet.NET(new Map()); choose('hand'); home(); refresh(); } catch (_) { ok = false; }
  }
  if (!ok) {
    // Unreadable is not empty: it stays where it is, to export or erase.
    slotKey = slotId = null;
    return false;
  }
  slotSaved = true;
  if (repaid) tell(L`Le bonus de débit a disparu : ${repaid} ADN remboursés, pour des tapis et récolteurs MK2 ou MK3.`);
  tell(L('Partie reprise. Glisse ou utilise les flèches pour te déplacer, pince pour zoomer.'));
  return true;
}
function eraseGame(id) {
  const list = readList(), game = list.games[id];
  if (!game) return false;
  try {
    localStorage.removeItem(game.key);
    if (game.key === SAVE) localStorage.removeItem(OLD_SAVE);
  } catch (_) { return false; }
  delete list.games[id];
  if (String(list.last) === String(id)) list.last = Object.keys(list.games)[0] ?? null;
  writeList(list);
  if (String(slotId) === String(id)) slotKey = slotId = null;
  return true;
}
// Written beside what exists, all or none.
function graftGames(found, near) {
  const list = readList(), made = [];
  for (const {name, game} of found) {
    const id = !made.length && near != null && !list.games[near] ? near : freeHex(list, made[0]?.id ?? near);
    let key = `${GAME_KEY}${id}`;
    if (stored(key) !== null) key += `:${Date.now()}`;
    if (id == null || !keep(key, JSON.stringify(game))) {
      for (const one of made) { try { localStorage.removeItem(one.key); } catch (_) {} }
      return null;
    }
    made.push({id, key});
    list.games[id] = {key, name:String(name || newName(list)).slice(0, 40), ...summaryOf(game)};
    list.last = made[0].id;
  }
  if (writeList(list)) return made[0]?.id ?? null;
  for (const one of made) { try { localStorage.removeItem(one.key); } catch (_) {} }
  return null;
}

// ---- A file is somebody else's data: every value is looked at before a byte is stored.
function checkGame(game) {
  const plain = v => Boolean(v) && typeof v === 'object' && !Array.isArray(v);
  const list = (v, test) => Array.isArray(v) && v.every(test);
  const code = v => typeof v === 'string' && /^[SFCN]{3}$/.test(v);
  const thing = v => typeof v === 'string' && /^([SFCNKI]|[SFCN]{3}|[SFCN]{6}|[ATH]:([SFCN]{3}|[SFCN]{6}))$/.test(v);
  const where = v => typeof v === 'string' && /^-?\d{1,6},-?\d{1,6}$/.test(v);
  const place = v => plain(v) && Number.isInteger(v.x) && Number.isInteger(v.y) && Math.abs(v.x) < LIMIT && Math.abs(v.y) < LIMIT;
  const spot = v => plain(v) && Number.isFinite(v.x) && Number.isFinite(v.y) && Math.abs(v.x) <= LIMIT && Math.abs(v.y) <= LIMIT;
  const side = v => [0, 1, 2, 3].includes(v);
  const count = v => Number.isFinite(v) && v >= 0;
  if (!plain(game)) return false;

  // No markup, no key that reaches a prototype, nothing endless.
  let values = 0;
  const clean = (v, deep) => {
    if (++values > FILE.values || deep > 12) return false;
    if (v === null || typeof v === 'boolean') return true;
    if (typeof v === 'number') return Number.isFinite(v) && Math.abs(v) < 1e15;
    if (typeof v === 'string') return v.length <= 300 && !/[<>&"`\\]/.test(v);
    if (Array.isArray(v)) return v.every(one => clean(one, deep + 1));
    if (typeof v !== 'object') return false;
    return Object.entries(v).every(([name, one]) => name.length < 80 && !/[<>&"`\\]/.test(name) && !['__proto__', 'constructor', 'prototype'].includes(name) && clean(one, deep + 1));
  };
  if (!clean(game, 0)) return false;

  for (const name of ['time', 'dna', 'kills', 'made', 'threat', 'fed', 'held', 'seed', 'played', 'upgrades', 'woken', 'stage']) {
    if (game[name] != null && !count(game[name])) return false;
  }
  if (!count(game.time) || !count(game.dna) || !count(game.kills)) return false;
  if (game.stage != null && !(Number.isInteger(game.stage) && game.stage <= STAGES.length)) return false;
  if (game.upgrades > 20 || game.threat > 10) return false;
  if (game.guide != null && !(plain(game.guide) && Number.isInteger(game.guide.step) && game.guide.step >= 0 && game.guide.step <= 9 && plain(game.guide.base) && Object.values(game.guide.base).every(count))) return false;
  if (!list(game.families, code) || !game.families.length || game.families.length > MAX_FAMILIES) return false;
  if (!plain(game.cells) || Object.keys(game.cells).length > FILE.cells || !coreIn(game.cells)) return false;

  const rank = c => c.mk == null || [1, 2, 3].includes(c.mk);
  const known = c => c.type === 'core' || (Object.hasOwn(TYPES, c.type) && !hasTrait(c.type, 'noCell'));
  const pieces = c => count(c.hp) && side(c.dir)
    && (c.to == null || where(c.to)) && (c.box == null || Object.hasOwn(BOX, c.box)) && (c.side == null || [1, 3].includes(c.side))
    && (c.read == null || (Number.isInteger(c.read) && c.read >= 0 && c.read <= 6)) && (c.want == null || /^([SFCNKI?]|[SFCN?]{3}|[SFCN?]{6})$/.test(c.want))
    && (c.on == null || Object.hasOwn(MATTER, c.on)) && (c.ways == null || list(c.ways, w => w === null || side(w)))
    && (c.item == null || thing(c.item)) && (!c.last || thing(c.last)) && (c.from == null || c.from === -1 || side(c.from))
    && (c.turn == null || Number.isInteger(c.turn) && c.turn >= 0)
    && (c.when == null || Object.hasOwn(WHEN, c.when)) && (c.mode == null || DESK.modes.includes(c.mode)) && (c.gene == null || code(c.gene))
    && (c.level == null || [.25, .5, .75, 1].includes(c.level)) && (c.batch == null || BATCHES.includes(c.batch))
    && (c.passed == null || count(c.passed)) && (c.watch == null || where(c.watch)) && (c.source == null || where(c.source))
    && Array.isArray(c.ports) && c.ports.length === 3 && c.ports.every(port => list(port, thing))
    && list(c.stock, thing) && Array.isArray(c.made) && plain(c.ammo) && Object.entries(c.ammo).every(([gene, n]) => code(gene) && count(n))
    && (c.packets == null ? c.type !== 'pump' : list(c.packets, p => plain(p) && thing(p.item) && count(p.n) && p.n <= 64 && count(p.t)))
    && (c.lanes == null ? c.type !== 'bridge' : c.lanes.length === 2 && list(c.lanes, l => l === null || (plain(l) && thing(l.item) && side(l.dir) && count(l.t))))
    && (c.due == null || list(c.due, d => plain(d) && count(d.at) && side(d.from)))
    && (c.portDue == null || list(c.portDue, port => list(port, d => plain(d) && count(d.at) && side(d.from))))
    && (c.gulp == null || (thing(c.gulp.item) && side(c.gulp.from) && count(c.gulp.t)))
    && (c.up == null || (Object.hasOwn(RANKS, c.type) && count(c.up) && [2, 3].includes(c.upTo) && count(c.upPaid)));
  for (const [id, c] of Object.entries(game.cells)) if (!place(c) || id !== key(c.x, c.y) || !known(c) || !rank(c) || !pieces(c)) return false;

  if (game.ruins != null) {
    if (!plain(game.ruins)) return false;
    for (const [id, c] of Object.entries(game.ruins)) if (!place(c) || id !== key(c.x, c.y) || !known(c) || !rank(c) || (c.to != null && !where(c.to)) || (c.dir != null && !side(c.dir))) return false;
  }
  if (game.bigTracks != null && typeof game.bigTracks !== 'boolean') return false;
  if (game.tracks != null) {
    if (!plain(game.tracks)) return false;
    for (const [id, t] of Object.entries(game.tracks)) if (!place(t) || id !== key(t.x, t.y) || !side(t.dir)) return false;
  }
  if (game.worms != null && !list(game.worms, w => plain(w) && count(w.hp) && list(w.path, where) && w.path.length > 0 && w.path.length <= 7 && list(w.holds, h => plain(h) && count(h.n) && (!h.kind || thing(h.kind))) && w.holds.length >= 3 && w.holds.length <= 5)) return false;
  if (game.wires != null && !list(game.wires, w => plain(w) && where(w.a) && where(w.b) && count(w.hp) && (w.color == null || (Number.isInteger(w.color) && w.color >= 0 && w.color < NERVE_COLORS.length)))) return false;
  if (game.enemies != null && !list(game.enemies, e => spot(e) && code(e.gene) && (e.kind == null || Object.hasOwn(KINDS, e.kind)) && Number.isFinite(e.hp) && count(e.max) && (!e.goal || spot(e.goal)))) return false;
  if (game.shots != null && !list(game.shots, s => spot(s) && [1, 2, 5, 12].includes(s.hurt) && Number.isFinite(s.tx) && Number.isFinite(s.ty))) return false;
  if (game.breaches != null && !list(game.breaches, b => (b.hp == null || Number.isFinite(b.hp)) && (b.max == null || count(b.max)) && place(b) && count(b.r) && b.r < 40 && count(b.left) && count(b.total) && ['sleep', 'wake', 'spent'].includes(b.state) && list(b.genes, code) && b.genes.length > 0 && (b.form == null || side(b.form)) && (b.tier == null || (Number.isInteger(b.tier) && b.tier >= 0 && b.tier < LEVEL.total.length)) && (!b.post || spot(b.post)) && (!b.gene || code(b.gene)) && (!b.born || code(b.born)))) return false;
  if (game.drones != null && !(game.drones.length >= 1 && game.drones.length <= MOST_DRONES && list(game.drones, d => spot(d) && count(d.h) && count(d.w) && typeof d.job === 'string' && spot(d.was) && (!d.goal || spot(d.goal))))) return false;
  if (game.seen != null && !(plain(game.seen) && Object.entries(game.seen).every(([id, rows]) => where(id) && rows?.length === 16 && list(rows, n => Number.isInteger(n) && n >= 0 && n < 65536)))) return false;
  if (game.cleared != null && !list(game.cleared, id => typeof id === 'string')) return false;
  if (game.meals != null && !list(game.meals, count)) return false;
  if (game.won != null && !count(game.won)) return false;
  if (game.lab != null && !(plain(game.lab) && Object.entries(game.lab).every(([id, n]) => Object.hasOwn(UPGRADES, id) && Number.isInteger(n) && n >= 0 && n <= 4))) return false;
  if (game.goals != null && !(list(game.goals, g => plain(g) && thing(g.item) && count(g.count) && count(g.fed)) && game.goals.length <= 6)) return false;
  return true;
}
// Either one game, a whole planet, or a bare save.
function readFileGames(text) {
  if (text.length > FILE.bytes) return {error:L('Ce fichier est trop gros pour être une partie Strainworks.')};
  const data = parsed(text);
  if (!data || typeof data !== 'object') return {error:L('Ce fichier est illisible. Rien n’a été modifié.')};
  const many = data.format === FILE.all && Array.isArray(data.games);
  const found = many ? data.games : data.format === FILE.one ? [{name:data.name, game:data.game}] : [{name:'', game:data}];
  const fine = found.length > 0 && found.length <= CELLS_OF_GLOBE.length && found.every(one => {
    if (one?.name != null && typeof one.name !== 'string') return false;
    try { return checkGame(one?.game); } catch (_) { return false; }
  });
  return fine ? {found} : {error:L('Ce n’est pas une partie Strainworks valide. Rien n’a été modifié.')};
}
let downloads;
async function handFile(name, data) {
  const filename = `${name.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'partie'}.strainworks.json`;
  if (window.claude?.use) {
    downloads ??= await window.claude.use('downloads');
    if (!downloads) return L('Cette vue ne permet pas de télécharger. Ouvre le jeu dans claude.ai.');
    try {
      await downloads.save({filename, data});
      return L`${filename} exporté.`;
    } catch (error) {
      return error?.code === 'declined' ? L('Export annulé.') : L('Export impossible ici, réessaie dans un instant.');
    }
  }
  const link = document.createElement('a'), href = URL.createObjectURL(new Blob([data], {type:'application/json'}));
  link.href = href; link.download = filename;
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(href), 10000);
  return L`${filename} exporté.`;
}
async function exportGame(id) {
  const entry = readList().games[id], text = entry && stored(entry.key);
  if (!text) return L('Cette partie est introuvable.');
  const game = parsed(text);
  // Unreadable, it still leaves as it is.
  return handFile(entry.name, game ? JSON.stringify({format:FILE.one, v:1, name:entry.name, game}) : text);
}
async function exportAll() {
  const games = Object.values(readList().games).map(g => ({name:g.name, game:parsed(stored(g.key))})).filter(one => one.game);
  if (!games.length) return L('Aucune partie à exporter.');
  return handFile('planete', JSON.stringify({format:FILE.all, v:1, games}));
}

// ---- The opening screen. The globe and its grid share one rotation, the station projects the hexagon picked.
const ART = {space:'planet/space.webp', station:'planet/station.webp', ground:'planet/globe.webp', glow:'planet/globe-glow.webp', still:'planet/planet.webp'};
// Where the projector's lens is in the station's picture.
const LENS = {x:.3296, y:.5522};
const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit3 = v => { const n = Math.hypot(...v); return v.map(x => x / n); };
// The dual of a divided icosahedron: 150 hexagons and twelve pentagons.
function goldberg(freq) {
  const p = (1 + Math.sqrt(5)) / 2;
  const ico = [[-1,p,0],[1,p,0],[-1,-p,0],[1,-p,0],[0,-1,p],[0,1,p],[0,-1,-p],[0,1,-p],[p,0,-1],[p,0,1],[-p,0,-1],[-p,0,1]].map(unit3);
  const faces = [[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]];
  const points = [], known = new Map(), round = new Map();
  for (const [a, b, c] of faces) {
    const grid = [];
    for (let i = 0; i <= freq; i++) {
      grid[i] = [];
      for (let j = 0; j <= freq - i; j++) {
        const v = unit3([0, 1, 2].map(k => ico[a][k] * (freq - i - j) / freq + ico[b][k] * i / freq + ico[c][k] * j / freq));
        const id = v.map(x => Math.round(x * 1e5)).join();
        if (!known.has(id)) { known.set(id, points.length); points.push(v); }
        grid[i][j] = known.get(id);
      }
    }
    for (let i = 0; i < freq; i++) for (let j = 0; j < freq - i; j++) {
      const tris = [[grid[i][j], grid[i + 1][j], grid[i][j + 1]]];
      if (i + j < freq - 1) tris.push([grid[i + 1][j], grid[i + 1][j + 1], grid[i][j + 1]]);
      for (const tri of tris) {
        const mid = unit3([0, 1, 2].map(k => points[tri[0]][k] + points[tri[1]][k] + points[tri[2]][k]));
        for (const at of tri) round.set(at, [...(round.get(at) || []), mid]);
      }
    }
  }
  // Set askew as in the mockup, so no pole faces the player.
  const askew = ([x, y, z]) => {
    const up = y * Math.cos(.3) - z * Math.sin(.3), near = y * Math.sin(.3) + z * Math.cos(.3);
    return [x * Math.cos(.17) + near * Math.sin(.17), up, -x * Math.sin(.17) + near * Math.cos(.17)];
  };
  return points.map((point, at) => {
    const c = askew(point), e1 = unit3(cross3([.31, .9, .17], c)), e2 = cross3(c, e1);
    const ring = round.get(at).map(askew).sort((u, v) => Math.atan2(dot3(u, e2), dot3(u, e1)) - Math.atan2(dot3(v, e2), dot3(v, e1)));
    return {c, ring, size:ring.reduce((sum, q) => sum + Math.hypot(q[0] - c[0], q[1] - c[1], q[2] - c[2]), 0) / ring.length};
  });
}
const CELLS_OF_GLOBE = goldberg(4);
// New games take the mockup's places first, then whatever faces the player most.
const PREFERRED = (() => {
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
const DEMO_HEX = PREFERRED[1];

const orbit = {on:false, yaw:0, pitch:0, to:null, pick:null, list:null, incoming:null, dirty:true, drag:null, gl:null, box:null, seenAt:0};
function layoutPlanet() {
  const w = view.w, h = view.h, low = h <= 520 && w > h * 1.3, wide = !low && w >= 760 && w / h > 1.1;
  const panel = $('projection').style;
  let box;
  if (wide) {
    const ss = Math.min(h * .62, w * .39), pw = Math.min(590, w * .43);
    box = {cx:Math.min(h * .289, w * .2), cy:h * .567, r:h * .586, sx:w - ss - w * .035, sy:h * .011, ss};
    Object.assign(panel, {left:`${w - pw - w * .035}px`, width:`${pw}px`, bottom:`${h * .045}px`, minHeight:'0'});
  } else if (low) {
    const ss = h * .46, pw = Math.min(420, w * .52);
    box = {cx:w * .17, cy:h * .55, r:h * .68, sx:w - ss - 70, sy:0, ss};
    Object.assign(panel, {left:`${w - pw - 8}px`, width:`${pw}px`, bottom:'6px', minHeight:'0'});
  } else {
    const r = Math.min(w * .77, h * .5), ss = Math.min(w * .374, 240), pw = Math.min(w - 16, 560);
    box = {cx:w * .236, cy:Math.max(r * .95, h * .42), r, sx:w * .57, sy:40, ss};
    Object.assign(panel, {left:`${(w - pw) / 2}px`, width:`${pw}px`, bottom:'calc(6px + var(--b))', minHeight:'0'});
  }
  for (const id of ['station', 'station-live']) Object.assign($(id).style, {left:`${box.sx}px`, top:`${box.sy}px`, width:`${box.ss}px`, height:`${box.ss}px`});
  station3d.st?.resize();
  const side = box.r / 556 * 1180;
  Object.assign($('globe-still').style, {left:`${box.cx - side / 2}px`, top:`${box.cy - side / 2}px`, width:`${side}px`, height:`${side}px`});
  box.lens = [box.sx + box.ss * LENS.x, box.sy + box.ss * LENS.y];
  orbit.box = box; orbit.dirty = true;
}
function turn([x, y, z]) {
  const a = Math.cos(orbit.yaw), b = Math.sin(orbit.yaw), c = Math.cos(orbit.pitch), d = Math.sin(orbit.pitch);
  const away = -x * b + z * a;
  return [x * a + z * b, y * c - away * d, y * d + away * c];
}
function onScreen(v) { return [orbit.box.cx + orbit.box.r * v[0], orbit.box.cy - orbit.box.r * v[1]]; }
function hexAt(x, y) {
  const u = (x - orbit.box.cx) / orbit.box.r, v = -(y - orbit.box.cy) / orbit.box.r, d = u * u + v * v;
  if (d > 1) return null;
  const at = [u, v, Math.sqrt(1 - d)];
  let best = 0, close = -2;
  CELLS_OF_GLOBE.forEach((cell, id) => { const near = dot3(turn(cell.c), at); if (near > close) { close = near; best = id; } });
  return best;
}
// Turns the planet until that hexagon is where the beam likes it, if it is not already in view.
function faceHex(id, force) {
  const v = turn(CELLS_OF_GLOBE[id].c), [x, y] = onScreen(v);
  const panelTop = $('projection').getBoundingClientRect().top || view.h;
  if (!force && v[2] > .4 && x > 24 && x < view.w - 24 && y > 60 && y < Math.max(120, view.h < view.w ? view.h - 30 : panelTop - 20)) return;
  const [cx, cy, cz] = CELLS_OF_GLOBE[id].c, flatR = Math.hypot(cx, cz), tx = flatR > .4 ? .32 : 0, ty = .3;
  let yaw = Math.atan2(tx, Math.sqrt(Math.max(0, flatR * flatR - tx * tx))) - Math.atan2(cx, cz);
  const depth = Math.sqrt(Math.max(1e-6, flatR * flatR - tx * tx));
  const pitch = within(Math.atan2(cy, depth) - Math.atan2(ty, Math.sqrt(1 - tx * tx - ty * ty)), -1.35, 1.35);
  while (yaw - orbit.yaw > Math.PI) yaw -= Math.PI * 2;
  while (yaw - orbit.yaw < -Math.PI) yaw += Math.PI * 2;
  if (STILL.matches) Object.assign(orbit, {yaw, pitch, to:null, dirty:true});
  else orbit.to = {yaw, pitch};
}

// ---- What a game looks like from orbit: more of it the farther it went.
function dotsOf(points) { return points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' '); }
function settlementSVG(to, game, seed, k) {
  const tier = game.over ? 5 : within((Number(game.stage) || 0) + 1, 1, 4), roll = n => spotHash(Number(seed) || 0, n, 77);
  const [base, spread] = [[3, .45], [6, .62], [9, .74], [14, .82], [6, .62]][tier - 1];
  const arms = base + within(Math.floor((Number(game.built) || 0) / 180), 0, 4), dead = tier === 5, ends = [], out = [];
  const glow = (points, color, width, extra = '') => out.push(`<polyline class="glow" points="${dotsOf(points.map(p => to(...p)))}" fill="none" stroke="${color}" stroke-width="${(width * 3.2 * k).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"${extra}/>`);
  const pulse = (points, color, width, i) => out.push(`<polyline class="pulse" style="animation-duration:${(1.8 + roll(i + 300) * 1.6).toFixed(2)}s;animation-delay:-${(roll(i + 400) * 3).toFixed(2)}s" points="${dotsOf(points.map(p => to(...p)))}" fill="none" stroke="${color}" stroke-width="${(width * 1.4 * k).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${(2 * k).toFixed(1)} ${(16 * k).toFixed(1)}"/>`);
  const line = (points, color, width) => out.push(`<polyline points="${dotsOf(points.map(p => to(...p)))}" fill="none" stroke="${color}" stroke-width="${(width * k).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/>`);
  const spotted = (p, color, size, cls = '') => {
    const [x, y] = to(...p);
    out.push(`<circle class="${cls}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(size * k).toFixed(1)}" fill="${color}"/>`);
  };
  for (let i = 0; i < arms; i++) {
    const a = i * 2.39996 + roll(i) * .3, long = spread * (.55 + roll(i + 40) * .45), x = Math.cos(a) * long, y = Math.sin(a) * long;
    const rail = dead ? '#6B2531' : game.rank >= 3 && i % 4 === 0 ? '#A45CF0' : game.rank >= 2 && i % 3 === 0 ? '#F0A03C' : '#66D9EA';
    const path = i % 2 ? [[0, 0], [x, 0], [x, y]] : [[0, 0], [0, y], [x, y]];
    if (!dead) glow(path, rail, 1.5);
    line(path, rail, 1.5);
    if (!dead || i === 0) pulse(path, dead ? '#FF6B74' : '#E9F3EF', 1.5, i);
    spotted([x, y], dead ? (i % 3 ? '#4A1B25' : '#FF6B74') : ['#B7F34A', '#F0A03C', '#F3E6C8', '#66D9EA'][i % 4], 2.6, dead ? '' : `twinkle t${i % 4}`);
    ends.push([x, y]);
  }
  if (tier === 3 || tier === 4) ends.forEach(([x, y], i) => {
    line([[x, y], ends[(i + 3) % ends.length]], '#66D9EA59', .8);
    for (let j = 0; j < 3; j++) {
      const bx = x + (roll(i * 3 + j + 100) - .5) * .22, by = y + (roll(i * 3 + j + 200) - .5) * .22;
      line([[bx, by], [bx + .06, by]], '#E9F3EF', 1.6);
    }
  });
  // A crown of outposts: past the last stage, or out in the far levels.
  if (tier === 4 || (!dead && game.level > 1)) {
    const ring = Array.from({length:25}, (_, i) => [Math.cos(i * Math.PI / 12) * .88, Math.sin(i * Math.PI / 12) * .88]);
    line(ring, '#B7F34A', 1.1);
    for (let i = 0; i < 24; i += Math.max(2, 7 - within(Number(game.level) || 1, 1, 5))) spotted(ring[i], '#E9F3EF', 2);
  }
  if (dead) line([[-.6, .5], [-.2, .15], [-.1, -.2], [.2, -.1], [.55, -.6]], '#0A0405', 3);
  const core = [4, 6, 8, 10, 6][tier - 1];
  if (!dead) { spotted([0, 0], '#B7F34A1F', core * 3.2, 'breath'); spotted([0, 0], '#B7F34A33', core * 2, 'breath late'); }
  spotted([0, 0], dead ? '#32151C' : '#366426', core + 2.5);
  spotted([0, 0], dead ? '#FF6B74' : '#B7F34A', core * .7, 'heartbeat');
  return out.join('');
}
function drawGrid() {
  const {r, lens} = orbit.box, games = orbit.list.games;
  let grid = '', taken = '', picked = '', hovered = '';
  // The beam has soft edges: a blur, not a cut-out triangle.
  let defs = '<defs><filter id="beam-soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="7"/></filter></defs>';
  const buttons = new Map([...$('games').children].map(b => [b.dataset.hex, b]));
  CELLS_OF_GLOBE.forEach(({c, ring, size}, id) => {
    const v = turn(c), b = buttons.get(String(id));
    if (b) {
      const [x, y] = onScreen(v);
      b.style.left = `${x}px`; b.style.top = `${y}px`;
    }
    if (v[2] < .08) return;
    const turned = ring.map(q => onScreen(unit3(turn([0, 1, 2].map(k => c[k] * .06 + q[k] * .94)))));
    const shape = dotsOf(turned), game = games[id];
    grid += `<polygon class="grid" points="${shape}" stroke-opacity="${(.06 + v[2] * .24).toFixed(2)}"/>`;
    if (game) {
      const e1 = unit3(cross3([0, 1, .001], c)), e2 = cross3(c, e1);
      const to = (u, w) => onScreen(turn(unit3([0, 1, 2].map(k => c[k] + e1[k] * u * size + e2[k] * w * size))));
      taken += `<polygon class="taken${game.demo ? ' demo' : game.over ? ' fallen' : game.fight ? ' fight' : ''}" points="${shape}"/>${settlementSVG(to, game, id, r / 527.7)}`;
      if (game.demo) { const [bx, by] = to(0, -.55); taken += `<g class="demo-badge"><rect x="${(bx - 19).toFixed(1)}" y="${(by - 8).toFixed(1)}" width="38" height="15" rx="7.5"/><text x="${bx.toFixed(1)}" y="${(by + 3.5).toFixed(1)}">${L('DÉMO')}</text></g>`; }
    }
    if (id === orbit.hover && id !== orbit.pick) hovered = `<polygon class="hover" points="${shape}"/>`;
    if (id !== orbit.pick) return;
    const [x, y] = onScreen(v);
    // The cone is the two edges the lens sees widest apart.
    const aim = Math.atan2(y - lens[1], x - lens[0]);
    const off = ([px, py]) => Math.sin(Math.atan2(py - lens[1], px - lens[0]) - aim);
    const left = turned.reduce((a, q) => off(q) < off(a) ? q : a), right = turned.reduce((a, q) => off(q) > off(a) ? q : a);
    defs = `<defs><filter id="beam-soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="7"/></filter><linearGradient id="beam-light" gradientUnits="userSpaceOnUse" x1="${lens[0]}" y1="${lens[1]}" x2="${x}" y2="${y}"><stop offset="0" stop-color="#9FE6F0" stop-opacity=".5"/><stop offset=".35" stop-color="#66D9EA" stop-opacity=".18"/><stop offset="1" stop-color="#66D9EA" stop-opacity=".05"/></linearGradient></defs>`;
    picked = `<polygon class="beam" points="${dotsOf([lens, left, right])}" fill="url(#beam-light)" filter="url(#beam-soft)"/><line class="flow" x1="${lens[0]}" y1="${lens[1]}" x2="${x}" y2="${y}"/><polygon class="lit" points="${shape}"/>`;
  });
  const panel = $('projection').getBoundingClientRect();
  const down = dotsOf([lens, [panel.left + panel.width * .14, panel.top + 8], [panel.left + panel.width * .86, panel.top + 8]]);
  $('hexes').setAttribute('viewBox', `0 0 ${view.w} ${view.h}`);
  $('hexes').innerHTML = `${defs}${grid}${taken}${hovered}<polygon class="beam" points="${down}" fill="#66D9EA14" filter="url(#beam-soft)"/>${picked}`;
}

// ---- The globe: one quad, the sphere worked out for each point of it.
const GLOBE_SHADER = `precision highp float;
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
function globeFailed(error) {
  orbit.gl = null;
  $('globe').hidden = true;
  $('globe-still').src = ART.still;
  $('globe-still').hidden = false;
  console.warn('planet without WebGL:', error?.message || error);
}
function makeGlobe() {
  try {
    const gl = $('globe').getContext('webgl', {premultipliedAlpha:true, antialias:false});
    if (!gl) return globeFailed('no context');
    const program = gl.createProgram();
    for (const [kind, text] of [[gl.VERTEX_SHADER, 'attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }'], [gl.FRAGMENT_SHADER, GLOBE_SHADER]]) {
      const part = gl.createShader(kind);
      gl.shaderSource(part, text); gl.compileShader(part);
      if (!gl.getShaderParameter(part, gl.COMPILE_STATUS)) return globeFailed(gl.getShaderInfoLog(part));
      gl.attachShader(program, part);
    }
    gl.bindAttribLocation(program, 0, 'p');
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return globeFailed('link');
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const at = {};
    for (const name of ['size', 'centre', 'radius', 'back', 'ground', 'glow']) at[name] = gl.getUniformLocation(program, name);
    const made = {gl, at, ready:0};
    [['ground', ART.ground], ['glow', ART.glow]].forEach(([name, src], i) => {
      const picture = new Image();
      picture.onerror = () => globeFailed(`no ${name}`);
      picture.onload = () => {
        try {
          gl.activeTexture(gl.TEXTURE0 + i);
          gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, picture);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.uniform1i(at[name], i);
          made.ready++; orbit.dirty = true;
        } catch (error) { globeFailed(error); }
      };
      picture.src = src;
    });
    $('globe').addEventListener('webglcontextlost', () => globeFailed('context lost'));
    orbit.gl = made;
  } catch (error) { globeFailed(error); }
}
function drawGlobe() {
  if (!orbit.gl || orbit.gl.ready < 2) return;
  const {gl, at} = orbit.gl, canvasOf = $('globe'), dpr = Math.min(1.6, window.devicePixelRatio || 1);
  const w = Math.round(view.w * dpr), h = Math.round(view.h * dpr);
  if (canvasOf.width !== w || canvasOf.height !== h) { canvasOf.width = w; canvasOf.height = h; }
  gl.viewport(0, 0, w, h);
  gl.uniform2f(at.size, w, h);
  gl.uniform2f(at.centre, orbit.box.cx * dpr, orbit.box.cy * dpr);
  gl.uniform1f(at.radius, orbit.box.r * dpr);
  // The columns of the matrix back are the rows of the one turn() applies.
  const x = turn([1, 0, 0]), y = turn([0, 1, 0]), z = turn([0, 0, 1]);
  gl.uniformMatrix3fv(at.back, false, new Float32Array([x[0], y[0], z[0], x[1], y[1], z[1], x[2], y[2], z[2]]));
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}
// The live station: the picture stands in until it is ready, and for good if the engine cannot load.
const station3d = {st:null, loading:false};
async function wakeStation() {
  if (station3d.st || station3d.loading) return;
  station3d.loading = true;
  try {
    if (!window.BABYLON) await script(BABYLON_SRC, BABYLON_HASH);
    if (!window.createStation3D) await script('station3d.js');
    if (!orbit.on || station3d.st) return;
    $('station-live').hidden = false;
    station3d.st = window.createStation3D($('station-live'), {still:STILL.matches});
    station3d.st.resize();
    $('station').hidden = true;
    orbit.dirty = true;
  } catch (error) {
    $('station-live').hidden = true;
    console.warn('the station stays a picture:', error.message);
  } finally {
    station3d.loading = false;
  }
}
// Leaving the planet frees the station's graphics for the game.
function sleepStation() {
  station3d.st?.dispose();
  station3d.st = null;
  $('station-live').hidden = true;
  $('station').hidden = false;
}
// The title's letters and helix, made once.
(() => {
  const h1 = $('brand').querySelector('h1');
  h1.innerHTML = [...h1.textContent].map((c, i) => `<span class="l" aria-hidden="true" style="--i:${i}">${c}</span>`).join('');
  // The strands drawn three periods wider than shown, so sliding one period loops without a seam.
  const strand = k => { let d = ''; for (let x = 0; x <= 150; x += 1.5) d += `${x ? 'L' : 'M'}${x} ${(11 + Math.sin(x / 100 * Math.PI * 6 + k * Math.PI) * 8).toFixed(2)}`; return d; };
  h1.insertAdjacentHTML('afterend', `<svg class="helix" viewBox="0 0 100 22" preserveAspectRatio="none" aria-hidden="true"><clipPath id="helix-in"><rect width="100" height="22"/></clipPath><g clip-path="url(#helix-in)"><path class="a" d="${strand(0)}"/><path class="b" d="${strand(1)}"/></g></svg>`);
})();
// Spores and grain run only while the planet is on screen, fewer on a phone, none with reduced motion.
const fx = {motes:null, last:0, grainAt:0, seed:12345};
// The finish draws its own chance: the game's Math.random stays the game's, so a seeded game plays the same.
const fxRandom = () => (fx.seed = fx.seed * 16807 % 2147483647) / 2147483647;
function drawFx(now) {
  if (!orbit.on || STILL.matches) return;
  const sp = $('spores'), w = innerWidth, h = innerHeight;
  if (sp.width !== w || sp.height !== h) { sp.width = w; sp.height = h; }
  fx.motes ||= Array.from({length:NARROW.matches ? 30 : 70}, () => ({x:fxRandom() * w, y:fxRandom() * h, z:fxRandom() ** 2, p:fxRandom() * 6}));
  const dt = Math.min(.1, (now - (fx.last || now)) / 1000), g = sp.getContext('2d');
  fx.last = now;
  g.clearRect(0, 0, w, h);
  for (const m of fx.motes) {
    m.y -= (8 + m.z * 40) * dt; m.x += Math.sin(now / 1400 + m.p) * (4 + m.z * 10) * dt;
    if (m.y < -20) { m.y = h + 20; m.x = fxRandom() * w; }
    const r = (1 + m.z * 4) * 4, a = .25 + .5 * (1 - m.z) * (.6 + .4 * Math.sin(now / 500 + m.p));
    const glow = g.createRadialGradient(m.x, m.y, 0, m.x, m.y, r);
    glow.addColorStop(0, m.p > 3 ? `rgba(183,243,74,${a})` : `rgba(85,214,232,${a})`); glow.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = glow; g.beginPath(); g.arc(m.x, m.y, r, 0, Math.PI * 2); g.fill();
  }
  if (!NARROW.matches && now - fx.grainAt > 83) {
    fx.grainAt = now;
    const gr = $('grain').getContext('2d'), img = fx.grain ||= gr.createImageData(320, 200);
    for (let i = 0; i < img.data.length; i += 4) { const v = fxRandom() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
    gr.putImageData(img, 0, 0);
  }
}
function drawPlanet(elapsed) {
  drawFx(performance.now());
  if (station3d.st && orbit.box) {
    station3d.st.draw(elapsed);
    const [x, y] = station3d.st.lens(), b = orbit.box, lens = [b.sx + b.ss * x, b.sy + b.ss * y];
    if (Math.hypot(lens[0] - b.lens[0], lens[1] - b.lens[1]) > .5) { b.lens = lens; orbit.dirty = true; }
  }
  if (orbit.to) {
    const by = Math.min(1, elapsed * 4.5), {yaw, pitch} = orbit.to;
    orbit.yaw += (yaw - orbit.yaw) * by; orbit.pitch += (pitch - orbit.pitch) * by;
    if (Math.abs(yaw - orbit.yaw) + Math.abs(pitch - orbit.pitch) < .002) Object.assign(orbit, {yaw, pitch, to:null});
    orbit.dirty = true;
  }
  if (!orbit.dirty || !orbit.box) return;
  orbit.dirty = false;
  drawGlobe(); drawGrid();
}

// ---- The projection
function holdToDo(b, done) {
  let wait = 0, twice = 0;
  const stop = () => { clearTimeout(wait); b.classList.remove('holding'); };
  const start = () => { stop(); b.classList.add('holding'); wait = setTimeout(() => { stop(); done(); }, 1000); };
  b.onpointerdown = start;
  for (const name of ['pointerup', 'pointercancel', 'pointerleave', 'blur']) b.addEventListener(name, stop);
  b.onkeydown = event => { if (event.key !== 'Enter') return; event.preventDefault(); if (!event.repeat) start(); };
  b.onkeyup = event => { if (event.key === 'Enter') stop(); };
  // A screen reader cannot hold: it presses twice.
  b.onclick = event => {
    if (event.detail) return;
    if (Date.now() < twice) done(); else twice = Date.now() + 3000;
  };
}
function noteOnPlanet(text, bad) {
  $('slot-note').textContent = text;
  $('slot-note').classList.toggle('bad', Boolean(bad));
  orbit.dirty = true;
}
function durationText(seconds) {
  const min = Math.floor((Number(seconds) || 0) / 60);
  return min < 60 ? `${min} min` : `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')}`;
}
function stageText(game) {
  const stage = within(Math.floor(Number(game.stage) || 0), 0, STAGES.length);
  if (game.over) return L`Le cœur est tombé au stade ${Math.min(STAGES.length, stage + 1)}`;
  const far = game.level > 1 ? L` · avant-postes au niveau ${game.level}` : '';
  if (game.won != null) return L('Éclosion · victoire') + far;
  return (stage === STAGES.length ? L`Stade ${stage} achevé` : L`Stade ${stage + 1} · ${STAGES[stage].name}`) + far;
}
function projectSlot(note = '', bad = false) {
  const id = orbit.pick, game = orbit.list.games[id], incoming = !game && orbit.incoming;
  const first = incoming && {name:incoming[0].name || L('Partie sans nom'), ...summaryOf(incoming[0].game)};
  const shown = game || first, box = $('projection');
  box.classList.toggle('free', !shown);
  box.classList.toggle('fallen', Boolean(shown?.over));
  $('slot-kicker').textContent = incoming ? L('Fichier reçu') : !game ? L('Hexagone libre') : game.demo ? L('Démo · repart à neuf à chaque lancement') : game.over ? L('Station tombée') : game.fight ? L('En combat') : L('Partie en cours');
  $('slot-kicker').classList.toggle('fight', Boolean(game?.fight && !game.over && !game.demo));
  $('slot-name').textContent = incoming?.length > 1 ? L`${incoming.length} parties` : shown ? shown.name : L('Terre vierge');
  $('slot-sub').textContent = incoming?.length > 1 ? L('Elles prendront les hexagones libres autour de celui-ci.') : shown ? stageText(shown) : L('Fonde une station, ou greffes-y une partie exportée.');
  const six = dotsOf(Array.from({length:6}, (_, i) => [66 + Math.cos(i * Math.PI / 3) * 63, 66 + Math.sin(i * Math.PI / 3) * 63]));
  const color = !shown ? '#B7F34A' : shown.over ? '#FF6B74' : '#66D9EA';
  const inner = shown ? settlementSVG((u, v) => [66 + u * 55, 66 - v * 55], shown, id, .85) : '<path d="M52 66h28M66 52v28" stroke="#B7F34A" stroke-width="3"/>';
  $('slot-icon').innerHTML = `<polygon points="${six}" fill="#040A0C99" stroke="${color}" stroke-width="1.5"/>${inner}`;
  const facts = game ? [[durationText(game.played), L('de jeu')], [Math.floor(Number(game.dna) || 0).toLocaleString(LOCALE), L('ADN')], [Number(game.spent) || 0, L('nids détruits')], [(Number(game.kills) || 0).toLocaleString(LOCALE), L('tuées')]] : [];
  $('slot-facts').replaceChildren(...facts.map(([value, label]) => {
    const p = document.createElement('p'), b = document.createElement('b');
    b.textContent = value; p.append(b, label);
    return p;
  }));
  $('slot-actions').replaceChildren();
  const act = (label, cls, done, held) => {
    const b = document.createElement('button');
    b.className = `act ${cls}`; b.textContent = label;
    if (held) { b.append(document.createElement('i')); holdToDo(b, done); } else b.onclick = done;
    $('slot-actions').append(b);
  };
  const gone = () => {
    if (!eraseGame(id)) return noteOnPlanet(L('Impossible d’effacer cette partie.'), true);
    orbit.list = planetList(); nameGames(); projectSlot(L('Hexagone libéré.'));
  };
  if (incoming) {
    act(incoming.length > 1 ? L`Greffer les ${incoming.length} parties` : L('Greffer dans cet hexagone'), 'go', () => {
      const made = graftGames(orbit.incoming, orbit.pick);
      if (made == null) return noteOnPlanet(L('Import impossible : le stockage du navigateur est plein, ou la planète l’est.'), true);
      orbit.incoming = null; orbit.list = planetList(); nameGames();
      pickHex(Number(made), L('Greffe réussie.'));
    });
    act(L('Annuler'), '', () => { orbit.incoming = null; projectSlot(); });
  } else if (!game) {
    act(L('Fonder une station'), 'go', () => leavePlanet(() => foundGame(orbit.pick)));
    act(L('Importer un fichier'), '', () => $('file').click());
    act(L('Tout exporter'), '', async () => noteOnPlanet(await exportAll()));
  } else if (game.demo) {
    // Fetched only once its hexagon is picked: the planet opens without it.
    if (!window.DEMO_GAME) loadDemo().then(() => { if (orbit.pick === DEMO_HEX) projectSlot(); });
    act(window.DEMO_GAME ? L('Lancer la démo') : L('Démo en chargement…'), 'go', () => { if (window.DEMO_GAME) playPicked(); else loadDemo().then(() => projectSlot()); });
  } else {
    if (game.over) {
      act(L('Refonder ici : maintenir'), 'go', () => { if (eraseGame(id)) leavePlanet(() => foundGame(id)); }, true);
    } else act(L('Reprendre'), 'go', () => playPicked());
    act(L('Exporter'), '', async () => noteOnPlanet(await exportGame(id)));
    if (!game.over) act(L('Dupliquer'), '', () => {
      const copy = parsed(stored(game.key));
      const made = copy && graftGames([{name:L`${game.name} bis`, game:copy}], freeHex(orbit.list, id));
      if (made == null) return noteOnPlanet(L('Copie impossible : partie illisible ou stockage plein.'), true);
      orbit.list = planetList(); nameGames();
      pickHex(Number(made), L('Copie faite.'));
    });
    act(L('Effacer : maintenir'), 'bad', gone, true);
  }
  noteOnPlanet(note || (incoming ? L('Rien n’est écrit avant ta validation. Aucune partie n’est écrasée.') : ''), bad);
}
// The drawn hexagons are for pointers, these for keyboards and screen readers.
function nameGames() {
  $('games').replaceChildren(...Object.entries(orbit.list.games).map(([id, game]) => {
    const b = document.createElement('button');
    b.dataset.hex = id;
    b.setAttribute('aria-label', `${game.name}, ${stageText(game)}`);
    b.onclick = () => pickHex(Number(id));
    b.onfocus = () => faceHex(Number(id));
    return b;
  }));
  orbit.dirty = true;
}
function pickHex(id, note) {
  if (orbit.pick !== id) playSound('hex');
  orbit.pick = id;
  // What came in a file waits for a free hexagon.
  if (orbit.incoming && orbit.list.games[id]) orbit.incoming = null;
  replay($('projection'), 'open');
  projectSlot(note);
  faceHex(id);
}
async function takeFile(file) {
  if (!file) return;
  showMenu(false);
  if (file.size > FILE.bytes) return noteOnPlanet(L('Ce fichier est trop gros pour être une partie Strainworks.'), true);
  let text;
  try { text = await file.text(); } catch (_) { return noteOnPlanet(L('Ce fichier n’a pas pu être lu.'), true); }
  if (!orbit.on) return;
  const {found, error} = readFileGames(text);
  if (error) return noteOnPlanet(error, true);
  const id = orbit.list.games[orbit.pick] ? freeHex(orbit.list, orbit.pick) : orbit.pick;
  if (id == null || Object.keys(orbit.list.games).length + found.length > CELLS_OF_GLOBE.length) return noteOnPlanet(L('Pas assez d’hexagones libres.'), true);
  orbit.incoming = found;
  pickHex(id);
}

// ---- In and out
function backgroundInert(on) {
  for (const el of $('app').children) if (!['planet', 'menu', 'commands', 'file', 'lang-pick'].includes(el.id)) el.inert = on;
}
function openPlanet(intro) {
  if (slotKey) save();
  orbit.on = true;
  slotKey = slotId = null;
  arrows.clear(); gesture = null; drag = null;
  showMenu(false);
  orbit.list = planetList();
  orbit.incoming = null;
  const last = Number(orbit.list.last), mine = Object.keys(orbit.list.games).filter(id => Number(id) !== DEMO_HEX);
  orbit.pick = orbit.list.last != null && orbit.list.games[last] ? last : Number(mine[0] ?? PREFERRED[0]);
  if (demoMoved) { demoMoved = false; setTimeout(() => noteOnPlanet(L('Ta partie a été déplacée sur un hexagone voisin pour laisser place à la démo.')), 0); }
  if (!$('station').src) {
    $('space').src = ART.space; $('station').src = ART.station;
    makeGlobe();
  }
  const el = $('planet');
  el.classList.remove('leaving');
  el.hidden = false;
  $('app').classList.add('on-planet');
  backgroundInert(true);
  nameGames(); projectSlot(); layoutPlanet();
  orbit.yaw = orbit.pitch = 0; orbit.to = null;
  faceHex(orbit.pick);
  if (intro && !STILL.matches) {
    // It swings in from its far side.
    const to = orbit.to || {yaw:0, pitch:0};
    orbit.yaw = to.yaw - 1.1; orbit.pitch = to.pitch + .25; orbit.to = to;
  }
  wakeStation();
}
// enter readies the game and says whether it could.
function leavePlanet(enter, at) {
  if (!orbit.on) return false;
  orbit.on = false;
  if (!enter()) {
    orbit.on = true;
    return false;
  }
  const el = $('planet'), [x, y] = onScreen(turn(CELLS_OF_GLOBE[slotId].c));
  $('app').classList.remove('on-planet');
  backgroundInert(false);
  showMenu(false);
  orbit.seenAt = performance.now();
  el.style.transformOrigin = `${x}px ${y}px`;
  // The live station stays through the zoom: its picture is an older model.
  if (at === 'now' || STILL.matches) { el.hidden = true; sleepStation(); }
  else {
    playSound('zoom');
    el.classList.add('leaving');
    setTimeout(() => { if (!orbit.on) { el.hidden = true; sleepStation(); } }, 720);
  }
  resize(); home();
  canvas.focus({preventScroll:true});
  // 3D unless the player picked 2D.
  if (stored(VIEW_KEY) !== '2d' && !view3d) show3D(true);
  return true;
}
function playPicked(at) {
  const id = orbit.pick;
  if (!leavePlanet(() => openGame(id), at)) projectSlot(L('Cette partie est illisible. Elle n’a pas été modifiée : exporte-la ou efface-la.'), true);
}
// The last game played, or a first one.
function resumeLast() {
  if (!orbit.on) return;
  const game = orbit.list.games[orbit.pick];
  if (game && !game.over) playPicked('now');
  else leavePlanet(() => foundGame(game ? null : orbit.pick), 'now');
}

$('hexes').addEventListener('pointerdown', event => {
  try { $('hexes').setPointerCapture(event.pointerId); } catch (_) {}
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
const PERF_KEY = 'strainworks-perf';
const PERF_KINDS = [['sim', L('Simulation'), '#418EE8'], ['fog', L('Brouillard'), '#9C8CF0'], ['draw', 'Dessin 2D', '#E6C94C'],
  ['three', 'Vue 3D', '#E07CC8'], ['ui', L('Interface'), '#45BFC9'], ['save', L('Sauvegarde'), '#F49445']];
const PERF = {on:false, stack:[], cost:{}, frames:0, gaps:0, frameSum:0, framePeak:0, cpu:0, cpuPeak:0, since:0, lastFrame:0, history:[]};
const perfZero = () => Object.fromEntries(PERF_KINDS.map(([id]) => [id, 0]));
// Exclusive time: what a nested scope costs is taken off its parent.
function timed(kindOf, f) {
  return function (...args) {
    if (!PERF.on) return f.apply(this, args);
    const kind = typeof kindOf === 'function' ? kindOf() : kindOf, scope = {since:performance.now(), inner:0};
    PERF.stack.push(scope);
    try { return f.apply(this, args); }
    finally {
      const spent = performance.now() - scope.since;
      PERF.stack.pop();
      PERF.cost[kind] += spent - scope.inner;
      if (PERF.stack.length) PERF.stack.at(-1).inner += spent;
    }
  };
}
simSet.step(timed('sim', step));
simSet.look(timed('fog', look));
drawFog = timed('fog', drawFog);
draw = timed(() => view3d ? 'three' : 'draw', draw);
refresh = timed('ui', refresh);
animateHud = timed('ui', animateHud);
layoutHud = timed('ui', layoutHud);
save = timed('save', save);

function perfReset() {
  Object.assign(PERF, {stack:[], cost:perfZero(), frames:0, gaps:0, frameSum:0, framePeak:0, cpu:0, cpuPeak:0, since:performance.now(), lastFrame:0, history:[]});
}
// Called once a frame, after it is drawn: one sample every 100 ms, averaged per frame.
function perfFrame(now, cpu) {
  if (!PERF.on || document.hidden) return;
  if (PERF.lastFrame) { const gap = now - PERF.lastFrame; PERF.gaps++; PERF.frameSum += gap; PERF.framePeak = Math.max(PERF.framePeak, gap); }
  PERF.lastFrame = now;
  PERF.frames++; PERF.cpu += cpu; PERF.cpuPeak = Math.max(PERF.cpuPeak, cpu);
  if (now - PERF.since < 100) return;
  const n = PERF.frames, costs = Object.fromEntries(Object.entries(PERF.cost).map(([id, ms]) => [id, ms / n]));
  PERF.history.push({at:now, costs, gpu:view3d?.gpu?.() ?? null, cpu:PERF.cpu / n, cpuPeak:PERF.cpuPeak, frame:PERF.gaps ? PERF.frameSum / PERF.gaps : 0, framePeak:PERF.framePeak});
  while (PERF.history.length && PERF.history[0].at < now - 30000) PERF.history.shift();
  Object.assign(PERF, {cost:perfZero(), frames:0, gaps:0, frameSum:0, framePeak:0, cpu:0, cpuPeak:0, since:now});
  drawPerf();
}
function drawPerf() {
  const canvas = $('perf-chart'), width = canvas.clientWidth, height = 150;
  if (!width) return;
  const ratio = Math.min(window.devicePixelRatio || 1, 2), g = canvas.getContext('2d');
  if (canvas.width !== Math.round(width * ratio)) { canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio); }
  g.setTransform(ratio, 0, 0, ratio, 0, 0);
  g.clearRect(0, 0, width, height);
  const list = PERF.history, last = list.at(-1), now = last?.at ?? performance.now();
  // The scale follows the usual frame, a rare stall keeps its value written above the chart.
  const tops = list.map(s => Math.max(s.cpu, s.frame, s.gpu ?? 0)).sort((a, b) => a - b);
  const ceiling = Math.max(36, Math.ceil((tops[Math.max(0, Math.ceil(tops.length * .9) - 1)] ?? 0) / 10) * 10);
  const left = 30, right = 6, top = 8, bottom = 18;
  const x = at => left + (at - now + 30000) / 30000 * (width - left - right);
  const y = ms => height - bottom - Math.min(ms, ceiling) / ceiling * (height - top - bottom);
  g.font = '10px Barlow, system-ui'; g.lineWidth = 1;
  for (const tick of [0, 1000 / 60, 1000 / 30]) {
    g.strokeStyle = tick ? '#FFFFFF2A' : '#FFFFFF14'; g.setLineDash(tick ? [4, 4] : []);
    g.beginPath(); g.moveTo(left, y(tick)); g.lineTo(width - right, y(tick)); g.stroke();
    g.fillStyle = '#A9BDB8'; g.textAlign = 'right';
    g.fillText(tick ? tick.toFixed(1) : '0', left - 4, y(tick) + 3);
  }
  g.setLineDash([]); g.textAlign = 'center';
  for (const s of [30, 20, 10, 0]) g.fillText(s ? `-${s} s` : 'maintenant', Math.min(width - 28, Math.max(left + 14, x(now - s * 1000))), height - 4);
  g.save(); g.beginPath(); g.rect(left, top, width - left - right, height - top - bottom); g.clip();
  const under = list.map(() => 0);
  for (const [id, , color] of PERF_KINDS) {
    g.beginPath();
    list.forEach((s, i) => { const px = x(s.at), py = y(under[i] + s.costs[id]); i ? g.lineTo(px, py) : g.moveTo(px, py); });
    for (let i = list.length - 1; i >= 0; i--) g.lineTo(x(list[i].at), y(under[i]));
    g.closePath(); g.fillStyle = color + 'CC'; g.fill();
    list.forEach((s, i) => { under[i] += s.costs[id]; });
  }
  const line = (field, color, width, dash = []) => {
    g.beginPath(); g.strokeStyle = color; g.lineWidth = width; g.setLineDash(dash);
    list.forEach((s, i) => (i ? g.lineTo : g.moveTo).call(g, x(s.at), y(s[field])));
    g.stroke();
  };
  line('cpuPeak', '#F0A03C88', 1, [2, 3]);
  line('framePeak', '#FFFFFF44', 1, [2, 3]);
  line('frame', '#FFFFFF', 1.6);
  g.beginPath(); g.strokeStyle = '#66D9EA'; g.lineWidth = 1.6; g.setLineDash([]);
  let on = false;
  for (const s of list) { if (s.gpu == null) { on = false; continue; } (on ? g.lineTo : g.moveTo).call(g, x(s.at), y(s.gpu)); on = true; }
  g.stroke();
  g.restore();
  const peak = Math.max(0, ...list.map(s => Math.max(s.framePeak, s.cpuPeak)));
  if (peak > ceiling) { g.fillStyle = '#F0A03C'; g.textAlign = 'right'; g.fillText(L`pic ${peak.toFixed(0)} ms`, width - right, top + 9); }
  if (!last) return;
  const fps = last.frame ? 1000 / last.frame : 0, figure = n => n.toFixed(1).replace('.', DEC);
  $('perf-sum').textContent = L`${Math.round(fps)} images/s · ${figure(last.frame)} ms entre deux · CPU ${figure(last.cpu)} ms par image`;
  for (const [id] of PERF_KINDS) $(`perf-${id}`).textContent = `${figure(last.costs[id])} ms`;
  $('perf-gpu').textContent = last.gpu == null ? (view3d ? 'indisponible' : L('en 3D seulement')) : `${figure(last.gpu)} ms`;
  const minute = (ui.earned || []).filter(e => e.at > G.time - 60), by = {};
  ui.earned = minute;
  for (const e of minute) by[e.source] = (by[e.source] || 0) + e.amount;
  const span = Math.min(60, Math.max(1, G.time - (ui.perfFrom ?? 0)));
  const rate = n => Math.round(n * 60 / span);
  $('perf-dna').textContent = L`ADN / min : ${rate(Object.values(by).reduce((a, b) => a + b, 0))}` + Object.entries(EARN).filter(([id]) => by[id]).map(([id, name]) => ` · ${name.toLowerCase()} ${rate(by[id])}`).join('');
  $('perf-other').textContent = `${figure(Math.max(0, last.cpu - Object.values(last.costs).reduce((a, b) => a + b, 0)))} ms`;
}
function showPerf(on) {
  PERF.on = on;
  ui.perfFrom = G?.time ?? 0;
  perfReset();
  $('perf').hidden = !on;
  $('perf-toggle').setAttribute('aria-pressed', on);
  $('perf-toggle').textContent = on ? L('Masquer') : L('Afficher');
}
$('perf-legend').innerHTML = [...PERF_KINDS, ['other', L('Autre code de l’image'), '#84909C'], ['gpu', L('Carte graphique (trait)'), '#66D9EA']].map(([id, name, color]) =>
  `<p><i style="background:${color}"></i><span>${name}</span><b id="perf-${id}">–</b></p>`).join('');
// The 3D view reads it when it is made: a change remakes an open one.
const QUALITY_KEY = 'strainworks-3d-quality';
function setQuality(fast, remake) {
  window.quality3d = fast ? 'fast' : 'high';
  $('quality-high').setAttribute('aria-pressed', !fast);
  $('quality-fast').setAttribute('aria-pressed', fast);
  if (!remake || !made3d || switching) return;
  const open = Boolean(view3d);
  made3d.dispose(); made3d = view3d = null;
  if (open) show3D(true);
}
for (const [id, fast] of [['quality-high', false], ['quality-fast', true]]) $(id).onclick = () => { setQuality(fast, true); keep(QUALITY_KEY, fast ? 'fast' : 'high'); };
setQuality(stored(QUALITY_KEY) === 'fast', false);
// The 3D view reads it on every frame, from 0 (flat) to 1. Choices kept from before become their nearest strength.
const CURVE_KEY = 'strainworks-3d-curve';
function setCurve(value) {
  // Never set: a quarter, the ground just rounding away.
  const named = {none:0, soft:.5, strong:1}[value], amount = value == null ? .25 : named ?? Math.max(0, Math.min(1, Number(value) || 0));
  window.curve3d = amount;
  $('curve-amount').value = Math.round(amount * 100);
  $('curve-shown').textContent = `${Math.round(amount * 100)} %`;
}
$('curve-amount').oninput = () => { setCurve(Number($('curve-amount').value) / 100); keep(CURVE_KEY, String(window.curve3d)); };
setCurve(stored(CURVE_KEY));
// A game in progress is saved and reopened after the page reloads.
function keepForReload() {
  if (slotKey && !orbit.on) { save(); try { sessionStorage.setItem('strainworks-resume', '1'); } catch (_) {} }
}
// ---- Music: the main theme on the planet, two calm pieces in turn in a game, the fight piece while it is hot.
// It starts with the first press, as browsers want, and is not kept for offline play: the game runs without it.
const MUSIC_KEY = 'strainworks-music';
// The calm pieces and the fight pieces each go round their list in a shuffled order.
const MUSIC = {
  // The planet's two themes take turns.
  theme:['music/strainworks_theme_b_1.mp3', 'music/strainworks_theme_b_2.mp3'],
  calm:['music/strainworks_music_01.mp3', 'music/strainworks_theme_a_1.mp3', 'music/strainworks_theme_a_2.mp3', 'music/strainworks_music_02.mp3', 'music/strainworks_calm_a_1.mp3', 'music/strainworks_calm_b_1.mp3', 'music/strainworks_music_04.mp3', 'music/strainworks_calm_c_1.mp3', 'music/strainworks_calm_a_2.mp3', 'music/strainworks_calm_b_2.mp3', 'music/strainworks_calm_c_2.mp3', 'music/strainworks_calm_d_1.mp3', 'music/strainworks_calm_d_2.mp3', 'music/strainworks_calm_e_2.mp3', 'music/strainworks_calm_f_1.mp3', 'music/strainworks_calm_f_2.mp3'],
  fight:['music/strainworks_music_03.mp3', 'music/strainworks_fight_a_1.mp3', 'music/strainworks_fight_b_1.mp3', 'music/strainworks_fight_a_2.mp3', 'music/strainworks_fight_b_2.mp3', 'music/strainworks_fight_c_2.mp3', 'music/strainworks_fight_d_1.mp3', 'music/strainworks_fight_d_2.mp3', 'music/strainworks_fight_e_1.mp3', 'music/strainworks_fight_e_2.mp3'],
};
// The music draws its own chance, so the game's seeded Math.random is left alone.
const musicRandom = n => crypto.getRandomValues(new Uint32Array(1))[0] % n;
// A new order on every visit and after every round, never the same piece twice in a row: no piece comes back before
// every other of its list was played.
function shuffleMusic(list) {
  const last = list.at(-1);
  for (let i = list.length - 1; i > 0; i--) { const j = musicRandom(i + 1); [list[i], list[j]] = [list[j], list[i]]; }
  if (list[0] === last) list.push(list.shift());
}
const shuffleCalm = () => shuffleMusic(MUSIC.calm);
shuffleCalm();
shuffleMusic(MUSIC.fight);
const music = {manual:null, volume:.5, on:true, started:false, players:[new Audio(), new Audio()], level:[0, 0], gains:null, live:0, src:'', calm:0, theme:musicRandom(2), fight:-1, fightUntil:0, force:null};
try {
  const saved = JSON.parse(localStorage.getItem(MUSIC_KEY));
  if (saved) { music.volume = Math.max(0, Math.min(1, Number(saved.volume) || 0)); music.on = saved.on !== false; }
} catch (_) {}
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
const TRACKS = {calm_d_1:['Abyssal Glow', '2:59'], calm_d_2:['Lantern Drift', '3:00'], calm_e_2:['Night Culture', '3:00'], calm_f_1:['Pollen Clock', '3:00'], calm_f_2:['Seed Waltz', '2:59'],
  fight_c_2:['Breach Protocol', '3:00'], fight_d_1:['Chitin War', '2:59'], fight_d_2:['Drums of the Hive', '2:59'], fight_e_1:['Acid Bloom', '3:00'], fight_e_2:['Infection', '3:00'],
  theme_b_1:['Strainworks', '2:59'], theme_b_2:['First Light', '3:00'], music_01:['Germination', '3:57'], theme_a_1:['Glass Bells', '2:59'], theme_a_2:['Pulse Garden', '2:59'],
  music_02:['Membrane', '3:30'], calm_a_1:['Living Factory', '3:00'], calm_b_1:['Lab Hours', '3:00'], music_04:['Spore Drift', '3:12'], calm_c_1:['Microcosm', '2:59'], calm_a_2:['Root Network', '2:59'],
  calm_b_2:['Enzyme', '2:59'], calm_c_2:['Cell Dream', '2:59'], music_03:['Breach', '3:32'], fight_a_1:['Antibody', '2:59'], fight_b_1:['Swarm', '2:59'], fight_a_2:['Immune Response', '3:00'], fight_b_2:['Hive Assault', '2:58']};
const trackOf = src => TRACKS[/strainworks_(\w+?_\d+)/.exec(src)?.[1]] || ['?', ''];
function paintPlaylist() {
  const groups = [[L('Planète'), '', MUSIC.theme], [L('Calme'), '', [...MUSIC.calm].sort((a, b) => trackOf(a)[0].localeCompare(trackOf(b)[0]))], [L('Combat'), 'fight', MUSIC.fight]];
  const play = '<svg width="13" height="13" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 2l9 5-9 5z" fill="currentColor"/></svg>';
  const stop = '<svg width="11" height="11" viewBox="0 0 12 12" aria-hidden="true"><rect x="2" y="2" width="8" height="8" rx="1.5" fill="currentColor"/></svg>';
  $('playlist').innerHTML = groups.map(([name, kind, list]) => `<div class="${kind}"><p class="group"><span>${name}</span><span>${list.length}</span></p>${list.map(src => {
    const [title, time] = trackOf(src), now = music.on && music.src === src && (music.manual ?? src) === src;
    return `<div class="track${now ? ' now' : ''}"><button data-track="${src}" aria-label="${now ? L`Arrêter ${title}` : L`Lancer ${title}`}">${now ? stop : play}</button><span class="name"><b>${title}</b><span class="eq" aria-hidden="true"><i></i><i></i><i></i></span></span><span class="time">${time}</span></div>`;
  }).join('')}</div>`).join('');
  $('playlist-auto').setAttribute('aria-checked', music.manual == null);
  $('playlist-note').textContent = music.manual == null ? L('Le jeu choisit selon le moment : planète, calme, combat.') : L('Manuel : la piste choisie tourne en boucle.');
}
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
function musicWant(now) {
  // The lab plays what it is asked: a moment of the game, a piece, or nothing.
  // Chosen in the playlist: that piece, or silence when it was stopped.
  if (music.manual != null && music.force == null) return music.manual;
  if (music.force != null) return music.force === 'calm' ? MUSIC.calm[music.calm] : music.force === 'fight' ? MUSIC.fight[Math.max(0, music.fight)] : music.force === 'theme' ? MUSIC.theme[music.theme] : music.force;
  if (orbit.on || !G) return MUSIC.theme[music.theme];
  // An assault, or creatures on the map: a fight piece, drawn as the fight starts and held 8 s after so it does not flicker.
  if (!G.over && $('app').classList.contains('hot')) {
    if (now >= music.fightUntil) {
      // The next fight piece in its round; a calm piece cut by the fight counts as heard.
      if (music.fight + 1 >= MUSIC.fight.length) { shuffleMusic(MUSIC.fight); music.fight = 0; } else music.fight++;
      if (music.src === MUSIC.calm[music.calm]) { music.calm++; if (music.calm >= MUSIC.calm.length) { music.calm = 0; shuffleCalm(); } }
    }
    music.fightUntil = now + 8000;
  }
  return now < music.fightUntil ? MUSIC.fight[music.fight] : MUSIC.calm[music.calm];
}
function musicTick() {
  if (!music.started) return;
  stationHum();
  const want = musicWant(performance.now());
  if (want && want !== music.src) {
    music.src = want; music.live ^= 1;
    const a = music.players[music.live];
    // Themes and calm pieces hand over at their end; a fight piece loops while the fight lasts.
    a.src = want; a.loop = MUSIC.fight.includes(want) || want === music.manual; music.level[music.live] = 0;
  }
  // About 1.5 s of crossfade: the piece playing rises to the volume chosen, the other falls and stops.
  music.players.forEach((a, i) => {
    const ducked = performance.now() < (music.duckUntil || 0) ? .35 : 1;
    const goal = want && i === music.live && music.on && !document.hidden ? music.volume * ducked : 0, was = music.level[i];
    const level = music.level[i] = Math.max(0, Math.min(1, was + Math.sign(goal - was) * Math.min(Math.abs(goal - was), .07)));
    // Through a gain where the browser has Web Audio: an iPhone ignores the volume of an audio element.
    if (music.gains) music.gains[i].gain.value = level; else a.volume = level;
    if (goal > 0 && a.paused) a.play().catch(() => {});
    else if (goal === 0 && level === 0 && !a.paused) a.pause();
  });
}
function paintMusic() {
  $('music-volume').value = Math.round(music.volume * 100);
  $('music-on').setAttribute('aria-pressed', music.on);
  $('music-on').textContent = music.on ? L('Activée') : L('Coupée');
}
function keepMusic() { try { localStorage.setItem(MUSIC_KEY, JSON.stringify({volume:music.volume, on:music.on})); } catch (_) {} }
$('music-volume').oninput = () => { music.volume = Number($('music-volume').value) / 100; if (music.volume > 0) music.on = true; keepMusic(); paintMusic(); musicTick(); };
$('music-on').onclick = () => { music.on = !music.on; keepMusic(); paintMusic(); musicTick(); };
paintMusic();
// One audio context for the music and the effects, made on a press as browsers want.
addEventListener('click', event => { if (event.target.closest?.('button')) playSound('click'); }, {capture:true});
function startSound() {
  if (music.started) return;
  // A media player, not a page sound: an iPhone in silent mode still plays it, as it does a video.
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (_) {}
  try {
    const Context = window.AudioContext || window.webkitAudioContext, ctx = new Context();
    music.gains = music.players.map(a => { const gain = ctx.createGain(); gain.gain.value = 0; ctx.createMediaElementSource(a).connect(gain).connect(ctx.destination); return gain; });
    sfx.ctx = ctx; sfx.out = ctx.createGain(); sfx.out.gain.value = sfx.on ? sfx.volume : 0; sfx.out.connect(ctx.destination);
    loadSounds();
    ctx.resume?.();
  } catch (_) { music.gains = null; }
  music.started = true; musicTick();
}
// Hidden, it stops at once: a phone slows or freezes the fade's timer, and the piece would play on behind the lock screen.
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) { musicTick(); return; }
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

// ---- Effects: drawn by Web Audio, a little different each time, never more than ten at once.
// By default the effects play at half the music's volume.
const sfx = {volume:music.volume / 2, on:true, ctx:null, out:null, voices:0, buffers:{}, last:{}, loop:null};
const SFX_KEY = 'strainworks-sfx';
try {
  const saved = JSON.parse(localStorage.getItem(SFX_KEY));
  if (saved) { sfx.volume = Math.max(0, Math.min(1, Number(saved.volume) || 0)); sfx.on = saved.on !== false; }
} catch (_) {}
function paintSfx() {
  $('sfx-volume').value = Math.round(sfx.volume * 100);
  $('sfx-on').setAttribute('aria-pressed', sfx.on);
  $('sfx-on').textContent = sfx.on ? L('Activés') : L('Coupés');
  if (sfx.out) sfx.out.gain.value = sfx.on ? sfx.volume : 0;
}
function keepSfx() { try { localStorage.setItem(SFX_KEY, JSON.stringify({volume:sfx.volume, on:sfx.on})); } catch (_) {} }
$('sfx-volume').oninput = () => { sfx.volume = Number($('sfx-volume').value) / 100; if (sfx.volume > 0) sfx.on = true; keepSfx(); paintSfx(); };
$('sfx-on').onclick = () => { sfx.on = !sfx.on; keepSfx(); paintSfx(); };
paintSfx();
// Each effect's generated takes, by the name of their files; the game picks one at random each time.
const SOUND_FILE = {click:'ui_click', open:'ui_open', refuse:'ui_refuse', step:'ui_step', place:'build_place', belt:'build_belt', bridge:'build_bridge', rotate:'build_rotate', done:'build_done', dismantle:'build_dismantle', rank:'build_rank', gene:'prod_gene', eat:'prod_eat', turret:'turret_fire', sting:'fight_sting', maw:'fight_maw', hit:'fight_hit', kill:'fight_kill', throw:'fight_throw', damaged:'fight_damaged', destroyed:'fight_destroyed', core_hit:'fight_core_hit', hex:'planet_hex', zoom:'planet_zoom', stage_up:'stage_up', game_over:'game_over', nest_down:'nest_down', mutation:'mutation', assault_alarm:'assault_alarm', station_loop:'station_loop'};
function loadSounds() {
  for (const [id, base] of Object.entries(SOUND_FILE)) {
    const take = new RegExp(`/${base}_\\d`);
    for (const file of LAB_FILES.filter(f => take.test(f))) {
      fetch(file).then(r => r.arrayBuffer()).then(data => sfx.ctx.decodeAudioData(data)).then(buffer => { (sfx.buffers[id] ||= []).push(buffer); }).catch(() => {});
    }
  }
}
// Heard while it is in view or close to it: a fight, a site or a machine far away stays silent.
const heard = c => !orbit.on && c?.x != null && placeOf(c).gain > .03;
const playNear = (id, c, gap) => heard(c) && playSound(id, gap, placeOf(c));
// Under the theme on the planet, the station hums.
function stationHum() {
  // shortcut: never played; the station loop sounds like music and doubled the planet's theme. Kept to replay it as a quieter ambience later.
  const ctx = sfx.ctx, want = false;
  if (want && !sfx.loop) {
    const src = ctx.createBufferSource(), gain = ctx.createGain();
    src.buffer = sfx.buffers.station_loop[0]; src.loop = true;
    gain.gain.setValueAtTime(0, ctx.currentTime); gain.gain.linearRampToValueAtTime(.35, ctx.currentTime + 1.5);
    src.connect(gain).connect(sfx.out); src.start();
    sfx.loop = {src, gain};
  } else if (!want && sfx.loop) {
    const {src, gain} = sfx.loop;
    sfx.loop = null;
    if (ctx) { gain.gain.setTargetAtTime(0, ctx.currentTime, .3); src.stop(ctx.currentTime + 1.5); }
  }
}
function blip(t, {wave = 'sine', from = 440, to = from, dur = .12, gain = .3, noise = false, band = 0, attack = .004}, dest = sfx.out) {
  const ctx = sfx.ctx, g = ctx.createGain(), k = 1 + (Math.random() - .5) * .08;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + attack); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  let src;
  if (noise) {
    const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate), d = buffer.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    src = ctx.createBufferSource(); src.buffer = buffer;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = band || 1;
    f.frequency.setValueAtTime(from * k, t); f.frequency.exponentialRampToValueAtTime(Math.max(20, to * k), t + dur);
    src.connect(f).connect(g);
  } else {
    src = ctx.createOscillator(); src.type = wave;
    src.frequency.setValueAtTime(from * k, t); src.frequency.exponentialRampToValueAtTime(Math.max(1, to * k), t + dur);
    src.connect(g);
  }
  g.connect(dest); src.start(t); src.stop(t + dur + .02);
}
// What repeats while a factory runs or a fight goes on stays well under the one-off sounds.
const SOUND_LEVEL = {gene:.1, eat:.22, dna:.3, click:.6, rotate:.6, hit:.3, turret:.4, sting:.4, maw:.45, damaged:.35, throw:.5, done:.6};
// 3. Where a sound comes from, as the player looks: full near the middle of the screen, fading past its edges,
// quieter as the view zooms out, and heard from its side.
function placeOf(c) {
  const p = screenAt({x:c.x + .5, y:c.y + .5}), cx = view.w / 2, cy = view.h / 2;
  const off = Math.hypot((p.x - cx) / cx, (p.y - cy) / cy);
  // Full in the middle, about half at the edge of the screen, gone a little past it.
  const near = off <= 1 ? 1 - .55 * off : Math.max(0, .45 * (1.6 - off) / .6);
  // About half at the default view, almost nothing zoomed far out, full only from a close view (40) on.
  const zoom = Math.max(.03, Math.min(1, (cam.zoom - 6) / 34)) ** 1.5;
  return {gain:near * zoom, pan:Math.max(-1, Math.min(1, (p.x - cx) / cx)) * .9};
}
// Each effect: its family for the lab, its name, and how it is drawn (b = blip at an offset in seconds).
const SOUNDS = {
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
const DUCKED = new Set(['stage_up', 'mutation', 'nest_down', 'game_over', 'assault_alarm']);
const duck = seconds => { music.duckUntil = Math.max(music.duckUntil || 0, performance.now() + seconds * 1000 + 250); };
function playSound(id, gap = .06, where = null) {
  const ctx = sfx.ctx;
  if (!ctx || !sfx.on || sfx.voices >= 10) return false;
  const now = ctx.currentTime;
  if (now - (sfx.last[id] ?? -9) < gap) return false;
  sfx.last[id] = now;
  const level = ctx.createGain();
  level.gain.value = (SOUND_LEVEL[id] ?? 1) * (where ? where.gain : 1);
  if (where && ctx.createStereoPanner) { const pan = ctx.createStereoPanner(); pan.pan.value = where.pan; level.connect(pan).connect(sfx.out); }
  else level.connect(sfx.out);
  const takes = sfx.buffers[id];
  if (takes?.length) {
    const src = ctx.createBufferSource();
    src.buffer = takes[Math.floor(Math.random() * takes.length)];
    src.connect(level); src.start();
    if (DUCKED.has(id)) duck(src.buffer.duration);
    sfx.voices++; src.onended = () => { sfx.voices--; };
    return true;
  }
  const s = SOUNDS[id];
  if (!s) return false;
  sfx.voices++;
  if (DUCKED.has(id)) duck(1.2);
  s.play((at, o) => blip(now + at, o, level));
  setTimeout(() => { sfx.voices--; }, 800);
  return true;
}
function setLang(id) {
  keep(LANG_KEY, id);
  if (id === LANG) return;
  keepForReload();
  location.reload();
}
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
  try { if (sessionStorage.getItem('strainworks-resume')) { sessionStorage.removeItem('strainworks-resume'); resumeLast(); } } catch (_) {}
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
const LAB_GENES = {S:'SSF', F:'FFC', C:'CCN', N:'NNS'};
function labSpot() {
  for (let r = 16; r < 60; r += 2) for (let a = 0; a < 8; a++) {
    const x = Math.round(CORE.x + Math.cos(a * Math.PI / 4) * r), y = Math.round(CORE.y + Math.sin(a * Math.PI / 4) * r);
    let clear = true;
    for (let i = -4; i <= 4 && clear; i++) for (let j = -4; j <= 4 && clear; j++) clear = !depositAt(x + i, y + j) && buildable(x + i, y + j);
    if (clear && !breachesIn(x - 10, y - 10, x + 10, y + 10).length) return {x, y};
  }
  return {x:CORE.x + 12, y:CORE.y};
}
function labSpecimens() {
  return [['cell', 'core', 'Core'],
    ...Object.keys(TYPES).filter(t => !hasTrait(t, 'noSpecimen')).map(t => ['cell', t, `${TYPES[t].name} (${t})`]),
    ...Object.keys(LAB_GENES).map(k => ['creature', k, `Creature ${k}, gene ${LAB_GENES[k]}`]),
    ...[0, 1, 2, 3].flatMap(form => [['nest', `${form}:sleep`, `Nest form ${form}, asleep`], ['nest', `${form}:wake`, `Nest form ${form}, awake`]]),
    ['drone', 'drone', 'Drone, hovering']];
}
// What the inspector edits: the specimen's own object in the game state.
function labTarget() {
  const {kind} = LAB;
  if (kind === 'cell') return cellAt(LAB.cell.x, LAB.cell.y);
  if (kind === 'creature') return G.enemies[0];
  if (kind === 'nest') return G.breaches[0];
  if (kind === 'drone') return G.drones[0];
  return null;
}
function labShow(value) {
  const [kind, id] = value.split('|');
  const {x, y} = LAB.at;
  for (const c of Object.values(G.cells)) if (c.type !== 'core') delete G.cells[key(c.x, c.y)];
  G.enemies = []; G.shots = [];
  // The nest and the drone are moved onto the spot when shown: every other time they wait far from it.
  const away = {x:x + 60, y:y + 60};
  if (G.breaches[0]) Object.assign(G.breaches[0], away);
  if (G.drones[0]) Object.assign(G.drones[0], {x:away.x, y:away.y, was:{...G.drones[0].was, x:away.x, y:away.y}});
  LAB.kind = kind;
  let focus = {x, y};
  LAB.cell = id === 'core' ? CORE : LAB.at;
  if (kind === 'cell') {
    if (id === 'core') focus = CORE;
    else { const c = put(id, x, y, 1); c.left = 0; c.hp = fullHp(c); }
  } else if (kind === 'creature') {
    G.enemies.push({x:x + .5, y:y + .5, gene:LAB_GENES[id], hp:10, max:10, home:0, goal:{x:x + 6, y:y + .5}});
  } else if (kind === 'nest') {
    const [form, state] = id.split(':'), b = G.breaches[0];
    Object.assign(b, {form:Number(form), state, x, y});
    focus = {x, y};
  } else if (kind === 'drone') {
    const d = G.drones[0];
    Object.assign(d, {x:x + .5, y:y + .5, h:1.2, w:0, trip:'nest', job:'', goal:null, was:{x:x + .5, y:y + .5, h:1.2, w:0}});
  }
  forgetCells();
  Object.assign(cam, {x:focus.x + .5, y:focus.y + .5, zoom:Number($('lab-zoom').value)});
  // Under the sheet of a narrow screen, the model is framed in the upper half.
  if (matchMedia('(max-width:600px)').matches) cam.y += view.h * .24 / cam.zoom;
  labPaint(true);
}
function labPaint(fresh) {
  const target = labTarget(), text = $('lab-state');
  if (!target) return;
  if (fresh || document.activeElement !== text) text.value = JSON.stringify(target, null, 1);
  $('lab-quick').hidden = LAB.kind !== 'cell' || target.type === 'core';
}
function labEdit(change) {
  const c = labTarget();
  if (!c) return;
  change(c);
  forgetCells();
  labPaint(true);
}
// The sounds of the game in one place: each piece, each moment as the game plays it, each effect.
// Generated sounds waiting to be chosen, each in two takes. The build serves every file named here.
const LAB_FILES = [
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
const pieceName = src => src.split('/').pop().replace('strainworks_', '').replace(/(-[0-9a-f]+)?\.mp3$/, '');
const LAB_PIECES = [['As on the planet', 'theme'], ...MUSIC.theme.map(src => [`Theme · ${pieceName(src)}`, src]), ...MUSIC.calm.map(src => [`Calm · ${pieceName(src)}`, src]), ...MUSIC.fight.map(src => [`Fight · ${pieceName(src)}`, src])];
function labSoundsHTML() {
  const groups = [...new Set(Object.values(SOUNDS).map(s => s.group))];
  return `<p class="note">Music</p>
    <div class="quick">${LAB_PIECES.map(([name, id]) => `<button class="tip" data-piece="${id}">${name}</button>`).join('')}<button class="tip" data-piece="">Stop</button></div>
    <div class="quick"><button class="tip" data-piece="theme">As on the planet</button><button class="tip" data-piece="calm">As in a calm game</button><button class="tip" data-piece="fight">As in a fight</button></div>
    <p class="note" id="lab-now">Nothing playing</p>
    <label>Music <input id="lab-music" type="range" min="0" max="100" value="${Math.round(music.volume * 100)}"><output id="lab-music-out">${Math.round(music.volume * 100)}</output></label>
    <label>Effects <input id="lab-sfx" type="range" min="0" max="100" value="${Math.round(sfx.volume * 100)}"><output id="lab-sfx-out">${Math.round(sfx.volume * 100)}</output></label>
    <p class="note">Candidates (generated, not in the game yet)</p>
    <div class="sounds">${LAB_FILES.map(f => `<button class="tip" data-file="${f}">${f.split('/').pop().replace('.mp3', '')}</button>`).join('')}</div>
    <p class="note">Effects drawn by the game</p>
    ${groups.map(group => `<p class="note">${group}</p><div class="sounds">${Object.entries(SOUNDS).filter(([, s]) => s.group === group).map(([id, s]) => `<span><button class="tip" data-sound="${id}">${s.name}</button><button class="tip" data-burst="${id}" aria-label="${s.name}, ten in a row">×10</button></span>`).join('')}</div>`).join('')}`;
}
let labTake = null;
function labSounds(panel) {
  panel.addEventListener('click', event => {
    const tab = event.target.closest('[data-tab]')?.dataset.tab;
    if (tab) {
      $('lab-models').hidden = tab !== 'models'; $('lab-sounds').hidden = tab !== 'sounds';
      for (const b of panel.querySelectorAll('[data-tab]')) b.setAttribute('aria-pressed', b.dataset.tab === tab);
    }
    const piece = event.target.closest('[data-piece]')?.dataset.piece, sound = event.target.closest('[data-sound]')?.dataset.sound, burst = event.target.closest('[data-burst]')?.dataset.burst;
    const file = event.target.closest('[data-file]')?.dataset.file;
    if (file) { labTake?.pause(); labTake = new Audio(file); labTake.volume = sfx.volume; labTake.play().catch(() => {}); return; }
    if (piece == null && !sound && !burst) return;
    startSound();
    if (piece != null) { music.force = piece; music.on = true; musicTick(); }
    if (sound) playSound(sound);
    if (burst) for (let i = 0; i < 10; i++) setTimeout(() => playSound(burst), i * 70);
  });
  $('lab-music').oninput = event => { music.volume = event.target.value / 100; $('lab-music-out').textContent = event.target.value; musicTick(); };
  $('lab-sfx').oninput = event => { sfx.volume = event.target.value / 100; $('lab-sfx-out').textContent = event.target.value; if (sfx.out) sfx.out.gain.value = sfx.volume; };
  setInterval(() => {
    const a = music.players[music.live], name = music.src.split('/').pop();
    $('lab-now').textContent = music.force ? `${name} · ${Math.floor(a.currentTime)} / ${Math.floor(a.duration || 0)} s` : 'Nothing playing';
  }, 500);
}
function startLab() {
  leavePlanet(() => {
    slotId = orbit.pick; slotKey = null;
    settleIn(); fresh();
    G.open = true; G.dna = 99999; G.stage = STAGES.length;
    G.breaches = G.breaches.slice(0, 1);
    window.known = () => true;
    LAB.at = labSpot();
    return true;
  }, 'now');
  $('app').classList.add('lab');
  const panel = document.createElement('aside');
  panel.id = 'lab';
  panel.innerHTML = `<h2>Strainworks lab</h2>
    <div class="quick" id="lab-tabs"><button class="tip" data-tab="models" aria-pressed="true">Models</button><button class="tip" data-tab="sounds" aria-pressed="false">Sounds</button></div>
    <div id="lab-sounds" hidden>${labSoundsHTML()}</div>
    <div id="lab-models">
    <select id="lab-list" size="12" aria-label="Models">${labSpecimens().map(([kind, id, name]) => `<option value="${kind}|${id}">${name}</option>`).join('')}</select>
    <div id="lab-quick" class="quick">
      <button class="tip" data-lab="turn">Rotate</button><button class="tip" data-lab="mk">Rank MK</button><button class="tip" data-lab="flip">Mirror</button><button class="tip" data-lab="site">Construction</button>
      <label>Health <input id="lab-hp" type="range" min="5" max="100" value="100"><output id="lab-hp-out">100%</output></label>
    </div>
    <label>Zoom <input id="lab-zoom" type="range" min="20" max="240" value="150"><output id="lab-zoom-out">150</output></label>
    <div class="quick"><button class="tip" id="lab-pause">Pause</button><button class="tip" id="lab-apply">Apply the JSON</button></div>
    <textarea id="lab-state" spellcheck="false" aria-label="State"></textarea>
    <p class="note">The rules are stopped, the clock runs. Edit any field and apply.</p>
    </div>`;
  $('app').append(panel);
  $('lab-list').onchange = event => labShow(event.target.value);
  // A frame that grows after loading (Jarvis shows the lab on demand) does not always say so: its size is watched.
  new ResizeObserver(() => resize()).observe(document.documentElement);
  labSounds(panel);
  panel.addEventListener('click', event => {
    const act = event.target.closest('[data-lab]')?.dataset.lab;
    if (act === 'turn') labEdit(c => { c.dir = ((c.dir ?? 0) + 1) % 4; });
    if (act === 'mk') labEdit(c => { c.mk = (rankOf(c) % 3) + 1; c.hp = fullHp(c); });
    if (act === 'flip') labEdit(c => { c.flip = !c.flip; });
    if (act === 'site') labEdit(c => { c.left = c.left > 0 ? 0 : (BUILD[c.type] || 1) / 2; });
  });
  $('lab-hp').oninput = event => { $('lab-hp-out').textContent = `${event.target.value}%`; labEdit(c => { c.hp = fullHp(c) * event.target.value / 100; }); };
  $('lab-zoom').oninput = event => { cam.zoom = Number(event.target.value); $('lab-zoom-out').textContent = event.target.value; };
  $('lab-pause').onclick = () => { paused = !paused; $('lab-pause').textContent = paused ? 'Play' : 'Pause'; };
  $('lab-apply').onclick = () => {
    try { const next = JSON.parse($('lab-state').value); labEdit(c => { for (const k of Object.keys(c)) if (!(k in next)) delete c[k]; Object.assign(c, next); }); }
    catch (error) { $('lab-state').setCustomValidity(error.message); $('lab-state').reportValidity(); setTimeout(() => $('lab-state').setCustomValidity(''), 2000); }
  };
  setInterval(() => labPaint(false), 500);
  // Opening the 3D view frames the board again: the lab's zoom comes back after it.
  show3D(true).then(() => { cam.zoom = Number($('lab-zoom').value); });
  $('lab-list').value = 'cell|ligase';
  labShow('cell|ligase');
}
let before = performance.now(), owed = 0, shownAt = 0, savedAt = 0;
// Untouched, a still screen is drawn less often: 15 images a second in pause, 30 on the planet.
let stirred = performance.now(), drawnAt = 0, planetOwed = 0;
for (const kind of ['pointerdown', 'pointermove', 'wheel', 'keydown', 'resize']) addEventListener(kind, () => { stirred = performance.now(); }, {capture:true, passive:true});
const resting = (now, after, every) => now - stirred > after && now - drawnAt < every;
function frame(now) {
  const started = performance.now();
  const elapsed = Math.min(.15,(now-before)/1000); before = now;
  if (orbit.on) {
    planetOwed += elapsed;
    if (!resting(now, 3000, 1000 / 30 - 2)) { drawPlanet(Math.min(.15, planetOwed)); planetOwed = 0; drawnAt = now; }
    requestAnimationFrame(frame);
    return;
  }
  if (LAB.on) { if (!paused && !document.hidden) G.time += elapsed; }
  else if (!paused && !document.hidden) {
    if (!G.over) G.played = (G.played ?? G.time) + elapsed;
    owed += elapsed*speed;
    while (owed >= STEP) { step(STEP); owed -= STEP; }
  }
  if (armed && Date.now() > armed) { armed = 0; restartText(L('Recommencer : maintenir')); }
  if (now-shownAt > 250) { refresh(); shownAt = now; }
  if (now-savedAt > 3000) { save(); savedAt = now; }
  paces.clear();
  glide(elapsed);
  followEdge(elapsed);
  setCursor();
  animateHud(elapsed);
  if (!(paused && resting(now, 1500, 1000 / 15 - 2))) { draw(); drawnAt = now; }
  perfFrame(now, performance.now() - started);
  requestAnimationFrame(frame);
}
refresh();
requestAnimationFrame(frame);

