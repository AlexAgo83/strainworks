// The reference game of item_018, shared by the simulation tests that replay it: the player is modelled, the
// simulation is real.
import * as sim from "../../src/sim/sim.ts";

// The pace of the reference player: twenty minutes of building before each stage's recipes flow, eight more machines
// a stage, MK1 lines (a gene a second, a box every six), the base genes the core eats fed all along, its mechanic
// worked once its lines run. The slow player builds for forty minutes a stage.
export const PACE = { build: 1200, machines: 8, gene: 1, box: 6, guide: 9 };

export function referenceGame(seed: number, build = PACE.build, setup: () => void = () => undefined) {
	let s = seed;
	Math.random = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
	sim.fresh();
	setup();
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
	let stageAt = 0;
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
	}
	return { stage: G.stage, dna: Math.floor(G.dna), minutes: Math.round(G.time / 60), waves: G.swarm?.wave ?? 0, kills: G.kills };
}
