"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const router_1 = require("./voters/router");
const router_2 = require("./admin/api/router");
require("./services/csv");
const router_3 = require("./files/router");
const app = (0, express_1.default)();
const port = 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/manage', router_2.adminRouter);
app.use('/api/', router_1.votersRouter);
app.use('/images', router_3.fileRouter);
app.listen(port, () => {
    return console.log(`Express server is listening at http://localhost:${port} 🚀`);
});
exports.default = app;
//# sourceMappingURL=app.js.map