// New transformers turn like the others and show where things come in and go out.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

it("lets the unpacker and the inverter turn, and points at their ways in and out", async () => {
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
      const u = put("unpack", 20, 70, 1), f = put("flip", 22, 70, 1);
      const ways = (c) => portsOf(c).map((p) => `${p.out ? "out" : "in"}${p.dir}`).sort();
      return { turns: ["unpack", "flip", "screen"].every((t) => TURNS.includes(t)), unpack: ways(u), flip: ways(f) };
    });
    expect(out.turns).toBe(true);
    expect(out.unpack).toEqual(["in3", "out1", "out2"]);
    expect(out.flip).toEqual(["in3", "out1"]);
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
