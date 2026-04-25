import { DBSchema, IDBPDatabase, openDB } from "idb";

export interface DraftImage {
	id: string; // unique ID (uuid)
	draftId: string; // ID of the draft this image belongs to
	file: File; // The actual binary file
	fileName: string;
	mimeType: string;
	createdAt: number;
}

export interface AppDraftsDB extends DBSchema {
	draft_images: {
		key: string; // primary key (image id)
		value: DraftImage;
		indexes: { "by-draft": string }; // Index to find images by draftId
	};
}

const DB_NAME = "app_drafts";
const STORE_NAME = "draft_images";

// Singleton-like initialization
const getDb = async (): Promise<IDBPDatabase<AppDraftsDB>> => {
	return openDB<AppDraftsDB>(DB_NAME, 1, {
		upgrade(db) {
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });

				store.createIndex("by-draft", "draftId");
			}
		}
	});
};

export const saveImage = async (image: DraftImage): Promise<string> => {
	const db = await getDb();

	await db.put(STORE_NAME, image);

	return image.id;
};

export const getImagesByDraftId = async (draftId: string): Promise<DraftImage[]> => {
	const db = await getDb();

	return db.getAllFromIndex(STORE_NAME, "by-draft", draftId);
};

export const deleteImage = async (imageId: string): Promise<void> => {
	const db = await getDb();

	await db.delete(STORE_NAME, imageId);
};

export const clearDraft = async (draftId: string): Promise<void> => {
	const db = await getDb();
	const tx = db.transaction(STORE_NAME, "readwrite");
	const index = tx.store.index("by-draft");

	for await (const cursor of index.iterate(draftId)) {
		await cursor.delete();
	}

	await tx.done;
};

