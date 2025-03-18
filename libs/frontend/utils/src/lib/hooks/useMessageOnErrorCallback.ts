import { useCallback } from "react";

import { App } from "antd";
import { JointContent } from "antd/es/message/interface";

interface UseMessageOnErrorCallbackProps<T extends unknown[]> {
	callback: (...args: T) => boolean | Promise<boolean>;
	message: JointContent | ((error?: unknown) => JointContent);
}

const getMessage = (message: UseMessageOnErrorCallbackProps<unknown[]>["message"], error?: unknown) =>
	typeof message === "function" ? message(error) : message;

export const useMessageOnErrorCallback = <T extends unknown[]>({
	callback,
	message
}: UseMessageOnErrorCallbackProps<T>) => {
	const sendMessage = App.useApp().message;

	const callbackWithError = useCallback(
		async (...args: T) => {
			try {
				const result = await callback(...args);

				if (!result) {
					sendMessage.error(getMessage(message));
				}
			} catch (error) {
				sendMessage.error(getMessage(message, error));
			}
		},
		[callback, message, sendMessage]
	);

	return callbackWithError;
};
