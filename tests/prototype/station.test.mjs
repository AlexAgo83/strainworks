// The live station of the opening screen: it takes the picture's place and aims the beam, or the picture stays.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

const file = (path) => fileURLToPath(new URL(path, import.meta.url));
const ENGINE = file("../../node_modules/babylonjs/babylon.js");

async function open(browser, { engine }) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, planet: true });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/*", (route) => {
    const url = route.request().url();
    const js = { contentType: "application/javascript", headers: { "access-control-allow-origin": "*" } };
    if (url.includes("cdn.jsdelivr.net/npm/babylonjs@")) return engine ? route.fulfill({ path: ENGINE, ...js }) : route.abort();
    if (url === "http://proto.test/prototype/station3d.js") return route.fulfill({ body: readFileSync(file("../../prototype/station3d.js")), ...js });
    if (url.startsWith("http://proto.test")) return route.fulfill({ body: pageHTML(), contentType: "text/html" });
    return route.abort();
  });
  await page.goto("http://proto.test/prototype/");
  return { page, errors };
}

it("opens on a live station that aims the beam, and frees it for the game", async () => {
  const browser = await launch();
  try {
    const { page, errors } = await open(browser, { engine: true });
    await page.waitForFunction(() => station3d.st !== null, null, { timeout: 60000 });
    const shown = await page.evaluate(() => {
      drawPlanet(0.1);
      const [x, y] = station3d.st.lens(), b = orbit.box;
      return {
        live: !document.querySelector("#station-live").hidden,
        picture: document.querySelector("#station").hidden,
        beam: Math.hypot(b.lens[0] - (b.sx + b.ss * x), b.lens[1] - (b.sy + b.ss * y)) < 1,
        inside: x > 0 && x < 1 && y > 0 && y < 1,
      };
    });
    expect(shown).toEqual({ live: true, picture: true, beam: true, inside: true });
    // Through the zoom the live station stays: the picture is an older model. Read in the same task as the click,
    // so a slow first press (the audio context it makes) cannot let the zoom end before the reading.
    const zooming = await page.evaluate(() => {
      [...document.querySelectorAll("#slot-actions button")].find((b) => b.textContent.includes("Fonder")).click();
      return [orbit.on, Boolean(station3d.st), document.querySelector("#station-live").hidden, document.querySelector("#station").hidden];
    });
    expect(zooming).toEqual([false, true, false, true]);
    await page.waitForFunction(() => station3d.st === null);
    expect(await page.evaluate(() => [document.querySelector("#station-live").hidden, document.querySelector("#station").hidden, document.querySelector("#planet").hidden])).toEqual([true, false, true]);
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});

it("keeps the picture when the engine cannot load", async () => {
  const browser = await launch();
  try {
    const { page, errors } = await open(browser, { engine: false });
    await page.waitForFunction(() => orbit.on && !station3d.loading);
    expect(await page.evaluate(() => [station3d.st, document.querySelector("#station").hidden, document.querySelector("#station-live").hidden])).toEqual([null, false, true]);
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
