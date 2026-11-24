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
      // Two lines on one net: each gate watches its own cyst, the nearest one wired.
      G.enemies = [];
      const cystB = put("cyst", 30, 44, 1), gateB = put("gate", 32, 44, 1);
      wire(cystB, gateB);
      wire(gateB, gate);
      gate.when = "low";
      gateB.when = "low";
      cyst.level = 0.5;
      cyst.stock = Array(capOf(cyst)).fill("SFN");
      cystB.stock = [];
      sense();
      const ownStores = [accepts(gate, "SFN", 1), accepts(gateB, "SFN", 1), gate.watch, gateB.watch];
      // The player picks whom a gate listens to: the far cyst, then a refused tap on bare ground.
      listening = key(gate.x, gate.y);
      place(30, 44);
      const picked = gate.watch;
      sense();
      const kept = gate.watch;
      listening = key(gate.x, gate.y);
      place(50, 50);
      const refusedKeeps = gate.watch;
      delete gate.source;
      sense();
      // A batch of 5: five through, then it waits until its cyst is no longer low.
      gateB.batch = 5;
      for (let i = 0; i < 5; i++) { receive(gateB, "SFN", 1); gateB.item = null; }
      const afterBatch = accepts(gateB, "SFN", 1);
      cystB.stock = Array(capOf(cystB)).fill("SFN");
      sense();
      const reset = gateB.passed || 0;
      const card = diagnose(gateB);
      // Each listener picks its source: two turrets seeing two families, and the core, on one network.
      G.enemies = [];
      const west = put("turret", 60, 60, 0), east = put("turret", 80, 60, 0), core = coreCell();
      const s1 = put("sort", 70, 62, 0), s2 = put("sort", 72, 62, 0), lig = put("ligase", 74, 62, 0);
      wire(west, s1); wire(s1, s2); wire(s2, east); wire(s2, lig);
      G.enemies = [{ x: 61, y: 62, gene: "SFN", hp: 9, max: 9, tier: 0 }, { x: 81, y: 62, gene: "CCF", hp: 9, max: 9, tier: 0 }, { x: 81.5, y: 62.5, gene: "CCF", hp: 9, max: 9, tier: 0 }];
      sense();
      const whole = heardOf(s1).focus;
      listening = key(s1.x, s1.y); place(west.x, west.y);
      listening = key(s2.x, s2.y); place(east.x, east.y);
      const heardTurrets = [heardOf(s1).focus, heardOf(s2).focus];
      // Back to the whole network by tapping itself, and a refused source off the network.
      listening = key(s1.x, s1.y); place(s1.x, s1.y);
      const backToNet = [s1.source ?? null, heardOf(s1).focus];
      listening = key(lig.x, lig.y); place(core.x, core.y);
      const offNet = lig.source ?? null;
      return { whole, heardTurrets, backToNet, offNet, picked, kept, refusedKeeps, ownStores, afterBatch, reset, card, emptyOpens, fullShuts, threshold, calmShut, threatOpens, most, near, turns: [...turns].sort(), hand, summary };
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
    expect(out.ownStores).toEqual([false, true, "30,30", "30,44"]);
    expect([out.picked, out.kept, out.refusedKeeps]).toEqual(["30,44", "30,44", "30,44"]);
    expect(out.afterBatch).toBe(false);
    expect(out.reset).toBe(0);
    expect(out.card).toContain("écoute le kyste à 2 cases");
    expect(out.whole).toBe("SSN");
    expect(out.heardTurrets).toEqual(["CNF", "SSN"]);
    expect(out.backToNet).toEqual([null, "SSN"]);
    expect(out.offNet).toBe(null);
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
