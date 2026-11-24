// The core's card is a diagram: one demand at a time, its recipe drawn down to the core, what the stage gives behind
// its info button, with pictures and no codes in letters (docs/design/core-panel-v2).
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

it("draws what the core wants, its recipe and what it gives, for every stage", async () => {
  const browser = await launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", (route) =>
      route.request().url().startsWith("http://proto.test") ? route.fulfill({ body: pageHTML(), contentType: "text/html" }) : route.abort(),
    );
    await page.goto("http://proto.test/prototype/");
    const stages = await page.evaluate(() => {
      paused = true;
      const seen = [];
      for (const stage of [0, 1, 2]) {
        G.stage = stage;
        G.fed = 25;
        G.held = 12;
        select(key(CORE.x, CORE.y));
        refresh();
        paintInfo();
        const sheet = document.querySelector("#sheet");
        const text = sheet.textContent;
        seen.push({
          shown: !sheet.hidden && document.querySelector("#message").hidden,
          demands: sheet.querySelectorAll(".demand").length,
          machines: [...sheet.querySelectorAll(".recipe .machine")].map((m) => m.getAttribute("aria-label")),
          pictures: sheet.querySelectorAll(".recipe .node svg").length > 0 && sheet.querySelectorAll(".demand .gene svg").length > 0,
          gives: 0,
          letters: /(?<![\p{L}])[SFCN]{3}(?![\p{L}])/u.test(text),
          carbon: sheet.querySelector('.recipe [aria-label="carbone"]') != null,
          heart: sheet.querySelector('.recipe .heart') != null,
        });
        // What the stage unlocks sits behind the info button, out of the main view; touched again, it goes back.
        sheet.querySelector('[data-sheet-tab="info"]').click();
        seen.at(-1).gives = document.querySelectorAll("#sheet .gives > span").length;
        seen.at(-1).recipeInInfo = document.querySelector("#sheet .recipe") != null;
        document.querySelector('#sheet [data-sheet-tab="info"]').click();
        seen.at(-1).back = document.querySelector("#sheet .recipe") != null;
      }
      return seen;
    });
    // One demand, its recipe from the bases down to the heart, what it unlocks behind the info button.
    expect(stages[0]).toMatchObject({ shown: true, demands: 1, machines: ["Ligase"], pictures: true, letters: false, carbon: false, heart: true });
    expect(stages[1]).toMatchObject({ shown: true, demands: 1, machines: ["Ligase", "Encapsuleur"], pictures: true, letters: false, carbon: true });
    expect(stages[2]).toMatchObject({ shown: true, demands: 1, machines: ["Ligase", "Ligase", "Assembleur", "Encapsuleur"], pictures: true, letters: false, carbon: true });
    expect(stages.every((s) => s.gives > 0 && !s.recipeInInfo && s.back)).toBe(true);
    // Another piece keeps its card in words.
    const other = await page.evaluate(() => {
      const belt = Object.values(G.cells).find((c) => c.type === "belt");
      select(key(belt.x, belt.y));
      refresh();
      paintInfo();
      return [document.querySelector("#sheet").hidden, document.querySelector("#message").hidden];
    });
    expect(other).toEqual([true, false]);
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
