"use client";

import React, { useEffect, useRef, useState } from "react";
import GridCell from "./GridCell";

type CalendarSliceProps = {
    startDate: CalendarSliceDate;
};

const weekdayOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const CalendarSlice: React.FC<CalendarSliceProps> = ({ startDate }) => {
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

    return (
        <div ref={wrapper} className="h-full overflow-y-auto p-2">
            <div className="grid gap-1 grid-cols-[repeat(7,minmax(100px,1fr))] font-semibold text-lg mb-2">
                {weekdayOrder.map(day => (
                    <p className="capitalize text-center" key={day}>
                        {day}
                    </p>
                ))}
            </div>

            <div className="grid gap-1 grid-cols-[repeat(7,minmax(100px,1fr))]">
                {firstDayOfMonth.getDay() !== 0 &&
                    new Array(firstDayOfMonth.getDay()).fill(undefined).map((_, index) => (
                        <div key={index} className="pointer-events-none"></div>
                    ))}

                {new Array(countOfDayInMonth).fill(undefined).map((_, index) => (
                    <GridCell key={index} day={index + 1} month={startDate.month} year={startDate.year} />
                ))}

                {/* {lastDayOfMonth.getDay() !== 6 &&
                    new Array(6 - lastDayOfMonth.getDay()).fill(undefined).map((_, index) => (
                        <div className="pointer-events-none" key={index}></div>
                    ))} */}
            </div>
        </div>
    );
};

export default CalendarSlice;
