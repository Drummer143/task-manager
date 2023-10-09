"use client";

import React, { useCallback } from "react";

const LayoutResizeButton: React.FC = () => {
    const handleResize = useCallback((e: MouseEvent) => {
        document.body.style.setProperty("--navbar-width", e.clientX + "px");
    }, []);

    const handleStopResize = useCallback(() => {
        document.documentElement.style.removeProperty("cursor");
        document.body.style.removeProperty("pointer-events");

        document.removeEventListener("mousemove", handleResize);

        const width = parseInt(document.body.style.getPropertyValue("--navbar-width"));

        if (width) {
            localStorage.setItem("navbar-width", width.toString());
        }
    }, [handleResize]);

    const handleResizeButtonClick: React.MouseEventHandler = useCallback(e => {
        document.documentElement.style.cursor = "w-resize";
        document.body.style.pointerEvents = "none";

        document.addEventListener("mouseup", handleStopResize, { once: true });
        document.addEventListener("mousemove", handleResize);
    }, [handleResize, handleStopResize]);

    return (
        <button
            onMouseDown={handleResizeButtonClick}
            className={"grid-area-[resize] w-3 h-full cursor-w-resize relative"
                .concat(" before:h-full before:w-0.5 before:bg-neutral-500 before:transition-[background-color,_width]")
                .concat(" before:block hover:before:w-full active:before:w-full active:before:bg-neutral-700")}
        />
    );
};

export default LayoutResizeButton;