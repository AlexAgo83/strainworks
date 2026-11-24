// A line drawn with a wavering hand stays straight, turns once on a real turn, and R lays the corner the other way.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

it("draws straight lines and L turns, never stairs, and flips the last corner", async () => {
  const browser = await launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", (route) => (route.request().url().startsWith("http://proto.test") ? route.fulfill({ body: pageHTML(), contentType: "text/html" }) : route.abort()));
    await page.goto("http://proto.test/prototype/");
    const out = await page.evaluate(() => {
      begin();
      paused = true;
      choose("belt");
      const x0 = 20, y0 = 70, start = () => { drag = { x: x0, y: y0, moved: false, path: [{ x: x0, y: y0 }] }; };
      const turns = (path) => path.slice(2).filter((c, i) => c.dir !== path[i + 1].dir).length;
      const run = (points) => { start(); for (const [dx, dy] of points) stretch({ x: x0 + dx, y: y0 + dy }); return drag.path; };
      // A hand drifting one cell up and down along a straight run.
      const wobble = run([[1, 0], [2, 1], [3, 1], [4, 0], [5, 1], [6, 1], [7, 0], [8, 1]]);
      // Right then a real turn down.
      const ell = run([[3, 0], [6, 0], [6, 1], [6, 3], [6, 5]]);
      const corner = ell.findIndex((c, i) => i > 1 && c.dir !== ell[i - 1].dir) - 1;
      // A diagonal, then R.
      const diagonal = run([[1, 1], [2, 2], [3, 3], [4, 4], [5, 5]]);
      const before = diagonal.map((c) => `${c.x},${c.y}`);
      flipCorner();
      const flipped = drag.path.map((c) => `${c.x},${c.y}`);
      // A tight corner: one cell along, one across.
      const tight = run([[1, 0], [1, 1]]).map((c) => [c.x - x0, c.y - y0]);
      // Back onto the first leg: the turn is undone.
      run([[6, 0], [6, 3], [5, 0]]);
      const undone = turns(drag.path);
      return {
        wobble: { cells: wobble.length, turns: turns(wobble), endY: wobble.at(-1).y - y0 },
        ell: { turns: turns(ell), corner: [ell[corner].x - x0, ell[corner].y - y0], end: [ell.at(-1).x - x0, ell.at(-1).y - y0] },
        diagonal: { turns: turns(diagonal), end: before.at(-1) === flipped.at(-1), changed: before.join() !== flipped.join(), flippedTurns: turns(drag.path) },
        undone,
        tight,
      };
    });
    expect(out.wobble).toEqual({ cells: 9, turns: 0, endY: 0 });
    expect(out.ell).toEqual({ turns: 1, corner: [6, 0], end: [6, 5] });
    expect(out.diagonal).toMatchObject({ turns: 1, end: true, changed: true });
    expect(out.undone).toBe(0);
    expect(out.tight).toEqual([[0, 0], [1, 0], [1, 1]]);
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
