import {
	uploadComplete,
	UploadCompleteResponse,
	uploadInit,
	uploadVerify,
	uploadWholeFile
} from "@task-manager/api";

import { uploadFileByChunks } from "./uploadChunks";
import { calculateHash, sendProgressEvent } from "./utils";

export const handleUploadFlow = async (file: File) => {
	sendProgressEvent({
		type: "progress",
		data: { step: "initializingTransfer" }
	});

	const response = await uploadInit({
		body: {
			hash: await calculateHash(file),
			size: file.size
		}
	});

	if (response.nextStep === "verifyRanges") {
		sendProgressEvent({
			type: "progress",
			data: {
				step: "verifyingFile"
			}
		});

		const rangesToVerify = response.data.ranges.map(range =>
			file.slice(range.start, range.end)
		);

		const result = await uploadVerify({
			pathParams: {
				transactionId: response.data.transactionId
			},
			body: {
				ranges: Array.from(
					await Promise.all(rangesToVerify.map(range => range.arrayBuffer()))
				)
			}
		});

		sendProgressEvent({
			type: "uploadComplete",
			data: result
		});
	} else {
		let result: UploadCompleteResponse;

		if (response.nextStep === "startUploadChunked") {
			await uploadFileByChunks(
				file,
				response.data.chunkSize,
				response.data.maxConcurrentUploads,
				response.data.transactionId
			);

			sendProgressEvent({
				type: "progress",
				data: {
					step: "checkingIntegrity"
				}
			});

			result = await uploadComplete({
				pathParams: {
					transactionId: response.data.transactionId
				}
			});
		} else {
			result = await uploadWholeFile({
				pathParams: {
					transactionId: response.data.transactionId
				},
				body: file
			});
		}

		sendProgressEvent({
			type: "uploadComplete",
			data: result
		});
	}
};

