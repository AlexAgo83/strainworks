import { defineConfig } from "vite";

export default defineConfig({
  test: {
    // Browser runs of the prototype: one at a time, so a workstation stays usable.
    fileParallelism: false,
    maxWorkers: 1,
    testTimeout: 120_000,
  },
});
