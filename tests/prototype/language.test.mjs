// The game in English and French: every text has its English line, nothing French shows in English,
// the choice is asked once, kept, and changed from the menu.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

const serve = (page) =>
  page.route("**/*", (route) =>
    route.request().url().startsWith("http://proto.test") ? route.fulfill({ body: pageHTML(), contentType: "text/html" }) : route.abort(),
  );

// The French keys of the source: L('…') and L`…${x}…`, a template's holes written {}.
function keysOf(source) {
  const keys = new Set();
  for (const m of source.matchAll(/(?<![\w$.])L\('((?:[^'\\]|\\.)*)'\)/g)) keys.add(m[1].replace(/\\(.)/g, "$1"));
  for (const m of source.matchAll(/(?<![\w$.])L`/g)) {
    let i = m.index + 2, key = "", depth = 0;
    // Inside ${…}, skip to its closing brace, past nested strings and templates.
    const skip = () => {
      depth = 1;
      while (depth) {
        const c = source[i++];
        if (c === "{") depth++;
        else if (c === "}") depth--;
        else if (c === "'" || c === '"') while (source[i++] !== c) if (source[i - 1] === "\\") i++;
        else if (c === "`") {
          while (source[i] !== "`") {
            if (source[i] === "\\") i += 2;
            else if (source[i] === "$" && source[i + 1] === "{") { i += 2; const outer = depth; skip(); depth = outer; }
            else i++;
          }
          i++;
        }
      }
    };
    while (source[i] !== "`") {
      if (source[i] === "\\") { key += source[i + 1]; i += 2; }
      else if (source[i] === "$" && source[i + 1] === "{") { i += 2; skip(); key += "{}"; }
      else key += source[i++];
    }
    keys.add(key);
  }
  return keys;
}

it("has an English line for every French text of the game", async () => {
  const source = pageHTML();
  const script = source.slice(source.indexOf("<script>"));
  const browser = await launch();
  try {
    const page = await browser.newPage({ lang: "en" });
    await serve(page);
    await page.goto("http://proto.test/prototype/");
    const english = await page.evaluate(() => Object.keys(EN));
    const missing = [...keysOf(script)].filter((key) => !english.includes(key));
    expect(missing).toEqual([]);
  } finally {
    await browser.close();
  }
});

it("shows no French in English", async () => {
  const browser = await launch();
  try {
    const page = await browser.newPage({ lang: "en", viewport: { width: 1440, height: 900 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await serve(page);
    await page.goto("http://proto.test/prototype/");
    const texts = await page.evaluate(async () => {
      const seen = [];
      const grab = () => {
        seen.push(document.body.innerText);
        for (const el of document.querySelectorAll("[title], [aria-label]")) seen.push(el.getAttribute("title") || "", el.getAttribute("aria-label") || "");
      };
      const frame = () => new Promise((done) => requestAnimationFrame(() => done()));
      begin();
      paused = true;
      grab();
      document.querySelector("#open-all").click();
      const machines = ["mine", "ligase", "pack", "join", "turret", "sting", "maw", "cyst", "bridge", "split", "split2", "sort", "gate", "radar", "wall", "pump"];
      machines.forEach((type, i) => {
        put(type, 30 + 3 * i, 30, 1);
      });
      for (const [id] of FAMILIES) { openFamily(id); await frame(); grab(); }
      for (const i of machines.keys()) { select(`${30 + 3 * i},30`); showActions(); refresh(); await frame(); grab(); }
      select(key(CORE.x, CORE.y)); showActions(); refresh(); await frame(); grab();
      showMenu(true); await frame(); grab(); showMenu(false);
      showStats(true);
      for (const tab of ["prod", "eco", "def", "threat", "logi"]) { document.querySelector(`#stats [data-tab="${tab}"]`).click(); await frame(); grab(); }
      showStats(false);
      document.querySelector("#commands").showModal(); grab(); document.querySelector("#commands").close();
      return { seen, missing: [...L.missing], lang: document.documentElement.lang };
    });
    expect(errors).toEqual([]);
    expect(texts.lang).toBe("en");
    expect(texts.missing).toEqual([]);
    // French letters, or its little words, give a leftover away. "Strainworks" and gene letters are not words.
    const french = /[éèêàùçœ’]|\b(le|la|les|des|une|du|pour|avec|sur|dans|est|pas|tapis|gène|gènes|brin|cœur|stade|carbone|chantier|brèche|repérée)\b/i;
    const leftovers = [...new Set(texts.seen.flatMap((text) => text.split("\n")).map((line) => line.trim()).filter((line) => line !== "Français" && french.test(line)))];
    expect(leftovers).toEqual([]);
  } finally {
    await browser.close();
  }
});

it("asks for the language once, keeps it, and changes it from the menu", async () => {
  const browser = await launch();
  try {
    const page = await browser.newPage({ lang: null, planet: true });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await serve(page);
    await page.goto("http://proto.test/prototype/");
    expect(await page.locator("#lang-pick").isVisible()).toBe(true);
    await page.click("#pick-en");
    await page.waitForFunction(() => document.documentElement.lang === "en");
    expect(await page.evaluate(() => [localStorage.getItem("strainworks-lang"), document.documentElement.lang, LANG])).toEqual(["en", "en", "en"]);
    expect(await page.locator("#lang-pick").isVisible()).toBe(false);
    // From the menu, back to French: the page reopens in French.
    await page.evaluate(() => showMenu(true));
    await page.click("#lang-fr");
    await page.waitForFunction(() => document.documentElement.lang === "fr" && document.readyState === "complete");
    expect(await page.evaluate(() => [localStorage.getItem("strainworks-lang"), LANG, document.querySelector("#lang-fr").getAttribute("aria-pressed")])).toEqual(["fr", "fr", "true"]);
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
