// 3D curvature starts flat, and a slow frame rate with curvature on offers once to cut it (fake frame times).
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

it("starts flat, and offers once to cut a curvature that slows the display", async () => {
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
			const out = {
				flat: window.curve3d,
				shown: document.querySelector("#curve-shown").textContent,
			};
			setCurve("0.4");
			out.kept = window.curve3d;
			// Frames every `ms` from `t` for `seconds`, with curvature on unless `on` says otherwise.
			const fresh = () => ({
				asked: false,
				last: 0,
				from: 0,
				frames: 0,
				slow: 0,
			});
			const play = (w, t, ms, seconds, on = () => true) => {
				let asked = null;
				for (let now = t; now < t + seconds * 1000; now += ms)
					asked ??= watchCurve(now, on(now), w);
				return asked;
			};
			out.fast = play(fresh(), 1000, 1000 / 60, 20);
			out.slow = (() => {
				const w = fresh();
				const at = [];
				for (let now = 1000; now < 21000; now += 1000 / 30)
					if (watchCurve(now, true, w)) at.push(Math.round(now - 1000));
				return { at, again: play(w, 21000, 1000 / 30, 10) };
			})();
			out.slowFps = play(fresh(), 1000, 1000 / 30, 20);
			// Two slow seconds, then the tab hidden: the count starts over, warm-up included.
			out.hidden = (() => {
				const w = fresh();
				const first = play(w, 1000, 1000 / 30, 4.5);
				const during = play(w, 5500, 1000 / 30, 1, () => false);
				const back = [];
				for (let now = 6500; now < 16500; now += 1000 / 30)
					if (watchCurve(now, true, w)) back.push(Math.round(now - 6500));
				return { first, during, back };
			})();
			out.off = play(fresh(), 1000, 1000 / 30, 20, () => false);

			// The note: Couper sets flat and stores it; Garder only closes.
			localStorage.removeItem("strainworks-3d-curve");
			askCurve(31);
			const note = [...document.querySelectorAll("#events .event")].find((e) =>
				e.textContent.includes("31 images/s"),
			);
			out.note = note?.textContent;
			[...note.querySelectorAll(".choices button")]
				.find((b) => b.textContent === "Couper")
				.click();
			out.cut = [
				window.curve3d,
				localStorage.getItem("strainworks-3d-curve"),
				note.isConnected,
			];
			setCurve(0.5);
			localStorage.removeItem("strainworks-3d-curve");
			askCurve(40);
			const second = [...document.querySelectorAll("#events .event")].find(
				(e) => e.textContent.includes("40 images/s"),
			);
			[...second.querySelectorAll(".choices button")]
				.find((b) => b.textContent === "Garder")
				.click();
			out.keep = [
				window.curve3d,
				localStorage.getItem("strainworks-3d-curve"),
				second.isConnected,
			];
			return out;
		});
		expect(out.flat).toBe(0);
		expect(out.shown).toBe("0 %");
		expect(out.kept).toBe(0.4);
		expect(out.fast).toBe(null);
		// Warm-up 2 s, then three slow one-second windows: asked once, about 5 s in, never again.
		expect(out.slow.at.length).toBe(1);
		expect(out.slow.at[0]).toBeGreaterThanOrEqual(4900);
		expect(out.slow.at[0]).toBeLessThanOrEqual(5100);
		expect(out.slow.again).toBe(null);
		expect(out.slowFps).toBeGreaterThanOrEqual(29);
		expect(out.slowFps).toBeLessThanOrEqual(31);
		expect(out.hidden.first).toBe(null);
		expect(out.hidden.during).toBe(null);
		expect(out.hidden.back.length).toBe(1);
		expect(out.hidden.back[0]).toBeGreaterThanOrEqual(4900);
		expect(out.off).toBe(null);
		expect(out.note).toContain(
			"La courbure 3D ralentit l’affichage (31 images/s). La couper ?",
		);
		expect(out.cut).toEqual([0, "0", false]);
		expect(out.keep).toEqual([0.5, null, false]);
		expect(errors).toEqual([]);
	} finally {
		await browser.close();
	}
});
