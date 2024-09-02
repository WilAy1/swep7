"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.excludeFromAuth = excludeFromAuth;
const http_status_codes_1 = require("http-status-codes");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const process_1 = require("process");
function authenticate(req, res, next) {
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
    // Verify the token using the secret key
    jsonwebtoken_1.default.verify(token, process_1.env.SECURE_VOTER_AUTH_KEY, (err, voter) => {
        if (err) {
            return res.status(http_status_codes_1.StatusCodes.FORBIDDEN).json({ success: false, error: "Access forbidden" }); // Forbidden if token is invalid
        }
        req.voter = voter;
        next(); // Proceed to the next middleware
    });
}
function excludeFromAuth(paths) {
    return function (req, res, next) {
        // Check if the request path matches any of the excluded paths
        if (paths.includes(req.path)) {
            // If the path is in the exclusion list, skip authentication and call next()
            console.log(`Skipping authentication for path: ${req.path}`);
            next();
        }
        else {
            // If the path is not in the exclusion list, proceed with authentication
            authenticate(req, res, next);
        }
    };
}
//# sourceMappingURL=middleware.js.map