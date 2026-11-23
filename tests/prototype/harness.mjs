import { readFileSync } from "node:fs";
import { chromium } from "playwright";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

export const pageHTML = () => read("../../prototype/index.html");
export const savedGame = (version) => read(`../fixtures/saves/${version}.json`);

// The prototype draws families and spawn points at random: a seed makes each run the same run.
function seedRandom() {
  let seed = 0x5eed;
  Math.random = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// The tools live in folded families: each is opened before its names are measured.
function layoutProbe() {
  // Where a large harvester fits in a patch, the last one to the south east.
  window.squareIn = (field) => {
    const { cells, list } = patchOf(field);
    const fits = list.filter((c) => [[1, 0], [0, 1], [1, 1]].every(([i, j]) => cells.has(key(c.x + i, c.y + j))));
    return fits.sort((a, b) => b.x + b.y - (a.x + a.y))[0];
  };
  window.clippedTools = () => {
    const was = ui.family;
    const bad = new Set();
    for (const [id] of FAMILIES) {
      openFamily(id);
      for (const b of document.querySelectorAll("#tools .pod")) {
        const box = b.getBoundingClientRect();
        if (!box.width) continue;
        const name = b.querySelector(".name");
        const side = b.classList.contains("side") && getComputedStyle(name).position === "absolute";
        if (b.scrollWidth > b.clientWidth + 12 || (!side && name.scrollWidth > name.clientWidth + 1) || box.left < -1 || box.right > innerWidth + 1 || box.top < -1 || box.bottom > innerHeight + 1) bad.add(name.textContent);
      }
    }
    openFamily(was);
    return [...bad];
  };
}

// The way a finger picks a tool: its family, then the tool.
export async function pickTool(page, type) {
  const pod = page.locator(`#tools [data-type="${type}"]`);
  if (!(await pod.isVisible())) {
    const family = await page.evaluate((id) => FAMILY_OF[id], type);
    await page.locator(`#tools [data-family="${family}"]`).click();
  }
  await pod.click();
}

export async function fromMenu(page, id) {
  if (!(await page.locator("#menu").isVisible())) await page.click("#menu-toggle");
  await page.click(`#${id}`);
}

// The rules are tested on ground already seen, whatever is built where. The fog has its own test.
function seenEverywhere() {
  document.addEventListener("DOMContentLoaded", () => {
    if (typeof known === "function") window.known = () => true;
  });
}

// The game opens in 3D by default. The rules are tested in 2D, unless a test picks the view itself.
function flatUnlessPicked() {
  try {
    if (!localStorage.getItem("strainworks-view")) localStorage.setItem("strainworks-view", "2d");
  } catch (_) {}
}

// The rules are tested in French, the language they were written in, unless a test picks one.
function frenchUnlessPicked() {
  try {
    if (!localStorage.getItem("strainworks-lang")) localStorage.setItem("strainworks-lang", "fr");
  } catch (_) {}
}

// Tests of the game step past the opening screen into the last game played, or a first one.
function pastThePlanet() {
  document.addEventListener("DOMContentLoaded", () => {
    if (typeof resumeLast === "function") resumeLast();
  });
}

export async function launch() {
  const browser = await chromium.launch({ headless: true });
  return {
    close: () => browser.close(),
    async newContext({ fog = false, planet = false, view3d = false, lang = "fr", ...options } = {}) {
      const context = await browser.newContext(options);
      if (!fog) await context.addInitScript(seenEverywhere);
      if (!planet) await context.addInitScript(pastThePlanet);
      if (!view3d) await context.addInitScript(flatUnlessPicked);
      if (lang) await context.addInitScript(lang === "fr" ? frenchUnlessPicked : (picked) => localStorage.setItem("strainworks-lang", picked), lang);
      await context.addInitScript(seedRandom);
      await context.addInitScript(layoutProbe);
      return context;
    },
    async newPage({ fog = false, planet = false, view3d = false, lang = "fr", ...options } = {}) {
      const page = await browser.newPage(options);
      if (!fog) await page.addInitScript(seenEverywhere);
      if (!planet) await page.addInitScript(pastThePlanet);
      if (!view3d) await page.addInitScript(flatUnlessPicked);
      if (lang) await page.addInitScript(lang === "fr" ? frenchUnlessPicked : (picked) => localStorage.setItem("strainworks-lang", picked), lang);
      await page.addInitScript(seedRandom);
      await page.addInitScript(layoutProbe);
      return page;
    },
  };
}

// page.evaluate hands back JSON text: parsed, a snapshot diff names the field that changed.
export function recorder() {
  const entries = [];
  const parse = (value) => {
    if (typeof value !== "string" || !/^[[{]/.test(value)) return value;
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  };
  return { entries, report: (...values) => entries.push(values.map(parse)) };
}
