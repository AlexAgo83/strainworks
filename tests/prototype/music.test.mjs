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
      return [MUSIC.fight.includes(hot), after === hot, music.src === MUSIC.calm[music.calm]];
    });
    await page.evaluate(() => showMenu(true));
    await page.fill("#music-volume", "20");
    await page.click("#music-on");
    const menu = await page.evaluate(() => [music.volume, music.on, document.querySelector("#music-on").textContent, JSON.parse(localStorage.getItem("strainworks-music"))]);
    // Effects: one at a time per sound, silent when far from the screen, a volume and a switch kept like the music's.
    const effects = await page.evaluate(() => {
      // At half the music's volume by default, and placed by what the player looks at.
      // The music was set to 20 above; the effects kept their default, half of the music's default.
      const defaults = sfx.volume === 0.25;
      cam.zoom = 40;
      const middle = placeOf({ x: cam.x - 0.5, y: cam.y - 0.5 }), left = placeOf({ x: cam.x - 0.5 - view.w / 2 / cam.zoom * 0.8, y: cam.y - 0.5 });
      cam.zoom = 12;
      const wide = placeOf({ x: cam.x - 0.5, y: cam.y - 0.5 });
      cam.zoom = 40;
      const placed = [defaults, middle.gain === 1 && middle.pan === 0, left.pan < -0.5, wide.gain < middle.gain];
      const first = playSound("turret"), again = playSound("turret");
      const far = heard({ x: cam.x + 500, y: cam.y + 500 }), near = heard({ x: Math.floor(cam.x), y: Math.floor(cam.y) });
      return [...placed, first, again, far, near];
    });
    await page.fill("#sfx-volume", "40");
    await page.click("#sfx-on");
    const sfxMenu = await page.evaluate(() => [sfx.volume, sfx.on, JSON.parse(localStorage.getItem("strainworks-sfx"))]);
    await page.reload();
    const kept = await page.evaluate(() => [document.querySelector("#music-volume").value, document.querySelector("#music-on").getAttribute("aria-pressed")]);

    expect(before).toEqual([false, ""]);
    expect(calm).toEqual([true, true, true]);
    expect(fight).toEqual([true, true, true]);
    expect(menu).toEqual([0.2, false, "Coupée", { volume: 0.2, on: false }]);
    expect(kept).toEqual(["20", "false"]);
    expect(effects).toEqual([true, true, true, true, true, false, false, true]);
    expect(sfxMenu).toEqual([0.4, false, { volume: 0.4, on: false }]);
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
