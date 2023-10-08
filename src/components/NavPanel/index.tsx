"use client";

import React from "react";

import NavPanelLink from "./NavPanelLink";

const NavPanel: React.FC = () => {
    return (
        <nav
            className="h-full min-w-[62px] max-w-[300px] flex flex-col gap-1 p-2 overflow-hidden bg-[rgb(36,36,36)]"
            style={{ width: `var(--navbar-width, ${localStorage.getItem("navbar-width") || 200}px)` }}
        >
            <NavPanelLink icon="calendar-nav.svg" href="/">Calendar</NavPanelLink>
            <NavPanelLink icon="friends-nav.svg" href="/friends">Friends</NavPanelLink>
        </nav>
    );
};

export default NavPanel;