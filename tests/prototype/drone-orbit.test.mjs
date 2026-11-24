// Idle drones orbit the core as if charging, outside its footprint, each on its own path; given a job they ease back
// onto their real path. Drawing only: the simulation's drones do not move.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

it("draws idle drones orbiting outside the core, apart, and eases one back when it gets a job", async () => {
	const browser = await launch();
	try {
		const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, line: false });
		const errors = [];
		page.on("pageerror", (error) => errors.push(error.message));
		await page.route("**/*", (route) =>
			route.request().url().startsWith("http://proto.test")
				? route.fulfill({ body: pageHTML(), contentType: "text/html" })
				: route.abort(),
		);
		await page.goto("http://proto.test/prototype/");
		const before = await page.evaluate(() => {
			begin();
			paused = true;
			return JSON.stringify(G.drones.map((d) => [d.x, d.y, d.h, d.job]));
		});
		await page.waitForTimeout(3000);
		const look = () =>
			page.evaluate(() => {
				const core = coreCell(), mid = centreOf(core), half = (sizeOf(core) / 2) * Math.SQRT2;
				return {
					half,
					poses: G.drones.map((d) => { const p = dronePose(d); return { far: Math.hypot(p.x - mid.x, p.y - mid.y), h: p.h, charge: p.charge, x: p.x, y: p.y }; }),
					sim: JSON.stringify(G.drones.map((d) => [d.x, d.y, d.h, d.job])),
				};
			});
		const idle = await look();
		expect(idle.poses.length).toBeGreaterThanOrEqual(2);
		for (const p of idle.poses) {
			expect(p.far).toBeGreaterThan(idle.half);
			expect(p.charge).toBeGreaterThan(0.9);
			expect(p.h).toBeGreaterThan(1);
		}
		const [a, b] = idle.poses;
		expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThan(0.5);
		expect(idle.sim).toBe(before);
		// A job: that drone eases back onto its real path, the other keeps orbiting.
		await page.evaluate(() => { G.drones[0].job = "test"; });
		await page.waitForTimeout(3000);
		const busy = await look();
		expect(busy.poses[0].charge).toBeLessThan(0.1);
		expect(busy.poses[1].charge).toBeGreaterThan(0.9);
		expect(errors).toEqual([]);
	} finally {
		await browser.close();
	}
});
