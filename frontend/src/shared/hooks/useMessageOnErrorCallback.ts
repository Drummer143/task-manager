import { useCallback } from "react";

import { App } from "antd";
import { JointContent } from "antd/es/message/interface";

interface UseMessageOnErrorCallbackProps<T extends unknown[]> {
	callback: (...args: T) => boolean | Promise<boolean>;
	message: JointContent;
}

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
					sendMessage.error(message);
				}
			} catch {
				sendMessage.error(message);
			}
		},
		[callback, message, sendMessage]
	);

	return callbackWithError;
};
