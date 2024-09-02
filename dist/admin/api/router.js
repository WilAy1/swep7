"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = __importDefault(require("express"));
const middleware_1 = require("../auth/middleware");
const collection_router_1 = require("./collection.router");
const login_router_1 = require("./login/login.router");
exports.adminRouter = express_1.default.Router();
exports.adminRouter.use((0, middleware_1.excludeFromAdminAuth)(['/account/login', '/account/verify', '/account/register']));
exports.adminRouter.use('/account', login_router_1.adminLoginRouter);
exports.adminRouter.use('/collection', collection_router_1.collectionRouter);
//# sourceMappingURL=router.js.map