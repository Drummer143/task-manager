"use client";

import React, { useState } from "react";

import DatePicker from "../DatePicker";
import CalendarSlice from "./CalendarSlice";

const Calendar: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [intl] = useState(new Intl.DateTimeFormat(global.navigator?.language, { year: "numeric", month: "long" }));

    return (
        <>
            <div className="relative flex w-fit">
                <p>{intl.format(currentDate)}</p>

                <DatePicker hideViews={{ day: true }} current={currentDate} onSelect={setCurrentDate} />
            </div>

            <CalendarSlice
                day={currentDate.getDate()}
                month={currentDate.getMonth()}
                year={currentDate.getFullYear()}
            />
        </>
    );
};

export default Calendar;
