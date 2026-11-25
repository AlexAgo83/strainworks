// An operator-like playthrough of drawn games, run on demand (not part of `npm test`):
//   npm run playthrough -- [seed ...] [--minutes N]      (TRACE=1 prints the game every 30 s from stage 4)
// One JSON line a seed on stdout; without seeds it plays seeds 1, 2, ... until six different base gene draws.
// For each seed it opens the real page, starts a game with drawn recipes and plays it through the game's own tools:
// it picks each machine in the tray and puts it down with place() (so unlocks, prices and drones apply), draws belts
// with the drag, sets encapsulators, wires a gate to the core and keeps turrets fed. It follows what the core asks,
// feeds the base genes it eats, works each stage's mechanic and lives through the swarms, up to the hatching or the
// time limit, and reports each stage: what was asked, what was missing, how long it took, what the swarms broke, the
// DNA held and any error.
//
// Boundary: raw matter does not come from harvesters and long belts but from stand-in stores refilled by the script
// beside each machine (the same for the turrets' ammunition); the fog is lifted. Routing and harvesting are not
// exercised here; recipes, unlocks, machine settings, mechanics, swarms, DNA and the guides are.
import { launch, pageHTML } from "../prototype/harness.mjs";

const args = process.argv.slice(2);
const minutesAt = args.indexOf("--minutes");
const LIMIT = minutesAt >= 0 ? Number(args[minutesAt + 1]) : 150;
const seeds = args.filter((a, i) => /^\d+$/.test(a) && i !== minutesAt + 1).map(Number);

