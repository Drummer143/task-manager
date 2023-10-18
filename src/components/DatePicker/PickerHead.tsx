import React, { useEffect, useState } from "react";

import { months } from "@/shared";
import { useDatePickerStore } from "../store";
import { LeftArrowMonthPickerSVG, ReturnMonthPickerSVG, RightArrowMonthPickerSVG } from "@/SVGs";

type PickerHeadProps = {
    displayedTime: Date;
    minDate: Date;
    maxDate: Date;

    onDateChange: React.Dispatch<React.SetStateAction<Date>>;
    onMonthButtonClick: React.MouseEventHandler<HTMLButtonElement>;

    hideViews?: {
        day?: false;
        month?: true;
    } | {
        day?: true;
        month?: false
    }
};

const PickerHead: React.FC<PickerHeadProps> = ({
    onDateChange,
    displayedTime,
    maxDate,
    minDate,
    hideViews
}) => {
    const { view, setView } = useDatePickerStore();

    const [realInputValue, setRealInputValue] = useState(displayedTime.getFullYear());

    const setNextYear = () => {
        if (displayedTime.getFullYear() > maxDate.getFullYear()) {
            return;
        };

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
        if (displayedTime.getFullYear() < minDate.getFullYear()) {
            return;
        };

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

    const handleInputValueChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
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

        e.currentTarget.blur();
    };

    const handleToggleViewButtonClick = () => setView(prev => prev === "day" ? "month" : "day");

    useEffect(() => {
        setRealInputValue(displayedTime.getFullYear());
    }, [displayedTime]);

    return (
        <div className="flex pt-1 gap-1 justify-between items-center">
            <button
                type="button"
                onClick={setPrevYear}
                disabled={displayedTime.getTime() <= minDate.getTime()}
                className={"transition-bg p-1 min-w-[38px] rounded hover:bg-neutral-500"
                    .concat(" active:bg-neutral-600 disabled:pointer-events-none disabled:opacity-50")}
            >
                <LeftArrowMonthPickerSVG width={30} height={30} />
            </button>

            <div className={"w-full".concat(hideViews?.day ? "" : " grid gap-1 grid-cols-[min-content,1fr]")}>
                {!hideViews?.day && (
                    <button
                        onClick={handleToggleViewButtonClick}
                        className={"h-[38px] text-center text-lg rounded transition-[background-color,padding]"
                            .concat(" overflow-hidden capitalize transition-[width] grid place-content-center")
                            .concat(" ", view === "day" ? "w-[100px]" : "w-[38px]")
                            .concat(" hover:bg-neutral-500 active:bg-neutral-600")}
                    >
                        {view === "day"
                            ? months[displayedTime.getMonth()]
                            : <ReturnMonthPickerSVG stroke="#fff" width={30} height={30} />
                        }
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
                    className={"w-full h-[38px] text-center text-lg rounded bg-transparent number-input-arrows-hidden"
                        .concat(" border border-transparent transition-[background-color,border-color]")
                        .concat(" hover:bg-neutral-500 focus:valid:border-white focus:bg-neutral-800")
                        .concat(" invalid:border-red-700")}
                />
            </div>

            <button
                type="button"
                disabled={view === "month"
                    ? displayedTime.getFullYear() >= maxDate.getFullYear()
                    : displayedTime.getFullYear() >= maxDate.getFullYear() && displayedTime.getMonth() >= maxDate.getMonth()}
                onClick={setNextYear}
                className={"transition-bg p-1 min-w-[38px] rounded hover:bg-neutral-500"
                    .concat(" active:bg-neutral-600 disabled:pointer-events-none disabled:opacity-50")}
            >
                <RightArrowMonthPickerSVG width={30} height={30} />
            </button>
        </div>
    );
};

export default PickerHead;