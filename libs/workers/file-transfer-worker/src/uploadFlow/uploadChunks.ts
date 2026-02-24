import { uploadChunk } from "@task-manager/api/storage";

import { MessageToHost } from "../types";
import { checkAborted, sendProgressEvent } from "../utils";

export const uploadFileByChunks = async (
	file: File,
	chunkSize: number,
	maxConcurrency: number,
	transactionId: string,
	fileId: string,
	onProgress: (event: MessageToHost) => void = sendProgressEvent,
	signal?: AbortSignal,
	missingChunks?: number[]
) => {
	const totalChunks = Math.ceil(file.size / chunkSize);

	const queue = missingChunks
		? [...missingChunks]
		: Array.from({ length: totalChunks }, (_, i) => i);

	let totalUploaded = 0;

	const updateGlobalProgress = (uploaded: number) => {
		totalUploaded += uploaded;

		const percent = (totalUploaded / file.size) * 100;

		onProgress({
			type: "progress",
			fileId,
			data: { step: "uploadingFile", progress: percent }
		});
	};

	const worker = async (): Promise<void> => {
		while (queue.length > 0) {
			checkAborted(signal, transactionId);

			try {
				const chunkIndex = queue.shift();

				if (chunkIndex === undefined) break;

				const start = chunkIndex * chunkSize;
				const end = Math.min(start + chunkSize, file.size);
				const chunkBlob = file.slice(start, end);

				await uploadChunk(transactionId, chunkBlob, {
					signal,
					headers: { "Content-Range": `bytes ${start}-${end}/${file.size}` }
				});

				updateGlobalProgress(chunkBlob.size);
			} catch (error) {
				onProgress({
					type: "error",
					fileId,
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

