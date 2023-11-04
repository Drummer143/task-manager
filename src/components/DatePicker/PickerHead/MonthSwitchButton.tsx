import React from "react";

import { useDatePickerStore } from "@/store";
import { ReturnMonthPickerSVG } from "@/SVGs";
import { compareDates, isToday, months, selectedDateStyle, todayStyle } from "@/shared";

const MonthSwitchButton: React.FC = () => {
    const { displayedDate, view, currentDate, setView } = useDatePickerStore();

    const handleToggleViewButtonClick = () => setView(prev => (prev === "day" ? "month" : "day"));

    return (
        <button
            onClick={handleToggleViewButtonClick}
            className={"h-[38px] text-center text-lg rounded transition-[background-color,padding]".concat(
                " overflow-hidden capitalize transition-[width] grid place-content-center",
                view === "day"
                    ? " w-[100px]".concat(
                        isToday(displayedDate, "month") ? todayStyle : "",
                        compareDates(displayedDate, currentDate, "month") ? selectedDateStyle : " bg-transparent"
                    )
                    : " w-[38px] bg-transparent",
                " hover:bg-neutral-500 active:bg-neutral-600"
            )}
        >
            {view === "day" ? (
                months[displayedDate.getMonth()]
            ) : (
                <ReturnMonthPickerSVG strokeWidth={3} stroke="#fff" width={24} height={24} />
            )}
        </button>
    );
};

export default MonthSwitchButton;
