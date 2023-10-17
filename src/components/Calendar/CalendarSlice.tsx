"use client";

import React, { useMemo } from "react";

import GridCell from "./GridCell";
import { mapMonthDays, weekdayOrder } from "@/shared";

type CalendarSliceProps = CalendarSliceDate;

const CalendarSlice: React.FC<CalendarSliceProps> = ({ month, year }) => {
    const { current, previous } = useMemo(() => mapMonthDays(new Date(year, month, 1), { next: true }), [month, year]);

    return (
        <div>
            <div className="grid gap-1 grid-cols-[repeat(7,minmax(100px,1fr))] font-semibold text-lg mb-2">
                {weekdayOrder.map(day => (
                    <p className="capitalize text-center" key={day}>
                        {day}
                    </p>
                ))}
            </div>

            <div className="grid gap-1 grid-cols-[repeat(7,minmax(100px,1fr))]">
                {previous.map((_, index) => (
                    <div key={index} className="pointer-events-none"></div>
                ))}

                {current.map((_, index) => (
                    <GridCell key={index} day={index + 1} month={month} year={year} />
                ))}

                {/* {next.map((_, index) => (
                    <GridCell day={_} month={month} year={year} key={index} />
                ))} */}
            </div>
        </div>
    );
};

export default CalendarSlice;
