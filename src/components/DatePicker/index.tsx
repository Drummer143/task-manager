import React, { useEffect, useState } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";

import DayList from "./DayList";
import MonthList from "./MonthList";
import PickerHead from "./PickerHead";
import { useDatePickerStore } from "@/store";
import { ExpandMonthPickerSVG } from "@/SVGs";

type DatePickerProps = {
    onSelect: (date: Date) => void;

    current?: Date;
    from?: Date;
    to?: Date;
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
    from = new Date(0),
    to = new Date(3187209600000),
    current = new Date(),
    onSelect,
    hideViews
}) => {
    const { setView, view, opened, setOpened } = useDatePickerStore();

    const [displayedTime, setDisplayedTime] = useState(current);

    const animationControls = useAnimationControls();

    const handleMonthChange = (monthNumber: number) => {
        if (hideViews?.day) {
            setOpened(false);

            onSelect(new Date(displayedTime.setMonth(monthNumber)));
        } else {
            setDisplayedTime(prev => new Date(prev.setMonth(monthNumber)));

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

    useEffect(() => {
        if (view === "month") {
            animationControls.start({ transform: "translateX(-100%)" }, { duration: 0.15 });
        } else {
            animationControls.start({ transform: "translateX(0%)" }, { duration: 0.15 });
        }
    }, [animationControls, view]);

    useEffect(() => {
        setView(hideViews?.day ? "month" : "day");
    }, [hideViews?.day, setView]);

    useEffect(() => {
        if (opened) {
            setDisplayedTime(current);
        }
    }, [current, opened]);

    return (
        <motion.div
            className={"bg-[rgb(32,32,32)] rounded-t-lg transition-[border-radius] relative".concat(
                opened ? "" : " rounded-b-lg"
            )}
        >
            <AnimatePresence>
                {opened && (
                    <motion.div
                        initial={{ width: 0, height: 0 }}
                        exit={{ width: 0, height: 0, transition: { duration: 0.15 } }}
                        animate={{ width: 256, height: "fit-content", transition: { duration: 0.15 } }}
                        onKeyDown={handleEscapeKeyDown}
                        tabIndex={-1}
                        ref={ref => ref?.focus()}
                        className="absolute p-1 top-full bg-inherit text-white rounded-b rounded-tr overflow-hidden"
                    >
                        <PickerHead
                            onDateChange={setDisplayedTime}
                            displayedTime={displayedTime}
                            maxDate={to}
                            minDate={from}
                            onMonthButtonClick={() => setView("month")}
                            hideViews={hideViews}
                        />

                        <div className="w-full overflow-hidden mt-4">
                            <motion.div className="flex" animate={animationControls}>
                                {!hideViews?.day && (
                                    <DayList currentDate={displayedTime} onDayClick={handleSelectDate} />
                                )}

                                {!hideViews?.month && <MonthList onChange={handleMonthChange} />}
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={handleToggleButtonClick}
                className={"w-8 h-8 grid place-items-center transition-transform".concat(opened ? " -rotate-180" : "")}
            >
                <ExpandMonthPickerSVG stroke="#fff" width={20} height={20} />
            </button>
        </motion.div>
    );
};

export default DatePicker;
