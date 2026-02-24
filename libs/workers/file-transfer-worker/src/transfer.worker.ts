import { insertAccessToken } from "@task-manager/api";
import { uploadCancel } from "@task-manager/api/storage";

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
let isPaused = false;

let ejectAccessTokenInterceptors: (() => void) | undefined;

const processQueue = async () => {
	if (isProcessing || queue.length === 0 || isPaused) {
		return;
	}

	isProcessing = true;

	while (queue.length > 0 && !isPaused) {
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
			uploadCancel(currentUpload.transactionId).catch(() => undefined);
		}

		sendProgressEvent({
			type: "uploadCancelled",
			fileId
		});
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
			uploadCancel(currentUpload.transactionId).catch(() => undefined);
		}
	}
};

const reorderQueue = (fileId: string, newIndex: number) => {
	// If reordering to position 0 and there's a current upload, interrupt it
	if (newIndex === 0 && currentUpload && currentUpload.fileId !== fileId) {
		// Put current upload back to queue at position 1 (after the new first item)
		const currentItem = currentUpload;

		currentItem.abortController.abort();

		if (currentItem.transactionId) {
			uploadCancel(currentItem.transactionId).catch(() => undefined);
		}

		// Create new item for re-queue (need fresh abort controller)
		const reQueueItem: QueueItem = {
			fileId: currentItem.fileId,
			file: currentItem.file,
			uploadToken: currentItem.uploadToken,
			abortController: new AbortController()
		};

		// Find the item being moved to front
		const movingIndex = queue.findIndex(item => item.fileId === fileId);

		if (movingIndex !== -1) {
			const [movingItem] = queue.splice(movingIndex, 1);

			// Insert: [movingItem, reQueueItem, ...rest]
			queue.unshift(reQueueItem);
			queue.unshift(movingItem);
		}

		sendProgressEvent({
			type: "progress",
			fileId: currentItem.fileId,
			data: { step: "queued" }
		});

		return;
	}

	// Normal reorder within queue
	const currentIndex = queue.findIndex(item => item.fileId === fileId);

	if (currentIndex === -1 || currentIndex === newIndex) {
		return;
	}

	const [item] = queue.splice(currentIndex, 1);

	queue.splice(newIndex, 0, item);
};

const setPaused = (paused: boolean) => {
	isPaused = paused;

	if (!paused) {
		processQueue();
	}
};

init().then(() => {
	self.onmessage = (event: MessageEvent<MessageToWorker>) => {
		switch (event.data.type) {
			case "upload":
				if (ejectAccessTokenInterceptors === null) {
					throw new Error("Access token is not injected");
				}

				addToQueue(event.data);
				break;
			case "abort":
				abortUpload(event.data.fileId);
				break;
			case "abortAll":
				abortAll();
				break;
			case "injectAccessToken": {
				ejectAccessTokenInterceptors?.();

				const token = event.data.accessToken;

				insertAccessToken(() => token);

				processQueue();
				break;
			}
			case "reorder":
				reorderQueue(event.data.fileId, event.data.newIndex);
				break;
			case "setPaused":
				setPaused(event.data.paused);
				break;
		}
	};

	postMessage({ type: "ready" } as InnerMessageToHost);
});

