// The core's card tells what the game is for, where the organism stands, and which base genes the core hungers for.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

it("shows the final goal, the stage, and the base genes the core eats", async () => {
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
			const card = () => {
				select(key(CORE.x, CORE.y));
				paintSheet(coreCell());
				return document.getElementById("card");
			};
			const first = card();
			const before = {
				story: first.querySelector(".story")?.textContent,
				stage: first.textContent.includes("Stade 1 sur 6"),
				genes: first.querySelectorAll(".base-genes span.hungry").length,
				hunger: first.querySelector(".unit.hungry")?.textContent,
				hungerGene: first.querySelector(".unit.hungry .gene")?.getAttribute("aria-label"),
			};
			eat(G.base[0]);
			const after = card();
			return {
				base: G.base,
				before,
				fed: after.querySelectorAll(".base-genes span.fed").length,
				hungerAfter: after.querySelector(".unit.hungry") != null,
				order: document.getElementById("order").textContent,
			};
		});
		expect(out.before.story).toMatch(/^La souche est malade/);
		expect(out.before.stage).toBe(true);
		expect(out.before.genes).toBe(1);
		expect(out.before.hunger).toContain("livraisons comptées à moitié");
		expect(out.before.hunger).not.toContain(out.base[0]);
		expect(out.before.hungerGene).toBeTruthy();
		expect(out.fed).toBe(1);
		expect(out.hungerAfter).toBe(false);
		expect(errors).toEqual([]);
	} finally {
		await browser.close();
	}
});
