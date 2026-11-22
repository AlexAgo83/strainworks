// The keyboard: arrows move the camera, Space pauses and resumes, Escape puts the tool down.
import { expect, it } from "vitest";
import { launch, pageHTML, pickTool } from "./harness.mjs";

it("moves the camera with the arrows and pauses with Space", async () => {
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

    // Space pauses and resumes, even just after clicking a tool, and never clicks that tool again.
    await pickTool(page, "belt");
    await page.evaluate(() => {
      window.toolClicks = 0;
      document.querySelector("#tools").addEventListener("click", () => window.toolClicks++);
    });
    const state = () => page.evaluate(() => [paused, window.toolClicks, document.querySelector("#pause").textContent]);
    await page.keyboard.press("Space");
    expect(await state()).toEqual([false, 0, "II"]);
    await page.keyboard.press("Space");
    expect(await state()).toEqual([true, 0, "▶"]);

    // Held, it flips once.
    await page.keyboard.down("Space");
    await page.keyboard.down("Space");
    await page.keyboard.up("Space");
    expect((await state())[0]).toBe(false);

    // Just after a click on the pause button it flips once too, and on the board as well.
    await page.click("#pause");
    await page.keyboard.press("Space");
    expect((await state())[0]).toBe(false);
    await page.mouse.click(200, 300);
    await page.keyboard.press("Space");
    expect((await state())[0]).toBe(true);

    // Who walks the buttons with Tab still presses them with Space.
    await page.focus('#tools [data-type="hand"]');
    await page.keyboard.press("Tab");
    await page.keyboard.press("Space");
    expect(await state()).toEqual([true, 1, "▶"]);

    // Escape puts the tool down, with what was selected or being linked.
    await page.evaluate(() => {
      G.open = true;
      choose("wire");
      wiring = "48,34";
      selected = "48,39";
    });
    await page.keyboard.press("Escape");
    expect(await page.evaluate(() => [tool, wiring, linking, selected])).toEqual(["hand", null, null, null]);

    // In the middle of a press, letting go afterwards builds nothing.
    await pickTool(page, "cyst");
    const board = await page.locator("#game").boundingBox();
    const built = () => page.evaluate(() => Object.keys(G.cells).length);
    const count = await built();
    await page.mouse.move(board.x + 420, board.y + 300);
    await page.mouse.down();
    await page.keyboard.press("Escape");
    await page.mouse.up();
    expect([await page.evaluate(() => tool), await built()]).toEqual(["hand", count]);
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
