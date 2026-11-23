// The keyboard and mouse controls asked by players: keys by where they sit, the eyedropper, Shift with a digit
// inside an open family, a held right click that dismantles, and keys changed from the commands sheet.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

it("moves, picks, opens, dismantles and rebinds as players asked", async () => {
  const html = pageHTML();
  const browser = await launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", (route) => (route.request().url().startsWith("http://proto.test") ? route.fulfill({ body: html, contentType: "text/html" }) : route.abort()));
    await page.goto("http://proto.test/");
    // A belt of rank 2 facing down, in the middle of the screen.
    const spot = await page.evaluate(() => {
      begin();
      paused = true;
      G.dna = 1000;
      const x = CORE.x + 4, y = CORE.y + 4;
      const c = put("belt", x, y, 2);
      c.mk = 2;
      Object.assign(cam, { x: x + 0.5, y: y + 0.5 });
      return { x, y, sx: view.w / 2, sy: view.h / 2 };
    });

    // W (Z on a French board) moves the view up, as the up arrow does.
    const before = await page.evaluate(() => cam.y);
    await page.keyboard.down("KeyW");
    await page.waitForTimeout(250);
    await page.keyboard.up("KeyW");
    const moved = await page.evaluate((was) => cam.y < was, before);
    await page.evaluate(({ x, y }) => Object.assign(cam, { x: x + 0.5, y: y + 0.5 }), spot);

    // Q (A on a French board) over the belt takes a belt in hand, facing down, at rank 2.
    await page.mouse.move(spot.sx, spot.sy);
    await page.keyboard.press("KeyQ");
    const picked = await page.evaluate(() => [tool, heading, inHand("belt")]);

    // A digit opens a family; Shift with a digit takes that family's machine. The belt is put down first.
    await page.keyboard.press("Escape");
    await page.keyboard.press("Digit3");
    const second = await page.evaluate(() => [...document.querySelectorAll(`#tools .tray[data-tray="${ui.family}"] [data-type]`)][1]?.dataset.type);
    await page.keyboard.press("Shift+Digit2");
    const shifted = await page.evaluate(() => tool);
    await page.keyboard.press("Escape");

    // A right click held still dismantles the belt; a short one does not.
    await page.mouse.move(spot.sx, spot.sy);
    await page.mouse.down({ button: "right" });
    await page.mouse.up({ button: "right" });
    const kept = await page.evaluate(({ x, y }) => Boolean(cellAt(x, y)) && cellAt(x, y).out == null, spot);
    await page.mouse.down({ button: "right" });
    await page.waitForTimeout(800);
    await page.mouse.up({ button: "right" });
    const gone = await page.evaluate(({ x, y }) => !cellAt(x, y) || cellAt(x, y).out != null, spot);

    // The commands sheet changes a key, swaps one already taken, refuses a reserved one, and resets.
    await page.evaluate(() => document.querySelector("#commands").showModal());
    await page.click('#keys [data-action="up"]');
    await page.keyboard.press("KeyI");
    await page.click('#keys [data-action="down"]');
    await page.keyboard.press("KeyQ");
    await page.click('#keys [data-action="left"]');
    await page.keyboard.press("Digit5");
    const sheet = await page.evaluate(() => ({
      keys: { ...KEYS },
      saved: JSON.parse(localStorage.getItem("strainworks-keys")),
      note: document.querySelector("#keys-note").textContent,
      open: document.querySelector("#commands").open,
    }));
    await page.keyboard.press("Escape");
    await page.click("#keys-reset");
    const reset = await page.evaluate(() => [KEYS.up, KEYS.down, KEYS.pick, localStorage.getItem("strainworks-keys")]);

    expect(moved).toBe(true);
    expect(picked).toEqual(["belt", 2, 2]);
    expect(second).toBeTruthy();
    expect(shifted).toBe(second);
    expect(kept).toBe(true);
    expect(gone).toBe(true);
    expect(sheet.keys).toMatchObject({ up: "KeyI", down: "KeyQ", pick: "KeyS", left: "KeyA" });
    expect(sheet.saved).toMatchObject({ up: "KeyI", down: "KeyQ", pick: "KeyS" });
    expect(sheet.note).toBe("Touche réservée : choisis-en une autre.");
    expect(sheet.open).toBe(true);
    expect(reset).toEqual(["KeyW", "KeyS", "KeyQ", null]);
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
