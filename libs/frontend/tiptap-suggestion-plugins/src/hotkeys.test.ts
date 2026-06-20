import { isSuggestionOpenHotkey, SUGGESTION_OPEN_HOTKEY } from "./hotkeys";

describe("SUGGESTION_OPEN_HOTKEY", () => {
	it("targets Ctrl+Space", () => {
		expect(SUGGESTION_OPEN_HOTKEY.ctrl).toBe(true);
		expect(SUGGESTION_OPEN_HOTKEY.code).toBe("Space");
	});
});

describe("isSuggestionOpenHotkey", () => {
	it("returns true for Ctrl+Space", () => {
		expect(
			isSuggestionOpenHotkey(new KeyboardEvent("keydown", { ctrlKey: true, code: "Space" }))
		).toBe(true);
	});

	it("returns false for Space without Ctrl", () => {
		expect(
			isSuggestionOpenHotkey(new KeyboardEvent("keydown", { code: "Space" }))
		).toBe(false);
	});

	it("returns false for Ctrl+Enter", () => {
		expect(
			isSuggestionOpenHotkey(new KeyboardEvent("keydown", { ctrlKey: true, code: "Enter" }))
		).toBe(false);
	});

	it("returns false for Ctrl+KeyA", () => {
		expect(
			isSuggestionOpenHotkey(new KeyboardEvent("keydown", { ctrlKey: true, code: "KeyA" }))
		).toBe(false);
	});

	it("returns false when no modifier and no space", () => {
		expect(
			isSuggestionOpenHotkey(new KeyboardEvent("keydown", { code: "Enter" }))
		).toBe(false);
	});
});
