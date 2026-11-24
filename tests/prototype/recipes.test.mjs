// Each game draws three base genes; every stage's recipes are built on them, and the core eats them all along.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

it("builds each stage on the base genes, counts each item for its own, and keeps them in the save", async () => {
	const browser = await launch();
	try {
		const page = await browser.newPage({
			viewport: { width: 1280, height: 800 },
			recipes: true,
			line: false,
		});
		const errors = [];
		page.on("pageerror", (error) => errors.push(error.message));
		await page.route("**/*", (route) =>
			route.request().url().startsWith("http://proto.test")
				? route.fulfill({ body: pageHTML(), contentType: "text/html" })
				: route.abort(),
		);
		await page.goto("http://proto.test/prototype/");
		const out = await page.evaluate(() => {
			begin();
			paused = true;
			const bases = new Set(Object.values(DEPOSIT));
			const look = () => ({
				stage: G.stage,
				items: G.goals.map((g) => g.item),
				fair: G.goals.every((g) =>
					contentOf(g.item)
						.match(/.{3}/g)
						.every(
							(gene) =>
								[...gene].every((b) => bases.has(b)) &&
								(g.item.startsWith("A:") || !G.families.includes(gene)),
						),
				),
				distinct: new Set(G.goals.map((g) => g.item)).size === G.goals.length,
				more: document.querySelector("#order .more")?.textContent,
			});
			const first = { ...look(), base: G.base.slice() };
			// The core counts a stage's items only while it gets the base genes it eats.
			const feed = () => {
				for (const gene of eaten()) eat(gene);
			};
			for (let i = 0; i < 100; i++) eat(G.base[0]);
			const stages = [];
			for (let stage = 1; stage < STAGES.length; stage++) {
				refresh();
				stages.push(look());
				const [a, b] = G.goals;
				feed();
				// Another recipe's item does not count for this one; a recipe met takes no more.
				eat(a.item);
				const counted = [a.fed, b?.fed ?? 0];
				for (const g of G.goals)
					while (g.fed < g.count) {
						feed();
						eat(g.item);
					}
				stages[stages.length - 1].counted = counted;
			}
			paintMoments();
			const shown = !document.querySelector("#victory").hidden;
			document.querySelector("#free-play").click();
			const after = {
				stage: G.stage,
				goals: G.goals.length,
				won: G.won != null,
				shown,
				free: document.querySelector("#victory").hidden,
			};
			return {
				first,
				stages,
				after,
				antidote: stages[2].items.includes(`A:${opposite(G.mutant)}`),
				heavy: stages[3].items.some((i) => i.startsWith("H:")),
				valid: checkGame(JSON.parse(JSON.stringify(G))),
			};
		});
		expect(out.first.base).toHaveLength(3);
		expect(out.first).toMatchObject({ stage: 0, items: [out.first.base[0]] });
		expect(out.stages.map((s) => s.items.length)).toEqual([1, 2, 2, 3, 3]);
		expect(out.stages.every((s) => s.fair && s.distinct)).toBe(true);
		expect(out.stages.map((s) => s.more)).toEqual([
			undefined,
			"+1",
			"+1",
			"+2",
			"+2",
		]);
		expect(
			out.stages.every((s) => s.counted[0] === 1 && s.counted[1] === 0),
		).toBe(true);
		// Stage 2 asks a strand of the first two base genes, stage 3 its capsule.
		const [a, b] = out.first.base;
		expect(out.stages[0].items).toEqual([a + b]);
		expect(out.stages[1].items[0]).toBe(`T:${a}${b}`);
		expect(out.antidote).toBe(true);
		expect(out.heavy).toBe(true);
		expect(out.after).toEqual({
			stage: 6,
			goals: 0,
			won: true,
			shown: true,
			free: true,
		});
		expect(out.valid).toBe(true);
		expect(errors).toEqual([]);
	} finally {
		await browser.close();
	}
});
