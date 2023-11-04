import React from "react";

import YearInput from "./YearInput";
import MonthSwitchButton from "./MonthSwitchButton";
import { useDatePickerStore } from "@/store";
import { LeftArrowMonthPickerSVG, RightArrowMonthPickerSVG } from "@/SVGs";

// TODO: ВЫНЕСТИ В ОТДЕЛЬНЫЕ КОМПОНЕНТЫ ИНПУТ И КНОПКУ

type PickerHeadProps = {
    minDate: Date;
    maxDate: Date;

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

const PickerHead: React.FC<PickerHeadProps> = ({ maxDate, minDate, hideViews }) => {
    const { view, displayedDate, setDisplayedDate } = useDatePickerStore();

    const setNextYear = () => {
        if (displayedDate.getFullYear() > maxDate.getFullYear()) {
            return;
        }

        setDisplayedDate(prev => {
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

        setDisplayedDate(prev => {
            const newDate = new Date(prev);

            if (view === "month") {
                newDate.setFullYear(prev.getFullYear() - 1);
            } else {
                newDate.setMonth(prev.getMonth() - 1);
            }

            return newDate;
        });
    };

    return (
        <div className="flex pt-1 gap-1 justify-between items-stretch">
            <button
                type="button"
                onClick={setPrevYear}
                disabled={displayedDate.getTime() <= minDate.getTime()}
                className={"transition-bg p-1 min-w-[38px] rounded grid place-items-center".concat(
                    " hover:bg-neutral-500 active:bg-neutral-600 disabled:pointer-events-none disabled:opacity-50"
                )}
            >
                <LeftArrowMonthPickerSVG width={22} height={22} />
            </button>

            <div
                tabIndex={-1}
                className={`w-full ${hideViews?.day ? "" : " grid gap-1 grid-cols-[min-content,1fr]"}`}
            >
                {!hideViews?.day && <MonthSwitchButton />}

                <YearInput maxDate={maxDate} minDate={minDate} />
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
                className={"transition-bg p-1 min-w-[38px] rounded grid place-items-center".concat(
                    " hover:bg-neutral-500 active:bg-neutral-600 disabled:pointer-events-none disabled:opacity-50"
                )}
            >
                <RightArrowMonthPickerSVG width={22} height={22} />
            </button>
        </div>
    );
};

export default PickerHead;
