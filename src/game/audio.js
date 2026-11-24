// Music and effects.
import { G } from "../sim/sim.ts";
import { L, LANG } from "../sim/text.ts";
import { LANG_KEY } from "./lang.js";
import { $, DUCKED, LAB_FILES, MUSIC, MUSIC_KEY, SFX_KEY, SOUNDS, SOUND_FILE, SOUND_LEVEL, cam, duck, music, musicRandom, orbit, screenAt, sfx, shuffleCalm, trackOf, view } from "./main.js";
import { keepForReload } from "./planet.js";
import { keep } from "./saves.js";

// A new order on every visit and after every round, never the same piece twice in a row: no piece comes back before
// every other of its list was played.
export function shuffleMusic(list) {
  const last = list.at(-1);
  for (let i = list.length - 1; i > 0; i--) { const j = musicRandom(i + 1); [list[i], list[j]] = [list[j], list[i]]; }
  if (list[0] === last) list.push(list.shift());
}
export function paintPlaylist() {
  const groups = [[L('Planète'), '', MUSIC.theme], [L('Calme'), '', [...MUSIC.calm].sort((a, b) => trackOf(a)[0].localeCompare(trackOf(b)[0]))], [L('Combat'), 'fight', MUSIC.fight]];
  const play = '<svg width="13" height="13" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 2l9 5-9 5z" fill="currentColor"/></svg>';
  const stop = '<svg width="11" height="11" viewBox="0 0 12 12" aria-hidden="true"><rect x="2" y="2" width="8" height="8" rx="1.5" fill="currentColor"/></svg>';
  $('playlist').innerHTML = groups.map(([name, kind, list]) => `<div class="${kind}"><p class="group"><span>${name}</span><span>${list.length}</span></p>${list.map(src => {
    const [title, time] = trackOf(src), now = music.on && music.src === src && (music.manual ?? src) === src;
    return `<div class="track${now ? ' now' : ''}"><button data-track="${src}" aria-label="${now ? L`Arrêter ${title}` : L`Lancer ${title}`}">${now ? stop : play}</button><span class="name"><b>${title}</b><span class="eq" aria-hidden="true"><i></i><i></i><i></i></span></span><span class="time">${time}</span></div>`;
  }).join('')}</div>`).join('');
  $('playlist-auto').setAttribute('aria-checked', music.manual == null);
  $('playlist-note').textContent = music.manual == null ? L('Le jeu choisit selon le moment : planète, calme, combat.') : L('Manuel : la piste choisie tourne en boucle.');
}
export function musicWant(now) {
  // The lab plays what it is asked: a moment of the game, a piece, or nothing.
  // Chosen in the playlist: that piece, or silence when it was stopped.
  if (music.manual != null && music.force == null) return music.manual;
  if (music.force != null) return music.force === 'calm' ? MUSIC.calm[music.calm] : music.force === 'fight' ? MUSIC.fight[Math.max(0, music.fight)] : music.force === 'theme' ? MUSIC.theme[music.theme] : music.force;
  if (orbit.on || !G) return MUSIC.theme[music.theme];
  // An assault, or creatures on the map: a fight piece, drawn as the fight starts and held 8 s after so it does not flicker.
  if (!G.over && $('app').classList.contains('hot')) {
    if (now >= music.fightUntil) {
      // The next fight piece in its round; a calm piece cut by the fight counts as heard.
      if (music.fight + 1 >= MUSIC.fight.length) { shuffleMusic(MUSIC.fight); music.fight = 0; } else music.fight++;
      if (music.src === MUSIC.calm[music.calm]) { music.calm++; if (music.calm >= MUSIC.calm.length) { music.calm = 0; shuffleCalm(); } }
    }
    music.fightUntil = now + 8000;
  }
  return now < music.fightUntil ? MUSIC.fight[music.fight] : MUSIC.calm[music.calm];
}
export function musicTick() {
  if (!music.started) return;
  stationHum();
  const want = musicWant(performance.now());
  if (want && want !== music.src) {
    music.src = want; music.live ^= 1;
    const a = music.players[music.live];
    // Themes and calm pieces hand over at their end; a fight piece loops while the fight lasts.
    a.src = want; a.loop = MUSIC.fight.includes(want) || want === music.manual; music.level[music.live] = 0;
  }
  // About 1.5 s of crossfade: the piece playing rises to the volume chosen, the other falls and stops.
  music.players.forEach((a, i) => {
    const ducked = performance.now() < (music.duckUntil || 0) ? .35 : 1;
    const goal = want && i === music.live && music.on && !document.hidden ? music.volume * ducked : 0, was = music.level[i];
    const level = music.level[i] = Math.max(0, Math.min(1, was + Math.sign(goal - was) * Math.min(Math.abs(goal - was), .07)));
    // Through a gain where the browser has Web Audio: an iPhone ignores the volume of an audio element.
    if (music.gains) music.gains[i].gain.value = level; else a.volume = level;
    if (goal > 0 && a.paused) a.play().catch(() => {});
    else if (goal === 0 && level === 0 && !a.paused) a.pause();
  });
}
export function paintMusic() {
  $('music-volume').value = Math.round(music.volume * 100);
  $('music-on').setAttribute('aria-pressed', music.on);
  $('music-on').textContent = music.on ? L('Activée') : L('Coupée');
}
export function keepMusic() { try { localStorage.setItem(MUSIC_KEY, JSON.stringify({volume:music.volume, on:music.on})); } catch (_) { /* blocked or full storage: the game goes on without remembering it */ } }
export function startSound() {
  if (music.started) return;
  // A media player, not a page sound: an iPhone in silent mode still plays it, as it does a video.
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (_) { /* only some browsers have an audio session */ }
  try {
    const Context = window.AudioContext || window.webkitAudioContext, ctx = new Context();
    music.gains = music.players.map(a => { const gain = ctx.createGain(); gain.gain.value = 0; ctx.createMediaElementSource(a).connect(gain).connect(ctx.destination); return gain; });
    sfx.ctx = ctx; sfx.out = ctx.createGain(); sfx.out.gain.value = sfx.on ? sfx.volume : 0; sfx.out.connect(ctx.destination);
    loadSounds();
    ctx.resume?.();
  } catch (_) { music.gains = null; }
  music.started = true; musicTick();
}
export function paintSfx() {
  $('sfx-volume').value = Math.round(sfx.volume * 100);
  $('sfx-on').setAttribute('aria-pressed', sfx.on);
  $('sfx-on').textContent = sfx.on ? L('Activés') : L('Coupés');
  if (sfx.out) sfx.out.gain.value = sfx.on ? sfx.volume : 0;
}
export function keepSfx() { try { localStorage.setItem(SFX_KEY, JSON.stringify({volume:sfx.volume, on:sfx.on})); } catch (_) { /* blocked or full storage: the game goes on without remembering it */ } }
export function loadSounds() {
  for (const [id, base] of Object.entries(SOUND_FILE)) {
    const take = new RegExp(`/${base}_\\d`);
    for (const file of LAB_FILES.filter(f => take.test(f))) {
      fetch(file).then(r => r.arrayBuffer()).then(data => sfx.ctx.decodeAudioData(data)).then(buffer => { (sfx.buffers[id] ||= []).push(buffer); }).catch(() => {});
    }
  }
}
// Under the theme on the planet, the station hums.
export function stationHum() {
  // shortcut: never played; the station loop sounds like music and doubled the planet's theme. Kept to replay it as a quieter ambience later.
  const ctx = sfx.ctx, want = false;
  if (want && !sfx.loop) {
    const src = ctx.createBufferSource(), gain = ctx.createGain();
    src.buffer = sfx.buffers.station_loop[0]; src.loop = true;
    gain.gain.setValueAtTime(0, ctx.currentTime); gain.gain.linearRampToValueAtTime(.35, ctx.currentTime + 1.5);
    src.connect(gain).connect(sfx.out); src.start();
    sfx.loop = {src, gain};
  } else if (!want && sfx.loop) {
    const {src, gain} = sfx.loop;
    sfx.loop = null;
    if (ctx) { gain.gain.setTargetAtTime(0, ctx.currentTime, .3); src.stop(ctx.currentTime + 1.5); }
  }
}
export function blip(t, {wave = 'sine', from = 440, to = from, dur = .12, gain = .3, noise = false, band = 0, attack = .004}, dest = sfx.out) {
  const ctx = sfx.ctx, g = ctx.createGain(), k = 1 + (Math.random() - .5) * .08;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + attack); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  let src;
  if (noise) {
    const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate), d = buffer.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    src = ctx.createBufferSource(); src.buffer = buffer;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = band || 1;
    f.frequency.setValueAtTime(from * k, t); f.frequency.exponentialRampToValueAtTime(Math.max(20, to * k), t + dur);
    src.connect(f).connect(g);
  } else {
    src = ctx.createOscillator(); src.type = wave;
    src.frequency.setValueAtTime(from * k, t); src.frequency.exponentialRampToValueAtTime(Math.max(1, to * k), t + dur);
    src.connect(g);
  }
  g.connect(dest); src.start(t); src.stop(t + dur + .02);
}
// 3. Where a sound comes from, as the player looks: full near the middle of the screen, fading past its edges,
// quieter as the view zooms out, and heard from its side.
export function placeOf(c) {
  const p = screenAt({x:c.x + .5, y:c.y + .5}), cx = view.w / 2, cy = view.h / 2;
  const off = Math.hypot((p.x - cx) / cx, (p.y - cy) / cy);
  // Full in the middle, about half at the edge of the screen, gone a little past it.
  const near = off <= 1 ? 1 - .55 * off : Math.max(0, .45 * (1.6 - off) / .6);
  // About half at the default view, almost nothing zoomed far out, full only from a close view (40) on.
  const zoom = Math.max(.03, Math.min(1, (cam.zoom - 6) / 34)) ** 1.5;
  return {gain:near * zoom, pan:Math.max(-1, Math.min(1, (p.x - cx) / cx)) * .9};
}
export function playSound(id, gap = .06, where = null) {
  const ctx = sfx.ctx;
  if (!ctx || !sfx.on || sfx.voices >= 10) return false;
  const now = ctx.currentTime;
  if (now - (sfx.last[id] ?? -9) < gap) return false;
  sfx.last[id] = now;
  const level = ctx.createGain();
  level.gain.value = (SOUND_LEVEL[id] ?? 1) * (where ? where.gain : 1);
  if (where && ctx.createStereoPanner) { const pan = ctx.createStereoPanner(); pan.pan.value = where.pan; level.connect(pan).connect(sfx.out); }
  else level.connect(sfx.out);
  const takes = sfx.buffers[id];
  if (takes?.length) {
    const src = ctx.createBufferSource();
    src.buffer = takes[Math.floor(Math.random() * takes.length)];
    src.connect(level); src.start();
    if (DUCKED.has(id)) duck(src.buffer.duration);
    sfx.voices++; src.onended = () => { sfx.voices--; };
    return true;
  }
  const s = SOUNDS[id];
  if (!s) return false;
  sfx.voices++;
  if (DUCKED.has(id)) duck(1.2);
  s.play((at, o) => blip(now + at, o, level));
  setTimeout(() => { sfx.voices--; }, 800);
  return true;
}
export function setLang(id) {
  keep(LANG_KEY, id);
  if (id === LANG) return;
  keepForReload();
  location.reload();
}

// The bindings other modules replace.
export const audioSet = {
  musicTick: (v) => (musicTick = v),
  placeOf: (v) => (placeOf = v),
  playSound: (v) => (playSound = v)
};
