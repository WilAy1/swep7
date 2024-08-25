import { v4 as uuidv4, validate as validateUUID } from 'uuid';
import Query from '../../db/query';
import { createRandomCode, isEmpty, isValidEmail } from '../../utils/utils';
import APIResponse from '../../interface/api.interface';
import { env } from '../../utils/env';
import jwt from 'jsonwebtoken';
import Polls from '../../models/Polls';
import { Votes } from '../../models/Votes';
import Mail from '../../models/Mail';

interface LoginParam {
    email: string,
    collectionId: string,
    code?: string
}

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

export class Login {
    private readonly email: string;
    private readonly collectionId: string;
    private readonly code: string;
    private readonly votersTable: Query;

    constructor(params: LoginParam){
        if(!isValidEmail(params.email)){
            //throw new Error("Invalid email address");
        }
        if(!validateUUID(params.collectionId)){
            //throw new Error("Invalid collection ID");
        }

        this.votersTable = new Query("voters");

        this.email = params.email;
        this.collectionId = params.collectionId
        this.code = params.code;
    }

    
    async login() : Promise<APIResponse> {
        try {
            const polls = new Polls(this.collectionId);
            const { exists: collectionExists, reason } = await polls.collectionExists();
            if(!collectionExists){
                const response : APIResponse = {
                    success: false,
                    message: `Login failed. ${reason}`,
                    data: {}
                };

                return response;
            }
            const isEligibleVoter = await polls.isEligibleVoter(this.email);

            if(!isEligibleVoter){
                const response : APIResponse = {
                    success: false,
                    message: "Login failed. You are not eligible to vote",
                    data: {}
                };

                return response;
            }

            //  check if user has voted

            const votes = new Votes(this.collectionId, { emailAddress: this.email });
            const hasVoterVoted = await votes.votedInCollection();

            if(hasVoterVoted){
                const response: APIResponse = {
                    success: false,
                    message: "Login failed. You have voted already",
                    data: {}
                }

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

            let code: string;
            if(!isEmpty(result)) {
                const voterResult = result[0];

                code = voterResult['access_code'];
                // send mail of code
                // removes case of excess voters details for one collection since code expires after voting ends

            }
            else {

                code = createRandomCode().toString(); // 6 digits code for verification

                await this.votersTable.insert(
                    [
                        "for_collection",
                        "email",
                        "access_code",
                        "code_expires",
                    ],
                    [
                        this.collectionId,
                        this.email,
                        code,
                        collectionDetails['end_time'],
                    ]
                );
            }

            const mail = new Mail(this.email);
            await mail.sendVotersCode(code, collectionDetails['title']);

            // sendMail(code);

            const response: APIResponse = {
                success: true,
                message: "Login code sent to email",
                data: {}
            }

            return response;


            // open file, check if email is in file, send code to email if it's in file
        }
        catch(error) {
            throw new Error(error);
        }

    }


    private generateVotersToken(data: any, expiresIn?: number) : string {
        const token = jwt.sign(data, env.SECURE_VOTER_AUTH_KEY, expiresIn && {expiresIn});
        return token;
    }

    
    

    async verify(code: string){
        try {
            const loginResponse: APIResponse = await this.login();
            if(!loginResponse.success){
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

            if(isEmpty(result)){
                const response : APIResponse = {
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


            const response: APIResponse = {
                success: true,
                message: "success",
                data: {
                    is_voter: true,
                    token: bearerToken,
                    token_type: "jwt",
                    expires_in: tokenExpiresIn
                }
            }

            return response;
        }
        catch(error){
            throw new Error(error);
        }

    }
}
