export const SUGGESTION_OPEN_HOTKEY = { ctrl: true, code: "Space" } as const;

export function isSuggestionOpenHotkey(event: KeyboardEvent): boolean {
	return event.ctrlKey && event.code === SUGGESTION_OPEN_HOTKEY.code;
}
