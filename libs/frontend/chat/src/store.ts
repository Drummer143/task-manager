import { create } from "zustand";

interface ChatStoreState {
	selectedItems?: string[];
	editingItemIdx?: number;
	editSubmitHandler?: (text: string) => void;

	setSelectedItems: (selectedItems: string[] | undefined) => void;
	setEditingItemInfo: (
		editingItemIdx: number,
		editSubmitHandler: (text: string) => void
	) => void;
	clearEditingItemInfo: () => void;
}

export const useChatStore = create<ChatStoreState>((set, get) => ({
	setSelectedItems: selectedItems => set({ selectedItems }),

	setEditingItemInfo: (editingItemIdx, editSubmitHandler) =>
		set({ editingItemIdx, editSubmitHandler }),

	clearEditingItemInfo: () => set({ editingItemIdx: undefined, editSubmitHandler: undefined })
}));

