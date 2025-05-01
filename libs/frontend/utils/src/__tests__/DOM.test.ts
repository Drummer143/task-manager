import { preventDefault, stopPropagation } from "..";

it("should call preventDefault", () => {
	const event = { preventDefault: vi.fn() };

	preventDefault(event);

	expect(event.preventDefault).toHaveBeenCalled();
});

it("should call stopPropagation", () => {
	const event = { stopPropagation: vi.fn() };

	stopPropagation(event);

	expect(event.stopPropagation).toHaveBeenCalled();
});

