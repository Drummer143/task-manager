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
