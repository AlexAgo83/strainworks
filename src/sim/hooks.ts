// What the simulation leaves to whoever runs it: messages, sounds, the selection and the player's settings.
// The page fills every hook before the first step; a hook left empty fails loudly instead of doing nothing.
type Hook = (...args: never[]) => unknown;
const unset =
	(name: string): Hook =>
	() => {
		throw new Error(`simulation hook ${name} is not set`);
	};
const NAMES = [
	"noteEarned",
	"forgetEvent",
	"onFresh",
	"testLine",
	"jobDone",
	"wormGone",
	"say",
	"refuse",
	"playNear",
	"playSound",
	"refresh",
	"tell",
	"showActions",
	"select",
	"diagnose",
	"save",
	"setHeading",
	"heard",
	"placeOf",
	"drawsRecipes",
	"stored",
] as const;
export type HookName = (typeof NAMES)[number];
// biome-ignore lint/suspicious/noExplicitAny: the hooks take the interface's own arguments, typed with the simulation in step 5.
export const hooks: Record<HookName, (...args: any[]) => any> =
	Object.fromEntries(NAMES.map((name) => [name, unset(name)])) as Record<
		HookName,
		Hook
	>;
