// The demo: its hexagon is kept for it (a player's game there moves aside, intact), it opens fresh and never saves.
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

const demo = readFileSync(new URL("../../prototype/demo.js", import.meta.url), "utf8");

it("moves a game off the demo hexagon and opens the demo fresh without saving it", async () => {
  const browser = await launch();
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", (route) => {
      const url = route.request().url();
      if (url.endsWith("/demo.js")) return route.fulfill({ body: demo, contentType: "application/javascript" });
      return url.startsWith("http://proto.test") ? route.fulfill({ body: pageHTML(), contentType: "text/html" }) : route.abort();
    });
    await page.goto("http://proto.test/prototype/");
    const out = await page.evaluate(async () => {
      // A player's game saved on the hexagon the demo now uses.
      begin();
      openSlot(DEMO_HEX, `${GAME_KEY}${DEMO_HEX}`, "Mine");
      G.dna = 1234;
      const savedMine = save();
      const list = readList(), moved = Object.entries(list.games).find(([, g]) => g.name === "Mine");
      await loadDemo();
      const shown = planetList().games[DEMO_HEX];
      const opened = openGame(DEMO_HEX), stage = G.stage, bigTracks = G.bigTracks, saved = save();
      const kept = Object.keys(localStorage).some((k) => k.includes("demo"));
      // Played and opened again: fresh.
      for (let i = 0; i < 200; i++) step(0.05);
      const later = G.time;
      openGame(DEMO_HEX);
      return { savedMine, movedTo: moved && Number(moved[0]), movedDna: moved && parsed(stored(moved[1].key))?.dna, demoHex: DEMO_HEX, onDemo: Boolean(list.games[DEMO_HEX]), shown: Boolean(shown?.demo), opened, stage, bigTracks, saved, kept, fresh: G.time < later };
    });
    expect(out.savedMine).toBe(true);
    expect(out.onDemo).toBe(false);
    expect(out.movedTo).not.toBe(out.demoHex);
    expect(out.movedDna).toBe(1234);
    expect(out.shown).toBe(true);
    expect(out.opened).toBe(true);
    expect(out.stage).toBe(4);
    expect(out.bigTracks).toBe(true);
    expect(out.saved).toBe(false);
    expect(out.kept).toBe(false);
    expect(out.fresh).toBe(true);
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
