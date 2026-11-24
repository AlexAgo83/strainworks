// The base genes: drawn per game from the pool, built on stage after stage, and eaten by the core all along.
import { beforeEach, expect, it } from "vitest";
import { hooks } from "../../src/sim/hooks.ts";
import * as sim from "../../src/sim/sim.ts";

const seeded = (n: number) => {
  let seed = n;
  Math.random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
};
beforeEach(() => {
  for (const name of Object.keys(hooks) as (keyof typeof hooks)[]) hooks[name] = () => undefined;
  hooks.drawsRecipes = () => true;
  hooks.heard = () => false;
});

it("draws three distinct base genes from the pool, made of bases the map has, on every seed", () => {
  for (let n = 1; n <= 200; n++) {
    seeded(n);
    sim.fresh();
    const { G, BASE_POOL, DEPOSIT } = sim;
    const have = new Set(Object.values(DEPOSIT));
    expect(G.base).toHaveLength(3);
    expect(new Set(G.base).size).toBe(3);
    for (const gene of G.base) {
      expect(BASE_POOL).toContain(gene);
      expect([...gene].every((b) => have.has(b))).toBe(true);
    }
  }
});

it("builds every stage's recipe on the base genes", () => {
  seeded(7);
  sim.fresh();
  const { G } = sim;
  const [a, b, c] = G.base;
  const items = (stage: number) => sim.layeredGoals(stage).map((g: { item: string }) => g.item);
  expect(items(0)).toEqual([a]);
  expect(items(1)).toEqual([a + b]);
  expect(items(2)).toEqual([`T:${a}${b}`, b + c]);
  expect(items(3)[1]).toBe(`T:${b}${c}`);
  expect(items(3)[0]).toMatch(/^A:/);
  // A heavy capsule of one base gene since item_020: three lines, the gene, carbon and isotope.
  expect(items(4)).toContain(`H:${c}`);
  for (let stage = 1; stage <= 5; stage++)
    for (const item of items(stage).filter((i: string) => !i.startsWith("A:")))
      expect(sim.contentOf(item).match(/.{3}/g)?.every((gene: string) => G.base.includes(gene))).toBe(true);
});

it("counts half for the stage while the core hungers for a base gene it eats", () => {
  seeded(3);
  sim.fresh();
  const { G } = sim;
  const [a, b] = G.base;
  G.stage = 1;
  G.goals = sim.drawGoals(1);
  G.time = 100;
  sim.eat(a + b);
  expect(G.goals[0].fed).toBe(0.5);
  expect(sim.hungryFor()).toEqual([a, b]);
  sim.eat(a);
  sim.eat(b);
  sim.eat(a + b);
  expect(G.goals[0].fed).toBe(1.5);
  G.time += sim.BASE_WINDOW + 1;
  sim.eat(a + b);
  sim.eat(a + b);
  expect(G.goals[0].fed).toBe(2.5);
  // Half a delivery still completes the last one: the stage grows.
  G.goals[0].fed = G.goals[0].count - 0.25;
  sim.eat(a + b);
  expect(G.stage).toBe(2);
});
