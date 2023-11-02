interface CalendarSliceDate {
    day: number;
    month: number;
    year: number;
}

type TransformFunction<ArgType = any, ReturnType = void> = (
    value: ArgType | ((prev: ArgType) => ArgType)
) => ReturnType;

type DocumentEventHandler<E extends keyof DocumentEventMap = "DOMContentLoaded"> = (e: DocumentEventMap[E]) => void;
