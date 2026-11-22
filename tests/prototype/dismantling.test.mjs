// Dismantling: a drone, the time building took, refund at the end, cancel, every kind of thing.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

it("takes time and a drone to dismantle", async () => {
  const html = pageHTML();
  const browser = await launch();
  try {
    const page = await browser.newPage({ viewport: { width: 375, height: 700 }, hasTouch: true });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", (route) => (route.request().url().startsWith("http://proto.test") ? route.fulfill({ body: html, contentType: "text/html" }) : route.abort()));
    await page.goto("http://proto.test/");
    const out = await page.evaluate(() => {
      const run = (seconds) => {
        for (let i = 0; i < Math.round(seconds / STEP); i++) step(STEP);
      };
      const settle = () => {
        let took = 0;
        while (sites().length && took < 120) {
          step(STEP);
          took += STEP;
        }
        return took;
      };
      const crewAt = (x, y) => {
        for (const d of G.drones) {
          d.x = x + 0.5;
          d.y = y + 0.5;
        }
      };
      const lab = () => {
        begin();
        paused = true;
        G.open = true;
        G.breaches = [];
        G.dna = 1000;
      };
      const out = {};

      lab();
      const t = put("turret", 70, 80, 0);
      const due = refund(t);
      wipe(70, 80);
      out.notAtOnce = [G.cells["70,80"] === t, G.dna];
      run(1);
      out.worksUntilTheDroneStarts = [built(t), t.out];
      run(1);
      out.thenStops = built(t);
      out.noRefundYet = G.dna;
      run(6.5);
      out.gone = !G.cells["70,80"];
      out.paid = G.dna - 1000 === due;

      // As long as building, three at a time.
      lab();
      for (let x = 20; x < 24; x++) {
        put("wall", x, 70, 0);
        wipe(x, 70);
      }
      crewAt(21, 70);
      run(2.8);
      out.notBefore = [20, 21, 22, 23].filter((x) => G.cells[`${x},70`]).length;
      run(0.4);
      out.threeAtOnce = [20, 21, 22, 23].filter((x) => G.cells[`${x},70`]).length;
      settle();
      out.fourthAfter = !G.cells["23,70"];

      lab();
      put("wall", 30, 60, 0);
      wipe(30, 60);
      const clock = JSON.stringify([G.cells["30,60"].out, G.drones]);
      out.twiceIsOneJob = (wipe(30, 60), sites().length === 1);
      out.frozenWithoutSteps = JSON.stringify([G.cells["30,60"].out, G.drones]) === clock;

      // Cancel: what was undone is built again.
      lab();
      const w = put("turret", 30, 60, 0);
      wipe(30, 60);
      crewAt(30, 60);
      run(2);
      keepIt(w);
      out.cancelled = [+w.left.toFixed(1), w.out === undefined, G.dna];
      settle();
      out.standsAgain = built(w) && G.cells["30,60"] === w;

      lab();
      build("turret", 30, 60, 0);
      wipe(30, 60);
      out.untouchedSiteGoesAtOnce = !G.cells["30,60"];
      build("turret", 30, 60, 0);
      crewAt(30, 60);
      run(2);
      wipe(30, 60);
      out.startedSiteTakesWhatWasWoven = +G.cells["30,60"].out.toFixed(1);

      // Trail, worm, ruin, nerve, vein, and a pump that a vein reaches.
      lab();
      layTrack(20, 80, 1).left = 0;
      incubate(20, 80);
      const worm = G.worms[0];
      worm.left = 0;
      wipe(20, 80);
      out.wormFirst = worm.out > 0 && G.tracks["20,80"].out === undefined;
      settle();
      out.wormGone = !G.worms.length && Boolean(G.tracks["20,80"]);
      wipe(20, 80);
      out.trailWaits = Boolean(G.tracks["20,80"]);
      settle();
      out.trailGone = !G.tracks["20,80"];

      G.ruins["22,80"] = { ...cell("wall", 22, 80, 0) };
      wipe(22, 80);
      out.ruinWaits = Boolean(G.ruins["22,80"]);
      settle();
      out.ruinGone = !G.ruins["22,80"];

      const gun = put("turret", 25, 80, 0);
      const gate = put("gate", 30, 80, 1);
      wireUp(gun, gate);
      G.wires[0].left = 0;
      scrap(G.wires[0]);
      out.nerveWaits = G.wires.length === 1;
      settle();
      out.nerveGone = !G.wires.length;

      const a = put("pump", 10, 90, 0);
      const b = put("pump", 20, 90, 0);
      link(a, b);
      a.veinLeft = 0;
      scrapVein(a);
      out.veinWaits = a.to === "20,90";
      settle();
      out.veinGone = a.to === null && a.veinOut === undefined;

      link(a, b);
      wipe(20, 90);
      settle();
      out.pumpTakesItsSiteAlong = a.to === null && !G.cells["20,90"] && !sites().length;

      // A swipe queues, a belt drawn again stays, and all of it survives a save.
      lab();
      for (let x = 30; x < 40; x++) put("belt", x, 75, 1);
      tool = "erase";
      wipe(30, 75);
      drag = { x: 30, y: 75 };
      extend({ x: 39, y: 75 });
      out.swipe = sites().length;
      tool = "belt";
      drag = { x: 30, y: 75, moved: false, existing: true };
      extend({ x: 34, y: 75 });
      drag = null;
      out.drawnAgainStays = sites().length;
      save();
      load();
      out.saved = sites().length;
      settle();
      out.leftStanding = Object.values(G.cells).filter((c) => c.y === 75).length;
      draw();
      return out;
    });
    expect(out).toMatchObject({
      notAtOnce: [true, 1000],
      worksUntilTheDroneStarts: [true, 6],
      thenStops: false,
      noRefundYet: 1000,
      gone: true,
      paid: true,
      notBefore: 4,
      threeAtOnce: 1,
      fourthAfter: true,
      twiceIsOneJob: true,
      frozenWithoutSteps: true,
      cancelled: [2, true, 1000],
      standsAgain: true,
      untouchedSiteGoesAtOnce: true,
      startedSiteTakesWhatWasWoven: 2,
      wormFirst: true,
      wormGone: true,
      trailWaits: true,
      trailGone: true,
      ruinWaits: true,
      ruinGone: true,
      nerveWaits: true,
      nerveGone: true,
      veinWaits: true,
      veinGone: true,
      pumpTakesItsSiteAlong: true,
      swipe: 10,
      drawnAgainStays: 5,
      saved: 5,
      leftStanding: 5,
    });
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
