import { create } from "zustand";

type CallbackHandler<ArgType = any, ReturnType = void> = (value: ArgType | ((prev: ArgType) => ArgType)) => ReturnType;

export interface DatePickerState {
    view: "month" | "day";
    opened: boolean;

    setOpened: CallbackHandler<boolean>;
    setView: CallbackHandler<DatePickerState["view"]>
}

export const useDatePickerStore = create<DatePickerState>((set) => ({
    view: "day",
    opened: false,

    setView: (view) =>
        set(prev => ({
            view: typeof view === "function" ? view(prev.view) : view
        })),

    setOpened: (opened) =>
        set(prev => ({
            opened: typeof opened === "function" ? opened(prev.opened) : opened
        }))
}));
