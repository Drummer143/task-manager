"use client";

import React, { useState } from "react";

import DatePicker from "../DatePicker";
import CalendarSlice from "./CalendarSlice";

const Calendar: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());

    return (
        <>
            <DatePicker /* hideViews={{ day: true }} */ currentDate={currentDate} onSelect={setCurrentDate} />

            <CalendarSlice
                day={currentDate.getDate()}
                month={currentDate.getMonth()}
                year={currentDate.getFullYear()}
            />
        </>
    );
};

export default Calendar;
