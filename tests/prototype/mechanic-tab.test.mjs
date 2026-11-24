// item_019: the core's sheet names the mechanic a stage asks for, counts it, and opens the card that teaches it.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

it("shows the stage's mechanic as a tab, with its count and the card to learn it", async () => {
	const browser = await launch();
	try {
		const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, recipes: true, line: false });
		const errors = [];
		page.on("pageerror", (error) => errors.push(error.message));
		await page.route("**/*", (route) =>
			route.request().url().startsWith("http://proto.test")
				? route.fulfill({ body: pageHTML(), contentType: "text/html" })
				: route.abort(),
		);
		await page.goto("http://proto.test/prototype/");
		await page.evaluate(() => {
			begin();
			paused = true;
			grow();
			G.needs[0].fed = 12;
			const core = coreCell();
			select(key(core.x, core.y));
			refresh();
			paintInfo();
		});
		await page.click("#sheet .demand.need");
		const tab = await page.evaluate(() => ({
			label: document.querySelector("#sheet .demand.need small").textContent,
			title: document.querySelector("#sheet .asked h4 > span:last-child").textContent,
			count: document.querySelector("#sheet .asked .count").textContent,
			what: document.querySelector("#sheet .need-what").textContent,
		}));
		expect(tab).toEqual({ label: "Trieur", title: "Trieur", count: "12 / 30", what: expect.stringContaining("trié") });
		await page.click('#sheet [data-card="sort"]');
		expect(await page.evaluate(() => [document.getElementById("unlock").open, document.getElementById("unlock-title").textContent])).toEqual([true, "Trieur"]);
		await page.click("#unlock-ok");
		await page.click('#sheet [data-sheet-tab="info"]');
		expect(await page.evaluate(() => document.querySelector("#sheet .stage-page").textContent)).toContain("Ce stade demandeTrieur");
		expect(errors).toEqual([]);
	} finally {
		await browser.close();
	}
});
