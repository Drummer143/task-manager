"use client";

import React, { useCallback } from "react";

import { useLayoutStore } from "@/store";
import { useResizeObserver } from "@/hooks";

const BodyResizeObserver: React.FC = () => {
    const { setScreen } = useLayoutStore();

    const observerCallback: ResizeObserverCallback = useCallback(
        ([{ contentRect }]) => setScreen(contentRect.width),
        [setScreen]
    );

    useResizeObserver({
        element: document.body,
        onResize: observerCallback
    });

    return <></>;
};

export default BodyResizeObserver;