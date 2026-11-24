// The nerve's logic: stores report their level, gates open on a condition, a console sets the network's priority,
// and any wired piece reads its network in words.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

it("opens gates on levels and threats and lets a console choose the priority", async () => {
  const browser = await launch();
  try {
    const page = await browser.newPage({ line: false });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", (route) => (route.request().url().startsWith("http://proto.test") ? route.fulfill({ body: pageHTML(), contentType: "text/html" }) : route.abort()));
    await page.goto("http://proto.test/prototype/");
    const out = await page.evaluate(() => {
      begin();
      paused = true;
      G.open = true;
      G.enemies = [];
      G.breaches = [];
      const wire = (a, b) => { wireUp(a, b); G.wires.at(-1).left = 0; };
      // A cyst and a gate on one nerve: the gate opens while the cyst is under its threshold.
      const cyst = put("cyst", 30, 30, 1), gate = put("gate", 34, 30, 1);
      wire(cyst, gate);
      gate.when = "low";
      sense();
      const emptyOpens = accepts(gate, "SFN", 1);
      cyst.stock = Array(capOf(cyst)).fill("SFN");
      sense();
      const fullShuts = !accepts(gate, "SFN", 1);
      cyst.level = 1;
      cyst.stock = Array(capOf(cyst) - 1).fill("SFN");
      sense();
      const threshold = accepts(gate, "SFN", 1);
      // A threat AND low stock: a turret on the net sees a creature.
      const turret = put("turret", 32, 34, 0);
      wire(turret, gate);
      gate.when = "threatLow";
      cyst.stock = [];
      sense();
      const calmShut = !accepts(gate, "SFN", 1);
      G.enemies = [{ x: 33, y: 36, gene: "SFN", hp: 9, max: 9, tier: 0 }, { x: 36, y: 34.5, gene: "CCF", hp: 9, max: 9, tier: 0 }, { x: 37, y: 34.5, gene: "CCF", hp: 9, max: 9, tier: 0 }];
      sense();
      const threatOpens = accepts(gate, "SFN", 1);
      // Priority: the most numerous by default, the nearest, each in turn, by hand.
      const most = netOf(turret).focus;
      const desk = put("desk", 36, 30, 0);
      wire(desk, gate);
      desk.mode = "near";
      turret.focus = null;
      sense();
      const near = netOf(turret).focus;
      desk.mode = "cycle";
      const turns = new Set();
      for (const t of [0, 21, 41, 61]) { G.time = t; turret.focus = null; sense(); turns.add(netOf(turret).focus); }
      desk.mode = "hand";
      desk.gene = "NNN";
      sense();
      const hand = netOf(turret).focus;
      const summary = netSummary(gate);
      return { emptyOpens, fullShuts, threshold, calmShut, threatOpens, most, near, turns: [...turns].sort(), hand, summary };
    });
    expect(out.emptyOpens).toBe(true);
    expect(out.fullShuts).toBe(true);
    expect(out.threshold).toBe(true);
    expect(out.calmShut).toBe(true);
    expect(out.threatOpens).toBe(true);
    expect(out.most).toBe("SSN");
    expect(out.near).toBe("CNF");
    expect(out.turns).toEqual(["CNF", "SSN"]);
    expect(out.hand).toBe("NNN");
    expect(out.summary).toContain("NNN");
    expect(out.summary).toContain("1 arme(s)");
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
