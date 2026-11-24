// A deposit feeds three harvesters (item_018): the fourth is refused with the reason, in the preview too, and the
// way round it, a splitter, is named. A harvester already there can still be turned by placing it again.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

it("refuses a fourth harvester on one deposit and says why", async () => {
	const browser = await launch();
	try {
		const page = await browser.newPage({ line: false });
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
			G.dna = 1000;
			const field = FIELDS.find((f) => f[0] === "S");
			const cells = patchOf(field).list.filter((p) => !cellAt(p.x, p.y) && placeable(p.x, p.y));
			choose("mine");
			for (const p of cells.slice(0, 3)) place(p.x, p.y);
			const built = harvestersOn(field);
			const fourth = cells[3];
			hovered = screenAt({ x: fourth.x + 0.5, y: fourth.y + 0.5 });
			const ghost = preview();
			hovered = null;
			place(fourth.x, fourth.y);
			const again = cells[0];
			place(again.x, again.y);
			return {
				built,
				fourth: Boolean(cellAt(fourth.x, fourth.y)),
				said: document.getElementById("refusal").textContent,
				ghost: JSON.stringify(ghost),
				again: cellAt(again.x, again.y)?.type,
			};
		});
		expect(out.built).toBe(3);
		expect(out.fourth).toBe(false);
		expect(out.said).toContain("Ce gisement nourrit déjà 3 récolteurs");
		expect(out.said).toContain("diviseur");
		expect(out.ghost).toContain("Gisement plein");
		expect(out.again).toBe("mine");
		expect(errors).toEqual([]);
	} finally {
		await browser.close();
	}
});
