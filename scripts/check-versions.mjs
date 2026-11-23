import { existsSync, readFileSync } from "node:fs";

const { version } = JSON.parse(readFileSync("package.json", "utf8"));
const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
const notes = `CHANGELOGS_${version.replaceAll(".", "_")}.md`;
const wrong = [];
if (lock.version !== version || lock.packages[""].version !== version) wrong.push(`package-lock.json is not ${version}`);
if (!existsSync(`changelogs/${notes}`)) wrong.push(`changelogs/${notes} is missing`);
else if (!readFileSync(`changelogs/${notes}`, "utf8").startsWith(`# Strainworks ${version}\n`)) wrong.push(`${notes} has another heading`);
if (!readFileSync("changelogs/README.md", "utf8").includes(notes)) wrong.push(`changelogs/README.md does not link ${notes}`);
if (!readFileSync("README.md", "utf8").includes(`badge/version-${version}-`)) wrong.push(`README.md's version badge is not ${version}`);
if (!readFileSync("prototype/index.html", "utf8").includes(`<span id="game-version">${version}</span>`)) wrong.push(`the game menu does not say version ${version}`);

if (wrong.length) {
  process.stderr.write(`Version check failed:\n- ${wrong.join("\n- ")}\n`);
  process.exit(1);
}
process.stdout.write(`Version check OK (${version})\n`);
