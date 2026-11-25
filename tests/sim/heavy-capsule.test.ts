// A heavy capsule takes two carbons and an isotope. Fed on one side in a ratio other than two to one, the one in
// excess blocks the other for good; its other side takes them too, so each can come on a line of its own.
import { beforeEach, expect, it } from "vitest";
import { hooks } from "../../src/sim/hooks.ts";
import * as sim from "../../src/sim/sim.ts";

beforeEach(() => {
	for (const name of Object.keys(hooks) as (keyof typeof hooks)[]) hooks[name] = () => undefined;
	hooks.drawsRecipes = () => true;
	hooks.heard = () => false;
	sim.fresh();
	sim.G.breaches = [];
	while (sim.G.stage < 4) sim.grow();
});

// One minute of an encapsulator on heavy capsules, its genes behind, what each side is given, the capsules made.
function made(sides: string[][]) {
	const { CORE } = sim, x = CORE.x + 12, y = CORE.y;
	const genes = sim.put("cyst", x - 1, y, 1);
	const pack = sim.put("pack", x, y, 1);
	sim.setRecipe(pack, "H");
	const feeds = [sim.put("cyst", x, y - 1, 2), sim.put("cyst", x, y + 1, 0)];
	const sink = sim.put("vault", x + 1, y, 1);
	const turn = [0, 0];
	for (let i = 0; i < 1200; i++) {
		if (genes.stock.length < 20) genes.stock.push("SSN");
		sides.forEach((list, s) => { if (list.length && feeds[s].stock.length < 6) feeds[s].stock.push(list[turn[s]++ % list.length]); });
		sim.step(sim.STEP);
	}
	return sink.stock.length;
}

it("makes heavy capsules from carbon on one side and isotope on the other", () => {
	expect(made([["K"], ["I"]])).toBeGreaterThan(5);
});

it("still makes them from one side fed two carbons to an isotope", () => {
	expect(made([["K", "K", "I"], []])).toBeGreaterThan(5);
});

it("takes nothing from the other side for a magazine or a capsule", () => {
	const pack = sim.put("pack", 10, 10, 1);
	for (const box of ["A", "T"]) {
		sim.setRecipe(pack, box);
		expect(sim.packPort(pack, (sim.isotopeSide(pack) + 2) % 4)).toBe(-1);
	}
	sim.setRecipe(pack, "H");
	expect(sim.packPort(pack, (sim.isotopeSide(pack) + 2) % 4)).toBe(1);
});
