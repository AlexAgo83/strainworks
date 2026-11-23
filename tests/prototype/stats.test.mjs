// The Statistics sheet: the last dock button and key 8 open it, its tabs read the running factory.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

it("opens the statistics and sends the camera to what slows the factory", async () => {
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
      paused = true;
      G.breaches = [];
      put("turret", 60, 40, 0);
      G.cells["60,40"].left = 0;
      refresh();
    });
    await page.keyboard.press("Digit8");
    const opened = await page.evaluate(() => [document.querySelector("#stats").hidden, document.querySelector("#stats-pod").getAttribute("aria-pressed")]);
    expect(opened).toEqual([false, "true"]);
    const seen = {};
    for (const tab of ["prod", "eco", "def", "threat", "logi"]) {
      seen[tab] = await page.evaluate((tab) => {
        document.querySelector(`#stats [data-tab="${tab}"]`).click();
        return document.querySelector(`#stats [data-tab="${tab}"]`).getAttribute("aria-selected") === "true" && document.querySelector("#stats-body").textContent.length > 10;
      }, tab);
    }
    expect(seen).toEqual({ prod: true, eco: true, def: true, threat: true, logi: true });
    // The dry turret is a blocking point; touching it closes the sheet and the camera goes there.
    const sent = await page.evaluate(() => {
      const row = document.querySelector('#stats-body [data-at="60,40"]');
      const red = row?.querySelector(".badge.red") !== null;
      row.click();
      return [red, document.querySelector("#stats").hidden, ui.travel?.x ?? cam.x, ui.travel?.y ?? cam.y];
    });
    expect(sent).toEqual([true, true, 60.5, 40.5]);
    // Escape closes it too.
    await page.keyboard.press("Digit8");
    await page.keyboard.press("Escape");
    expect(await page.evaluate(() => [document.querySelector("#stats").hidden, ui.menu])).toEqual([true, false]);
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
