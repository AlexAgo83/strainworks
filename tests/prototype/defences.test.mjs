// The glue slows, burns and eats genes; the mister hits everything round it; the harpoon runs through a file.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

it("lets the glue, the mister and the harpoon do their work", async () => {
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
      G.breaches = [];
      const run = (s) => { for (let i = 0; i < s * 20; i++) step(0.05); };
      // Glue: a creature walking across it toward the core, with and without genes.
      const core = coreCell(), gy = core.y + 1, glue = put("glue", core.x - 8, gy, 0);
      glue.stock = Array(10).fill("SFN");
      G.enemies = [{ x: core.x - 11, y: gy + 1, gene: "SFN", hp: 200, max: 200, tier: 0 }];
      run(12);
      const glued = { x: G.enemies[0]?.x, hp: G.enemies[0]?.hp, left: glue.stock.length };
      // Its hold is the nine cells round it, its own among them.
      const zone = [glueOver(glue.x + 1.5, glue.y - 0.5) === glue, glueOver(glue.x - 0.5, glue.y + 1.9) === glue, glueOver(glue.x + 2.5, glue.y + 0.5), glueOver(glue.x + 0.5, glue.y - 1.2)];
      glue.stock = [];
      G.enemies = [{ x: core.x - 11, y: gy + 1, gene: "SFN", hp: 200, max: 200, tier: 0 }];
      run(12);
      const dry = { x: G.enemies[0]?.x, hp: G.enemies[0]?.hp };
      // Mister: a ring of eight swarmlings, all hit by one puff.
      const mist = put("mist", core.x - 20, core.y - 20, 0);
      mist.ammo = { [opposite("CNS")]: 5 };
      G.enemies = Array.from({ length: 8 }, (_, i) => ({ x: mist.x + 0.5 + Math.cos(i) * 1.5, y: mist.y + 0.5 + Math.sin(i) * 1.5, gene: "CNS", hp: 50, max: 50, tier: 0, kind: "swarm" }));
      fire(0.05);
      const misted = G.enemies.filter((e) => e.hp < 50).length;
      // Harpoon: capsules only, then one bolt through a file of three.
      const harpoon = put("harpoon", core.x + 20, core.y + 20, 0);
      const takesGene = accepts(harpoon, "SFN", 0), takesBox = accepts(harpoon, `A:${opposite("FSN")}`, 0);
      harpoon.ammo = { [opposite("FSN")]: 6 };
      G.enemies = [3, 5, 7].map((d) => ({ x: harpoon.x + 0.5, y: harpoon.y + 0.5 - d, gene: "FSN", hp: 500, max: 500, tier: 0 }));
      fire(0.05);
      const pierced = G.enemies.filter((e) => e.hp < 500).length;
      return { zone, glued, dry, misted, takesGene, takesBox, pierced, needs: [NEEDS.glue, NEEDS.mist, NEEDS.harpoon], ranks: ["glue", "mist", "harpoon"].every((t) => RANKS[t]) };
    });
    expect(out.zone).toEqual([true, true, null, null]);
    expect(out.glued.hp).toBeLessThan(out.dry.hp);
    expect(out.glued.x).toBeLessThan(out.dry.x);
    expect(out.glued.left).toBeLessThan(10);
    expect(out.misted).toBe(8);
    expect(out.takesGene).toBe(false);
    expect(out.takesBox).toBe(true);
    expect(out.pierced).toBe(3);
    expect(out.needs).toEqual([1, 3, 4]);
    expect(out.ranks).toBe(true);
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
