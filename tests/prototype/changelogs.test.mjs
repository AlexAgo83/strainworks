// The release notes under the game version: listed from changelogs/README.md, each loaded when scrolled to.
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

it("lists every release under the game version and loads each one's notes when it scrolls into view", async () => {
	const browser = await launch();
	try {
		const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
		const errors = [];
		const fetched = [];
		page.on("pageerror", (error) => errors.push(error.message));
		await page.route("**/*", (route) => {
			const url = route.request().url();
			const notes = url.match(/\/changelogs\/([\w.]+\.md)$/);
			if (notes) {
				fetched.push(notes[1]);
				return route.fulfill({ body: readFileSync(new URL(`../../changelogs/${notes[1]}`, import.meta.url), "utf8"), contentType: "text/markdown" });
			}
			return url.startsWith("http://proto.test") ? route.fulfill({ body: pageHTML(), contentType: "text/html" }) : route.abort();
		});
		await page.goto("http://proto.test/prototype/");
		await page.click("#menu-toggle");
		await page.click('#menu [data-go="changelogs"]');
		await page.waitForFunction(() => document.querySelector("#changelogs section .notes li"));
		const seen = await page.evaluate(() => ({
			versions: [...document.querySelectorAll("#changelogs h3")].map((h) => h.textContent),
			first: document.querySelector("#changelogs section .notes").textContent,
		}));
		const listed = [...readFileSync(new URL("../../changelogs/README.md", import.meta.url), "utf8").matchAll(/\[`([\d.]+)`\]/g)].map((m) => m[1]);
		expect(seen.versions).toEqual(listed);
		expect(seen.first).toContain("Release date");
		// Only what is on screen is loaded, not the whole history.
		expect(fetched.filter((name) => name !== "README.md").length).toBeLessThan(listed.length);
		await page.screenshot({ path: process.env.CHANGELOG_SHOT || "/dev/null" }).catch(() => {});
		await page.evaluate(() => { const box = document.getElementById("changelogs"); box.scrollTop = box.scrollHeight; });
		await page.waitForFunction(() => document.querySelector("#changelogs section:last-child .notes:not(:has(.loading))"));
		expect(errors).toEqual([]);
	} finally {
		await browser.close();
	}
});
