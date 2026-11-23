// A relay only carries a nerve: radar, relays and turret wired in a chain make one network.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

it("carries a nerve network through relays, and is wired like any end", async () => {
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
      const radar = put("radar", 10, 70, 0), r1 = put("relay", 30, 70, 0), r2 = put("relay", 50, 70, 0), gun = put("turret", 70, 70, 0);
      const tooFar = wireUp(radar, r2);
      const linked = [wireUp(radar, r1), wireUp(r1, r2), wireUp(r2, gun)];
      for (const w of G.wires) w.left = 0;
      // A creature only the radar sees, far from the turret.
      G.enemies = [{ x: 12, y: 74, gene: "SFN", hp: 10, max: 10 }];
      sense();
      const net = netOf(gun);
      return { tooFar, linked, same: netOf(radar) === net && netOf(r1) === net, radars: net?.radars, wants: net?.list };
    });
    expect(out.tooFar).toBeFalsy();
    expect(out.linked).toEqual([true, true, true]);
    expect(out.same).toBe(true);
    expect(out.radars).toBe(1);
    expect(out.wants.length).toBe(1);
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
