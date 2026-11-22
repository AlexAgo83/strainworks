// Construction: frozen in pause, three at a time, inert until built, every entry point, old saves.
import { expect, it } from "vitest";
import { launch, pageHTML, recorder } from "./harness.mjs";

it("construction-and-repair behaves as the recorded prototype", async () => {
  const { entries, report } = recorder();
  const html = pageHTML();
  const browser = await launch();
  try {
    const page = await browser.newPage({viewport:{width:375,height:700},hasTouch:true}), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.route('**/*', r => r.request().url().startsWith('http://proto.test') ? r.fulfill({body:html,contentType:'text/html'}) : r.abort());
    await page.goto('http://proto.test/');
    await page.evaluate(() => { begin(); paused=true; G.breaches=[]; G.dna=10000; tool='turret'; for (let x=10;x<20;x++) place(x,80); refresh(); });
    await page.waitForTimeout(1200);
    report('paused', await page.evaluate(() => JSON.stringify([owned('turret'), Object.values(G.cells).filter(c=>!built(c)&&c.left===6).length, document.querySelector('#works').textContent])));
    report('rules', JSON.stringify(await page.evaluate(() => {
      const out = {}, run = s => { for (let i=0;i<Math.round(s/STEP);i++) step(STEP); }, n = () => Object.values(G.cells).filter(c=>c.type==='turret'&&c.y===80&&built(c)).length;
      out.turrets=[]; for (const s of [5.9,.2,5.9,.1,12.1]) { run(s); out.turrets.push(n()); }
      const lab = () => { begin(); paused=true; G.breaches=[]; G.dna=10000; };
      lab(); tool='belt'; drag={x:10,y:80,moved:false,existing:false}; extend({x:69,y:80}); drag=null;
      out.longBelt=[sites().length]; run(1.5); out.longBelt.push(sites().length); run(1.6); out.longBelt.push(sites().length);
      lab(); tool='turret'; place(30,80); const s=G.cells['30,80']; s.ammo={CNF:9};
      G.enemies.push({x:30.5,y:81.5,gene:'SFN',hp:99,max:99});
      run(1); out.inert=[accepts(s,'CNF',0),G.enemies[0].hp,G.enemies[0].goal.x!==30.5];
      run(5.2); out.active=[built(s),G.enemies.length===0||G.enemies[0].hp<99];
      lab(); tool='wall'; place(30,60); G.enemies.push({x:30.5,y:60.5,gene:'SFN',hp:99,max:99}); run(1);
      out.wallSite=+Math.hypot(G.enemies[0].x-30.5,G.enemies[0].y-60.5).toFixed(2);
      lab(); tool='gate'; place(48,42); out.replace=[G.cells['48,42'].type,built(G.cells['48,42'])];
      lab(); tool='pump'; const a=build('pump',10,90,0); joinVein(a,28,90); for(let i=0;i<20;i++)a.stock.push('C');
      run(1); out.veinWaits=a.packets.length; run(3.2); out.veinFlows=a.packets.length+G.cells['28,90'].stock.length>0;
      lab(); G.ruins['20,20']={...cell('turret',20,20,0)}; document.querySelector('#rebuild').onclick(); out.rebuild=built(G.cells['20,20']);
      lab(); tool='turret'; const before=G.dna; place(30,80); remove(30,80); out.cancel=before-G.dna;
      lab(); tool='turret'; place(30,80); run(2); save(); load(); out.saved=+G.cells['30,80'].left.toFixed(1);
      lab(); const w=put('wall',30,60,0); w.hp=100; w.hitAt=G.time;
      run(4.5); const quiet=w.hp; run(10.5);
      out.repair={quiet, after10:Math.round(w.hp)}; run(40); out.repair.full=w.hp;
      lab(); const u=put('wall',30,60,0); u.hp=100; G.enemies.push({x:29.9,y:60.9,gene:'SFN',hp:1e9,max:1e9}); run(20); out.repair.underAttack=Math.round(u.hp);
      run(20); out.repair.stillFalls=!G.cells['30,60'];
      lab(); const core=G.cells['48,52']; core.hp=50; run(20); out.repair.core=Math.round(core.hp);
      lab(); const va=put('pump',10,90,0), vb=put('pump',20,90,0); link(va,vb); va.veinLeft=0; va.veinHp=20; run(20); out.repair.vein=Math.round(va.veinHp);
      va.veinHp=0; run(10); out.repair.severed=va.veinHp;
      begin(); out.startBuilt=Object.values(G.cells).every(built);
      return out;
    })));
    await page.evaluate(() => { begin(); paused=true; G.dna=500; tool='turret'; for(const x of [44,46,50,52]) place(x,36); tool='belt'; drag={x:43,y:40,moved:false,existing:false}; extend({x:43,y:45}); drag=null; G.cells['48,38'].hp=12; for(let i=0;i<60;i++)step(STEP); cam.x=48;cam.y=39.5;cam.zoom=26; select('52,36'); refresh(); });
    await page.waitForTimeout(300);
    report('errors', JSON.stringify(errors));
  } finally { await browser.close(); }
  expect(entries.find(([label]) => label === "errors")?.[1]).toEqual([]);
  expect(entries).toMatchSnapshot();
});
