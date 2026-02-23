export function formatDate(dateInput: Date | string): string {
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    const now = new Date();

    const formatHHMM = (d: Date) =>
        d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const isToday = (d: Date) =>
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear();

    const isYesterday = (d: Date) => {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        return (
            d.getDate() === yesterday.getDate() &&
            d.getMonth() === yesterday.getMonth() &&
            d.getFullYear() === yesterday.getFullYear()
        );
    };

    if (isToday(date)) {
        return formatHHMM(date);
    } else if (isYesterday(date)) {
        return `Yesterday at ${formatHHMM(date)}`;
    } else {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year} ${formatHHMM(date)}`;
    }
}
