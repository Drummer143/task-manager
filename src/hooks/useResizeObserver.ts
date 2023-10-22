import { RefObject, useEffect, useMemo, useRef } from "react";

type UseResizeObserverProps = {
    element: RefObject<HTMLElement | null> | Element;

    onResize: ResizeObserverCallback;

    skip?: boolean;
};

export const useResizeObserver = ({ onResize, element, skip }: UseResizeObserverProps) => {
    const disconnect = useRef<(() => void) | null>(null);

    const resizeObserver = useMemo(() => {
        if (disconnect.current) {
            disconnect.current();
        }

        return new ResizeObserver(onResize);
    }, [onResize]);

    useEffect(() => {
        if (skip) {
            resizeObserver.disconnect();
        }

        const target = element instanceof Element ? element : element.current;

        if (target) {
            resizeObserver.observe(target);
        }

        disconnect.current = () => resizeObserver.disconnect();

        return () => {
            resizeObserver.disconnect();
        };
    }, [element, resizeObserver, skip]);
};
