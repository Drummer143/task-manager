import React, { useMemo } from "react";

import Day from "./Day";
import { mapMonthDays, weekdayOrder } from "@/shared";

type DayListProps = {
    currentDate: Date;

    onDayClick: (date: Date) => void
};

const DayList: React.FC<DayListProps> = ({ currentDate, onDayClick }) => {
    const { current, previous, next } = useMemo(() => mapMonthDays(currentDate), [currentDate]);
    const { nextMonth, nextMonthYear, prevMonth, prevMonthYear, currentMonth, currentMonthYear } = useMemo(() => {
        const nextMonth = new Date(currentDate);
        const prevMonth = new Date(currentDate);

        nextMonth.setMonth(currentDate.getMonth() + 1);
        prevMonth.setMonth(currentDate.getMonth() - 1);

        return {
            prevMonth: prevMonth.getMonth(),
            prevMonthYear: prevMonth.getFullYear(),
            currentMonth: currentDate.getMonth(),
            currentMonthYear: currentDate.getFullYear(),
            nextMonth: nextMonth.getMonth(),
            nextMonthYear: nextMonth.getFullYear()
        };
    }, [currentDate]);

    const handleDayClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
        const target = e.target as HTMLElement | null;

        if ((target as HTMLElement | null)?.tagName !== "BUTTON" || !target?.dataset) {
            return;
        }

        const day = +target.dataset.day!;
        const month = +target.dataset.month!;
        const year = +target.dataset.year!;
        const date = new Date(currentDate);

        date.setDate(day);
        date.setMonth(month);
        date.setFullYear(year);

        onDayClick(date);
    };

    return (
        <div
            className="min-w-full"
        >
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
                        key={day}
                        variant="half-transparent"
                    />
                ))}

                {current.map(day => (
                    <Day
                        month={currentMonth}
                        year={currentMonthYear}
                        date={day}
                        key={day}
                    />
                ))}

                {next.map(day => (
                    <Day
                        month={nextMonth}
                        year={nextMonthYear}
                        date={day}
                        key={day}
                        variant="half-transparent"
                    />
                ))}
            </div>
        </div>
    );
};

export default DayList;