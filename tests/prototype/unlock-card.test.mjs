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

it("meets each rule of a running game once, at its moment, and lists every concept in the help", async () => {
	const browser = await launch();
	try {
		const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, cards: true, recipes: true });
		const errors = [];
		page.on("pageerror", (error) => errors.push(error.message));
		await serve(page);
		await page.goto("http://proto.test/prototype/");
		const opened = () => page.evaluate(() => (document.getElementById("unlock").open ? document.getElementById("unlock").dataset.type : null));
		const meet = async (setup) => {
			await page.evaluate(setup);
			await page.waitForFunction(() => document.getElementById("unlock").open, null, { timeout: 3000 });
			const type = await opened();
			const later = await page.evaluate(() => document.getElementById("unlock").textContent.includes("Concepts"));
			await page.click("#unlock-ok");
			return [type, later];
		};
		await page.evaluate(() => { begin(); G.breaches = []; G.enemies = []; paused = false; G.time = 10; G.baseAt = {}; });
		// A drawn game, hungry: the base genes; then the stage's mechanic, a swarm, a nest awake, an encapsulator set wrong.
		const met = [];
		met.push(await meet(() => {}));
		met.push(await meet(() => { grow(); }));
		met.push(await meet(() => { G.swarm = { wave: 0, start: G.time, next: G.time + 100, from: { x: CORE.x + 30, y: CORE.y }, gene: "SFN", size: 3 }; }));
		met.push(await meet(() => { G.breaches.push({ x: CORE.x + 40, y: CORE.y, r: 6, state: "wake", genes: ["SFN"], left: 4, total: 4, wave: 0, pending: 0, ended: 0, form: 0 }); }));
		expect(met).toEqual([["concept-genes", true], ["concept-mechanic", true], ["concept-swarm", true], ["concept-nest", true]]);
		// Met once: the same moments again open nothing.
		await page.waitForTimeout(600);
		expect(await opened()).toBe(null);
		// The fourth harvester on a full deposit: its card, and the refusal still said.
		const cap = await page.evaluate(() => {
			paused = true;
			const field = FIELDS.find((f) => patchOf(f).list.filter((p) => !cellAt(p.x, p.y)).length > HARVESTERS_PER_DEPOSIT);
			const free = patchOf(field).list.filter((p) => !cellAt(p.x, p.y));
			while (harvestersOn(field) < HARVESTERS_PER_DEPOSIT) { const p = free.shift(); put("mine", p.x, p.y, 0); }
			G.dna = 1000; G.open = true;
			choose("mine");
			place(free[0].x, free[0].y);
			return [document.getElementById("unlock").dataset.type, ui.refusedAt > 0];
		});
		expect(cap).toEqual(["concept-cap", true]);
		await page.click("#unlock-ok");
		// The help, Concepts: every one, each with its scene drawn.
		await page.evaluate(() => document.getElementById("help").click());
		const help = await page.evaluate(() => {
			const ids = [...document.querySelectorAll("#concept-cards [data-concept]")].map((b) => b.dataset.concept);
			const lit = ids.map((id) => {
				showConcept(id, false);
				const scene = document.getElementById("unlock-scene"), g = scene.getContext("2d");
				let n = 0;
				for (const t of [0.15, 0.6]) {
					drawConcept(g, id, t);
					const px = g.getImageData(0, 0, scene.width, scene.height).data;
					for (let i = 0; i < px.length; i += 4) if (px[i] + px[i + 1] + px[i + 2] > 300) n++;
				}
				return [id, n > 100];
			});
			closeCard();
			return { ids, lit };
		});
		expect(help.ids).toEqual(expect.arrayContaining(["genes", "mechanic", "swarm", "nest", "cap", "pack", "purify", "mutation", "ring", "region"]));
		for (const [id, lit] of help.lit) expect([id, lit]).toEqual([id, true]);
		expect(errors).toEqual([]);
	} finally {
		await browser.close();
	}
});
