import { UploadCompleteResponse } from "@task-manager/api";

export interface StartUploadEvent {
	type: "upload";
	file: File;
}

export type MessageToWorker = StartUploadEvent;

export interface ErrorEvent {
	type: "error";
	error: unknown;
}

export interface DebugEvent {
	type: "debug";
	data: unknown;
}

export interface UploadFileProgressEvent {
	type: "progress";
	data:
		| {
				step:
					| "computingHash"
					| "initializingTransfer"
					| "verifyingFile"
					| "checkingIntegrity";
		  }
		| {
				step: "uploadingFile";
				progress: number;
		  };
}

export interface UploadCompleteEvent {
	type: "uploadComplete";
	data: UploadCompleteResponse;
}

export type MessageToHost = ErrorEvent | DebugEvent | UploadFileProgressEvent | UploadCompleteEvent;

export interface ReadyEvent {
	type: "ready";
}

export type InnerMessageToHost = MessageToHost | ReadyEvent;

