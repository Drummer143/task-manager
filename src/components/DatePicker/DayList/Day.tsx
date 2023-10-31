import React from "react";

import { selectedDateStyle, todayStyle } from "@/shared";

type DayProps = {
    date: number;
    month: number;
    year: number;

    isSelected?: boolean;
    isToday?: boolean;
    variant?: "normal" | "half-transparent";
} & Omit<React.JSX.IntrinsicElements["button"], "className" | "children" | "type">;

const Day: React.FC<DayProps> = ({ date, month, year, variant, isSelected, isToday, ...buttonProps }) => (
    <button
        type="button"
        data-day={date}
        data-month={month}
        data-year={year}
        className={"text-center rounded transition-bg hover:bg-neutral-500 active:bg-neutral-600".concat(
            variant === "half-transparent" ? " opacity-50" : "",
            isSelected ? selectedDateStyle : "",
            isToday ? todayStyle : ""
        )}
        {...buttonProps}
    >
        {date}
    </button>
);

export default Day;
