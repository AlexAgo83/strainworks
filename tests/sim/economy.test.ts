// The economy of item_018: a deposit feeds a few harvesters, surplus pays less, ranks cost more.
import { beforeEach, expect, it } from "vitest";
import { hooks } from "../../src/sim/hooks.ts";
import * as sim from "../../src/sim/sim.ts";

beforeEach(() => {
	for (const name of Object.keys(hooks) as (keyof typeof hooks)[]) hooks[name] = () => undefined;
	hooks.heard = () => false;
	sim.fresh();
});

it("counts the harvesters of a deposit and calls it full at the limit", () => {
	const field = sim.FIELDS.find((f: unknown[]) => f[0] === "S");
	const cells = sim.patchOf(field).list.filter((p: { x: number; y: number }) => !sim.cellAt(p.x, p.y));
	expect(cells.length).toBeGreaterThan(sim.HARVESTERS_PER_DEPOSIT);
	const [a, b, c, d] = cells;
	expect(sim.fieldAt(a.x, a.y)).toBe(field);
	sim.put("mine", a.x, a.y, 1);
	sim.put("mine", b.x, b.y, 1);
	expect(sim.harvestersOn(field)).toBe(2);
	expect(sim.depositFull(d.x, d.y)).toBe(false);
	sim.put("mine", c.x, c.y, 1);
	expect(sim.harvestersOn(field)).toBe(sim.HARVESTERS_PER_DEPOSIT);
	expect(sim.depositFull(d.x, d.y)).toBe(true);
	// Another deposit is not touched by it, nor bare ground.
	const other = sim.FIELDS.find((f: unknown[]) => f[0] === "F");
	const free = sim.patchOf(other).list[0];
	expect(sim.depositFull(free.x, free.y)).toBe(false);
	expect(sim.fieldAt(sim.CORE.x, sim.CORE.y)).toBeUndefined();
});

it("pays a sixth of a gene a base for what the core does not ask for, and nothing for what it asks", () => {
	const { G } = sim;
	G.goals = [{ item: "SSS", count: 10, fed: 0 }];
	// DNA is paid whole, the fractions kept until they add up.
	const worth = () => G.dna + (G.dnaBits || 0);
	const before = worth();
	sim.eat("FFF");
	expect(worth() - before).toBeCloseTo(3 / 18);
	sim.eat("T:FFF");
	expect(worth() - before).toBeCloseTo((3 + 6 * 3) / 18);
	const asked = worth();
	sim.eat("SSS");
	expect(worth()).toBe(asked);
});

it("ranks producers and stores up at one and a half times their former prices", () => {
	expect(sim.RANKS.mine.cost).toEqual([0, 120, 300]);
	expect(sim.RANKS.ligase.cost).toEqual([0, 120, 300]);
	expect(sim.RANKS.pack.cost).toEqual([0, 225, 600]);
	expect(sim.RANKS.cyst.cost).toEqual([0, 75, 180]);
	// Belts and defences keep theirs.
	expect(sim.RANKS.belt.cost).toEqual([0, 4, 16]);
	expect(sim.RANKS.turret.cost).toEqual([0, 100, 250]);
});
