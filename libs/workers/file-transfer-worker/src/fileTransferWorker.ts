import Worker from "./transfer.worker?worker";
import { InnerMessageToHost, MessageToHost, MessageToWorker } from "./types";

export type FileTransferWorkerEventMap = {
	message: MessageEvent<MessageToHost>;
	error: ErrorEvent;
	messageerror: MessageEvent;
};

export class FileTransferWorker {
	private worker: Worker;
	private _ready = false;

	private readyListeners: (() => void)[] = [];

	constructor() {
		this.worker = new Worker({ name: "file-transfer-worker" });

		this.worker.addEventListener(
			"message",
			(event: MessageEvent<InnerMessageToHost>) => {
				if (event.data.type === "ready") {
					this._ready = true;

					while (this.readyListeners.length > 0) {
						this.readyListeners.shift()!();
					}
				}
			},
			{ once: true }
		);

		this.worker.addEventListener("error", error => {
			console.error({ error });
		});

		this.worker.addEventListener("messageerror", error => {
			console.error({ error });
		});
	}

	onReady(listener: () => void) {
		if (this._ready) {
			listener();
		}

		this.readyListeners.push(listener);
	}

	uploadFile(fileId: string, uploadToken: string, file: File) {
		this.worker.postMessage({
			type: "upload",
			fileId,
			uploadToken,
			file
		} as MessageToWorker);
	}

	cancelUpload(fileId: string) {
		this.worker.postMessage({
			type: "abort",
			fileId
		} as MessageToWorker);
	}

	cancelAllUploads() {
		this.worker.postMessage({
			type: "abortAll"
		} as MessageToWorker);
	}

	get ready() {
		return this._ready;
	}

	injectAccessToken(accessToken: string) {
		this.worker.postMessage({
			type: "injectAccessToken",
			accessToken
		} as MessageToWorker);
	}

	on<T extends keyof FileTransferWorkerEventMap>(
		event: T,
		listener: (message: FileTransferWorkerEventMap[T]) => void,
		options?: boolean | AddEventListenerOptions
	) {
		this.worker.addEventListener(event, listener, options);

		return () => this.worker.removeEventListener(event, listener, options);
	}

	off<T extends keyof FileTransferWorkerEventMap>(
		event: T,
		listener: (message: FileTransferWorkerEventMap[T]) => void,
		options?: boolean | AddEventListenerOptions
	) {
		this.worker.removeEventListener(event, listener, options);
	}

	dispose() {
		this.worker.terminate();
	}

	[Symbol.dispose]() {
		this.dispose();
	}
}

