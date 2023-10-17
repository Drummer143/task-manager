import React, { useEffect, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";

import DayPicker from "./DayPicker";
import PickerHead from "./PickerHead";
import MonthPicker from "./MonthPicker";

type DatePickerProps = {
    current?: Date;
    from?: Date;
    to?: Date;
};

const DatePicker: React.FC<DatePickerProps> = ({
    from = new Date(0),
    to = new Date(3187209600000),
    current = new Date()
}) => {
    const [view, setView] = useState<"month" | "day">("day");
    const [displayedTime, setDisplayedTime] = useState(current);

    const animationControls = useAnimationControls();

    const handleMonthChange = (monthNumber: number) => {
        setDisplayedTime(prev => new Date(prev.setMonth(monthNumber)));

        setView("day");
    };

    useEffect(() => {
        const a = (e: KeyboardEvent) => {
            if (e.code === "KeyM") {
                setView(prev => prev === "day" ? "month" : "day");
            }
        };

        document.addEventListener("keypress", a);

        return () => {
            document.removeEventListener("keypress", a);
        };
    }, []);

    useEffect(() => {
        if (view === "month") {
            animationControls.start({ transform: "translateX(-100%)" }, { duration: 0.15 });
        } else {
            animationControls.start({ transform: "translateX(0%)" }, { duration: 0.15 });
        }
    }, [animationControls, view]);

    return (
        <div
            onKeyDown={console.log}
            tabIndex={-1}
            className="absolute p-1 w-64 bg-[rgb(32,32,32)] text-white rounded overflow-hidden"
        >
            <PickerHead
                onDateChange={setDisplayedTime}
                displayedTime={displayedTime}
                maxDate={to}
                minDate={from}
                view={view}
                onMonthButtonClick={() => setView("month")}
            />

            <div className="w-full overflow-hidden mt-4">
                <motion.div className="flex" animate={animationControls}>
                    <DayPicker currentDate={displayedTime} onDayClick={console.log} />

                    <MonthPicker onChange={handleMonthChange} />
                </motion.div>
            </div>
        </div>
    );
};

export default DatePicker;