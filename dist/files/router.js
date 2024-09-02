"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileRouter = void 0;
const express_1 = __importDefault(require("express"));
const http_status_codes_1 = require("http-status-codes");
const path_1 = __importDefault(require("path"));
const currentDirectory = process.cwd();
exports.fileRouter = express_1.default.Router();
const rootDir = currentDirectory.includes('/src')
    ? path_1.default.resolve(currentDirectory, '../')
    : currentDirectory;
const fileDir = `${rootDir}/uploads/option-images`;
exports.fileRouter.get('/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path_1.default.join(fileDir, filename);
    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(http_status_codes_1.StatusCodes.NOT_FOUND).end();
        }
    });
});
//# sourceMappingURL=router.js.map