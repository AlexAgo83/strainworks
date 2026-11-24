// Démonter over a zone (item_017): a drag from bare ground asks every building in the rectangle to come down,
// a drag from a building still follows its line only, and Escape gives the zone up.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

it("takes down a whole rectangle from bare ground, and only a line from a building", async () => {
	const browser = await launch();
	try {
		const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
		const errors = [];
		page.on("pageerror", (error) => errors.push(error.message));
		await page.route("**/*", (route) =>
			route.request().url().startsWith("http://proto.test")
				? route.fulfill({ body: pageHTML(), contentType: "text/html" })
				: route.abort(),
		);
		await page.goto("http://proto.test/");
		// Two rows of three belts, a gap of bare ground round them.
		const o = await page.evaluate(() => {
			begin();
			paused = true;
			G.breaches = [];
			if (G.guide) G.guide.step = GUIDE.length;
			paintGuide();
			const x = CORE.x + 8, y = CORE.y + 8;
			for (const j of [0, 2]) for (let i = 0; i < 3; i++) put("belt", x + i, y + j, 1);
			Object.assign(cam, { x: x + 1.5, y: y + 1.5, zoom: 40 });
			choose("erase");
			return { x, y };
		});
		const at = (x, y) => page.evaluate(([x, y]) => screenAt({ x: x + 0.5, y: y + 0.5 }), [x, y]);
		const marked = () =>
			page.evaluate(([x, y]) => {
				const out = [];
				for (const j of [0, 2]) for (let i = 0; i < 3; i++) out.push(cellAt(x + i, y + j)?.out != null);
				return out;
			}, [o.x, o.y]);
		const draw = async (from, to, giveUp = false) => {
			const a = await at(...from), b = await at(...to);
			await page.mouse.move(a.x, a.y);
			await page.mouse.down();
			await page.mouse.move(b.x, b.y, { steps: 12 });
			const said = await page.evaluate(() => document.querySelector("#message").textContent);
			if (giveUp) await page.keyboard.press("Escape");
			await page.mouse.up();
			return said;
		};

		// Given up with Escape: nothing asked.
		await draw([o.x - 1, o.y - 1], [o.x + 3, o.y + 3], true);
		expect(await marked()).toEqual([false, false, false, false, false, false]);
		// From a building: its line only, the other row stays.
		await draw([o.x, o.y], [o.x + 2, o.y]);
		expect(await marked()).toEqual([true, true, true, false, false, false]);
		// From bare ground: the whole rectangle.
		const said = await draw([o.x - 1, o.y - 1], [o.x + 3, o.y + 3]);
		expect(said).toContain("Démontage de zone : 6 bâtiments");
		expect(await marked()).toEqual([true, true, true, true, true, true]);
		expect(errors).toEqual([]);
	} finally {
		await browser.close();
	}
});
