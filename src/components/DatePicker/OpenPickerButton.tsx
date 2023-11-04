import React, { useState } from "react";

import { ExpandMonthPickerSVG } from "@/SVGs";
import { useDatePickerStore } from "@/store";

interface OpenPickerButtonProps {
    lang: I18NLocale;
}

const OpenPickerButton: React.FC<OpenPickerButtonProps> = ({ lang }) => {
    const { currentDate, opened, setOpened } = useDatePickerStore();

    const [intl] = useState(new Intl.DateTimeFormat(lang, { year: "numeric", month: "long" }));

    const handleToggleButtonClick = () => setOpened(prev => !prev);

    return (
        <button
            onClick={handleToggleButtonClick}
            className={"px-2 py-1 flex items-center justify-center gap-2 bg-[rgb(32,32,32)]".concat(
                " transition-[border-radius,background-color] rounded-t-lg",
                " hover:bg-neutral-700 active:bg-neutral-900",
                opened ? "" : " rounded-b-lg"
            )}
        >
            <p className="font-semibold text-lg capitalize">{intl.format(currentDate)}</p>

            <ExpandMonthPickerSVG
                stroke="#fff"
                width={20}
                height={20}
                className={"transition-transform".concat(opened ? " -rotate-180" : "")}
            />
        </button>
    );
};

export default OpenPickerButton;
