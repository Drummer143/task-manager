"use client";

import React, { useState } from "react";

import DatePicker from "../DatePicker";
import CalendarSlice from "./CalendarSlice";

interface CalendarProps {
    params: {
        lang: I18NLocale;
    }
}

const Calendar: React.FC<CalendarProps> = ({ params: { lang } }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    return (
        <>
            <DatePicker
                hideViews={{ day: true }}
                lang={lang}
                currentDate={currentDate}
                onSelect={setCurrentDate}
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
