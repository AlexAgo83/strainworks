// Nerves: emission, positions, repeated base, focus, no jam, cut, rebuild, gestures, old save.
import { expect, it } from "vitest";
import { launch, pageHTML, recorder, savedGame } from "./harness.mjs";

it("nerves behaves as the recorded prototype", async () => {
  const { entries, report } = recorder();
  const browser = await launch();
  try {
    const context = await browser.newContext({viewport:{width:375,height:700},hasTouch:true});
    const page = await context.newPage(), errors = [];
    const body = pageHTML();
    page.on('pageerror', e => errors.push(e.message));
    await page.route('**/*', r => r.request().url().startsWith('http://proto.test') ? r.fulfill({body,contentType:'text/html'}) : r.abort());
    await page.goto('http://proto.test/');
    await page.evaluate(game => { paused = true; save = () => {}; localStorage.setItem('souche-proto-2', game); }, savedGame('v15'));
    await page.reload();
    report('old save', await page.evaluate(() => { paused=true; for(let i=0;i<40;i++)step(STEP); return JSON.stringify([G.wires.length,!G.over]); }));
    report('rules', JSON.stringify(await page.evaluate(() => {
      const out={}, run=s=>{for(let i=0;i<Math.round(s/STEP);i++)step(STEP);};
      const lab=()=>{ begin(); paused=true; G.open=true; G.breaches=[]; G.enemies=[]; G.cells={}; put('core',48,52,0); };
      const foe=(gene,x=20.5,y=17)=>{ const e={x,y,gene,hp:1e9,max:1e9}; G.enemies.push(e); return e; };
      const wire=(a,b)=>{ wireUp(a,b); G.wires[G.wires.length-1].left=0; };

      // A gate: each position, each base, each family.
      let n=0; const bad=[];
      for (const fam of ['SFN','SSC','FNN','CSN']) for (const read of [0,1,2,3]) for (const item of ['S','F','C','N',opposite(fam),fam]) {
        lab(); const t=put('turret',20,20,0), g=put('gate',26,20,1); g.read=read; g.open=false; wire(t,g); foe(fam); sense();
        const ant=opposite(fam), should = read ? item===ant[read-1] : item===ant;
        n++; if (accepts(g,item,1)!==should) bad.push([fam,read,item]);
      }
      out.positions={n,bad};

      lab(); let t=put('turret',20,20,0), g=put('gate',26,20,1); wire(t,g); foe('SFN',20.5,11); sense();
      out.outOfRange=[netOf(g).focus,accepts(g,'CNF',1)];
      g.item='CNF'; g.from=1; put('belt',27,20,1); run(.5); out.neverTraps=g.item;

      lab(); t=put('turret',20,20,0); g=put('gate',26,20,1); wire(t,g);
      const a=foe('SFN'); sense(); const first=netOf(g).focus;
      for(let i=0;i<3;i++)foe('SSC'); sense(); const kept=netOf(g).focus, both=netOf(g).list.slice();
      G.enemies=G.enemies.filter(e=>e!==a); G.time+=3; sense(); const grace=netOf(g).focus;
      G.time+=2; sense(); out.focus=[first,both,kept,grace,netOf(g).focus];

      // Mixed bases, three sorters in series feeding a ligase: the player's wiring makes what is asked.
      const plant = fam => {
        lab(); t=put('turret',30,26,0);
        const run1=(x0,y0,x1,y1,d)=>{ for(let x=x0,y=y0;;x+=DX[d],y+=DY[d]){ put('belt',x,y,d); if(x===x1&&y===y1)break; } };
        const src=put('belt',18,40,1); run1(19,40,21,40,1);
        const _ss=[[22,1],[26,2],[30,3]].map(([x,read])=>{ const s=put('sort',x,40,1); s.side=3; s.read=read; wire(t,s); return s; });
        run1(23,40,25,40,1); run1(27,40,29,40,1); run1(31,40,40,40,1); put('cyst',41,40,0);
        run1(22,39,22,35,0); run1(22,34,25,34,1); run1(26,39,26,35,0); run1(30,39,30,35,0); run1(30,34,27,34,3);
        put('ligase',26,34,0); put('belt',26,33,0); const sink=put('cyst',26,32,0);
        let i=0; const made={};
        const go=s=>{ for(let k=0;k<s/STEP;k++){ G.enemies=[]; foe(fam,30.5,24); if(!src.item){src.item='SFCN'[i++%4];src.from=1;src.t=0;} G.cells['41,40'].stock=[]; step(STEP); for(const it of sink.stock)made[it]=(made[it]||0)+1; sink.stock=[]; } };
        go(60); return made;
      };
      out.mixedLine={}; for (const f of ['SFN','SSC','FNN']) out.mixedLine[f]=plant(f);

      lab(); t=put('turret',20,20,0); g=put('gate',26,20,1); g.open=true; wire(t,g);
      G.wires[0].hp=.01; foe('SFN',23.5,20.5); run(.1);
      out.cut=[G.wires[0].hp,accepts(g,'C',1)];
      G.enemies=[]; refresh(); const offered=!document.querySelector('#rebuild').hidden;
      document.querySelector('#rebuild').onclick(); run(1.1);
      out.repaired=[offered,G.wires[0].hp,listens(g),accepts(g,'C',1)];
      const relay=put('sort',36,20,1); wire(g,relay); sense(); out.relay=listens(relay);
      lab(); g=put('gate',20,20,1); const s=put('sort',24,20,1); g.open=true; wire(g,s); sense(); out.noTurretIsManual=accepts(g,'C',1);
      lab(); t=put('turret',20,20,0); g=put('gate',50,20,1); out.tooFar=!wireUp(t,g);
      const h=put('gate',26,20,1); wire(t,h); remove(26,20); out.removed=G.wires.length;
      begin(); choose('hand'); choose('wire'); out.lockedAtStart=tool!=='wire';
      return out;
    })));
    await page.evaluate(() => {
      begin(); paused=true; G.open=true; G.breaches=[]; refresh();
      put('gate',53,39,1); const s=put('sort',44,39,0); s.read=2;
      cam.x=48.5; cam.y=37.5; cam.zoom=24;
    });
    const box=await page.locator('#game').boundingBox(), cdp=await context.newCDPSession(page);
    const at=(x,y)=>({x:box.x+box.width/2+(x+.5-48.5)*24,y:box.y+box.height/2+(y+.5-37.5)*24,id:0});
    await page.locator('#tools button',{hasText:'Nerf'}).click();
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[at(48,34)]});
    for(const [x,y] of [[49,35],[51,37],[53,39]]) await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[at(x,y)]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    for(const [x,y] of [[48,34],[44,39]]) { const p=at(x,y); await page.touchscreen.tap(p.x,p.y); }
    await page.evaluate(() => { for(let i=0;i<50;i++)step(STEP); G.enemies.push({x:49.5,y:31.5,gene:'SFN',hp:99,max:99},{x:46.5,y:32,gene:'SFN',hp:99,max:99}); sense(); refresh(); });
    await page.waitForTimeout(250);
    await page.locator('#actions button',{hasText:'Lit :'}).click();
    report('touch', await page.evaluate(()=>JSON.stringify([G.wires.map(w=>`${w.a}>${w.b}`),G.cells['44,39'].read,document.querySelector('#message').textContent])));
    await page.waitForTimeout(350);
    report('phone', await page.evaluate(()=>JSON.stringify({scroll:document.documentElement.scrollWidth,bottom:Math.round(document.querySelector('#tools').getBoundingClientRect().bottom)})));
    report('errors', JSON.stringify(errors));
  } finally { await browser.close(); }
  expect(entries.find(([label]) => label === "errors")?.[1]).toEqual([]);
  expect(entries).toMatchSnapshot();
});
