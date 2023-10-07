"use client";

import React, { useEffect, useRef, useState } from "react";

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
        <div ref={wrapper}>
            <div className="grid grid-cols-[repeat(7,150px)]">
                {weekdayOrder.map(day => (
                    <p className="capitalize" key={day}>
                        {day}
                    </p>
                ))}
            </div>

            <div className="grid grid-cols-[repeat(7,150px)]">
                {firstDayOfMonth.getDay() !== 0 &&
                    new Array(firstDayOfMonth.getDay()).fill(undefined).map((_, index) => <div key={index}></div>)}

                {new Array(countOfDayInMonth).fill(undefined).map((_, index) => (
                    <div key={index}>{index + 1}</div>
                ))}

                {lastDayOfMonth.getDay() !== 6 &&
                    new Array(6 - lastDayOfMonth.getDay()).fill(undefined).map((_, index) => <div key={index}></div>)}
            </div>
        </div>
    );
};

export default CalendarSlice;
