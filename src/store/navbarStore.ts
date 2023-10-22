import { create } from "zustand";

export interface NavbarStoreState {
    isOpened: boolean;

    setIsOpened: TransformFunction<boolean>;
}

export const useNavbarStore = create<NavbarStoreState>((set, get) => ({
    isOpened: true,

    setIsOpened: value => set(prev => ({ isOpened: typeof value === "function" ? value(prev.isOpened) : value }))
}));
