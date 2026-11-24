// Builds the demo game every player can open from its hexagon: a stage 5 base whose antidote factory runs by
// itself off its nerve, worms on the maglev way, every defence. It plays the base for a while to check it
// works, then writes prototype/demo.js. Run: node scripts/build-demo.mjs (needs the Playwright Chromium).
import { writeFileSync } from "node:fs";
import { launch, pageHTML } from "../tests/prototype/harness.mjs";

const browser = await launch();
try {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/*", (route) => (route.request().url().startsWith("http://proto.test") ? route.fulfill({ body: pageHTML(), contentType: "text/html" }) : route.abort()));
  await page.goto("http://proto.test/prototype/");
  const out = await page.evaluate(() => {
    begin();
    paused = true;
    Object.assign(G, { open: true, bigTracks: true, stage: 4, dna: 4000, lab: { drones: 3, speed: 2, repair: 2, reach: 2, sight: 2, holds: 2 } });
    G.goals = drawGoals(4);
    if (G.guide) G.guide.step = GUIDE.length;
    const cx = CORE.x, cy = CORE.y;
    const at = (type, x, y, dir, extra = {}) => Object.assign(put(type, x, y, dir), extra);
    const wire = (a, b) => { wireUp(a, b); G.wires.at(-1).left = 0; };
    // The antidote factory, east of the core: four harvesters feed a mixed line past three listening sorters,
    // each giving the Ligase the base its network asks at its position; what is left goes to the burner.
    const ox = cx + 9, oy = cy;
    const ligase = at("ligase", ox, oy, 1, { mk: 2 });
    ["S", "F", "C", "N"].forEach((base, i) => { at("mine", ox + 3, oy - 6 + i, 3, { on: base, mk: 2 }); });
    for (let y = oy - 7; y <= oy - 2; y++) at("belt", ox + 2, y, 2, { mk: 3 });
    at("belt", ox + 2, oy - 1, 3, { mk: 3 });
    at("belt", ox + 1, oy - 1, 3, { mk: 3 });
    const north = at("sort", ox, oy - 1, 3, { side: 3, read: 1 });
    at("belt", ox - 1, oy - 1, 2, { mk: 3 });
    const west = at("sort", ox - 1, oy, 2, { side: 3, read: 2 });
    at("belt", ox - 1, oy + 1, 1, { mk: 3 });
    const south = at("sort", ox, oy + 1, 1, { side: 3, read: 3 });
    at("belt", ox + 1, oy + 1, 1, { mk: 3 });
    at("burn", ox + 2, oy + 1, 0);
    // The antidote leaves east to a splitter: a turret north, a mister south.
    at("belt", ox + 1, oy, 1, { mk: 2 });
    at("belt", ox + 2, oy, 1, { mk: 2 });
    at("split2", ox + 3, oy, 1);
    const turret = at("turret", ox + 3, oy - 1, 0, { mk: 2 });
    const mist = at("mist", ox + 3, oy + 1, 0, { mk: 2 });
    const screen = at("screen", ox - 3, oy - 3, 0);
    const radar = at("radar", ox + 6, oy + 4, 0, { watch: "both" });
    for (const end of [north, west, south, screen, turret]) wire(ligase, end);
    wire(turret, mist); wire(mist, radar);
    // The core's own net: a relay and a screen showing the recipe it asks for.
    const relay = at("relay", cx - 5, cy - 4, 0), recipe = at("screen", cx - 8, cy - 4, 0);
    wire(coreCell(), relay); wire(relay, recipe);
    for (const w of G.wires) w.color = 0;
    for (const w of netWires(key(relay.x, relay.y))) w.color = 2;
    // Worms: a maglev loop south of the core, a full silo loading, one unloading toward the core.
    const X = cx - 8 - ((cx - 8) % 2), Y = cy + 6 - ((cy + 6) % 2);
    const lay = (x, y, dir) => { layTrack(x, y, dir).left = 0; };
    for (let x = X; x < X + 12; x += 2) lay(x, Y, 1);
    for (let y = Y; y < Y + 6; y += 2) lay(X + 12, y, 2);
    for (let x = X + 12; x > X; x -= 2) lay(x, Y + 6, 3);
    for (let y = Y + 6; y > Y; y -= 2) lay(X, y, 0);
    at("pocket", X + 2, Y + 8, 0, { stock: Array(200).fill("SFS") });
    at("pocket", X + 6, Y + 8, 0, { stock: Array(160).fill("CCF") });
    at("pocket", X + 4, Y - 2, 0, { unload: true });
    incubate(X + 1, Y + 7); G.worms[0].left = 0;
    // A laboratory and the other defences round the base.
    at("lab", cx - 4, cy - 9, 0);
    at("glue", ox + 8, oy - 1, 0, { stock: Array(20).fill("SFN") });
    at("harpoon", ox + 6, oy - 4, 0);
    at("sting", ox + 6, oy + 7, 0);
    // Wake the nest nearest the factory: the net has something to answer.
    const sleeping = G.breaches.filter((b) => b.state === "sleep").sort((a, b) => Math.hypot(a.x - ox, a.y - oy) - Math.hypot(b.x - ox, b.y - oy))[0];
    if (sleeping) wake(sleeping);
    // Every gun starts loaded with each family's antidote, the harpoon with capsules: the show starts at once.
    for (const c of allCells()) if (isGun(c)) for (const family of G.families) c.ammo[opposite(family)] = 12;
    G.drones && hatchDrones();
    // Play it, and measure.
    const made0 = G.made, kills0 = G.kills;
    for (let i = 0; i < 20 * 45; i++) step(0.05);
    const report = { made: G.made - made0, kills: G.kills - kills0, focus: netOf(ligase)?.focus || "", over: G.over, worm: G.worms[0]?.path?.length, enemies: G.enemies.length, breach: sleeping ? `${sleeping.x},${sleeping.y}` : "" };
    return { report, game: JSON.stringify(G) };
  });
  console.log(JSON.stringify(out.report), errors.length ? `errors: ${errors.join(" | ")}` : "no errors");
  if (process.argv.includes("--write")) {
    writeFileSync(new URL("../prototype/demo.js", import.meta.url), `// The demo game, built by scripts/build-demo.mjs: opened from its hexagon, never saved over.\nwindow.DEMO_GAME = ${out.game};\n`);
    console.log("prototype/demo.js written");
  }
} finally {
  await browser.close();
}
