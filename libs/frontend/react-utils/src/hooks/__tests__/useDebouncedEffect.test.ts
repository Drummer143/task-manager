import { useDebouncedEffect } from "..";
import { act, renderHook } from "../../../../../../scripts/setupTests";

describe("useDebouncedEffect", () => {
	it("should call the callback after the debounced value changes", async () => {
		const callback = vi.fn();
		const delay = 500;

		const { rerender } = renderHook(({ value }) => useDebouncedEffect(value, callback, delay), {
			initialProps: { value: "test" }
		});

		act(() => {
			rerender({ value: "test2" });
		});

		expect(callback).toHaveBeenCalledTimes(1);
		expect(callback).toHaveBeenCalledWith("test");

		act(() => {
			rerender({ value: "test3" });
		});

		expect(callback).toHaveBeenCalledTimes(1);

		await new Promise(resolve => setTimeout(resolve, delay * 1.1));

		expect(callback).toHaveBeenCalledWith("test3");
	});
});

