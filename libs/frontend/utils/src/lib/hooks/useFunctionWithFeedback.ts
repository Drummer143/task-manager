import { useCallback } from "react";

import { App, ModalFuncProps } from "antd";
import { JointContent } from "antd/es/message/interface";

interface useFunctionWithFeedbackProps<T extends unknown[]> {
	callback: (...args: T) => boolean | Promise<boolean>;
	message: false | JointContent | ((error?: unknown) => JointContent);

	confirm?: false | ModalFuncProps;
	successMessage?: false | JointContent;
}

const getMessage = (message: useFunctionWithFeedbackProps<unknown[]>["message"], error?: unknown) =>
	typeof message === "function" ? message(error) : message;

export const useFunctionWithFeedback = <T extends unknown[]>({
	callback,
	message: errorMessage,
	confirm,
	successMessage
}: useFunctionWithFeedbackProps<T>) => {
	const { message, modal } = App.useApp();

	const callbackWithError = useCallback(
		async (...args: T) => {
			try {
				if (confirm && !(await modal.confirm(confirm))) {
					return;
				}

				const result = await callback(...args);

				if (!result) {
					message.error(getMessage(errorMessage));
				} else if (successMessage) {
					message.success(successMessage);
				}
			} catch (error) {
				message.error(getMessage(errorMessage, error));
			}
		},
		[callback, message, modal, confirm, errorMessage, successMessage]
	);

	return callbackWithError;
};
