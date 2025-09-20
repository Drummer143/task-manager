import { create } from "zustand";

interface ChatStoreState {
	selectedItems?: string[];

	setSelectedItems: (selectedItems: string[] | undefined) => void;
}

export const useStoreStore = create<ChatStoreState>((set, get) => ({
	setSelectedItems: (selectedItems: string[] | undefined) => set({ selectedItems })
}));

