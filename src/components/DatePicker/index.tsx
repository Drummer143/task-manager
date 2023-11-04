import React, { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

import DayList from "./DayList";
import MonthList from "./MonthList";
import PickerHead from "./PickerHead";
import OpenPickerButton from "./OpenPickerButton";
import { useOuterClick } from "@/hooks";
import { useDatePickerStore } from "@/store";

type DatePickerProps = {
    onSelect: (date: Date) => void;

    currentDate?: Date;
    fromDate?: Date;
    toDate?: Date;
    lang: I18NLocale;
    hideDayPicker?: boolean;
};

const DatePicker: React.FC<DatePickerProps> = ({
    fromDate = new Date(0),
    toDate = new Date(3187209600000),
    currentDate = new Date(),
    onSelect,
    hideDayPicker,
    lang
}) => {
    const { setView, view, opened, setOpened, setCurrentDate, displayedDate, setDisplayedDate } = useDatePickerStore();

    const datePickerRef = useRef<HTMLDivElement | null>(null);

    const handleMonthChange = (monthNumber: number) => {
        if (hideDayPicker) {
            setOpened(false);
        } else {
            setView("day");
        }

        setDisplayedDate(prev => new Date(prev.setMonth(monthNumber)));
    };

    const handleSelectDate = (date: Date) => {
        setOpened(false);

        setDisplayedDate(date);
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

    useEffect(() => setView(hideDayPicker ? "month" : "day"), [hideDayPicker, setView]);

    useEffect(() => setCurrentDate(currentDate), [currentDate, setCurrentDate]);

    useEffect(() => {
        if (opened) {
            setDisplayedDate(currentDate);

            if (!hideDayPicker) {
                setView("day");
            }
        } else {
            onSelect(displayedDate);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [opened]);

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
                            maxDate={toDate}
                            minDate={fromDate}
                            hideDayPicker={hideDayPicker}
                        />

                        <div className="w-full h-max overflow-hidden mt-4">
                            <div
                                className={"h-max flex transition-transform".concat(
                                    view === "month" && !hideDayPicker ? " -translate-x-full" : ""
                                )}
                            >
                                {!hideDayPicker && <DayList onDayClick={handleSelectDate} />}

                                <MonthList onChange={handleMonthChange} />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <OpenPickerButton hideDayPicker={hideDayPicker} lang={lang} />
        </motion.div>
    );
};

export default DatePicker;
