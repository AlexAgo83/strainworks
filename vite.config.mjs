import { defineConfig } from "vite";
import { babylonPin } from "./scripts/babylon-pin.mjs";

export default defineConfig({
  // The 3D engine's pinned address and hash, from the installed package.
  define: babylonPin(),
  test: {
    // Browser runs of the prototype: one at a time, so a workstation stays usable.
    fileParallelism: false,
    maxWorkers: 1,
    testTimeout: 120_000,
  },
});
