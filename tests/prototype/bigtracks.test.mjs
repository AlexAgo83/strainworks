// New games run worms on 2 by 2 track tiles beside 2 by 2 silos, with doubled capacities and up to five holds.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

it("runs a worm round a loop of big tiles and loads it from a silo", async () => {
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
      G.open = true;
      G.bigTracks = true;
      G.dna = 5000;
      G.enemies = [];
      G.breaches = [];
      const lay = (x, y, dir) => { layTrack(x, y, dir).left = 0; };
      for (let x = 40; x < 52; x += 2) lay(x, 40, 1);
      for (let y = 40; y < 48; y += 2) lay(52, y, 2);
      for (let x = 52; x > 40; x -= 2) lay(x, 48, 3);
      for (let y = 48; y > 40; y -= 2) lay(40, y, 0);
      const silo = put("pocket", 44, 38, 0);
      silo.stock = Array(200).fill("SFN");
      const sameTile = trackAt(45, 41) === G.tracks[key(44, 40)];
      incubate(41, 49);
      const w = G.worms[0];
      w.left = 0;
      for (let i = 0; i < 20 * 30; i++) step(0.05);
      const loaded = w.holds.reduce((n, h) => n + h.n, 0);
      G.lab = { ...(G.lab || {}), holds: 2 };
      step(0.05);
      const saved = checkGame(JSON.parse(JSON.stringify(G)));
      return { sameTile, size: sizeOf(silo), cap: holdCap(), pocket: pocketCap(silo), loaded, holds: w.holds.length, path: w.path.length, saved };
    });
    expect(out.sameTile).toBe(true);
    expect(out.size).toBe(2);
    expect(out.cap).toBe(80);
    expect(out.pocket).toBe(240);
    expect(out.loaded).toBeGreaterThan(40);
    expect(out.holds).toBe(5);
    expect(out.saved).toBe(true);
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
