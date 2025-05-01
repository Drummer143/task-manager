import { useWindowResize } from "..";
import { render } from "../../../../../../scripts/setupTests";

describe("useWindowResize", () => {
	let listeners: Record<string, (e: MediaQueryListEvent) => void> = {};
	const matchMediaMock = vi.fn();

	beforeEach(() => {
		Object.defineProperty(window, "matchMedia", {
			writable: true,
			value: matchMediaMock
		});
		listeners = {};
		vi.clearAllMocks();
	});

	it("does nothing if matchMedia is not supported", () => {
		(window as unknown as { matchMedia: unknown }).matchMedia = undefined;

		const callback = vi.fn();

		const TestComponent = () => {
			useWindowResize("md", callback);
			return null;
		};

		render(<TestComponent />);
		expect(callback).not.toHaveBeenCalled();
	});

	it("handles string breakpoint correctly", () => {
		matchMediaMock.mockImplementation((query: string) => ({
			matches: query.includes("max-width: 767.98px"),
			media: query,
			addEventListener: (event: string, cb: (e: MediaQueryListEvent) => void) => {
				listeners[event] = cb;
			},
			removeEventListener: vi.fn()
		}));

		const callback = vi.fn();

		const TestComponent = () => {
			useWindowResize("md", callback);
			return null;
		};

		render(<TestComponent />);
		expect(callback).toHaveBeenCalledWith(true);

		listeners["change"]?.({ matches: false } as MediaQueryListEvent);
		expect(callback).toHaveBeenCalledWith(false);
	});

	it("handles numeric breakpoint correctly", () => {
		matchMediaMock.mockImplementation((query: string) => ({
			matches: query.includes("max-width: 500px"),
			media: query,
			addEventListener: (event: string, cb: (e: MediaQueryListEvent) => void) => {
				listeners[event] = cb;
			},
			removeEventListener: vi.fn()
		}));

		const callback = vi.fn();

		const TestComponent = () => {
			useWindowResize(500, callback);
			return null;
		};

		render(<TestComponent />);
		expect(callback).toHaveBeenCalledWith(true);

		listeners["change"]?.({ matches: false } as MediaQueryListEvent);
		expect(callback).toHaveBeenCalledWith(false);
	});
});



