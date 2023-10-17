import React, { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

import { months } from "@/shared";

type PickerHeadProps = {
    view: "month" | "day";
    displayedTime: Date;
    minDate: Date;
    maxDate: Date;

    onDateChange: React.Dispatch<React.SetStateAction<Date>>;
    onMonthButtonClick: React.MouseEventHandler<HTMLButtonElement>;
};

const PickerHead: React.FC<PickerHeadProps> = ({
    view,
    onDateChange,
    displayedTime,
    maxDate,
    minDate,
    onMonthButtonClick
}) => {
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

    useEffect(() => {
        setRealInputValue(displayedTime.getFullYear());
    }, [displayedTime]);

    return (
        <div className="flex pt-1 gap-1 justify-between items-center">
            <button
                type="button"
                onClick={setPrevYear}
                disabled={view === "month"
                    ? displayedTime.getFullYear() <= minDate.getFullYear()
                    : displayedTime.getFullYear() <= minDate.getFullYear() && displayedTime.getMonth() <= minDate.getMonth()
                }
                className={"transition-bg p-1 min-w-[38px] rounded hover:bg-neutral-500"
                    .concat(" active:bg-neutral-600 disabled:pointer-events-none disabled:opacity-50")}
            >
                <Image src="left-arrow-month-picker.svg" alt="left arrow" width="30" height="30" />
            </button>

            <AnimatePresence>
                {view === "day" &&
                    <motion.button
                        onClick={onMonthButtonClick}
                        initial={{ width: 0, padding: 0 }}
                        exit={{ width: 0, padding: 0, transition: { duration: 0.15 } }}
                        animate={{ width: "170%", padding: "0 6px", transition: { duration: 0.15 } }}
                        className={"h-[38px] text-center text-xl rounded transition-[background-color,padding]"
                            .concat(" overflow-hidden capitalize")
                            .concat(" hover:bg-neutral-500 active:bg-neutral-600")}
                    >
                        {months[displayedTime.getMonth()]}
                    </motion.button>
                }
            </AnimatePresence>

            <input
                value={realInputValue}
                onChange={handleInputValueChange}
                onKeyDown={handleInputEscapeKeyDown}
                onBlur={handleInputBlur}
                type="number"
                min={minDate.getFullYear()}
                max={maxDate.getFullYear()}
                className={"w-full h-[38px] text-center text-xl rounded bg-transparent number-input-arrows-hidden"
                    .concat(" border border-transparent transition-[background-color,border-color]")
                    .concat(" hover:bg-neutral-500 focus:valid:border-white focus:bg-neutral-800")
                    .concat(" invalid:border-red-700")}
            />

            <button
                type="button"
                disabled={view === "month"
                    ? displayedTime.getFullYear() >= maxDate.getFullYear()
                    : displayedTime.getFullYear() >= maxDate.getFullYear() && displayedTime.getMonth() >= maxDate.getMonth()}
                onClick={setNextYear}
                className={"transition-bg p-1 min-w-[38px] rounded hover:bg-neutral-500"
                    .concat(" active:bg-neutral-600 disabled:pointer-events-none disabled:opacity-50")}
            >
                <Image src="right-arrow-month-picker.svg" alt="left arrow" width="30" height="30" />
            </button>
        </div>
    );
};

export default PickerHead;