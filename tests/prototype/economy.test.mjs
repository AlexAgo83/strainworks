// Economy: limits, refunds that never earn, rebuild bill, income, deadlock, old saves, phone.
import { expect, it } from "vitest";
import { launch, pageHTML, recorder } from "./harness.mjs";

it("economy behaves as the recorded prototype", async () => {
  const { entries, report } = recorder();
  const html = pageHTML();
  const browser = await launch();
  try {
    const page = await browser.newPage({viewport:{width:375,height:700},hasTouch:true}), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.route('**/*', r => r.request().url().startsWith('http://proto.test') ? r.fulfill({body:html,contentType:'text/html'}) : r.abort());
    await page.goto('http://proto.test/');
    report('rules', JSON.stringify(await page.evaluate(() => {
      const out = {}, lab = () => { begin(); paused = true; G.breaches = []; };
      const buy = (type,n) => { tool = type; for (let i=0;i<n;i++) place(10+(i%30),80+Math.floor(i/30)); return owned(type); };
      lab(); out.turrets = [buy('turret',10), G.dna, price('turret')];
      lab(); out.walls = [buy('wall',40), G.dna];
      lab(); tool='belt'; out.beltsFree = (() => { for (let i=0;i<20;i++) place(10+i,80); return G.dna; })();
      lab(); G.dna=1000; buy('turret',6); buy('wall',0);
      for (const c of Object.values(G.cells).filter(c=>c.type==='turret' && c.y>=80).reverse()) remove(c.x,c.y);
      out.roundTrip = G.dna;
      lab(); G.dna=1000; buy('wall',23); for (const c of Object.values(G.cells).filter(c=>c.type==='wall')) remove(c.x,c.y);
      out.wallRoundTrip = G.dna;
      lab(); buy('turret',1); G.cells['10,80'].hp=90; out.hurtRefund = refund(G.cells['10,80']);
      lab(); G.dna=1000; buy('turret',3);
      for (let x=10;x<13;x++){ const id=key(x,80); G.ruins[id]={...G.cells[id]}; delete G.cells[id]; }
      G.ruins['20,20']={...cell('belt',20,20,1)};
      refresh(); const label=document.querySelector('#rebuild').textContent;
      G.dna=20; document.querySelector('#rebuild').onclick();
      const partial=[G.dna,owned('turret'),G.cells['20,20']?.type,Object.keys(G.ruins).length];
      G.dna=100; document.querySelector('#rebuild').onclick();
      out.rebuild={label,partial,after:[G.dna,owned('turret'),Object.keys(G.ruins).length]};
      lab(); G.dna=0; G.cells={}; put('core',48,52,0);
      put('mine',36,56,0); put('mine',57,57,0); put('mine',59,45,0);
      const l=put('ligase',48,54,0); put('belt',48,53,0); for(const p of l.ports)p.push('C');
      for(let i=0;i<100;i++)step(STEP);
      out.incomeFromZero=G.dna;
      delete G.paid; G.dna=3; save(); load(); out.oldSave=[G.dna,G.paid];
      save(); load(); out.onlyOnce=G.dna;
      return out;
    })));
    await page.evaluate(() => { begin(); paused=true; G.dna=34; refresh(); });
    await page.waitForTimeout(250);
    report('phone', await page.evaluate(() => JSON.stringify({scroll:document.documentElement.scrollWidth,bottom:Math.round(document.querySelector('#tools').getBoundingClientRect().bottom),prices:[...document.querySelectorAll('.price')].map(p=>p.textContent+(p.classList.contains('short')?'!':''))})));
    report('errors', JSON.stringify(errors));
  } finally { await browser.close(); }
  expect(entries.find(([label]) => label === "errors")?.[1]).toEqual([]);
  expect(entries).toMatchSnapshot();
});
