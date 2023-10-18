import React from "react";

type ExpandMonthPickerSVGProps = React.JSX.IntrinsicElements["svg"];

export const ExpandMonthPickerSVG: React.FC<ExpandMonthPickerSVGProps> = (props) => (
    <svg
        width="800px"
        height="800px"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        stroke="#000000"
        {...props}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4.343 4.343l11.314 11.314m0 0h-9.9m9.9 0v-9.9"
        />
    </svg>
);
