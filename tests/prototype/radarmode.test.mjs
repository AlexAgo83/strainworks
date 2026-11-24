// A radar watching nests tells its net the antidote to an awake nest's next wave; a creature radar does not.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

it("reads nests or creatures as its mode says, and colours a whole nerve network", async () => {
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
      const radar = put("radar", 30, 30, 0), screen = put("screen", 33, 30, 0);
      wireUp(radar, screen); G.wires.at(-1).left = 0;
      G.breaches = [{ x: 36, y: 34, state: "wake", genes: ["SFN"], wave: 0, left: 5, total: 5, r: 6 }];
      sense();
      const creaturesOnly = netOf(screen).focus;
      radar.watch = "nests";
      sense();
      const nests = netOf(screen).focus, expected = opposite(waveGene(G.breaches[0]));
      // Colour: a nerve added to a coloured network takes its colour.
      for (const w of netWires(key(radar.x, radar.y))) w.color = 3;
      const relay = put("relay", 33, 33, 0);
      wireUp(screen, relay);
      return { creaturesOnly, nests, expected, tint: G.wires.at(-1).color, mk3: RANK_NEED[2] };
    });
    expect(out.creaturesOnly).toBe("");
    expect(out.nests).toBe(out.expected);
    expect(out.tint).toBe(3);
    expect(out.mk3).toBe(4);
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
