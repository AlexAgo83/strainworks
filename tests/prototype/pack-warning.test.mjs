// An encapsulator working for nothing says so on the map, in its sheet and in the statistics.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

it("tells a box the core does not ask for, and a second gene waiting at the door", async () => {
  const browser = await launch();
  try {
    const page = await browser.newPage({ line: false });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", (route) => (route.request().url().startsWith("http://proto.test") ? route.fulfill({ body: pageHTML(), contentType: "text/html" }) : route.abort()));
    await page.goto("http://proto.test/prototype/");
    const out = await page.evaluate(() => {
      // Genes and carbon from two cysts into an encapsulator, its boxes down a belt into the core.
      const bench = (box, genes, goals) => {
        begin();
        paused = true;
        G.open = true;
        G.breaches = [];
        G.stage = 3;
        G.goals = goals.map((item) => ({ item, count: 40, fed: 0 }));
        const y = CORE.y, x0 = CORE.x - 5;
        put("cyst", x0 - 1, y, 1).stock = [...genes];
        put("cyst", x0, y - 1, 2).stock = Array(60).fill("K");
        const pack = put("pack", x0, y, 1);
        pack.box = box;
        for (let x = x0 + 1; x < CORE.x - 1; x++) put("belt", x, y, 1);
        for (let i = 0; i < 20 * 20; i++) step(0.05);
        return { warning: packWarning(pack), sheet: diagnose(pack), listed: problems().some(([c]) => c === pack), fed: G.goals[0].fed };
      };
      return {
        capsuleForMagazines: bench("T", Array(60).fill("FCS"), ["A:FCS"]),
        magazines: bench("A", Array(60).fill("FCS"), ["A:FCS"]),
        mixed: bench("T", Array(30).fill(0).flatMap(() => ["NNF", "SFS"]), ["T:NNF"]),
      };
    });
    expect(out.capsuleForMagazines.fed).toBe(0);
    expect(out.capsuleForMagazines.warning).toBe("Le cœur demande des chargeurs de FCS : passe en chargeur.");
    expect(out.capsuleForMagazines.sheet).toContain("passe en chargeur");
    expect(out.capsuleForMagazines.listed).toBe(true);
    expect(out.magazines.fed).toBeGreaterThan(0);
    expect(out.magazines.warning).toBe(null);
    expect(out.mixed.warning).toBe("NNF dans la boîte, SFS attend dehors : vide-la pour changer de gène.");
    expect(out.mixed.sheet).toContain("SFS attend dehors");
    expect(out.mixed.listed).toBe(true);
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
