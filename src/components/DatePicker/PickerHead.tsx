import React, { useEffect, useState } from "react";

import { useDatePickerStore } from "@/store";
import { compareDates, isToday, months, selectedDateStyle, todayStyle } from "@/shared";
import { LeftArrowMonthPickerSVG, ReturnMonthPickerSVG, RightArrowMonthPickerSVG } from "@/SVGs";

type PickerHeadProps = {
    minDate: Date;
    maxDate: Date;

    onDateChange: React.Dispatch<React.SetStateAction<Date>>;

    hideViews?:
    | {
        day?: false;
        month?: true;
    }
    | {
        day?: true;
        month?: false;
    };
};

const PickerHead: React.FC<PickerHeadProps> = ({ onDateChange, maxDate, minDate, hideViews }) => {
    const { view, setView, displayedDate, currentDate } = useDatePickerStore();

    const [realInputValue, setRealInputValue] = useState(displayedDate.getFullYear());

    const setNextYear = () => {
        if (displayedDate.getFullYear() > maxDate.getFullYear()) {
            return;
        }

        onDateChange(prev => {
            const newDate = new Date(prev);

            if (view === "month") {
                newDate.setFullYear(prev.getFullYear() + 1);
            } else {
                newDate.setMonth(prev.getMonth() + 1);
            }

            return newDate;
        });
    };

    const setPrevYear = () => {
        if (displayedDate.getFullYear() < minDate.getFullYear()) {
            return;
        }

        onDateChange(prev => {
            const newDate = new Date(prev);

            if (view === "month") {
                newDate.setFullYear(prev.getFullYear() - 1);
            } else {
                newDate.setMonth(prev.getMonth() - 1);
            }

            return newDate;
        });
    };

    const handleInputValueChange: React.ChangeEventHandler<HTMLInputElement> = e => {
        const value = +e.target.value;

        setRealInputValue(value);

        if (isNaN(value) || minDate.getFullYear() > value || maxDate.getFullYear() < value) {
            return;
        }

        onDateChange(prev => new Date(prev.setFullYear(value)));
    };

    const handleInputBlur: React.FocusEventHandler<HTMLInputElement> = e => {
        if (realInputValue > maxDate.getFullYear()) {
            setRealInputValue(maxDate.getFullYear());
            onDateChange(prev => new Date(prev.setFullYear(maxDate.getFullYear())));
        } else if (realInputValue < minDate.getFullYear()) {
            setRealInputValue(minDate.getFullYear());
            onDateChange(prev => new Date(prev.setFullYear(minDate.getFullYear())));
        }
    };

    const handleInputEscapeKeyDown: React.KeyboardEventHandler<HTMLInputElement> = e => {
        if (e.code !== "Escape") {
            return;
        }

        e.stopPropagation();
        e.preventDefault();

        e.currentTarget.parentElement?.focus();
    };

    const handleToggleViewButtonClick = () => setView(prev => (prev === "day" ? "month" : "day"));

    useEffect(() => setRealInputValue(displayedDate.getFullYear()), [displayedDate]);

    return (
        <div className="flex pt-1 gap-1 justify-between items-center">
            <button
                type="button"
                onClick={setPrevYear}
                disabled={displayedDate.getTime() <= minDate.getTime()}
                className={"transition-bg p-1 min-w-[38px] rounded hover:bg-neutral-500".concat(
                    " active:bg-neutral-600 disabled:pointer-events-none disabled:opacity-50"
                )}
            >
                <LeftArrowMonthPickerSVG width={30} height={30} />
            </button>

            <div
                tabIndex={-1}
                className={"w-full".concat(hideViews?.day ? "" : " grid gap-1 grid-cols-[min-content,1fr]")}
            >
                {!hideViews?.day && (
                    <button
                        onClick={handleToggleViewButtonClick}
                        className={"h-[38px] text-center text-lg rounded transition-[background-color,padding]".concat(
                            " overflow-hidden capitalize transition-[width] grid place-content-center",
                            view === "day" ? " w-[100px]" : " w-[38px]",
                            isToday(displayedDate, "month") ? todayStyle : "",
                            compareDates(displayedDate, currentDate, "month") ? selectedDateStyle : " bg-transparent",
                            " hover:bg-neutral-500 active:bg-neutral-600",
                        )}
                    >
                        {view === "day" ? (
                            months[displayedDate.getMonth()]
                        ) : (
                            <ReturnMonthPickerSVG stroke="#fff" width={30} height={30} />
                        )}
                    </button>
                )}

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
                        isToday(displayedDate, "year") ? todayStyle : "",
                        compareDates(displayedDate, currentDate, "year") ? selectedDateStyle : " bg-transparent",
                    )}
                />
            </div>

            <button
                type="button"
                disabled={
                    view === "month"
                        ? displayedDate.getFullYear() >= maxDate.getFullYear()
                        : displayedDate.getFullYear() >= maxDate.getFullYear() &&
                        displayedDate.getMonth() >= maxDate.getMonth()
                }
                onClick={setNextYear}
                className={"transition-bg p-1 min-w-[38px] rounded hover:bg-neutral-500".concat(
                    " active:bg-neutral-600 disabled:pointer-events-none disabled:opacity-50"
                )}
            >
                <RightArrowMonthPickerSVG width={30} height={30} />
            </button>
        </div>
    );
};

export default PickerHead;
