// item_017 AC1: a chain built for the first base gene at stage 2 still feeds the core at stage 5, so the core never
// hungers for that gene and nothing built early has to be torn down.
import { beforeEach, expect, it } from "vitest";
import { hooks } from "../../src/sim/hooks.ts";
import * as sim from "../../src/sim/sim.ts";

beforeEach(() => {
	for (const name of Object.keys(hooks) as (keyof typeof hooks)[]) hooks[name] = () => undefined;
	hooks.drawsRecipes = () => true;
	hooks.heard = () => false;
});

it("keeps a stage 2 chain for the first base gene feeding the core at stage 5", () => {
	let seed = 7;
	Math.random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
	sim.fresh();
	const { G } = sim;
	G.breaches = [];
	const core = sim.coreCell();
	const gene = G.base[0];
	// Three stores, each holding one base of the gene, on the Ligase's left, back and right; the Ligase faces east,
	// a belt from it into the core's west face.
	const lx = core.x - 4, ly = core.y + 1;
	const lig = sim.put("ligase", lx, ly, 1);
	const store = (x: number, y: number, dir: number, base: string) => { sim.put("cyst", x, y, dir).stock = Array(240).fill(base); };
	store(lx, ly - 1, 2, gene[0]);
	store(lx - 1, ly, 1, gene[1]);
	store(lx, ly + 1, 0, gene[2]);
	for (let x = lx + 1; x < core.x; x++) sim.put("belt", x, ly, 1);
	const run = (seconds: number) => { for (let i = 0; i < Math.round(seconds / 0.05); i++) sim.step(0.05); };
	// Stage 2: the chain feeds the core its first base gene.
	G.stage = 1;
	G.goals = sim.drawGoals(1);
	run(20);
	expect(lig.last).toBe(gene);
	expect(sim.hungryFor()).not.toContain(gene);
	const atStage2 = G.baseAt[gene];
	// Stage 5, nothing touched: the same chain still feeds it, the core does not hunger for it.
	G.stage = 4;
	G.goals = sim.drawGoals(4);
	run(40);
	expect(sim.eaten()).toContain(gene);
	expect(G.baseAt[gene]).toBeGreaterThan(atStage2 + 30);
	expect(sim.hungryFor()).not.toContain(gene);
});
