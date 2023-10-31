import { shallow } from "zustand/shallow";
import { devtools } from "zustand/middleware";
import { createWithEqualityFn } from "zustand/traditional";

import { Screens } from "@/shared";

export interface LayoutStoreState {
    isOpened: boolean;
    screen: Screens;

    setIsOpened: TransformFunction<boolean>;
    setScreen: (documentWidth: number) => void;
}

export const useLayoutStore = createWithEqualityFn<LayoutStoreState>()(
    devtools((set, get) => ({
        isOpened: true,
        screen: Screens["2xl"],

        setIsOpened: value => set(prev => ({ isOpened: typeof value === "function" ? value(prev.isOpened) : value })),

        setScreen: width => {
            let screen: Screens = Screens["2xl"];

            if (width < Screens.sm) {
                screen = Screens.sm;
            } else if (width < Screens.md) {
                screen = Screens.md;
            } else if (width < Screens.lg) {
                screen = Screens.lg;
            } else if (width < Screens.xl) {
                screen = Screens.xl;
            }

            set({ screen });
        }
    })),
    shallow
);
