// item_016: stage 2 starts the guide "Ta première défense" as the first swarm is announced; built step by step, it
// checks each on the game, and the brief counts the swarm down with its bearing and antidote.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

it("walks the first defence guide as the first swarm is announced", async () => {
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
		const seen = await page.evaluate(() => {
			begin();
			paused = true;
			if (G.guide) G.guide.step = GUIDE.length;
			G.dna = 1000;
			grow();
			step(STEP);
			paintGuide();
			refresh();
			const steps = [];
			const read = () => ({
				name: document.getElementById("guide-name").textContent,
				no: document.getElementById("guide-no").textContent,
				title: document.getElementById("guide-title").textContent,
			});
			steps.push(read());
			const brief = document.querySelector("#brief .title").textContent;
			const versus = document.querySelectorAll("#brief .gene").length;
			const x = CORE.x + 5, y = CORE.y;
			const turret = put("turret", x, y, 0);
			paintGuide();
			steps.push(read());
			turret.ammo = { [opposite(G.swarm.gene)]: 4 };
			paintGuide();
			steps.push(read());
			put("gate", x - 3, y, 1);
			G.wires.push({ a: key(turret.x, turret.y), b: key(x - 3, y), hp: 30, left: 0, order: 1, color: 0 });
			paintGuide();
			steps.push(read());
			put("wall", x + 1, y, 0);
			paintGuide();
			return { steps, brief, versus, done: G.guide.step, hidden: document.getElementById("guide").hidden };
		});
		expect(seen.steps.map((s) => [s.name, s.title])).toEqual([
			["Ta première défense", "Pose une tourelle"],
			["Ta première défense", "Nourris-la de gènes"],
			["Ta première défense", "Relie-la par un nerf"],
			["Ta première défense", "Ajoute un mur"],
		]);
		expect(seen.steps[0].no).toBe("étape 1 sur 4");
		expect(seen.brief).toMatch(/^Essaim (2:5\d|3:0\d)$/);
		expect(seen.versus).toBe(1);
		expect(seen.done).toBe(4);
		expect(seen.hidden).toBe(true);
		expect(errors).toEqual([]);
	} finally {
		await browser.close();
	}
});
