"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminLoginRouter = void 0;
const express_1 = __importDefault(require("express"));
const http_status_codes_1 = require("http-status-codes");
const login_1 = __importDefault(require("./login"));
exports.adminLoginRouter = express_1.default.Router();
exports.adminLoginRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Invalid parameters",
                data: {}
            });
        }
        const adminLogin = new login_1.default();
        const response = await adminLogin.login({
            email: email,
            password: password
        });
        let statusCode;
        switch (response.success) {
            case true:
                statusCode = http_status_codes_1.StatusCodes.OK;
                break;
            case false:
                statusCode = http_status_codes_1.StatusCodes.UNAUTHORIZED;
                break;
            default:
                statusCode = http_status_codes_1.StatusCodes.NOT_FOUND;
        }
        return res.status(statusCode).json(response);
    }
    catch (error) {
        console.error(error);
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ status: false, message: "Intenal server error", data: {} });
    }
});
exports.adminLoginRouter.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Invalid parameters",
                data: {}
            });
        }
        const adminLogin = new login_1.default();
        const response = await adminLogin.register({
            email: email,
            password: password
        });
        let statusCode;
        switch (response.success) {
            case true:
                statusCode = http_status_codes_1.StatusCodes.OK;
                break;
            case false:
                statusCode = http_status_codes_1.StatusCodes.BAD_GATEWAY;
                break;
            default:
                statusCode = http_status_codes_1.StatusCodes.NOT_FOUND;
        }
        return res.status(statusCode).json(response);
    }
    catch (error) {
        console.error(error);
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ status: false, message: "Intenal server error", data: {} });
    }
});
exports.adminLoginRouter.post('/verify', async (req, res) => {
    try {
        const { code, email } = req.body;
        if (!code || !email) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Invalid parameters",
                data: {}
            });
        }
        const adminLogin = new login_1.default();
        if (typeof code != "number") {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Code must be a number",
                data: {}
            });
        }
        const response = await adminLogin.verify({
            email: email,
            code: code
        });
        let statusCode;
        switch (response.success) {
            case true:
                statusCode = http_status_codes_1.StatusCodes.OK;
                break;
            case false:
                statusCode = http_status_codes_1.StatusCodes.BAD_GATEWAY;
                break;
            default:
                statusCode = http_status_codes_1.StatusCodes.NOT_FOUND;
        }
        return res.status(statusCode).json(response);
    }
    catch (error) {
        console.error(error);
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ status: false, message: "Intenal server error", data: {} });
    }
});
//# sourceMappingURL=login.router.js.map