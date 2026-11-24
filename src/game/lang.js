// The page's language, read before the simulation is loaded, so its tables are written in it.
// The language holds for the whole page: changing it saves the game and reloads.
import { setLanguage } from "../sim/text.ts";

export const LANG_KEY = 'strainworks-lang';
export const LANG_SET = (() => { try { return localStorage.getItem(LANG_KEY); } catch (_) { return 'en'; } })();
// English until the player picks French. EN is the dictionary en.js declares beside the page.
setLanguage(LANG_SET === 'fr' ? 'fr' : 'en', typeof EN === 'undefined' ? {} : EN);
