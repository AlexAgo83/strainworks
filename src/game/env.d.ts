// What the page gives the game beside its modules, for the type checker.
// The English dictionary en.js declares beside the page.
declare const EN: Record<string, string>;
// Written at build from the installed babylonjs package (scripts/babylon-pin.mjs).
declare const __BABYLON_SRC__: string;
declare const __BABYLON_SRI__: string;
// The page's own globals: the 3D views loaded on demand, the demo, the test hooks, and the window API.
interface Window {
  [name: string]: any;
}
