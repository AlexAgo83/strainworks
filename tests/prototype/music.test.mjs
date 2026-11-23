// The music: nothing before the first press, the calm pieces in a game, the fight piece while it is hot and a
// little after, and a volume and a switch in the menu, kept for the next visit.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

it("plays the piece the moment wants and keeps the volume chosen", async () => {
  const html = pageHTML();
  const browser = await launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", (route) => (route.request().url().startsWith("http://proto.test") ? route.fulfill({ body: html, contentType: "text/html" }) : route.abort()));
    await page.goto("http://proto.test/");
    await page.evaluate(() => { begin(); paused = true; });
    const before = await page.evaluate(() => [music.started, music.src]);
    await page.keyboard.press("Shift");
    const calm = await page.evaluate(() => [music.started, music.src.endsWith("_02.mp3"), Boolean(music.gains)]);
    const fight = await page.evaluate(() => {
      document.querySelector("#app").classList.add("hot");
      musicTick();
      const hot = music.src;
      document.querySelector("#app").classList.remove("hot");
      musicTick();
      const after = music.src;
      music.fightUntil = 0;
      musicTick();
      return [hot.endsWith("_03.mp3"), after === hot, music.src.endsWith("_02.mp3")];
    });
    await page.evaluate(() => showMenu(true));
    await page.fill("#music-volume", "20");
    await page.click("#music-on");
    const menu = await page.evaluate(() => [music.volume, music.on, document.querySelector("#music-on").textContent, JSON.parse(localStorage.getItem("strainworks-music"))]);
    await page.reload();
    const kept = await page.evaluate(() => [document.querySelector("#music-volume").value, document.querySelector("#music-on").getAttribute("aria-pressed")]);

    expect(before).toEqual([false, ""]);
    expect(calm).toEqual([true, true, true]);
    expect(fight).toEqual([true, true, true]);
    expect(menu).toEqual([0.2, false, "Coupée", { volume: 0.2, on: false }]);
    expect(kept).toEqual(["20", "false"]);
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
