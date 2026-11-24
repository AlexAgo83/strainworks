// Builds the demo game every player can open from its hexagon, from the step-by-step plan in scripts/demo-plan.mjs:
// every piece is placed where a player could put it, then the base is played and every chain measured.
// Run: node scripts/build-demo.mjs [--steps N] [--seconds S] [--save game.json] [--write]
// (needs the Playwright Chromium). --write writes prototype/demo.js.
import { writeFileSync } from "node:fs";
import { launch, pageHTML } from "../tests/prototype/harness.mjs";
import { STEPS } from "./demo-plan.mjs";

const arg = (name, fallback) => { const i = process.argv.indexOf(name); return i < 0 ? fallback : process.argv[i + 1]; };
const steps = Number(arg("--steps", STEPS.length)), seconds = Number(arg("--seconds", 60));

const browser = await launch();
try {
  // No test start line: the demo starts from the bare core.
  const page = await browser.newPage({ line: false });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/*", (route) => (route.request().url().startsWith("http://proto.test") ? route.fulfill({ body: pageHTML(), contentType: "text/html" }) : route.abort()));
  await page.goto("http://proto.test/prototype/");
  const out = await page.evaluate(({ plan, seconds }) => {
    begin();
    paused = true;
    // Stage 6 under way, every lab upgrade a player would have bought by then.
    Object.assign(G, { open: true, bigTracks: true, stage: 5, dna: 3000 });
    G.goals = drawGoals(5);
    if (G.guide) G.guide.step = GUIDE.length;
    // The north nest stood where the factory goes: the player destroyed it.
    G.breaches = G.breaches.filter((b) => !(b.x === 48 && b.y === 27));
    survey();
    const bad = [], tagged = {};
    for (const step of plan) {
      for (const [x, y] of step.remove || []) if (!cellAt(x, y)) bad.push(`${step.name}: nothing to remove at ${x},${y}`); else { delete G.cells[key(x, y)]; forgetCells(); }
      for (const p of step.pieces) {
      const probe = { type: p.t, x: p.x, y: p.y, size: isBig(p.t) ? 2 : 1 };
      if (step.rebuild) for (const q of footprint(probe)) if (cellAt(q.x, q.y)) { delete G.cells[key(cellAt(q.x, q.y).x, cellAt(q.x, q.y).y)]; forgetCells(); }
      for (const q of footprint(probe)) if (cellAt(q.x, q.y) || trackAt(q.x, q.y) || !placeable(q.x, q.y)) bad.push(`${step.name}: ${p.t} ${p.x},${p.y} on ${q.x},${q.y}`);
      if (p.t === "mine" && !depositAt(p.x, p.y)) bad.push(`${step.name}: mine ${p.x},${p.y} off deposit`);
      if (p.t === "borer" && footprint(probe).some((q) => depositAt(q.x, q.y) !== depositAt(p.x, p.y) || !depositAt(q.x, q.y))) bad.push(`${step.name}: borer ${p.x},${p.y} not on 4 cells of one deposit`);
      const c = put(p.t, p.x, p.y, p.d ?? 0);
      if (isBig(p.t)) c.size = 2;
      if (p.mk) c.mk = p.mk;
      Object.assign(c, p.extra || {});
      if (p.tag) tagged[p.tag] = c;
      }
    }
    for (const step of plan) for (const [a, b] of step.wires || []) {
      const end = (name) => (name === "core" ? coreCell() : name === "desk" ? allCells().find((c) => c.type === "desk") : tagged[name]);
      if (!wireUp(end(a), end(b))) bad.push(`${step.name}: wire ${a}-${b}`);
      else G.wires.at(-1).left = 0;
    }
    sense();
    G.drones && hatchDrones();
    const borers = allCells().filter((c) => c.type === "borer");
    const samples = [];
    for (let i = 0; i < 20 * seconds; i++) {
      step(0.05);
      if (i % 200 === 199) samples.push({ t: Math.round(G.time), nest: G.breaches.filter((b) => b.state !== "sleep").map((b) => `${b.x},${b.y}:${b.state}:${b.left}:${Math.round(b.hp ?? 0)}`).join(" "), enemies: G.enemies.length, guns: allCells().filter((c) => isGun(c) && c.x < 30).map((c) => `${c.type}@${c.x},${c.y}:${Math.round(c.hp)}:${Object.values(c.ammo).reduce((a, n) => a + n, 0)}`).join(" "), fed: G.goals.map((g) => `${g.item}:${g.fed}/${g.count}`).join(" "), ...Object.fromEntries(Object.entries(tagged).map(([k, c]) => [k, c.stock?.length ?? 0])) });
    }
    const jammed = allCells().filter((c) => c.type === "belt" && c.item && c.t >= 0.999).length;
    return {
      report: { bad, cells: allCells().length, nests: G.breaches.length, awake: G.breaches.filter((b) => b.state !== "sleep").length, ruins: Object.keys(G.ruins).length,
        borerRates: borers.map((c) => `${c.x},${c.y}:${perSecond(c)}/s held ${c.stock.length}`), jammedBelts: jammed, samples,
        pack: Object.values(tagged).filter((c) => c.type === "pack").map((c) => ({ box: c.box, ports: c.ports.map((p) => p.length), item: c.item })),
        ligases: Object.entries(tagged).filter(([, c]) => c.type === "ligase").map(([k, c]) => ({ k, heard: c.heard, made: c.made?.length, last: c.last, focus: netOf(c)?.focus, ports: c.ports.map((p) => p.join("")) })),
        sorters: Object.entries(tagged).filter(([, c]) => c.type === "sort").map(([k, c]) => `${k}:${c.read}:${c.item || "-"}:${heardOf(c)?.focus}`),
        turrets: allCells().filter((c) => isGun(c)).map((c) => `${c.x},${c.y}:${JSON.stringify(c.ammo)}`),
        burnt: allCells().filter((c) => c.type === "burn").map((c) => c.burnt || 0), coreWants: coreWants() },
      game: JSON.stringify(G),
    };
  }, { plan: STEPS.slice(0, steps), seconds });
  console.log(JSON.stringify(out.report));
  console.log(errors.length ? `errors: ${errors.join(" | ")}` : "no errors");
  const save = arg("--save", null);
  if (save) writeFileSync(save, out.game);
  if (process.argv.includes("--write")) {
    writeFileSync(new URL("../prototype/demo.js", import.meta.url), `// The demo game, built by scripts/build-demo.mjs: opened from its hexagon, never saved over.\nwindow.DEMO_GAME = ${out.game};\n`);
    console.log("prototype/demo.js written");
  }
} finally {
  await browser.close();
}
