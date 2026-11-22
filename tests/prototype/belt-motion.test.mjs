// Follow one marked item through turns, a bridge and a splitter at 60 fps: no jump, no drawn step.
import { expect, it } from "vitest";
import { launch, pageHTML, recorder } from "./harness.mjs";

it("belt-motion behaves as the recorded prototype", async () => {
  const { entries, report } = recorder();
  const html = pageHTML();
  const browser = await launch();
  try {
    const page = await browser.newPage({viewport:{width:700,height:700}}), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.route('**/*', r => r.request().url().startsWith('http://proto.test') ? r.fulfill({body:html,contentType:'text/html'}) : r.abort());
    await page.goto('http://proto.test/');
    for (const speedup of [1,3]) report(`x${speedup}`, JSON.stringify(await page.evaluate(speedup => {
      fresh(); paused = true; G.breaches = [];
      const path = [['belt',20,20,1],['belt',21,20,2],['belt',21,21,1],['bridge',22,21,0],['belt',23,21,0],['split',23,20,0],['belt',23,19,3],['belt',22,19,2],['belt',22,20,2],['bridge',22,21,0],['belt',22,22,3],['belt',21,22,3],['belt',20,22,0]];
      for (const [type,x,y,dir] of path) if (!G.cells[key(x,y)]) put(type,x,y,dir);
      const s = G.cells['20,20']; s.item = 'CNC'; s.from = 1; owed = 0;
      let last = null, max = 0, visited = new Set(), turnMax = 0;
      for (let f = 0; f < 300; f++) {
        owed += speedup / 60;
        while (owed >= STEP - 1e-9) { step(STEP); owed = Math.max(0, owed - STEP); }
        let at = null;
        for (const [_type,x,y] of path) {
          const c = G.cells[key(x,y)];
          if (c.type === 'bridge') { for (const l of c.lanes) if (l && l.item === 'CNC') at = along(c,l.dir,l.dir,l.t); }
          else if (c.item === 'CNC') at = along(c,c.from,exitOf(c),c.t);
          if (at) { visited.add(key(x,y)); break; }
        }
        if (!at) break;
        if (last) {
          max = Math.max(max,Math.hypot(at.x-last.x,at.y-last.y));
          const d = Math.abs(at.angle-last.angle); turnMax = Math.max(turnMax,Math.min(d,2*Math.PI-d));
        }
        last = at;
      }
      return {cells:visited.size, expectedPerFrame:(4*speedup/60).toFixed(3), worstPerFrame:max.toFixed(3), worstTurnDeg:(turnMax*180/Math.PI).toFixed(0)};
    },speedup)));
    await page.evaluate(() => { begin(); for (let i=0;i<900;i++) step(STEP); owed=0; cam.x=49; cam.y=45.5; cam.zoom=58; draw(); paused=true; });
    await page.waitForTimeout(200);
    report('errors', JSON.stringify(errors));
  } finally { await browser.close(); }
  expect(entries.find(([label]) => label === "errors")?.[1]).toEqual([]);
  expect(entries).toMatchSnapshot();
});
