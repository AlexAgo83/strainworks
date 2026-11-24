// The laboratory: one per game, where DNA buys upgrades, each level opening at a stage.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

it("is built once, sells drones and upgrades level by level as the stages open, and keeps them in the save", async () => {
  const browser = await launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, recipes: true, line: false });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", (route) => (route.request().url().startsWith("http://proto.test") ? route.fulfill({ body: pageHTML(), contentType: "text/html" }) : route.abort()));
    await page.goto("http://proto.test/prototype/");
    const out = await page.evaluate(() => {
      begin();
      paused = true;
      G.dna = 5000;
      const start = G.drones.length;
      const noLab = buyLab("drones");
      put("lab", 20, 70, 0);
      const second = choose("lab") === undefined && tool === "lab";
      const dna = G.dna;
      const first = [buyLab("drones"), G.drones.length, dna - G.dna];
      const tooEarly = buyLab("drones");
      G.stage = 1;
      const then = [buyLab("drones"), G.drones.length];
      const reachEarly = buyLab("reach");
      G.stage = 2;
      buyLab("reach");
      select(key(20, 70));
      paintInfo();
      const sheet = document.querySelectorAll("#sheet .up").length;
      return { start, noLab, second, first, tooEarly, then, reachEarly, reach: reachOf("turret"), sheet, valid: checkGame(JSON.parse(JSON.stringify(G))) };
    });
    expect(out.start).toBe(2);
    expect(out.noLab).toBeFalsy();
    expect(out.second).toBe(false);
    expect(out.first).toEqual([true, 3, 60]);
    expect(out.tooEarly).toBeFalsy();
    expect(out.then).toEqual([true, 4]);
    expect(out.reachEarly).toBeFalsy();
    expect(out.reach).toBeCloseTo(6.8 * 1.1, 5);
    expect(out.sheet).toBe(8);
    expect(out.valid).toBe(true);
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
