// item_027: a hexagon farther from the first purified one is harder, one step a ring up to the third: one more enemy
// family from the start, swarms a quarter bigger, deposits a tenth poorer. The reference game still reaches stage 4
// on rings 1 to 3. Boundary: its player model kills what comes, so this proves the stages still open, not the fights.
import { beforeEach, expect, it } from "vitest";
import { hooks } from "../../src/sim/hooks.ts";
import * as sim from "../../src/sim/sim.ts";
import { referenceGame } from "./reference-game.ts";

beforeEach(() => {
	for (const name of Object.keys(hooks) as (keyof typeof hooks)[]) hooks[name] = () => undefined;
	hooks.drawsRecipes = () => true;
	hooks.heard = () => false;
});

it("makes each ring harder, bounded at the third", () => {
	const at = (ring: number) => {
		sim.fresh();
		const base = sim.G.families.length;
		sim.applyRing(ring);
		const mine = sim.put("mine", sim.CORE.x + 8, sim.CORE.y + 8, 1);
		sim.G.swarm = { wave: 0, start: 0 };
		sim.planSwarm(sim.G.time + 60);
		return { families: sim.G.families.length - base, rate: sim.perSecond(mine), swarm: sim.G.swarm.size, base: sim.G.base, all: sim.G.families };
	};
	const rings = [0, 1, 2, 3, 5].map(at);
	expect(rings.map((r) => r.families)).toEqual([0, 1, 2, 3, 3]);
	for (const r of rings) expect(r.all.some((f: string) => r.base.includes(f))).toBe(false);
	expect(rings[1].rate / rings[0].rate).toBeCloseTo(0.9, 5);
	expect(rings[3].rate / rings[0].rate).toBeCloseTo(0.7, 5);
	expect(rings[4].rate).toBeCloseTo(rings[3].rate, 5);
	expect(rings[3].swarm).toBeGreaterThan(rings[0].swarm);
	expect(rings[3].swarm).toBeLessThanOrEqual(sim.SWARM.most);
});

it("still opens stage 4 on rings 1 to 3", () => {
	for (const ring of [1, 2, 3]) {
		const run = referenceGame(7, undefined, () => sim.applyRing(ring));
		expect(run.stage, JSON.stringify({ ring, ...run })).toBe(3);
	}
});
