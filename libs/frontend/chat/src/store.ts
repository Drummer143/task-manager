import { create } from "zustand";

interface ChatStoreState {
	ctxOpen?: boolean;
	ctxMenuIdx?: number;
	editingItemIdx?: number;
	editSubmitHandler?: (text: string) => void;

	setCtxOpen: (ctxOpen: boolean) => void;
	setCtxMenuIdx: (ctxMenuIdx: number | undefined) => void;
	setEditingItemInfo: (editingItemIdx: number, editSubmitHandler: (text: string) => void) => void;
	clearEditingItemInfo: () => void;
}

export const useChatStore = create<ChatStoreState>((set, get) => ({
	setCtxMenuIdx: ctxMenuIdx => set({ ctxMenuIdx }),

	setEditingItemInfo: (editingItemIdx, editSubmitHandler) =>
		set({ editingItemIdx, editSubmitHandler }),

	clearEditingItemInfo: () => set({ editingItemIdx: undefined, editSubmitHandler: undefined }),

	setCtxOpen: ctxOpen => set({ ctxOpen })
}));

