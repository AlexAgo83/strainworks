// A creature thrown out of its nest is drawn along its arc between two ticks, not in 20 jumps a second.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

it("draws a thrown creature between ticks", async () => {
  const html = pageHTML();
  const browser = await launch();
  try {
    const page = await browser.newPage({ viewport: { width: 375, height: 700 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", (route) => (route.request().url().startsWith("http://proto.test") ? route.fulfill({ body: html, contentType: "text/html" }) : route.abort()));
    await page.goto("http://proto.test/");
    const out = await page.evaluate(() => {
      begin();
      paused = true;
      const b = G.breaches[0];
      b.left = 5;
      spawn(b, b.genes[0]);
      const e = G.enemies.at(-1);
      step(STEP);
      owed = 0;
      const tick = creatureAt(e);
      owed = STEP / 2;
      const half = creatureAt(e);
      step(STEP);
      owed = 0;
      const next = creatureAt(e);
      return {
        between: Math.abs(half.x - (tick.x + next.x) / 2) < 1e-6 && Math.abs(half.y - (tick.y + next.y) / 2) < 1e-6,
        rising: half.z > tick.z && next.z > half.z,
        walking: creatureAt({ x: 1, y: 2 }),
      };
    });
    expect(out).toEqual({ between: true, rising: true, walking: { x: 1, y: 2 } });
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
