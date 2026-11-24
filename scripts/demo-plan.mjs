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
    // three sorters each, one per position of the gene. Each module hangs on a console set by hand: module 1 on
    // CNN, a capsule the core asks for, module 2 on CNF, an antidote. What no sorter takes ends in a burner.
    pieces: [
      // The bus: C starts it, N and F join it along y=40. S stays in its cyst: no gene made here needs it, and
      // what joins the bus on the way passes before C, which would starve the last module.
      { t: "belt", x: 35, y: 41, d: 0, mk: 3 },
      ...run(35, 40, 60, 40, 1, 3),
      { t: "belt", x: 56, y: 41, d: 0, mk: 3 },
      ...run(61, 40, 61, 33, 0, 3),
      ...run(61, 32, 56, 32, 3, 3),
      ...module(54, 34, "lig1"),
      ...run(52, 32, 48, 32, 3, 3),
      ...module(46, 34, "lig2"),
      ...run(44, 32, 42, 32, 3, 3),
      { t: "burn", x: 41, y: 32, d: 0, mk: 3 },
      // The genes made: each module into its own cyst.
      { t: "belt", x: 54, y: 32, d: 0, mk: 1 },
      { t: "cyst", x: 54, y: 31, d: 0, mk: 1, tag: "gènes CNN" },
      { t: "belt", x: 46, y: 32, d: 0, mk: 1 },
      { t: "cyst", x: 46, y: 31, d: 1, mk: 1, tag: "gènes antidote" },
      // The consoles: CNN for module 1, CNF, the antidote of SFN, for module 2.
      { t: "desk", x: 57, y: 36, d: 0, extra: { mode: "hand", gene: "CNN" }, tag: "console CNN" },
      { t: "desk", x: 43, y: 36, d: 0, extra: { mode: "hand", gene: "CNF" }, tag: "console CNF" },
    ],
    // Nerves: each module hangs on its console.
    wires: [["console CNN", "lig1"], ["lig1", "lig1.a"], ["lig1", "lig1.b"], ["lig1", "lig1.c"],
      ["console CNF", "lig2"], ["lig2", "lig2.a"], ["lig2", "lig2.b"], ["lig2", "lig2.c"]],
  },
  {
    name: "Capsules pour le cœur",
    // The core eats boxes: its heavy capsule needs the isotope, far out, so the demo feeds it CNN and CFF capsules.
    // Module 1's CNN genes go into an Encapsulator instead of their cyst; a third module between the first two, on a
    // console set to CFF, feeds a second one. The K cyst's carbon runs along y=27, split for the first, and both
    // lines of capsules go down to the core over the bus by two bridges. A player rebuilds here: each piece replaces what stood on its cell.
    rebuild: true,
    pieces: [
      { t: "belt", x: 52, y: 32, d: 3, mk: 3 },
      ...module(50, 34, "lig3"),
      { t: "belt", x: 48, y: 32, d: 3, mk: 3 },
      { t: "desk", x: 52, y: 36, d: 0, extra: { mode: "hand", gene: "CFF" }, tag: "console CFF" },
      // The genes: north out of module 3, then west into the Encapsulator.
      { t: "belt", x: 50, y: 32, d: 0, mk: 1 },
      { t: "belt", x: 50, y: 31, d: 0, mk: 1 },
      ...run(50, 30, 48, 30, 3, 1),
      { t: "pack", x: 47, y: 30, d: 3, mk: 1, extra: { box: "T", flip: true }, tag: "encapsuleur CFF" },
      // CNN: module 1's cyst gives way to an Encapsulator, its capsules west along y=28 to the CFF line.
      { t: "belt", x: 54, y: 31, d: 0, mk: 1 },
      { t: "pack", x: 54, y: 30, d: 0, mk: 1, extra: { box: "T", flip: true }, tag: "encapsuleur CNN" },
      { t: "belt", x: 54, y: 29, d: 0, mk: 1 },
      ...run(54, 28, 48, 28, 3, 1),
      { t: "bridge", x: 47, y: 28, d: 0 },
      { t: "belt", x: 46, y: 28, d: 3, mk: 1 },
      ...run(45, 28, 45, 29, 2, 1),
      // The carbon: out of the K cyst, north up x=66, west along y=27; a splitter sends half down to the CNN
      // Encapsulator's east side, the rest goes down x=47 over the CNN line into the CFF one.
      ...run(66, 50, 66, 28, 0, 1),
      ...run(66, 27, 56, 27, 3, 1),
      { t: "split", x: 55, y: 27, d: 3, mk: 1 },
      ...run(55, 28, 55, 29, 2, 1),
      { t: "belt", x: 55, y: 30, d: 3, mk: 1 },
      ...run(54, 27, 48, 27, 3, 1),
      { t: "belt", x: 47, y: 27, d: 2, mk: 1 },
      { t: "belt", x: 47, y: 29, d: 2, mk: 1 },
      // The capsules: west, south down x=44 over the bus twice, east into the core.
      ...run(46, 30, 45, 30, 3, 1),
      // MK3 down x=44: a bridge goes at the pace of the slowest belt it touches, and the bus crosses here.
      ...run(44, 30, 44, 51, 2, 3).map((b) => (b.y === 32 || b.y === 40 ? { t: "bridge", x: b.x, y: b.y, d: 0 } : b)),
      ...run(44, 52, 46, 52, 1, 1),
    ],
    wires: [["console CFF", "lig3"], ["lig3", "lig3.a"], ["lig3", "lig3.b"], ["lig3", "lig3.c"]],
  },
];

// A Ligase module on a westward bus at y=ly-2: the bus turns down its east side, under it and up its west side,
// past three sorters giving positions from, from + 1 and from + 2; the Ligase puts its gene out north.
export function module(lx, ly, name, from = 1) {
  return [
    { t: "belt", x: lx + 1, y: ly - 2, d: 2, mk: 3 },
    { t: "belt", x: lx + 1, y: ly - 1, d: 2, mk: 3 },
    { t: "sort", x: lx + 1, y: ly, d: 2, mk: 3, extra: { side: 1, read: from }, tag: `${name}.a` },
    { t: "belt", x: lx + 1, y: ly + 1, d: 3, mk: 3 },
    { t: "sort", x: lx, y: ly + 1, d: 3, mk: 3, extra: { side: 1, read: from + 1 }, tag: `${name}.b` },
    { t: "belt", x: lx - 1, y: ly + 1, d: 0, mk: 3 },
    { t: "sort", x: lx - 1, y: ly, d: 0, mk: 3, extra: { side: 1, read: from + 2 }, tag: `${name}.c` },
    { t: "belt", x: lx - 1, y: ly - 1, d: 0, mk: 3 },
    { t: "belt", x: lx - 1, y: ly - 2, d: 3, mk: 3 },
    { t: "ligase", x: lx, y: ly, d: 0, mk: 1, extra: { flip: true }, tag: name },
    // Its gene leaves north, onto the belt that crosses the bus.
    { t: "belt", x: lx, y: ly - 1, d: 0, mk: 3 },
  ];
}
