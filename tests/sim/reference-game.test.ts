// item_018 AC1: a reference game played to stage 4 at a reasonable pace holds about 1,000 DNA at most. The player is
// modelled, the simulation is real: every gene goes through eat(), every mechanic through credit(), the nests and
// their creatures run as in a game, and the DNA is what the game paid. Nothing is spent, so the value is an upper bound.
import { beforeEach, expect, it } from "vitest";
import { hooks } from "../../src/sim/hooks.ts";
import { referenceGame, PACE } from "./reference-game.ts";

beforeEach(() => {
	for (const name of Object.keys(hooks) as (keyof typeof hooks)[]) hooks[name] = () => undefined;
	hooks.drawsRecipes = () => true;
	hooks.heard = () => false;
});

it("holds about 1,000 DNA at most on reaching stage 4, at a reasonable pace and a slow one, over several draws", () => {
	const runs = [...[3, 7, 11].map((seed) => referenceGame(seed)), referenceGame(5, 2 * PACE.build)];
	// Measured on 2026-11-24, with the swarms of item_016: 576 DNA after 43 minutes on each draw; 926 for the slow player after 83.
	// The slow player ends richer only by what its longer fights paid, and still under the ceiling.
	expect(runs[3].dna).toBeGreaterThan(runs[0].dna);
	// Swarms came and were fought before stage 4 in every run (item_016 AC1).
	for (const run of runs) expect(run.waves > 0 && run.kills > 0, JSON.stringify(run)).toBe(true);
	for (const run of runs) {
		expect(run.stage).toBe(3);
		expect(run.dna, JSON.stringify(run)).toBeLessThanOrEqual(1000);
		// Not starved either: enough to rank a few producers up and build the stage 4 turrets.
		expect(run.dna).toBeGreaterThanOrEqual(400);
	}
});
