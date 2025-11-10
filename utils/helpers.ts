export const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
};

export const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    // e.g., "Nov 10, 2025" or use locale for day/month
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

export const isSameDay = (t1: number, t2: number): boolean => {
    const d1 = new Date(t1);
    const d2 = new Date(t2);
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
};

export const isYesterday = (timestamp: number): boolean => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    return date.getFullYear() === yesterday.getFullYear() && date.getMonth() === yesterday.getMonth() && date.getDate() === yesterday.getDate();
};

export const formatRelativeDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const today = new Date();
    if (isSameDay(timestamp, today.getTime())) return 'Today';
    if (isYesterday(timestamp)) return 'Yesterday';
    // fallback to formatted date
    return formatDate(timestamp);
};

// Converts a data URL (from canvas) to a File object
export const dataUrlToFile = async (dataUrl: string, filename: string): Promise<File> => {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], filename, { type: blob.type });
};
