// The inverter turns a gene round: its bases come out in the opposite order.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

it("reverses each gene it is given, and takes nothing else", async () => {
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
      const feed = put("cyst", 19, 70, 1), f = put("flip", 20, 70, 1), front = put("cyst", 21, 70, 1);
      feed.stock = ["SFN", "CCN", "SFN"];
      feed.due = [];
      const refused = [accepts(f, "T:SFN", 1), accepts(f, "SFNCCN", 1), accepts(f, "S", 1)];
      for (let i = 0; i < 300; i++) step(STEP);
      return { refused, front: front.stock };
    });
    expect(out.refused).toEqual([false, false, false]);
    expect(out.front).toEqual(["NFS", "NCC", "NFS"]);
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
