// Stage 5, Noyau: isotope far out, the heavy capsule, a drone at half price in the lab.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

it("deals isotope far out, packs heavy capsules and halves the next drone", async () => {
  const browser = await launch();
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", (route) =>
      route.request().url().startsWith("http://proto.test") ? route.fulfill({ body: pageHTML(), contentType: "text/html" }) : route.abort(),
    );
    await page.goto("http://proto.test/prototype/");
    const seen = await page.evaluate(() => {
      begin();
      paused = true;
      G.breaches = [];
      // Isotope only from level 3 out.
      let far = 0, near = 0;
      for (let sx = -16; sx <= 16; sx++) for (let sy = -16; sy <= 16; sy++) {
        const f = sector(sx, sy)?.field;
        if (f?.[0] !== "I") continue;
        if (tierAt(f[1] + f[3] / 2, f[2] + f[4] / 2) >= 2) far++; else near++;
      }
      // Harvested only from stage 5 on.
      const locked = minable("I");
      G.stage = 4;
      const open = minable("I");
      // The heavy capsule: 12 strands behind, 2 carbon and 1 isotope on the side, nothing more.
      put("pack", 70, 40, 1);
      const c = G.cells["70,40"];
      c.left = 0;
      setRecipe(c, "H");
      const side = ["K", "K", "K", "I", "I"].map((k) => packTakes(c, k, 1) && (c.ports[1].push(k), true));
      for (let i = 0; i < 12; i++) c.ports[0].push("SFSFFF");
      c.portDue = [[], [], []];
      c.clock = 1.5;
      flow(0.01);
      const made = c.item;
      // Entering Noyau halves the next drone's price; the six places of the panel show the three held.
      G.stage = 3;
      G.fed = 29;
      eat(STAGES[3].item);
      paintDrones();
      return { far: far > 0, near, locked, open, side, made, stage: STAGES[G.stage].name, drones: G.drones.length, discount: G.labDiscount === true, held: document.querySelectorAll("#drones .pip:not(.locked)").length };
    });
    expect(seen).toEqual({ far: true, near: 0, locked: false, open: true, side: [true, true, false, true, false], made: "H:SFSFFF", stage: "Noyau", drones: 3, discount: true, held: 3 });
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
