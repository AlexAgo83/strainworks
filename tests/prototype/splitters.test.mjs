// Two splitters: two ways from the start, three ways behind the first tech.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

it("splits in two, then in three", async () => {
  const html = pageHTML();
  const browser = await launch();
  try {
    const page = await browser.newPage({ viewport: { width: 375, height: 700 }, hasTouch: true });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", (route) => (route.request().url().startsWith("http://proto.test") ? route.fulfill({ body: html, contentType: "text/html" }) : route.abort()));
    await page.goto("http://proto.test/");
    const out = await page.evaluate(() => {
      const out = {};
      const refused = (type) => {
        choose("hand");
        choose(type);
        return tool !== type;
      };
      const lab = () => {
        begin();
        paused = true;
        G.breaches = [];
      };
      // What each side got, with the sides in plugged taking everything: [left, ahead, right].
      const share = (type, plugged, facing = 1) => {
        lab();
        const x = 20;
        const y = 80;
        const s = put(type, x, y, facing);
        const source = put("cyst", x - DX[facing], y - DY[facing], facing);
        const ends = [3, 0, 1].map((turn, i) => {
          const d = (facing + turn) % 4;
          return plugged.includes(i) ? put("cyst", x + DX[d], y + DY[d], d) : null;
        });
        const got = [0, 0, 0];
        for (let n = 0; n < 240; n++) {
          while (source.stock.length < 10) source.stock.push("S");
          step(STEP);
          ends.forEach((end, i) => {
            if (!end) return;
            got[i] += end.stock.length;
            end.stock = [];
          });
        }
        return { got, stuck: Boolean(s.item) };
      };

      lab();
      out.atStart = [refused("split2"), refused("split")];
      G.stage = 1;
      out.afterCell = [refused("split2"), refused("split")];
      out.reward = STAGES[0].gives;

      out.two = [0, 1, 2, 3].map((facing) => share("split2", [0, 1, 2], facing).got);
      out.oneSide = share("split2", [2]);
      out.straightIsClosed = share("split2", [1]);
      out.three = share("split", [0, 1, 2]).got;

      // It goes on a belt like the others, and the belts beside it read it as their source.
      lab();
      put("belt", 20, 80, 1);
      tool = "split2";
      place(20, 80);
      const placed = G.cells["20,80"];
      out.onBelt = [placed.type, placed.dir];
      placed.left = 0;
      const left = put("belt", 20, 79, 0);
      const straight = put("belt", 21, 80, 1);
      out.feeds = [feeders(left).some((f) => f.c === placed), feeders(straight).some((f) => f.c === placed)];
      place(20, 80);
      out.tapTurns = placed.dir;

      // An automatic bridge on a side exit takes the way out.
      lab();
      put("split2", 20, 80, 1);
      out.bridge = wayOf(put("bridge", 20, 81, 0), 0);

      // A game saved with the only splitter there was keeps three ways.
      lab();
      put("split", 20, 80, 1);
      save();
      load();
      out.saved = [G.cells["20,80"].type, TYPES[G.cells["20,80"].type].name, splitExits(G.cells["20,80"]).length];

      draw();
      out.clipped = clippedTools();
      out.fits = document.documentElement.scrollWidth <= 375;
      return out;
    });

    expect(out).toMatchObject({
      atStart: [false, true],
      afterCell: [false, false],
      oneSide: { stuck: expect.any(Boolean) },
      straightIsClosed: { got: [0, 0, 0], stuck: true },
      onBelt: ["split2", 1],
      feeds: [true, false],
      tapTurns: 2,
      bridge: 2,
      saved: ["split", "Diviseur 3", 3],
      clipped: [],
      fits: true,
    });
    expect(out.reward).toContain("Diviseur 3");
    for (const [left, ahead, right] of out.two) {
      expect(ahead).toBe(0);
      expect(left).toBeGreaterThan(15);
      expect(Math.abs(left - right)).toBeLessThanOrEqual(1);
    }
    expect(out.oneSide.got[2]).toBeGreaterThan(30);
    expect(Math.max(...out.three) - Math.min(...out.three)).toBeLessThanOrEqual(1);
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
