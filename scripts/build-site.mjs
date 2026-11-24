// The static site: the prototype with every file it loads beside it, hashed, installable and playable offline.
// usage: node scripts/build-site.mjs [out directory]
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const at = (path) => resolve(root, path);
const out = resolve(process.argv[2] ?? at("dist"));
if (out === resolve(root) || (existsSync(out) && !existsSync(resolve(out, "version.json")))) {
  throw new Error(`${out} is not a build of this site: refusing to replace it`);
}

const { version } = JSON.parse(readFileSync(at("package.json"), "utf8"));
function commitOfBuild() {
  const given = process.env.BUILD_COMMIT ?? process.env.RENDER_GIT_COMMIT ?? process.env.GITHUB_SHA;
  if (given) return given;
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "unknown";
  }
}
const commit = commitOfBuild();

const digest = (data) => createHash("sha256").update(data).digest("hex").slice(0, 12);
const replaceOnce = (text, from, to) => {
  const parts = text.split(from);
  if (parts.length !== 2) throw new Error(`expected once, found ${parts.length - 1} times: ${from}`);
  return parts.join(to);
};

rmSync(out, { recursive: true, force: true });
mkdirSync(resolve(out, "assets"), { recursive: true });

const cached = [];
function asset(name, data) {
  const [, stem, ext] = /^(.+)\.(\w+)$/.exec(name);
  const path = `assets/${stem}-${digest(data)}.${ext}`;
  writeFileSync(resolve(out, path), data);
  cached.push(path);
  return path;
}

let page = readFileSync(at("prototype/index.html"), "utf8");
const inline = [...page.matchAll(/<script>([\s\S]*?)<\/script>/g)];
if (inline.length !== 1) throw new Error(`expected one inline script, found ${inline.length}`);
let app = inline[0][1];

for (const name of ["models3d", "terrain3d", "view3d", "station3d", "demo"]) {
  const path = asset(`${name}.js`, readFileSync(at(`prototype/${name}.js`)));
  app = replaceOnce(app, `script('${name}.js')`, `script('./${path}')`);
}
for (const name of ["space", "station", "planet", "globe", "globe-glow"]) {
  const path = asset(`${name}.webp`, readFileSync(at(`prototype/planet/${name}.webp`)));
  app = replaceOnce(app, `'planet/${name}.webp'`, `'./${path}'`);
}
// The music is served with the site but left out of the offline cache: it is large, and the game runs without it.
for (const name of readdirSync(at("prototype/music")).filter((f) => f.endsWith(".mp3"))) {
  if (!app.includes(`'music/${name}'`)) throw new Error(`music/${name} is in the folder but the game never plays it`);
  const data = readFileSync(at(`prototype/music/${name}`)), path = `assets/${name.replace(/\.mp3$/, "")}-${digest(data)}.mp3`;
  writeFileSync(resolve(out, path), data);
  app = app.replaceAll(`'music/${name}'`, `'./${path}'`);
}
// The sounds the code names, served like the music and left out of the offline cache.
for (const name of readdirSync(at("prototype/sounds")).filter((f) => f.endsWith(".mp3"))) {
  if (!app.includes(`'sounds/${name}'`)) continue;
  const data = readFileSync(at(`prototype/sounds/${name}`)), path = `assets/${name.replace(/\.mp3$/, "")}-${digest(data)}.mp3`;
  writeFileSync(resolve(out, path), data);
  app = app.replaceAll(`'sounds/${name}'`, `'./${path}'`);
}
// The engine comes with the site, so 3D works offline. The pinned hash still holds: it is the same file.
const engineLink = /https:\/\/cdn\.jsdelivr\.net\/npm\/babylonjs@[\d.]+\/babylon\.js/.exec(app)?.[0];
if (!engineLink) throw new Error("the engine's link was not found");
app = replaceOnce(app, engineLink, `./${asset("babylon.js", readFileSync(at("node_modules/babylonjs/babylon.js")))}`);

const appPath = asset("app.js", app);
const registerPath = asset("register.js", readFileSync(at("site/register.js")));
page = page.replace(inline[0][0], () => `<script src="./${appPath}"></script>\n<script src="./${registerPath}"></script>`);
page = replaceOnce(
  page,
  "<title>Strainworks Prototype</title>",
  `<title>Strainworks</title>
<meta name="description" content="An incremental factory and tower defense game where you write living strands of DNA.">
<meta name="theme-color" content="#070c0e">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<link rel="manifest" href="./site.webmanifest">
<link rel="icon" type="image/png" href="./icon-192.png">
<link rel="apple-touch-icon" href="./icon-180.png">`,
);
page = replaceOnce(
  page,
  `<span id="game-version">${version}</span>`,
  `<span id="game-version">${version} · ${commit.slice(0, 7)}</span>`,
);
writeFileSync(resolve(out, "index.html"), page);
cached.push("index.html");

for (const name of ["site.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png", "icon-maskable-512.png"]) {
  copyFileSync(at(`site/${name}`), resolve(out, name));
  cached.push(name);
}
copyFileSync(at("site/THIRD-PARTY.txt"), resolve(out, "THIRD-PARTY.txt"));

const worker = readFileSync(at("site/sw.js"), "utf8");
const build = digest(worker + cached.map((path) => digest(readFileSync(resolve(out, path)))).join());
writeFileSync(resolve(out, "sw.js"), replaceOnce(replaceOnce(worker, "__BUILD__", build), '["__FILES__"]', JSON.stringify(cached.map((path) => `./${path}`))));
writeFileSync(resolve(out, "version.json"), `${JSON.stringify({ version, commit, build })}\n`);
process.stdout.write(`built ${version} ${commit.slice(0, 7)}: ${cached.length} files, build ${build}\n`);
