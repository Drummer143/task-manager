import { FileTransferWorker } from "@task-manager/file-transfer-worker";

import { userManager } from "./userManager";

let worker: FileTransferWorker | undefined;

export const initWorker = (accessToken: string) => {
	if (worker) {
		return worker;
	}

	worker = new FileTransferWorker();

	worker.onReady(() => {
		worker?.injectAccessToken(accessToken);
	});

	userManager.events.addUserLoaded(user => {
		worker?.injectAccessToken(user.access_token);
	});

	return worker;
};

