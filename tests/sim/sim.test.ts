// The simulation runs alone in Node: no page, no renderer, its hooks quiet.
import { beforeEach, expect, it, vi } from "vitest";
import { hooks } from "../../src/sim/hooks.ts";
import * as sim from "../../src/sim/sim.ts";

beforeEach(() => {
  for (const name of Object.keys(hooks) as (keyof typeof hooks)[]) hooks[name] = () => undefined;
  // Recipes as the browser tests replay them, and no sound is ever heard.
  hooks.drawsRecipes = () => false;
  hooks.heard = () => false;
  let seed = 0x5eed;
  Math.random = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), seed | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
});

// A harvester on the nearest deposit, a straight belt and a cyst at its end.
function line() {
  sim.fresh();
  // The cell lookups are memoized per step: a new game starts from fresh ones.
  sim.forgetCells();
  const { G, CORE, depositAt, cellAt, put } = sim;
  G.breaches = [];
  for (let r = 4; r < 40; r++)
    for (let y = CORE.y - r; y <= CORE.y + r; y++)
      for (let x = CORE.x - r; x <= CORE.x + r; x++) {
        const free = [1, 2, 3, 4, 5].every((i) => !cellAt(x + i, y) && !depositAt(x + i, y));
        if (depositAt(x, y) && !cellAt(x, y) && free) {
          put("mine", x, y, 1);
          for (let i = 1; i <= 4; i++) put("belt", x + i, y, 1);
          return put("cyst", x + 5, y, 1);
        }
      }
  throw new Error("no deposit with room for a line");
}

it("carries a harvester's bases down a belt into a cyst", () => {
  const cyst = line();
  for (let i = 0; i < 20 * 20; i++) sim.step(sim.STEP);
  expect(sim.G.time).toBeCloseTo(20, 5);
  // One base a second once the line is full: about 15 in 20 seconds.
  expect(cyst.stock.length).toBeGreaterThan(10);
  expect(new Set(cyst.stock).size).toBe(1);
});

it("plays the same game twice from the same seed", () => {
  const run = () => {
    // The world's seed comes from the platform's random source, the rest from Math.random.
    vi.spyOn(crypto, "getRandomValues").mockImplementation((a) => { (a as Uint32Array)[0] = 42; return a; });
    let seed = 7;
    Math.random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    line();
    for (let i = 0; i < 20 * 30; i++) sim.step(sim.STEP);
    return JSON.stringify(sim.G);
  };
  expect(run()).toBe(run());
});
