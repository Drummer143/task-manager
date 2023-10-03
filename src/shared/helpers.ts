export const getCurrentDate = () => {
    const date = new Date();

    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    return { day, month, year, date: Date.now() };
}