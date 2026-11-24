// The quick fixes from the first play test: sound, small screens, what ranks give, keys, harvesters and bridges.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

async function open(browser, viewport = { width: 1280, height: 720 }) {
	const page = await browser.newPage({ line: false, viewport });
	const errors = [];
	page.on("pageerror", (error) => errors.push(error.message));
	await page.route("**/*", (route) =>
		route.request().url().startsWith("http://proto.test")
			? route.fulfill({ body: pageHTML(), contentType: "text/html" })
			: route.abort(),
	);
	await page.goto("http://proto.test/prototype/");
	await page.evaluate(() => {
		window.lab = () => {
			begin();
			paused = true;
			G.open = true;
			G.stage = 3;
			G.breaches = [];
			G.dna = 5000;
		};
		window.run = (seconds) => {
			for (let i = 0; i < Math.round(seconds / STEP); i++) step(STEP);
		};
	});
	return { page, errors };
}

it("keeps sound and play settings, and steps a hidden game only when asked", async () => {
	const browser = await launch();
	try {
		const { page, errors } = await open(browser);
		const out = await page.evaluate(async () => {
			lab();
			paused = false;
			const slider = document.getElementById("master-volume");
			slider.value = "40";
			slider.dispatchEvent(new Event("input"));
			const master = sound.master;
			Object.defineProperty(document, "hidden", {
				configurable: true,
				get: () => true,
			});
			const t0 = G.time;
			await new Promise((r) => setTimeout(r, 1300));
			const paused0 = G.time - t0;
			document.getElementById("background-play").click();
			const t1 = G.time;
			await new Promise((r) => setTimeout(r, 1300));
			return {
				master,
				saved: JSON.parse(localStorage.getItem("strainworks-sound")),
				hiddenOff: paused0,
				hiddenOn: G.time - t1,
				music: music.volume,
			};
		});
		expect(out.master).toBe(0.4);
		expect(out.saved).toEqual({ master: 0.4, background: true });
		expect(out.hiddenOff).toBe(0);
		expect(out.hiddenOn).toBeGreaterThan(0.5);
		expect(out.music).toBe(0.3);
		expect(errors).toEqual([]);
	} finally {
		await browser.close();
	}
});

it("fits the core's sheet between the top and the dock, on a laptop and a phone held sideways", async () => {
	const browser = await launch();
	try {
		for (const viewport of [
			{ width: 1280, height: 720 },
			{ width: 844, height: 390 },
			{ width: 390, height: 844 },
		]) {
			const { page, errors } = await open(browser, viewport);
			await page.evaluate(() => {
				lab();
				select(key(CORE.x, CORE.y));
				refresh();
			});
			await page.waitForTimeout(500);
			const out = await page.evaluate(() => {
				const card = document.getElementById("card").getBoundingClientRect(),
					tools = document.getElementById("tools").getBoundingClientRect();
				const speed = document.getElementById("speed").getBoundingClientRect();
				const atSpeed = document.elementFromPoint(
					speed.left + speed.width / 2,
					speed.top + speed.height / 2,
				);
				return {
					top: card.top,
					bottom: card.bottom,
					dock: tools.top,
					height: innerHeight,
					speedSeen: atSpeed?.closest("#speed") != null,
				};
			});
			expect(
				out.top,
				`${viewport.width}x${viewport.height}`,
			).toBeGreaterThanOrEqual(0);
			expect(
				out.bottom,
				`${viewport.width}x${viewport.height}`,
			).toBeLessThanOrEqual(Math.max(out.dock, 0) + 2);
			expect(out.speedSeen, `${viewport.width}x${viewport.height}`).toBe(true);
			expect(errors).toEqual([]);
			await page.close();
		}
	} finally {
		await browser.close();
	}
});

