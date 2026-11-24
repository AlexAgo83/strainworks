// Every building draws in 2D and 3D in odd states (empty, half loaded, a save with nulls) without throwing,
// and a save from 0.1.28 with an arm holding null loads clean.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

it("draws every building in odd states and cleans an arm's null hand on load", async () => {
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
      const g = document.createElement("canvas").getContext("2d"), broken = [];
      const states = [{}, { item: null, last: "", hold: [], stock: [] }, { hold: ["SFN"], item: "SFN", last: "SFN", stock: ["SFN"] }, { hold: [null], item: null }];
      let x = 20;
      for (const type of Object.keys(TYPES)) {
        if (["hand", "erase", "track", "worm", "wire", "core"].includes(type)) continue;
        x += 3;
        const c = put(type, x, 90, 1);
        for (const s of states) {
          Object.assign(c, s);
          try { drawCell(g, c, []); } catch (e) { broken.push(`${type}: ${e.message}`); }
        }
      }
      // A 0.1.28 save: an arm with null in its hand.
      const arm = put("arm", 60, 60, 1);
      arm.hold = [null];
      const text = JSON.stringify(G);
      localStorage.setItem(SAVE, text);
      openSlot(0, SAVE, "test");
      const loaded = load();
      const hand = G.cells[key(60, 60)]?.hold;
      return { broken, loaded, hand };
    });
    expect(out.broken).toEqual([]);
    expect(out.loaded).toBe(true);
    expect(out.hand).toEqual([]);
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
