import React from "react";

type LeftArrowMonthPickerSVGProps = React.JSX.IntrinsicElements["svg"];

export const LeftArrowMonthPickerSVG: React.FC<LeftArrowMonthPickerSVGProps> = props => (
    <svg width="800px" height="800px" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M768 903.232l-50.432 56.768L256 512l461.568-448 50.432 56.768L364.928 512z" fill="#fff" />
    </svg>
);
