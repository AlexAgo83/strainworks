// The guide teaches this game's first base gene (item_017): on drawn games its harvesters, inputs and words follow
// G.base[0], and played as it shows, it feeds the core that gene.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

it("walks a drawn game's first base gene to a fed core", async () => {
	const browser = await launch();
	try {
		const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, line: false, recipes: true });
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
			startGuide();
			paused = true;
			const bases = GUIDE.filter((s) => s.base).map((s) => s.base).join("");
			paintGuide();
			// innerText: the letters write() keeps hidden behind each drawing are not read.
			const words = document.querySelector("#guide-why").innerText;
			// Belts along the guide's trace, as a player draws them: a bridge where it crosses a line.
			const lay = (trace) => {
				const cells = trace.map((p) => ({ x: Math.floor(p.x), y: Math.floor(p.y) }));
				const into = (c) =>
					[0, 1, 2, 3].find((d) => {
						const n = cellAt(c.x + DX[d], c.y + DY[d]);
						return n && (n.type === "ligase" || n.type === "core") && n !== cellAt(cells[0].x, cells[0].y);
					}) ?? 0;
				for (let i = 1; i < cells.length; i++) {
					const a = cells[i], b = cells[i + 1], there = cellAt(a.x, a.y);
					if (there?.type === "belt") { delete G.cells[key(a.x, a.y)]; put("bridge", a.x, a.y, 0); continue; }
					if (there) continue;
					put("belt", a.x, a.y, !b || cellAt(b.x, b.y)?.type === "core" ? into(a) : b.x > a.x ? 1 : b.x < a.x ? 3 : b.y > a.y ? 2 : 0);
				}
			};
			const mines = [];
			for (let guard = 0; guard < 20 && G.guide.step < GUIDE.length; guard++) {
				const want = GUIDE[G.guide.step];
				paintGuide();
				if (want.pick && want.pick !== "belt") { choose(want.pick); paintGuide(); }
				const spot = ui.guidePoint;
				if (want.pick === "mine" || want.place) {
					const c = put(want.pick, Math.floor(spot.x), Math.floor(spot.y), heading);
					if (want.pick === "mine") mines.push(matterUnder(c));
				} else if (ui.guideTrace) lay(ui.guideTrace);
				paused = false;
				for (let i = 0; i < 600; i++) step(STEP);
				paused = true;
				paintGuide();
			}
			return { gene: G.base[0], bases, words, mines: mines.join(""), step: G.guide.step, fed: G.goals[0].fed, asked: G.goals[0].item };
		});
		expect(out.bases).toBe(out.gene + out.gene);
		expect(out.mines).toBe(out.gene);
		expect(out.words).toContain("premier gène de base de cette partie");
		expect(out.words).not.toMatch(/(?<![\p{L}])[SFCN]{3}(?![\p{L}])/u);
		expect(out.asked).toBe(out.gene);
		expect(out.step).toBe(9);
		expect(out.fed).toBeGreaterThan(0);
		expect(errors).toEqual([]);
	} finally {
		await browser.close();
	}
});
