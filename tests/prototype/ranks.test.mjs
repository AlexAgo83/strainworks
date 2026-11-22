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
      const flowing = (before, after, middle, size = 1) => {
        lab();
        const from = put("cyst", 14, 80, 1);
        let x = 15;
        for (; x < 19; x++) put("belt", x, 80, 1).mk = before;
        if (middle) {
          put(middle, x, 80, 1);
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
        out[`mk${mk}`] = [flowing(mk, mk), flowing(mk, mk, "cyst"), flowing(mk, mk, "vault", 2), flowing(mk, mk, "bridge"), flowing(mk, mk, "split")];
      out.slowest = [flowing(3, 2, "bridge"), flowing(2, 1, "gate"), flowing(3, 1, "sort")];
      return out;
    });
    expect(out).toEqual({ mk1: Array(5).fill(4), mk2: Array(5).fill(8), mk3: Array(5).fill(12), slowest: [8, 4, 4] });
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
      delete G.patches;
      G.upgrades = 2;
      G.dna = 10;
      save();
      load();
      const old = G.cells[key(x, y)];
      out.kept = [matterUnder(old) === kind, perSecond(old), G.dna, "upgrades" in G];
      return out;
    });
    expect(out.starters).toEqual(["C", "F", "N"]);
    expect([out.squares, out.rectangles, out.touching]).toEqual([true, 0, 0]);
    expect(out.kept).toEqual([true, 1, 100, false]);
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