// Runs in the page: the player.
function install(seed) {
	// Small seeds start the generator near 0, and every draw would begin alike: spread them and warm it up.
	let s = (seed * 104729 + 7919) % 2147483647;
	Math.random = () => {
		s = (s * 16807) % 2147483647;
		return (s - 1) / 2147483646;
	};
	for (let i = 0; i < 20; i++) Math.random();
	begin();
	paused = true;
	const core = coreCell(), cx = core.x + 1, cy = core.y + 1;
	const B = { seed, standins: [], slots: {}, notes: [], refusals: [], lost: 0, coreLow: 100 };
	window.B = B;
	// A module is drawn in its own frame: +x is where its output goes, +y its right.
	const at = (o, f, lx, ly) => [[o.x + ly, o.y - lx], [o.x + lx, o.y + ly], [o.x - ly, o.y + lx], [o.x - lx, o.y - ly]][f];
	const turn = (f, d) => (d + f + 3) % 4;
	const said = () => document.getElementById("refusal")?.textContent || "";
	// The player's way: the tool picked in the tray, its heading, a tap on the ground.
	B.build = (type, x, y, dir, why) => {
		const there = cellAt(x, y);
		if (there?.type === type) return there;
		if (there) remove(there.x, there.y);
		choose(type);
		if (tool !== type) { B.refusals.push(`${why}: ${type} cannot be picked at stage ${G.stage + 1}`); return null; }
		heading = dir;
		ui.refusedAt = 0;
		place(x, y);
		const c = cellAt(x, y);
		if (c?.type !== type) { if (ui.refusedAt) B.refusals.push(`${why}: ${type} at ${x},${y} refused: ${said()}`); return null; }
		return c;
	};
	// A stand-in for a harvester line: a store that keeps what it is given and pushes it out of its front.
	B.feed = (x, y, dir, items) => {
		const there = cellAt(x, y);
		if (there && !there.stand) remove(there.x, there.y);
		const c = cellAt(x, y) || put("cyst", x, y, dir);
		c.dir = dir; c.stand = items;
		if (!B.standins.includes(c)) B.standins.push(c);
		return c;
	};
	B.refill = () => {
		for (const c of B.standins) {
			if (!G.cells[key(c.x, c.y)] || G.cells[key(c.x, c.y)] !== c) continue;
			const list = typeof c.stand === "function" ? c.stand() : c.stand;
			while (c.stock.length < 6 && list.length) {
				c.turn = ((c.turn || 0) + 1) % list.length;
				c.stock.push(list[c.turn]);
			}
		}
	};
	// A Ligase making a gene, fed from its three sides: first base left, second behind, third right.
	const ligase = (o, f, lx, ly, ld, gene, why) => {
		const [x, y] = at(o, f, lx, ly), d = turn(f, ld), back = (d + 2) % 4, left = (d + 3) % 4, right = (d + 1) % 4;
		const step = (dir) => [x + DX[dir], y + DY[dir]];
		B.feed(...step(left), right, [gene[0]]);
		B.feed(...step(back), d, [gene[1]]);
		B.feed(...step(right), left, [gene[2]]);
		return B.build("ligase", x, y, d, why);
	};
	const out = (o, f, why) => B.build("belt", o.x, o.y, turn(f, 1), why);
	// The modules: a gene, a strand, a box of a gene or of a strand.
	B.modules = {
		gene(o, f, gene, why) { ligase(o, f, -1, 0, 1, gene, why); out(o, f, why); },
		strand(o, f, genes, why) {
			const [x, y] = at(o, f, -1, 0);
			ligase(o, f, -1, -1, 2, genes.slice(0, 3), why);
			ligase(o, f, -1, 1, 0, genes.slice(3), why);
			B.build("join", x, y, turn(f, 1), why);
			out(o, f, why);
		},
		box(o, f, item, why) {
			const kind = boxOf(item), genes = contentOf(item), [px, py] = at(o, f, -1, 0);
			if (genes.length === 3) ligase(o, f, -2, 0, 1, genes, why);
			else {
				const [jx, jy] = at(o, f, -3, 0), [bx, by] = at(o, f, -2, 0);
				ligase(o, f, -3, -1, 2, genes.slice(0, 3), why);
				ligase(o, f, -3, 1, 0, genes.slice(3), why);
				B.build("join", jx, jy, turn(f, 1), why);
				B.build("belt", bx, by, turn(f, 1), why);
			}
			const [kx, ky] = at(o, f, -1, -1);
			B.feed(kx, ky, turn(f, 2), ["K"]);
			// A heavy capsule's isotope on its own line, on the other side.
			if (kind === "H") { const [ix, iy] = at(o, f, -1, 1); B.feed(ix, iy, turn(f, 0), ["I"]); }
			const pack = B.build("pack", px, py, turn(f, 1), why);
			if (pack && pack.box !== kind) setRecipe(pack, kind);
			out(o, f, why);
		},
	};
	// Two trunks into the core, east and west, each with four places for modules.
	const trunk = (dx) => {
		tool = "belt";
		drag = { x: cx + dx * 13, y: cy, moved: false };
		extend({ x: cx + dx * 2, y: cy });
		drag = null;
	};
	trunk(1);
	trunk(-1);
	B.places = [];
	for (const dx of [1, -1]) for (const along of [4, 9]) for (const side of [-1, 1]) B.places.push({ x: cx + dx * along, y: cy + side, f: side < 0 ? 2 : 0, trunk: dx });
	B.cx = cx; B.cy = cy;
	return { base: G.base, families: [...G.families], seed: G.seed };
}

