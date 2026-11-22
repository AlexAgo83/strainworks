// The grafted interface: the scene has the whole screen, and every control can still be reached.
import { expect, it } from "vitest";
import { fromMenu, launch, pageHTML, pickTool } from "./harness.mjs";

async function open(browser, options) {
  const page = await browser.newPage(options);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/*", (route) =>
    route.request().url().startsWith("http://proto.test") ? route.fulfill({ body: pageHTML(), contentType: "text/html" }) : route.abort(),
  );
  await page.goto("http://proto.test/prototype/");
  await page.evaluate(() => {
    begin();
    paused = true;
    G.open = true;
    G.breaches = [];
    refresh();
  });
  return { page, errors };
}

it("gives the scene the whole screen and keeps every tool in reach", async () => {
  const browser = await launch();
  try {
    for (const [width, height, hasTouch] of [[1440, 900, false], [1024, 700, false], [375, 667, true], [320, 568, true], [740, 360, true]]) {
      const { page, errors } = await open(browser, { viewport: { width, height }, hasTouch });
      const seen = await page.evaluate(() => {
        const board = document.querySelector("#board").getBoundingClientRect();
        const homes = FAMILIES.flatMap((family) => family[3]);
        const grouped = Object.keys(TYPES).filter((type) => type !== "hand" && type !== "erase");
        const small = [...document.querySelectorAll("#time button, #zoom button, #tools .dock .pod")].filter((b) => {
          const box = b.getBoundingClientRect();
          return box.width && (box.width < 43.5 || box.height < 43.5);
        });
        return {
          board: [board.x, board.y, board.width, board.height],
          grouped: homes.length === new Set(homes).size && grouped.every((type) => homes.includes(type)) && homes.length === grouped.length,
          out: clippedTools(),
          small: small.map((b) => b.id || b.textContent),
        };
      });
      expect(seen).toEqual({ board: [0, 0, width, height], grouped: true, out: [], small: [] });
      expect(errors).toEqual([]);
      await page.close();
    }
  } finally {
    await browser.close();
  }
});

it("hangs actions on the object on a desktop and in a low sheet on a phone", async () => {
  const browser = await launch();
  try {
    for (const [width, height, where] of [[1440, 900, "bloom"], [375, 667, "docked"]]) {
      const { page, errors } = await open(browser, { viewport: { width, height }, reducedMotion: "reduce" });
      await page.evaluate(() => {
        put("ligase", 50, 47, 1);
        Object.assign(cam, { x: 50.5, y: 46, zoom: 24 });
        select("50,47");
      });
      await page.waitForFunction((mode) => document.querySelector("#info").classList.contains(mode) && !document.querySelector("#info").hidden, where);
      await page.locator("#actions button", { hasText: "Tourner" }).click();
      expect(await page.evaluate(() => G.cells["50,47"].dir)).toBe(2);

      // With a piece in hand nothing blooms over the cells to build on.
      await pickTool(page, "belt");
      await page.evaluate(() => select("50,47"));
      await page.waitForFunction(() => document.querySelector("#info").classList.contains("docked"));
      expect(errors).toEqual([]);
      await page.close();
    }
  } finally {
    await browser.close();
  }
});

it("answers the keys, the menu and the moments without changing a rule", async () => {
  const browser = await launch();
  try {
    const { page, errors } = await open(browser, { viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });

    // The physical keys 1 to 7.
    await page.keyboard.press("Digit5");
    expect(await page.evaluate(() => ui.family)).toBe("def");
    await page.keyboard.press("Digit7");
    expect(await page.evaluate(() => [tool, ui.family])).toEqual(["erase", null]);
    await page.keyboard.press("Digit1");
    expect(await page.evaluate(() => tool)).toBe("hand");

    // The list of commands keeps the keys to itself.
    await fromMenu(page, "help");
    await page.keyboard.press("Digit7");
    await page.keyboard.press("r");
    expect(await page.evaluate(() => [tool, document.querySelector("#commands").open])).toEqual(["hand", true]);
    await page.click("#help-close");
    await page.waitForFunction(() => !document.querySelector("#commands").open);

    // An event takes the camera to where it happened.
    await page.evaluate(() => tell("Ici", { at: { x: 70, y: 20 } }));
    await page.locator("#events button", { hasText: "Ici" }).click();
    // A family gives back the tool last taken from it.
    const back = await page.evaluate(() => {
      choose("belt");
      choose("hand");
      toggleFamily(FAMILY_OF.belt);
      const belt = tool;
      choose("bridge");
      choose("hand");
      toggleFamily(FAMILY_OF.bridge);
      return [belt, tool];
    });
    expect(back).toEqual(["belt", "bridge"]);
    // Events stay until closed, the latest five kept.
    const kept = await page.evaluate(async () => {
      for (let i = 0; i < 7; i++) tell(`Événement ${i}`);
      const before = document.querySelectorAll("#events .event").length;
      await new Promise((done) => setTimeout(done, 300));
      for (let i = 0; i < 300; i++) step(STEP);
      const after = document.querySelectorAll("#events .event").length;
      document.querySelector("#events .event:last-child .close").click();
      return [before, after, document.querySelectorAll("#events .event").length, document.querySelector("#events .event:last-child .text").textContent];
    });
    expect(kept).toEqual([5, 5, 4, "Événement 5"]);
    expect(await page.evaluate(() => [cam.x, cam.y])).toEqual([70.5, 20.5]);

    // A refusal is written where the hand is.
    await page.evaluate(() => {
      ui.point = { x: 700, y: 400 };
      refuse("Non");
    });
    const said = await page.locator("#refusal").boundingBox();
    expect(Math.abs(said.x + said.width / 2 - 700)).toBeLessThan(2);
    expect(Math.abs(said.y + said.height / 2 - 400)).toBeLessThan(100);

    // A stage reached is shown, and the game under it still takes a tap.
    expect(await page.evaluate(() => {
      grow();
      refresh();
      const under = document.elementFromPoint(300, 420);
      return [!document.querySelector("#growth").hidden, under.id];
    })).toEqual([true, "game"]);
    await page.click("#continue");

    // Painting the interface changes nothing in the game.
    expect(await page.evaluate(() => {
      put("turret", 48, 40, 0);
      G.cells["48,34"].ammo = { CNF: 5 };
      G.enemies.push({ x: 48, y: 37, gene: "SFN", hp: 20, max: 24 });
      G.cells["48,40"].hp = 90;
      select("48,40");
      const before = JSON.stringify(G);
      paintHud();
      draw();
      return [JSON.stringify(G) === before, document.querySelector("#app").classList.contains("hot"), ui.dry.length];
    })).toEqual([true, true, 1]);
    expect(await page.evaluate(() => getComputedStyle(document.querySelector(".organ")).animationName)).toBe("none");

    // Starting over needs a held press.
    await page.evaluate(() => {
      G.kills = 9;
      showMenu(true);
    });
    await page.click("#restart");
    await page.waitForTimeout(1100);
    expect(await page.evaluate(() => G.kills)).toBe(9);
    await page.click("#restart", { delay: 1150 });
    expect(await page.evaluate(() => [G.kills, ui.menu])).toEqual([0, false]);
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});

it("points at the ways in and out the transport really has", async () => {
  const browser = await launch();
  try {
    const { page, errors } = await open(browser, { viewport: { width: 900, height: 700 } });
    const wrong = await page.evaluate(() => {
      const wrong = [];
      for (const type of ["ligase", "join", "pack", "sort", "split", "split2", "cyst", "vault", "turret", "core"])
        for (let dir = 0; dir < 4; dir++)
          for (const flip of [false, true]) {
            const c = Object.assign(cell(type, 20, 80, dir), { flip });
            const ports = portsOf(c);
            for (let side = 0; side < 4; side++) {
              const takes = connects(c, (side + 2) % 4);
              if (takes !== ports.some((port) => !port.out && port.dir === side)) wrong.push([type, dir, flip, side]);
            }
            if (type === "split" || type === "split2") {
              const shown = ports.filter((port) => port.out).map((port) => port.dir);
              if (String(shown) !== String(splitExits(c))) wrong.push([type, dir, "exits"]);
            }
          }
      return wrong;
    });
    expect(wrong).toEqual([]);

    // At the farthest zoom they keep their size, and at rest there are none.
    const drawn = await page.evaluate(() => {
      put("ligase", 20, 80, 1);
      Object.assign(cam, { x: 20.5, y: 80.5, zoom: 11 });
      let heads = 0;
      const g = new Proxy(document.createElement("canvas").getContext("2d"), {
        get: (target, name) => (name === "fill" ? () => heads++ : typeof target[name] === "function" ? target[name].bind(target) : target[name]),
        set: (target, name, value) => Reflect.set(target, name, value),
      });
      selected = null;
      drawPorts(g, null);
      const rest = heads;
      drawPorts(g, { x: 20, y: 80, act: "select" });
      return [rest, heads];
    });
    expect(drawn).toEqual([0, 7]);
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
