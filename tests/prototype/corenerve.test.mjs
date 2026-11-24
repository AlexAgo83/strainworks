// A nerve to the core lets its network read the recipe the core still asks for; threats still come first.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

it("reads the core's recipe on a quiet nerve and puts threats first", async () => {
  const browser = await launch();
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", (route) => (route.request().url().startsWith("http://proto.test") ? route.fulfill({ body: pageHTML(), contentType: "text/html" }) : route.abort()));
    await page.goto("http://proto.test/prototype/");
    const out = await page.evaluate(() => {
      begin();
      paused = true;
      G.open = true;
      G.enemies = [];
      const core = coreCell(), screen = put("screen", core.x + 6, core.y, 0), gun = put("turret", core.x + 6, core.y + 3, 0);
      wireUp(core, screen); G.wires.at(-1).left = 0;
      sense();
      const quiet = netOf(screen).focus, wants = coreWants()[0];
      wireUp(screen, gun); G.wires.at(-1).left = 0;
      G.enemies.push({ x: gun.x + 1.5, y: gun.y + .5, gene: "SSS", hp: 9 });
      sense();
      return { quiet, wants, threat: netOf(screen).focus, against: opposite("SSS") };
    });
    expect(out.wants).toBeTruthy();
    expect(out.quiet).toBe(out.wants);
    expect(out.threat).toBe(out.against);
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