// Runs in the page: one look at the game, then the player acts and the game runs on.
function play(seconds) {
	const B = window.B, { cx, cy } = B;
	const why = `stage ${G.stage + 1}`;
	// What the core wants now: its base genes, then this stage's recipes, each with its module.
	const wanted = [...eaten().map((g) => ["gene", g]), ...G.goals.filter((g) => g.fed < g.count).map((g) => [boxOf(g.item) ? "box" : g.item.length === 6 ? "strand" : "gene", g.item])];
	const keep = new Set(wanted.map(([, item]) => item));
	for (const [id, slot] of Object.entries(B.slots)) if (!keep.has(id)) { B.free(slot); delete B.slots[id]; }
	for (const [kind, item] of wanted) {
		let slot = B.slots[item];
		if (!slot) {
			// The gate on the nerve, on the west trunk, listens to the core: it passes what the core asks but never a
			// capsule, so the base genes and the capsules go east, the strands, magazines and heavy capsules west.
			const west = !eaten().includes(item) && boxOf(item) !== "T";
			slot = B.places.find((p) => !Object.values(B.slots).includes(p) && (p.trunk < 0) === west) || B.places.find((p) => !Object.values(B.slots).includes(p));
			if (!slot) { B.notes.push(`${why}: no room left for ${item}`); continue; }
			B.slots[item] = slot;
		}
		B.modules[kind](slot, slot.f, item, `${why}, ${item}`);
	}
	// From stage 2: turrets round the base, two more each stage, fed with every family's antidote.
	if (G.stage >= 1) {
		const ring = [[6, -6], [6, 6], [-6, -6], [-6, 6], [0, -7], [0, 7], [11, -7], [-11, 7], [11, 7], [-11, -7], [15, -2], [-15, 2]];
		for (const [dx, dy] of ring.slice(0, Math.min(ring.length, 4 + 2 * (G.stage - 1)))) {
			const t = B.build("turret", cx + dx, cy + dy, 0, `${why}, defence`);
			if (t) B.feed(cx + dx, cy + dy + (dy < 0 ? -1 : 1), dy < 0 ? 2 : 0, () => G.families.map(opposite));
		}
	}
	// Stage 3's nerve: a gate on the west trunk, wired to the core, passing only what it asks.
	if (G.stage >= 2 && !B.gate) {
		const g = B.build("gate", cx - 3, cy, 1, `${why}, nerve`);
		if (g) { wireUp(g, coreCell()); B.gate = g; }
	}
	// Stage 5's outpost: a harvester on a deposit inside a kept nest's circle, with two turrets beside it.
	if (G.stage >= 4 && !B.outpost) {
		for (const b of G.breaches.filter((n) => n.state !== "spent").sort((p, q) => Math.hypot(p.x - cx, p.y - cy) - Math.hypot(q.x - cx, q.y - cy))) {
			let spot = null;
			for (let dx = -b.r; dx <= b.r && !spot; dx++) for (let dy = -b.r; dy <= b.r && !spot; dy++) {
				const x = b.x + dx, y = b.y + dy;
				if (Math.hypot(dx, dy) <= b.r - 1 && Math.hypot(dx, dy) > 2 && depositAt(x, y) && !cellAt(x, y) && placeable(x, y)) spot = { x, y };
			}
			if (!spot) continue;
			const m = B.build("mine", spot.x, spot.y, 1, `${why}, outpost`);
			if (m) {
				B.outpost = { x: spot.x, y: spot.y, nest: { x: b.x, y: b.y } };
				for (const [dx, dy] of [[0, -2], [0, 2]]) {
					const t = B.build("turret", spot.x + dx, spot.y + dy, 0, `${why}, outpost defence`);
					if (t) B.feed(spot.x + dx, spot.y + dy + Math.sign(dy), dy < 0 ? 2 : 0, () => G.families.map(opposite));
				}
				break;
			}
		}
		if (!B.outpost) B.notes.push(`${why}: no deposit inside a kept nest's circle could take a harvester`);
	}
	// What was broken is rebuilt, as a player presses Reconstruire.
	const ruins = Object.keys(G.ruins).length;
	if (ruins) { B.lost += ruins; document.getElementById("rebuild").onclick(); }
	for (let i = 0; i < Math.round(seconds / STEP); i++) {
		B.refill();
		step(STEP);
		B.coreLow = Math.min(B.coreLow, coreCell()?.hp ?? 0);
		if (G.over) break;
	}
	return {
		time: G.time, stage: G.stage, over: Boolean(G.over), dna: Math.floor(G.dna),
		goals: G.goals.map((g) => [g.item, Math.floor(g.fed), g.count]), needs: (G.needs || []).map((n) => [n.need, Math.floor(n.fed), n.count]),
		hungry: hungryFor(), swarm: G.swarm ? { wave: G.swarm.wave, next: G.swarm.next, size: G.swarm.size } : null, kills: G.kills,
		guide: G.guide ? { kind: G.guide.kind, step: G.guide.step } : null, families: G.families.length,
		enemies: { swarm: G.enemies.filter((e) => e.home === -1).length, nests: G.enemies.filter((e) => e.home !== -1).length, nearCore: G.enemies.filter((e) => Math.hypot(e.x - cx, e.y - cy) < 6).length, titans: G.enemies.filter((e) => e.kind === "titan").length },
		awake: G.breaches.filter((b) => b.state === "wake").length, coreHp: Math.round(coreCell()?.hp ?? 0),
		lost: B.lost, coreLow: Math.round(B.coreLow), refusals: B.refusals.splice(0), notes: B.notes.splice(0),
	};
}

