// The demo base, step by step: each step is a list of pieces placed the way a player would, on the real map.
// scripts/build-demo.mjs reads it, checks every placement, plays the base and measures every chain.
// Coordinates are map cells; dir: 0 north, 1 east, 2 south, 3 west. mk is the rank.

// A run of belts from one cell to another, straight, all facing dir.
export const run = (x0, y0, x1, y1, dir, mk = 2) => {
  const out = [], dx = Math.sign(x1 - x0), dy = Math.sign(y1 - y0);
  for (let x = x0, y = y0; ; x += dx, y += dy) {
    out.push({ t: "belt", x, y, d: dir, mk });
    if (x === x1 && y === y1) break;
  }
  return out;
};

export const STEPS = [
  {
    name: "Récolte",
    // A starting player's harvest: one large harvester on each field round the core, everything at its first rank,
    // each on its own belt to a cyst at the door of the factory to come. No belt runs near the core.
    pieces: [
      // C, south-west field: out of its top, straight north up x=35.
      { t: "borer", x: 35, y: 56, d: 0, mk: 1 },
      ...run(35, 55, 35, 43, 0, 1),
      { t: "cyst", x: 35, y: 42, d: 0, mk: 1, tag: "kyste C" },
      // S, south field: out west along y=63, round the core by x=40, north to the factory.
      { t: "borer", x: 48, y: 63, d: 0, mk: 1 },
      ...run(47, 63, 41, 63, 3, 1),
      ...run(40, 63, 40, 43, 0, 1),
      { t: "cyst", x: 40, y: 42, d: 0, mk: 1, tag: "kyste S" },
      // N, south-east field: out west, north up x=56, well east of the core.
      { t: "borer", x: 57, y: 57, d: 0, mk: 1 },
      ...run(56, 57, 56, 43, 0, 1),
      { t: "cyst", x: 56, y: 42, d: 0, mk: 1, tag: "kyste N" },
      // F, east field: out of its top, straight into the factory's east side.
      { t: "borer", x: 60, y: 44, d: 0, mk: 1 },
      ...run(60, 43, 60, 42, 0, 1),
      { t: "cyst", x: 60, y: 41, d: 0, mk: 1, tag: "kyste F" },
      // K, the carbon: out east, for the capsule works to come.
      { t: "borer", x: 61, y: 50, d: 0, mk: 1 },
      ...run(63, 50, 64, 50, 1, 1),
      { t: "cyst", x: 65, y: 50, d: 1, mk: 1, tag: "kyste K" },
    ],
  },
  {
    name: "Usine d'antidote",
    // The C, N and F cysts pour onto one bus that climbs the factory's east side and runs west round two Ligase modules:
    // three sorters each, one per position of the gene. Module 1 listens to the core (its recipe), module 2 to a
    // console set by hand on an antidote. What no sorter takes ends in a burner.
    pieces: [
      // The bus: C starts it, N and F join it along y=40. S stays in its cyst: no gene asked for here needs it,
      // and on the bus it would only fill the burner, which takes 4 a second.
      { t: "belt", x: 35, y: 41, d: 0, mk: 2 },
      ...run(35, 40, 60, 40, 1, 2),
      { t: "belt", x: 56, y: 41, d: 0, mk: 2 },
      ...run(61, 40, 61, 33, 0, 2),
      ...run(61, 32, 56, 32, 3, 2),
      ...module(54, 34, "lig1"),
      ...run(52, 32, 48, 32, 3, 2),
      ...module(46, 34, "lig2"),
      ...run(44, 32, 42, 32, 3, 2),
      { t: "burn", x: 41, y: 32, d: 0, mk: 1 },
      // The genes made: each module into its own cyst.
      { t: "belt", x: 54, y: 32, d: 0, mk: 1 },
      { t: "cyst", x: 54, y: 31, d: 0, mk: 1, tag: "gènes recette" },
      { t: "belt", x: 46, y: 32, d: 0, mk: 1 },
      { t: "cyst", x: 46, y: 31, d: 0, mk: 1, tag: "gènes antidote" },
      // Module 2's console, set by hand on CNF, the antidote of SFN.
      { t: "desk", x: 43, y: 36, d: 0, extra: { mode: "hand", gene: "CNF" } },
    ],
    // Nerves: module 1 hangs on the core, module 2 on its console.
    wires: [["core", "lig1"], ["lig1", "lig1.a"], ["lig1", "lig1.b"], ["lig1", "lig1.c"],
      ["desk", "lig2"], ["lig2", "lig2.a"], ["lig2", "lig2.b"], ["lig2", "lig2.c"]],
  },
];

// A Ligase module on a westward bus at y=ly-2: the bus turns down its east side, under it and up its west side,
// past three sorters giving positions 1, 2 and 3; the Ligase puts its gene out north.
export function module(lx, ly, name) {
  return [
    { t: "belt", x: lx + 1, y: ly - 2, d: 2, mk: 2 },
    { t: "belt", x: lx + 1, y: ly - 1, d: 2, mk: 2 },
    { t: "sort", x: lx + 1, y: ly, d: 2, mk: 2, extra: { side: 1, read: 1 }, tag: `${name}.a` },
    { t: "belt", x: lx + 1, y: ly + 1, d: 3, mk: 2 },
    { t: "sort", x: lx, y: ly + 1, d: 3, mk: 2, extra: { side: 1, read: 2 }, tag: `${name}.b` },
    { t: "belt", x: lx - 1, y: ly + 1, d: 0, mk: 2 },
    { t: "sort", x: lx - 1, y: ly, d: 0, mk: 2, extra: { side: 1, read: 3 }, tag: `${name}.c` },
    { t: "belt", x: lx - 1, y: ly - 1, d: 0, mk: 2 },
    { t: "belt", x: lx - 1, y: ly - 2, d: 3, mk: 2 },
    { t: "ligase", x: lx, y: ly, d: 0, mk: 1, extra: { flip: true }, tag: name },
    // Its gene leaves north, onto the belt that crosses the bus to the cyst.
    { t: "belt", x: lx, y: ly - 1, d: 0, mk: 2 },
  ];
}
