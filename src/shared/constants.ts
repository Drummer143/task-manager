/** Default calendar cell width is 100 pixels */
export const DEFAULT_CALENDAR_CELL_WIDTH = 100;

export const MILLISECONDS_IN_DAY = 86_400_000;

export const weekdayOrder = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;

export const months = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december"
] as const;

export enum Screens {
    sm = 640,
    md = 768,
    lg = 1024,
    xl = 1280,
    "2xl" = 1536
};
