"use client";

import React, { useState } from "react";

import CalendarSlice from "./CalendarSlice";

const Calendar: React.FC = () => {
    const [date] = useState(new Date());

    return (
        <CalendarSlice startDate={{ day: date.getDate(), month: date.getMonth(), year: date.getFullYear() }} />
    );
};

export default Calendar;
