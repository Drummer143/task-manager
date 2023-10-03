"use client";

import React, { useEffect, useRef, useState } from "react";

type CalendarSliceProps = {
    startDate: CalendarSliceDate;
};

const weekdayOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const getFirstWeekFirstDate = (date: Date) => {
    const intl = Intl.DateTimeFormat("en-EN", { weekday: "long" });

    const firstDay = new Date(date.getFullYear(), date.getMonth(), 0);

    for (let i = 0; i < 7; i++) {
        if (intl.format(firstDay).toLocaleLowerCase() === weekdayOrder[0].toLocaleLowerCase()) {
            return firstDay;
        } else {
            firstDay.setDate(firstDay.getDate() - 1);
        }
    }

    return firstDay;
};

const getLastWeekLastDay = (date: Date) => {
    const intl = Intl.DateTimeFormat("en-EN", { weekday: "long" });

    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 7);

    for (let i = 6; i >= 0; i--) {
        if (intl.format(lastDay).toLocaleLowerCase() === weekdayOrder[6].toLocaleLowerCase()) {
            return lastDay;
        } else {
            lastDay.setDate(lastDay.getDate() - 1);
        }
    }

    return lastDay;
};

function calculateDaysDifference(startDate: Date, endDate: Date): number {
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    const timeDifference = endDate.getTime() - startDate.getTime();

    const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

    return daysDifference;
}

const CalendarSlice: React.FC<CalendarSliceProps> = ({ startDate }) => {
    const [currentDate] = useState(new Date(startDate.year, startDate.month, startDate.day));
    const [firstDayOfMonth] = useState(new Date(startDate.year, startDate.month, 1));
    const [lastDayOfMonth] = useState(new Date(startDate.year, startDate.month + 1, 0));
    const [countOfDayInMonth] = useState(lastDayOfMonth.getDate());

    const wrapper = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const rect = wrapper.current?.getBoundingClientRect();

        if (!rect) {
            return;
        }
    }, []);

    console.log(firstDayOfMonth);

    return (
        <div ref={wrapper}>
            <div className="grid grid-cols-[repeat(7,150px)]">
                {weekdayOrder.map(day => (
                    <p className="capitalize" key={day}>{day}</p>
                ))}
            </div>

            <div className="grid grid-cols-[repeat(7,150px)]">
                {firstDayOfMonth.getDay() !== 0 && new Array(firstDayOfMonth.getDay()).fill(undefined).map((_, index) => (
                    <div key={index}>p</div>
                ))}

                {new Array(countOfDayInMonth).fill(undefined).map((_, index) => (
                    <div key={index}>{index + 1}</div>
                ))}

                {lastDayOfMonth.getDay() !== 6 && new Array(6 - lastDayOfMonth.getDay()).fill(undefined).map((_, index) => (
                    <div key={index}>p</div>
                ))}
            </div>
        </div >
    );
};

export default CalendarSlice;
