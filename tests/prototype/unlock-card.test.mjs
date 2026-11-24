// The unlock card (docs/design/unlock-card): the first pick of a building a stage opened shows it at work, what it is
// for and its keys, once, remembered with the settings; the help shows any building's card again.
import { expect, it } from "vitest";
import { launch, pageHTML, pickTool } from "./harness.mjs";

const serve = (page) =>
	page.route("**/*", (route) =>
		route.request().url().startsWith("http://proto.test")
			? route.fulfill({ body: pageHTML(), contentType: "text/html" })
			: route.abort(),
	);

it("opens once on the first pick of an unlocked building, and again from the help", async () => {
	const browser = await launch();
	try {
		const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, cards: true });
		const errors = [];
		page.on("pageerror", (error) => errors.push(error.message));
		await serve(page);
		await page.goto("http://proto.test/prototype/");
		await page.evaluate(() => { G.stage = 1; paused = true; refresh(); });
		// A building open from the start shows no card.
		await pickTool(page, "ligase");
		expect(await page.evaluate(() => document.getElementById("unlock").open)).toBe(false);
		// The Encapsuleur, opened by stage 1: its card, its name, its keys, its scene drawn.
		await pickTool(page, "pack");
		const card = await page.evaluate(() => {
			const box = document.getElementById("unlock"), scene = document.getElementById("unlock-scene");
			const pixels = scene.getContext("2d").getImageData(0, 0, scene.width, scene.height).data;
			let lit = 0;
			for (let i = 0; i < pixels.length; i += 4) if (pixels[i] + pixels[i + 1] + pixels[i + 2] > 300) lit++;
			return {
				open: box.open,
				kicker: document.getElementById("unlock-kicker").textContent,
				title: document.getElementById("unlock-title").textContent,
				what: document.getElementById("unlock-what").textContent,
				keys: [...document.querySelectorAll("#unlock-keys kbd")].map((k) => k.textContent),
				lit,
				later: box.textContent.includes("Bâtiments"),
				kept: JSON.parse(localStorage.getItem("strainworks-cards")),
			};
		});
		expect(card).toMatchObject({ open: true, kicker: "Nouveau bâtiment", title: "Encapsuleur", later: true, kept: ["pack"] });
		expect(card.what).toContain("carbone");
		expect(card.keys).toEqual(["R", "H", "Clic"]);
		expect(card.lit).toBeGreaterThan(200);
		await page.click("#unlock-ok");
		expect(await page.evaluate(() => document.getElementById("unlock").open)).toBe(false);
		// Picked again, no card: it was seen.
		await pickTool(page, "ligase");
		await pickTool(page, "pack");
		expect(await page.evaluate(() => document.getElementById("unlock").open)).toBe(false);
		// The help, Bâtiments: every building, and the Ligase's card on demand.
		await page.evaluate(() => document.getElementById("help").click());
		const listed = await page.evaluate(() => [...document.querySelectorAll("#building-cards [data-card]")].map((b) => b.dataset.card));
		expect(listed).toEqual(expect.arrayContaining(["mine", "belt", "ligase", "pack", "turret", "gate", "lab"]));
		await page.click('#building-cards [data-card="ligase"]');
		const again = await page.evaluate(() => ({
			open: document.getElementById("unlock").open,
			kicker: document.getElementById("unlock-kicker").textContent,
			title: document.getElementById("unlock-title").textContent,
		}));
		expect(again).toEqual({ open: true, kicker: "Bâtiment", title: "Ligase" });
		expect(errors).toEqual([]);
	} finally {
		await browser.close();
	}
});

it("has a scene and a text for every building, in French and English", async () => {
	const browser = await launch();
	try {
		const page = await browser.newPage({ lang: "en" });
		const errors = [];
		page.on("pageerror", (error) => errors.push(error.message));
		await serve(page);
		await page.goto("http://proto.test/prototype/");
		const out = await page.evaluate(() => {
			const all = FAMILIES.flatMap((f) => f[3]);
			const missing = all.filter((type) => !CARD_TYPES.includes(type));
			const shown = [];
			for (const type of all) {
				showCard(type, false);
				shown.push([type, document.getElementById("unlock-what").textContent]);
			}
			closeCard();
			return { missing, shown };
		});
		expect(out.missing).toEqual([]);
		for (const [, what] of out.shown) expect(what).toMatch(/^[A-Z][^àéèêç’]*$/);
		expect(errors).toEqual([]);
	} finally {
		await browser.close();
	}
});
