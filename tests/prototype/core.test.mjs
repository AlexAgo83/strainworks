// The core of a new game stands on a 3x3 plinth: its nine cells answer as the core, a gene comes in by any of
// its twelve faces, and a game saved with it opens again. Any machine holding something can be emptied.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

it("feeds a 3x3 core from all twelve faces, reloads it, and empties what holds something", async () => {
  const browser = await launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, line: false });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", (route) => (route.request().url().startsWith("http://proto.test") ? route.fulfill({ body: pageHTML(), contentType: "text/html" }) : route.abort()));
    await page.goto("http://proto.test/prototype/");
    const out = await page.evaluate(() => {
      begin();
      paused = true;
      const core = coreCell(), want = STAGES[0].item;
      const covered = [];
      for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) covered.push(cellAt(CORE.x + i, CORE.y + j) === core);
      // From outside each face, an item travelling in.
      let fed = 0;
      for (const { x, y, dir } of edgesOf(core)) {
        const out = { x: x + DX[dir], y: y + DY[dir] };
        if (cellAt(out.x, out.y) === undefined && accepts(core, want, (dir + 2) % 4)) fed++;
      }
      // A cyst and a turret holding something offer to be emptied, and are emptied.
      const cyst = put("cyst", CORE.x + 5, CORE.y, 0), gun = put("turret", CORE.x + 7, CORE.y, 0);
      cyst.stock = ["S", "S"]; cyst.due = [0, 0]; gun.ammo = { SFS: 3 };
      const emptied = [cyst, gun].map((c) => {
        select(key(c.x, c.y)); showActions();
        const b = [...document.querySelectorAll("#actions button")].find((el) => el.textContent.includes("Vider"));
        b?.click();
        return [Boolean(b), holdsAnything(c)];
      });
      save();
      return { size: core.size, covered, fed, emptied, key: slotKey };
    });
    await page.reload();
    const reopened = await page.evaluate(() => { load(); return coreCell()?.size; });

    expect(out.size).toBe(3);
    expect(out.covered.every(Boolean)).toBe(true);
    expect(out.fed).toBe(12);
    expect(out.emptied).toEqual([[true, false], [true, false]]);
    expect(reopened).toBe(3);
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
