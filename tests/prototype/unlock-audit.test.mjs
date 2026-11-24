// Nothing asks for what is not open yet (v0.2.1): at every stage, what the recipes, the stage mechanic, the guides,
// the swarm's antidote and the stage texts name must be open or obtainable then, read from the game's own unlock
// tables (NEEDS, unlocked, minable), never from a copy. One mismatch fails the test with what and where.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

it("asks at each stage only for what that stage has open", async () => {
	const browser = await launch();
	try {
		const page = await browser.newPage({ recipes: true });
		const errors = [];
		page.on("pageerror", (error) => errors.push(error.message));
		await page.route("**/*", (route) =>
			route.request().url().startsWith("http://proto.test")
				? route.fulfill({ body: pageHTML(), contentType: "text/html" })
				: route.abort(),
		);
		await page.goto("http://proto.test/prototype/");
		const wrong = await page.evaluate(() => {
			const wrong = [];
			const open = (type) => unlocked(NEEDS[type] || 0);
			// The buildings and matter an item takes: a gene its Ligase and bases, a strand the Assembleur, a box the
			// Encapsuleur and its carbon, a heavy capsule the isotope and the heavy recipe.
			const takes = (item) => {
				const box = boxOf(item);
				const genes = contentOf(item).match(/.{3}/g) || [];
				const out = [];
				if (genes.length || item.length === 1)
					out.push(["ligase", open("ligase")]);
				if (genes.length > 1) out.push(["join", open("join")]);
				if (box) out.push(["pack", open("pack")], ["carbone", minable("K")]);
				if (box === "H")
					out.push(["isotope", minable("I")], ["capsule lourde", unlocked(4)]);
				for (const b of contentOf(item)) out.push([`base ${b}`, minable(b)]);
				return out;
			};
			const check = (stage, where, list) => {
				for (const [what, ok] of list)
					if (!ok) wrong.push(`stade ${stage + 1}, ${where} : ${what}`);
			};
			for (const seed of [1, 2, 3, 4, 5, 6]) {
				let s = seed;
				Math.random = () => {
					s = (s * 16807) % 2147483647;
					return (s - 1) / 2147483646;
				};
				fresh();
				G.open = false;
				for (let stage = 0; stage < STAGES.length; stage++) {
					G.stage = stage;
					// Drawn recipes, as a new game draws them.
					for (const goal of layeredGoals(stage))
						check(stage, `recette tirée ${goal.item}`, takes(goal.item));
					for (const need of drawNeeds(stage))
						check(stage, `mécanique ${need.need}`, [
							[MECHANIC[need.need].type, open(MECHANIC[need.need].type)],
						]);
					// The swarm's antidote, for every family the game holds.
					if (stage >= SWARM.from)
						for (const family of G.families)
							check(stage, `antidote de ${family}`, takes(opposite(family)));
				}
			}
			for (let stage = 0; stage < STAGES.length; stage++) {
				G.stage = stage;
				// The recipes older games and the demo replay.
				const fixed = STAGES[stage].item;
				if (fixed) check(stage, `recette fixe ${fixed}`, takes(fixed));
				for (const r of RECIPES[stage] || []) {
					const list = [["ligase", open("ligase")]];
					if (r.genes > 1) list.push(["join", open("join")]);
					if (r.box) list.push(["pack", open("pack")]);
					if (r.box === "H")
						list.push(
							["isotope", minable("I")],
							["capsule lourde", unlocked(4)],
						);
					check(stage, "recette fixe tirée", list);
				}
				// The guides: the first workshop at stage 1, the first defence when the first swarm comes.
				if (stage === 0)
					check(
						stage,
						"guide Premier atelier",
						GUIDE.map((step) => [step.pick, open(step.pick)]),
					);
				if (stage === SWARM.from)
					check(
						stage,
						"guide Ta première défense",
						DEFENSE_GUIDE.map((step) => [step.pick, open(step.pick)]),
					);
				// What a stage says it gives opens when that stage is done, not later.
				const gives = STAGES[stage].gives.toLowerCase();
				for (const [type, need] of Object.entries(NEEDS)) {
					const name = TYPES[type].name.toLowerCase();
					if (
						new RegExp(`(^|[^\\p{L}])${name}s?([^\\p{L}]|$)`, "u").test(
							gives,
						) &&
						need !== stage + 1
					)
						wrong.push(
							`stade ${stage + 1}, texte « débloque » : ${TYPES[type].name} s’ouvre au stade ${need + 1}`,
						);
				}
			}
			// A locked building cannot be taken from the tray, so its card never fires before it opens.
			G.stage = 0;
			const locked = Object.keys(NEEDS).find((type) => !open(type));
			choose(locked);
			if (tool === locked)
				wrong.push(`stade 1 : ${locked} se prend sans être ouvert`);
			return wrong;
		});
		expect(wrong).toEqual([]);
		expect(errors).toEqual([]);
	} finally {
		await browser.close();
	}
});
