import { create } from "zustand";
import { persist } from "zustand/middleware";

import { DEFAULT_CALENDAR_CELL_WIDTH } from "@/shared";

interface CalendarState {
    cellWidth: number;
    cellCount: number;
    calendarShift: number

    setCellWidth: (cellWidth: number) => void;
    setCellCount: (cellCount: number) => void;
    setCalendarShift: (shift: "left" | "right" | number) => void;

    resetCalendarShift: () => void;

    // getCellWidth: () => void;
    // getCellHeight: () => void;
    // getCellCount: () => void;
}

export const useCalendarStore = create(
    persist<CalendarState>((set, get) => ({
        cellCount: 0,
        cellWidth: DEFAULT_CALENDAR_CELL_WIDTH,
        calendarShift: 0,

        setCellCount: (cellCount) => set({ cellCount }),
        setCellWidth: (cellWidth) => set({ cellWidth }),

        setCalendarShift: (shift) => {
            if (typeof shift === "number") {
                return set({ calendarShift: shift });
            }

            let calendarShift = get().calendarShift;
            const cellCount = get().cellCount;
            let realShift = cellCount;

            if (cellCount > 1) {
                realShift -= 1;
            }

            calendarShift += (shift === "left" ? -1 : 1) * realShift;

            set({ calendarShift });
        },

        resetCalendarShift: () => set({ calendarShift: 0 })
    }), {
        name: "STORE:CALENDAR",
        version: 1,
        partialize: state => {
            const s = { ...state, calendarShift: undefined };

            return s as any;
        }
    })
);
