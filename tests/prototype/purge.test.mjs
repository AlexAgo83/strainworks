// A Ligase wired to a nerve empties its inputs when the antidote its network asks for changes.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

it("drops a Ligase's waiting bases when its network asks for another antidote", async () => {
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
      const gun = put("turret", 30, 70, 0), lig = put("ligase", 26, 70, 1);
      const wired = wireUp(gun, lig);
      for (const w of G.wires) w.left = 0;
      G.enemies = [{ x: 31, y: 72, gene: "SFN", hp: 10, max: 10 }];
      sense();
      lig.ports = [["S"], ["F"], []];
      sense();
      const kept = lig.ports.flat().length;
      G.enemies = [{ x: 31, y: 72, gene: "CCN", hp: 10, max: 10 }];
      G.time += NERVE.hold + 1;
      sense();
      // A screen on the same network shows what it asks for.
      const screen = put("screen", 28, 74, 0);
      wireUp(gun, screen);
      for (const w of G.wires) w.left = 0;
      sense();
      return { wired, kept, after: lig.ports.flat().length, heard: lig.heard === opposite("CCN"), shown: screen.shown === opposite("CCN") };
    });
    expect(out.wired).toBe(true);
    expect(out.kept).toBe(2);
    expect(out.after).toBe(0);
    expect(out.heard).toBe(true);
    expect(out.shown).toBe(true);
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
