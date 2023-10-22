"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import NavPanelLink from "./NavPanelLink";
import { screens } from "@/shared";
import { useNavbarStore } from "@/store";
import { useOuterClick, useResizeObserver } from "@/hooks";
import { CalendarNavSVG, FriendsNavSVG } from "@/SVGs";

const NavPanel: React.FC = () => {
    const { isOpened, setIsOpened } = useNavbarStore();

    const navRef = useRef<HTMLElement | null>(null);

    const [isMobile, setIsMobile] = useState(false);

    const { listen, unlisten } = useOuterClick({
        handler: (e) => {
            if ((e.target as HTMLElement | null)?.id !== "toggleNavBarButton") {
                setIsOpened(false);
            }
        },
        ref: navRef
    });

    useResizeObserver({
        element: document.body,
        onResize: ([e]) => {
            if (e?.contentRect.width > screens.md && isMobile) {
                setIsMobile(false);
                setIsOpened(true);
            } else if (e?.contentRect.width < screens.md && !isMobile) {
                setIsMobile(true);
                setIsOpened(false);
            }
        }
    });

    useEffect(() => {
        if (!isMobile) {
            return unlisten();
        }

        if (isOpened) {
            listen();
        } else {
            unlisten();
        }
    }, [isMobile, isOpened, listen, unlisten]);

    return (
        <AnimatePresence>
            {isOpened && (
                <motion.nav
                    ref={navRef}
                    animate={{
                        translateX: 0,
                        transition: { duration: 0.15 }
                    }}
                    exit={{ translateX: "-100%", transition: { duration: 0.15 } }}
                    initial={{ translateX: "-100%" }}
                    style={{
                        width: isMobile
                            ? "100%"
                            : `var(--navbar-width, ${localStorage.getItem("navbar-width") || 200}px)`,
                    }}
                    className={"flex-shrink-0 h-full min-w-[var(--navbar-min-width)] flex flex-col gap-1"
                        .concat(" p-2 overflow-hidden bg-[rgb(36,36,36)]")
                        .concat(isMobile ? " fixed z-30 max-w-[75vw]" : " max-w-[300px]")}
                >
                    <NavPanelLink icon={<CalendarNavSVG width={30} height={30} />} href="/">Calendar</NavPanelLink>
                    <NavPanelLink icon={<FriendsNavSVG width={30} height={30} />} href="/friends">Friends</NavPanelLink>
                </motion.nav>
            )}
        </AnimatePresence>
    );
};

export default NavPanel;