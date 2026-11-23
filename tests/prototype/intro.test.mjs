// The goal card: on a first game it opens over the paused game, its three pictures are made of the game's own
// models and marks, it is gone for good once closed, and the menu shows it again.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

it("shows the goal once on a first game, made of the game's pictures, and again from the menu", async () => {
  const browser = await launch();
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, planet: true, intro: true });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", (route) => (route.request().url().startsWith("http://proto.test") ? route.fulfill({ body: pageHTML(), contentType: "text/html" }) : route.abort()));
    await page.goto("http://proto.test/prototype/");
    await page.locator("#slot-actions button", { hasText: "Fonder" }).click();
    await page.waitForFunction(() => !orbit.on);
    const first = await page.evaluate(() => ({
      open: !document.querySelector("#intro").hidden,
      paused,
      models: [...document.querySelectorAll("#intro [data-model]")].map((el) => el.dataset.model),
      marks: document.querySelectorAll("#intro .gene svg, #intro .tag svg").length > 0,
      creatures: document.querySelectorAll("#intro [data-creature] canvas").length,
      letters: /SFS/.test(document.querySelector("#intro").innerText),
      kicker: document.querySelector("#intro-no").textContent,
    }));
    await page.click("#intro-next");
    await page.click("#intro-next");
    const last = await page.evaluate(() => [document.querySelector("#intro-no").textContent, document.querySelector("#intro-next").textContent]);
    await page.click("#intro-next");
    const closed = await page.evaluate(() => [document.querySelector("#intro").hidden, paused, localStorage.getItem("strainworks-intro")]);
    await page.evaluate(() => showMenu(true));
    await page.click('[data-go="dev"]');
    await page.click("#intro-again");
    const again = await page.evaluate(() => !document.querySelector("#intro").hidden);

    expect(first).toMatchObject({ open: true, paused: true, marks: true, creatures: 2, letters: false, kicker: "Ton objectif · 1 sur 3" });
    expect(first.models).toEqual(expect.arrayContaining(["core", "mine", "ligase", "turret"]));
    expect(last).toEqual(["Ton objectif · 3 sur 3", "Commencer"]);
    expect(closed).toEqual([true, false, null]);
    expect(again).toBe(true);
    // The core sheet opens on its five stages, the first one under way.
    const frieze = await page.evaluate(() => {
      showIntro(false);
      select(key(CORE.x, CORE.y));
      refresh();
      return [...document.querySelectorAll("#sheet .frieze span")].map((s) => s.className);
    });
    expect(frieze).toEqual(["now", "", "", "", "", ""]);
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});

it("starts a new game on the core alone, the view centred on it", async () => {
  const browser = await launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, line: false });
    await page.route("**/*", (route) => (route.request().url().startsWith("http://proto.test") ? route.fulfill({ body: pageHTML(), contentType: "text/html" }) : route.abort()));
    await page.goto("http://proto.test/prototype/");
    const start = await page.evaluate(() => {
      begin();
      const middle = screenAt(centreOf(coreCell()));
      return { built: Object.values(G.cells).map((c) => c.type), centred: Math.abs(middle.x - view.w / 2) < 2 && Math.abs(middle.y - view.h / 2) < 2 };
    });
    expect(start).toEqual({ built: ["core"], centred: true });
  } finally {
    await browser.close();
  }
});
