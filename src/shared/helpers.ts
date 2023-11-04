export const getCurrentDate = () => {
    const date = new Date();

    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    return { day, month, year, date: Date.now() };
};

export const isURL = (urlToCheck: string) => {
    try {
        const url = new URL(urlToCheck);

        if (url.host) {
            return true;
        }

        return false;
    } catch (_) {
        return false;
    }
};

export const mapMonthDays = (
    date = new Date(),
    skip?: { prev?: boolean; next?: boolean; current?: boolean }
) => {
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const firstDayOfNextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    const lastDayOfPrevMonth = new Date(date.getFullYear(), date.getMonth(), 0);

    const countOfFirstWeekPlaceholders = firstDayOfMonth.getDay();

    const firstWeekPlaceholders: number[] = skip?.prev
        ? []
        : new Array(countOfFirstWeekPlaceholders)
              .fill(undefined)
              .map((_, i) =>
                  new Date(
                      lastDayOfPrevMonth.getFullYear(),
                      lastDayOfPrevMonth.getMonth(),
                      lastDayOfPrevMonth.getDate() - countOfFirstWeekPlaceholders + i + 1
                  ).getDate()
              );

    const countOfLastWeekPlaceholders = 6 - lastDayOfMonth.getDay();
    const lastWeekPlaceholders: number[] = skip?.next
        ? []
        : new Array(countOfLastWeekPlaceholders)
              .fill(undefined)
              .map((_, i) =>
                  new Date(firstDayOfNextMonth.getFullYear(), firstDayOfNextMonth.getMonth(), i + 1).getDate()
              );

    const current: number[] = skip?.current
        ? []
        : new Array(lastDayOfMonth.getDate()).fill(undefined).map((_, i) => i + 1);

    return {
        previous: firstWeekPlaceholders,
        current,
        next: lastWeekPlaceholders
    };
};

export const compareDates = (a: Date, b: Date, compareUntil: "year" | "month" | "day" = "year") => {
    let isEqual = true;

    switch (compareUntil) {
        case "day":
            isEqual = a.getDate() === b.getDate();
        case "month":
            isEqual = isEqual && a.getMonth() === b.getMonth();
        case "year":
            isEqual = isEqual && a.getFullYear() === b.getFullYear();
    }

    return isEqual;
};

export const isToday = (date: Date, compareUntil: Parameters<typeof compareDates>[2] = "day") =>
    compareDates(date, new Date(), compareUntil);
