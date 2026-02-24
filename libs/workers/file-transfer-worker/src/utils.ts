import { uploadCancel } from "@task-manager/api/storage";

import { FileHasher } from "./hasher/wasm_source";
import { MessageToHost } from "./types";

export const calculateHash = async (file: File, signal?: AbortSignal) => {
	const hasher = new FileHasher();

	const fileReader = file.stream().getReader();

	while (true) {
		checkAborted(signal);

		const { value, done } = await fileReader.read();

		if (done) {
			break;
		}

		hasher.update(value);
	}

	return hasher.digest();
};

// export interface LocalStorageFileInfo {
// 	name: string;
// 	size: number;
// 	progress: UploadFileProgressEvent;

// 	hash?: string;
// 	transactionId?: string;
// }

// const createComparator = (target: LocalStorageFileInfo) => (item: LocalStorageFileInfo) =>
// 	(item.transactionId && item.transactionId === target.transactionId) ||
// 	(item.hash && item.hash === target.hash) ||
// 	(item.name === target.name && item.size === target.size);

// export const getUnfinishedUploads = () => {
// 	try {
// 		const data = localStorage.getItem("fileTransfer");

// 		if (!data) {
// 			return null;
// 		}

// 		return JSON.parse(data) as LocalStorageFileInfo[];
// 	} catch {
// 		return null;
// 	}
// };

// export const saveInLocalStorage = (data: LocalStorageFileInfo) => {
// 	const currentData = getUnfinishedUploads();

// 	if (!currentData) {
// 		return;
// 	}

// 	const dataIndex = currentData.findIndex(createComparator(data));

// 	if (dataIndex === -1) {
// 		currentData.push(data);
// 	} else {
// 		currentData[dataIndex] = data;
// 	}

// 	localStorage.setItem("fileTransfer", JSON.stringify(currentData));
// };

export const sendProgressEvent = (event: MessageToHost) => {
	postMessage(event);
};

export const checkAborted = (signal?: AbortSignal, transactionId?: string) => {
	if (signal?.aborted) {
		if (transactionId) {
			uploadCancel(transactionId).catch(() => undefined);
		}
		throw new DOMException("Upload aborted", "AbortError");
	}
};

