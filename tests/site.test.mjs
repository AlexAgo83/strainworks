// The built site, under the headers it is deployed with: it runs, installs, and plays offline.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { expect, it } from "vitest";
import { headerRules, serveSite } from "../scripts/serve-site.mjs";

const at = (path) => fileURLToPath(new URL(`../${path}`, import.meta.url));

it("builds a site that plays in 3D and offline under its own policy", async () => {
  const scratch = mkdtempSync(join(tmpdir(), "strainworks-site-"));
  const dir = join(scratch, "dist");
  execFileSync(process.execPath, [at("scripts/build-site.mjs"), dir], { env: { ...process.env, BUILD_COMMIT: "a".repeat(40) } });
  const rules = headerRules(readFileSync(at("render.yaml"), "utf8"));
  const server = await serveSite({ dir, port: 0, rules });
  const site = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({ viewport: { width: 375, height: 700 }, reducedMotion: "reduce" });
    // The language is asked on first opening: this run picks French, the language it reads.
    await context.addInitScript(() => localStorage.setItem("strainworks-lang", "fr"));
    // Only this site: nothing may be needed from anywhere else.
    await context.route(/^https:/, (route) => route.abort());
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (/Content Security Policy|planet without|offline play unavailable/.test(message.text())) errors.push(message.text().slice(0, 200));
    });

    const answer = await page.goto(site);
    expect(answer.headers()["content-security-policy"]).toContain("script-src 'self';");
    expect(await page.evaluate(() => fetch("./version.json").then((r) => r.json()))).toMatchObject({ commit: "a".repeat(40) });
    expect((await page.request.get(`${site}..%2f..%2fpackage.json`)).status()).toBe(404);
    expect(await page.locator("link[rel=manifest]").getAttribute("href")).toBe("./site.webmanifest");
    await page.waitForFunction(() => orbit.gl?.ready === 2);
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.waitForFunction(() => navigator.serviceWorker.controller);

    await page.locator("#slot-actions button", { hasText: "Fonder une station" }).click();
    await page.evaluate(() => {
      paused = true;
      G.dna = 222;
      save();
    });

    await context.setOffline(true);
    await page.reload();
    await page.waitForFunction(() => orbit.on && orbit.gl?.ready === 2);
    await page.locator("#slot-actions button", { hasText: "Reprendre" }).click();
    expect(await page.evaluate(() => G.dna)).toBe(222);
    await page.click("#menu-toggle");
    expect(await page.locator("#build").textContent()).toContain("aaaaaaa");
    // A game opens in 3D by default: offline, the engine comes from the site's own cache.
    await page.waitForFunction(() => view3d !== null, null, { timeout: 60000 });
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
    server.closeAllConnections();
    await new Promise((done) => server.close(done));
    rmSync(scratch, { recursive: true, force: true });
  }
});
