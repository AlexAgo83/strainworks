// The core's panel (docs/design/core-panel-v2): one demand at a time behind tabs, its recipe drawn as a schema
// with what is made in green, what is missing dashed, a machine set wrong in red with what to do; never a letter.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

const open = async (browser, viewport) => {
	const page = await browser.newPage({ viewport, recipes: true, line: false });
	const errors = [];
	page.on("pageerror", (error) => errors.push(error.message));
	await page.route("**/*", (route) =>
		route.request().url().startsWith("http://proto.test")
			? route.fulfill({ body: pageHTML(), contentType: "text/html" })
			: route.abort(),
	);
	await page.goto("http://proto.test/prototype/");
	// Stage 4 of a drawn game: magazines of the antidote and a capsule. Genes and carbon from two cysts go into an
	// encapsulator set on capsules, so the magazines are blocked by it; one gene of the capsule is made already.
	await page.evaluate(() => {
		begin();
		paused = true;
		G.stage = 3;
		G.goals = drawGoals(3);
		const magazines = G.goals.find((g) => g.item.startsWith("A:")).item;
		const y = CORE.y + 6,
			x0 = CORE.x - 6;
		put("cyst", x0 - 1, y, 1).stock = Array(20).fill(magazines.slice(2));
		put("cyst", x0, y - 1, 2).stock = Array(20).fill("K");
		put("pack", x0, y, 1).box = "T";
		const capsule = G.goals.find((g) => g.item.startsWith("T:")).item;
		put("ligase", x0, y + 4, 1).last = capsule.slice(2, 5);
		for (let i = 0; i < 60; i++) step(0.05);
		const core = coreCell();
		select(key(core.x, core.y));
		refresh();
		paintInfo();
	});
	return { page, errors };
};
const read = (page) =>
	page.evaluate(() => {
		const sheet = document.querySelector("#sheet");
		const card = document.querySelector("#card").getBoundingClientRect();
		return {
			tabs: [...sheet.querySelectorAll(".demand")].map((t) => ({ selected: t.getAttribute("aria-selected"), alert: t.classList.contains("alert") })),
			title: sheet.querySelector(".asked h4 > span:last-child")?.textContent,
			bad: [...sheet.querySelectorAll(".recipe .machine.bad")].map((m) => m.getAttribute("aria-label")),
			setting: [...sheet.querySelectorAll(".recipe text")].map((t) => t.textContent).find((t) => t.includes("réglé")),
			warn: sheet.querySelector(".warn")?.textContent,
			warnGene: sheet.querySelector(".warn .gene") != null,
			have: sheet.querySelectorAll(".recipe .node.have").length,
			miss: sheet.querySelectorAll(".recipe .node.miss").length,
			sides: [...sheet.querySelectorAll(".recipe text")].map((t) => t.textContent).filter((t) => ["gauche", "derrière", "droite"].includes(t)),
			heart: sheet.querySelector(".recipe .heart") != null,
			letters: /(?<![\p{L}])[SFCN]{3}(?![\p{L}])/u.test(sheet.textContent),
			story: sheet.querySelector(".story") != null,
			inside: card.top >= 0 && card.bottom <= innerHeight + 1 && card.left >= 0 && card.right <= innerWidth + 1,
			whole: document.querySelector("#card").scrollHeight <= document.querySelector("#card").clientHeight + 1,
			flat: document.querySelector("#card").scrollWidth <= document.querySelector("#card").clientWidth + 1,
		};
	});

it("shows one demand, flags the blocked one and draws its recipe with the wrong machine in red", async () => {
	const browser = await launch();
	try {
		const { page, errors } = await open(browser, { width: 1280, height: 720 });
		const first = await read(page);
		// The magazines come first and are blocked by the encapsulator on capsules.
		expect(first.tabs).toEqual([
			{ selected: "true", alert: true },
			{ selected: "false", alert: false },
		]);
		expect(first.title).toBe("Chargeur");
		expect(first.bad).toEqual(["Encapsuleur"]);
		expect(first.setting).toBe("réglé sur capsule ✗");
		expect(first.warn).toContain("passe en chargeur");
		expect(first.warnGene).toBe(true);
		expect(first.sides).toEqual(["gauche", "derrière", "droite"]);
		expect(first.miss).toBeGreaterThan(0);
		expect(first.heart).toBe(true);
		expect(first.letters).toBe(false);
		// The story waits behind the info button, and the panel fits the screen.
		expect(first.story).toBe(false);
		expect(first.inside).toBe(true);
		expect(first.whole).toBe(true);
		// The second tab: the capsule of a strand, one of its genes made already, nothing set wrong for it.
		await page.click('#sheet .demand[data-goal="1"]');
		const second = await read(page);
		expect(second.tabs.map((t) => t.selected)).toEqual(["false", "true"]);
		expect(second.title).toBe("Capsule");
		expect(second.bad).toEqual([]);
		expect(second.warn).toBeUndefined();
		expect(second.have).toBeGreaterThan(0);
		expect(second.sides).toHaveLength(6);
		expect(second.letters).toBe(false);
		expect(second.whole).toBe(true);
		// The info button opens the stage page, and again closes it.
		await page.click('#sheet [data-sheet-tab="info"]');
		expect((await read(page)).story).toBe(true);
		await page.click('#sheet [data-sheet-tab="info"]');
		expect((await read(page)).story).toBe(false);
		expect(errors).toEqual([]);
	} finally {
		await browser.close();
	}
});

it("fits a phone without a sideways scroll", async () => {
	const browser = await launch();
	try {
		const { page, errors } = await open(browser, { width: 390, height: 844 });
		const phone = await read(page);
		expect(phone.inside).toBe(true);
		expect(phone.flat).toBe(true);
		expect(phone.letters).toBe(false);
		expect(errors).toEqual([]);
	} finally {
		await browser.close();
	}
});
