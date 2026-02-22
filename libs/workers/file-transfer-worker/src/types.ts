import { UploadSuccessResponse } from "@task-manager/api/storage/schemas";

export interface StartUploadEvent {
	type: "upload";
	fileId: string;
	file: File;
	uploadToken: string;
}

export interface AbortUploadEvent {
	type: "abort";
	fileId: string;
}

export interface AbortAllEvent {
	type: "abortAll";
}

export interface InjectAccessTokenEvent {
	type: "injectAccessToken";
	accessToken: string;
}

export interface ReorderQueueEvent {
	type: "reorder";
	fileId: string;
	newIndex: number;
}

export interface SetPausedEvent {
	type: "setPaused";
	paused: boolean;
}

export type MessageToWorker =
	| StartUploadEvent
	| AbortUploadEvent
	| AbortAllEvent
	| InjectAccessTokenEvent
	| ReorderQueueEvent
	| SetPausedEvent;

export interface ErrorEvent {
	type: "error";
	fileId: string;
	error: unknown;
}

export interface UploadFileProgressEvent {
	type: "progress";
	fileId: string;
	data:
		| {
				step:
					| "computingHash"
					| "initializingTransfer"
					| "verifyingFile"
					| "checkingIntegrity"
					| "queued";
		  }
		| {
				step: "uploadingFile";
				progress: number;
		  };
}

export interface UploadCompleteEvent {
	type: "uploadComplete";
	fileId: string;
	data: UploadSuccessResponse;
}

export interface UploadCancelledEvent {
	type: "uploadCancelled";
	fileId: string;
}

export type MessageToHost =
	| ErrorEvent
	| UploadFileProgressEvent
	| UploadCompleteEvent
	| UploadCancelledEvent;

export interface ReadyEvent {
	type: "ready";
}

export type InnerMessageToHost = MessageToHost | ReadyEvent;

