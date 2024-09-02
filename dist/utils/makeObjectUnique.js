"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeObjectUnique = makeObjectUnique;
function makeObjectUnique(objArray) {
    const newObj = {};
    for (const [key, value] of Object.entries(objArray)) {
        if (Object.keys(newObj).includes(key)) {
            const prevArray = newObj[key];
            prevArray.push(value);
            newObj[key] = prevArray;
        }
        else {
            newObj[key] = [value];
        }
    }
    return newObj;
}
//# sourceMappingURL=makeObjectUnique.js.map