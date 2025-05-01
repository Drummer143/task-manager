import { useDisclosure } from "..";
import { act, renderHook } from "../../../../../../scripts/setupTests";

describe("useDisclosure", () => {
	it("should toggle the state without initial value", () => {
		const { result } = renderHook(() => useDisclosure());

		expect(result.current.open).toBe(false);

		act(() => {
			result.current.onToggle();
		});

		expect(result.current.open).toBe(true);

		act(() => {
			result.current.onClose();
		});

		expect(result.current.open).toBe(false);

		act(() => {
			result.current.onOpen();
		});

		expect(result.current.open).toBe(true);

		act(() => {
			result.current.setOpen(false);
		});

		expect(result.current.open).toBe(false);
	});

	it("should toggle the state with initial value", () => {
		const { result } = renderHook(({ initial }) => useDisclosure(initial), { initialProps: { initial: true } });

		expect(result.current.open).toBe(true);

		act(() => {
			result.current.onToggle();
		});

		expect(result.current.open).toBe(false);
	});
});

