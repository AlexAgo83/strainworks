// The guided start: steps checked on what is built, the family and the spot lit, +5 ADN a step.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

it("guides a new game to its first line into the core", async () => {
  const browser = await launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", (route) =>
      route.request().url().startsWith("http://proto.test") ? route.fulfill({ body: pageHTML(), contentType: "text/html" }) : route.abort(),
    );
    await page.goto("http://proto.test/prototype/");
    const out = await page.evaluate(() => {
      paused = true;
      startGuide();
      paintGuide();
      placeGuideSpot();
      const read = () => (placeGuideSpot(), {
        step: G.guide.step,
        shown: !document.querySelector("#guide").hidden,
        called: [...document.querySelectorAll("#tools .family.call")].map((b) => b.dataset.family),
        spot: !document.querySelector("#guide-spot").hidden,
        title: document.querySelector("#guide-title").textContent,
        pictured: document.querySelectorAll("#guide-title svg").length,
      });
      const seen = [read()];
      const dna = G.dna;
      // The spot is a free S cell: building there completes the step.
      const s = ui.guidePoint;
      // Painted again, the circle stays on the middle of the same cell.
      paintGuide();
      const steady = [ui.guidePoint.x - s.x, ui.guidePoint.y - s.y, s.x % 1, s.y % 1];
      put("mine", Math.floor(s.x), Math.floor(s.y), 1);
      paintGuide();
      seen.push(read());
      const f = ui.guidePoint;
      put("mine", Math.floor(f.x), Math.floor(f.y), 1);
      paintGuide();
      const s2 = ui.guidePoint;
      put("mine", Math.floor(s2.x), Math.floor(s2.y), 1);
      paintGuide();
      seen.push(read());
      put("ligase", CORE.x - 6, CORE.y + 6, 1);
      paintGuide();
      seen.push(read());
      G.fed = 1;
      paintGuide();
      return { seen, steady, dna: G.dna - dna, done: document.querySelector("#guide").hidden, bases: [depositAt(Math.floor(s.x), Math.floor(s.y)), depositAt(Math.floor(f.x), Math.floor(f.y))] };
    });
    expect(out.seen[0]).toMatchObject({ step: 0, shown: true, called: ["rec"], spot: true, pictured: 1 });
    expect(out.seen[0].title).toBe("Pose un récolteur sur");
    expect(out.seen[1]).toMatchObject({ step: 1, called: ["rec"] });
    expect(out.seen[2]).toMatchObject({ step: 3, called: ["fab"], spot: false });
    expect(out.seen[3]).toMatchObject({ step: 4, called: ["tra"], spot: true });
    expect(out.steady).toEqual([0, 0, 0.5, 0.5]);
    expect(out).toMatchObject({ dna: 25, done: true, bases: ["S", "F"] });
    // Hidden, it waits behind a button; the menu starts it again.
    const again = await page.evaluate(() => {
      startGuide();
      document.querySelector("#guide-hide").click();
      const hidden = [document.querySelector("#guide").hidden, document.querySelector("#guide-open").hidden];
      document.querySelector("#guide-show").click();
      return [...hidden, document.querySelector("#guide").hidden];
    });
    expect(again).toEqual([true, false, false]);
    // Folded, its button and the events do not overlap.
    const apart = await page.evaluate(() => {
      document.querySelector("#guide-hide").click();
      tell("Partie reprise.");
      const b = document.querySelector("#guide-open").getBoundingClientRect(), e = document.querySelector("#events").getBoundingClientRect();
      return e.top >= b.bottom;
    });
    expect(apart).toBe(true);
    // Passer ends it, nothing left on screen.
    const dropped = await page.evaluate(() => {
      document.querySelector("#guide-drop").click();
      return [G.guide.step === GUIDE.length, document.querySelector("#guide").hidden, document.querySelector("#guide-open").hidden];
    });
    expect(dropped).toEqual([true, true, true]);
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
