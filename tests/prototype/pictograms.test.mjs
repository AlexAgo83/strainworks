// A gene is never shown in letters: its pictograms stand for it, in every sentence.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

it("draws every code and leaves the words alone", async () => {
  const browser = await launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", (route) =>
      route.request().url().startsWith("http://proto.test") ? route.fulfill({ body: pageHTML(), contentType: "text/html" }) : route.abort(),
    );
    await page.goto("http://proto.test/prototype/");
    const out = await page.evaluate(() => {
      begin();
      paused = true;
      G.open = true;
      // Its own element: innerText only tells what is seen on one that is shown.
      const el = document.body.appendChild(document.createElement("p"));
      const shown = (text) => {
        write(el, text);
        return el.innerText;
      };
      const left = [];
      const check = (from, text) => {
        // Letters of a code that a reader would still see.
        const seen = shown(text);
        if (/(^|[^\p{L}\p{N}’'])([SFCN]{3}|[SFCN]{6}|[TA]:[SFCN]+|[SFCNK])(?![\p{L}\p{N}’'])/u.test(seen)) left.push([from, seen]);
      };

      const world = (make) => {
        begin();
        paused = true;
        G.open = true;
        G.breaches = [];
        return make();
      };
      const cases = {
        core: () => G.cells[key(CORE.x, CORE.y)],
        coreStrand: () => {
          G.stage = 2;
          return G.cells[key(CORE.x, CORE.y)];
        },
        turret: () => Object.assign(put("turret", 20, 80, 0), { ammo: { CNF: 9, CSS: 2 } }),
        sorter: () => Object.assign(put("sort", 20, 80, 0), { want: "C?F" }),
        sorterBase: () => Object.assign(put("sort", 20, 80, 0), { want: "C" }),
        sorterStuck: () => Object.assign(put("sort", 20, 80, 0), { want: "C", item: "T:CCF", t: 1 }),
        pack: () => Object.assign(put("pack", 20, 80, 0), { ports: [["CCF"], ["K"], []] }),
        join: () => Object.assign(put("join", 20, 80, 0), { last: "SFSFFF" }),
        ligase: () => Object.assign(put("ligase", 20, 80, 0), { last: "SFS", ports: [["S"], ["F"], []] }),
        pocket: () => Object.assign(put("pocket", 20, 80, 0), { stock: ["A:CNF"] }),
        pump: () => Object.assign(put("pump", 20, 80, 0), { stock: ["K"] }),
        mine: () => G.cells["59,44"],
      };
      for (const [name, make] of Object.entries(cases)) check(name, diagnose(world(make)));
      check("worm", wormState({ left: 0, hp: 150, docked: true, holds: [{ n: 4, kind: "S" }, { n: 2, kind: "T:SFSFFF" }, { n: 0, kind: "" }] }));

      // The words that only look like codes.
      const words = "C’est MK2, S’ouvre au stade 2 : Feu, Nerf, Kyste. F5 ou R.";
      const kept = shown(words) === words;

      write(el, "Moteur (SFS), filtre C?F");
      const marks = [...el.querySelectorAll(".gene")];
      const drawn = marks.map((m) => [m.querySelectorAll("svg").length, m.getAttribute("aria-label")]);
      return { left, kept, drawn, text: el.textContent };
    });
    expect(out.left).toEqual([]);
    expect(out.kept).toBe(true);
    expect(out.text).toBe("Moteur (SFS), filtre C?F");
    expect(out.drawn).toEqual([
      [3, "Spore, Fibre, Spore"],
      [3, "Chitine, n’importe laquelle, Fibre"],
    ]);
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
