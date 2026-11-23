// A line is drawn as a ghost and built when let go: a belt crossed straight gets a bridge, a belt the line
// ends on is joined, and Escape gives the line up.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

it("builds a drawn line on release, bridges only what it crosses, and gives it up on Escape", async () => {
  const html = pageHTML();
  const browser = await launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", (route) => (route.request().url().startsWith("http://proto.test") ? route.fulfill({ body: html, contentType: "text/html" }) : route.abort()));
    await page.goto("http://proto.test/");
    // A belt running down, across the way of the lines drawn.
    const o = await page.evaluate(() => {
      begin();
      paused = true;
      G.dna = 1000;
      G.breaches = [];
      if (G.guide) G.guide.step = GUIDE.length;
      paintGuide();
      const x = CORE.x + 8, y = CORE.y + 8;
      for (let j = -3; j <= 3; j++) put("belt", x, y + j, 2);
      Object.assign(cam, { x: x + 0.5, y: y + 0.5, zoom: 40 });
      choose("belt");
      return { x, y };
    });
    const at = (x, y) => page.evaluate(([x, y]) => screenAt({ x: x + 0.5, y: y + 0.5 }), [x, y]);
    const draw = async (from, to, before) => {
      const a = await at(...from), b = await at(...to);
      await page.mouse.move(a.x, a.y);
      await page.mouse.down();
      await page.mouse.move(b.x, b.y, { steps: 12 });
      const during = await before?.();
      await page.mouse.up();
      return during;
    };
    const type = (x, y) => page.evaluate(([x, y]) => cellAt(x, y)?.type ?? null, [x, y]);

    // Across: nothing is built while drawing, a bridge once let go.
    const ghost = await draw([o.x - 3, o.y], [o.x + 3, o.y], () => page.evaluate(([x, y]) => [cellAt(x - 3, y)?.type ?? null, document.querySelector("#message").textContent.startsWith("Tracé")], [o.x, o.y]));
    const across = [await type(o.x - 3, o.y), await type(o.x, o.y), await type(o.x + 3, o.y)];

    // Onto: the line ends on the belt and joins it, no bridge.
    await draw([o.x - 3, o.y + 2], [o.x, o.y + 2]);
    const onto = [await type(o.x - 1, o.y + 2), await type(o.x, o.y + 2)];

    // Escape: the line is given up, the belt stays in hand.
    await draw([o.x - 3, o.y - 2], [o.x - 1, o.y - 2], () => page.keyboard.press("Escape"));
    const given = [await type(o.x - 3, o.y - 2), await page.evaluate(() => tool)];

    expect(ghost).toEqual([null, true]);
    expect(across).toEqual(["belt", "bridge", "belt"]);
    expect(onto).toEqual(["belt", "belt"]);
    expect(given).toEqual([null, "belt"]);
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
