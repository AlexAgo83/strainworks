// The site server lets only the https origins it is given embed the site; the published headers stay unframeable.
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { framedBy, headerRules, serveSite } from "../scripts/serve-site.mjs";

it("lets named https origins embed the site, and nothing else", async () => {
  expect(framedBy("https://hq.example:8448 https://other.example")).toEqual(["https://hq.example:8448", "https://other.example"]);
  for (const bad of ["", "http://hq.example", "https://hq.example/path", "https://hq.example; script-src *", "*"]) expect(framedBy(bad)).toEqual([]);
  const rules = headerRules(readFileSync(new URL("../render.yaml", import.meta.url), "utf8"));
  const dir = new URL("../site", import.meta.url).pathname;
  for (const [frameAncestors, csp, xfo] of [
    [[], "frame-ancestors 'none'", "DENY"],
    [["https://hq.example"], "frame-ancestors 'self' https://hq.example", null],
  ]) {
    const server = await serveSite({ dir, port: 0, rules, frameAncestors });
    try {
      const response = await fetch(`http://127.0.0.1:${server.address().port}/site.webmanifest`);
      expect(response.headers.get("content-security-policy")).toContain(csp);
      expect(response.headers.get("x-frame-options")).toBe(xfo);
    } finally {
      server.close();
    }
  }
});
