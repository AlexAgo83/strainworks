// Every piece declares its traits in one table, so a new piece cannot silently miss one.
import { readdirSync, readFileSync } from "node:fs";
import { expect, it } from "vitest";

const page = readFileSync(new URL("../../src/sim/sim.ts", import.meta.url), "utf8");
// Traits are read by the simulation and by the interface alike.
const sources = ["sim", "game"].flatMap((dir) => readdirSync(new URL(`../../src/${dir}/`, import.meta.url)).map((name) => readFileSync(new URL(`../../src/${dir}/${name}`, import.meta.url), "utf8")));
const block = (start, end) => page.slice(page.indexOf(start), page.indexOf(end, page.indexOf(start)));

it("gives every building type, the core included, a line in the trait table", () => {
  const types = [...block("const TYPES = {", "\n};").matchAll(/^ {2}([a-z0-9]+):\{name:/gm)].map((m) => m[1]);
  const traits = Object.fromEntries([...block("const TRAITS = {", "\n};").matchAll(/^ {2}([a-z0-9]+):'([^']*)'/gm)].map((m) => [m[1], m[2]]));
  expect(types.length).toBeGreaterThan(30);
  expect(Object.keys(traits).sort()).toEqual([...types, "core"].sort());
  const used = new Set(sources.flatMap((text) => [...text.matchAll(/hasTrait\([^,]+, '(\w+)'\)/g)].map((m) => m[1])));
  const declared = new Set(Object.values(traits).flatMap((words) => words.split(" ").filter(Boolean)));
  expect([...declared].sort()).toEqual([...used].sort());
});
