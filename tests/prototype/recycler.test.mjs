// The Deligase takes a gene apart, the Separator a strand; the Recycler turns corpses into genes or carbon.
import { expect, it } from "vitest";
import { launch, pageHTML } from "./harness.mjs";

it("takes genes and strands apart and recycles corpses", async () => {
  const browser = await launch();
  try {
    const page = await browser.newPage({ line: false });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", (route) => (route.request().url().startsWith("http://proto.test") ? route.fulfill({ body: pageHTML(), contentType: "text/html" }) : route.abort()));
    await page.goto("http://proto.test/prototype/");
    const out = await page.evaluate(() => {
      begin();
      paused = true;
      G.open = true;
      G.enemies = [];
      G.breaches = [];
      const run = (s) => { for (let i = 0; i < s * 20; i++) step(0.05); };
      // A Deligase facing east at (30,30): left is north, ahead east, right south.
      const lig = put("unbind", 30, 30, 1);
      lig.ports[0] = ["SFN"];
      const n = put("belt", 30, 29, 0), e = put("belt", 31, 30, 1), s = put("belt", 30, 31, 2);
      run(2);
      const unbound = [n.item, e.item, s.item];
      // Mirrored, left and right swap.
      const lig2 = put("unbind", 30, 40, 1);
      lig2.flip = true;
      lig2.ports[0] = ["SFN"];
      const n2 = put("belt", 30, 39, 0), s2 = put("belt", 30, 41, 2);
      run(2);
      const mirrored = [n2.item, s2.item];
      // A Separator: gene 1 left, gene 2 right.
      const dis = put("unjoin", 40, 30, 1);
      dis.ports[0] = ["SFNCCF"];
      const dn = put("belt", 40, 29, 0), ds = put("belt", 40, 31, 2);
      run(2);
      const disassembled = [dn.item, ds.item];
      const takesStrand = accepts(dis, "SFNCCF", 1) && !accepts(dis, "SFN", 1) && !accepts(lig, "SFNCCF", 1);
      // The Recycler pulls a corpse in reach, then gives its gene or carbon; with every copy level, always the gene.
      choose("hand"); choose("reaper");
      const offered = tool === "reaper";
      choose("hand");
      const rec = put("reaper", 50, 30, 1);
      const sink = put("belt", 51, 30, 1);
      G.corpses = [{ x: 53.5, y: 30.5, gene: "CNF", at: G.time, a: 0 }, { x: 70, y: 30, gene: "SSS", at: G.time, a: 0 }];
      run(0.1);
      const pulled = rec.beam?.gene;
      run(2);
      const first = sink.item, farLeft = G.corpses.length;
      sink.item = null;
      G.lab = { copy: 3 };
      G.corpses = [{ x: 52, y: 31, gene: "FSN", at: G.time, a: 0 }];
      run(2);
      const always = sink.item;
      G.lab = { copy: 3, pull: 3 };
      sink.item = null;
      G.corpses = [{ x: 59, y: 30, gene: "NNS", at: G.time, a: 0 }];
      run(2);
      const far = sink.item;
      document.getElementById("lab-all").click();
      const labAll = G.lab.copy === 3 && G.lab.pull === 3 && G.lab.sight === 3 && G.drones.length === MOST_DRONES;
      const dna = G.dna;
      document.getElementById("dna-more").click();
      const dnaMore = G.dna - dna;
      choose("reaper");
      const unique = offered && tool !== "reaper";
      return { labAll, dnaMore, unbound, mirrored, disassembled, takesStrand, pulled, first, farLeft, always, far, unique, needs: [NEEDS.reaper, NEEDS.unbind, NEEDS.unjoin] };
    });
    expect(out.unbound).toEqual(["S", "F", "N"]);
    expect(out.mirrored).toEqual(["N", "S"]);
    expect(out.disassembled).toEqual(["SFN", "CCF"]);
    expect(out.takesStrand).toBe(true);
    expect(out.pulled).toBe("CNF");
    expect(["CNF", "K"]).toContain(out.first);
    expect(out.farLeft).toBe(1);
    expect(out.always).toBe("FSN");
    expect(out.far).toBe("NNS");
    expect(out.unique).toBe(true);
    expect(out.labAll).toBe(true);
    expect(out.dnaMore).toBe(100);
    expect(out.needs).toEqual([5, 5, 4]);
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
