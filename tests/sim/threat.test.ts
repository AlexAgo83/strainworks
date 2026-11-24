// item_016: from stage 2 swarms come to the base at announced times, growing with time and with the base; the first
// is weak. Nests stay apart: rich deposits sit in a nest's reach, and a destroyed nest pays.
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

const swarmers = () => sim.G.enemies.filter((e: { home: number }) => e.home === -1);

it("sends no swarm before stage 2, nor in a game with fixed recipes", () => {
	machines(40);
	run(600);
	expect(sim.G.swarm).toBeUndefined();
	expect(swarmers().length).toBe(0);
	const { G } = sim;
	G.stage = 1;
	delete G.base;
	run(300);
	expect(G.swarm).toBeUndefined();
});

it("announces the first swarm on stage 2 with the defence guide, and sends three slow, frail creatures on time", () => {
	const { G } = sim;
	G.stage = 1;
	run(1);
	expect(G.guide).toMatchObject({ kind: "defense", step: 0 });
	expect(G.swarm.size).toBe(sim.SWARM.first);
	expect(told.at(-1)).toMatch(/^Essaim en approche du .+, dans 180 s : 3 créatures\. Leur antidote : [SFCN]{3}\.$/);
	const at = G.swarm.next;
	run(at - G.time - 1);
	expect(swarmers().length).toBe(0);
	run(2);
	const first = swarmers();
	expect(first.length).toBe(3);
	expect(first.every((e: { kind: string; max: number }) => e.kind === "drift" && e.max === sim.SWARM.hp)).toBe(true);
	expect(sim.kindOf(first[0]).pace).toBeLessThan(1);
	// The next one is announced at once, a regular interval later.
	expect(G.swarm.next - at).toBeCloseTo(sim.SWARM.every, 5);
});

it("never wipes an undefended base with the first swarm", () => {
	const { G } = sim;
	G.stage = 1;
	machines(10);
	run(sim.SWARM.lead + sim.SWARM.every - 2);
	expect(G.over).toBe(false);
	expect(sim.coreCell().hp).toBeGreaterThan(50);
	const standing = sim.allCells().filter((c: { type: string }) => c.type === "cyst").length;
	expect(standing).toBeGreaterThanOrEqual(8);
});

it("grows the swarms with the minutes since the first and with the base", () => {
	expect(sim.swarmSize(0, 5)).toBe(3);
	expect(sim.swarmSize(8 * 60, 5)).toBe(5);
	expect(sim.swarmSize(0, 26)).toBe(5);
	expect(sim.swarmSize(16 * 60, 42)).toBe(11);
	expect(sim.swarmSize(10 * 3600, 999)).toBe(sim.SWARM.most);
	// In a game: the waves of a small base and of a large one, half an hour on.
	const sizes = (n: number) => {
		sim.fresh();
		sim.G.stage = 1;
		machines(n);
		const seen: number[] = [];
		for (let t = 0; t < 30 * 60; t += 10) { run(10); sim.G.enemies = []; if (sim.G.swarm && seen.at(-1) !== sim.G.swarm.size) seen.push(sim.G.swarm.size); }
		return seen;
	};
	const small = sizes(5), large = sizes(40);
	expect(small[0]).toBe(3);
	expect(small.at(-1)).toBeGreaterThan(small[0]);
	expect(large.at(-1)).toBeGreaterThan(small.at(-1) as number);
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
