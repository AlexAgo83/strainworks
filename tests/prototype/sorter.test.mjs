// Sorter: each side and direction, wildcard, strict blocking, rebuild, and the controls on a phone.
import { expect, it } from "vitest";
import { launch, pageHTML, recorder } from "./harness.mjs";

it("sorter behaves as the recorded prototype", async () => {
  const { entries, report } = recorder();
  const html = pageHTML();
  const browser = await launch();
  try {
    const page = await browser.newPage({viewport:{width:375,height:700},hasTouch:true}), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.route('**/*', r => r.request().url().startsWith('http://proto.test') ? r.fulfill({body:html,contentType:'text/html'}) : r.abort());
    await page.goto('http://proto.test/');
    report('routing', JSON.stringify(await page.evaluate(() => {
      paused = true; let cases = 0, bad = [];
      for (const dir of [0,1,2,3]) for (const side of [1,3]) for (const [want,item,hit] of [['C','C',1],['C','S',0],['?','N',1],['C','CNC',0],['CNC','CNC',1],['C?C','CFC',1],['C?C','CFS',0],['???','C',0]]) {
        fresh(); G.open=true; paused = true; G.breaches = [];
        const x=20,y=20,c=put('sort',x,y,dir); c.want=want; c.side=side;
        const exit = hit ? (dir+side)%4 : dir;
        put('belt',x+DX[dir],y+DY[dir],dir); put('belt',x+DX[(dir+side)%4],y+DY[(dir+side)%4],(dir+side)%4);
        const input = put('belt',x-DX[dir],y-DY[dir],dir); input.item=item;
        let got = false;
        for (let i=0;i<30;i++){ step(STEP); if (G.cells[key(x+DX[exit],y+DY[exit])].item===item) got=true; }
        cases++; if(!got) bad.push([dir,side,want,item]);
      }
      fresh(); G.open=true; paused=true; G.breaches=[];
      const c=put('sort',20,20,1); put('belt',21,20,1); c.item='C'; c.from=1; c.want='C';
      for(let i=0;i<30;i++)step(STEP);
      return {cases,bad,strict:c.item==='C' && !G.cells['21,20'].item,why:diagnose(c)};
    })));
    await page.evaluate(() => {
      begin(); G.open=true; paused = true; G.breaches = [];
      const c = put('sort',48,41,0); c.hp=40; put('belt',49,41,1); put('belt',50,41,1);
      for(let i=0;i<500;i++)step(STEP);
      cam.x=48.5;cam.y=41;cam.zoom=40; select('48,41'); showActions();
    });
    const actions = page.locator('#actions button');
    await actions.filter({hasText:'= dernier'}).click();
    await actions.filter({hasText:'Sort à gauche'}).click();
    report('controls', await page.evaluate(() => JSON.stringify([G.cells['48,41'].want,G.cells['48,41'].side])));
    await page.locator('#actions .slot').nth(1).click();
    report('slot', await page.evaluate(() => G.cells['48,41'].want));
    await page.locator('#actions .slot').nth(1).click();
    await page.evaluate(() => { for(let i=0;i<200;i++)step(STEP); refresh(); });
    await page.waitForTimeout(300);
    report('phone', await page.evaluate(() => JSON.stringify({scroll:document.documentElement.scrollWidth, board:Math.round(view.h), bottom:Math.round(document.querySelector('#tools').getBoundingClientRect().bottom), clipped:clippedTools()})));
    report('rebuild', await page.evaluate(() => {
      const before = [G.cells['48,41'].want,G.cells['48,41'].side].join();
      G.ruins['48,41'] = {...G.cells['48,41']}; delete G.cells['48,41']; document.querySelector('#rebuild').onclick();
      return before === [G.cells['48,41'].want,G.cells['48,41'].side].join();
    }));
    report('errors', JSON.stringify(errors));
  } finally { await browser.close(); }
  expect(entries.find(([label]) => label === "errors")?.[1]).toEqual([]);
  expect(entries).toMatchSnapshot();
});
