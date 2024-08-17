export function isEmpty(data: Array<unknown> | string) {
    if (typeof data == "string") data = data.trim();
    return data.length === 0;
}
