// The statistics name why a production stopped (item_015): each cause built from scratch, read from the simulation.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

it("names the cause of each stopped production", async () => {
	const browser = await launch();
	try {
		const page = await browser.newPage({
			line: false,
			viewport: { width: 1440, height: 900 },
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
			const lab = () => {
				begin();
				paused = true;
				G.open = true;
				G.stage = 3;
				G.breaches = [];
				G.enemies = [];
				G.cells = {};
				put("core", CORE.x, CORE.y, 0);
			};
			const run = (seconds) => {
				for (let i = 0; i < Math.round(seconds / STEP); i++) step(STEP);
			};
			// A Ligase facing east at (20, 80): its first input comes from the north, down a column of cells.
			const ligase = (above) => {
				lab();
				const c = put("ligase", 20, 80, 1);
				above.forEach((type, i) => {
					const cell = put(type, 20, 79 - i, 2);
					if (type === "cyst") cell.stock = Array(40).fill("C");
				});
				return c;
			};
			const out = {};

			out.nothing = stopReason(ligase([]));
			out.redLight = (() => {
				const c = ligase(["belt", "gate", "cyst"]);
				G.cells["20,78"].open = false;
				run(12);
				return stopReason(c);
			})();
			out.nerve = (() => {
				const c = ligase(["belt", "gate", "cyst"]);
				const gun = put("turret", 24, 76, 0);
				wireUp(gun, G.cells["20,78"]);
				G.wires[0].left = 0;
				sense();
				run(12);
				return stopReason(c);
			})();
			out.blocked = (() => {
				const c = ligase([]);
				c.item = "CNF";
				run(12);
				return stopReason(c);
			})();
			out.blockedAtLight = (() => {
				const c = ligase([]);
				c.item = "CNF";
				put("belt", 21, 80, 1).item = "CNF";
				put("gate", 22, 80, 1).open = false;
				run(12);
				return stopReason(c);
			})();
			out.noCarbon = (() => {
				lab();
				put("cyst", 19, 80, 1).stock = Array(40).fill("FCS");
				const p = put("pack", 20, 80, 1);
				p.box = "T";
				run(12);
				return stopReason(p);
			})();
			out.wrongSetting = (() => {
				lab();
				G.goals = [{ item: "T:NNF", count: 40, fed: 0 }];
				put("cyst", 19, 80, 1).stock = Array(30)
					.fill(0)
					.flatMap(() => ["NNF", "SFS"]);
				put("cyst", 20, 79, 2).stock = Array(60).fill("K");
				const p = put("pack", 20, 80, 1);
				p.box = "T";
				for (let x = 21; x < 26; x++) put("belt", x, 80, 1);
				put("cyst", 26, 80, 1);
				run(30);
				return [packWarning(p) !== null, stopReason(p)];
			})();
			// A working line has no reason.
			out.working = (() => {
				const c = ligase([]);
				c.made = [G.time];
				return stopReason(c);
			})();

			// The production tab writes the reason under the stopped line, and the problems tab reuses it.
			ligase([]);
			run(12);
			showStats(true);
			document.querySelector('#stats [data-tab="prod"]').click();
			out.prodRow = document.querySelector(
				"#stats-body .row.prod .why",
			)?.textContent;
			document.querySelector('#stats [data-tab="logi"]').click();
			out.problemRow = document.querySelector(
				'#stats-body [data-at="20,80"]',
			)?.textContent;
			return out;
		});
		expect(out.nothing).toBe("rien n’arrive");
		expect(out.redLight).toBe("feu fermé");
		expect(out.nerve).toBe("en attente d’un nerf");
		expect(out.blocked).toBe("sortie bloquée");
		expect(out.blockedAtLight).toBe("feu fermé");
		expect(out.noCarbon).toBe("pas de carbone");
		expect(out.wrongSetting).toEqual([true, "mauvais réglage"]);
		expect(out.working).toBe(null);
		expect(out.prodRow).toBe("rien n’arrive");
		expect(out.problemRow).toContain("rien n’arrive");
		expect(errors).toEqual([]);
	} finally {
		await browser.close();
	}
});
