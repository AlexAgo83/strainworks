// From the second stage the core asks several recipes at once, drawn when the stage begins, more the further it goes.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

it("draws more recipes each stage, counts each item for its own, and keeps them in the save", async () => {
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
      const bases = new Set(Object.values(DEPOSIT));
      const look = () => ({
        stage: G.stage,
        items: G.goals.map((g) => g.item),
        fair: G.goals.every((g) => contentOf(g.item).match(/.{3}/g).every((gene) => [...gene].every((b) => bases.has(b)) && (g.item.startsWith("A:") || !G.families.includes(gene)))),
        distinct: new Set(G.goals.map((g) => g.item)).size === G.goals.length,
        more: document.querySelector("#order .more")?.textContent,
      });
      const first = look();
      for (let i = 0; i < 100; i++) eat("SFS");
      const stages = [];
      for (let stage = 1; stage < STAGES.length; stage++) {
        refresh();
        stages.push(look());
        const [a, b] = G.goals;
        // Another recipe's item does not count for this one; a recipe met takes no more.
        eat(a.item);
        const counted = [a.fed, b.fed];
        for (const g of G.goals) while (g.fed < g.count) eat(g.item);
        stages[stages.length - 1].counted = counted;
      }
      const after = { stage: G.stage, goals: G.goals.length };
      return { first, stages, after, antidote: stages[2].items.includes(`A:${opposite(G.mutant)}`), heavy: stages[3].items.some((i) => i.startsWith("H:")), valid: checkGame(JSON.parse(JSON.stringify(G))) };
    });
    expect(out.first).toMatchObject({ stage: 0, items: ["SFS"] });
    expect(out.stages.map((s) => s.items.length)).toEqual([2, 3, 3, 4]);
    expect(out.stages.every((s) => s.fair && s.distinct)).toBe(true);
    expect(out.stages.map((s) => s.more)).toEqual(["+1", "+2", "+2", "+3"]);
    expect(out.stages.every((s) => s.counted[0] === 1 && s.counted[1] === 0)).toBe(true);
    // Stage 3 asks strands of two genes.
    expect(out.stages[1].items.filter((i) => i.length === 8).length).toBe(2);
    expect(out.antidote).toBe(true);
    expect(out.heavy).toBe(true);
    expect(out.after).toEqual({ stage: 5, goals: 0 });
    expect(out.valid).toBe(true);
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
