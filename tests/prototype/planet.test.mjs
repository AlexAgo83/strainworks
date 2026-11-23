// The opening screen: one hexagon a game, and no game ever lost to it.
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { fromMenu, launch, pageHTML, savedGame } from "./harness.mjs";

const URL_OF_GAME = "http://proto.test/prototype/";

async function open(browser, options = {}) {
  const page = await browser.newPage({ planet: true, viewport: { width: 1280, height: 800 }, reducedMotion: "reduce", acceptDownloads: true, ...options });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/*", (route) => {
    const url = route.request().url();
    if (!url.startsWith("http://proto.test")) return route.abort();
    if (url.endsWith(".webp")) return route.fulfill({ status: 404, body: "" });
    return route.fulfill({ body: pageHTML(), contentType: "text/html" });
  });
  await page.goto(URL_OF_GAME);
  return { page, errors };
}

const act = (page, label) => page.locator("#slot-actions button", { hasText: label });
const games = (page) => page.evaluate(() => Object.entries(readList().games).map(([id, game]) => ({ id: Number(id), ...game })));
const give = (page, body, name = "game.strainworks.json") =>
  page.setInputFiles("#file", { name, mimeType: "application/json", buffer: Buffer.from(typeof body === "string" ? body : JSON.stringify(body)) });

it("opens on the planet and keeps each game in its own hexagon", async () => {
  const browser = await launch();
  try {
    const { page, errors } = await open(browser);
    expect(await page.evaluate(() => [orbit.on, localStorage.getItem("souche-proto-2"), CELLS_OF_GLOBE.length])).toEqual([true, null, 162]);

    // Nothing runs and no key plays behind the planet.
    const time = await page.evaluate(() => G.time);
    await page.keyboard.press("Digit7");
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => [G.time, tool])).toEqual([time, "hand"]);

    await act(page, "Fonder une station").click();
    await page.evaluate(() => {
      paused = true;
      G.dna = 333;
    });
    await fromMenu(page, "to-planet");
    const [first] = await games(page);
    expect([first.key, first.dna]).toEqual(["souche-proto-2", 333]);

    // Another hexagon, another game.
    const spot = await page.evaluate(() => {
      const id = freeHex(orbit.list);
      return onScreen(turn(CELLS_OF_GLOBE[id].c));
    });
    await page.mouse.click(...spot);
    await act(page, "Fonder une station").click();
    await page.evaluate(() => {
      paused = true;
      G.dna = 777;
    });
    await fromMenu(page, "to-planet");
    const two = await games(page);
    expect(two.map((game) => game.dna).sort()).toEqual([333, 777]);
    expect(new Set(two.map((game) => game.key)).size).toBe(2);

    await page.evaluate((id) => pickHex(id), first.id);
    await act(page, "Reprendre").click();
    expect(await page.evaluate(() => [orbit.on, G.dna])).toEqual([false, 333]);

    // Reloaded, it opens on the planet with the last one played picked.
    await page.reload();
    expect(await page.evaluate(() => [orbit.on, orbit.pick])).toEqual([true, first.id]);
    await page.keyboard.press("Enter");
    expect(await page.evaluate(() => [orbit.on, G.dna])).toEqual([false, 333]);
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});

it("takes back every older save, and rebuilds a lost list", async () => {
  const browser = await launch();
  try {
    for (const version of ["v09", "v13", "v14", "v15"]) {
      const { page, errors } = await open(browser);
      await page.evaluate((game) => localStorage.setItem("souche-proto-2", game), savedGame(version));
      await page.reload();
      await act(page, "Reprendre").click();
      expect(await page.evaluate(() => [orbit.on, G.world, Object.keys(G.cells).length > 5])).toEqual([false, 2, true]);
      expect(errors).toEqual([]);
      await page.close();
    }

    const { page, errors } = await open(browser);
    await page.evaluate(() => {
      foundGame();
      G.dna = 11;
      save();
      slotKey = null;
      foundGame();
      G.dna = 22;
      save();
      slotKey = null;
      localStorage.setItem("strainworks-planet", "{broken");
    });
    await page.reload();
    expect((await games(page)).map((game) => game.dna).sort()).toEqual([11, 22]);

    // Unreadable is not empty: it is never written over.
    const broken = await page.evaluate(() => {
      const game = readList().games[orbit.pick];
      localStorage.setItem(game.key, "{half a game");
      return game.key;
    });
    await act(page, "Reprendre").click();
    await page.waitForTimeout(300);
    expect(await page.evaluate((key) => [orbit.on, localStorage.getItem(key)], broken)).toEqual([true, "{half a game"]);
    expect(await page.locator("#slot-note").textContent()).toContain("illisible");
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});

it("exports, imports beside what exists, and copies", async () => {
  const browser = await launch();
  try {
    const { page, errors } = await open(browser);
    await act(page, "Fonder une station").click();
    await page.evaluate(() => {
      paused = true;
      G.dna = 444;
      G.cells["44,44"].mk = 3;
    });
    await fromMenu(page, "to-planet");

    const [file] = await Promise.all([page.waitForEvent("download"), act(page, "Exporter").click()]);
    expect(file.suggestedFilename()).toMatch(/^[a-z0-9-]+[.]strainworks[.]json$/);
    const exported = JSON.parse(readFileSync(await file.path(), "utf8"));
    expect([exported.format, exported.game.dna]).toEqual(["strainworks", 444]);

    // Shown first, written only once confirmed, and never over the one there.
    const before = await page.evaluate(() => JSON.stringify(localStorage));
    await give(page, exported);
    await act(page, "Greffer").waitFor();
    expect(await page.evaluate(() => JSON.stringify(localStorage))).toBe(before);
    await act(page, "Greffer").click();
    expect((await games(page)).map((game) => game.dna)).toEqual([444, 444]);

    await act(page, "Dupliquer").click();
    expect((await games(page)).some((game) => game.name.endsWith(" bis"))).toBe(true);

    // A whole planet goes out and comes back beside itself.
    // From the planet itself, on a free hexagon.
    await page.evaluate(() => pickHex(freeHex(readList())));
    const [all] = await Promise.all([page.waitForEvent("download"), act(page, "Tout exporter").click()]);
    await give(page, readFileSync(await all.path(), "utf8"));
    await act(page, "Greffer les 3").click();
    const six = await games(page);
    expect([six.length, new Set(six.map((game) => game.key)).size]).toEqual([6, 6]);
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});

it("accepts any game it wrote and refuses a forged one", async () => {
  const browser = await launch();
  try {
    const { page, errors } = await open(browser);
    const saves = ["v09", "v13", "v14", "v15"].map((version) => savedGame(version));
    const out = await page.evaluate((olds) => {
      const out = { olds: olds.map((text) => checkGame(JSON.parse(text))) };
      // A game with one of everything, after it ran.
      begin();
      paused = true;
      G.open = true;
      G.dna = 5000;
      let x = 20;
      for (const type of Object.keys(TYPES)) {
        if (["hand", "erase", "track", "worm", "wire"].includes(type)) continue;
        x += 3;
        const c = put(type, x, 80, 1);
        // A harvester never stands on bare ground.
        if (type === "mine" || type === "borer") c.on = "S";
      }
      build("cyst", 20, 86, 0);
      layTrack(22, 88, 1).left = 0;
      incubate(22, 88);
      wireUp(G.cells["48,34"], put("gate", 48, 42, 0));
      raise([G.cells["44,44"]], 2);
      wake(G.breaches[0]);
      G.ruins["70,70"] = { type: "wall", x: 70, y: 70, dir: 0 };
      for (let i = 0; i < 1300; i++) step(STEP);
      const game = JSON.parse(JSON.stringify(G));
      out.played = checkGame(game);

      const forged = {
        markup: (g) => {
          g.cells["48,52"].note = "<img src=x onerror=alert(1)>";
        },
        ammo: (g) => {
          g.cells["48,34"].ammo = { CNF: "9" };
        },
        type: (g) => {
          g.cells["44,44"].type = "constructor";
        },
        moved: (g) => {
          g.cells["44,44"].x = 12;
        },
        text: (g) => {
          g.dna = "400";
        },
        rank: (g) => {
          g.cells["44,44"].mk = 99;
        },
        family: (g) => {
          g.families = ["ZZZ"];
        },
        noCore: (g) => delete g.cells["48,52"],
        prototype: (g) => Object.defineProperty(g, "__proto__", { value: { a: 1 }, enumerable: true }),
      };
      out.let = [];
      for (const [name, spoil] of Object.entries(forged)) {
        const copy = JSON.parse(JSON.stringify(game));
        spoil(copy);
        if (checkGame(copy)) out.let.push(name);
      }
      return out;
    }, saves);
    expect(out).toEqual({ olds: [true, true, true, true], played: true, let: [] });

    const before = await page.evaluate(() => JSON.stringify(localStorage));
    for (const body of ["not json", "{}", { format: "strainworks", v: 1, game: { cells: {} } }]) {
      await give(page, body);
      await page.waitForFunction(() => document.querySelector("#slot-note").classList.contains("bad"));
      await page.evaluate(() => noteOnPlanet(""));
    }
    expect(await page.evaluate(() => JSON.stringify(localStorage))).toBe(before);
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});

it("keeps the scar of a fallen station and erases only on a held press", async () => {
  const browser = await launch();
  try {
    const { page, errors } = await open(browser);
    await act(page, "Fonder une station").click();
    await page.evaluate(() => {
      paused = true;
      G.over = true;
      refresh();
    });
    await page.click("#again");
    expect((await games(page)).map((game) => game.over).sort()).toEqual([false, true]);

    await fromMenu(page, "to-planet");
    const fallen = (await games(page)).find((game) => game.over);
    await page.evaluate((id) => pickHex(id), fallen.id);
    expect(await page.locator("#slot-kicker").textContent()).toBe("Station tombée");
    await act(page, "Effacer").click();
    await page.waitForTimeout(1100);
    expect(await games(page)).toHaveLength(2);
    await act(page, "Effacer").click({ delay: 1200 });
    expect((await games(page)).map((game) => game.over)).toEqual([false]);
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});

it("turns under the finger, and shares one menu with the game", async () => {
  const browser = await launch();
  try {
    const { page, errors } = await open(browser);
    await page.mouse.move(260, 400);
    await page.mouse.down();
    await page.mouse.move(420, 360, { steps: 6 });
    await page.mouse.up();
    const turned = await page.evaluate(() => [orbit.yaw > 0.15, orbit.pitch < -0.02]);
    expect(turned).toEqual([true, true]);
    // What is under the pointer is what a click picks.
    const missed = await page.evaluate(() =>
      CELLS_OF_GLOBE.map((cell, id) => ({ id, v: turn(cell.c) }))
        .filter(({ v }) => v[2] > 0.15)
        .filter(({ id, v }) => hexAt(...onScreen(v)) !== id).length,
    );
    expect(missed).toBe(0);

    await page.click("#planet-menu");
    expect(await page.isVisible("#to-planet")).toBe(false);
    expect(await page.isVisible("#restart")).toBe(false);
    await page.click('[data-go="graphics"]');
    await page.click("#motion-less");
    expect(await page.evaluate(() => [STILL.wanted, localStorage.getItem("strainworks-motion")])).toEqual([true, "less"]);
    await page.click("#planet-menu");

    await act(page, "Fonder une station").click();
    await page.click("#menu-toggle");
    expect(await page.isVisible("#restart")).toBe(true);
    expect(await page.isVisible("#version-row")).toBe(true);
    expect(await page.isVisible("#to-planet")).toBe(true);
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
