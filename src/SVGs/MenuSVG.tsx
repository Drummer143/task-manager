import React from "react";

type MenuSVGProps = React.JSX.IntrinsicElements["svg"];

export const MenuSVG: React.FC<MenuSVGProps> = (props) => (
    <svg
        width="800px"
        height="800px"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        stroke="#fff"
        {...props}
    >
        <path
            d="M4 6H20M4 12H20M4 18H20"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);
