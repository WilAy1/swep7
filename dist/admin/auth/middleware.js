"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateAdmin = authenticateAdmin;
exports.excludeFromAdminAuth = excludeFromAdminAuth;
const http_status_codes_1 = require("http-status-codes");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const process_1 = require("process");
function authenticateAdmin(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        const response = {
            success: false,
            message: "Unauthorized access",
            data: {}
        };
        return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json(response); // Unauthorized if token is missing
    }
    jsonwebtoken_1.default.verify(token, process_1.env.SECURE_ADMIN_AUTH_KEY, (err, user) => {
        if (err) {
            return res.status(http_status_codes_1.StatusCodes.FORBIDDEN).json({ success: false, error: "Access forbidden" }); // Forbidden if token is invalid
        }
        req.user = user;
        next();
    });
}
function excludeFromAdminAuth(paths) {
    return function (req, res, next) {
        if (paths.includes(req.path)) {
            next();
        }
        else {
            authenticateAdmin(req, res, next);
        }
    };
}
//# sourceMappingURL=middleware.js.map