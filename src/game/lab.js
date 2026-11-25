// The lab (?lab) and the frame loop.
import { BUILD, CORE, G, STAGES, STEP, TYPES, cellAt, depositAt, forgetCells, fresh, fullHp, hasTrait, key, paces, put, rankOf, step } from "../sim/sim.ts";
import { L } from "../sim/text.ts";
import { breachesIn } from "./actions.js";
import { musicTick, playSound, startSound } from "./audio.js";
import { animateHud } from "./hud.js";
import { meetConcepts } from "./unlock.js";
import { refresh, setCursor } from "./input.js";
import { followEdge, glide } from "./keys.js";
import { $, sound, LAB, LAB_FILES, LAB_GENES, LAB_PIECES, SOUNDS, armed, before, buildable, cam, drawnAt, labTake, mainSet, music, orbit, owed, paused, planetOwed, restartText, resting, savedAt, sfx, shownAt, slotId, slotKey, speed, view } from "./main.js";
import { drawPlanet, leavePlanet, perfFrame } from "./planet.js";
import { draw, resize } from "./render.js";
import { save, settleIn } from "./saves.js";
import { show3D } from "./view.js";

export function labSpot() {
  for (let r = 16; r < 60; r += 2) for (let a = 0; a < 8; a++) {
    const x = Math.round(CORE.x + Math.cos(a * Math.PI / 4) * r), y = Math.round(CORE.y + Math.sin(a * Math.PI / 4) * r);
    let clear = true;
    for (let i = -4; i <= 4 && clear; i++) for (let j = -4; j <= 4 && clear; j++) clear = !depositAt(x + i, y + j) && buildable(x + i, y + j);
    if (clear && !breachesIn(x - 10, y - 10, x + 10, y + 10).length) return {x, y};
  }
  return {x:CORE.x + 12, y:CORE.y};
}
export function labSpecimens() {
  return [['cell', 'core', 'Core'],
    ...Object.keys(TYPES).filter(t => !hasTrait(t, 'noSpecimen')).map(t => ['cell', t, `${TYPES[t].name} (${t})`]),
    ...Object.keys(LAB_GENES).map(k => ['creature', k, `Creature ${k}, gene ${LAB_GENES[k]}`]),
    ...[0, 1, 2, 3].flatMap(form => [['nest', `${form}:sleep`, `Nest form ${form}, asleep`], ['nest', `${form}:wake`, `Nest form ${form}, awake`]]),
    ['drone', 'drone', 'Drone, hovering']];
}
// What the inspector edits: the specimen's own object in the game state.
export function labTarget() {
  const {kind} = LAB;
  if (kind === 'cell') return cellAt(LAB.cell.x, LAB.cell.y);
  if (kind === 'creature') return G.enemies[0];
  if (kind === 'nest') return G.breaches[0];
  if (kind === 'drone') return G.drones[0];
  return null;
}
export function labShow(value) {
  const [kind, id] = value.split('|');
  const {x, y} = LAB.at;
  for (const c of Object.values(G.cells)) if (c.type !== 'core') delete G.cells[key(c.x, c.y)];
  G.enemies = []; G.shots = [];
  // The nest and the drone are moved onto the spot when shown: every other time they wait far from it.
  const away = {x:x + 60, y:y + 60};
  if (G.breaches[0]) Object.assign(G.breaches[0], away);
  if (G.drones[0]) Object.assign(G.drones[0], {x:away.x, y:away.y, was:{...G.drones[0].was, x:away.x, y:away.y}});
  LAB.kind = kind;
  let focus = {x, y};
  LAB.cell = id === 'core' ? CORE : LAB.at;
  if (kind === 'cell') {
    if (id === 'core') focus = CORE;
    else { const c = put(id, x, y, 1); c.left = 0; c.hp = fullHp(c); }
  } else if (kind === 'creature') {
    G.enemies.push({x:x + .5, y:y + .5, gene:LAB_GENES[id], hp:10, max:10, home:0, goal:{x:x + 6, y:y + .5}});
  } else if (kind === 'nest') {
    const [form, state] = id.split(':'), b = G.breaches[0];
    Object.assign(b, {form:Number(form), state, x, y});
    focus = {x, y};
  } else if (kind === 'drone') {
    const d = G.drones[0];
    Object.assign(d, {x:x + .5, y:y + .5, h:1.2, w:0, trip:'nest', job:'', goal:null, was:{x:x + .5, y:y + .5, h:1.2, w:0}});
  }
  forgetCells();
  Object.assign(cam, {x:focus.x + .5, y:focus.y + .5, zoom:Number($('lab-zoom').value)});
  // Under the sheet of a narrow screen, the model is framed in the upper half.
  if (matchMedia('(max-width:600px)').matches) cam.y += view.h * .24 / cam.zoom;
  labPaint(true);
}
export function labPaint(fresh) {
  const target = labTarget(), text = $('lab-state');
  if (!target) return;
  if (fresh || document.activeElement !== text) text.value = JSON.stringify(target, null, 1);
  $('lab-quick').hidden = LAB.kind !== 'cell' || target.type === 'core';
}
export function labEdit(change) {
  const c = labTarget();
  if (!c) return;
  change(c);
  forgetCells();
  labPaint(true);
}
export function labSoundsHTML() {
  const groups = [...new Set(Object.values(SOUNDS).map(s => s.group))];
  return `<p class="note">Music</p>
    <div class="quick">${LAB_PIECES.map(([name, id]) => `<button class="tip" data-piece="${id}">${name}</button>`).join('')}<button class="tip" data-piece="">Stop</button></div>
    <div class="quick"><button class="tip" data-piece="theme">As on the planet</button><button class="tip" data-piece="calm">As in a calm game</button><button class="tip" data-piece="fight">As in a fight</button></div>
    <p class="note" id="lab-now">Nothing playing</p>
    <label>Music <input id="lab-music" type="range" min="0" max="100" value="${Math.round(music.volume * 100)}"><output id="lab-music-out">${Math.round(music.volume * 100)}</output></label>
    <label>Effects <input id="lab-sfx" type="range" min="0" max="100" value="${Math.round(sfx.volume * 100)}"><output id="lab-sfx-out">${Math.round(sfx.volume * 100)}</output></label>
    <p class="note">Candidates (generated, not in the game yet)</p>
    <div class="sounds">${LAB_FILES.map(f => `<button class="tip" data-file="${f}">${f.split('/').pop().replace('.mp3', '')}</button>`).join('')}</div>
    <p class="note">Effects drawn by the game</p>
    ${groups.map(group => `<p class="note">${group}</p><div class="sounds">${Object.entries(SOUNDS).filter(([, s]) => s.group === group).map(([id, s]) => `<span><button class="tip" data-sound="${id}">${s.name}</button><button class="tip" data-burst="${id}" aria-label="${s.name}, ten in a row">×10</button></span>`).join('')}</div>`).join('')}`;
}
export function labSounds(panel) {
  panel.addEventListener('click', event => {
    const tab = event.target.closest('[data-tab]')?.dataset.tab;
    if (tab) {
      $('lab-models').hidden = tab !== 'models'; $('lab-sounds').hidden = tab !== 'sounds';
      for (const b of panel.querySelectorAll('[data-tab]')) b.setAttribute('aria-pressed', b.dataset.tab === tab);
    }
    const piece = event.target.closest('[data-piece]')?.dataset.piece, sound = event.target.closest('[data-sound]')?.dataset.sound, burst = event.target.closest('[data-burst]')?.dataset.burst;
    const file = event.target.closest('[data-file]')?.dataset.file;
    if (file) { labTake?.pause(); mainSet.labTake(new Audio(file)); labTake.volume = sfx.volume; labTake.play().catch(() => {}); return; }
    if (piece == null && !sound && !burst) return;
    startSound();
    if (piece != null) { music.force = piece; music.on = true; musicTick(); }
    if (sound) playSound(sound);
    if (burst) for (let i = 0; i < 10; i++) setTimeout(() => playSound(burst), i * 70);
  });
  $('lab-music').oninput = event => { music.volume = event.target.value / 100; $('lab-music-out').textContent = event.target.value; musicTick(); };
  $('lab-sfx').oninput = event => { sfx.volume = event.target.value / 100; $('lab-sfx-out').textContent = event.target.value; if (sfx.out) sfx.out.gain.value = sfx.volume; };
  setInterval(() => {
    const a = music.players[music.live], name = music.src.split('/').pop();
    $('lab-now').textContent = music.force ? `${name} · ${Math.floor(a.currentTime)} / ${Math.floor(a.duration || 0)} s` : 'Nothing playing';
  }, 500);
}
export function startLab() {
  leavePlanet(() => {
    mainSet.slotId(orbit.pick); mainSet.slotKey(null);
    settleIn(); fresh();
    G.open = true; G.dna = 99999; G.stage = STAGES.length;
    G.breaches = G.breaches.slice(0, 1);
    window.known = () => true;
    LAB.at = labSpot();
    return true;
  }, 'now');
  $('app').classList.add('lab');
  const panel = document.createElement('aside');
  panel.id = 'lab';
  panel.innerHTML = `<h2>Strainworks lab</h2>
    <div class="quick" id="lab-tabs"><button class="tip" data-tab="models" aria-pressed="true">Models</button><button class="tip" data-tab="sounds" aria-pressed="false">Sounds</button></div>
    <div id="lab-sounds" hidden>${labSoundsHTML()}</div>
    <div id="lab-models">
    <select id="lab-list" size="12" aria-label="Models">${labSpecimens().map(([kind, id, name]) => `<option value="${kind}|${id}">${name}</option>`).join('')}</select>
    <div id="lab-quick" class="quick">
      <button class="tip" data-lab="turn">Rotate</button><button class="tip" data-lab="mk">Rank MK</button><button class="tip" data-lab="flip">Mirror</button><button class="tip" data-lab="site">Construction</button>
      <label>Health <input id="lab-hp" type="range" min="5" max="100" value="100"><output id="lab-hp-out">100%</output></label>
    </div>
    <label>Zoom <input id="lab-zoom" type="range" min="20" max="240" value="150"><output id="lab-zoom-out">150</output></label>
    <div class="quick"><button class="tip" id="lab-pause">Pause</button><button class="tip" id="lab-apply">Apply the JSON</button></div>
    <textarea id="lab-state" spellcheck="false" aria-label="State"></textarea>
    <p class="note">The rules are stopped, the clock runs. Edit any field and apply.</p>
    </div>`;
  $('app').append(panel);
  $('lab-list').onchange = event => labShow(event.target.value);
  // A frame that grows after loading (Jarvis shows the lab on demand) does not always say so: its size is watched.
  new ResizeObserver(() => resize()).observe(document.documentElement);
  labSounds(panel);
  panel.addEventListener('click', event => {
    // @ts-expect-error: loose typing, tightened module by module (item_007)
    const act = event.target.closest('[data-lab]')?.dataset.lab;
    if (act === 'turn') labEdit(c => { c.dir = ((c.dir ?? 0) + 1) % 4; });
    if (act === 'mk') labEdit(c => { c.mk = (rankOf(c) % 3) + 1; c.hp = fullHp(c); });
    if (act === 'flip') labEdit(c => { c.flip = !c.flip; });
    if (act === 'site') labEdit(c => { c.left = c.left > 0 ? 0 : (BUILD[c.type] || 1) / 2; });
  });
  $('lab-hp').oninput = event => { $('lab-hp-out').textContent = `${event.target.value}%`; labEdit(c => { c.hp = fullHp(c) * event.target.value / 100; }); };
  $('lab-zoom').oninput = event => { cam.zoom = Number(event.target.value); $('lab-zoom-out').textContent = event.target.value; };
  $('lab-pause').onclick = () => { mainSet.paused(!paused); $('lab-pause').textContent = paused ? 'Play' : 'Pause'; };
  $('lab-apply').onclick = () => {
    try { const next = JSON.parse($('lab-state').value); labEdit(c => { for (const k of Object.keys(c)) if (!(k in next)) delete c[k]; Object.assign(c, next); }); }
    catch (error) { $('lab-state').setCustomValidity(error.message); $('lab-state').reportValidity(); setTimeout(() => $('lab-state').setCustomValidity(''), 2000); }
  };
  setInterval(() => labPaint(false), 500);
  // Opening the 3D view frames the board again: the lab's zoom comes back after it.
  show3D(true).then(() => { cam.zoom = Number($('lab-zoom').value); });
  $('lab-list').value = 'cell|ligase';
  labShow('cell|ligase');
}
export function frame(now) {
  const started = performance.now();
  const elapsed = Math.min(.15,(now-before)/1000); mainSet.before(now);
  if (orbit.on) {
    mainSet.planetOwed(planetOwed + (elapsed));
    if (!resting(now, 3000, 1000 / 30 - 2)) { drawPlanet(Math.min(.15, planetOwed)); mainSet.planetOwed(0); mainSet.drawnAt(now); }
    requestAnimationFrame(frame);
    return;
  }
  if (LAB.on) { if (!paused && !document.hidden) G.time += elapsed; }
  else if (!paused && (!document.hidden || sound.background)) {
    if (!G.over) G.played = (G.played ?? G.time) + elapsed;
    mainSet.owed(owed + (elapsed*speed));
    while (owed >= STEP) { step(STEP); mainSet.owed(owed - (STEP)); }
  }
  if (armed && Date.now() > armed) { mainSet.armed(0); restartText(L('Recommencer : maintenir')); }
  if (now-shownAt > 250) { refresh(); meetConcepts(); mainSet.shownAt(now); }
  if (now-savedAt > 3000) { save(); mainSet.savedAt(now); }
  paces.clear();
  glide(elapsed);
  followEdge(elapsed);
  setCursor();
  animateHud(elapsed);
  if (!(paused && resting(now, 1500, 1000 / 15 - 2))) { draw(); mainSet.drawnAt(now); }
  perfFrame(now, performance.now() - started);
  requestAnimationFrame(frame);
}

// The bindings other modules replace.
export const labSet = {

};
