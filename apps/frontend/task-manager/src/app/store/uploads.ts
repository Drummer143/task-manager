import { useMemo } from "react";

import { UploadFileProgressEvent } from "@task-manager/file-transfer-worker";
import { create } from "zustand";

export type UploadStatus =
	| { type: "progress"; data: UploadFileProgressEvent["data"] }
	| { type: "error"; error: unknown };

export interface UploadItem {
	fileId: string;
	fileName: string;
	fileSize: number;
	status: UploadStatus;
	queuePosition: number;
}

interface UploadsState {
	uploads: Map<string, UploadItem>;
	queue: string[];
	isPaused: boolean;

	addUpload: (fileId: string, fileName: string, fileSize: number) => void;
	updateProgress: (fileId: string, data: UploadFileProgressEvent["data"]) => void;
	setComplete: (fileId: string) => void;
	setError: (fileId: string, error: unknown) => void;
	setCancelled: (fileId: string) => void;
	removeUpload: (fileId: string) => void;
	reorderQueue: (fileId: string, newIndex: number) => void;
	setPaused: (paused: boolean) => void;
}

export const useUploadsStore = create<UploadsState>((set, get) => ({
	uploads: new Map(),
	queue: [],
	isPaused: false,

	addUpload: (fileId, fileName, fileSize) => {
		set(state => {
			const uploads = new Map(state.uploads);
			const queue = [...state.queue, fileId];

			uploads.set(fileId, {
				fileId,
				fileName,
				fileSize,
				status: { type: "progress", data: { step: "queued" } },
				queuePosition: queue.length - 1
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

	setComplete: fileId => {
		set(state => {
			const uploads = new Map(state.uploads);

			uploads.delete(fileId);

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

	setCancelled: fileId => {
		set(state => {
			const uploads = new Map(state.uploads);

			uploads.delete(fileId);

			const queue = state.queue.filter(id => id !== fileId);

			recalculateQueuePositions(uploads, queue);

			return { uploads, queue };
		});
	},

	removeUpload: fileId => {
		set(state => {
			const uploads = new Map(state.uploads);

			uploads.delete(fileId);

			const queue = state.queue.filter(id => id !== fileId);

			recalculateQueuePositions(uploads, queue);

			return { uploads, queue };
		});
	},

	reorderQueue: (fileId, newIndex) => {
		set(state => {
			const queue = [...state.queue];
			const currentIndex = queue.indexOf(fileId);

			if (currentIndex === -1 || currentIndex === newIndex) {
				return state;
			}

			queue.splice(currentIndex, 1);
			queue.splice(newIndex, 0, fileId);

			const uploads = new Map(state.uploads);

			recalculateQueuePositions(uploads, queue);

			return { uploads, queue };
		});
	},

	setPaused: paused => {
		set({ isPaused: paused });
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

export const useAllUploads = (): UploadItem[] => {
	const uploads = useUploadsStore(state => state.uploads);

	return useMemo(
		() => Array.from(uploads.values()).sort((a, b) => a.queuePosition - b.queuePosition),
		[uploads]
	);
};

