// Strain mutations (item_026): each hatching offers three from a designed pool, the one kept applies to every later
// station on the planet, and none skips a stage.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

async function open(browser, viewport = { width: 1366, height: 768 }) {
	const page = await browser.newPage({
		planet: true,
		viewport,
		reducedMotion: "reduce",
	});
	const errors = [];
	page.on("pageerror", (error) => errors.push(error.message));
	await page.route("**/*", (route) => {
		const url = route.request().url();
		if (!url.startsWith("http://proto.test")) return route.abort();
		if (url.endsWith(".webp")) return route.fulfill({ status: 404, body: "" });
		return route.fulfill({ body: pageHTML(), contentType: "text/html" });
	});
	await page.goto("http://proto.test/prototype/");
	return { page, errors };
}

it("applies every mutation of the pool at a new station's start, none skipping a stage", async () => {
	const browser = await launch();
	try {
		const { page, errors } = await open(browser);
		const out = await page.evaluate(() => {
			const start = () => {
				slotKey = null;
				foundGame();
				paused = true;
				const mine =
					Object.values(G.cells).find((c) => c.type === "mine") ||
					put("mine", CORE.x + 8, CORE.y + 8, 1);
				return {
					drones: G.drones.length,
					dna: G.dna,
					first: G.goals
						? G.goals[0].count - G.goals[0].fed
						: STAGES[0].count - G.fed,
					turret: G.cells[`${CORE.x + 3},${CORE.y}`]?.type ?? null,
					harvest: perSecond(mine),
					mk2: rankCost("belt", 2),
					mk3: rankCost("belt", 3),
					stage: G.stage,
					kept: { ...(G.mutations || {}) },
				};
			};
			const plain = start();
			const list = readList();
			list.planet.mutations = {
				drone: 2,
				dna: 3,
				hunger: 1,
				turret: 1,
				harvest: 2,
				rank: 1,
			};
			writeList(list);
			const strong = start();
			// Saved and opened again, the game keeps its own copy.
			save();
			const id = slotId;
			slotKey = null;
			openGame(id);
			return { plain, strong, reopened: { ...G.mutations } };
		});
		const { plain, strong } = out;
		expect(strong.drones).toBe(plain.drones + 2);
		expect(strong.dna).toBe(plain.dna + 180);
		expect([plain.first, strong.first]).toEqual([100, 70]);
		expect([plain.turret, strong.turret]).toEqual([null, "turret"]);
		expect(strong.harvest / plain.harvest).toBeCloseTo(1.3, 5);
		expect(strong.mk2).toBe(Math.round(plain.mk2 * 0.7));
		expect(strong.mk3).toBe(plain.mk3);
		expect(strong.stage).toBe(0);
		expect(out.reopened).toEqual(strong.kept);
		expect(errors).toEqual([]);
	} finally {
		await browser.close();
	}
});

it("offers three at the hatching, keeps the one chosen, and never draws one at its cap", async () => {
	const browser = await launch();
	try {
		const { page, errors } = await open(browser);
		const out = await page.evaluate(() => {
			const out = {};
			foundGame();
			paused = true;
			G.won = G.time;
			showVictory();
			closeCard();
			out.button = !document.querySelector("#won-mutation").hidden;
			document.querySelector("#won-mutation").click();
			const cards = [...document.querySelectorAll("#mutation-cards .card")];
			out.cards = cards.map((c) => c.dataset.mutation);
			out.takeBefore = document.querySelector("#mutation-take").disabled;
			cards[1].click();
			out.takeLabel = document.querySelector("#mutation-take").textContent;
			document.querySelector("#mutation-take").click();
			const planet = readList().planet;
			out.held = planet.mutations;
			out.offerAfter = planet.offer ?? null;
			out.dialog = document.querySelector("#mutations").open;
			out.card = [
				document.querySelector("#unlock").open,
				document.querySelector("#unlock-title").textContent,
			];
			out.buttonAfter = document.querySelector("#won-mutation").hidden;
			closeCard();

			// Capped ones are never drawn; two hatchings owe two choices.
			const list = readList();
			list.planet.mutations = { drone: 2, dna: 3, hunger: 1, turret: 1 };
			list.planet.offer = ["harvest", "rank"];
			list.planet.owed = 2;
			writeList(list);
			openMutations();
			out.capped = [...document.querySelectorAll("#mutation-cards .card")]
				.map((c) => c.dataset.mutation)
				.sort();
			document.querySelector('#mutation-cards [data-mutation="rank"]').click();
			document.querySelector("#mutation-take").click();
			out.next = [...document.querySelectorAll("#mutation-cards .card")].map(
				(c) => c.dataset.mutation,
			);
			out.nextOpen = document.querySelector("#mutations").open;
			return out;
		});
		expect(out.button).toBe(true);
		expect(out.cards.length).toBe(3);
		expect(new Set(out.cards).size).toBe(3);
		expect(out.takeBefore).toBe(true);
		expect(out.takeLabel).toMatch(/^Prendre /);
		expect(out.held).toEqual({ [out.cards[1]]: 1 });
		expect(out.offerAfter).toBe(null);
		expect(out.dialog).toBe(false);
		expect(out.card).toEqual([true, "Mutation de souche"]);
		expect(out.buttonAfter).toBe(true);
		expect(out.capped).toEqual(["harvest", "rank"]);
		expect(out.next).toEqual(["harvest"]);
		expect(out.nextOpen).toBe(true);
		expect(errors).toEqual([]);
	} finally {
		await browser.close();
	}
});
