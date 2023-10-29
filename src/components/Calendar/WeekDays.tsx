import React, { useEffect, useState } from "react";

import { Screens, weekdayOrder } from "@/shared";
import { useLayoutStore } from "@/store";

const WeekDays: React.FC = () => {
    const { screen } = useLayoutStore();

    const [sliceCount, setSliceCount] = useState<number | undefined>(undefined);

    useEffect(() => {
        if (screen === Screens.sm) {
            setSliceCount(1);
        } else if (screen < Screens.lg) {
            setSliceCount(3);
        } else {
            setSliceCount(undefined);
        }
    }, [screen]);

    return (
        <div
            className={"grid gap-1 grid-cols-7 font-semibold text-lg mb-2"}
        >
            {weekdayOrder.map(day => (
                <p className="capitalize text-center overflow-hidden text-clip" key={day}>
                    {day.slice(0, sliceCount)}
                </p>
            ))}
        </div>
    );
};

export default WeekDays;