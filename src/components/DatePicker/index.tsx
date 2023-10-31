import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import DayList from "./DayList";
import MonthList from "./MonthList";
import PickerHead from "./PickerHead";
import { useOuterClick } from "@/hooks";
import { useDatePickerStore } from "@/store";
import { ExpandMonthPickerSVG } from "@/SVGs";

type DatePickerProps = {
    onSelect: (date: Date) => void;

    currentDate?: Date;
    fromDate?: Date;
    toDate?: Date;
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

const DatePicker: React.FC<DatePickerProps> = ({
    fromDate = new Date(0),
    toDate = new Date(3187209600000),
    currentDate = new Date(),
    onSelect,
    hideViews
}) => {
    const { setView, view, opened, setOpened, setCurrentDate, displayedDate, setDisplayedDate } = useDatePickerStore();

    const [intl] = useState(new Intl.DateTimeFormat(undefined, { year: "numeric", month: "long" }));

    const datePickerRef = useRef<HTMLDivElement | null>(null);

    const handleMonthChange = (monthNumber: number) => {
        if (hideViews?.day) {
            setOpened(false);

            onSelect(new Date(displayedDate.setMonth(monthNumber)));
        } else {
            setDisplayedDate(prev => new Date(prev.setMonth(monthNumber)));

            setView("day");
        }
    };

    const handleToggleButtonClick = () => setOpened(prev => !prev);

    const handleSelectDate = (date: Date) => {
        setOpened(false);

        onSelect(date);
    };

    const handleEscapeKeyDown: React.KeyboardEventHandler<HTMLDivElement> = e => {
        if (e.code === "Escape") {
            e.stopPropagation();
            e.preventDefault();

            setOpened(false);
        }
    };

    useOuterClick({
        active: opened,
        handler: () => setOpened(false),
        ref: datePickerRef
    });

    useEffect(() => setView(hideViews?.day ? "month" : "day"), [hideViews?.day, setView]);

    useEffect(() => setCurrentDate(currentDate), [currentDate, setCurrentDate]);

    useEffect(() => {
        if (opened) {
            setDisplayedDate(currentDate);
        }
    }, [currentDate, opened, setDisplayedDate]);

    return (
        <motion.div ref={datePickerRef} className="relative w-fit">
            <AnimatePresence>
                {opened && (
                    <motion.div
                        initial={{ width: 0, height: 0 }}
                        exit={{ width: 0, height: 0, transition: { duration: 0.15 } }}
                        animate={{ width: 256, height: "262px", transition: { duration: 0.15 } }}
                        onKeyDown={handleEscapeKeyDown}
                        tabIndex={-1}
                        ref={ref => ref?.focus()}
                        className="absolute p-1 top-full rounded-b rounded-tr overflow-hidden bg-[rgb(32,32,32)]"
                    >
                        <PickerHead
                            onDateChange={setDisplayedDate}
                            maxDate={toDate}
                            minDate={fromDate}
                            hideViews={hideViews}
                        />

                        <div className="w-full h-max overflow-hidden mt-4">
                            <div
                                className={"h-max flex transition-transform".concat(
                                    view === "month" ? " -translate-x-full" : ""
                                )}
                            >
                                {!hideViews?.day && <DayList onDayClick={handleSelectDate} />}

                                {!hideViews?.month && <MonthList onChange={handleMonthChange} />}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={handleToggleButtonClick}
                className={"px-2 py-1 flex items-center justify-center gap-2 bg-[rgb(32,32,32)]".concat(
                    " transition-[border-radius,background-color] rounded-t-lg",
                    " hover:bg-neutral-700 active:bg-neutral-900",
                    opened ? "" : " rounded-b-lg"
                )}
            >
                <p className="font-semibold text-lg">{intl.format(currentDate)}</p>

                <ExpandMonthPickerSVG
                    stroke="#fff"
                    width={20}
                    height={20}
                    className={"transition-transform".concat(opened ? " -rotate-180" : "")}
                />
            </button>
        </motion.div>
    );
};

export default DatePicker;
