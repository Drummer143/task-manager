interface CalendarSliceDate {
    day: number;
    month: number;
    year: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TransformFunction<ArgType = any, ReturnType = void> = (
    value: ArgType | ((prev: ArgType) => ArgType)
) => ReturnType;

type DocumentEventHandler<E extends keyof DocumentEventMap = "DOMContentLoaded"> = (e: DocumentEventMap[E]) => void;
