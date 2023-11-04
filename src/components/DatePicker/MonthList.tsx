import React from "react";

import { useDatePickerStore } from "@/store";
import { compareDates, isToday, months, selectedDateStyle, todayStyle } from "@/shared";

type MonthListProps = {
    onChange: (month: number) => void;
};

const MonthList: React.FC<MonthListProps> = ({ onChange }) => {
    const { displayedDate, currentDate } = useDatePickerStore();

    return (
        <div className="grid grid-cols-3 gap-1 min-w-full h-min">
            {months.map((month, i) => {
                const date = new Date(displayedDate.getFullYear(), i);

                return (
                    <button
                        type="button"
                        key={month}
                        onClick={onChange ? () => onChange(i) : undefined}
                        className={"capitalize grid place-items-center h-10 rounded text-[15px]".concat(
                            " hover:bg-neutral-500 active:bg-neutral-600",
                            compareDates(date, currentDate, "month") ? selectedDateStyle : "",
                            isToday(date, "month") ? todayStyle : ""
                        )}
                    >
                        {month}
                    </button>
                );
            })}
        </div>
    );
};

export default MonthList;
