// Buildings of 2x2 cells: where they fit, what they carry, and that every rule sees their four cells.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

it("stores and harvests on four cells", async () => {
  const html = pageHTML();
  const browser = await launch();
  try {
    const page = await browser.newPage({ viewport: { width: 375, height: 700 }, hasTouch: true });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", (route) => (route.request().url().startsWith("http://proto.test") ? route.fulfill({ body: html, contentType: "text/html" }) : route.abort()));
    await page.goto("http://proto.test/");
    const out = await page.evaluate(() => {
      const run = (seconds, each) => {
        for (let i = 0; i < Math.round(seconds / STEP); i++) {
          each?.();
          step(STEP);
        }
      };
      const lab = () => {
        begin();
        paused = true;
        G.open = true;
        G.breaches = [];
        G.dna = 1000;
      };
      const refused = (type) => {
        choose("hand");
        choose(type);
        return tool !== type;
      };
      const out = {};

      lab();
      G.open = false;
      out.locked = [refused("borer"), refused("vault")];
      G.stage = 2;
      out.open = [refused("borer"), refused("vault")];

      // Any of the four cells is the same building, and nothing overlaps it.
      lab();
      choose("vault");
      place(20, 80);
      const v = G.cells["20,80"];
      v.left = 0;
      out.covers = [[20, 80], [21, 80], [20, 81], [21, 81]].map(([x, y]) => cellAt(x, y) === v);
      out.outside = [cellAt(22, 80), cellAt(19, 80)].map(Boolean);
      choose("hand");
      place(21, 81);
      out.selected = selected;
      choose("wall");
      place(21, 81);
      out.noOverlap = !G.cells["21,81"];

      // The square slides to fit round the finger, and says why when none does.
      lab();
      const field = OUTER.find(([, , , w, h]) => w >= 4 && h >= 3);
      const kind = field[0];
      const { x: fx, y: fy } = squareIn(field);
      choose("borer");
      out.slides = siteFor("borer", fx + 1, fy + 1);
      out.wanted = { x: fx, y: fy };
      out.noDeposit = siteFor("borer", 5, 5).why;
      put("wall", 31, 81, 0);
      put("wall", 29, 79, 0);
      put("wall", 31, 79, 0);
      put("wall", 29, 81, 0);
      out.noRoom = siteFor("vault", 30, 80).why;

      // Six harvesters' worth, out by as many belts as are plugged.
      const pulled = (doors, richness) => {
        lab();
        G.cells = {};
        put("core", CORE.x, CORE.y, 0);
        const { x, y } = squareIn(OUTER.find((f) => f[0] !== "K" && richAt(patchOf(f).list[0].x, patchOf(f).list[0].y) === richness));
        const b = put("borer", x, y, 0);
        const ends = edgesOf(b).slice(0, doors).map((d) => {
          const belt = put("belt", d.x + DX[d.dir], d.y + DY[d.dir], d.dir);
          return put("cyst", belt.x + DX[d.dir], belt.y + DY[d.dir], d.dir);
        });
        run(2);
        let got = 0;
        for (const end of ends) end.stock = [];
        run(10, () => {
          for (const end of ends) {
            got += end.stock.length;
            end.stock = [];
          }
        });
        return got / 10;
      };
      out.one = pulled(8, 1);
      out.rich = pulled(8, 4);
      out.oneBeltLimits = pulled(1, 4);

      // The large cyst: 360, in by the other faces, out by two mouths.
      lab();
      G.cells = {};
      put("core", CORE.x, CORE.y, 0);
      const store = put("vault", 20, 80, 1);
      out.takes = [accepts(store, "S", 1), accepts(store, "S", 2), accepts(store, "S", 0), accepts(store, "S", 3)];
      store.stock = Array(359).fill("S");
      out.nearlyFull = accepts(store, "S", 1);
      store.stock.push("S");
      out.full = accepts(store, "S", 1);
      store.stock = Array(300).fill("S").map((s, i) => (i % 2 ? "C" : s));
      const ends = [80, 81].map((y) => {
        put("belt", 22, y, 1);
        return put("cyst", 23, y, 1);
      });
      run(10);
      const got = ends.map((end) => end.stock.length);
      out.mouths = got.every((n) => n >= 34 && n <= 42);
      const all = ends.flatMap((end) => end.stock).concat(store.stock);
      for (const c of Object.values(G.cells)) if (isBelt(c) && c.item) all.push(c.item);
      out.nothingLostNorDoubled = [all.length, all.filter((i) => i === "C").length];

      lab();
      const fed = put("vault", 20, 80, 1);
      put("belt", 19, 81, 1).item = "S";
      put("belt", 21, 79, 2).item = "C";
      run(1);
      out.fed = [fed.stock.length, feeders(fed).length];

      // A bridge and a line read its mouths.
      lab();
      put("vault", 20, 80, 1);
      out.bridge = wayOf(put("bridge", 22, 81, 0), 1);

      // A line drawn out of it starts at its face.
      lab();
      put("vault", 20, 80, 1);
      tool = "belt";
      drag = { x: 20, y: 81, moved: false, existing: true };
      extend({ x: 24, y: 81 });
      drag = null;
      out.drawnOut = [22, 23, 24].map((x) => G.cells[`${x},81`]?.type);

      // Its far corner wakes a breach.
      lab();
      G.breaches = [{ x: 30, y: 80, r: 5, left: 5, total: 5, genes: ["SFN"], state: "sleep", wave: 0, pending: 0 }];
      put("vault", 24, 80, 0);
      run(1);
      out.cornerWakes = G.breaches[0].state;

      // A creature bites the cell it reaches, whichever it is.
      lab();
      const bitten = put("vault", 47, 62, 0);
      G.enemies = [{ x: 48.5, y: 64.2, gene: "SFN", hp: 1e6, max: 1e6 }];
      run(4);
      out.bitten = bitten.hp < 200;

      // Lost, it leaves one ruin of four cells, that comes back whole or gets buried.
      lab();
      G.cells = {};
      put("core", CORE.x, CORE.y, 0);
      G.ruins = { "20,80": { ...cell("vault", 20, 80, 1) } };
      out.ruin = Boolean(ruinAt(21, 81));
      document.querySelector("#rebuild").onclick();
      out.rebuilt = [G.cells["20,80"]?.type, cellAt(21, 81)?.type];
      delete G.cells["20,80"];
      G.ruins = { "20,80": { ...cell("vault", 20, 80, 1) } };
      put("wall", 21, 81, 0);
      document.querySelector("#rebuild").onclick();
      out.buried = [G.ruins["20,80"], G.cells["20,80"]].map(Boolean);

      // Dismantled from any cell, by a drone at its middle.
      lab();
      const gone = put("vault", 20, 80, 1);
      wipe(21, 81);
      out.workAt = workAt({ c: gone, field: "out" });
      run(12);
      out.gone = [cellAt(20, 80), cellAt(21, 81)].map(Boolean);

      lab();
      put("vault", 20, 80, 2).stock = ["S", "C"];
      save();
      load();
      out.saved = [cellAt(21, 81)?.type, cellAt(21, 81)?.stock.length];

      begin();
      paused = true;
      G.open = true;
      put("vault", 44, 60, 1);
      put("borer", fx, fy, 0);
      draw();
      refresh();
      out.kind = depositAt(fx, fy) === kind;
      out.clipped = clippedTools();
      out.fits = document.documentElement.scrollWidth <= 375;
      return out;
    });

    expect(out).toMatchObject({
      locked: [true, true],
      open: [false, false],
      covers: [true, true, true, true],
      outside: [false, false],
      selected: "20,80",
      noOverlap: true,
      slides: out.wanted,
      noDeposit: "4 cases d’un même gisement",
      noRoom: "Il faut 2 × 2 cases libres",
      takes: [true, true, true, false],
      nearlyFull: true,
      full: false,
      mouths: true,
      nothingLostNorDoubled: [300, 150],
      fed: [2, 2],
      bridge: 1,
      drawnOut: ["belt", "belt", "belt"],
      cornerWakes: "wake",
      bitten: true,
      ruin: true,
      rebuilt: ["vault", "vault"],
      buried: [false, false],
      workAt: { x: 21, y: 81 },
      gone: [false, false],
      saved: ["vault", 2],
      kind: true,
      clipped: [],
      fits: true,
    });
    expect(out.one).toBeGreaterThan(5.5);
    expect(out.one).toBeLessThan(6.5);
    expect(out.rich).toBeGreaterThan(21);
    expect(out.oneBeltLimits).toBeLessThan(4.5);
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
