
export interface UniqueObject {
    [key: string] : Array<unknown>
}

export function makeObjectUnique (objArray : object) : UniqueObject {
    const newObj : object = {};
    for (const [key, value] of Object.entries(objArray)) {
        if(Object.keys(newObj).includes(key)){
            const prevArray = newObj[key];
            prevArray.push(value)
            newObj[key] = prevArray;
        }
        else {
            newObj[key] = [value];
        }
    }
    return newObj as UniqueObject;
}