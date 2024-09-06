export function removeKeys(obj: object, keysToRemove: string[]) {
    const newObj = { ...obj };

    keysToRemove.forEach(key => {
        if (key.includes('[]')) {
            const [mainKey, ...rest] = key.split('[].');
            
            newObj[mainKey]?.forEach((item, index) => {
                if (rest.length === 2) {
                    newObj[mainKey][index][rest[0]]?.forEach((_, subIndex) => {
                        delete newObj[mainKey][index][rest[0]][subIndex][rest[1]];
                    });
                } else {
                    delete newObj[mainKey][index][rest[0]];
                }
            });
        } else {
            delete newObj[key];
        }
    });

    return newObj;
}
