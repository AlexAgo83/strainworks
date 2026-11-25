// A sorter on a nerve has the gate's tools: it reads the gene asked (whole or a position), or sends its filter aside
// only while a condition of its net holds (a threat, its store low or full), so many per opening.
import { beforeEach, expect, it } from "vitest";
import { hooks } from "../../src/sim/hooks.ts";
import * as sim from "../../src/sim/sim.ts";

beforeEach(() => {
	for (const name of Object.keys(hooks) as (keyof typeof hooks)[]) hooks[name] = () => undefined;
	hooks.drawsRecipes = () => true;
	hooks.heard = () => false;
	let seed = 7;
	Math.random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
	sim.fresh();
	sim.G.breaches = [];
	sim.G.enemies = [];
});
const run = (seconds: number) => { for (let i = 0; i < Math.round(seconds / sim.STEP); i++) sim.step(sim.STEP); };
const wire = (a: { x: number; y: number }, b: { x: number; y: number }) =>
	sim.G.wires.push({ a: sim.key(a.x, a.y), b: sim.key(b.x, b.y), hp: sim.NERVE.hp, left: 0, order: sim.G.wires.length + 1, color: 0 });

it("sends its filter aside only while its store is low, by batches, and counts for the nerve", () => {
	const { G, CORE } = sim;
	const x = CORE.x + 14, y = CORE.y + 8;
	// A store feeding a line of S, a sorter, its side into a cyst it watches, straight on into a burner.
	sim.put("cyst", x, y, 1).stock = Array(400).fill("S");
	sim.put("belt", x + 1, y, 1);
	const sort = sim.put("sort", x + 2, y, 1);
	sort.want = "S";
	sort.side = 1;
	sim.put("belt", x + 2, y + 1, 2);
	const store = sim.put("cyst", x + 2, y + 2, 2);
	sim.put("belt", x + 3, y, 1);
	sim.put("burn", x + 4, y, 0);
	wire(sort, store);
	sort.when = "low";
	sim.sense();
	expect(sim.listens(sort)).toBe(true);
	expect(sort.watch).toBe(sim.key(store.x, store.y));
	// Low: what matches goes aside, into the store.
	run(10);
	expect(store.stock.length).toBeGreaterThan(0);
	// Full: everything goes straight on.
	store.stock = Array(sim.capOf(store)).fill("S");
	sim.sense();
	sort.item = "S";
	expect(sim.exitOf(sort)).toBe(sort.dir);
	// A batch of 3: three aside, then straight on until the condition drops and comes back.
	store.stock = [];
	sort.batch = 3;
	sort.passed = 0;
	sim.sense();
	run(20);
	expect(store.stock.length).toBe(3);
	sort.item = "S";
	expect(sim.exitOf(sort)).toBe(sort.dir);
	store.stock = Array(sim.capOf(store)).fill("S");
	sim.sense();
	expect(sort.passed || 0).toBe(0);
});

it("on a threat, sends aside what matches; calm, nothing", () => {
	const { G, CORE } = sim;
	const x = CORE.x + 14, y = CORE.y + 8;
	const sort = sim.put("sort", x, y, 1);
	sort.want = "SFS";
	sort.side = 3;
	sim.put("belt", x + 1, y, 1);
	sim.put("belt", x, y - 1, 0);
	const gun = sim.put("turret", x, y + 4, 0);
	wire(sort, gun);
	sort.when = "threat";
	sim.sense();
	sort.item = "SFS";
	expect(sim.exitOf(sort)).toBe(sort.dir);
	G.enemies = [{ x: x + 1, y: y + 5, gene: "CCF", hp: 9, max: 9, tier: 0 }];
	sim.sense();
	expect(sim.exitOf(sort)).toBe(sim.sideExit(sort));
	sort.item = "FFF";
	expect(sim.exitOf(sort)).toBe(sort.dir);
});
