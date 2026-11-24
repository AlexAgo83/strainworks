// With STRAINWORKS_GPU=1 the browser draws on the host's graphics card: checked once a run, and said in the log.
import { expect, it } from "vitest";
import { GPU, launch, renderer } from "./harness.mjs";

it.runIf(GPU)("draws on the graphics card when STRAINWORKS_GPU is set", async () => {
	const browser = await launch();
	try {
		const name = await renderer(browser);
		console.log(`WebGL renderer: ${name}`);
		expect(name).toMatch(/D3D12/);
		expect(name).not.toMatch(/SwiftShader/);
	} finally {
		await browser.close();
	}
});
