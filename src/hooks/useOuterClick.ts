import { RefObject, useCallback, useEffect, useRef } from "react";

interface UseOuterClickProps {
    handler: DocumentEventHandler<"pointerdown">;

    ref?: RefObject<Element | null>;
    listenOnMount?: boolean
};

export const useOuterClick = ({ handler, ref, listenOnMount }: UseOuterClickProps) => {
    const togglers = useRef({
        isListening: false,
        listen: () => {
            if (togglers.current.isListening) {
                togglers.current.unlisten();
            } else {
                togglers.current.isListening = true;
            }
            document.addEventListener("pointerdown", handlerRef.current);
        },
        unlisten: () => {
            if (togglers.current.isListening) {
                document.removeEventListener("pointerdown", handlerRef.current);
                togglers.current.isListening = false;
            }
        }
    });

    const handleOuterClick = useCallback((e: PointerEvent) => {
        const target = e.target as HTMLElement;

        const isOuterClick = ref && ref.current?.contains(target);

        if (!isOuterClick) {
            handler(e);

            document.removeEventListener("pointerdown", handleOuterClick);
        }
    }, [handler, ref]);

    const handlerRef = useRef(handleOuterClick);

    useEffect(() => {
        handlerRef.current = handleOuterClick;
    }, [handleOuterClick]);

    useEffect(() => {
        if (listenOnMount) {
            togglers.current.listen();
        }

        return () => {
            document.removeEventListener("pointerdown", handlerRef.current);
        };
    }, [listenOnMount]);

    return {
        listen: togglers.current.listen,
        unlisten: togglers.current.unlisten
    };
};