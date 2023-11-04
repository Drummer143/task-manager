import React, { useEffect, useState } from "react";

import { useDatePickerStore } from "@/store";
import { compareDates, isToday, selectedDateStyle } from "@/shared";

interface YearInputProps {
    minDate: Date;
    maxDate: Date;
}

const YearInput: React.FC<YearInputProps> = ({ maxDate, minDate }) => {
    const { displayedDate, currentDate, setDisplayedDate } = useDatePickerStore();

    const [realInputValue, setRealInputValue] = useState(displayedDate.getFullYear());

    const handleInputValueChange: React.ChangeEventHandler<HTMLInputElement> = e => {
        const value = +e.target.value;

        if (!isNaN(value)) {
            setRealInputValue(value);
        }
    };

    const handleInputBlur: React.FocusEventHandler<HTMLInputElement> = () => {
        let year: number = realInputValue;

        if (realInputValue > maxDate.getFullYear()) {
            setRealInputValue(maxDate.getFullYear());

            year = maxDate.getFullYear();
        } else if (realInputValue < minDate.getFullYear()) {
            setRealInputValue(minDate.getFullYear());

            year = minDate.getFullYear();
        }

        setDisplayedDate(prev => prev.getFullYear() === realInputValue ? prev : new Date(prev.setFullYear(year)));
    };

    const handleInputEscapeKeyDown: React.KeyboardEventHandler<HTMLInputElement> = e => {
        if (e.code !== "Escape" && e.code !== "Enter") {
            return;
        }

        e.stopPropagation();
        e.preventDefault();

        e.currentTarget.parentElement?.focus();
    };

    useEffect(() => setRealInputValue(displayedDate.getFullYear()), [displayedDate]);

    return (
        <input
            value={realInputValue}
            onChange={handleInputValueChange}
            onKeyDown={handleInputEscapeKeyDown}
            onBlur={handleInputBlur}
            type="number"
            min={minDate.getFullYear()}
            max={maxDate.getFullYear()}
            className={"w-full h-[38px] text-center text-lg number-input-arrows-hidden".concat(
                " border border-transparent transition-[background-color,border-color] rounded",
                " hover:bg-neutral-500 focus:valid:border-white focus:bg-neutral-800 invalid:border-red-700",
                isToday(displayedDate, "year") ? " outline outline-2 outline-slate-500 -outline-offset-2" : "",
                compareDates(displayedDate, currentDate, "year") ? selectedDateStyle : " bg-transparent"
            )}
        />
    );
};

export default YearInput;
