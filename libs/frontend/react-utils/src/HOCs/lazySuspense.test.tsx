import { lazySuspense } from ".";
// eslint-disable-next-line @nx/enforce-module-boundaries
import { render, screen, waitFor } from "../../../../../scripts/setupTests";

const loadingText = "Loading...";
const mockedText = "Mocked Component";

const MockedComponent = () => <div>{mockedText}</div>;
const mockLoad = vi.fn(() => Promise.resolve({ default: MockedComponent }));

const LazyComponent = lazySuspense(mockLoad, <div>{loadingText}</div>);

test("should show fallback while loading", () => {
	render(<LazyComponent />);

	expect(screen.getByText(loadingText)).toBeInTheDocument();
});

test("should load the component after loading", async () => {
	render(<LazyComponent />);

	await waitFor(() => expect(screen.getByText(mockedText)).toBeInTheDocument());

	expect(screen.getByText(mockedText)).toBeInTheDocument();
});

