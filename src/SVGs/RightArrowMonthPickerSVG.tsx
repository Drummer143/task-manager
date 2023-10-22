import React from "react";

type RightArrowMonthPickerSVGProps = React.JSX.IntrinsicElements["svg"];

export const RightArrowMonthPickerSVG: React.FC<RightArrowMonthPickerSVGProps> = props => (
    <svg width="800px" height="800px" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M256 120.768L306.432 64 768 512l-461.568 448L256 903.232 659.072 512z" fill="#fff" />
    </svg>
);
