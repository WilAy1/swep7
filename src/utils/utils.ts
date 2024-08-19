export function isEmpty(data: Array<unknown> | string) {
    if (typeof data == "string") data = data.trim();
    return data.length === 0;
}


export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function sanitizeString(str) {
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
}


export const uniqueList = (arr: Array<any>) => [...new Set(arr)];
