// Crossing a building takes time, ranks set the pace, deposits are patches.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

async function open(browser) {
  const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/*", (route) =>
    route.request().url().startsWith("http://proto.test") ? route.fulfill({ body: pageHTML(), contentType: "text/html" }) : route.abort(),
  );
  await page.goto("http://proto.test/prototype/");
  await page.evaluate(() => {
    window.lab = () => {
      begin();
      paused = true;
      G.open = true;
      G.breaches = [];
      G.cells = { [key(CORE.x, CORE.y)]: G.cells[key(CORE.x, CORE.y)] };
    };
    window.run = (seconds) => {
      for (let i = 0; i < Math.round(seconds / STEP); i++) step(STEP);
    };
  });
  return { page, errors };
}

it("never lets an item through a building at once", async () => {
  const browser = await launch();
  try {
    const { page, errors } = await open(browser);
    const out = await page.evaluate(() => {
      const through = (type, count, size = 1) => {
        lab();
        const first = put("belt", 14, 80, 1);
        for (let i = 0; i < count; i++) put(type, 15 + i * size, 80, 1);
        const last = put("belt", 15 + count * size, 80, 1);
        run(2);
        Object.assign(first, { item: "S", t: 1 });
        for (let i = 1; i < 120; i++) {
          step(STEP);
          if (last.item) return +((i - 1) * STEP).toFixed(2);
        }
        return -1;
      };
      const out = { cyst: through("cyst", 1), ten: through("cyst", 10), vault: through("vault", 1, 2), pump: through("pump", 1) };
      lab();
      const feed = [[13, 80, 1], [14, 79, 2], [14, 81, 0]].map(([x, y, d]) => put("belt", x, y, d));
      put("ligase", 14, 80, 1);
      const made = put("belt", 15, 80, 1);
      run(2);
      for (const [i, b] of feed.entries()) Object.assign(b, { item: "SFC"[i], t: 1 });
      let ticks = 0;
      while (!made.item && ticks < 100) {
        step(STEP);
        ticks++;
      }
      out.ligase = +((ticks - 1) * STEP).toFixed(2);

      // A vein cannot take at once what a belt just left.
      lab();
      const a = put("pump", 20, 80, 0);
      link(a, put("pump", 26, 80, 0));
      a.veinLeft = 0;
      receive(a, "S", 1);
      step(STEP);
      out.waitsInPump = a.stock.length;
      run(1);
      out.thenLeaves = a.stock.length;
      return out;
    });
    expect(out).toEqual({ cyst: 0.25, ten: 2.5, vault: 0.5, pump: 0.25, ligase: 0.25, waitsInPump: 1, thenLeaves: 0 });
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});

it("runs every rank at its pace, and what joins rails at the slowest", async () => {
  const browser = await launch();
  try {
    const { page, errors } = await open(browser);
    const out = await page.evaluate(() => {
      const flowing = (before, after, middle, size = 1, middleMk) => {
        lab();
        const from = put("cyst", 14, 80, 1);
        let x = 15;
        for (; x < 19; x++) put("belt", x, 80, 1).mk = before;
        if (middle) {
          const m = put(middle, x, 80, 1);
          if (middleMk) m.mk = middleMk;
          x += size;
        }
        for (const end = x + 3; x < end; x++) put("belt", x, 80, 1).mk = after;
        const to = put("vault", x, 80, 1);
        let got = 0;
        for (let i = 0; i < 800; i++) {
          from.stock = Array(40).fill("S");
          step(STEP);
          if (i >= 400) got += to.stock.length;
          to.stock = [];
        }
        return got / 20;
      };
      const out = {};
      for (const mk of [1, 2, 3])
        out[`mk${mk}`] = [flowing(mk, mk), flowing(mk, mk, "cyst"), flowing(mk, mk, "vault", 2), flowing(mk, mk, "bridge"), flowing(mk, mk, "split", 1, mk)];
      out.slowest = [flowing(3, 2, "bridge"), flowing(2, 1, "gate"), flowing(3, 1, "sort", 1, 3)];
      // A splitter or a sorter passes no more than its rank, whatever the rails.
      out.capped = [flowing(3, 3, "split"), flowing(3, 3, "split", 1, 2), flowing(3, 3, "sort", 1, 3), flowing(2, 2, "sort", 1, 3)];
      return out;
    });
    expect(out).toEqual({ mk1: Array(5).fill(4), mk2: Array(5).fill(8), mk3: Array(5).fill(12), slowest: [8, 4, 4], capped: [4, 8, 12, 8] });
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});

it("sells ranks for ADN, one at a time or a whole row", async () => {
  const browser = await launch();
  try {
    const { page, errors } = await open(browser);
    const out = await page.evaluate(() => {
      const out = {};
      lab();
      G.dna = 100;
      const row = [];
      for (let x = 20; x < 26; x++) row.push(put(x === 23 ? "bridge" : "belt", x, 80, 1));
      const other = put("belt", 22, 79, 2); // joins from the side: another row
      out.row = rowOf(row[0]).length;

      raise([row[0]], 2);
      out.paid = [G.dna, rankOf(row[0]), sites().length];
      run(6);
      out.risen = [rankOf(row[0]), sites().length];

      raise(rowOf(row[0]), 3);
      out.rowPaid = G.dna;
      run(8);
      out.rowRisen = [...rowOf(row[0]).map(rankOf), rankOf(other)];

      G.dna = 5;
      const mine = put("mine", 30, 80, 0);
      out.refused = [raise([mine], 2), G.dna];
      G.dna = 100;
      raise([mine], 3);
      dropRise(mine);
      out.cancelled = [G.dna, rankOf(mine)];

      // Taken down it gives back what it cost, never more.
      G.dna = 0;
      out.back = [refund(row[0]), refund(mine)];
      remove(20, 80);
      out.afterRemove = G.dna;

      // Drawn at a rank, each cell is paid, and the line stops with the ADN.
      lab();
      G.dna = 5;
      choose("belt");
      handRank.belt = 2;
      drag = { x: 20, y: 82, moved: false };
      extend({ x: 29, y: 82 });
      const drawn = Object.values(G.cells).filter((c) => c.type === "belt");
      out.drawn = [drawn.length, drawn.every((c) => c.mk === 2), G.dna];

      // Razed, it keeps its rank and is rebuilt for half.
      lab();
      G.dna = 100;
      G.ruins["30,80"] = { type: "mine", x: 30, y: 80, dir: 0, mk: 3 };
      document.querySelector("#rebuild").onclick();
      out.rebuilt = [G.cells["30,80"].mk, G.dna];
      return out;
    });
    expect(out).toEqual({
      row: 5,
      paid: [99, 1, 1],
      risen: [2, 0],
      rowPaid: 85,
      rowRisen: [3, 3, 3, 3, 3, 1],
      refused: [false, 5],
      cancelled: [100, 1],
      back: [3, 0],
      afterRemove: 3,
      drawn: [5, true, 0],
      rebuilt: [3, 80],
    });
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});

it("spreads deposits in patches and keeps older games harvesting", async () => {
  const browser = await launch();
  try {
    const { page, errors } = await open(browser);
    const out = await page.evaluate(() => {
      begin();
      paused = true;
      const out = {};
      out.starters = Object.values(G.cells).filter((c) => c.type === "mine").map((c) => depositAt(c.x, c.y)).sort();
      out.squares = OUTER.every((field) => squareIn(field));
      out.rectangles = OUTER.filter((field) => {
        const { list } = patchOf(field);
        const xs = list.map((c) => c.x);
        const ys = list.map((c) => c.y);
        return (Math.max(...xs) - Math.min(...xs) + 1) * (Math.max(...ys) - Math.min(...ys) + 1) === list.length;
      }).length;
      out.touching = OUTER.flatMap((field) => patchOf(field).list.filter((c) => DX.some((dx, d) => (depositAt(c.x + dx, c.y + DY[d]) ?? field[0]) !== field[0]))).length;

      // A corner of an old rectangle that is bare ground now.
      const [kind, x, y] = OUTER.find(([, x, y, w, h]) => !depositAt(x, y) && richness(x + w / 2, y + h / 2) === 1);
      put("mine", x, y, 1);
      delete G.world;
      G.upgrades = 2;
      G.dna = 10;
      save();
      load();
      const old = G.cells[key(x, y)];
      out.migrated = G.world;
      out.kept = [matterUnder(old) === kind, perSecond(old), G.dna, "upgrades" in G];
      return out;
    });
    expect(out.starters).toEqual(["C", "F", "N"]);
    expect([out.squares, out.rectangles, out.touching]).toEqual([true, 0, 0]);
    expect([out.migrated, ...out.kept]).toEqual([2, true, 1, 100, false]);
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});

it("lets cysts hold more by rank, at the same pace", async () => {
  const browser = await launch();
  try {
    const { page, errors } = await open(browser);
    const out = await page.evaluate(() => {
      const out = {};
      for (const type of ["cyst", "vault"]) {
        out[type] = [1, 2, 3].map((mk) => {
          lab();
          const c = put(type, 20, 80, 1);
          c.mk = mk;
          c.stock = Array(capOf(c) - 1).fill("S");
          const room = accepts(c, "S", 1);
          c.stock.push("S");
          return [capOf(c), room && !accepts(c, "S", 1)];
        });
      }
      lab();
      G.dna = 100;
      const c = put("cyst", 20, 80, 1);
      c.stock = Array(60).fill("S");
      raise([c], 3);
      out.before = accepts(c, "S", 1);
      run(9);
      out.after = [rankOf(c), accepts(c, "S", 1), G.dna, refund(c)];
      return out;
    });
    expect(out).toEqual({
      cyst: [[60, true], [120, true], [240, true]],
      vault: [[360, true], [720, true], [1440, true]],
      before: false,
      after: [3, true, 75, 25],
    });
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});

it("wakes nothing when an older game meets the spread-out world", async () => {
  const browser = await launch();
  try {
    const { page, errors } = await open(browser);
    const out = await page.evaluate(() => {
      begin();
      paused = true;
      G.seed = 12345;
      const nests = [];
      eachSector(96, -300, 500, 500, (s) => {
        if (s.breach) nests.push(s.breach);
      });
      const b = nests[0];
      put("wall", b.x + 4, b.y, 0);
      delete G.world;
      delete G.cleared;
      save();
      load();
      run(3);
      return { awake: G.breaches.filter((o) => o.state !== "sleep").length, cleared: G.cleared.includes(b.id), others: breachesIn(nests[1].x, nests[1].y, nests[1].x, nests[1].y).length > 0 };
    });
    expect(out).toEqual({ awake: 0, cleared: true, others: true });
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});

it("makes transformers faster and defences stronger by rank, and keeps older splitters at their pace", async () => {
  const browser = await launch();
  try {
    const { page, errors } = await open(browser);
    const out = await page.evaluate(() => {
      // Transformers: what one makes in 10 s of full supply, at each rank.
      const making = (mk) => {
        lab();
        const lig = put("ligase", 20, 80, 1);
        lig.mk = mk;
        const out = put("vault", 21, 80, 1);
        let made = 0;
        for (let i = 0; i < Math.round(10 / STEP); i++) {
          for (const p of lig.ports) while (p.length < 4) p.push(lig.ports.indexOf(p) === 1 ? "F" : "S");
          step(STEP);
          made += out.stock.length;
          out.stock = [];
        }
        return made;
      };
      const result = { ligase: [1, 2, 3].map(making) };
      // Defences: shots in 10 s against a creature that never dies, and the health each rank holds.
      const firing = (mk) => {
        lab();
        const gun = put("turret", 40, 40, 0);
        gun.mk = mk;
        gun.ammo = { CNF: 999 };
        G.enemies = [{ x: 43, y: 40.5, gene: "GGG", hp: 1e9, max: 1e9, home: -1 }];
        let shots = 0;
        for (let i = 0; i < Math.round(10 / STEP); i++) {
          const before = gun.ammo.CNF;
          step(STEP);
          shots += before - gun.ammo.CNF;
          G.enemies[0].x = 43;
          G.enemies[0].y = 40.5;
        }
        // The shot at the start and one landing on the last step may both count.
        const pace = 3 * GUN_RANK[mk - 1] * 10;
        return [shots >= pace && shots <= pace + 1, fullHp(gun)];
      };
      result.turret = [1, 2, 3].map(firing);
      result.wall = [1, 2, 3].map((mk) => fullHp({ type: "wall", mk }));
      result.costs = ["split", "sort", "ligase", "pack", "turret", "wall"].map((type) => [type, rankCost(type, 2), rankCost(type, 3)]);
      // A game from before these ranks: its splitter on MK3 rails becomes MK3 for free, and still passes 12.
      lab();
      let x = 15;
      const from = put("cyst", 14, 80, 1);
      for (; x < 19; x++) put("belt", x, 80, 1).mk = 3;
      const old = put("split", x++, 80, 1);
      for (const end = x + 3; x < end; x++) put("belt", x, 80, 1).mk = 3;
      const to = put("vault", x, 80, 1);
      delete G.ranked;
      const dna = G.dna;
      rankFollowers();
      let got = 0;
      for (let i = 0; i < 800; i++) {
        from.stock = Array(40).fill("S");
        step(STEP);
        if (i >= 400) got += to.stock.length;
        to.stock = [];
      }
      result.older = [old.mk, got / 20, G.dna === dna, G.ranked];
      return result;
    });
    expect(out).toEqual({
      ligase: [10, 20, 30],
      turret: [[true, 180], [true, 270], [true, 360]],
      wall: [260, 520, 780],
      costs: [["split", 2, 6], ["sort", 3, 8], ["ligase", 15, 40], ["pack", 30, 80], ["turret", 20, 50], ["wall", 5, 15]],
      older: [3, 12, true, true],
    });
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
