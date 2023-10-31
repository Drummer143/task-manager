"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import NavPanelLink from "./NavPanelLink";
import { Screens } from "@/shared";
import { useOuterClick } from "@/hooks";
import { useLayoutStore } from "@/store";
import { CalendarNavSVG, FriendsNavSVG } from "@/SVGs";

const NavPanel: React.FC = () => {
    const { isOpened, setIsOpened, screen } = useLayoutStore();

    const navRef = useRef<HTMLElement | null>(null);

    const [isMobile, setIsMobile] = useState(false);

    useOuterClick({
        handler: e => {
            if ((e.target as HTMLElement | null)?.id !== "toggleNavBarButton") {
                setIsOpened(false);
            }
        },
        ref: navRef,
        active: isMobile && isOpened
    });

    useEffect(() => {
        if (screen > Screens.md && isMobile) {
            setIsMobile(false);
            setIsOpened(true);
        } else if (screen <= Screens.md && !isMobile) {
            setIsMobile(true);
            setIsOpened(false);
        }
    }, [isMobile, screen, setIsOpened]);

    return (
        <AnimatePresence>
            {isOpened && (
                <motion.nav
                    ref={navRef}
                    animate={{ translateX: 0, transition: { duration: 0.15 } }}
                    exit={{ translateX: "-100%", transition: { duration: 0.15 } }}
                    initial={{ translateX: "-100%" }}
                    style={{
                        width: isMobile
                            ? "100%"
                            : `var(--navbar-width, ${global.localStorage?.getItem("navbar-width") || 200}px)`
                    }}
                    className={"flex-shrink-0 h-full min-w-[var(--navbar-min-width)] flex flex-col gap-1".concat(
                        " p-2 overflow-hidden bg-[rgb(36,36,36)]",
                        isMobile
                            ? " fixed z-30 max-w-[75vw]"
                            : " max-w-[300px] sticky top-0 left-0 max-lg:w-[0px_!important]"
                    )}
                >
                    <NavPanelLink icon={<CalendarNavSVG width={30} height={30} />} href="/">
                        Calendar
                    </NavPanelLink>
                    <NavPanelLink icon={<FriendsNavSVG width={30} height={30} />} href="/friends">
                        Friends
                    </NavPanelLink>
                </motion.nav>
            )}
        </AnimatePresence>
    );
};

export default NavPanel;
