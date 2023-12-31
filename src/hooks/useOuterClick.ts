import { RefObject, useEffect, useRef } from "react";

interface UseOuterClickProps {
    handler: DocumentEventHandler<"pointerdown">;
    ref: RefObject<Element | null>;

    active?: boolean;
}

export const useOuterClick = ({ handler, ref, active = false }: UseOuterClickProps) => {
    const handlerRef = useRef(handler);

    useEffect(() => {
        handlerRef.current = handler;
    }, [handler]);

    useEffect(() => {
        if (!active) {
            return;
        }

        const handler: DocumentEventHandler<"pointerdown"> = e => {
            const target = e.target as HTMLElement;

            const isOuterClick = ref.current?.contains(target);

            if (!isOuterClick) {
                handlerRef.current(e);

                document.removeEventListener("pointerdown", handler);
            }
        };

        document.addEventListener("pointerdown", handler);

        return () => {
            document.removeEventListener("pointerdown", handler);
        };
    }, [active, ref]);
};
