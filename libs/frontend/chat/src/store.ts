import { create } from "zustand";

interface ChatStoreState {
	ctxOpen?: boolean;
	ctxMenuId?: string;
	editingItemId?: string;
	replayMessage?: {
		id: string;
		text: string;
		senderName: string;
	};
	scrollToItemId?: string;
	highlightedItemId?: string;

	editSubmitHandler?: (text: string) => void;

	setCtxOpen: (ctxOpen: boolean) => void;
	setCtxMenuId: (ctxMenuId: string | undefined) => void;
	setEditingItemId: (editingItemId: string, editSubmitHandler: (text: string) => void) => void;
	setReplayMessageId: (
		replayMessageId: { id: string; text: string; senderName: string } | undefined
	) => void;
	setHighlightedItemId: (highlightedItemId: string | undefined) => void;
	clearEditingItemInfo: () => void;
	setScrollToItemId: (scrollToItemId: string | undefined) => void;
}

export const useChatStore = create<ChatStoreState>((set, get) => ({
	setCtxMenuId: ctxMenuId => set({ ctxMenuId }),

	setEditingItemId: (editingItemId, editSubmitHandler) =>
		set({ editingItemId, editSubmitHandler }),

	setHighlightedItemId: highlightedItemId => set({ highlightedItemId }),

	clearEditingItemInfo: () => set({ editingItemId: undefined, editSubmitHandler: undefined }),

	setCtxOpen: ctxOpen => set({ ctxOpen }),

	setReplayMessageId: replayMessage => set({ replayMessage }),

	setScrollToItemId: scrollToItemId => set({ scrollToItemId })
}));

