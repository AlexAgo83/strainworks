// On a net asking for a strand, sorters read positions 4 to 6 and a wired joiner puts each gene in its place.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

it("builds the asked strand in order and lets sorters read its back half", async () => {
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
      G.breaches = [];
      G.goals = [{ item: "SFNCCN", count: 5, fed: 0 }];
      const core = coreCell(), join = put("join", core.x + 8, core.y, 1), sort = put("sort", core.x + 8, core.y + 4, 1);
      wireUp(core, join); G.wires.at(-1).left = 0;
      wireUp(join, sort); G.wires.at(-1).left = 0;
      sense();
      // Both halves come in from the same side, back half first: each still lands in its place.
      const side = [0, 1, 2, 3].find((dir) => connects(join, dir));
      const refusesOther = !accepts(join, "KKK", side) && !accepts(join, "SSS", side);
      receive(join, "CCN", side); receive(join, "SFN", side);
      const ports = join.ports.map((p) => [...p]);
      sort.read = 5;
      const fifth = asked(sort, "C"), notFifth = asked(sort, "N");
      return { refusesOther, ports, fifth, notFifth, focus: netOf(join).focus };
    });
    expect(out.focus).toBe("SFNCCN");
    expect(out.refusesOther).toBe(true);
    expect(out.ports[0]).toEqual(["SFN"]);
    expect(out.ports[1]).toEqual(["CCN"]);
    expect(out.fifth).toBe(true);
    expect(out.notFifth).toBe(false);
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
