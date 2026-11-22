// The 3D view: same game as 2D, same cell under the finger, pinned engine, and a 2D fallback.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { expect, it } from "vitest";
import { fromMenu, launch, pageHTML, pickTool } from "./harness.mjs";

const file = (path) => fileURLToPath(new URL(path, import.meta.url));
const ENGINE = file("../../node_modules/babylonjs/babylon.js");
const PARTS = ["view3d.js", "models3d.js", "terrain3d.js"];

async function open(browser, { network = true } = {}) {
  const page = await browser.newPage({ viewport: { width: 375, height: 700 }, hasTouch: true });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/*", (route) => {
    const url = route.request().url();
    const script = { contentType: "application/javascript", headers: { "access-control-allow-origin": "*" } };
    if (url.includes("cdn.jsdelivr.net/npm/babylonjs@")) return network ? route.fulfill({ path: ENGINE, ...script }) : route.abort();
    const part = PARTS.find((name) => url === `http://proto.test/prototype/${name}`);
    if (part) return route.fulfill({ path: file(`../../prototype/${part}`), ...script });
    if (url.startsWith("http://proto.test")) return route.fulfill({ body: pageHTML(), contentType: "text/html" });
    return route.abort();
  });
  await page.goto("http://proto.test/prototype/");
  return { page, errors };
}

it("pins the engine the CDN serves to the installed one", () => {
  const html = pageHTML();
  const installed = JSON.parse(readFileSync(file("../../node_modules/babylonjs/package.json"), "utf8")).version;
  expect(html).toContain(`babylonjs@${installed}/babylon.js`);
  expect(html).toContain(`sha384-${createHash("sha384").update(readFileSync(ENGINE)).digest("base64")}`);
});

it("stays in 2D when the engine cannot load", async () => {
  const browser = await launch();
  try {
    const { page, errors } = await open(browser, { network: false });
    await fromMenu(page, "dimension");
    await page.waitForFunction(() => document.querySelector("#message").textContent.startsWith("Vue 3D indisponible"));
    expect(await page.evaluate(() => [view3d, document.querySelector("#gl").hidden])).toEqual([null, true]);
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});

it("draws the same game and lands a finger on the same cell", async () => {
  const browser = await launch();
  try {
    const { page, errors } = await open(browser);
    await page.evaluate(() => {
      begin();
      paused = true;
      G.open = true;
      G.dna = 500;
      for (let i = 0; i < 300; i++) step(STEP);
    });
    await fromMenu(page, "dimension");
    await page.waitForFunction(() => view3d !== null);

    // Every kind of thing is drawn, and drawing never changes the game.
    const drawn = await page.evaluate(() => {
      let x = 40;
      for (const type of Object.keys(TYPES)) {
        if (["hand", "erase", "track", "worm", "wire"].includes(type)) continue;
        put(type, x++, 58, 1);
      }
      build("turret", 40, 61, 0);
      layTrack(44, 63, 1);
      layTrack(45, 63, 1);
      incubate(44, 63);
      wireUp(G.cells["48,34"], put("gate", 48, 42, 0));
      wake(G.breaches[0]);
      G.enemies.push({ x: 48, y: 31, gene: "SFN", hp: 20, max: 24 });
      G.shots.push({ x: 48, y: 34, tx: 48, ty: 31, hurt: 5, until: G.time + 5 });
      G.ruins["50,61"] = { type: "wall", x: 50, y: 61 };
      const before = JSON.stringify(G);
      view3d.draw();
      view3d.draw();
      return JSON.stringify(G) === before;
    });
    expect(drawn).toBe(true);

    // The ground has relief, and settles to the finger's plane under what is built.
    // With less motion asked for, it settles in one frame.
    await page.emulateMedia({ reducedMotion: "reduce" });
    const ground = await page.evaluate(() => {
      const free = [];
      for (let x = 10; x < 86; x += 2) for (let y = 10; y < 86; y += 2) free.push(view3d.ground(x + 0.5, y + 0.5));
      view3d.draw();
      const built = Object.values(G.cells).map((c) => Math.abs(view3d.ground(c.x + 0.5, c.y + 0.5)));
      return { relief: Math.max(...free) - Math.min(...free), worst: Math.max(...built) };
    });
    expect(ground.relief).toBeGreaterThan(0.4);
    expect(ground.worst).toBeLessThan(0.02);

    // Where a cell's centre is projected, a tap builds on that cell.
    await page.evaluate(() => {
      begin();
      paused = true;
      G.breaches = [];
      cam.x = 20;
      cam.y = 80;
      cam.zoom = 24;
    });
    const box = await page.locator("#game").boundingBox();
    const tilt = await page.evaluate(() => view3d.tilt);
    const at = (x, y, up = 0) => [box.x + box.width / 2 + (x + 0.5 - 20) * 24, box.y + box.height / 2 + (y + 0.5 - 80) * 24 * tilt - up];
    await pickTool(page, "cyst");
    const cells = [[15, 74], [20, 80], [24, 87]];
    for (const [x, y] of cells) await page.touchscreen.tap(...at(x, y));
    expect(await page.evaluate((list) => list.map(([x, y]) => G.cells[`${x},${y}`]?.type), cells)).toEqual(["cyst", "cyst", "cyst"]);

    // The top of a tall object selects the object.
    await pickTool(page, "hand");
    await page.touchscreen.tap(...at(20, 80, 14));
    expect(await page.evaluate(() => selected)).toBe("20,80");

    await pickTool(page, "belt");
    await page.mouse.move(...at(16, 83));
    await page.mouse.down();
    await page.mouse.move(...at(22, 83), { steps: 8 });
    await page.mouse.up();
    expect(await page.evaluate(() => [16, 17, 18, 19, 20, 21, 22].map((x) => G.cells[`${x},83`]?.type))).toEqual(Array(7).fill("belt"));

    await fromMenu(page, "dimension");
    expect(await page.evaluate(() => [view3d, document.querySelector("#gl").hidden, flat()])).toEqual([null, true, 1]);
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
