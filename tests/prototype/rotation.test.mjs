// The direction in hand: R cycles it, placing keeps it, a visit later it is still there, also inside a frame.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

it("keeps and cycles the direction in hand", async () => {
  const html = pageHTML();
  const browser = await launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1000, height: 750 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const framed = '<!doctype html><input id="outside" autofocus><iframe src="/game" style="width:950px;height:680px;border:0"></iframe>';
    await page.route("**/*", (route) => {
      const url = route.request().url();
      if (!url.startsWith("http://proto.test")) return route.abort();
      return route.fulfill({ body: url.endsWith("/game") ? html : framed, contentType: "text/html" });
    });
    await page.goto("http://proto.test/");
    const game = () => page.frames().find((frame) => frame.url().endsWith("/game"));
    await game().waitForSelector('#tools [data-type="hand"]');
    await game().evaluate(() => {
      begin();
      paused = true;
      G.open = true;
      G.breaches = [];
      choose("cyst");
      Object.assign(cam, { x: 20, y: 80, zoom: 30 });
    });
    const centre = async (x, y) => {
      const box = await game().locator("#game").boundingBox();
      const point = await game().evaluate(([a, b]) => [view.w / 2 + (a + 0.5 - cam.x) * cam.zoom, view.h / 2 + (b + 0.5 - cam.y) * cam.zoom], [x, y]);
      return [box.x + point[0], box.y + point[1]];
    };
    const dir = (x, y) => game().evaluate(([a, b]) => G.cells[key(a, b)]?.dir, [x, y]);
    const inHand = () => game().evaluate(() => heading);

    // The keyboard starts outside the frame, a click on the board brings it in.
    await page.focus("#outside");
    await page.mouse.click(...(await centre(14, 80)));
    expect(await dir(14, 80)).toBe(0);

    // The piece just placed stays selected, yet R turns the next one once the pointer moves on.
    await page.mouse.move(...(await centre(17, 80)));
    await page.keyboard.press("r");
    expect([await inHand(), await dir(14, 80)]).toEqual([1, 0]);
    expect(await game().evaluate(() => preview().dir)).toBe(1);
    await page.mouse.click(...(await centre(17, 80)));
    await page.mouse.click(...(await centre(20, 80)));
    expect([await dir(17, 80), await dir(20, 80)]).toEqual([1, 1]);

    // A full cycle, and back.
    await page.mouse.move(...(await centre(23, 80)));
    const seen = [];
    for (const press of ["r", "r", "r", "r", "Shift+R"]) {
      await page.keyboard.press(press);
      seen.push(await inHand());
    }
    expect(seen).toEqual([2, 3, 0, 1, 0]);

    // Over a piece R turns that piece, and the next ones follow it.
    await page.mouse.move(...(await centre(17, 80)));
    await page.keyboard.press("r");
    expect([await dir(17, 80), await inHand()]).toEqual([2, 2]);

    // Other tools and a new game keep it.
    expect(await game().evaluate(() => {
      choose("hand");
      choose("mine");
      const kept = [heading];
      begin();
      kept.push(heading);
      return kept;
    })).toEqual([2, 2]);

    // With the hand, R turns what is selected and leaves the piece in hand alone.
    expect(await game().evaluate(() => {
      const c = put("cyst", 30, 80, 0);
      choose("hand");
      hovered = null;
      select("30,80");
      rotate(false);
      return [c.dir, heading];
    })).toEqual([1, 2]);

    await page.reload();
    await game().waitForSelector('#tools [data-type="hand"]');
    expect(await inHand()).toBe(2);
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
