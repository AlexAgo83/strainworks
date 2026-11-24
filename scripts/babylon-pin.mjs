// The 3D engine's CDN address and its SRI hash, read from the installed babylonjs package:
// bumping the package is the only edit a new engine version needs.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const at = (path) =>
	new URL(`../node_modules/babylonjs/${path}`, import.meta.url);

export function babylonPin() {
	const { version } = JSON.parse(readFileSync(at("package.json"), "utf8"));
	const sri = `sha384-${createHash("sha384")
		.update(readFileSync(at("babylon.js")))
		.digest("base64")}`;
	return {
		__BABYLON_SRC__: JSON.stringify(
			`https://cdn.jsdelivr.net/npm/babylonjs@${version}/babylon.js`,
		),
		__BABYLON_SRI__: JSON.stringify(sri),
	};
}
