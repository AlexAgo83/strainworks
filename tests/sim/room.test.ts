// item_020: no recipe takes more than three input lines, and a 16 x 16 square round the core is free to build on.
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

it("asks no recipe of more than three input lines, stage after stage, on every seed", () => {
	let most = 0;
	for (let n = 1; n <= 200; n++) {
		seeded(n);
		sim.fresh();
		const { G } = sim;
		for (let stage = 0; stage < sim.STAGES.length; stage++) {
			for (const goal of G.goals) {
				most = Math.max(most, sim.inputLines(goal.item));
				expect(sim.inputLines(goal.item), `${goal.item} at stage ${stage + 1}`).toBeLessThanOrEqual(sim.MOST_LINES);
			}
			sim.grow();
		}
	}
	expect(most).toBe(3);
});

it("makes the stage 4 antidote one of this game's base genes", () => {
	for (let n = 1; n <= 50; n++) {
		seeded(n);
		sim.fresh();
		const { G } = sim;
		for (let stage = 0; stage < 3; stage++) sim.grow();
		const magazines = G.goals.find((g: { item: string }) => g.item.startsWith("A:"));
		expect(G.base).toContain(magazines.item.slice(2));
		expect(G.families).toContain(sim.opposite(G.base[2]));
	}
});

it("keeps a 16 x 16 square round the core free of deposits and nests", () => {
	for (let n = 1; n <= 20; n++) {
		seeded(n);
		sim.fresh();
		const { CORE } = sim;
		let cells = 0;
		for (let x = CORE.x - 8; x < CORE.x + 8; x++)
			for (let y = CORE.y - 8; y < CORE.y + 8; y++) {
				cells++;
				expect(sim.inClearing(x, y)).toBe(true);
				expect(sim.depositAt(x, y), `deposit at ${x},${y}`).toBeUndefined();
				for (const b of sim.G.breaches) expect(Math.hypot(x - b.x, y - b.y)).toBeGreaterThanOrEqual(3.5);
			}
		expect(cells).toBe(256);
	}
});
