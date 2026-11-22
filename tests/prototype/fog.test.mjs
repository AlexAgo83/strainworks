// The fog of war: never seen, seen before, seen now.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

async function open(browser) {
  const page = await browser.newPage({ fog: true, viewport: { width: 900, height: 700 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/*", (route) =>
    route.request().url().startsWith("http://proto.test") ? route.fulfill({ body: pageHTML(), contentType: "text/html" }) : route.abort(),
  );
  await page.goto("http://proto.test/prototype/");
  await page.evaluate(() => {
    begin();
    paused = true;
    G.open = true;
    G.seed = 12345;
    sectors = new Map();
    window.run = (seconds) => {
      for (let i = 0; i < Math.round(seconds / STEP); i++) step(STEP);
    };
  });
  return { page, errors };
}

it("shows what was seen, and lets nobody build in the unknown", async () => {
  const browser = await launch();
  try {
    const { page, errors } = await open(browser);
    const out = await page.evaluate(() => {
      const out = {};
      out.start = [known(CORE.x, CORE.y), inSight(CORE.x, CORE.y), known(300, 52), known(48, 27)];
      out.reachable = ["F", "C", "N", "S", "K"].every((kind) => OUTER.some((f) => f[0] === kind && patchOf(f).list.some((c) => known(c.x, c.y))));

      choose("cyst");
      place(300, 52);
      out.refused = [!G.cells["300,52"], note.startsWith("Zone inconnue")];
      Object.assign(cam, { x: 300.5, y: 52.5, zoom: 30 });
      hovered = { x: view.w / 2, y: view.h / 2 };
      out.preview = preview().act;
      hovered = null;

      // A structure pushes it back, a site not built yet does not.
      let x = CORE.x;
      while (known(x + 1, 52)) x++;
      const edge = x - 1;
      const site = build("cyst", edge, 52, 1);
      look(true);
      out.siteIsBlind = !known(edge + 12, 52);
      site.left = 0;
      look();
      out.pushed = [known(edge + 12, 52), inSight(edge + 12, 52)];

      // Gone, the ground stays known and is no longer watched.
      delete G.cells[key(edge, 52)];
      look();
      out.remembered = [known(edge + 12, 52), inSight(edge + 12, 52)];

      save();
      load();
      out.saved = [known(edge + 12, 52), known(300, 52)];
      delete G.seen;
      save();
      load();
      out.olderGame = [known(CORE.x, CORE.y), known(300, 52)];

      const before = JSON.stringify(G);
      draw();
      paintHud();
      out.drawingIsPure = JSON.stringify(G) === before;
      return out;
    });
    expect(out).toEqual({
      start: [true, true, false, true],
      reachable: true,
      refused: [true, true],
      preview: "no",
      siteIsBlind: true,
      pushed: [true, true],
      remembered: [true, false],
      saved: [true, false],
      olderGame: [true, false],
      drawingIsPure: true,
    });
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});

it("never lets a nest wake out of the fog, and shows it as last seen", async () => {
  const browser = await launch();
  try {
    const { page, errors } = await open(browser);
    const out = await page.evaluate(() => {
      const out = { blind: [] };
      const all = [];
      eachSector(-700, -700, 800, 800, (s) => {
        if (s.breach) all.push(s.breach);
      });
      // Seen from just far enough that building there could reach into its circle.
      for (const b of all.slice(0, 80)) {
        G.seen = {};
        G.cells = { [key(CORE.x, CORE.y)]: G.cells[key(CORE.x, CORE.y)] };
        put("wall", b.x + b.r + SIGHT.built - 1, b.y, 0);
        look(true);
        if (!known(b.x, b.y) || !shownNests(b.x, b.y, b.x, b.y).some((o) => o.id === b.id)) out.blind.push(b.id);
      }
      out.tried = Math.min(80, all.length) >= 40;

      begin();
      paused = true;
      const nest = G.breaches[0];
      look(true);
      wake(nest);
      nest.known = { left: 24, state: "wake" };
      nest.left = 3;
      live = new Map(); // nobody watches it any more
      passingBy = new Map();
      out.lastSeen = shownNests(nest.x, nest.y, nest.x, nest.y).find((o) => o.x === nest.x).left;
      look(true);
      out.seenAgain = shownNests(nest.x, nest.y, nest.x, nest.y).find((o) => o.x === nest.x).left;

      // A big factory is looked over within a tick.
      begin();
      paused = true;
      for (let x = 0; x < 50; x++) for (let y = 0; y < 60; y++) if (!G.cells[key(x, y)]) put("belt", x, y, 1);
      const start = performance.now();
      look(true);
      out.fast = performance.now() - start < 250;

      // A drone on the move costs only itself, and what it passes is seen.
      const drone = G.drones[0];
      drone.job = "left1";
      Object.assign(drone, { x: 200, y: 200 });
      look();
      out.passing = [inSight(200, 200), known(200, 200)];
      Object.assign(drone, { x: 230, y: 200 });
      look();
      out.passed = [inSight(200, 200), known(200, 200), inSight(230, 200), inSight(CORE.x, CORE.y)];
      return out;
    });
    expect(out).toEqual({ blind: [], tried: true, lastSeen: 3 + 21, seenAgain: 3, fast: true, passing: [true, true], passed: [false, true, true, true] });
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
