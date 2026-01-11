import Worker from "./transfer.worker?worker";
import { InnerMessageToHost, MessageToHost, MessageToWorker } from "./types";

export class FileTransferWorker {
	worker: Worker;
	ready = false;

	readyListeners: (() => void)[] = [];

	constructor() {
		this.worker = new Worker({ name: "file-transfer-worker" });

		this.worker.addEventListener(
			"message",
			(event: MessageEvent<InnerMessageToHost>) => {
				if (event.data.type === "ready") {
					this.ready = true;

					this.readyListeners.forEach(listener => listener());
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
		if (this.ready) {
			listener();
		}

		this.readyListeners.push(listener);
	}

	uploadFile(file: File) {
		this.worker.postMessage({
			type: "upload",
			file
		} as MessageToWorker);
	}

	onmessage(listener: (message: MessageEvent<MessageToHost>) => void) {
		this.worker.addEventListener("message", listener);
	}

	dispose() {
		this.worker.terminate();
	}

	[Symbol.dispose]() {
		this.dispose();
	}
}

