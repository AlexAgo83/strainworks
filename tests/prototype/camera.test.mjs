// The arrows move the camera: each way, diagonals, faster with Shift, and they stop when let go.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

it("moves the camera with the arrows", async () => {
  const html = pageHTML();
  const browser = await launch();
  try {
    const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", (route) => (route.request().url().startsWith("http://proto.test") ? route.fulfill({ body: html, contentType: "text/html" }) : route.abort()));
    await page.goto("http://proto.test/");
    await page.evaluate(() => {
      begin();
      paused = true;
    });

    const glideFor = async (keys) => {
      for (const name of keys) await page.keyboard.down(name);
      // Measured by hand on one fixed step, the frame rate of the machine does not count.
      const moved = await page.evaluate(() => {
        Object.assign(cam, { x: 50, y: 50, zoom: 20 });
        glide(0.5);
        return [cam.x - 50, cam.y - 50];
      });
      for (const name of keys) await page.keyboard.up(name);
      return moved.map((value) => Math.round(value * 100) / 100);
    };

    // 720 pixels a second, so 18 cells in half a second at 20 pixels a cell.
    expect(await glideFor(["ArrowRight"])).toEqual([18, 0]);
    expect(await glideFor(["ArrowLeft"])).toEqual([-18, 0]);
    expect(await glideFor(["ArrowDown"])).toEqual([0, 18]);
    expect(await glideFor(["ArrowUp"])).toEqual([0, -18]);
    expect(await glideFor(["ArrowRight", "ArrowDown"])).toEqual([12.73, 12.73]);
    expect(await glideFor(["ArrowLeft", "ArrowRight"])).toEqual([0, 0]);
    expect(await glideFor(["Shift", "ArrowRight"])).toEqual([45, 0]);
    expect(await glideFor([])).toEqual([0, 0]);

    // A held key moves on its own with the game paused, and losing the window stops it.
    const start = await page.evaluate(() => cam.x);
    await page.keyboard.down("ArrowRight");
    await page.waitForFunction((from) => cam.x > from + 1, start);
    expect(await page.evaluate(() => {
      window.dispatchEvent(new Event("blur"));
      return arrows.size;
    })).toBe(0);
    await page.keyboard.up("ArrowRight");
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