// Runs in the page: the module of a recipe no longer asked is taken down (its stand-ins with it).
function freeing() {
	window.B.free = (slot) => {
		for (let lx = -4; lx <= 0; lx++) for (let ly = -2; ly <= 2; ly++) {
			const [x, y] = [[slot.x + ly, slot.y - lx], null, [slot.x - ly, slot.y + lx]][slot.f];
			const c = cellAt(x, y);
			if (c && c.type !== "core" && y !== window.B.cy) remove(c.x, c.y);
		}
		window.B.standins = window.B.standins.filter((c) => G.cells[key(c.x, c.y)] === c);
	};
}

// Runs in the page: whether each base a stage's recipes need lies in a deposit near the core, and how far.
function deposits() {
	const near = {};
	const { cx, cy } = window.B;
	for (let r = 0; r <= 60; r++) for (let dx = -r; dx <= r; dx++) for (const dy of [-r, r]) for (const [x, y] of [[cx + dx, cy + dy], [cx + dy, cy + dx]]) {
		const kind = depositAt(x, y);
		if (kind && near[kind] == null) near[kind] = r;
	}
	return near;
}

async function run(seed) {
	const browser = await launch();
	const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, recipes: true, line: false });
	const errors = [];
	page.on("pageerror", (error) => errors.push(error.message));
	await page.route("**/*", (route) => (route.request().url().startsWith("http://proto.test") ? route.fulfill({ body: pageHTML(), contentType: "text/html" }) : route.abort()));
	await page.goto("http://proto.test/prototype/");
	const start = await page.evaluate(install, seed);
	await page.evaluate(freeing);
	const near = await page.evaluate(deposits);
	const stages = [];
	let current = { stage: 1, from: 0, asked: null, refusals: [], notes: [], lostFrom: 0, dna: [] };
	let last;
	for (let minute = 0; minute < LIMIT * 2; minute++) {
		last = await page.evaluate(play, 30);
		if (process.env.TRACE && last.stage >= 3) process.stderr.write(`${Math.round(last.time)} st${last.stage + 1} core${last.coreHp} dna${last.dna} fam${last.families} awake${last.awake} ${JSON.stringify(last.enemies)} swarm${JSON.stringify(last.swarm)} lost${last.lost} ${JSON.stringify(last.needs)}\n`);
		if (!current.asked) current.asked = { goals: last.goals.map(([item, , count]) => `${item} x${count}`), needs: last.needs.map(([need, , count]) => `${need} x${count}`), guide: last.guide };
		current.refusals.push(...last.refusals);
		current.notes.push(...last.notes);
		if (last.stage + 1 !== current.stage || last.over) {
			stages.push({ ...current, minutes: Math.round((last.time - current.from) / 6) / 10, dna: last.dna, lost: last.lost - current.lostFrom, waves: last.swarm?.wave ?? 0, kills: last.kills, coreLow: last.coreLow });
			if (last.over) break;
			current = { stage: last.stage + 1, from: last.time, asked: null, refusals: [], notes: [], lostFrom: last.lost };
			if (last.stage >= 5) break;
		}
	}
	if (!last.over && last.stage < 5) stages.push({ ...current, minutes: Math.round((last.time - current.from) / 6) / 10, unfinished: { goals: last.goals, needs: last.needs, hungry: last.hungry }, dna: last.dna, lost: last.lost - current.lostFrom, waves: last.swarm?.wave ?? 0, kills: last.kills, coreLow: last.coreLow });
	await browser.close();
	return { seed, base: start.base, families: start.families, near, reached: last.stage + 1, over: last.over, minutes: Math.round(last.time / 60), errors, stages };
}

const results = [];
const draws = new Set();
for (const seed of seeds.length ? seeds : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) {
	if (!seeds.length && draws.size >= 6) break;
	const result = await run(seed);
	draws.add(result.base.join(" "));
	results.push(result);
	process.stdout.write(`${JSON.stringify(result)}\n`);
}
