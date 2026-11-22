// Bridge: every pair of ways, refusal against the way, auto as before, stray joints, drag, rebuild, buttons.
import { expect, it } from "vitest";
import { launch, pageHTML, recorder } from "./harness.mjs";

it("bridge behaves as the recorded prototype", async () => {
  const { entries, report } = recorder();
  const html = pageHTML();
  const browser = await launch();
  try {
    const page = await browser.newPage({viewport:{width:375,height:700},hasTouch:true}), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.route('**/*', r => r.request().url().startsWith('http://proto.test') ? r.fulfill({body:html,contentType:'text/html'}) : r.abort());
    await page.goto('http://proto.test/');
    report('logic', JSON.stringify(await page.evaluate(() => {
      paused = true; const bad = []; let n = 0;
      const lab = () => { fresh(); paused = true; G.breaches = []; };
      for (const v of [0,2]) for (const h of [1,3]) for (const mode of ['auto','set','against']) {
        lab(); const c = put('bridge',20,20,0), items = {[v]:'S',[h]:'F'};
        c.ways = mode === 'auto' ? null : mode === 'set' ? [v,h] : [(v+2)%4,(h+2)%4];
        for (const d of [v,h]) { put('belt',20-DX[d],20-DY[d],d).item = items[d]; put('belt',20+DX[d],20+DY[d],d); }
        const got = new Set();
        for (let i=0;i<30;i++){ step(STEP); for (const d of [v,h]) if (G.cells[key(20+DX[d],20+DY[d])].item === items[d]) got.add(d); }
        n++; if (got.size !== (mode === 'against' ? 0 : 2)) bad.push([v,h,mode]);
      }
      lab(); const b = put('bridge',20,20,0); put('belt',20,21,0); put('belt',21,20,1); put('belt',19,20,1); put('belt',20,19,0);
      const joint = feeders(G.cells['20,21']).filter(f => f.c === b).length;
      const guessed = [wayOf(b,0), wayOf(b,1)], cycle = [];
      for (let i=0;i<3;i++){ turnWay(b,1); cycle.push(b.ways[1]); }
      turnWay(b,1); tool='belt'; drag={x:19,y:20,moved:false,existing:true}; extend({x:20,y:20});
      const dragged = b.ways[1]; drag=null;
      G.ruins['20,20']={...b}; delete G.cells['20,20']; document.querySelector('#rebuild').onclick();
      return {n,bad,strayJoint:joint,guessed,cycle,dragged,rebuilt:G.cells['20,20'].ways};
    })));
    await page.evaluate(() => {
      begin(); paused=true; 
      put('bridge',48,41,0); put('belt',47,41,1); put('belt',46,41,1); put('belt',49,41,1); put('belt',50,41,1);
      for(let i=0;i<300;i++)step(STEP);
      cam.x=48.5;cam.y=41.5;cam.zoom=52; select('48,41');
    });
    await page.locator('#actions button',{hasText:'Voie ↕'}).click();
    report('button', await page.evaluate(() => JSON.stringify(G.cells['48,41'].ways)), await page.locator('#actions').innerText().then(s => s.replace(/\n/g,' | ')));
    await page.waitForTimeout(300);
    report('errors', JSON.stringify(errors));
  } finally { await browser.close(); }
  expect(entries.find(([label]) => label === "errors")?.[1]).toEqual([]);
  expect(entries).toMatchSnapshot();
});
