import React from "react";

import Day from "./Day";
import { compareDates, isToday } from "@/shared";
import { useDatePickerStore } from "@/store";

interface MapDaysProps {
    days: number[];
    month: number;
    year: number;

    dayVariant?: Parameters<typeof Day>[0]["variant"]
}

const MapDays: React.FC<MapDaysProps> = ({ days, month, year, dayVariant = "normal" }) => {
    const currentDate = useDatePickerStore(state => state.currentDate);

    return days.map(day => {
        const date = new Date(year, month, day);

        return (
            <Day
                date={day}
                month={month}
                year={year}
                key={`${month}${day}`}
                isSelected={compareDates(date, currentDate, "day")}
                isToday={isToday(date, "day")}
                variant={dayVariant}
            />
        );
    });
};

export default MapDays;
