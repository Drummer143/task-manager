import React from "react";

import { months } from "@/shared";

type MonthListProps = {
    onChange: (month: number) => void;
};

const MonthList: React.FC<MonthListProps> = ({ onChange }) => {
    const handleMonthClick: React.MouseEventHandler<HTMLDivElement> = e => {
        const monthNumber = (e.target as HTMLElement | null)?.dataset.month;

        if (!monthNumber || isNaN(+monthNumber)) {
            return;
        }

        onChange(+monthNumber);
    };

    return (
        <div onClick={handleMonthClick} className="grid grid-cols-3 gap-1 min-w-full">
            {months.map((month, i) => (
                <button
                    type="button"
                    data-month={i}
                    key={month}
                    onClick={onChange ? () => onChange(i) : undefined}
                    className={"capitalize grid place-items-center h-10 rounded text-[15px]".concat(
                        " hover:bg-neutral-500 active:bg-neutral-600"
                    )}
                >
                    {month}
                </button>
            ))}
        </div>
    );
};

export default MonthList;
