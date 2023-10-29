"use client";

import React, { useMemo } from "react";

import GridCell from "./GridCell";
import WeekDays from "./WeekDays";
import { mapMonthDays } from "@/shared";

type CalendarSliceProps = CalendarSliceDate;

const CalendarSlice: React.FC<CalendarSliceProps> = ({ month, year }) => {
    const { current, previous } = useMemo(() => mapMonthDays(new Date(year, month, 1), { next: true }), [month, year]);

    return (
        <div>
            <WeekDays />

            <div className="grid gap-1 grid-cols-7">
                {previous.map((_, index) => (
                    <div key={index} className="pointer-events-none"></div>
                ))}

                {current.map((_, index) => (
                    <GridCell key={index} day={index + 1} month={month} year={year} />
                ))}
            </div>
        </div>
    );
};

export default CalendarSlice;
