import { useStorage } from "..";
import { act, renderHook } from "../../../../../../scripts/setupTests";

describe("useStorage", () => {
	const storageMock = (() => {
		let store: Record<string, string> = {};

		return {
			getItem: vi.fn((key: string) => store[key] ?? null),
			setItem: vi.fn((key: string, value: string) => {
				store[key] = value;
			}),
			removeItem: vi.fn((key: string) => {
				delete store[key];
			}),
			key: vi.fn((index: number) => Object.keys(store)[index]),
			length: Object.keys(store).length,
			clear: () => {
				store = {};
			}
		};
	})();

	beforeEach(() => {
		storageMock.getItem.mockClear();
		storageMock.setItem.mockClear();
		storageMock.removeItem.mockClear();
		storageMock.clear();
	});

	it("initializes with existing storage value", () => {
		storageMock.setItem("test", JSON.stringify("saved"));

		const { result } = renderHook(() => useStorage<string>("test", "default", false, storageMock));

		expect(result.current[0]).toBe("saved");
	});

	it("initializes with default value if nothing in storage", () => {
		const { result } = renderHook(() => useStorage<string>("test", "default", false, storageMock));

		expect(result.current[0]).toBe("default");
	});

	it("sets value and saves to storage", () => {
		const { result } = renderHook(() => useStorage<string>("test", "default", false, storageMock));

		act(() => {
			result.current[1]("new value");
		});

		expect(storageMock.setItem).toHaveBeenCalledWith("test", JSON.stringify("new value"));
		expect(result.current[0]).toBe("new value");
	});

	it("clears value and removes from storage", () => {
		const { result } = renderHook(() => useStorage<string>("test", "default", false, storageMock));

		act(() => {
			result.current[2]();
		});

		expect(storageMock.removeItem).toHaveBeenCalledWith("test");
		expect(result.current[0]).toBe(null);
	});

	it("handles invalid JSON gracefully", () => {
		storageMock.setItem("test", "not-json");

		const { result } = renderHook(() => useStorage("test", "fallback", false, storageMock));

		expect(result.current[0]).toBe("fallback");
	});

	it("listens to storage changes if enabled", () => {
		const { result, unmount } = renderHook(() => useStorage<string>("shared", undefined, true, storageMock));

		const event = new StorageEvent("storage", {
			key: "shared",
			newValue: JSON.stringify("updated")
		});

		act(() => {
			window.dispatchEvent(event);
		});

		expect(result.current[0]).toBe("updated");

		unmount();
	});

	it("ignores storage changes for other keys", () => {
		const { result } = renderHook(() => useStorage<string>("shared", "init", true, storageMock));

		const event = new StorageEvent("storage", {
			key: "other-key",
			newValue: JSON.stringify("nope")
		});

		act(() => {
			window.dispatchEvent(event);
		});

		expect(result.current[0]).toBe("init");
	});

	it("should call the function and set the new value", () => {
		const { result } = renderHook(() => useStorage<string>("test", "default", false, storageMock));

		act(() => {
			result.current[1](prevValue => (prevValue ? prevValue + " updated" : "updated"));
		});

		expect(storageMock.setItem).toHaveBeenCalledWith("test", JSON.stringify("default updated"));
		expect(result.current[0]).toBe("default updated");
	});

	it("should not call the function if the value is not a function", () => {
		const { result } = renderHook(() => useStorage<string>("test", "default", false, storageMock));

		act(() => {
			result.current[1]("new value");
		});

		expect(storageMock.setItem).toHaveBeenCalledWith("test", JSON.stringify("new value"));
		expect(result.current[0]).toBe("new value");
	});

	it("should call the function and pass previous value correctly when using setter function", () => {
		storageMock.setItem("test", JSON.stringify("initial"));

		const { result } = renderHook(() => useStorage<string>("test", "default", false, storageMock));

		act(() => {
			result.current[1](prevValue => prevValue + " updated");
		});

		expect(storageMock.setItem).toHaveBeenCalledWith("test", JSON.stringify("initial updated"));
		expect(result.current[0]).toBe("initial updated");
	});
});

