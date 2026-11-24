// item_016: the threat grows with the base. From stage 3 a base past a few machines wakes nests on its own, one more
// as it grows; a small base, or any base before stage 3, stays quiet. Rich deposits sit in a nest's reach, and a
// destroyed nest pays.
import { beforeEach, expect, it } from "vitest";
import { hooks } from "../../src/sim/hooks.ts";
import * as sim from "../../src/sim/sim.ts";

const told: string[] = [];
beforeEach(() => {
	for (const name of Object.keys(hooks) as (keyof typeof hooks)[]) hooks[name] = () => undefined;
	hooks.drawsRecipes = () => true;
	hooks.heard = () => false;
	hooks.tell = (text: string) => { told.push(text); };
	told.length = 0;
	let seed = 5;
	Math.random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
	sim.fresh();
});
const run = (seconds: number) => { for (let i = 0; i < Math.round(seconds / sim.STEP); i++) sim.step(sim.STEP); };
// Machines round the core, inside the clearing, where no nest is disturbed by them.
const machines = (n: number, from = 0) => {
	const { CORE } = sim;
	for (let i = from; i < from + n; i++) sim.put("cyst", CORE.x - 7 + (i % 14), CORE.y + 4 + Math.floor(i / 14) * 2, 0);
};
const awake = () => sim.G.breaches.filter((b: { state: string }) => b.state === "wake").length;

it("keeps a small base quiet at stage 3, for ten minutes", () => {
	sim.G.stage = 2;
	machines(sim.RISE.quiet);
	run(600);
	expect(awake()).toBe(0);
	expect(sim.G.enemies.length).toBe(0);
});

it("keeps any base quiet before stage 3", () => {
	sim.G.stage = 1;
	machines(40);
	run(600);
	expect(awake()).toBe(0);
});

it("wakes the nearest nest for an expanding base at stage 3, then one more as it grows, and they attack", () => {
	const { G } = sim;
	G.stage = 2;
	machines(sim.RISE.quiet + 1);
	run(5);
	expect(awake()).toBe(1);
	const first = G.breaches.find((b: { state: string }) => b.state === "wake");
	const core = sim.coreCell();
	const nearest = Math.min(...G.breaches.map((b: { x: number; y: number }) => Math.hypot(b.x - core.x, b.y - core.y)));
	expect(Math.hypot(first.x - core.x, first.y - core.y)).toBe(nearest);
	// Not another one for the same size, even later. Its creatures come: they are cleared as a defence would.
	let came = 0;
	for (let t = 0; t < sim.RISE.every + 5; t++) { run(1); came += G.enemies.length; G.enemies = []; }
	expect(G.over).toBe(false);
	expect(came).toBeGreaterThan(0);
	expect(awake()).toBe(1);
	// Grown by PER machines: the next one wakes once EVERY seconds have passed.
	machines(sim.RISE.per, sim.RISE.quiet + 1);
	run(5);
	expect(G.breaches.filter((b: { roused?: boolean }) => b.roused).length).toBe(2);
});

it("puts every rich deposit within the reach of a nest the game keeps", () => {
	let rich = 0;
	for (const field of sim.OUTER) {
		const cells = sim.patchOf(field).list;
		if (!cells.some((p: { x: number; y: number }) => sim.richAt(p.x, p.y) >= 2)) continue;
		rich++;
		const nest = sim.nestBy(field);
		expect(sim.G.breaches.some((b: { x: number; y: number }) => b.x === nest.x && b.y === nest.y)).toBe(true);
		for (const p of cells) expect(Math.hypot(p.x - nest.x, p.y - nest.y)).toBeLessThanOrEqual(nest.r);
	}
	expect(rich).toBe(6);
});

it("pays a destroyed nest and says so", () => {
	const { G } = sim;
	const b = G.breaches[0];
	const before = G.dna;
	sim.destroyNest(b);
	expect(G.dna - before).toBe(b.total);
	expect(told.some((t) => t.includes(`+${b.total} ADN`))).toBe(true);
});
