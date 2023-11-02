/* eslint-disable no-console */
/* eslint-disable max-len */

import React, { useMemo } from "react";

import Day from "./Day";
import { useDatePickerStore } from "@/store";
import { compareDates, isToday, mapMonthDays, weekdayOrder } from "@/shared";

type DayListProps = {
    onDayClick: (date: Date) => void;
};

const DayList: React.FC<DayListProps> = ({ onDayClick }) => {
    const { currentDate, displayedDate } = useDatePickerStore();

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
        const date = new Date(displayedDate);

        date.setDate(day);
        date.setMonth(month);
        date.setFullYear(year);

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
                {previous.map(day => (
                    <Day
                        date={day}
                        month={prevMonth}
                        year={prevMonthYear}
                        key={`${prevMonth}${day}`}
                        isSelected={compareDates(new Date(prevMonthYear, prevMonth, day), currentDate, "day")}
                        isToday={isToday(new Date(prevMonthYear, prevMonth, day), "day")}
                        variant="half-transparent"
                    />
                ))}

                {current.map(day => (
                    <Day
                        month={currentMonth}
                        year={currentMonthYear}
                        date={day}
                        key={`${currentMonth}${day}`}
                        isSelected={compareDates(new Date(currentMonthYear, currentMonth, day), currentDate, "day")}
                        isToday={isToday(new Date(currentMonthYear, currentMonth, day), "day")}
                    />
                ))}

                {next.map(day => (
                    <Day
                        month={nextMonth}
                        year={nextMonthYear}
                        date={day}
                        key={`${nextMonth}${day}`}
                        isSelected={compareDates(new Date(nextMonthYear, nextMonth, day), currentDate, "day")}
                        isToday={isToday(new Date(nextMonthYear, nextMonth, day), "day")}
                        variant="half-transparent"
                    />
                ))}
            </div>
        </div>
    );
};

export default DayList;
