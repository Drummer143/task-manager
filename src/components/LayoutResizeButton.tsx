"use client";

import React, { memo } from "react";

const LayoutResizeButton: React.FC = () => {
    const handleResize = (e: MouseEvent) => {
        document.body.style.setProperty("--navbar-width", e.clientX + "px");
    };

    const handleStopResize = () => {
        document.documentElement.style.removeProperty("cursor");
        document.body.style.removeProperty("pointer-events");

        document.removeEventListener("mousemove", handleResize);

        const width = parseInt(document.body.style.getPropertyValue("--navbar-width"));

        if (width) {
            global.localStorage?.setItem("navbar-width", width.toString());
        }
    };

    const handleResizeButtonClick: React.MouseEventHandler = e => {
        document.documentElement.style.cursor = "w-resize";
        document.body.style.pointerEvents = "none";

        document.addEventListener("mouseup", handleStopResize, { once: true });
        document.addEventListener("mousemove", handleResize);
    };

    return (
        <button
            onMouseDown={handleResizeButtonClick}
            className={"sticky top-0 w-3 h-full cursor-w-resize flex-shrink-0 max-lg:hidden".concat(
                " before:h-full before:w-0.5 before:bg-neutral-500 before:transition-[background-color,_width]",
                " before:block hover:before:w-full active:before:w-full active:before:bg-neutral-700"
            )}
        />
    );
};

export default memo(LayoutResizeButton);
