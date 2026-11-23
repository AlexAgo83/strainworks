// Stage 4, Système: a family is born on entering, another every five minutes up to eight,
// and the core asks for magazines of the first one's antidote.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

it("mutates on entering the system stage and every five minutes after", async () => {
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
      G.stage = 2;
      G.fed = 9;
      const before = G.families.length;
      eat("T:SFSFFF");
      const born = G.mutant, want = STAGES[G.stage];
      const entered = [G.stage, want.name, G.families.length - before, want.item === `A:${opposite(born)}`, born[0] !== born[2]];
      // The magazine asked counts toward the stage, any other pays ADN.
      eat(want.item);
      const fed = G.fed;
      G.time = G.mutateAt + 1;
      menace(0.05);
      const later = G.families.length - before;
      G.families = G.families.slice(0, 8);
      while (G.families.length < 8) G.families.push(["SSS", "CCC", "FFF", "NNN", "SCS", "FCF", "NSN", "CNS"].find((g) => !G.families.includes(g)));
      G.time = G.mutateAt + 1;
      menace(0.05);
      return { entered, fed, later, capped: G.families.length, asked: want.item === `A:${opposite(born)}` };
    });
    expect(seen).toEqual({ entered: [3, "Système", 1, true, true], fed: 1, later: 2, capped: 8, asked: true });
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});

it("spreads mutations over the nearest belt's breaches, then the next belts", async () => {
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
      const nest = (tier, i) => ({ x: CORE.x + 20 + tier * 30, y: CORE.y + i * 12, r: 5, left: 10, total: 10, state: "sleep", genes: ["SSF"], tier });
      G.breaches = [nest(0, 0), nest(0, 1), nest(0, 2), nest(1, 0), nest(1, 1), nest(1, 2), nest(2, 0)];
      const firstOuter = [];
      for (let n = 0; n < 18; n++) {
        const b = mutationTarget();
        if (b.tier > 0 && !firstOuter.length) firstOuter.push(n);
        b.mutations = (b.mutations || 0) + 1;
      }
      const per = G.breaches.map((b) => b.mutations || 0);
      return { firstOuter: firstOuter[0], most: Math.max(...per), inner: per.slice(0, 3).reduce((a, n) => a + n, 0), farthest: per[6] };
    });
    // The first belt alone takes the first six (two each on average), the second then opens; none piles up.
    expect(seen.firstOuter).toBeGreaterThanOrEqual(6);
    expect(seen.most).toBeLessThanOrEqual(4);
    expect(seen.inner).toBeLessThan(18);
    expect(seen.farthest).toBeLessThanOrEqual(2);
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
