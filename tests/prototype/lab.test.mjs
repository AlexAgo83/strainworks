// The lab (?lab): every model on its own, its state edited as JSON, and nothing ever saved.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

it("shows each model alone and edits its state without saving", async () => {
  const browser = await launch();
  try {
    const page = await browser.newPage({ planet: true, viewport: { width: 1280, height: 800 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", (route) =>
      route.request().url().startsWith("http://proto.test") ? route.fulfill({ body: pageHTML(), contentType: "text/html" }) : route.abort(),
    );
    await page.goto("http://proto.test/prototype/?lab");
    await page.waitForSelector("#lab-list option");
    const first = await page.evaluate(() => ({
      options: [...document.querySelectorAll("#lab-list option")].map((o) => o.value),
      kind: LAB.kind,
      cells: Object.values(G.cells).map((c) => c.type).sort(),
      saved: Object.keys(localStorage).filter((k) => /game|save|planet/i.test(k)),
      hud: getComputedStyle(document.querySelector("#tools")).display,
      planet: orbit.on,
    }));
    expect(first.options).toContain("cell|ligase");
    expect(first.options).toContain("creature|C");
    expect(first.options).toContain("nest|2:wake");
    expect(first.options).toContain("drone|drone");
    expect(first.options.filter((o) => o.startsWith("cell|")).length).toBe(32);
    expect(first).toMatchObject({ kind: "cell", cells: ["core", "ligase"], saved: [], hud: "none", planet: false });
    // One specimen at a time; the JSON is the state, applied as written.
    await page.selectOption("#lab-list", "cell|turret");
    await page.click('[data-lab="turn"]');
    await page.click('[data-lab="mk"]');
    const turret = await page.evaluate(() => {
      const state = JSON.parse(document.querySelector("#lab-state").value);
      document.querySelector("#lab-state").value = JSON.stringify({ ...state, hp: 7 });
      document.querySelector("#lab-apply").click();
      const c = Object.values(G.cells).find((x) => x.type === "turret");
      return { types: Object.values(G.cells).map((x) => x.type).sort(), dir: state.dir, mk: state.mk, hp: c.hp };
    });
    expect(turret).toEqual({ types: ["core", "turret"], dir: 2, mk: 2, hp: 7 });
    await page.selectOption("#lab-list", "creature|N");
    expect(await page.evaluate(() => [G.enemies.length, G.enemies[0].gene, Object.values(G.cells).length])).toEqual([1, "NNS", 1]);
    // The clock runs, the rules stand still: nothing moves the creature.
    const before = await page.evaluate(() => [G.time, G.enemies[0].x]);
    await page.waitForTimeout(400);
    const after = await page.evaluate(() => [G.time, G.enemies[0].x]);
    expect(after[0]).toBeGreaterThan(before[0]);
    expect(after[1]).toBe(before[1]);
    // Typing in the state keeps every key: no game shortcut (pause, turn, digits, eyedropper) takes it.
    await page.selectOption("#lab-list", "cell|turret");
    const keys = await page.evaluate(() => [paused, tool, cam.x]);
    await page.click("#lab-state");
    await page.keyboard.press("Control+End");
    await page.keyboard.type(" qr2 wasd");
    const typed = await page.evaluate(() => [paused, tool, cam.x, document.querySelector("#lab-state").value.endsWith(" qr2 wasd")]);
    expect(typed).toEqual([...keys, true]);
    // A nest or a drone shown leaves the spot to the next specimen.
    const near = () => page.evaluate(() => [G.breaches[0], G.drones[0]].map((o) => Math.hypot(o.x - LAB.at.x, o.y - LAB.at.y) < 3));
    await page.selectOption("#lab-list", "nest|2:wake");
    const nestShown = await near();
    await page.selectOption("#lab-list", "drone|drone");
    const droneShown = await near();
    await page.selectOption("#lab-list", "cell|ligase");
    expect([nestShown, droneShown, await near()]).toEqual([[true, false], [false, true], [false, false]]);
    // The Sounds tab: every effect plays, ten in a row never pass ten voices, each candidate is listed, a moment is forced.
    await page.click('#lab-tabs [data-tab="sounds"]');
    await page.click('[data-sound="turret"]');
    await page.click('[data-burst="hit"]');
    await page.click('[data-piece="calm"]');
    const sounds = await page.evaluate(() => ({
      shown: !document.querySelector("#lab-sounds").hidden && document.querySelector("#lab-models").hidden,
      audio: Boolean(sfx.ctx),
      voices: sfx.voices <= 10,
      files: document.querySelectorAll("[data-file]").length === LAB_FILES.length && LAB_FILES.length > 0,
      calm: music.force === "calm" && music.src === MUSIC.calm[music.calm],
    }));
    expect(sounds).toEqual({ shown: true, audio: true, voices: true, files: true, calm: true });
    expect(await page.evaluate(() => Object.keys(localStorage).filter((k) => /game|save|planet/i.test(k)))).toEqual([]);
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
