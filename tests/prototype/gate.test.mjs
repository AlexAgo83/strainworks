// Gate: passes, holds, resumes in all directions and turns; one tap; diagnosis; rebuild.
import { expect, it } from "vitest";
import { launch, pageHTML, pickTool, recorder } from "./harness.mjs";

it("gate behaves as the recorded prototype", async () => {
  const { entries, report } = recorder();
  const html = pageHTML();
  const browser = await launch();
  try {
    const context = await browser.newContext({viewport:{width:375,height:700},hasTouch:true});
    const page = await context.newPage(), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.route('**/*', r => r.request().url().startsWith('http://proto.test') ? r.fulfill({body:html,contentType:'text/html'}) : r.abort());
    await page.goto('http://proto.test/');
    report('logic', JSON.stringify(await page.evaluate(() => {
      paused=true; const bad=[]; let n=0;
      for (const dir of [0,1,2,3]) for (const inward of [dir,(dir+1)%4,(dir+3)%4]) for (const held of [false,true]) {
        fresh(); paused=true; G.breaches=[];
        const g=put('gate',20,20,dir), before=put('belt',20-DX[inward],20-DY[inward],inward), after=put('belt',20+DX[dir],20+DY[dir],dir);
        if (held){g.item='C';g.from=inward;} else before.item='C';
        g.open=false; for(let i=0;i<30;i++)step(STEP);
        const waits=!after.item && (held?g.item:before.item)==='C';
        g.open=true; for(let i=0;i<30;i++)step(STEP);
        n++; if(!waits||after.item!=='C')bad.push([dir,inward,held]);
      }
      fresh(); paused=true; G.breaches=[];
      put('gate',48,46,0).open=false;
      for(let i=0;i<600;i++)step(STEP);
      const starved=diagnose(G.cells['48,44']);
      G.cells['48,46'].open=true; put('gate',48,42,0).open=false;
      for(let i=0;i<600;i++)step(STEP);
      const blocked=diagnose(G.cells['48,44']);
      G.ruins['48,42']={...G.cells['48,42']}; delete G.cells['48,42']; document.querySelector('#rebuild').onclick();
      return {n,bad,starved,blocked,rebuiltRed:!G.cells['48,42'].open};
    })));
    await page.evaluate(() => { begin(); paused=true; for(let i=0;i<500;i++)step(STEP); cam.x=48.5; cam.y=42; cam.zoom=48; draw(); });
    const box=await page.locator('#game').boundingBox();
    const at=[box.x+box.width/2, box.y+box.height/2+.5*48];
    await pickTool(page,'gate');
    await page.touchscreen.tap(...at);
    const placed=await page.evaluate(()=>[G.cells['48,42'].type,G.cells['48,42'].open,G.cells['48,42'].dir]);
    await pickTool(page,'hand');
    await page.touchscreen.tap(...at);
    const red=await page.evaluate(()=>{for(let i=0;i<100;i++)step(STEP);refresh();return G.cells['48,42'].open;});
    await page.waitForTimeout(250);
    await page.touchscreen.tap(...at);
    report('taps', JSON.stringify({placed,red,green:await page.evaluate(()=>G.cells['48,42'].open)}));
    report('tools', await page.evaluate(()=>JSON.stringify({n:document.querySelectorAll('#tools [data-type]').length,bottom:Math.round(document.querySelector('#tools').getBoundingClientRect().bottom),scroll:document.documentElement.scrollWidth})));
    report('errors',JSON.stringify(errors));
  } finally { await browser.close(); }
  expect(entries.find(([label]) => label === "errors")?.[1]).toEqual([]);
  expect(entries).toMatchSnapshot();
});
