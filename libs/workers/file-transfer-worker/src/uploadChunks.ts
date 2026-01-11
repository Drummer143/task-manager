import { uploadChunk } from "@task-manager/api";

import { DebugEvent } from "./types";
import { sendProgressEvent } from "./utils";

export const uploadFileByChunks = async (
	file: File,
	chunkSize: number,
	maxConcurrency: number,
	transactionId: string
) => {
	const totalChunks = Math.ceil(file.size / chunkSize);

	const queue = Array.from({ length: totalChunks }, (_, i) => i);

	let totalUploaded = 0;

	const updateGlobalProgress = (uploaded: number) => {
		totalUploaded += uploaded;

		const percent = (totalUploaded / file.size) * 100;

		sendProgressEvent({
			type: "progress",
			data: { step: "uploadingFile", progress: percent }
		});
	};

	postMessage({
		type: "debug",
		data: {
			chunkSize,
			maxConcurrency,
			totalChunks,
			transactionId
		}
	} as DebugEvent);

	const worker = async (): Promise<void> => {
		while (queue.length > 0) {
			try {
				const chunkIndex = queue.shift();

				if (chunkIndex === undefined) break;

				const start = chunkIndex * chunkSize;
				const end = Math.min(start + chunkSize, file.size);
				const chunkBlob = file.slice(start, end);

				await uploadChunk({
					pathParams: {
						transactionId
					},
					body: {
						chunk: chunkBlob,
						start,
						end,
						total: file.size
					}
				});

				updateGlobalProgress(chunkBlob.size);
			} catch (error) {
				sendProgressEvent({
					type: "error",
					error
				});

				throw error;
			}
		}
	};

	const activeWorkers = Array.from({ length: Math.min(maxConcurrency, totalChunks) }, () =>
		worker()
	);

	await Promise.all(activeWorkers);
};