it("says what a rank gives, keeps Empty, mirrors and turns with H and V, and turns on a second tap only", async () => {
	const browser = await launch();
	try {
		const { page, errors } = await open(browser);
		const out = await page.evaluate(() => {
			lab();
			const y = CORE.y + 8,
				lig = put("ligase", CORE.x, y, 0);
			lig.ports = [["S"], [], ["F"]];
			select(key(lig.x, lig.y));
			const texts = () =>
				[...document.querySelectorAll("#actions button")].map(
					(b) => b.textContent,
				);
			const rank = texts().find((t) => t.startsWith("Passer en MK2"));
			const keysShown = texts().filter((t) => /\(\w+\)$/.test(t));
			[...document.querySelectorAll("#actions button")]
				.find((b) => b.textContent === "Vider")
				.click();
			const emptyStays = texts().includes("Vider");
			const press = (code) =>
				document.dispatchEvent(
					new KeyboardEvent("keydown", { code, bubbles: true }),
				);
			press("KeyH");
			const mirrored = lig.flip === true;
			press("KeyV");
			const turned = lig.dir;
			// A belt in hand: a first tap on a belt selects it, the second turns it.
			const belt = put("belt", CORE.x + 3, y, 1);
			select(null);
			choose("belt");
			place(belt.x, belt.y);
			const first = belt.dir;
			place(belt.x, belt.y);
			return {
				rank,
				keysShown,
				emptyStays,
				mirrored,
				turned,
				first,
				second: belt.dir,
			};
		});
		expect(out.rank).toMatch(/1 → 2\/s$/);
		expect(out.keysShown.length).toBeGreaterThanOrEqual(2);
		expect(out.emptyStays).toBe(true);
		expect(out.mirrored).toBe(true);
		expect(out.turned).toBe(2);
		expect(out.first).toBe(1);
		expect(out.second).toBe(2);
		expect(errors).toEqual([]);
	} finally {
		await browser.close();
	}
});

it("feeds a large harvester only into lines drawn from it, and gives a dismantled bridge's line back", async () => {
	const browser = await launch();
	try {
		const { page, errors } = await open(browser);
		const out = await page.evaluate(() => {
			lab();
			const spot = squareIn(OUTER.find((f) => f[0] !== "K"));
			put("borer", spot.x, spot.y, 0).size = 2;
			// Along its north side, a line fed from behind; from its west side, a line drawn away from it.
			const along = [];
			put("cyst", spot.x - 2, spot.y - 1, 1).stock = [];
			for (let x = spot.x - 1; x <= spot.x + 2; x++)
				along.push(put("belt", x, spot.y - 1, 1));
			const alongEnd = put("cyst", spot.x + 3, spot.y - 1, 1);
			put("belt", spot.x - 1, spot.y + 1, 3);
			const awayEnd = put("cyst", spot.x - 2, spot.y + 1, 3);
			run(10);
			// A bridge on a line, taken down on its own.
			const y = CORE.y + 10,
				line = [];
			for (let x = CORE.x - 3; x <= CORE.x + 3; x++)
				line.push(put("belt", x, y, 1));
			choose("bridge");
			place(CORE.x, y);
			run(20);
			const bridged = cellAt(CORE.x, y)?.type;
			choose("erase");
			place(CORE.x, y);
			run(30);
			const after = cellAt(CORE.x, y);
			return {
				along: alongEnd.stock.length,
				away: awayEnd.stock.length,
				bridged,
				after: after && `${after.type} ${after.dir}`,
			};
		});
		expect(out.along).toBe(0);
		expect(out.away).toBeGreaterThan(5);
		expect(out.bridged).toBe("bridge");
		expect(out.after).toBe("belt 1");
		expect(errors).toEqual([]);
	} finally {
		await browser.close();
	}
});

it("cycles the speed through x1, x3 and x6, and names the next one", async () => {
	const browser = await launch();
	try {
		const { page, errors } = await open(browser);
		const out = await page.evaluate(() => {
			const b = document.getElementById("speed"),
				seen = [];
			for (let i = 0; i < 4; i++) {
				seen.push(`${b.textContent} ${b.title}`);
				b.click();
			}
			return seen;
		});
		expect(out).toEqual([
			"×1 Vitesse ×1 : touche pour ×3",
			"×3 Vitesse ×3 : touche pour ×6",
			"×6 Vitesse ×6 : touche pour ×1",
			"×1 Vitesse ×1 : touche pour ×3",
		]);
		expect(errors).toEqual([]);
	} finally {
		await browser.close();
	}
});
