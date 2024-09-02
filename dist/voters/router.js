"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.votersRouter = void 0;
const express_1 = __importDefault(require("express"));
const middleware_1 = require("./auth/middleware");
const login_router_1 = require("./login/login.router");
const collection_1 = require("./main/collection");
exports.votersRouter = express_1.default.Router();
exports.votersRouter.use((0, middleware_1.excludeFromAuth)(['/voters/login', '/voters/verify-code', '/voters/collection-exists']));
exports.votersRouter.use('/voters', login_router_1.loginRouter, collection_1.collection);
//# sourceMappingURL=router.js.map