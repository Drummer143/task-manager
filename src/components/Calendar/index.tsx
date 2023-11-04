"use client";

import React, { useEffect, useState } from "react";

import DatePicker from "../DatePicker";
import CalendarSlice from "./CalendarSlice";
import { useSearchParams, useRouter } from "next/navigation";

interface CalendarProps {
    params: {
        lang: I18NLocale;
    }
}

const Calendar: React.FC<CalendarProps> = ({ params: { lang } }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [{ minDate, maxDate }] = useState({ minDate: new Date(0), maxDate: new Date(3187209600000) });

    const searchParams = useSearchParams();
    const { replace } = useRouter();

    const handleCurrentDateChange = (date: Date) => {
        setCurrentDate(date);

        replace(location.origin + location.pathname + `?year=${date.getFullYear()}&month=${date.getMonth() + 1}`);
    };

    useEffect(() => {
        if (!searchParams) {
            return;
        }

        // const day = searchParams.get("day");
        const month = searchParams.get("month");
        const year = searchParams.get("year");

        const updatedCurrentDate = new Date(currentDate);

        if (year && !isNaN(+year)) {
            const yearNum = +year;

            if (minDate.getFullYear() <= yearNum && maxDate.getFullYear() >= yearNum) {
                updatedCurrentDate.setFullYear(yearNum);
            }
        }

        if (month && !isNaN(+month)) {
            const monthNum = Math.min(12, Math.max(1, +month - 1));

            updatedCurrentDate.setMonth(monthNum);
        }

        // if (day && !isNaN(+day)) {
        //     const countOfDaysInMonth = new Date(
        //         updatedCurrentDate.getFullYear(),
        //         updatedCurrentDate.getMonth() + 1,
        //         0
        //     ).getDate();

        //     const dayNum = Math.min(countOfDaysInMonth, Math.max(1, +day));

        //     updatedCurrentDate.setDate(dayNum);
        // }

        if (currentDate.getTime() !== updatedCurrentDate.getTime()) {
            setCurrentDate(updatedCurrentDate);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <DatePicker
                hideDayPicker
                lang={lang}
                currentDate={currentDate}
                onSelect={handleCurrentDateChange}
                fromDate={minDate}
                toDate={maxDate}
            />

            <CalendarSlice
                day={currentDate.getDate()}
                month={currentDate.getMonth()}
                year={currentDate.getFullYear()}
            />
        </>
    );
};

export default Calendar;
