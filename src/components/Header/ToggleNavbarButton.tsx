"use client";

import React from "react";

import { MenuSVG } from "@/SVGs";
import { useNavbarStore } from "@/store";

const ToggleNavbarButton: React.FC = () => {
    const { setIsOpened, isOpened } = useNavbarStore();

    const handleClick = () => setIsOpened(prev => !prev);

    return (
        <button
            id="toggleNavBarButton"
            onClick={handleClick}
            className={"p-0.5 rounded transition-[background-color,border-color] border border-transparent"
                .concat(isOpened ? " border-white" : "")
                .concat(" hover:bg-neutral-700 active:bg-black md:hidden")}
        >
            <MenuSVG className="pointer-events-none" width={24} height={24} />
        </button>
    );
};

export default ToggleNavbarButton;