// item_019: from stage 2 each stage of a drawn game asks for one mechanic the game already has. Its recipes alone do
// not grow the stage; the mechanic, counted as it works in the simulation, does.
import { beforeEach, expect, it } from "vitest";
import { hooks } from "../../src/sim/hooks.ts";
import * as sim from "../../src/sim/sim.ts";

beforeEach(() => {
	for (const name of Object.keys(hooks) as (keyof typeof hooks)[]) hooks[name] = () => undefined;
	hooks.drawsRecipes = () => true;
	hooks.heard = () => false;
	let seed = 11;
	Math.random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
	sim.fresh();
	sim.G.breaches = sim.G.breaches.filter(() => false);
});
const run = (seconds: number) => { for (let i = 0; i < Math.round(seconds / sim.STEP); i++) sim.step(sim.STEP); };
// Up to a stage, every recipe delivered: only its mechanic is left.
const reach = (stage: number) => {
	const { G } = sim;
	while (G.stage < stage) sim.grow();
	for (const g of G.goals) g.fed = g.count;
};

it("asks for kills at stage 2, the nerves at 3, the turrets at 4, an outpost at 5, and none at 1 or 6", () => {
	const asked = [];
	for (let stage = 0; stage < sim.STAGES.length; stage++) {
		reach(stage);
		asked.push(sim.G.needs.map((n: { need: string }) => n.need).join(""));
	}
	expect(asked).toEqual(["", "kill", "nerve", "turret", "outpost", ""]);
});

it("keeps stage 2 until guns have killed 3 creatures, whatever they fired, and never asks for a sorter", () => {
	const { G, CORE } = sim;
	reach(1);
	// A sorter at work counts for nothing any more.
	const x = CORE.x + 12, y = CORE.y + 6;
	sim.put("cyst", x, y, 1).stock = Array(200).fill("S");
	sim.put("belt", x + 1, y, 1);
	const sort = sim.put("sort", x + 2, y, 1);
	sort.want = "S";
	sort.side = 1;
	sim.put("belt", x + 2, y + 1, 2);
	sim.put("burn", x + 2, y + 2, 0);
	run(20);
	expect(G.needs[0]).toMatchObject({ need: "kill", fed: 0 });
	// A turret firing what it has, not the antidote: every creature it kills counts.
	const gun = sim.put("turret", CORE.x + 10, CORE.y, 0);
	const foe = "SFN";
	gun.ammo = { [foe]: 40 };
	const foes = (n: number) => { for (let i = 0; i < n; i++) G.enemies.push({ x: CORE.x + 12.5, y: CORE.y + 0.5, gene: foe, hp: 1, max: 1, tier: 0, home: -1 }); };
	foes(2);
	run(8);
	expect(G.needs[0].fed).toBe(2);
	expect(G.stage).toBe(1);
	foes(1);
	run(3);
	expect(G.stage).toBe(2);
});

it("counts a kill for stage 4 only when the turret fires the creature's antidote", () => {
	const { G, CORE } = sim;
	reach(3);
	const gun = sim.put("turret", CORE.x + 10, CORE.y, 0);
	const foe = "SFN", antidote = sim.opposite(foe);
	gun.ammo = { [foe]: 5 };
	G.enemies.push({ x: CORE.x + 12.5, y: CORE.y + 0.5, gene: foe, hp: 1, max: 1, tier: 0, home: -1 });
	run(3);
	expect(G.needs[0].fed).toBe(0);
	gun.ammo = { [antidote]: 5 };
	G.enemies.push({ x: CORE.x + 12.5, y: CORE.y + 0.5, gene: foe, hp: 1, max: 1, tier: 0, home: -1 });
	run(3);
	expect(G.needs[0].fed).toBe(1);
	expect(G.stage).toBe(3);
	G.needs[0].fed = G.needs[0].count - 1;
	G.enemies.push({ x: CORE.x + 12.5, y: CORE.y + 0.5, gene: foe, hp: 1, max: 1, tier: 0, home: -1 });
	gun.ammo = { [antidote]: 5 };
	run(3);
	expect(G.stage).toBe(4);
});

it("counts the seconds a harvester holds a deposit within a nest's reach, for stage 5", () => {
	const { G } = sim;
	reach(4);
	const b = { x: 20, y: 20, r: 6, state: "sleep", genes: ["SFN"], left: 10, total: 10, wave: 0, pending: 0, ended: 0 };
	G.breaches.push(b);
	sim.put("mine", 40, 40, 0);
	expect(sim.outpostHeld()).toBe(false);
	sim.put("mine", 23, 22, 0);
	expect(sim.outpostHeld()).toBe(true);
	b.state = "spent";
	expect(sim.outpostHeld()).toBe(false);
	b.state = "sleep";
	G.needs[0].fed = G.needs[0].count - 1;
	run(2);
	expect(G.stage).toBe(5);
});

it("counts for stage 3 what a sorter steered by a nerve sends aside, and nothing unwired", () => {
	const { G, CORE } = sim;
	while (G.stage < 2) sim.grow();
	const strand = G.goals[1].item;
	const x = CORE.x + 12, y = CORE.y;
	sim.put("cyst", x, y, 1).stock = Array(100).fill(strand);
	sim.put("belt", x + 1, y, 1);
	const sort = sim.put("sort", x + 2, y, 1);
	sort.want = "SSS";
	sort.side = 1;
	sim.put("belt", x + 3, y, 1);
	sim.put("burn", x + 4, y, 0);
	sim.put("belt", x + 2, y + 1, 2);
	sim.put("burn", x + 2, y + 2, 0);
	run(10);
	expect(G.needs[0].fed).toBe(0);
	// A nerve from the core to the sorter: it now sends aside what the core asks for.
	const core = sim.coreCell();
	G.wires.push({ a: sim.key(sort.x, sort.y), b: sim.key(core.x, core.y), hp: sim.NERVE.hp, left: 0, order: 1, color: 0 });
	run(10);
	expect(sim.listens(sort)).toBe(true);
	expect(G.needs[0].need).toBe("nerve");
	expect(G.needs[0].fed).toBeGreaterThan(0);
});

it("lets a gate listening to the core pass the capsules the core asks for, as the stage 3 nerve needs", () => {
	const { G, CORE } = sim;
	while (G.stage < 2) sim.grow();
	const capsule = G.goals.find((g: { item: string }) => sim.boxOf(g.item) === "T").item;
	const x = CORE.x + 12, y = CORE.y;
	const gate = sim.put("gate", x, y, 1);
	const core = sim.coreCell();
	G.wires.push({ a: sim.key(gate.x, gate.y), b: sim.key(core.x, core.y), hp: sim.NERVE.hp, left: 0, order: 1, color: 0 });
	sim.sense();
	expect(sim.listens(gate)).toBe(true);
	expect(sim.accepts(gate, capsule, 1)).toBe(true);
	// What the core does not ask for still waits.
	expect(sim.accepts(gate, "T:NNNNNN", 1)).toBe(false);
});
