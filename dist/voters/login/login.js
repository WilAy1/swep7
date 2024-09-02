"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Login = void 0;
const uuid_1 = require("uuid");
const query_1 = __importDefault(require("../../db/query"));
const utils_1 = require("../../utils/utils");
const env_1 = require("../../utils/env");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Polls_1 = __importDefault(require("../../models/Polls"));
const Votes_1 = require("../../models/Votes");
const Mail_1 = __importDefault(require("../../models/Mail"));
// class Polls {
//     readonly table: Query;
//     constructor(){
//         this.table = new Query("polls");
//     }
//     async getPollDetails(poll_id: string){
//         const result = await this.table.select({
//             conditions: {
//                 compulsory: [
//                     {
//                         key: "id",
//                         value: poll_id
//                     }
//                 ]
//             }
//         }) // SELECT * FROM polls WHERE id=poll_id;
//         if(isEmpty(result)) return;
//         return result[0];
//     }
// }
class Login {
    constructor(params) {
        if (!(0, utils_1.isValidEmail)(params.email)) {
            //throw new Error("Invalid email address");
        }
        if (!(0, uuid_1.validate)(params.collectionId)) {
            //throw new Error("Invalid collection ID");
        }
        this.votersTable = new query_1.default("voters");
        this.email = params.email;
        this.collectionId = params.collectionId;
        this.code = params.code;
    }
    async login() {
        try {
            const polls = new Polls_1.default(this.collectionId);
            const { exists: collectionExists, reason } = await polls.collectionExists();
            if (!collectionExists) {
                const response = {
                    success: false,
                    message: `Login failed. ${reason}`,
                    data: {}
                };
                return response;
            }
            const isEligibleVoter = await polls.isEligibleVoter(this.email);
            if (!isEligibleVoter) {
                const response = {
                    success: false,
                    message: "Login failed. You are not eligible to vote",
                    data: {}
                };
                return response;
            }
            //  check if user has voted
            const votes = new Votes_1.Votes(this.collectionId, { emailAddress: this.email });
            const hasVoterVoted = await votes.votedInCollection();
            if (hasVoterVoted) {
                const response = {
                    success: false,
                    message: "Login failed. You have voted already",
                    data: {}
                };
                return response;
            }
            // Voter has passed all test
            const collectionDetails = await polls.fetchCollectionData();
            // check if voter exists but hasn't voted
            const result = await this.votersTable.select({
                conditions: {
                    compulsory: [
                        {
                            key: "email",
                            value: this.email
                        },
                        {
                            key: "for_collection",
                            value: this.collectionId
                        }
                    ]
                }
            });
            let code;
            if (!(0, utils_1.isEmpty)(result)) {
                const voterResult = result[0];
                code = voterResult['access_code'];
                // send mail of code
                // removes case of excess voters details for one collection since code expires after voting ends
            }
            else {
                code = (0, utils_1.createRandomCode)().toString(); // 6 digits code for verification
                await this.votersTable.insert([
                    "for_collection",
                    "email",
                    "access_code",
                    "code_expires",
                ], [
                    this.collectionId,
                    this.email,
                    code,
                    collectionDetails['end_time'],
                ]);
            }
            const mail = new Mail_1.default(this.email);
            await mail.sendVotersCode(code, collectionDetails['title']);
            // sendMail(code);
            const response = {
                success: true,
                message: "Login code sent to email",
                data: {}
            };
            return response;
            // open file, check if email is in file, send code to email if it's in file
        }
        catch (error) {
            throw new Error(error);
        }
    }
    generateVotersToken(data, expiresIn) {
        const token = jsonwebtoken_1.default.sign(data, env_1.env.SECURE_VOTER_AUTH_KEY, expiresIn && { expiresIn });
        return token;
    }
    async verify(code) {
        try {
            const loginResponse = await this.login();
            if (!loginResponse.success) {
                return loginResponse;
            }
            const result = await this.votersTable.select({
                conditions: {
                    compulsory: [
                        {
                            key: "email",
                            value: this.email
                        },
                        {
                            key: "for_collection",
                            value: this.collectionId
                        },
                        {
                            key: "access_code",
                            value: code
                        }
                    ]
                }
            });
            if ((0, utils_1.isEmpty)(result)) {
                const response = {
                    success: false,
                    message: "Login failed. Invalid code",
                    data: {}
                };
                return response;
            }
            const voterResult = result[0];
            const currentDate = new Date();
            const endDate = new Date(voterResult['code_expires']);
            const tokenExpiresIn = Math.floor((endDate.getTime() - currentDate.getTime()) / 1000);
            const bearerToken = this.generateVotersToken({
                email: this.email,
                code: voterResult['access_code'],
                collectionId: this.collectionId
            }, tokenExpiresIn);
            const response = {
                success: true,
                message: "success",
                data: {
                    is_voter: true,
                    token: bearerToken,
                    token_type: "jwt",
                    expires_in: tokenExpiresIn
                }
            };
            return response;
        }
        catch (error) {
            throw new Error(error);
        }
    }
}
exports.Login = Login;
//# sourceMappingURL=login.js.map