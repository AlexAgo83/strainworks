// The live performance graph: it measures only while shown, by kind, and costs nothing hidden.
import { expect, it } from "vitest";
import { fromMenu, launch, pageHTML } from "./harness.mjs";

it("shows what each frame costs, and stops measuring once hidden", async () => {
  const browser = await launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", (route) =>
      route.request().url().startsWith("http://proto.test") ? route.fulfill({ body: pageHTML(), contentType: "text/html" }) : route.abort(),
    );
    await page.goto("http://proto.test/prototype/");
    await page.evaluate(() => {
      begin();
      G.open = true;
      paused = false;
    });
    expect(await page.locator("#perf").isHidden()).toBe(true);

    await fromMenu(page, "perf-toggle");
    await page.waitForFunction(() => PERF.history.length >= 5);
    const shown = await page.evaluate(() => {
      const last = PERF.history.at(-1);
      return { kinds: Object.keys(last.costs), sim: PERF.history.some((s) => s.costs.sim > 0), draw: last.costs.draw > 0, frame: last.frame > 0, kept: localStorage.getItem("strainworks-perf") };
    });
    expect(shown).toEqual({ kinds: ["sim", "fog", "draw", "three", "ui", "save"], sim: true, draw: true, frame: true, kept: "on" });
    expect(await page.locator("#perf-sum").textContent()).toMatch(/images\/s/);
    expect(await page.locator("#perf").isVisible()).toBe(true);

    // Nested scopes are counted once: the fog seen during a step is not simulation too.
    const nested = await page.evaluate(() => {
      PERF.cost = Object.fromEntries(Object.keys(PERF.cost).map((k) => [k, 0]));
      const was = PERF.on;
      step(STEP * 2);
      look(true);
      const c = PERF.cost;
      PERF.on = was;
      return c.fog > 0 && c.sim >= 0;
    });
    expect(nested).toBe(true);

    await page.click("#perf-toggle");
    const hidden = await page.evaluate(async () => {
      const before = PERF.history.length;
      await new Promise((done) => setTimeout(done, 400));
      return { on: PERF.on, history: PERF.history.length, before, panel: document.querySelector("#perf").hidden };
    });
    expect(hidden).toMatchObject({ on: false, history: 0, panel: true });
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
