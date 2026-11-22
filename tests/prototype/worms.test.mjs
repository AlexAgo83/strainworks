// Worms: loop, alignment, measured rates, departure rules, collisions, damage, gestures, old saves.
import { expect, it } from "vitest";
import { launch, pageHTML, pickTool, recorder, savedGame } from "./harness.mjs";

it("worms behaves as the recorded prototype", async () => {
  const { entries, report } = recorder();
  const browser = await launch();
  try {
    const context = await browser.newContext({viewport:{width:375,height:700},hasTouch:true});
    const page = await context.newPage(), errors = [];
    const body = pageHTML();
    page.on('pageerror', e => errors.push(e.message));
    await page.route('**/*', r => r.request().url().startsWith('http://proto.test') ? r.fulfill({body,contentType:'text/html'}) : r.abort());
    await page.goto('http://proto.test/');
    await page.evaluate(game => { paused = true; save = () => {}; localStorage.setItem('souche-proto-2', game); }, savedGame('v13'));
    await page.reload();
    report('old save', await page.evaluate(() => { paused=true; for(let i=0;i<100;i++)step(STEP); return JSON.stringify([G.worms.length,Object.keys(G.tracks).length,!G.over]); }));
    report('rules', JSON.stringify(await page.evaluate(() => {
      const out = {}, run = s => { for (let i=0;i<Math.round(s/STEP);i++) step(STEP); };
      // A loop with 48 cells between the two stations, three pockets each, mirrored on the way back.
      const world = (n=1, rule='auto', supplied=true) => {
        begin(); G.open=true; paused=true; G.breaches=[]; G.cells={}; G.enemies=[]; put('core',48,52,0); G.dna=1000;
        tool='track'; drag={x:20,y:70,moved:false};
        extend({x:63,y:70}); extend({x:63,y:75}); extend({x:20,y:75}); extend({x:20,y:70}); drag=null;
        for (const c of Object.values(G.tracks)) c.left=0;
        const load=[40,41,42].map(x=>put('pocket',x,69,0)), drop=[42,41,40].map(x=>put('pocket',x,76,0));
        for (const p of drop) p.unload=true;
        const at=[[25,70],[58,75],[20,73]];
        for(let i=0;i<n;i++){ incubate(...at[i]); const w=G.worms[i]; w.left=0; w.rule=rule; }
        let got=0; const kinds=drop.map(()=>new Set());
        const tick = () => {
          if (supplied) load.forEach((p,i)=>{ while(p.stock.length<WORM.pocket)p.stock.push(['C','N','F'][i]); });
          step(STEP);
          drop.forEach((p,i)=>{ got+=p.stock.length; for(const k of p.stock)kinds[i].add(k); p.stock=[]; });
        };
        return {load,drop,kinds,tick,count:()=>got};
      };
      const loopCells = () => Object.keys(G.tracks).length;
      out.rates={};
      for (const n of [1,2,3]) {
        const w=world(n); out.loop=loopCells();
        for(let i=0;i<600;i++)w.tick(); const a=w.count();
        for(let i=0;i<4000;i++)w.tick();
        out.rates[n]=+((w.count()-a)/200).toFixed(1);
        if(n===1) out.mirror=w.kinds.map(s=>[...s].join(''));
        if(n===3){ const all=G.worms.flatMap(o=>o.path); out.overlap=all.length-new Set(all).size; }
      }
      let w=world(1,'full',false); for(let i=0;i<600;i++)w.tick();
      out.fullWaits=G.worms[0].docked && stationHead(G.worms[0].path[1]);
      w.load.forEach((p,i)=>{ for(let k=0;k<40;k++)p.stock.push(['C','N','F'][i]); });
      let left=false; for(let i=0;i<120;i++){ w.tick(); if(!G.worms[0].docked)left=true; }
      out.fullLeaves=left;
      w=world(1,'auto',false); let stops=0,was=false;
      for(let i=0;i<1200;i++){ w.tick(); if(G.worms[0].docked&&!was)stops++; was=G.worms[0].docked; }
      out.autoNeverSticks=stops>=4;
      w=world(); delete G.tracks['55,70']; for(let i=0;i<400;i++)w.tick();
      out.brokenTrail=G.worms[0].stuck;
      layTrack(55,70,1).left=0; for(let i=0;i<20;i++)w.tick();
      out.resumes=G.worms[0].path[0]!=='54,70';
      w=world(); G.worms[0].left=2; run(1); out.noMoveBeforeHatch=G.worms[0].path.length;
      w=world(); const ate=G.worms[0]; ate.left=999; G.enemies.push({x:25.5,y:70.5,gene:'SFN',hp:1e9,max:1e9});
      run(1); out.hurt=Math.round(ate.hp); G.enemies=[]; run(12); out.healed=ate.hp===WORM.hp;
      begin(); G.open=true; paused=true; G.dna=100; layTrack(20,20,1); incubate(20,20); const d=G.dna; wipe(20,20);
      out.money=[d,G.dna]; out.trailStays=!!G.tracks['20,20']; wipe(20,20); out.trailGone=!G.tracks['20,20'];
      begin(); G.open=true; paused=true; const g=G.breaches.find(b=>b.total===40); layTrack(g.x+4,g.y,1); run(1); out.trailWakes=g.state;
      begin(); G.open=true; paused=true; layTrack(48,42,1); out.underBelt=G.cells['48,42'].type;
      return out;
    })));
    await page.evaluate(() => { begin(); G.open=true; paused=true; G.breaches=[]; G.dna=200; cam.x=20; cam.y=82; cam.zoom=21; });
    await pickTool(page,'track');
    const box=await page.locator('#game').boundingBox(), cdp=await context.newCDPSession(page);
    const at=(x,y)=>({x:box.x+box.width/2+(x+.5-20)*21,y:box.y+box.height/2+(y+.5-82)*21,id:0});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[at(14,78)]});
    for(const [x,y] of [[16,78],[24,78],[24,80],[24,86],[20,86],[14,86],[14,82],[14,78]]) await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[at(x,y)]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    report('drawn loop', await page.evaluate(()=>{ let id='14,78',n=0; do{ const c=G.tracks[id]; if(!c)return 'open'; id=key(c.x+DX[c.dir],c.y+DY[c.dir]); n++; }while(id!=='14,78'&&n<99); return n; }));
    const tap=async(name,x,y)=>{ await pickTool(page,await page.evaluate(label=>TOOLBAR.find(type=>TYPES[type].name===label),name)); const p=at(x,y); await page.touchscreen.tap(p.x,p.y); };
    for(const x of [18,19,20]) await tap('Poche',x,77);
    for(const x of [18,19,20]) await tap('Poche',x,87);
    await page.locator('#actions button',{hasText:'Poche : charge'}).click();
    await tap('Ver',15,78);
    report('tapped', await page.evaluate(()=>JSON.stringify([G.worms.length,owned('pocket'),G.cells['20,87'].unload,G.dna])));
    await page.evaluate(()=>{
      for(const x of [18,19]) G.cells[key(x,87)].unload=true;
      for(let i=0;i<400;i++){ [18,19,20].forEach((x,j)=>{const p=G.cells[key(x,77)]; while(p.stock.length<80)p.stock.push('CNF'[j]);}); step(STEP); }
      refresh();
    });
    await page.waitForTimeout(300);
    report('phone', await page.evaluate(()=>JSON.stringify({scroll:document.documentElement.scrollWidth,bottom:Math.round(document.querySelector('#tools').getBoundingClientRect().bottom),tools:document.querySelectorAll('#tools [data-type]').length,clipped:clippedTools()})));
    await page.setViewportSize({width:1280,height:800}); await page.waitForTimeout(300);
    report('errors', JSON.stringify(errors));
  } finally { await browser.close(); }
  expect(entries.find(([label]) => label === "errors")?.[1]).toEqual([]);
  expect(entries).toMatchSnapshot();
});
