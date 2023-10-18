"use client";

import React from "react";

import NavPanelLink from "./NavPanelLink";
import { CalendarNavSVG, FriendsNavSVG } from "@/SVGs";

const NavPanel: React.FC = () => {
    return (
        <nav
            style={{ width: `var(--navbar-width, ${localStorage.getItem("navbar-width") || 200}px)` }}
            className={"grid-area-[nav] h-full min-w-[62px] max-w-[300px] flex flex-col gap-1 p-2"
                .concat(" overflow-hidden bg-[rgb(36,36,36)]")}
        >
            <NavPanelLink icon={<CalendarNavSVG width={30} height={30} />} href="/">Calendar</NavPanelLink>
            <NavPanelLink icon={<FriendsNavSVG width={30} height={30} />} href="/friends">Friends</NavPanelLink>
        </nav>
    );
};

export default NavPanel;