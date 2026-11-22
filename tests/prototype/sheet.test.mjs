// The core's card is a diagram: what it wants, how to make it, what it gives, with pictures and no codes in letters.
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
          titles: [...sheet.querySelectorAll("h3")].map((h) => h.textContent),
          steps: sheet.querySelectorAll(".step").length,
          machines: [...sheet.querySelectorAll(".machine")].map((m) => m.getAttribute("aria-label")),
          pictures: sheet.querySelectorAll(".gene svg").length > 0,
          gives: sheet.querySelectorAll(".gives > span").length,
          letters: /(?<![\p{L}])[SFCN]{3}(?![\p{L}])/u.test(text),
          carbon: /carbone/.test(text),
        });
      }
      return seen;
    });
    expect(stages[0]).toMatchObject({ shown: true, titles: ["Il réclame", "Recette", "Débloque"], steps: 1, machines: ["Ligase"], pictures: true, letters: false, carbon: false });
    expect(stages[1]).toMatchObject({ shown: true, steps: 2, machines: ["Ligase", "Encapsuleur"], pictures: true, letters: false, carbon: true });
    expect(stages[2]).toMatchObject({ shown: true, steps: 4, machines: ["Ligase", "Ligase", "Assembleur", "Encapsuleur"], pictures: true, letters: false, carbon: true });
    expect(stages.every((s) => s.gives > 0)).toBe(true);
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
