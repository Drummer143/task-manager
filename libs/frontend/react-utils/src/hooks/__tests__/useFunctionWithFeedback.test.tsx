import { ModalFuncProps } from "antd";
import { Mock } from "vitest";

import { useFunctionWithFeedback } from "..";
import { act, renderWithAntd, waitFor } from "../../../../../../scripts/setupTests";

describe("useFunctionWithFeedback", () => {
	const trueCallback = vi.fn(() => true);
	const falseCallback = vi.fn(() => false);
	const rejectCallback = vi.fn(() => Promise.reject(new Error("Error")));
	const triggerButton = "Test";
	const errorMessage = "Error";
	const errorMessageFunction = vi.fn((error: unknown) => `[({${error}})]`);
	const successMessage = "Success";
	const confirm = {
		title: "Confirm",
		okText: "okText",
		cancelText: "cancelText"
	};

	const TestComponent = ({
		callback,
		confirm,
		message = errorMessage
	}: {
		callback: Mock;
		confirm?: ModalFuncProps;
		message?: string | ((error: unknown) => string);
	}) => {
		const func = useFunctionWithFeedback({
			callback,
			message,
			successMessage,
			confirm
		});

		return <button onClick={func}>{triggerButton}</button>;
	};

	afterEach(() => {
		vi.clearAllMocks();
	});

	test("should show success message", async () => {
		const screen = renderWithAntd(<TestComponent callback={trueCallback} />, "dark");

		const button = screen.getByText(triggerButton);

		act(() => {
			button.click();
		});

		expect(trueCallback).toHaveBeenCalledTimes(1);
		await waitFor(() => expect(screen.getByText(successMessage)).toBeInTheDocument());
		expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
		expect(screen.queryByText(confirm.title)).not.toBeInTheDocument();
	});

	test("should show error message wrapped in [({new Error(errorMessage)})]", async () => {
		const screen = renderWithAntd(<TestComponent callback={rejectCallback} message={errorMessageFunction} />);

		const button = screen.getByText(triggerButton);

		act(() => {
			button.click();
		});

		expect(rejectCallback).toHaveBeenCalledTimes(1);
		await waitFor(() => expect(screen.getByText(`[({${new Error(errorMessage)}})]`)).toBeInTheDocument());
		expect(errorMessageFunction).toHaveBeenCalledTimes(1);
		expect(screen.queryByText(successMessage)).not.toBeInTheDocument();
		expect(screen.queryByText(confirm.title)).not.toBeInTheDocument();
	});

	test("should show confirm message and error notification after confirmation", async () => {
		const screen = renderWithAntd(<TestComponent callback={rejectCallback} confirm={confirm} />);

		const button = screen.getByText(triggerButton);

		act(() => {
			button.click();
		});

		const confirmButton = screen.getByText(confirm.okText);

		await waitFor(() => expect(screen.getByText(confirm.title)).toBeInTheDocument());
		expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
		expect(screen.queryByText(successMessage)).not.toBeInTheDocument();

		act(() => {
			confirmButton.click();
		});

		await waitFor(() => expect(rejectCallback).toHaveBeenCalledTimes(1));

		await waitFor(() => expect(screen.getByText(errorMessage)).toBeInTheDocument());
	});

	test("callback returned false", async () => {
		const screen = renderWithAntd(<TestComponent callback={falseCallback} />);

		const button = screen.getByText(triggerButton);

		act(() => {
			button.click();
		});

		await waitFor(() => expect(falseCallback).toHaveBeenCalledTimes(1));
		expect(screen.queryByText(successMessage)).not.toBeInTheDocument();
	});

	test("declined confirmation", async () => {
		const screen = renderWithAntd(<TestComponent callback={falseCallback} confirm={confirm} />);

		const button = screen.getByText(triggerButton);

		act(() => {
			button.click();
		});

		const cancelButton = screen.getByText(confirm.cancelText);

		await waitFor(() => expect(screen.getByText(confirm.title)).toBeInTheDocument());

		act(() => {
			cancelButton.click();
		});

		await waitFor(() => expect(falseCallback).not.toHaveBeenCalled());
	});
});
