// item_018 AC1: a reference game played to stage 4 at a reasonable pace holds about 1,000 DNA at most. The player is
// modelled, the simulation is real: every gene goes through eat(), every mechanic through credit(), the nests and
// their creatures run as in a game, and the DNA is what the game paid. Nothing is spent, so the value is an upper bound.
import { beforeEach, expect, it } from "vitest";
import { hooks } from "../../src/sim/hooks.ts";
import * as sim from "../../src/sim/sim.ts";

beforeEach(() => {
	for (const name of Object.keys(hooks) as (keyof typeof hooks)[]) hooks[name] = () => undefined;
	hooks.drawsRecipes = () => true;
	hooks.heard = () => false;
});

// The pace of the reference player: twenty minutes of building before each stage's recipes flow, eight more machines
// a stage, MK1 lines (a gene a second, a box every six), the base genes the core eats fed all along, its mechanic
// worked once its lines run. The slow player builds for forty minutes a stage.
export const PACE = { build: 1200, machines: 8, gene: 1, box: 6, guide: 9 };

export function referenceGame(seed: number, build = PACE.build) {
	let s = seed;
	Math.random = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
	sim.fresh();
	const { G } = sim;
	for (let i = 0; i < PACE.guide; i++) sim.earn("guide", 5);
	const due = new Map<string, number>();
	const every = (what: string, period: number) => {
		if (!due.has(what)) due.set(what, G.time + period);
		const next = due.get(what) as number;
		if (G.time < next) return false;
		due.set(what, next + period);
		return true;
	};
	let stageAt = 0, woke = 0;
	while (G.stage < 3 && G.time < 4 * 3600) {
		if (G.stage !== stageAt || G.time === 0) {
			stageAt = G.stage;
			due.clear();
			// The machines of this stage, in the clearing round the core.
			const { CORE } = sim;
			for (let i = G.stage * PACE.machines; i < (G.stage + 1) * PACE.machines; i++) sim.put("cyst", CORE.x - 7 + (i % 14), CORE.y + 3 + Math.floor(i / 14) * 2, 0);
		}
		const since = G.time - (G.grownAt ?? 0);
		for (const gene of sim.eaten()) if (every(`base ${gene}`, 1 / PACE.gene)) sim.eat(gene);
		if (since >= build) {
			for (const goal of G.goals) {
				if (goal.fed >= goal.count) continue;
				if (every(goal.item, sim.boxOf(goal.item) ? PACE.box : 1 / PACE.gene)) sim.eat(goal.item);
			}
			for (const need of G.needs || []) if (need.fed < need.count && every(need.need, 1)) sim.credit(need.need);
		}
		// The creatures that come are killed by the player's turrets, a DNA each.
		for (const e of G.enemies) if (e.hp > 0 && !e.fly) { e.hp = 0; G.kills++; sim.earn("kills", 1); }
		G.enemies = G.enemies.filter((e: { hp: number }) => e.hp > 0);
		sim.step(sim.STEP);
		woke = Math.max(woke, G.breaches.filter((b: { state: string }) => b.state !== "sleep").length);
	}
	return { stage: G.stage, dna: Math.floor(G.dna), minutes: Math.round(G.time / 60), woke, kills: G.kills };
}

it("holds about 1,000 DNA at most on reaching stage 4, at a reasonable pace and a slow one, over several draws", () => {
	const runs = [...[3, 7, 11].map((seed) => referenceGame(seed)), referenceGame(5, 2 * PACE.build)];
	// Measured on 2026-11-24: 624, 610 and 617 DNA after 43 minutes; 826 for the slow player after 83.
	// The slow player ends richer only by what its longer fights paid, and still under the ceiling.
	expect(runs[3].dna).toBeGreaterThan(runs[0].dna);
	// A nest woke on its own and attacked before stage 4 in every run (item_016 AC1).
	for (const run of runs) expect(run.woke > 0 && run.kills > 0).toBe(true);
	for (const run of runs) {
		expect(run.stage).toBe(3);
		expect(run.dna, JSON.stringify(run)).toBeLessThanOrEqual(1000);
		// Not starved either: enough to rank a few producers up and build the stage 4 turrets.
		expect(run.dna).toBeGreaterThanOrEqual(400);
	}
});
