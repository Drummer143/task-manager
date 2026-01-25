import { FileTransferWorker } from "@task-manager/file-transfer-worker";

let worker: FileTransferWorker | undefined;

export const initWorker = () => {
	if (worker) {
		return worker;
	}

	worker = new FileTransferWorker();

	return worker;
};

