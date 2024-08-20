import jwt from "jsonwebtoken";
import Query from "../../../db/query";
import APIResponse from "../../../interface/api.interface";
import { comparePassword, hashPassword } from "../../../utils/password";
import { createRandomCode, isEmpty, isValidEmail, isValidPassword } from "../../../utils/utils";
import { env } from "process";
import { AdminAccountState } from "../../../interface/admin.interface";
import pool from "../../../db/connect";
import { PoolClient } from "pg";

export default class AdminLogin {
    private readonly creatorsTable: Query;
    constructor(){
        this.creatorsTable = new Query("creators");
    }

    async login({email, password}: {email: string, password: string}) : Promise<APIResponse> {
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

        if(isEmpty(result)) {
            return {
                message: "Invalid email or password",
                success: false,
                data: {}
            }
        }

        const hashedPassword = result[0]['password'];
        const isMatch = await comparePassword(password, hashedPassword);

        if(!isMatch) {
            return {
                message: "Invalid email or password",
                success: false,
                data: {}
            }
        }
        
        switch (result[0]['status']) {
            case AdminAccountState.DISABLED:
                if(!result[0]['is_verified']){
                    return {
                        message: "Account isn't verified",
                        success: false,
                        data: {}
                    }
                }
            //other cases if they're added
        
            default:
                break;
        }

        const date = new Date();
        const currentDate = date.toISOString();

        const bearerToken = this.generateVotersToken(
            {
                adminId: result[0]["id"],
                email: email

            }, 30*24*60*60); // expires 30 days = 30*24*60*60
        
        await this.creatorsTable.update(
            [
                'last_login',
                'last_updated'
            ],
            [
                currentDate,
                currentDate
            ],
            {
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
            }
        );

        return {
            message: 'success',
            data: {
                token: bearerToken,
                expires_in: 30*24*60*60,
                token_type: "jwt",
                is_admin: true
            },
            success: true
        };

    }

    async register({email, password}: {email: string, password: string}) : Promise<APIResponse> {
        let client: PoolClient;
        try {
            email = email.trim();

            if(!isValidEmail(email) && !isValidPassword(password)){
                return {
                    message: "Invalid email/password format",
                    success: false,
                    data: {}
                }
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

            if(!isEmpty(result)) {
                return {
                    message: "Email address already exists.",
                    success: false,
                    data: {}
                }
            }

            client = await pool.connect();
            await client.query('BEGIN');


            const hashedPassword = await hashPassword(password);
             // Get the current time
            const currentTime = new Date();

            // Add two hours to the current time (ms). date uses utc
            const expiryTime = new Date(currentTime.getTime() + (2 * 60 * 60 * 1000));

            // Format the expiry time as a string in ISO 8601 format (Timestamp with time zone)
            const expiryTimeString = expiryTime.toISOString();

            console.log(currentTime.toISOString(), expiryTimeString);

            const verificationCode = createRandomCode();


            this.creatorsTable.insert(
                [
                    "email",
                    "password",
                    "verification_code",
                    "code_expires"
                ],
                [
                    email,
                    hashedPassword,
                    verificationCode,
                    expiryTimeString
                ]
            );

            await client.query('COMMIT');


            // sendmail

            return {
                success: true,
                message: "Account successfully created",
                data: {}
            }


        }
        catch(error){
            if (client) {
                await client.query('ROLLBACK');
            }
            console.error(error);
            throw new Error(error);
        }
        finally {
            if(client){
                client.release();
            }
        }
    }


    async verify({email, code} : {email: string, code: number | string}) : Promise<APIResponse> {
        let client: PoolClient
        try {
            email = email.trim();
            code = code.toString().trim();


            client = await pool.connect();
            await client.query('BEGIN');

            const result = await this.creatorsTable.customQuery("SELECT * FROM creators WHERE is_verified=false AND status='inactive' AND verification_code=$1 AND email=$2 AND code_expires >= NOW()", [code, email]);


            if(isEmpty(result['rows'] as any[])) {
                await client.query('ROLLBACK');
                return {
                    success: false,
                    message: "Failed to verify account. Invalid data provided or code has expired.",
                    data: {}
                }
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
            }]

            this.creatorsTable.update(
                [
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
                }
            )

            await client.query('COMMIT');

            return {
                success: true,
                message: "Successfully verified account",
                data: {}
            }

        }
        catch(error) {
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

    private generateVotersToken(data: any, expiresIn?: number) : string {
        const token = jwt.sign(data, env.SECURE_ADMIN_AUTH_KEY, expiresIn && {expiresIn});
        return token;
    }
}