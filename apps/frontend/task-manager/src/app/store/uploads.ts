import { UploadSuccessResponse } from "@task-manager/api";
import { UploadFileProgressEvent } from "@task-manager/file-transfer-worker";
import { create } from "zustand";

export type UploadStatus =
	| { type: "progress"; data: UploadFileProgressEvent["data"] }
	| { type: "complete"; data: UploadSuccessResponse }
	| { type: "error"; error: unknown }
	| { type: "cancelled" };

export interface UploadItem {
	fileId: string;
	fileName: string;
	fileSize: number;
	status: UploadStatus;
	queuePosition: number;
	addedAt: number;
}

interface UploadsState {
	uploads: Map<string, UploadItem>;
	queue: string[];

	addUpload: (fileId: string, fileName: string, fileSize: number) => void;
	updateProgress: (fileId: string, data: UploadFileProgressEvent["data"]) => void;
	setComplete: (fileId: string, data: UploadSuccessResponse) => void;
	setError: (fileId: string, error: unknown) => void;
	setCancelled: (fileId: string) => void;
	removeUpload: (fileId: string) => void;
	clearCompleted: () => void;
}

export const useUploadsStore = create<UploadsState>((set, get) => ({
	uploads: new Map(),
	queue: [],

	addUpload: (fileId, fileName, fileSize) => {
		set(state => {
			const uploads = new Map(state.uploads);
			const queue = [...state.queue, fileId];

			uploads.set(fileId, {
				fileId,
				fileName,
				fileSize,
				status: { type: "progress", data: { step: "queued" } },
				queuePosition: queue.length - 1,
				addedAt: Date.now()
			});

			return { uploads, queue };
		});
	},

	updateProgress: (fileId, data) => {
		set(state => {
			const uploads = new Map(state.uploads);
			const item = uploads.get(fileId);

			if (item) {
				uploads.set(fileId, {
					...item,
					status: { type: "progress", data }
				});
			}

			return { uploads };
		});
	},

	setComplete: (fileId, data) => {
		set(state => {
			const uploads = new Map(state.uploads);
			const item = uploads.get(fileId);

			if (item) {
				uploads.set(fileId, {
					...item,
					status: { type: "complete", data }
				});
			}

			const queue = state.queue.filter(id => id !== fileId);

			recalculateQueuePositions(uploads, queue);

			return { uploads, queue };
		});
	},

	setError: (fileId, error) => {
		set(state => {
			const uploads = new Map(state.uploads);
			const item = uploads.get(fileId);

			if (item) {
				uploads.set(fileId, {
					...item,
					status: { type: "error", error }
				});
			}

			const queue = state.queue.filter(id => id !== fileId);

			recalculateQueuePositions(uploads, queue);

			return { uploads, queue };
		});
	},

	setCancelled: (fileId) => {
		set(state => {
			const uploads = new Map(state.uploads);
			const item = uploads.get(fileId);

			if (item) {
				uploads.set(fileId, {
					...item,
					status: { type: "cancelled" }
				});
			}

			const queue = state.queue.filter(id => id !== fileId);

			recalculateQueuePositions(uploads, queue);

			return { uploads, queue };
		});
	},

	removeUpload: (fileId) => {
		set(state => {
			const uploads = new Map(state.uploads);

			uploads.delete(fileId);

			const queue = state.queue.filter(id => id !== fileId);

			recalculateQueuePositions(uploads, queue);

			return { uploads, queue };
		});
	},

	clearCompleted: () => {
		set(state => {
			const uploads = new Map(state.uploads);

			for (const [id, item] of uploads) {
				if (item.status.type === "complete" || item.status.type === "cancelled") {
					uploads.delete(id);
				}
			}

			return { uploads };
		});
	}
}));

function recalculateQueuePositions(uploads: Map<string, UploadItem>, queue: string[]) {
	queue.forEach((id, index) => {
		const item = uploads.get(id);

		if (item) {
			uploads.set(id, { ...item, queuePosition: index });
		}
	});
}

export const useUploadStatus = (fileId: string): UploadItem | undefined => {
	return useUploadsStore(state => state.uploads.get(fileId));
};

export const useActiveUploads = (): UploadItem[] => {
	return useUploadsStore(state => {
		const items: UploadItem[] = [];

		for (const item of state.uploads.values()) {
			if (item.status.type === "progress") {
				items.push(item);
			}
		}

		return items.sort((a, b) => a.queuePosition - b.queuePosition);
	});
};

export const useAllUploads = (): UploadItem[] => {
	return useUploadsStore(state => {
		return Array.from(state.uploads.values()).sort((a, b) => a.addedAt - b.addedAt);
	});
};
