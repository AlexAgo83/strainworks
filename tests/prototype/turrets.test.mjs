// Three turrets: reach, pace, the double shot, flat prices, nerves, targeting, rebuilding.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

it("has a far slow turret and a close double one", async () => {
  const html = pageHTML();
  const browser = await launch();
  try {
    const page = await browser.newPage({ viewport: { width: 375, height: 700 }, hasTouch: true });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", (route) => (route.request().url().startsWith("http://proto.test") ? route.fulfill({ body: html, contentType: "text/html" }) : route.abort()));
    await page.goto("http://proto.test/");
    const out = await page.evaluate(() => {
      const lab = () => {
        begin();
        paused = true;
        G.breaches = [];
        G.enemies = [];
        G.cells = {};
        put("core", CORE.x, CORE.y, 0);
      };
      const foe = (dx, dy = 0, hp = 1e6) => {
        const e = { x: 20.5 + dx, y: 20.5 + dy, gene: "SFN", hp, max: hp };
        G.enemies.push(e);
        return e;
      };
      const armed = (type, genes = 999) => {
        lab();
        const c = put(type, 20, 20, 0);
        c.ammo = { CNF: genes };
        return c;
      };
      // Creatures held still, only the guns run.
      const shoot = (seconds) => {
        for (let i = 0; i < Math.round(seconds / STEP); i++) {
          G.time += STEP;
          fire(STEP);
        }
      };
      const out = { reach: {}, tenSeconds: {} };

      for (const type of Object.keys(GUNS)) {
        out.reach[type] = [3.8, 4.2, 6.6, 7, 12.8, 13.2].map((away) => {
          armed(type);
          const e = foe(away);
          fire(STEP);
          return e.hp < 1e6;
        });
        const c = armed(type);
        const e = foe(2);
        shoot(10);
        out.tenSeconds[type] = [999 - c.ammo.CNF, 1e6 - e.hp];
      }

      // Two shots at once, and never a gene on what the first one killed.
      let c = armed("maw");
      let e = foe(2);
      fire(STEP);
      out.twoAtOnce = [1e6 - e.hp, G.shots.map((s) => s.barrel), 999 - c.ammo.CNF];
      c = armed("maw");
      const first = foe(1, 0, 12);
      const second = foe(2);
      fire(STEP);
      out.secondTarget = [first.hp, 1e6 - second.hp, G.kills];
      c = armed("maw");
      foe(1, 0, 12);
      fire(STEP);
      out.nothingWasted = 999 - c.ammo.CNF;
      c = armed("maw", 1);
      foe(2);
      fire(STEP);
      out.lastGene = [c.ammo.CNF, G.shots.length];
      c = armed("sting");
      e = foe(9);
      fire(STEP);
      out.heavy = 1e6 - e.hp;
      c = armed("maw");
      c.strict = true;
      c.ammo = { SFN: 9 };
      e = foe(2);
      fire(STEP);
      out.economical = 1e6 - e.hp;

      // Loading, loose or boxed, and the stock the banner counts.
      lab();
      out.loads = ["sting", "maw"].map((type, i) => {
        const g = put(type, 30 + i, 30, 0);
        const takes = [accepts(g, "CNF", 1), accepts(g, "A:CNF", 1), accepts(g, "T:CNF", 1), accepts(g, "K", 1)];
        receive(g, "A:CNF", 1);
        return [...takes, g.ammo.CNF];
      });
      out.stock = stockOf("CNF");

      // Flat prices, and what is paid comes back whatever the order.
      lab();
      G.dna = 1000;
      out.firstPrices = ["turret", "sting", "maw"].map(price);
      const bought = [["turret", 10], ["sting", 12], ["maw", 14], ["sting", 16]];
      out.paid = bought.map(([type, x]) => {
        const before = G.dna;
        tool = type;
        place(x, 80);
        return before - G.dna;
      });
      for (const x of [12, 10, 16, 14]) remove(x, 80);
      out.refunded = G.dna;

      // Placing one offers everything a turret has.
      lab();
      const sting = put("sting", 20, 20, 0);
      select("20,20");
      out.buttons = [...document.querySelectorAll("#actions button")].map((b) => b.textContent);
      out.says = diagnose(sting);

      // A nerve listens as far as its own turret sees.
      out.heard = ["turret", "sting", "maw"].map((type) => {
        lab();
        const gun = put(type, 20, 20, 0);
        const gate = put("gate", 26, 20, 1);
        wireUp(gun, gate);
        G.wires[0].left = 0;
        foe(0, -10);
        sense();
        return netOf(gate).focus;
      });

      // Creatures go for them like for a turret.
      out.targeted = ["sting", "maw"].map((type) => {
        lab();
        put(type, 30, 52, 0);
        const hunter = { x: 24, y: 52.5, gene: "SFS", hp: 1e6, max: 1e6 };
        G.enemies.push(hunter);
        step(STEP);
        return hunter.goal.x;
      });

      // Two lost: the bill is what rebuilding takes.
      lab();
      G.dna = 500;
      G.ruins["20,20"] = { ...cell("sting", 20, 20, 0) };
      G.ruins["22,20"] = { ...cell("maw", 22, 20, 0) };
      refresh();
      out.bill = document.querySelector("#rebuild").textContent;
      document.querySelector("#rebuild").onclick();
      out.rebuilt = [G.cells["20,20"].type, G.cells["22,20"].type, 500 - G.dna];
      save();
      load();
      out.saved = [G.cells["20,20"].type, G.cells["22,20"].type];

      begin();
      paused = true;
      put("sting", 44, 40, 0);
      put("maw", 52, 40, 0);
      draw();
      out.fits = document.documentElement.scrollWidth <= 375;
      out.clipped = clippedTools();
      return out;
    });

    expect(out).toMatchObject({
      reach: {
        turret: [true, true, true, false, false, false],
        sting: [true, true, true, true, true, false],
        maw: [true, false, false, false, false, false],
      },
      twoAtOnce: [24, [-1, 1], 2],
      secondTarget: [0, 12, 1],
      nothingWasted: 1,
      lastGene: [0, 1],
      heavy: 24,
      economical: 0,
      loads: [[true, true, false, false, 6], [true, true, false, false, 6]],
      stock: 12,
      firstPrices: [40, 80, 60],
      paid: [40, 80, 60, 80],
      refunded: 1000,
      heard: ["", "CNF", ""],
      targeted: [30.5, 30.5],
      rebuilt: ["sting", "maw", 70],
      saved: ["sting", "maw"],
      fits: true,
      clipped: [],
    });
    // Over ten seconds, give or take the step: the Dard is the slowest, the Gueule eats the most genes.
    const { turret, sting, maw } = out.tenSeconds;
    expect(sting[0]).toBeGreaterThanOrEqual(9);
    expect(sting[0]).toBeLessThanOrEqual(11);
    expect(maw[0]).toBeGreaterThan(turret[0]);
    expect(maw[0] % 2).toBe(0);
    expect([turret[1] / turret[0], sting[1] / sting[0], maw[1] / maw[0]]).toEqual([12, 24, 12]);
    expect(out.buttons).toEqual(expect.arrayContaining(["Tir : sur tout"]));
    expect(out.says).toContain("Dard");
    expect(out.bill).toContain("70 ADN");
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
