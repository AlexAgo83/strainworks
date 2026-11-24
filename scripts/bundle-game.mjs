// The game as one script: src/game/main.js and what it imports, bundled by Vite, for the built site and the tests.
// usage: node scripts/bundle-game.mjs > app.js
import { fileURLToPath } from "node:url";
import { build } from "vite";

export const GAME_TAG =
	'<script type="module" src="/src/game/main.js"></script>';

export async function bundleGame() {
	const result = await build({
		configFile: false,
		logLevel: "silent",
		root: fileURLToPath(new URL("..", import.meta.url)),
		build: {
			write: false,
			minify: false,
			lib: { entry: "src/game/main.js", formats: ["es"], fileName: "app" },
		},
	});
	const [chunk, ...rest] = (Array.isArray(result) ? result[0] : result).output;
	if (rest.some((file) => file.type === "chunk"))
		throw new Error("the game bundled into more than one chunk");
	return chunk.code;
}

if (process.argv[1] === fileURLToPath(import.meta.url))
	process.stdout.write(await bundleGame());
