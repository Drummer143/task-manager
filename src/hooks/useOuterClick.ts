import { RefObject, useCallback, useEffect, useRef } from "react";

interface UseOuterClickProps {
    handler: DocumentEventHandler<"pointerdown">;

    ref?: RefObject<Element | null>;
    listenOnMount?: boolean;
}

export const useOuterClick = ({ handler, ref, listenOnMount }: UseOuterClickProps) => {
    const togglers = useRef({
        listen: () => document.addEventListener("pointerdown", handlerRef.current),
        unlisten: () => document.removeEventListener("pointerdown", handlerRef.current)
    });

    const handleOuterClick = useCallback(
        (e: PointerEvent) => {
            const target = e.target as HTMLElement;

            const isOuterClick = ref && ref.current?.contains(target);

            if (!isOuterClick) {
                handler(e);

                document.removeEventListener("pointerdown", handleOuterClick);
            }
        },
        [handler, ref]
    );

    const handlerRef = useRef(handleOuterClick);

    useEffect(() => {
        togglers.current.unlisten();
        
        handlerRef.current = handleOuterClick;

        togglers.current.listen();
    }, [handleOuterClick]);

    useEffect(() => {
        if (listenOnMount) {
            togglers.current.listen();
        }

        return () => {
            document.removeEventListener("pointerdown", handlerRef.current);
        };
    }, [listenOnMount]);

    return togglers.current;
};
