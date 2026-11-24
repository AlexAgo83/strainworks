// Builds the demo game every player can open from its hexagon: a stage 5 base laid out the way a good player
// would, on the real deposits, every defence fed by its own line and nothing loaded by hand. It plays the base
// for a while to check every chain works, then writes prototype/demo.js.
// Run: node scripts/build-demo.mjs [--write] (needs the Playwright Chromium).
import { writeFileSync } from "node:fs";
import { launch, pageHTML } from "../tests/prototype/harness.mjs";

const browser = await launch();
try {
  // No test start line: the demo starts from the bare core.
  const page = await browser.newPage({ line: false });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/*", (route) => (route.request().url().startsWith("http://proto.test") ? route.fulfill({ body: pageHTML(), contentType: "text/html" }) : route.abort()));
  await page.goto("http://proto.test/prototype/");
  const out = await page.evaluate(() => {
    begin();
    paused = true;
    Object.assign(G, { open: true, bigTracks: true, stage: 4, dna: 2400, lab: { drones: 3, speed: 2, repair: 2, reach: 2, sight: 2, holds: 2 } });
    G.goals = drawGoals(4);
    if (G.guide) G.guide.step = GUIDE.length;
    const bad = [];
    // Every piece goes where a player could put it: free cells, harvesters on their deposit.
    const at = (type, x, y, dir, extra = {}) => {
      const probe = { type, x, y, size: isBig(type) ? 2 : 1 };
      for (const p of footprint(probe)) {
        if (cellAt(p.x, p.y) || trackAt(p.x, p.y) || !placeable(p.x, p.y)) bad.push(`${type} at ${x},${y} overlaps ${p.x},${p.y}`);
      }
      if (type === "mine" && !depositAt(x, y)) bad.push(`mine at ${x},${y} off deposit`);
      const c = put(type, x, y, dir);
      Object.assign(c, extra);
      if (isBig(type)) c.size = 2;
      return c;
    };
    const run = (x0, y0, x1, y1, dir, mk = 3) => {
      const dx = Math.sign(x1 - x0), dy = Math.sign(y1 - y0);
      for (let x = x0, y = y0; ; x += dx, y += dy) {
        at("belt", x, y, dir, { mk });
        if (x === x1 && y === y1) break;
      }
    };
    const wire = (a, b) => { if (!wireUp(a, b)) bad.push(`wire ${a.type}-${b.type}`); G.wires.at(-1).left = 0; };

    // 1. Harvesters on the real deposits, all onto one mixed bus that climbs x=55 to the antidote factory.
    // Thymine (S) from the south field.
    at("mine", 50, 61, 0, { mk: 2 });
    run(50, 60, 53, 60, 1);
    at("belt", 54, 60, 0, { mk: 3 });
    at("belt", 54, 59, 1, { mk: 3 });
    // The bus.
    run(55, 59, 55, 39, 0);
    // N from the south-east field, F from the north-east one, side by side onto the bus.
    at("mine", 56, 57, 3, { mk: 1 });
    at("mine", 57, 56, 3, { mk: 1 });
    at("belt", 56, 56, 3, { mk: 3 });
    at("mine", 57, 42, 3, { mk: 1 });
    at("mine", 57, 43, 3, { mk: 1 });
    at("belt", 56, 42, 3, { mk: 3 });
    at("belt", 56, 43, 3, { mk: 3 });

    // 2. C from the west field by worm: three harvesters fill a silo, the worm carries it round the maglev loop
    // to a silo that empties onto a belt to the bus.
    at("mine", 39, 59, 1, { mk: 2 });
    at("mine", 40, 60, 0, { mk: 2 });
    at("mine", 38, 58, 1, { mk: 2 });
    at("belt", 39, 58, 1, { mk: 2 });
    const lay = (x, y, dir) => { layTrack(x, y, dir).left = 0; };
    for (let y = 58; y >= 46; y -= 2) lay(42, y, 0);
    lay(42, 44, 1);
    for (let y = 44; y <= 56; y += 2) lay(44, y, 2);
    lay(44, 58, 3);
    at("pocket", 40, 58, 0);
    at("pocket", 46, 44, 0, { unload: true });
    // A first-rank belt: the silo gives C at its pace, no faster, and leaves room on the bus for F above.
    run(48, 44, 54, 44, 1, 1);
    incubate(42, 50);
    G.worms[0].left = 0;

    // 3. The antidote factory, facing the nest: the bus runs round a Ligase past three sorters on its nerve, each
    // giving it the base the threat asks at its position. What none of them takes ends in the burner, so the bus
    // never stops.
    const ligase = at("ligase", 50, 40, 0, { flip: true, mk: 3 });
    run(55, 38, 52, 38, 3);
    at("belt", 51, 38, 2, { mk: 3 });
    at("belt", 51, 39, 2, { mk: 3 });
    const first = at("sort", 51, 40, 2, { side: 1, read: 1, mk: 3 });
    at("belt", 51, 41, 3, { mk: 3 });
    const second = at("sort", 50, 41, 3, { side: 1, read: 2, mk: 3 });
    at("belt", 49, 41, 0, { mk: 3 });
    const third = at("sort", 49, 40, 0, { side: 1, read: 3, mk: 3 });
    // Two burners take what is left, so the bus runs at full pace.
    at("belt", 49, 39, 3, { mk: 3 });
    at("split2", 48, 39, 3, { mk: 3 });
    at("burn", 48, 38, 0);
    at("burn", 48, 40, 0);
    at("belt", 50, 39, 0, { mk: 2 });
    at("belt", 50, 38, 0, { mk: 2 });
    at("split2", 50, 37, 0, { mk: 3 });
    const screen = at("screen", 53, 41, 0);

    // 4. The defence line across the creatures' way: splitters hand the antidote to each gun in turn, a full gun
    // lets it go on to the next.
    run(49, 37, 48, 37, 3, 2);
    at("split", 47, 37, 3, { mk: 3 });
    const turret = at("turret", 47, 36, 0, { mk: 2 });
    const mist = at("mist", 47, 38, 0, { mk: 2 });
    at("belt", 46, 37, 3, { mk: 2 });
    run(45, 37, 45, 35, 0, 2);
    at("split2", 45, 34, 0, { mk: 3 });
    const sting = at("sting", 44, 34, 0, { mk: 2 });
    run(46, 34, 47, 34, 1, 2);
    at("glue", 48, 34, 0, { mk: 2 });
    const radar = at("radar", 52, 33, 0, { watch: "both" });

    // 5. The harpoon's magazines: the other half of the antidote goes east to an encapsulator, which takes its
    // carbon from the K deposit on a line of its own.
    run(51, 37, 56, 37, 1, 2);
    at("pack", 57, 37, 1, { flip: true, box: "A", mk: 2 });
    run(58, 37, 58, 36, 0, 2);
    const harpoon = at("harpoon", 58, 35, 0, { mk: 2 });
    at("mine", 63, 48, 1, { mk: 1 });
    run(64, 48, 65, 48, 1, 1);
    run(66, 48, 66, 40, 0, 1);
    at("belt", 66, 39, 3, { mk: 1 });
    run(65, 39, 58, 39, 3, 1);
    run(57, 39, 57, 38, 0, 1);

    // 6. The nerve: the factory, its sorters, its screen, the guns and the radar on one blue network.
    for (const end of [first, second, third, screen, turret, harpoon]) wire(ligase, end);
    wire(turret, mist); wire(turret, sting); wire(turret, radar);
    // The core's own net, orange: a relay and a screen showing the recipe it asks for.
    const relay = at("relay", 52, 50, 0), recipe = at("screen", 53, 50, 0);
    wire(coreCell(), relay); wire(relay, recipe);
    for (const w of G.wires) w.color = 0;
    for (const w of netWires(key(relay.x, relay.y))) w.color = 2;
    at("lab", 38, 47, 0);

    // 7. Wake the nest north of the base: the radar sees it and the factory starts on its antidote at once.
    const north = G.breaches.filter((b) => b.state === "sleep").sort((a, b) => Math.hypot(a.x - 48, a.y - 30) - Math.hypot(b.x - 48, b.y - 30))[0];
    wake(north);
    // A player who saw it coming: the first assault leaves the guns time to fill from their own lines.
    north.next = G.time + 50;
    G.drones && hatchDrones();

    // Play it and measure every chain.
    const guns = { turret, mist, sting, harpoon };
    const fed = { turret: 0, mist: 0, sting: 0, harpoon: 0, glue: 0 };
    const was = { turret: 0, mist: 0, sting: 0, harpoon: 0, glue: 0 };
    const glue = cellAt(48, 34);
    const count = (c) => Object.values(c.ammo).reduce((a, n) => a + n, 0);
    const made0 = G.made, kills0 = G.kills, coreHp0 = coreCell().hp;
    const seconds = 75;
    let wormTrips = 0, lastDocked = false;
    const samples = [];
    for (let i = 0; i < 20 * seconds; i++) {
      step(0.05);
      for (const [name, c] of Object.entries(guns)) { const n = count(c); if (n > was[name]) fed[name] += n - was[name]; was[name] = n; }
      if (glue.stock.length > was.glue) fed.glue += glue.stock.length - was.glue;
      was.glue = glue.stock.length;
      const w = G.worms[0];
      if (w?.docked && !lastDocked) wormTrips++;
      lastDocked = w?.docked;
      if (i % 200 === 0) samples.push({ t: Math.round(G.time), focus: netOf(ligase)?.focus || "", enemies: G.enemies.length, ammo: Object.fromEntries(Object.entries(guns).map(([n, c]) => [n, count(c)])), glue: glue.stock.length });
    }
    const lost = allCells().length;
    const report = {
      bad, made: G.made - made0, kills: G.kills - kills0, fed, wormTrips, unloaded: cellAt(46, 44)?.stock.length,
      focus: netOf(ligase)?.focus || "", over: G.over, coreHp: [coreHp0, coreCell().hp], ruins: Object.keys(G.ruins).length, cells: lost,
      nest: { left: north.left, state: north.state, hp: north.hp }, samples,
            lig: { ports: ligase.ports, item: ligase.item, heard: ligase.heard, left: ligase.left },
      sorts: [first, second, third].map((c) => ({ item: c.item, t: c.t, seen: c.seen, listens: listens(c) })),
      bus: [[55, 50], [55, 45], [55, 40], [55, 38], [53, 38], [51, 38], [51, 41], [49, 41], [49, 39], [50, 38]].map(([x, y]) => `${x},${y}:${cellAt(x, y)?.type}:${cellAt(x, y)?.item}`),
      mines: allCells().filter((c) => c.type === "mine").map((c) => `${c.x},${c.y}:${c.item}`),
      ruinsAt: Object.values(G.ruins).map((r) => `${r.type}@${r.x},${r.y}`),
    };
    return { report, game: JSON.stringify(G) };
  });
  console.log(JSON.stringify(out.report));
  console.log(errors.length ? `errors: ${errors.join(" | ")}` : "no errors");
  if (process.argv.includes("--write")) {
    writeFileSync(new URL("../prototype/demo.js", import.meta.url), `// The demo game, built by scripts/build-demo.mjs: opened from its hexagon, never saved over.\nwindow.DEMO_GAME = ${out.game};\n`);
    console.log("prototype/demo.js written");
  }
} finally {
  await browser.close();
}
