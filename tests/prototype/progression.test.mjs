// The goal: a real wired line through each stage, locks, assembler order, old saves, phone.
import { expect, it } from "vitest";
import { fromMenu, launch, pageHTML, recorder, savedGame } from "./harness.mjs";

it("progression behaves as the recorded prototype", async () => {
  const { entries, report } = recorder();
  const browser = await launch();
  try {
    const page = await browser.newPage({viewport:{width:375,height:700},hasTouch:true}), errors = [];
    const body = pageHTML();
    page.on('pageerror', e => errors.push(e.message));
    await page.route('**/*', r => r.request().url().startsWith('http://proto.test') ? r.fulfill({body,contentType:'text/html'}) : r.abort());
    await page.goto('http://proto.test/');
    await page.evaluate(game => { paused = true; save = () => {}; localStorage.setItem('souche-proto-2', game); }, savedGame('v14'));
    await page.reload();
    report('old save', await page.evaluate(() => JSON.stringify([G.stage,G.open,unlocked(3)])));
    report('play', JSON.stringify(await page.evaluate(() => {
      begin(); paused=true; G.breaches=[];
      const out={}, run=s=>{for(let i=0;i<Math.round(s/STEP);i++)step(STEP);};
      const line=(...pts)=>{ for(let i=0;i<pts.length-1;i++){ let [x,y]=pts[i]; const [a,b]=pts[i+1]; const d=a>x?1:a<x?3:b>y?2:0; while(x!==a||y!==b){ const o=G.cells[key(x,y)]; if(!o)put('belt',x,y,d); else if(isBelt(o))o.dir=d; x+=DX[d]; y+=DY[d]; } } };
      const refused=t=>{ choose('hand'); choose(t); return tool!==t; };
      out.locked0=Object.keys(NEEDS).filter(refused).length;
      out.richLocked=perSecond({type:'mine',x:42,y:14});

      // Stage 1, wired on the real map from real deposits.
      put('mine',47,64,0); line([47,63],[47,56],[48,56]); put('mine',49,63,0); line([49,62],[49,56],[48,56]);
      put('ligase',48,56,0); line([48,55],[48,52]);
      put('mine',59,44,2); put('bridge',49,61,0); put('bridge',55,57,0); line([59,45],[59,56],[55,56],[55,61],[49,61]); line([48,61],[48,57]); put('belt',48,57,0);
      let t=0; while(G.stage<1&&t<300){run(1);t++;}
      out.cell={seconds:t,stage:G.stage,gene:G.cells['48,56'].last,unlocked:!refused('sort'),stillShut:refused('pump')};

      const feed=(x,y,dir,item)=>{ const c=put('cyst',x,y,dir); c.keep=item; return c; };
      const clear=()=>{ for(const id of Object.keys(G.cells)) if(id!=='48,52') delete G.cells[id]; };
      const supply=s=>{ for(let i=0;i<Math.round(s/STEP);i++){ for(const c of Object.values(G.cells)) if(c.keep) while(c.stock.length<60)c.stock.push(c.keep); step(STEP); } };
      const ligase=(x,y,dir,g)=>{ put('ligase',x,y,dir); [3,2,1].forEach((turn,i)=>{ const d=(dir+turn)%4; feed(x+DX[d],y+DY[d],(d+2)%4,g[i]); }); };
      const packer=()=>{ put('pack',48,54,0); feed(47,54,1,'K'); line([48,53],[48,52]); };
      clear(); packer(); ligase(48,57,0,'CCF'); line([48,56],[48,54]);
      supply(80); out.oneLigaseNotEnough=[G.stage,+G.held.toFixed(0),mealRate()];
      ligase(44,55,1,'CCF'); line([45,55],[48,55]);
      t=0; while(G.stage<2&&t<200){supply(1);t++;}
      out.tissue={seconds:t,stage:G.stage,vein:!refused('pump'),join:!refused('join'),worm:refused('worm'),rich:perSecond({type:'mine',x:42,y:14})};

      clear(); packer(); put('join',48,57,0); line([48,56],[48,54]);
      feed(47,57,1,'SFS'); feed(49,57,3,'FFF');
      supply(15); const j=G.cells['48,57']; out.strand=[j.last,G.fed>0];
      const _before=G.fed; j.flip=true; supply(1); j.ports=[[],[],[]]; supply(5); out.inversion=j.last;
      j.flip=false; j.ports=[[],[],[]]; j.item=null;
      for (const c of Object.values(G.cells)) { if (isBelt(c)) c.item=null; if (c.type==='pack') { c.ports=[[],[],[]]; c.item=null; } }
      t=0; while(G.stage<3&&t<200){supply(1);t++;}
      out.organ={seconds:t,stage:G.stage,worm:!refused('worm'),rich:perSecond({type:'mine',x:42,y:14})};
      const s=cell('sort',1,1,0); s.want='SFS???'; out.sortStrand=[fits(s,'SFSFFF'),fits(s,'FFFSFS')];
      const tu=cell('turret',1,1,0); out.turretRefuses=!accepts(tu,'SFSFFF',0);
      begin(); out.reset=[G.stage,G.open,refused('split')];
      for(let i=0;i<40;i++){ step(STEP); } G.enemies=[];
      return out;
    })));
    await page.evaluate(() => { begin(); paused=true; G.fed=37; select('48,52'); refresh(); });
    await page.waitForTimeout(250);
    await fromMenu(page,'open-all');
    report('unlock', await page.evaluate(() => JSON.stringify([unlocked(3),document.querySelectorAll('#tools .locked').length,G.stage])));
    await page.evaluate(() => { begin(); paused=true; G.stage=2; G.fed=25; cam.x=48.5; cam.y=52.5; cam.zoom=22;
      put('join',48,56,0); put('belt',48,55,0).item='SFSFFF'; put('belt',48,54,0).item='SFSFFF'; put('belt',47,56,1); put('belt',49,56,3); refresh(); });
    await page.waitForTimeout(250);
    report('phone', await page.evaluate(() => JSON.stringify({scroll:document.documentElement.scrollWidth,bottom:Math.round(document.querySelector('#tools').getBoundingClientRect().bottom),clipped:clippedTools()})));
    report('errors', JSON.stringify(errors));
  } finally { await browser.close(); }
  expect(entries.find(([label]) => label === "errors")?.[1]).toEqual([]);
  expect(entries).toMatchSnapshot();
});
