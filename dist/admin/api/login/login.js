"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const query_1 = __importDefault(require("../../../db/query"));
const password_1 = require("../../../utils/password");
const utils_1 = require("../../../utils/utils");
const process_1 = require("process");
const admin_interface_1 = require("../../../interface/admin.interface");
const connect_1 = __importDefault(require("../../../db/connect"));
const Mail_1 = __importDefault(require("../../../models/Mail"));
class AdminLogin {
    constructor() {
        this.creatorsTable = new query_1.default("creators");
    }
    async login({ email, password }) {
        const result = await this.creatorsTable.select({
            conditions: {
                compulsory: [
                    {
                        key: "email",
                        value: email
                    },
                ]
            }
        });
        if ((0, utils_1.isEmpty)(result)) {
            return {
                message: "Invalid email or password",
                success: false,
                data: {}
            };
        }
        const hashedPassword = result[0]['password'];
        const isMatch = await (0, password_1.comparePassword)(password, hashedPassword);
        if (!isMatch) {
            return {
                message: "Invalid email or password",
                success: false,
                data: {}
            };
        }
        switch (result[0]['status']) {
            case admin_interface_1.AdminAccountState.DISABLED:
                if (!result[0]['is_verified']) {
                    return {
                        message: "Account isn't verified",
                        success: false,
                        data: {}
                    };
                }
            //other cases if they're added
            default:
                break;
        }
        const date = new Date();
        const currentDate = date.toISOString();
        const bearerToken = this.generateVotersToken({
            adminId: result[0]["id"],
            email: email
        }, 30 * 24 * 60 * 60); // expires 30 days = 30*24*60*60
        await this.creatorsTable.update([
            'last_login',
            'last_updated'
        ], [
            currentDate,
            currentDate
        ], {
            compulsory: [
                {
                    key: "email",
                    value: email
                },
                {
                    key: "id",
                    value: result[0]['id']
                }
            ]
        });
        return {
            message: 'success',
            data: {
                token: bearerToken,
                expires_in: 30 * 24 * 60 * 60,
                token_type: "jwt",
                is_admin: true
            },
            success: true
        };
    }
    async register({ email, password }) {
        let client;
        try {
            email = email.trim();
            if (!(0, utils_1.isValidEmail)(email) && !(0, utils_1.isValidPassword)(password)) {
                return {
                    message: "Invalid email/password format",
                    success: false,
                    data: {}
                };
            }
            const result = await this.creatorsTable.select({
                conditions: {
                    compulsory: [
                        {
                            key: "email",
                            value: email
                        },
                    ]
                }
            });
            if (!(0, utils_1.isEmpty)(result)) {
                return {
                    message: "Email address already exists.",
                    success: false,
                    data: {}
                };
            }
            client = await connect_1.default.connect();
            await client.query('BEGIN');
            const hashedPassword = await (0, password_1.hashPassword)(password);
            // Get the current time
            const currentTime = new Date();
            // Add two hours to the current time (ms). date uses utc
            const expiryTime = new Date(currentTime.getTime() + (2 * 60 * 60 * 1000));
            // Format the expiry time as a string in ISO 8601 format (Timestamp with time zone)
            const expiryTimeString = expiryTime.toISOString();
            console.log(currentTime.toISOString(), expiryTimeString);
            const verificationCode = (0, utils_1.createRandomCode)();
            this.creatorsTable.insert([
                "email",
                "password",
                "verification_code",
                "code_expires"
            ], [
                email,
                hashedPassword,
                verificationCode,
                expiryTimeString
            ]);
            await client.query('COMMIT');
            // sendmail
            const mail = new Mail_1.default(email);
            await mail.sendCreatorsCode(verificationCode);
            return {
                success: true,
                message: "Account successfully created",
                data: {}
            };
        }
        catch (error) {
            if (client) {
                await client.query('ROLLBACK');
            }
            console.error(error);
            throw new Error(error);
        }
        finally {
            if (client) {
                client.release();
            }
        }
    }
    async verify({ email, code }) {
        let client;
        try {
            email = email.trim();
            code = code.toString().trim();
            client = await connect_1.default.connect();
            await client.query('BEGIN');
            const result = await this.creatorsTable.customQuery("SELECT * FROM creators WHERE is_verified=false AND status='inactive' AND verification_code=$1 AND email=$2 AND code_expires >= NOW()", [code, email]);
            if ((0, utils_1.isEmpty)(result['rows'])) {
                await client.query('ROLLBACK');
                return {
                    success: false,
                    message: "Failed to verify account. Invalid data provided or code has expired.",
                    data: {}
                };
            }
            const currentTime = new Date();
            const currentIsoTime = currentTime.toISOString();
            const compulsoryConditions = [{
                    key: "is_verified",
                    value: false
                },
                {
                    key: "status",
                    value: "inactive"
                },
                {
                    key: "verification_code",
                    value: code
                },
                {
                    key: "email",
                    value: email
                }];
            this.creatorsTable.update([
                "is_verified",
                "verification_time",
                "status",
                "code_expires",
            ], [
                true,
                currentIsoTime,
                'active',
                currentIsoTime
            ], {
                compulsory: compulsoryConditions
            });
            await client.query('COMMIT');
            return {
                success: true,
                message: "Successfully verified account",
                data: {}
            };
        }
        catch (error) {
            if (client) {
                await client.query('ROLLBACK');
                console.error("Error verifying user", error);
                throw new Error("An error occured while verifying user");
            }
        }
        finally {
            if (client) {
                client.release(); // Release client back to the pool
            }
        }
    }
    generateVotersToken(data, expiresIn) {
        const token = jsonwebtoken_1.default.sign(data, process_1.env.SECURE_ADMIN_AUTH_KEY, expiresIn && { expiresIn });
        return token;
    }
}
exports.default = AdminLogin;
//# sourceMappingURL=login.js.map