"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidEmailFile = isValidEmailFile;
exports.getEmails = getEmails;
exports.checkEmailInCsv = checkEmailInCsv;
const fs_1 = require("fs");
const sync_1 = require("csv-parse/sync"); // Use the synchronous version for simplicity
const path_1 = __importDefault(require("path"));
const currentDirectory = process.cwd();
const rootDirectory = currentDirectory.includes('/src')
    ? path_1.default.resolve(currentDirectory, '../')
    : currentDirectory;
async function isValidEmailFile(file) {
    try {
        const content = file.buffer.toString("utf8");
        const records = (0, sync_1.parse)(content, {
            columns: true, // Automatically extract column names as the first row
            skip_empty_lines: true,
        });
        const emails = records.map(record => record['Email']).filter(Boolean);
        return { isValid: true, emailCount: emails.length };
    }
    catch (error) {
        console.error(error);
        return { isValid: false, emailCount: 0 };
    }
}
async function getEmails() {
    try {
        // Read the CSV file
        const fileDir = `${rootDirectory}/uploads/csv/email.csv`;
        const content = await fs_1.promises.readFile(fileDir, 'utf8');
        // Parse the CSV content
        const records = (0, sync_1.parse)(content, {
            columns: true, // Automatically extract column names as the first row
            skip_empty_lines: true,
        });
        // Assuming that the email column is named 'Email' (you can adjust based on your CSV file)
        const emails = records.map(record => record['Email']).filter(Boolean);
        console.log('Emails:', emails);
    }
    catch (error) {
        console.error('Error reading or parsing the file:', error);
    }
}
async function checkEmailInCsv(emailAddress, inCollection) {
    try {
        const fileDir = `${rootDirectory}/uploads/csv/${inCollection}.csv`;
        const content = await fs_1.promises.readFile(fileDir, 'utf8');
        const records = (0, sync_1.parse)(content, {
            columns: true,
            skip_empty_lines: true,
        });
        const emails = records.map(record => record['Email']).filter(Boolean);
        return emails.includes(emailAddress);
    }
    catch (error) {
        console.error('Error reading or parsing file', error);
        return false;
    }
}
//# sourceMappingURL=csv.js.map