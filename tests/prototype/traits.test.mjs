// Every piece declares its traits in one table, so a new piece cannot silently miss one.
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

const page = readFileSync(new URL("../../prototype/index.html", import.meta.url), "utf8");
const block = (start, end) => page.slice(page.indexOf(start), page.indexOf(end, page.indexOf(start)));

it("gives every building type, the core included, a line in the trait table", () => {
  const types = [...block("const TYPES = {", "\n};").matchAll(/^ {2}([a-z0-9]+):\{name:/gm)].map((m) => m[1]);
  const traits = Object.fromEntries([...block("const TRAITS = {", "\n};").matchAll(/^ {2}([a-z0-9]+):'([^']*)'/gm)].map((m) => [m[1], m[2]]));
  expect(types.length).toBeGreaterThan(30);
  expect(Object.keys(traits).sort()).toEqual([...types, "core"].sort());
  const used = new Set([...page.matchAll(/hasTrait\([^,]+, '(\w+)'\)/g)].map((m) => m[1]));
  const declared = new Set(Object.values(traits).flatMap((words) => words.split(" ").filter(Boolean)));
  expect([...declared].sort()).toEqual([...used].sort());
});
