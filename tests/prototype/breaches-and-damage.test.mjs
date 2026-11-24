// Breaches and targeting: sleep, wake, empty, fade, outposts, turret priority.
import { expect, it } from "vitest";
import { launch, pageHTML, recorder } from "./harness.mjs";

it("breaches-and-damage behaves as the recorded prototype", async () => {
  const { entries, report } = recorder();
  const html = pageHTML();
  const browser = await launch();
  try {
    const page = await browser.newPage({viewport:{width:375,height:700},hasTouch:true}), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.route('**/*', r => r.request().url().startsWith('http://proto.test') ? r.fulfill({body:html,contentType:'text/html'}) : r.abort());
    await page.goto('http://proto.test/');
    report('rules', JSON.stringify(await page.evaluate(() => {
      const out = {}, run = (s,each) => { for (let i=0;i<s*20 && !G.over;i++){ each?.(); step(STEP); } };
      const lab = () => { fresh(); paused=true; };
      const overlap = (b) => OUTER.some(([,x,y,w,h]) => b.x>=x&&b.x<x+w&&b.y>=y&&b.y<y+h);
      lab();
      out.breaches = G.breaches.length;
      out.badPlace = G.breaches.filter(b => overlap(b) || !inside(b.x,b.y)).length;
      out.blockedDeposit = Object.keys(DEPOSIT).filter(k => !buildable(...k.split(',').map(Number))).length;
      out.nearTheBase = G.breaches.filter(b => Math.hypot(b.x-CORE.x,b.y-CORE.y) < CALM).map(b => [b.x,b.y]);
      // The two x2 deposits of the first ring and the field south of the base are free, every other rich one stays guarded.
      const free = ([,x,y,w,h,open]) => open === 'free' || richness(x+w/2,y+h/2)===2 && Math.hypot(x+w/2-CORE.x,y+h/2-CORE.y) < 24;
      const openField = (x,y) => OUTER.filter(free).some(f => patchOf(f).cells.has(key(x,y)));
      out.freeDeposits = OUTER.filter(free).length;
      out.freeOnesSleepOn = OUTER.filter(free).filter(f => { lab(); for (const c of patchOf(f).list) put('mine',c.x,c.y,0); run(1); return G.breaches.some(b=>b.state==='wake'); }).length;
      lab();
      out.unguardedRich = Object.keys(DEPOSIT).filter(k => { const [x,y]=k.split(',').map(Number); return RICH[k]>1 && !openField(x,y) && !G.breaches.some(b=>Math.hypot(b.x-x,b.y-y)<=b.r); }).length;
      run(720); out.idle = {awake:G.breaches.filter(b=>b.state!=='sleep').length, enemies:G.enemies.length, over:G.over};
      out.wakeEach = OUTER.filter(f => !free(f) && richness(f[1]+f[3]/2,f[2]+f[4]/2)>1).filter(f => {
        lab(); const {x,y}=patchOf(f).list[0]; put('mine',x,y,0); run(1); return !G.breaches.some(b=>b.state==='wake');
      }).length;
      lab(); put('belt',48,32,0); run(1); out.onlyOne = G.breaches.filter(b=>b.state==='wake').length;
      lab(); const a=put('pump',12,45,0), _z=put('pump',12,60,0); const before=G.breaches.filter(b=>b.state==='wake').length; a.to=key(12,60); run(1);
      out.veinWakes = G.breaches.filter(b=>b.state==='wake').length >= before;
      for (const [name,i,_near,fed] of [['north fed',0,7,true],['north starved',0,7,false],['far fed outpost',null,9,true]]) {
        lab();
        const k = i ?? G.breaches.findIndex(b=>b.total===70), b=G.breaches[k];
        if (!fed) { delete G.cells['48,41']; delete G.cells['48,42']; }
        const sx=Math.sign(CORE.x-b.x), sy=Math.sign(CORE.y-b.y), wide=Math.abs(CORE.x-b.x)>Math.abs(CORE.y-b.y);
        const ts=[];
        if (fed) for (const o of i!=null?[-2,2]:[-2,0,2]) ts.push(put('turret', wide?b.x+sx*5:b.x+o, wide?b.y+o:b.y+sy*5, 0));
        wake(b); let end=null, _firstLoss=null;
        for (let n=0;n<20*900 && !G.over;n++){
          if (fed && n%20===0) for (const t of ts) for (const f of G.families) t.ammo[opposite(f)]=12;
          step(STEP);
          if (b.state==='spent'){ end=Math.round(G.time); break; }
        }
        const dna=G.dna, bx=b.x, by=b.y;
        out[name]={cleared:end, over:G.over?Math.round(G.time):false, reward:b.state==='spent'&&dna>=b.total, buildable:buildable(bx,by), turretsLeft:ts.filter(t=>G.cells[key(t.x,t.y)]===t).length};
      }
      lab(); G.breaches=[]; const t=put('turret',30,52,0);
      G.enemies.push({x:24,y:52.5,gene:'SFS',hp:1e6,max:1e6}); run(1);
      out.turretFirst = G.enemies[0].goal.x===30.5;
      run(30); out.turretHit = !G.cells['30,52'] || t.hp<170;
      lab(); G.breaches=[]; put('turret',20,52,0);
      G.enemies.push({x:45,y:52.5,gene:'SFS',hp:1e6,max:1e6}); run(1);
      out.coreWhenCloser = G.enemies[0].goal.x===48.5;
      lab(); run(60); wake(G.breaches[0]); run(400);
      out.startingLineAlone = {middle:G.breaches[0].genes[0], state:G.breaches[0].state, left:G.breaches[0].left, over:G.over};
      lab(); const g=G.breaches[0]; g.r=4; G.breaches=[g]; const u=put('pump',40,27,0), _v=put('pump',56,27,0);
      run(1); const quiet=g.state; u.to=key(56,27); run(1); out.segmentWakes=[quiet,g.state];
      const rev = g => [...g].reverse().join('');
      out.damage = ['CNF','CNC','CSS','SSS'].map(g => damage(g,'SFN'));
      lab(); run(30); const l = G.cells['48,44']; out.line = [l.last, l.made.length, damage(l.last, G.breaches[0].genes[0]), damage(rev(l.last), G.breaches[0].genes[0])];
      out.startInversion = G.families.map(f => [damage(opposite(f),f), damage(rev(opposite(f)),f)]);
      out.palindromes = 0;
      for (let n=0;n<200;n++){ lab(); for (const b of G.breaches) wake(b); out.palindromes += G.families.filter(f => f[0]===f[2]).length; }
      const shootout = strict => {
        lab(); G.breaches=[]; G.cells={}; put('core',48,52,0); const t=put('turret',10,10,0); t.strict=strict; t.ammo={CNF:10};
        G.enemies=[{x:10.5,y:12,gene:'FNN',hp:1e6,max:1e6},{x:10.5,y:14,gene:'SFN',hp:1e6,max:1e6}];
        run(1);
        return G.enemies.map(e => 1e6-e.hp);
      };
      out.fire = {all:shootout(false), economical:shootout(true)};
      lab(); const eco=put('turret',30,52,0); eco.strict=true; eco.hp=.01; G.enemies.push({x:30.5,y:52.5,gene:'SFN',hp:1e6,max:1e6});
      G.breaches=[]; run(1); document.querySelector('#rebuild').onclick(); out.strictKept=G.cells['30,52']?.strict;
      lab(); wake(G.breaches[0]); wake(G.breaches[1]); out.mutationAdds = [G.families.length, G.breaches[1].genes.length];
      return out;
    }), null, 1));
    await page.evaluate(() => { begin(); paused=true; cam.x=48.5; cam.y=33; cam.zoom=16; refresh(); });
    const box = await page.locator('#game').boundingBox();
    await page.touchscreen.tap(box.x+box.width/2, box.y+box.height/2+(27.5-33)*16);
    const offered = await page.locator('#actions button',{hasText:'Réveiller'}).count();
    await page.waitForTimeout(250);
    await page.locator('#actions button',{hasText:'Réveiller'}).click();
    report('tap', offered, await page.evaluate(() => JSON.stringify([G.breaches[0].state,['.title','.detail','#versus'].map(part=>document.querySelector('#brief '+part).textContent).join(' ')])));
    await page.evaluate(() => { for(let i=0;i<700;i++)step(STEP); refresh(); });
    await page.waitForTimeout(250);
    report('errors', JSON.stringify(errors));
  } finally { await browser.close(); }
  expect(entries.find(([label]) => label === "errors")?.[1]).toEqual([]);
  expect(entries.find(([label]) => label === "rules")[1]).toMatchObject({ nearTheBase: [[48, 27]], freeDeposits:3, freeOnesSleepOn: 0, unguardedRich: 0, wakeEach: 0 });
  expect(entries).toMatchSnapshot();
});
