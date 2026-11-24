// The arm lifts from behind and drops ahead, keeps to its filter, and goes faster by rank; the burner eats anything.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

it("moves items with the arm, filters them, and burns what is sent to the burner", async () => {
  const browser = await launch();
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", (route) => (route.request().url().startsWith("http://proto.test") ? route.fulfill({ body: pageHTML(), contentType: "text/html" }) : route.abort()));
    await page.goto("http://proto.test/prototype/");
    const out = await page.evaluate(() => {
      begin();
      paused = true;
      G.open = true;
      G.enemies = [];
      // A cyst full of genes, an arm east of it facing east, a cyst east of the arm.
      const from = put("cyst", 20, 70, 1), arm = put("arm", 21, 70, 1), to = put("cyst", 22, 70, 1);
      from.stock = ["SFN", "SFN", "CCN", "SFN"];
      const run = (s) => { for (let i = 0; i < s * 20; i++) { G.time += 0.05; flow(0.05); } };
      run(4);
      const moved = to.stock.length;
      arm.pick = "CCN"; arm.hold = []; arm.doneAt = -9;
      from.stock = ["SFN", "CCN", "SFN"]; to.stock = [];
      run(4);
      const picked = [...to.stock], left = [...from.stock];
      // MK3 lifts two at a time and moves more in the same time.
      arm.pick = ""; arm.mk = 3; from.stock = Array(10).fill("SFN"); to.stock = [];
      run(2);
      const fast = to.stock.length;
      // The burner takes what the arm drops.
      delete G.cells[key(22, 70)];
      const burner = put("burn", 22, 70, 0);
      from.stock = Array(6).fill("SFN");
      run(3);
      // Off a belt: the item on the rail, never an empty hand.
      delete G.cells[key(22, 70)]; forgetCells();
      const belt = put("belt", 20, 72, 1), arm2 = put("arm", 21, 72, 1), into = put("cyst", 22, 72, 1);
      belt.item = "SFN"; belt.t = 1;
      run(2);
      const offBelt = [...into.stock], held = (arm2.hold || []).filter((x) => x === undefined).length;
      return { offBelt, held, moved, picked, left, fast, burnt: burner.burnt || 0, vein: NEEDS.pump, opens: NEEDS.arm };
    });
    expect(out.offBelt).toEqual(["SFN"]);
    expect(out.held).toBe(0);
    expect(out.moved).toBeGreaterThanOrEqual(3);
    expect(out.picked).toEqual(["CCN"]);
    expect(out.left).toEqual(["SFN", "SFN"]);
    expect(out.fast).toBeGreaterThanOrEqual(6);
    expect(out.burnt).toBeGreaterThanOrEqual(4);
    expect(out.vein).toBe(4);
    expect(out.opens).toBe(1);
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
