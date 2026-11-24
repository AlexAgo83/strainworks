// Swarms and titans: any awake nest can send them, a cloud of eight frail quick ones, or one slow heavy body.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

it("sends a swarm as eight quick frail ones and a titan as one slow tough one, and keeps them in the save", async () => {
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
      const b = G.breaches[0];
      b.state = "wake"; b.left = 20;
      G.enemies = [];
      spawn(b, "SFN");
      spawn(b, "SFN", "swarm");
      spawn(b, "SFN", "titan");
      const plain = G.enemies[0], swarm = G.enemies.filter((e) => e.kind === "swarm"), titan = G.enemies.find((e) => e.kind === "titan");
      const hp = { plain: plain.max, swarm: swarm[0].max, titan: titan.max };
      // Walk a few seconds on open ground: from where they landed, how far each went.
      for (const e of G.enemies) e.fly = null;
      const from = G.enemies.map((e) => ({ x: e.x, y: e.y }));
      for (let i = 0; i < 60; i++) step(STEP);
      const went = (e) => Math.hypot(e.x - from[G.enemies.indexOf(e)].x, e.y - from[G.enemies.indexOf(e)].y);
      return { count: swarm.length, hp, plain: went(plain), swarm: went(swarm[0]), titan: went(titan), saved: checkGame(JSON.parse(JSON.stringify(G))) };
    });
    expect(out.count).toBe(8);
    expect(out.hp.swarm).toBeLessThan(out.hp.plain);
    expect(out.hp.titan).toBe(out.hp.plain * 10);
    expect(out.swarm).toBeGreaterThan(out.plain * 1.5);
    expect(out.titan).toBeLessThan(out.plain * 0.6);
    expect(out.saved).toBe(true);
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
