// The planet's conquest (item_025, item_029): a hatching purifies its hexagon and opens its neighbours, new
// stations go only on open ground, free mode cannot undo it, and older planets come over without losing a game.
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

it("purifies a hatched hexagon, opens its neighbours and founds only on open ground", async () => {
	const browser = await launch();
	try {
		const { page, errors } = await open(browser);
		const out = await page.evaluate(() => {
			const out = {};
			const counts = CELLS_OF_GLOBE.map((_, id) => neighbours(id).length);
			out.shape = [
				counts.filter((n) => n === 5).length,
				counts.filter((n) => n === 6).length,
			];
			out.mutual = CELLS_OF_GLOBE.every((_, id) =>
				neighbours(id).every((n) => neighbours(n).includes(id)),
			);

			// Before any hatching, every hexagon is open.
			foundGame();
			paused = true;
			const home = slotId;
			const far = CELLS_OF_GLOBE.map((_, id) => id).find(
				(id) =>
					id !== home &&
					id !== DEMO_HEX &&
					!neighbours(home).includes(id) &&
					!neighbours(id).some((n) => neighbours(home).includes(n)),
			);
			out.openBefore = isOpen(readList().planet, far);

			// The hatching: purified, saved at once, its neighbours opened.
			G.won = G.time;
			showVictory();
			const planet = readList().planet;
			out.purified = purified(planet, home);
			out.first = planet.first === home;
			out.opened = neighbours(home).every((n) => isOpen(planet, n));
			out.farLocked = !isOpen(planet, far);
			out.victoryNote = document.querySelector("#victory-planet").textContent;
			out.card = [
				document.querySelector("#unlock").open,
				document.querySelector("#unlock-title").textContent,
			];
			closeCard();

			// Free mode loses the station: the hexagon stays purified.
			G.over = true;
			save();
			out.keptAfterLoss = purified(readList().planet, home);

			// A new station: refused far away, accepted beside.
			slotKey = null;
			out.farRefused = foundGame(far);
			out.farNote = document.querySelector("#slot-note").textContent;
			const beside = neighbours(home).find(
				(n) => n !== DEMO_HEX && !readList().games[n],
			);
			out.besideFounded = foundGame(beside) && slotId === beside;
			paused = true;
			slotKey = null;
			out.anyFounded = foundGame() && isOpen(readList().planet, slotId);
			return out;
		});
		expect(out.shape).toEqual([12, 150]);
		expect(out.mutual).toBe(true);
		expect(out.openBefore).toBe(true);
		expect([out.purified, out.first, out.opened, out.farLocked]).toEqual([
			true,
			true,
			true,
			true,
		]);
		expect(out.victoryNote).toMatch(
			/Hexagone purifié : [56] hexagones voisins s’ouvrent/,
		);
		expect(out.card).toEqual([true, "Purification"]);
		expect(out.keptAfterLoss).toBe(true);
		expect(out.farRefused).toBe(false);
		expect(out.farNote).toContain("encore infecté");
		expect(out.besideFounded).toBe(true);
		expect(out.anyFounded).toBe(true);

		// On the planet: purified, open and infected hexagons drawn apart; an infected one cannot be founded on.
		const screen = await page.evaluate(() => {
			openPlanet();
			drawGrid();
			const home = Number(Object.keys(readList().planet.purified)[0]);
			const far = CELLS_OF_GLOBE.map((_, id) => id).find(
				(id) => !isOpen(readList().planet, id),
			);
			pickHex(far);
			return {
				classes: ["purified", "open", "locked"].map(
					(c) => document.querySelectorAll(`#hexes .${c}`).length > 0,
				),
				kicker: document.querySelector("#slot-kicker").textContent,
				found: [...document.querySelectorAll("#slot-actions button")].some(
					(b) => b.textContent === "Fonder une station",
				),
				home,
			};
		});
		expect(screen.classes).toEqual([true, true, true]);
		expect(screen.kicker).toBe("Hexagone infecté");
		expect(screen.found).toBe(false);
		expect(errors).toEqual([]);
	} finally {
		await browser.close();
	}
});

it("brings an older planet over once, and a whole planet back through a file", async () => {
	const browser = await launch();
	try {
		const { page, errors } = await open(browser);
		const out = await page.evaluate(() => {
			const out = {};
			// Two games written by an older version: one won, one running; no planet state yet.
			foundGame();
			paused = true;
			G.won = 120;
			const won = slotId;
			save();
			slotKey = null;
			foundGame();
			paused = true;
			const running = slotId;
			save();
			slotKey = null;
			const list = JSON.parse(localStorage.getItem("strainworks-planet"));
			delete list.planet;
			for (const g of Object.values(list.games)) delete g.won;
			localStorage.setItem("strainworks-planet", JSON.stringify(list));

			const moved = readList();
			out.migrated = [
				purified(moved.planet, won),
				purified(moved.planet, running),
				Object.keys(moved.games).length,
			];
			out.noMutation = Object.keys(moved.planet.mutations).length;
			const once = localStorage.getItem("strainworks-planet");
			readList();
			out.idempotent = localStorage.getItem("strainworks-planet") === once;
			out.runningPlays = openGame(running) && slotId === running;
			paused = true;
			slotKey = null;

			// A whole planet exported, then brought into an emptied one: same hexagons, same conquest.
			const saved = readList();
			const file = JSON.stringify({
				format: FILE.all,
				v: 1,
				games: Object.entries(saved.games).map(([hex, g]) => ({
					name: g.name,
					hex: Number(hex),
					game: JSON.parse(localStorage.getItem(g.key)),
				})),
				planet: { ...saved.planet, mutations: { drone: 1 } },
			});
			for (const g of Object.values(saved.games))
				localStorage.removeItem(g.key);
			localStorage.removeItem("strainworks-planet");
			const { found } = readFileGames(file);
			graftGames(found, null);
			const back = readList();
			out.restored = [
				purified(back.planet, won),
				Boolean(back.games[won]),
				Boolean(back.games[running]),
				back.planet.mutations.drone,
			];
			return out;
		});
		expect(out.migrated).toEqual([true, false, 2]);
		expect(out.noMutation).toBe(0);
		expect(out.idempotent).toBe(true);
		expect(out.runningPlays).toBe(true);
		expect(out.restored).toEqual([true, true, true, 1]);
		expect(errors).toEqual([]);
	} finally {
		await browser.close();
	}
});
