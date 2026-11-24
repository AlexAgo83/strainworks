// The grand victory (item_028): a region, one hexagon and all its neighbours, purified. Shown once, marked on the
// planet while in progress, and out of free mode's reach.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

it("shows the region's progress, crowns the hexagon that completes it once, and keeps free mode out", async () => {
	const browser = await launch();
	try {
		const page = await browser.newPage({
			planet: true,
			viewport: { width: 1366, height: 768 },
			reducedMotion: "reduce",
		});
		const errors = [];
		page.on("pageerror", (error) => errors.push(error.message));
		await page.route("**/*", (route) => {
			const url = route.request().url();
			if (!url.startsWith("http://proto.test")) return route.abort();
			if (url.endsWith(".webp"))
				return route.fulfill({ status: 404, body: "" });
			return route.fulfill({ body: pageHTML(), contentType: "text/html" });
		});
		await page.goto("http://proto.test/prototype/");
		const out = await page.evaluate(() => {
			const out = {};
			const hexOf = (n) =>
				CELLS_OF_GLOBE.map((_, id) => id).find(
					(id) =>
						id !== DEMO_HEX &&
						neighbours(id).length === n &&
						!neighbours(id).includes(DEMO_HEX),
				);
			// Six of a hexagon's seven purified: the planet says one is missing and marks it.
			const home = hexOf(6);
			const [last, ...rest] = neighbours(home);
			const list = readList();
			list.planet.first = home;
			for (const id of [home, ...rest]) list.planet.purified[id] = 1;
			writeList(list);
			openPlanet();
			drawGrid();
			pickHex(home);
			out.progress = document.querySelector("#planet-region").textContent;
			out.needed = document.querySelectorAll("#hexes .needed").length;
			out.card = document.querySelector("#unlock-title").textContent;
			closeCard();

			// The hatching on the last one: the grand victory, once.
			foundGame(last);
			paused = true;
			G.won = G.time;
			showVictory();
			closeCard();
			out.title = document.querySelector("#victory h1").textContent;
			out.said = document.querySelector("#victory-planet").textContent;
			out.crowned = readList().planet.victory?.center === home;

			// Free mode: the station falls, the victory stays; another hatching is a plain one.
			G.over = true;
			save();
			out.kept = readList().planet.victory?.center === home;
			slotKey = null;
			const more = neighbours(last).find(
				(n) =>
					!readList().games[n] &&
					!purified(readList().planet, n) &&
					n !== DEMO_HEX,
			);
			foundGame(more);
			paused = true;
			G.won = G.time;
			showVictory();
			out.again = document.querySelector("#victory h1").textContent;
			closeCard();

			// Round a pentagon, a region is six.
			const pent = hexOf(5);
			const five = readList();
			five.planet = {
				v: 1,
				first: pent,
				purified: Object.fromEntries(
					[pent, ...neighbours(pent)].map((id) => [id, 1]),
				),
				mutations: {},
			};
			writeList(five);
			const best = bestRegion(readList().planet);
			out.pentagon = [best.need, best.missing.length];
			return out;
		});
		expect(out.progress).toContain("6 / 7");
		expect(out.progress).toContain("l’hexagone marqué");
		expect(out.needed).toBeGreaterThanOrEqual(1);
		expect(out.card).toBe("Grande victoire");
		expect(out.title).toBe("Grande victoire");
		expect(out.said).toMatch(
			/^Une région entière est purifiée : 7 hexagones\./,
		);
		expect(out.crowned).toBe(true);
		expect(out.kept).toBe(true);
		expect(out.again).toBe("Éclosion");
		expect(out.pentagon).toEqual([6, 0]);
		expect(errors).toEqual([]);
	} finally {
		await browser.close();
	}
});
