import { UploadFileProgressEvent } from "@task-manager/file-transfer-worker";

export const uploadStatusLocale: Record<UploadFileProgressEvent["data"]["step"], string> = {
	checkingIntegrity: "Checking integrity",
	computingHash: "Computing hash",
	initializingTransfer: "Initializing transfer",
	verifyingFile: "Verifying file",
	queued: "Queued",
	uploadingFile: "Uploading file"
};

