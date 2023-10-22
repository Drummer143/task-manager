import { create } from "zustand";

export interface DatePickerState {
    view: "month" | "day";
    opened: boolean;

    setOpened: TransformFunction<boolean>;
    setView: TransformFunction<DatePickerState["view"]>;
}

export const useDatePickerStore = create<DatePickerState>(set => ({
    view: "day",
    opened: false,

    setView: view =>
        set(prev => ({
            view: typeof view === "function" ? view(prev.view) : view
        })),

    setOpened: opened =>
        set(prev => ({
            opened: typeof opened === "function" ? opened(prev.opened) : opened
        }))
}));
