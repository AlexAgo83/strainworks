// The game's text. The French text is the key: L called on it, or a template tagged L, gives it in the chosen language,
// with the English {} filled in order, or {0}, {1} when English turns the sentence around.
// French until the page sets the language, which it does before the simulation's tables are written.
export let LANG: "fr" | "en" = "fr";
export let DEC = ",";
export let LOCALE = "fr-FR";
let english: Record<string, string> = {};
export function setLanguage(
	lang: "fr" | "en",
	dictionary: Record<string, string> = {},
): void {
	LANG = lang;
	english = dictionary;
	DEC = lang === "en" ? "." : ",";
	LOCALE = lang === "en" ? "en-US" : "fr-FR";
}
export function L(s: string | TemplateStringsArray, ...v: unknown[]): string {
	const fr = typeof s === "string" ? s : s.join("{}");
	let text = fr;
	if (LANG === "en") {
		const found = english[fr];
		if (found == null) L.missing.add(fr);
		else text = found;
	}
	let i = 0;
	return text.replace(/\{(\d?)\}/g, (_, n: string) =>
		String(v[n === "" ? i++ : +n]),
	);
}
L.missing = new Set<string>();
