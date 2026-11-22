// The endless map: seeded sectors, the landing square left alone, outposts attacked, long flights, saves.
import { expect, it } from "vitest";
import { launch, pageHTML, savedGame } from "./harness.mjs";

it("goes on past the landing square", async () => {
  const html = pageHTML();
  const old = savedGame("v15");
  const browser = await launch();
  try {
    const page = await browser.newPage({ viewport: { width: 375, height: 700 }, hasTouch: true });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", (route) => (route.request().url().startsWith("http://proto.test") ? route.fulfill({ body: html, contentType: "text/html" }) : route.abort()));
    await page.goto("http://proto.test/");
    const out = await page.evaluate((oldSave) => {
      const run = (seconds) => {
        for (let i = 0; i < seconds / STEP; i++) step(STEP);
      };
      const lab = () => {
        begin();
        paused = true;
        G.seed = 12345;
        G.dna = 5000;
        G.open = true;
      };
      const generated = (from, to) => {
        const all = [];
        eachSector(from, from, to, to, (s) => {
          if (s.breach) all.push(s);
        });
        return all;
      };
      const out = {};

      lab();
      const world = JSON.stringify(generated(-400, 400));
      sectors.clear();
      out.sameSeedSameWorld = JSON.stringify(generated(-400, 400)) === world;
      G.seed = 54321;
      out.otherSeedOtherWorld = JSON.stringify(generated(-400, 400)) !== world;

      // Whatever the seed: nothing new in the landing square, every deposit reachable and guarded.
      out.faults = [];
      for (let seed = 1; seed <= 24; seed++) {
        G.seed = seed * 7919;
        for (const { field, breach: b } of generated(-290, 380)) {
          const [, x, y, w, h] = field;
          if (Math.hypot(Math.max(-b.x, 0, b.x - 95), Math.max(-b.y, 0, b.y - 95)) <= b.r) out.faults.push(["home", seed, b.id]);
          for (const [cx, cy] of [[x, y], [x + w - 1, y], [x, y + h - 1], [x + w - 1, y + h - 1]]) {
            if (!buildable(cx, cy)) out.faults.push(["covered", seed, b.id]);
            if (Math.hypot(cx - b.x, cy - b.y) > b.r) out.faults.push(["unguarded", seed, b.id]);
            if (depositAt(cx, cy) !== field[0] || richAt(cx, cy) !== 4) out.faults.push(["deposit", seed, b.id]);
          }
        }
      }

      lab();
      const near = generated(-150, 250);
      const far = generated(4000, 4600);
      const mean = (list, of) => list.reduce((sum, s) => sum + of(s), 0) / list.length;
      out.fartherIsBigger = mean(far, (s) => s.field[3] * s.field[4]) > mean(near, (s) => s.field[3] * s.field[4]) * 1.4;
      out.fartherIsFuller = mean(far, (s) => s.breach.total) > mean(near, (s) => s.breach.total) * 1.5;

      // Looking stores nothing.
      const stored = G.breaches.length;
      breachesIn(-600, -600, 600, 600);
      fieldsIn(-600, -600, 600, 600);
      out.lookingStoresNothing = G.breaches.length === stored;

      // Harvest 500 cells out, towards negative coordinates.
      const spot = generated(-480, -200).sort((a, b) => Math.hypot(b.breach.x, b.breach.y) - Math.hypot(a.breach.x, a.breach.y))[0];
      const [kind, x, y] = spot.field;
      const mine = put("mine", x, y, 1);
      run(1.1);
      out.harvests = mine.item === kind;
      const b = G.breaches.find((o) => o.id === spot.breach.id);
      out.wokeWithItsOutpost = [b?.state, b?.post];
      out.expectedPost = { x, y };
      out.onlyThatOne = G.breaches.filter((o) => o.id).length === 1;

      // Its creatures go for the outpost, and the core is never touched.
      b.genes = ["SFN"];
      b.pending = 3;
      b.gene = "SFN";
      b.spit = G.time;
      run(1);
      out.aimsAtOutpost = G.enemies.length > 0 && G.enemies.every((e) => e.goal.x === x + 0.5 && e.goal.y === y + 0.5);
      out.harder = G.enemies[0].max > 24 + Math.floor(G.threat) * 4;
      // A second building of the same outpost, a belt, is the next one.
      const belt = put("belt", x + 4, y + 2, 1);
      for (let i = 0; i < 300 && G.cells[key(x, y)]; i++) run(1);
      out.razed = !G.cells[key(x, y)] && G.ruins[key(x, y)]?.type === "mine";
      out.coreUntouched = G.cells[key(CORE.x, CORE.y)].hp === 100;
      run(90);
      out.nextInOutpost = !G.cells[key(x + 4, y + 2)] || belt.hp < 30;

      // A trail wakes it too, and they then march on what still stands.
      lab();
      const trail = generated(128, 250)[0].breach;
      layTrack(trail.x + 4, trail.y, 1).left = 0;
      run(1);
      const woke = G.breaches.find((o) => o.id === trail.id);
      woke.pending = 1;
      woke.gene = "SFN";
      woke.spit = G.time;
      run(1);
      out.marchesOnWhatStands = Boolean(G.cells[key(woke.post.x, woke.post.y)]);

      // A flight never takes over 4 seconds, and the way home neither.
      out.flights = [];
      for (const away of [30, 200, 1000, 20000]) {
        lab();
        G.breaches = [];
        tool = "belt";
        const site = build("turret", CORE.x - away, CORE.y, 0);
        let took = 0;
        while (site.left === 6 && took < 10) {
          step(STEP);
          took += STEP;
        }
        remove(site.x, site.y);
        let back = 0;
        while (back < 10 && G.drones.some((d, i) => Math.hypot(d.x - perch(i).x, d.y - perch(i).y) > 0.01)) {
          step(STEP);
          back += STEP;
        }
        out.flights.push([away, took, back]);
      }

      // Seed and woken breaches are all that is saved.
      lab();
      const kept = generated(128, 250)[0];
      wake(kept.breach);
      save();
      const bytes = localStorage.getItem(SAVE).length;
      load();
      out.saved = G.seed === 12345 && G.breaches.filter((o) => o.id === kept.breach.id && o.state === "wake").length === 1;
      out.sleepingOneIsGone = breachesIn(kept.breach.x, kept.breach.y, kept.breach.x, kept.breach.y).filter((o) => o.id === kept.breach.id).length === 1;
      out.smallSave = bytes < 100000;

      // A save with the crowded base loses its nests still asleep, not a fight under way.
      const crowded = JSON.parse(oldSave);
      const fighting = crowded.breaches[4];
      fighting.state = "wake";
      crowded.enemies = [{ x: 34, y: 32, gene: "SFN", hp: 9, max: 24, home: 4 }];
      localStorage.setItem(SAVE, JSON.stringify(crowded));
      load();
      out.thinned = [G.breaches.length, G.breaches[G.enemies[0].home].x === fighting.x, G.breaches[G.enemies[0].home].state];

      // An older save keeps its game and wakes nothing new.
      localStorage.setItem(SAVE, oldSave);
      load();
      const before = JSON.stringify(G.breaches.map((o) => o.state));
      run(2);
      out.oldSave = Number.isInteger(G.seed) && JSON.stringify(G.breaches.map((o) => o.state)) === before;

      begin();
      paused = true;
      cam.zoom = 20;
      pan(6000, 6000);
      out.camera = cam.x < -100 && cam.y < -100;
      draw();
      return out;
    }, old);

    expect(out).toMatchObject({
      sameSeedSameWorld: true,
      otherSeedOtherWorld: true,
      faults: [],
      fartherIsBigger: true,
      fartherIsFuller: true,
      lookingStoresNothing: true,
      harvests: true,
      wokeWithItsOutpost: ["wake", out.expectedPost],
      onlyThatOne: true,
      aimsAtOutpost: true,
      harder: true,
      razed: true,
      coreUntouched: true,
      nextInOutpost: true,
      marchesOnWhatStands: true,
      saved: true,
      sleepingOneIsGone: true,
      smallSave: true,
      oldSave: true,
      thinned: [14, true, "wake"],
      camera: true,
    });
    for (const [away, took, back] of out.flights) {
      expect(took, `out to ${away}`).toBeLessThanOrEqual(4.15);
      expect(back, `back from ${away}`).toBeLessThanOrEqual(4.15);
    }
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
