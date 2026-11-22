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

export async function launch() {
  const browser = await chromium.launch({ headless: true });
  return {
    close: () => browser.close(),
    async newContext(options) {
      const context = await browser.newContext(options);
      await context.addInitScript(seedRandom);
      return context;
    },
    async newPage(options) {
      const page = await browser.newPage(options);
      await page.addInitScript(seedRandom);
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
