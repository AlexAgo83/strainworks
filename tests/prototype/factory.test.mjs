// Carbon and containers: the recipe, who takes what, smart reading, throughput, transport, saves.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

it("packs genes in carbon", async () => {
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
        G.enemies = [];
        G.cells = {};
        put("core", CORE.x, CORE.y, 0);
      };
      const packer = (box) => {
        const p = put("pack", 20, 80, 1);
        setRecipe(p, box);
        return p;
      };
      const out = {};

      // Carbon lies free near the base, harvests, and stays out of the genetic code.
      lab();
      const carbonField = OUTER.find(([kind]) => kind === "K");
      begin();
      paused = true;
      const carbon = patchOf(carbonField).list;
      const { x: kx, y: ky } = carbon.reduce((low, c) => (c.y > low.y ? c : low));
      let clear = true;
      for (const { x, y } of carbon) {
        if (!buildable(x, y) || G.cells[key(x, y)] || OUTER.some((f) => f[0] !== "K" && patchOf(f).cells.has(key(x, y)))) clear = false;
        if (G.breaches.some((b) => Math.hypot(x - b.x, y - b.y) <= b.r)) clear = false;
      }
      out.depositFree = [clear, depositAt(kx, ky), richAt(kx, ky)];
      const mine = put("mine", kx, ky, 1);
      run(1.1);
      out.mined = mine.item;
      out.neverAGene = [accepts(put("ligase", 20, 70, 0), "K", 1), accepts(put("turret", 22, 70, 0), "K", 1), accepts(G.cells[key(CORE.x, CORE.y)], "K", 1), "K" in BASE];

      // Six and the carbon, not one less.
      out.recipes = {};
      for (const [box, gene] of [["A", "CNF"], ["T", "CCF"], ["T", "SFSFFF"]]) {
        const tries = [];
        for (const [genes, carbon] of [[5, 4], [6, BOX[box].carbon - 1], [6, BOX[box].carbon]]) {
          lab();
          const p = packer(box);
          p.ports = [Array(genes).fill(gene), Array(carbon).fill("K"), []];
          run(1.2);
          tries.push([p.item, p.ports[0].length, p.ports[1].length]);
        }
        out.recipes[`${box}${gene}`] = tries;
      }

      lab();
      let p = packer("A");
      p.ports[0] = ["CNF"];
      // Travel 1 comes in from behind, travel 2 from the left, travel 0 from the right.
      out.doors = [accepts(p, "CNF", 1), accepts(p, "SSC", 1), accepts(p, "K", 2), accepts(p, "K", 1), accepts(p, "CNF", 2), accepts(p, "K", 0)];
      p.flip = true;
      out.flipped = [accepts(p, "K", 0), accepts(p, "K", 2)];
      p.ports[0] = [];
      out.magazineTakes = [accepts(p, "SFSFFF", 1), accepts(p, "S", 1), accepts(p, "A:CNF", 1)];
      setRecipe(p, "T");
      out.capsuleTakes = [accepts(p, "SFSFFF", 1), accepts(p, "T:CCF", 1)];
      p.ports[0] = ["SFSFFF"];
      setRecipe(p, "A");
      out.switchDropsStrands = p.ports[0].length;

      // Who takes a container.
      lab();
      const t = put("turret", 30, 80, 0);
      receive(t, "A:CNF", 1);
      out.magazineLoads = t.ammo.CNF;
      t.ammo.CNF = 18;
      out.holds24 = [accepts(t, "A:CNF", 1), accepts(t, "CNF", 1)];
      t.ammo.CNF = 19;
      out.notMore = accepts(t, "A:CNF", 1);
      out.noCapsuleInTurret = accepts(put("turret", 32, 80, 0), "T:CNF", 1);
      const core = G.cells[key(CORE.x, CORE.y)];
      const dna = G.dna;
      receive(core, "T:CCF", 0);
      receive(core, "A:CNF", 0);
      receive(core, "T:SFSFFF", 0);
      out.worth = G.dna - dna;

      G.stage = 2;
      G.fed = 0;
      receive(core, "SFSFFF", 0);
      out.looseDoesNotCount = G.fed;
      receive(core, "T:SFSFFF", 0);
      out.capsuleCounts = G.fed;

      // Filters and nerves read inside.
      lab();
      const s = put("sort", 20, 75, 1);
      s.want = "CNF";
      out.filter = [fits(s, "CNF"), fits(s, "A:CNF"), fits(s, "A:SSC")];
      s.want = "K";
      out.filterCarbon = [fits(s, "K"), fits(s, "C")];
      const gun = put("turret", 20, 20, 0);
      const gate = put("gate", 26, 20, 1);
      gate.open = false;
      wireUp(gun, gate);
      G.wires[0].left = 0;
      G.enemies.push({ x: 20.5, y: 17, gene: "SFN", hp: 1e9, max: 1e9 });
      sense();
      out.smart = ["CNF", "A:CNF", "A:SSC", "T:CNF", "K"].map((item) => accepts(gate, item, 1));
      put("cyst", 25, 25, 0).stock = ["CNF", "A:CNF"];
      out.stock = stockOf("CNF");

      // One belt, what its turrets get: loose, then boxed.
      const delivered = (item) => {
        lab();
        for (let x = 20; x < 26; x++) put("belt", x, 80, 1);
        const source = put("cyst", 19, 80, 1);
        const end = put("turret", 26, 80, 0);
        let got = 0;
        run(20, () => {
          while (source.stock.length < 20) source.stock.push(item);
          for (const [gene, n] of Object.entries(end.ammo)) {
            got += n;
            end.ammo[gene] = 0;
          }
        });
        return got / 20;
      };
      const loose = delivered("CNF");
      const boxed = delivered("A:CNF");
      out.sixTimesTheFlow = boxed / loose > 5.5;
      out.eightTurrets = Math.round(boxed / 3) >= 7;

      // A whole line, carbon from a real deposit.
      begin();
      paused = true;
      G.open = true;
      G.breaches = [];
      put("mine", kx, ky, 2);
      for (let y = ky + 1; y < ky + 3; y++) put("belt", kx, y, 2);
      p = put("pack", kx, ky + 3, 1);
      setRecipe(p, "A");
      const genes = put("cyst", kx - 1, ky + 3, 1);
      const target = put("turret", kx + 1, ky + 3, 0);
      run(15, () => {
        while (genes.stock.length < 12) genes.stock.push("CNF");
      });
      out.wholeLine = target.ammo.CNF >= 18;

      // Veins and worms carry them, a save and a rebuild keep the recipe.
      lab();
      const a = put("pump", 10, 90, 0);
      const b = put("pump", 20, 90, 0);
      link(a, b);
      a.veinLeft = 0;
      for (let i = 0; i < 8; i++) a.stock.push("A:CNF");
      run(3);
      out.vein = b.stock.length === 8 && b.stock[0] === "A:CNF";
      layTrack(20, 70, 1).left = 0;
      incubate(20, 70);
      G.worms[0].left = 0;
      G.worms[0].holds[0] = { kind: "T:SFSFFF", n: 4 };
      out.worm = wormState(G.worms[0]).includes("capsule SFSFFF");
      p = packer("A");
      p.flip = true;
      save();
      load();
      out.saved = [G.cells["20,80"].box, G.cells["20,80"].flip];
      const again = G.cells["20,80"];
      G.ruins["20,80"] = { type: "pack", x: 20, y: 80, dir: 1, flip: true, box: again.box };
      delete G.cells["20,80"];
      document.querySelector("#rebuild").onclick();
      out.rebuilt = [G.cells["20,80"].box, G.cells["20,80"].flip];

      // A game saved during Organe counted strands, it now counts capsules.
      G.stage = 2;
      G.fed = 42;
      delete G.capsules;
      save();
      load();
      out.oldSave = [G.fed, G.capsules];

      // Out there carbon is extra, never in place of what was.
      lab();
      G.seed = 12345;
      const found = [];
      eachSector(-600, -600, 700, 700, (sector) => {
        if (sector.field[0] === "K") found.push(sector);
      });
      out.farCarbon = found.length > 10 && found.every(({ field, breach, rich }) => {
        if (breach || rich < 2 || rich > 6) return false;
        // And nothing guards it.
        return patchOf(field).list.every((c) => richAt(c.x, c.y) === rich && !breachesIn(c.x, c.y, c.x, c.y).some((b) => Math.hypot(c.x - b.x, c.y - b.y) <= b.r));
      });

      begin();
      paused = true;
      G.stage = 1;
      put("pack", 50, 56, 0).ports = [["CCF", "CCF"], ["K"], []];
      put("belt", 50, 55, 0).item = "T:CCF";
      refresh();
      draw();
      out.brief = document.querySelector("#order").textContent + document.querySelector("#brief").textContent;
      out.fits = document.documentElement.scrollWidth <= 375;
      return out;
    });

    expect(out).toMatchObject({
      depositFree: [true, "K", 1],
      mined: "K",
      neverAGene: [false, false, false, false],
      recipes: {
        ACNF: [[null, 5, 4], [null, 6, 0], ["A:CNF", 0, 0]],
        TCCF: [[null, 5, 4], [null, 6, 1], ["T:CCF", 0, 0]],
        TSFSFFF: [[null, 5, 4], [null, 6, 1], ["T:SFSFFF", 0, 0]],
      },
      doors: [true, false, true, false, false, false],
      flipped: [true, false],
      magazineTakes: [false, false, false],
      capsuleTakes: [true, false],
      switchDropsStrands: 0,
      magazineLoads: 6,
      holds24: [true, false],
      notMore: false,
      noCapsuleInTurret: false,
      worth: 24,
      looseDoesNotCount: 0,
      capsuleCounts: 1,
      filter: [true, true, false],
      filterCarbon: [true, false],
      smart: [true, true, false, false, false],
      stock: 7,
      sixTimesTheFlow: true,
      eightTurrets: true,
      wholeLine: true,
      vein: true,
      worm: true,
      saved: ["A", true],
      rebuilt: ["A", true],
      oldSave: [7, true],
      farCarbon: true,
      fits: true,
    });
    expect(out.brief).toContain("capsule de 6");
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
