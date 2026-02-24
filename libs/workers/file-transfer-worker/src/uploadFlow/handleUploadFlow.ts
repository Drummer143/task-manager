import {
	uploadComplete,
	uploadInit,
	uploadVerify,
	uploadWholeFile
} from "@task-manager/api/storage";

import { uploadFileByChunks } from "./uploadChunks";

import { MessageToHost } from "../types";
import { calculateHash, sendProgressEvent } from "../utils";

export type UploadStep =
	| { step: "init"; file: File; uploadToken: string }
	| {
			step: "verifyRanges";
			transactionId: string;
			ranges: Array<{ start: number; end: number }>;
			file: File;
	  }
	| {
			step: "uploadChunked";
			transactionId: string;
			chunkSize: number;
			maxConcurrent: number;
			missingChunks?: number[];
			file: File;
	  }
	| { step: "uploadWhole"; transactionId: string; file: File }
	| { step: "complete"; transactionId: string };

/**
 * Handles the file upload flow as a state machine.
 * Supports resuming from any step by passing the appropriate `initialStep`.
 *
 * ## Flow diagram:
 * ```
 *                    ┌─────────┐
 *                    │  init   │
 *                    └────┬────┘
 *                         │
 *            ┌────────────┼────────────┐
 *            │            │            │
 *            ▼            ▼            ▼
 *    ┌──────────────┐ ┌────────┐ ┌─────────────┐
 *    │ verifyRanges │ │ upload │ │ uploadWhole │
 *    │              │ │Chunked │ │             │
 *    └──────┬───────┘ └───┬────┘ └──────┬──────┘
 *           │             │             │
 *           │             ▼             │
 *           │      ┌──────────┐         │
 *           │      │ complete │         │
 *           │      └────┬─────┘         │
 *           │             │             │
 *           ▼             ▼             ▼
 *         ┌───────────────────────────────┐
 *         │        uploadComplete         │
 *         └───────────────────────────────┘
 * ```
 */
export const handleUploadFlow = async ({
	fileId,
	initialStep,
	onStepChange,
	onProgress = sendProgressEvent,
	signal
}: {
	initialStep: UploadStep;
	fileId: string;
	onStepChange: (step: UploadStep) => void;
	onProgress?: (event: MessageToHost) => void;
	signal?: AbortSignal;
}) => {
	let currentStep: UploadStep | null = initialStep;

	while (currentStep) {
		onStepChange(currentStep);

		switch (currentStep.step) {
			case "init": {
				onProgress({
					type: "progress",
					fileId,
					data: { step: "initializingTransfer" }
				});

				const response = await uploadInit(
					{
						hash: await calculateHash(currentStep.file, signal),
						uploadToken: currentStep.uploadToken,
						size: currentStep.file.size
					},
					{ signal }
				);

				if (response.nextStep === "verifyRanges") {
					currentStep = {
						step: "verifyRanges",
						transactionId: response.data.transactionId,
						ranges: response.data.ranges,
						file: currentStep.file
					};
				} else if (response.nextStep === "startUploadChunked") {
					currentStep = {
						step: "uploadChunked",
						transactionId: response.data.transactionId,
						chunkSize: response.data.chunkSize,
						maxConcurrent: response.data.maxConcurrentUploads,
						file: currentStep.file
					};
				} else {
					currentStep = {
						step: "uploadWhole",
						transactionId: response.data.transactionId,
						file: currentStep.file
					};
				}
				break;
			}

			case "verifyRanges": {
				onProgress({
					type: "progress",
					fileId,
					data: { step: "verifyingFile" }
				});

				const rangesToVerify = currentStep.ranges.map(range =>
					(currentStep as UploadStep & { step: "verifyRanges" }).file.slice(
						range.start,
						range.end
					)
				);

				const result = await uploadVerify(
					currentStep.transactionId,
					{
						ranges: Array.from(
							await Promise.all(
								rangesToVerify.map(range =>
									range
										.arrayBuffer()
										.then(array => Array.from(new Uint8Array(array)))
								)
							)
						)
					},
					{ signal }
				);

				onProgress({
					type: "uploadComplete",
					fileId,
					data: result
				});
				currentStep = null;
				break;
			}

			case "uploadChunked": {
				await uploadFileByChunks(
					currentStep.file,
					currentStep.chunkSize,
					currentStep.maxConcurrent,
					currentStep.transactionId,
					fileId,
					onProgress,
					signal,
					currentStep.missingChunks
				);

				currentStep = {
					step: "complete",
					transactionId: currentStep.transactionId
				};
				break;
			}

			case "uploadWhole": {
				const result = await uploadWholeFile(currentStep.transactionId, currentStep.file, {
					signal
				});

				onProgress({
					type: "uploadComplete",
					fileId,
					data: result
				});
				currentStep = null;
				break;
			}

			case "complete": {
				onProgress({
					type: "progress",
					fileId,
					data: { step: "checkingIntegrity" }
				});

				const result = await uploadComplete(currentStep.transactionId, { signal });

				onProgress({
					type: "uploadComplete",
					fileId,
					data: result
				});
				currentStep = null;
				break;
			}
		}
	}
};

