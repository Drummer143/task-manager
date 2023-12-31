import React, { useMemo } from "react";

import MapDays from "./MapDays";
import { useDatePickerStore } from "@/store";
import { mapMonthDays, weekdayOrder } from "@/shared";

type DayListProps = {
    onDayClick: (date: Date) => void;
};

const DayList: React.FC<DayListProps> = ({ onDayClick }) => {
    const displayedDate = useDatePickerStore(state => state.displayedDate);

    const { current, previous, next } = useMemo(() => mapMonthDays(displayedDate), [displayedDate]);
    const { nextMonth, nextMonthYear, prevMonth, prevMonthYear, currentMonth, currentMonthYear } = useMemo(() => {
        const nextMonth = new Date(displayedDate);
        const prevMonth = new Date(displayedDate);

        nextMonth.setMonth(displayedDate.getMonth() + 1);
        prevMonth.setMonth(displayedDate.getMonth() - 1);

        return {
            prevMonth: prevMonth.getMonth(),
            prevMonthYear: prevMonth.getFullYear(),
            currentMonth: displayedDate.getMonth(),
            currentMonthYear: displayedDate.getFullYear(),
            nextMonth: nextMonth.getMonth(),
            nextMonthYear: nextMonth.getFullYear()
        };
    }, [displayedDate]);

    const handleDayClick: React.MouseEventHandler<HTMLDivElement> = e => {
        const target = e.target as HTMLElement | null;

        if ((target as HTMLElement | null)?.tagName !== "BUTTON" || !target?.dataset) {
            return;
        }

        const day = +target.dataset.day!;
        const month = +target.dataset.month!;
        const year = +target.dataset.year!;
        const date = new Date(year, month, day);

        onDayClick(date);
    };

    return (
        <div className="min-w-full">
            <div className="grid gap-1 grid-cols-7 font-normal mb-2">
                {weekdayOrder.map(day => (
                    <p className="capitalize text-center" key={day}>
                        {day.slice(0, 3)}
                    </p>
                ))}
            </div>

            <div className="grid gap-1 grid-cols-7" onClick={handleDayClick}>
                <MapDays days={previous} month={prevMonth} year={prevMonthYear} dayVariant="half-transparent" />
                <MapDays days={current} month={currentMonth} year={currentMonthYear} />
                <MapDays days={next} month={nextMonth} year={nextMonthYear} dayVariant="half-transparent" />
            </div>
        </div>
    );
};

export default DayList;
