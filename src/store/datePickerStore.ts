import { create } from "zustand";

export interface DatePickerState {
    view: "month" | "day";
    opened: boolean;
    currentDate: Date;
    displayedDate: Date;

    setOpened: TransformFunction<boolean>;
    setView: TransformFunction<DatePickerState["view"]>;
    setCurrentDate: TransformFunction<Date>;
    setDisplayedDate: TransformFunction<Date>;
}

export const useDatePickerStore = create<DatePickerState>(set => ({
    view: "day",
    opened: false,
    displayedDate: new Date(),
    currentDate: new Date(),

    setView: view =>
        set(prev => ({
            view: typeof view === "function" ? view(prev.view) : view
        })),

    setOpened: opened =>
        set(prev => ({
            opened: typeof opened === "function" ? opened(prev.opened) : opened
        })),

    setCurrentDate: date =>
        set(prev => ({
            currentDate: typeof date === "function" ? date(prev.currentDate) : date
        })),

    setDisplayedDate: date =>
        set(prev => ({
            displayedDate: typeof date === "function" ? date(prev.displayedDate) : date
        }))
}));
