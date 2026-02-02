import { FileTransferWorker, MessageToHost } from "@task-manager/file-transfer-worker";

import { useUploadsStore } from "./store/uploads";
import { userManager } from "./userManager";

let worker: FileTransferWorker | undefined;
let storeListenerAttached = false;

const handleWorkerMessage = (event: MessageEvent<MessageToHost>) => {
	const store = useUploadsStore.getState();

	switch (event.data.type) {
		case "progress":
			store.updateProgress(event.data.fileId, event.data.data);
			break;
		case "uploadComplete":
			store.setComplete(event.data.fileId, event.data.data);
			break;
		case "error":
			store.setError(event.data.fileId, event.data.error);
			break;
		case "uploadCancelled":
			store.setCancelled(event.data.fileId);
			break;
	}
};

export const initWorker = (accessToken?: string) => {
	if (worker) {
		return worker;
	}

	worker = new FileTransferWorker();

	worker.onReady(() => {
		if (accessToken) {
			worker?.injectAccessToken(accessToken);
		}

		if (!storeListenerAttached) {
			worker?.on("message", handleWorkerMessage);
			storeListenerAttached = true;
		}
	});

	userManager.events.addUserLoaded(user => {
		worker?.injectAccessToken(user.access_token);
	});

	return worker;
};

export const uploadFile = (
	fileId: string,
	fileName: string,
	fileSize: number,
	uploadToken: string,
	file: File
) => {
	const store = useUploadsStore.getState();

	store.addUpload(fileId, fileName, fileSize);

	worker?.uploadFile(fileId, uploadToken, file);
};

export const cancelUpload = (fileId: string) => {
	worker?.cancelUpload(fileId);
};

export const cancelAllUploads = () => {
	worker?.cancelAllUploads();
};

