"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginRouter = void 0;
const express_1 = __importDefault(require("express"));
const login_1 = require("./login");
const http_status_codes_1 = require("http-status-codes");
exports.loginRouter = express_1.default.Router();
exports.loginRouter.post('/login', async (req, res) => {
    try {
        const { email, collection_id } = req.body;
        if (!email || !collection_id) {
            const response = {
                success: false,
                message: "Invalid params",
                data: {}
            };
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json(response);
        }
        const login = new login_1.Login({ email: email, collectionId: collection_id });
        const loginResponse = await login.login();
        let statusCode = loginResponse.success == false ? http_status_codes_1.StatusCodes.UNAUTHORIZED : http_status_codes_1.StatusCodes.OK;
        return res.status(statusCode).json(loginResponse);
    }
    catch (error) {
        console.error(error);
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ status: false, message: "Intenal server error", data: {} });
    }
});
exports.loginRouter.post('/verify-code', async (req, res) => {
    try {
        const { email, collection_id, code } = req.body;
        if (!email || !collection_id || !code) {
            const response = {
                success: false,
                message: "Invalid params",
                data: {}
            };
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json(response);
        }
        const login = new login_1.Login({ email: email, collectionId: collection_id });
        const verifyCodeResponse = await login.verify(code);
        let statusCode = verifyCodeResponse.success == false ? http_status_codes_1.StatusCodes.UNAUTHORIZED : http_status_codes_1.StatusCodes.OK;
        return res.status(statusCode).json(verifyCodeResponse);
    }
    catch (error) {
        console.error(error);
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ status: false, message: "Intenal server error", data: {} });
    }
});
//# sourceMappingURL=login.router.js.map