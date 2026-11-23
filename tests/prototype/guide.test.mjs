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
        // Shown: the circle on the map, or the arrow pointing at it when it is out of sight.
        spot: !document.querySelector("#guide-spot").hidden || !document.querySelector("#guide-arrow").hidden,
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
      // Take the Ligase: the family, then the machine in it, stand out with its key; the rest of the dock steps back.
      openFamily("fab");
      paintGuide();
      const pod = document.querySelector('#tools .tray[data-tray="fab"] [data-type="ligase"]');
      const lit = [pod.classList.contains("call"), pod.dataset.guideKey?.startsWith("Maj+"), document.querySelector("#tools").classList.contains("guide-dim"), document.querySelector("#guide-why").textContent.includes("Ouvre")];
      choose("ligase");
      paintGuide();
      seen.push(read());
      // Placed on the spot offered, the guide draws the belt from an S harvester to input 1.
      const l = ui.guidePoint;
      const lig = put("ligase", Math.floor(l.x), Math.floor(l.y), 0);
      paintGuide();
      placeGuideSpot();
      seen.push({ ...read(), trace: !document.querySelector("#guide-trace").hidden, ports: !document.querySelector("#guide-ports").hidden });
      // Off screen, an arrow points at the spot and takes the view there.
      const was = { x: cam.x, y: cam.y };
      cam.x += 60;
      placeGuideSpot();
      const arrow = [!document.querySelector("#guide-arrow").hidden, document.querySelector("#guide-spot").hidden];
      document.querySelector("#guide-arrow").click();
      const travels = Math.abs((ui.travel ?? cam).x - ui.guidePoint.x) < 1e-9;
      ui.travel = null;
      Object.assign(cam, was);
      // A wrong base in an input does not complete its step, and the guide says so.
      lig.ports[0].push("F");
      paintGuide();
      const wrong = [G.guide.step, document.querySelector("#guide-why").textContent.includes("il lui faut")];
      lig.ports[0].length = 0;
      // The right base completes it.
      lig.ports[0].push("S");
      paintGuide();
      seen.push(read());
      lig.ports[1].push("F");
      paintGuide();
      lig.ports[2].push("S");
      paintGuide();
      seen.push(read());
      G.fed = 1;
      paintGuide();
      return { seen, steady, lit, arrow, travels, wrong, dna: G.dna - dna, done: document.querySelector("#guide").hidden, bases: [depositAt(Math.floor(s.x), Math.floor(s.y)), depositAt(Math.floor(f.x), Math.floor(f.y))] };
    });
    expect(out.seen[0]).toMatchObject({ step: 0, shown: true, called: ["rec"], spot: true, pictured: 1 });
    expect(out.seen[0].title).toBe("Pose un récolteur sur");
    expect(out.seen[1]).toMatchObject({ step: 1, called: ["rec"] });
    expect(out.seen[2]).toMatchObject({ step: 3, called: ["fab"], spot: false });
    expect(out.lit).toEqual([true, true, true, true]);
    expect(out.seen[3]).toMatchObject({ step: 4, called: [], spot: true });
    expect(out.seen[4]).toMatchObject({ step: 5, called: ["tra"], spot: true, trace: true, ports: true });
    expect(out.arrow).toEqual([true, true]);
    expect(out.travels).toBe(true);
    expect(out.wrong).toEqual([5, true]);
    expect(out.seen[5]).toMatchObject({ step: 6 });
    expect(out.seen[6]).toMatchObject({ step: 8, spot: true });
    expect(out.steady).toEqual([0, 0, 0.5, 0.5]);
    expect(out).toMatchObject({ dna: 45, done: true, bases: ["S", "F"] });
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
