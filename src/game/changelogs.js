// The release notes, under the game version: the list comes from changelogs/README.md, each version's notes are
// fetched only when its section scrolls into view. The notes are written in English.
import { L } from "../sim/text.ts";
import { $ } from "./main.js";

// The built site serves them beside the page; the prototype is one folder down from the repository's changelogs.
const BASE = location.pathname.includes('/prototype/') ? '../changelogs/' : 'changelogs/';
const escapeHTML = s => s.replace(/[&<>"]/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;'})[c]);
const inline = s => escapeHTML(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');

// The small Markdown the changelogs use: a title, paragraphs, "##" sections and "-" items wrapped on indented lines.
export function notesHTML(text) {
  const out = [];
  let list = null, para = null;
  const flush = () => {
    if (para) out.push(`<p>${inline(para)}</p>`);
    if (list) out.push(`<ul>${list.map(i => `<li>${inline(i)}</li>`).join('')}</ul>`);
    para = list = null;
  };
  for (const line of text.split('\n')) {
    if (/^# /.test(line)) continue;
    if (/^##+ /.test(line)) { flush(); out.push(`<h4>${inline(line.replace(/^##+ /, ''))}</h4>`); }
    else if (/^\s*- /.test(line) && !/^\s{2,}- /.test(line)) { if (para) flush(); (list ||= []).push(line.replace(/^\s*- /, '')); }
    else if (/^\s+\S/.test(line) && list) list[list.length - 1] += ` ${line.trim()}`;
    else if (!line.trim()) flush();
    else { if (list) flush(); para = para ? `${para} ${line.trim()}` : line.trim(); }
  }
  flush();
  return out.join('');
}

let listed = false;
export async function paintChangelogs() {
  if (listed) return;
  listed = true;
  const box = $('changelogs');
  box.innerHTML = `<p class="loading">${L('Chargement…')}</p>`;
  let files;
  try {
    const index = await (await fetch(`${BASE}README.md`)).text();
    files = [...index.matchAll(/\[`([\d.]+)`\]\((CHANGELOGS_[\d_]+\.md)\)/g)];
  } catch { files = []; }
  if (!files.length) { listed = false; box.innerHTML = `<p class="loading">${L('Notes de version indisponibles pour le moment.')}</p>`; return; }
  box.innerHTML = files.map(([, version, file]) => `<section data-file="${file}"><h3>${version}</h3><div class="notes"><p class="loading">${L('Chargement…')}</p></div></section>`).join('');
  const load = async section => {
    const notes = section.querySelector('.notes');
    try { notes.innerHTML = notesHTML(await (await fetch(BASE + section.dataset.file)).text()); }
    catch { notes.innerHTML = `<p class="loading">${L('Notes de version indisponibles pour le moment.')}</p>`; }
  };
  const seen = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const section = /** @type {HTMLElement} */ (entry.target);
      if (entry.isIntersecting && !section.dataset.loaded) { section.dataset.loaded = '1'; seen.unobserve(section); load(section); }
    }
  }, {root:box, rootMargin:'200px 0px'});
  for (const section of box.querySelectorAll('section')) seen.observe(section);
}
