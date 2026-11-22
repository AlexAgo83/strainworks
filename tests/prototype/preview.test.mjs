// The preview never lies: what it announces under the pointer is what the tap does.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

it("announces what a tap does", async () => {
  const html = pageHTML();
  const browser = await launch();
  try {
    const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", (route) => (route.request().url().startsWith("http://proto.test") ? route.fulfill({ body: html, contentType: "text/html" }) : route.abort()));
    await page.goto("http://proto.test/");
    const out = await page.evaluate(() => {
      const state = () => JSON.stringify([G.cells, G.tracks, G.worms, G.wires, G.ruins]);
      const world = (dna) => {
        begin();
        paused = true;
        G.open = true;
        G.dna = dna;
        G.seed = 12345;
        put("belt", 45, 60, 1);
        put("gate", 46, 60, 1);
        put("turret", 47, 60, 0);
        put("pump", 48, 60, 0);
        put("wall", 49, 60, 0);
        put("ligase", 50, 60, 0);
        G.ruins["51,60"] = { ...cell("wall", 51, 60, 0) };
        layTrack(45, 62, 1).left = 0;
        layTrack(46, 62, 1).left = 0;
      };
      const spots = [[45, 60], [46, 60], [47, 60], [48, 60], [49, 60], [50, 60], [51, 60], [45, 62], [40, 60], [48, 27], [35, 45], [CORE.x, CORE.y]];
      const out = { lies: [], checked: 0, seen: new Set() };
      for (const dna of [5000, 0]) {
        for (const type of TOOLBAR) {
          for (const [x, y] of spots) {
            world(dna);
            choose(type);
            Object.assign(cam, { x: x + 0.5, y: y + 0.5, zoom: 30 });
            hovered = { x: view.w / 2, y: view.h / 2 };
            const p = preview();
            const before = state();
            place(x, y);
            const changed = state() !== before;
            out.checked++;
            out.seen.add(p.act);
            const bad =
              (BIG[p.type] || p.size ? x - p.x < 0 || x - p.x > 1 || y - p.y < 0 || y - p.y > 1 : p.x !== x || p.y !== y) ||
              (["no", "select", "none"].includes(p.act) && changed) ||
              (["scrap", "turn", "use"].includes(p.act) && !changed) ||
              (p.act === "build" && !changed) ||
              (p.act === "build" && p.type !== "worm" && p.type !== "track" && cellAt(x, y).type !== p.type) ||
              (p.act === "build" && p.dir != null && p.type !== "track" && cellAt(x, y).dir !== p.dir) ||
              (p.act === "link" && changed && type !== "pump");
            if (bad) out.lies.push([type, x, y, dna, p.act, changed]);
          }
        }
      }
      out.seen = [...out.seen].sort();

      // Looking changes nothing.
      world(5000);
      choose("turret");
      hovered = { x: 100, y: 100 };
      const still = JSON.stringify(G);
      for (let i = 0; i < 3; i++) {
        preview();
        draw();
      }
      out.pure = JSON.stringify(G) === still;
      choose("turret");
      Object.assign(cam, { x: 40.5, y: 60.5, zoom: 30 });
      return out;
    });
    expect(out.lies).toEqual([]);
    expect(out.checked).toBeGreaterThan(400);
    expect(out.seen).toEqual(["build", "link", "no", "none", "scrap", "select", "turn", "use"]);
    expect(out.pure).toBe(true);

    // A mouse shows it and carries the tool, leaving clears it.
    const box = await page.locator("#game").boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForFunction(() => document.querySelector("#game").style.cursor.startsWith("url("));
    const turret = await page.evaluate(() => [preview()?.type, document.querySelector("#game").style.cursor]);
    expect(turret[0]).toBe("turret");
    await page.evaluate(() => choose("erase"));
    await page.waitForFunction((was) => document.querySelector("#game").style.cursor !== was, turret[1]);
    await page.mouse.move(1, 1);
    expect(await page.evaluate(() => preview())).toBe(null);
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
