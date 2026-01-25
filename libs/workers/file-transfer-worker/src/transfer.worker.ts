import { uploadCancel } from "@task-manager/api";

import init from "./hasher";
import { InnerMessageToHost, MessageToWorker, StartUploadEvent } from "./types";
import { handleUploadFlow } from "./uploadFlow/handleUploadFlow";
import { sendProgressEvent } from "./utils";

interface QueueItem {
	fileId: string;
	file: File;
	uploadToken: string;
	abortController: AbortController;
	transactionId?: string;
}

const queue: QueueItem[] = [];
let currentUpload: QueueItem | null = null;
let isProcessing = false;

const processQueue = async () => {
	if (isProcessing || queue.length === 0) {
		return;
	}

	isProcessing = true;

	while (queue.length > 0) {
		const item = queue.shift();

		if (!item) break;

		if (item.abortController.signal.aborted) {
			continue;
		}

		currentUpload = item;

		try {
			sendProgressEvent({
				type: "progress",
				fileId: item.fileId,
				data: { step: "computingHash" }
			});

			await handleUploadFlow({
				initialStep: { step: "init", file: item.file, uploadToken: item.uploadToken },
				fileId: item.fileId,
				onStepChange: step => {
					if ("transactionId" in step) {
						item.transactionId = step.transactionId;
					}
				},
				signal: item.abortController.signal
			});
		} catch (error) {
			if (item.abortController.signal.aborted) {
				sendProgressEvent({
					type: "uploadCancelled",
					fileId: item.fileId
				});
			} else {
				sendProgressEvent({
					type: "error",
					fileId: item.fileId,
					error: JSON.stringify(error)
				});
			}
		} finally {
			currentUpload = null;
		}
	}

	isProcessing = false;
};

const addToQueue = (data: StartUploadEvent) => {
	const abortController = new AbortController();

	const item: QueueItem = {
		fileId: data.fileId,
		file: data.file,
		uploadToken: data.uploadToken,
		abortController
	};

	queue.push(item);

	sendProgressEvent({
		type: "progress",
		fileId: data.fileId,
		data: { step: "queued" }
	});

	processQueue();
};

const abortUpload = (fileId: string) => {
	const queueIndex = queue.findIndex(item => item.fileId === fileId);

	if (queueIndex !== -1) {
		const item = queue[queueIndex];

		item.abortController.abort();
		queue.splice(queueIndex, 1);

		sendProgressEvent({
			type: "uploadCancelled",
			fileId
		});

		return;
	}

	if (currentUpload?.fileId === fileId) {
		currentUpload.abortController.abort();

		if (currentUpload.transactionId) {
			uploadCancel({
				pathParams: { transactionId: currentUpload.transactionId }
			}).catch(() => undefined);
		}
	}
};

const abortAll = () => {
	for (const item of queue) {
		item.abortController.abort();
		sendProgressEvent({
			type: "uploadCancelled",
			fileId: item.fileId
		});
	}
	queue.length = 0;

	if (currentUpload) {
		currentUpload.abortController.abort();

		if (currentUpload.transactionId) {
			uploadCancel({
				pathParams: { transactionId: currentUpload.transactionId }
			}).catch(() => undefined);
		}
	}
};

init().then(() => {
	self.onmessage = (event: MessageEvent<MessageToWorker>) => {
		switch (event.data.type) {
			case "upload":
				addToQueue(event.data);
				break;
			case "abort":
				abortUpload(event.data.fileId);
				break;
			case "abortAll":
				abortAll();
				break;
		}
	};

	postMessage({ type: "ready" } as InnerMessageToHost);
});

