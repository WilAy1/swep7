"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uniqueList = void 0;
exports.isEmpty = isEmpty;
exports.isValidEmail = isValidEmail;
exports.sanitizeString = sanitizeString;
exports.isValidPassword = isValidPassword;
exports.createRandomCode = createRandomCode;
function isEmpty(data) {
    if (typeof data == "string")
        data = data.trim();
    return data.length === 0;
}
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
function sanitizeString(str) {
    return str.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
const uniqueList = (arr) => [...new Set(arr)];
exports.uniqueList = uniqueList;
function isValidPassword(password) {
    return password.length >= 8;
}
function createRandomCode() {
    return Math.floor(100000 + Math.random() * 900000);
}
//# sourceMappingURL=utils.js.map