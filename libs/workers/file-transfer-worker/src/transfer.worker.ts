import { handleUploadFlow } from "./handleUploadFlow";
import init from "./hasher";
import { InnerMessageToHost, MessageToWorker } from "./types";
import { sendProgressEvent } from "./utils";

init().then(() => {
	self.onmessage = async (event: MessageEvent<MessageToWorker>) => {
		try {
			sendProgressEvent({
				type: "progress",
				data: { step: "computingHash" }
			});

			const file = event.data.file;

			await handleUploadFlow(file);
		} catch (error) {
			sendProgressEvent({
				type: "error",
				error: JSON.stringify(error)
			});
		}
	};

	postMessage({ type: "ready" } as InnerMessageToHost);
});

