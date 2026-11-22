// Step 1 of transports: measured rates, veins, damage, gestures, old saves.
import { expect, it } from "vitest";
import { launch, pageHTML, pickTool, recorder, savedGame } from "./harness.mjs";

it("deposits-and-veins behaves as the recorded prototype", async () => {
  const { entries, report } = recorder();
  const browser = await launch();
  try {
    const context = await browser.newContext({viewport:{width:375,height:700},hasTouch:true});
    const page = await context.newPage(), errors = [];
    const body = pageHTML();
    page.on('pageerror', e => errors.push(e.message));
    await page.route('**/*', r => r.request().url().startsWith('http://proto.test') ? r.fulfill({body,contentType:'text/html'}) : r.abort());
    await page.goto('http://proto.test/');
    await page.evaluate(game => { paused = true; save = () => {}; localStorage.setItem('souche-proto-2', game); }, savedGame('v09'));
    await page.reload();
    report('old save', await page.evaluate(() => { paused=true; for (let i=0;i<200;i++) step(STEP); return JSON.stringify([G.dna>=9, G.cells['48,44'].last, G.cells['48,44'].made.length]); }));
    report('measures', JSON.stringify(await page.evaluate(() => {
      const lab = () => { fresh(); G.open=true; paused=true; G.breaches=[]; }, out = {};
      const run = s => { for (let i=0;i<s*20;i++) step(STEP); };
      for (const want of [1,2,4]) for (const up of [0,1]) {
        lab(); G.upgrades=up;
        const id = Object.keys(RICH).find(k => RICH[k]===want && !G.cells[k]), [x,y] = id.split(',').map(Number);
        const _m = put('mine',x,y,0), sink = put('cyst',x,y-1,0); run(5); sink.stock=[]; G.breaches=[]; let n=0;
        for (let i=0;i<400;i++){ step(STEP); n+=sink.stock.length; sink.stock=[]; }
        out[`mine x${want} up${up}`] = n/20;
      }
      for (const up of [0,1]) {
        lab(); G.upgrades=up;
        put('mine',80,81,1); put('mine',80,82,1); put('belt',81,82,0); for(let x=81;x<92;x++)put('belt',x,81,1); const sink=put('cyst',92,81,0); let n=0;
        for(let i=0;i<800;i++){ step(STEP); if(i>=400){n+=sink.stock.length;} sink.stock=[]; }
        out[`belt up${up}`]=n/20;
      }
      for (const mode of ['ok','leak','relay']) {
        lab(); const a=put('pump',4,90,0), b=put('pump',28,90,0); link(a,b); let end=b;
        if (mode==='relay'){ end=put('pump',52,90,0); link(b,end); }
        if (mode==='leak') a.veinHp=20;
        const sinks=[0,1,2,3].map(d=>put('cyst',end.x+DX[d],end.y+DY[d],d));
        let n=0;
        for(let i=0;i<800;i++){ if(mode==='leak')a.veinHitAt=G.time; while(a.stock.length<VEIN.cap)a.stock.push('C'); step(STEP); for(const s of sinks){ if(i>=400)n+=s.stock.length; s.stock=[]; } }
        out[`vein ${mode}`]=n/20;
      }
      lab(); const a=put('pump',10,90,0), b=put('pump',20,90,0); link(a,b); a.stock.push('C');
      out.oneMatter = [accepts(b,'C',1),accepts(b,'S',1)];
      out.loop = !link(b,a); out.far = !link(put('pump',10,94,0),put('pump',40,94,0));
      const held = a.stock.length + a.packets.reduce((s,p)=>s+p.n,0); a.to=null; b.to=null; link(a,b);
      run(1); out.kept = [held, a.stock.length+b.stock.length+a.packets.reduce((s,p)=>s+p.n,0)];
      put('belt',15,90,0); out.underBelt = !!G.cells['15,90'] && a.to===key(20,90);
      lab(); const p=put('pump',40,33,0), q=put('pump',56,33,0); link(p,q); p.veinHp=24.5;
      G.enemies.push({x:48.5,y:31,gene:'SFS',hp:1e6,max:1e6});
      run(3); out.lured=[+G.enemies[0].y.toFixed(1),leaking(p)];
      run(20); out.broke=[p.veinHp,+G.enemies[0].y.toFixed(1)>33.7];
      G.enemies=[]; refresh(); out.repairOffered=!document.querySelector('#rebuild').hidden;
      document.querySelector('#rebuild').onclick(); out.repaired=p.veinHp;
      G.ruins['56,33']={...q}; delete G.cells['56,33']; run(1); document.querySelector('#rebuild').onclick(); out.pumpBack=G.cells[p.to]?.type;
      remove(56,33); out.unlinked=p.to===null;
      lab(); for(const k of ['39,56','40,56','41,56'])delete G.cells[k];
      for(let y=45;y<56;y++)delete G.cells[`41,${y}`];
      const s=put('pump',39,56,0), e=put('pump',41,44,0); link(s,e); run(40);
      out.realLine=[G.cells['48,44'].last,G.cells['48,44'].made.length];
      return out;
    }), null, 1));
    await page.evaluate(() => { begin(); G.open=true; paused=true; G.breaches=[]; cam.x=20; cam.y=88; cam.zoom=18; });
    await pickTool(page,'pump');
    const box = await page.locator('#game').boundingBox(), cdp = await context.newCDPSession(page);
    const at = (x,y) => ({x:box.x+box.width/2+(x+.5-20)*18, y:box.y+box.height/2+(y+.5-88)*18, id:0});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[at(13,88)]});
    for (let x=15;x<=25;x+=2) await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[at(x,88)]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    report('drag', await page.evaluate(() => JSON.stringify([G.cells['13,88']?.to,G.cells['25,88']?.type,selected])));
    await page.locator('#actions button',{hasText:'Tirer une veine'}).click();
    const p = at(25,92); await page.touchscreen.tap(p.x,p.y);
    report('tap link', await page.evaluate(() => JSON.stringify([G.cells['25,88']?.to,G.cells['25,92']?.type])));
    await page.evaluate(() => {
      for (const y of [86,87,88,89,90]) put('belt',19,y,0);
      const a=G.cells['13,88']; for(let i=0;i<60;i++){ while(a.stock.length<30)a.stock.push('C'); step(STEP); }
    });
    await page.waitForTimeout(250);
    await page.evaluate(() => { begin(); G.open=true; paused=true; cam.x=48; cam.y=48; cam.zoom=5; });
    await page.waitForTimeout(200);
    report('tools', await page.evaluate(() => JSON.stringify({scroll:document.documentElement.scrollWidth,bottom:Math.round(document.querySelector('#tools').getBoundingClientRect().bottom),clipped:clippedTools()})));
    report('errors', JSON.stringify(errors));
  } finally { await browser.close(); }
  expect(entries.find(([label]) => label === "errors")?.[1]).toEqual([]);
  expect(entries).toMatchSnapshot();
});
