// The unpacker opens a box from behind: its content comes out at the front one at a time, its carbon on the right.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

it("unpacks capsules and magazines into their genes, carbon out on the side", async () => {
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
      // Facing east: boxes come from the west, genes go east, carbon south.
      const feed = put("cyst", 19, 70, 1), u = put("unpack", 20, 70, 1), front = put("cyst", 21, 70, 1), side = put("cyst", 20, 71, 2);
      feed.stock = ["T:SFS", "A:CNF"];
      feed.due = [];
      const refused = accepts(u, "SFS", 1);
      for (let i = 0; i < 900; i++) step(STEP);
      return { refused, front: [...front.stock].sort(), side: side.stock, left: u.ports[0].length + u.ports[1].length };
    });
    expect(out.refused).toBe(false);
    expect(out.front).toEqual([...Array(6).fill("CNF"), ...Array(6).fill("SFS")]);
    expect(out.side).toEqual(["K", "K", "K"]);
    expect(out.left).toBe(0);
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
