import { create } from "zustand";

interface ChatStoreState {
	ctxOpen?: boolean;
	ctxMenuId?: string;
	editingItemId?: string;
	editSubmitHandler?: (text: string) => void;

	setCtxOpen: (ctxOpen: boolean) => void;
	setCtxMenuId: (ctxMenuId: string | undefined) => void;
	setEditingItemId: (editingItemId: string, editSubmitHandler: (text: string) => void) => void;
	clearEditingItemInfo: () => void;
}

export const useChatStore = create<ChatStoreState>((set, get) => ({
	setCtxMenuId: ctxMenuId => set({ ctxMenuId }),

	setEditingItemId: (editingItemId, editSubmitHandler) =>
		set({ editingItemId, editSubmitHandler }),

	clearEditingItemInfo: () => set({ editingItemId: undefined, editSubmitHandler: undefined }),

	setCtxOpen: ctxOpen => set({ ctxOpen })
}));

