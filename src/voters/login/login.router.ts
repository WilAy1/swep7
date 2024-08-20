import express from 'express';
import { Login } from './login';
import { StatusCodes } from 'http-status-codes';
import APIResponse from '../../interface/api.interface';

export const loginRouter = express.Router()

loginRouter.post('/login', async (req, res) => {
    try {
        const { email, collection_id } = req.body;

        if(!email || !collection_id){
            const response : APIResponse = {
                success: false,
                message: "Invalid params",
                data: {}
            }

            return res.status(StatusCodes.BAD_REQUEST).json(response);
        }
        
        const login = new Login({ email: email, collectionId: collection_id });

        const loginResponse = await login.login();

        let statusCode: StatusCodes = loginResponse.success == false ? StatusCodes.UNAUTHORIZED : StatusCodes.OK;

        return res.status(statusCode).json(loginResponse);

    }
    catch (error){
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: false, message: "Intenal server error", data: {} });
    }
})



loginRouter.post('/verify-code', async (req, res) => {
    try {
        const { email, collection_id, code } = req.body;

        if(!email || !collection_id || !code){
            const response : APIResponse = {
                success: false,
                message: "Invalid params",
                data: {}
            }

            return res.status(StatusCodes.BAD_REQUEST).json(response);
        }

        const login = new Login({ email: email, collectionId: collection_id });

        const verifyCodeResponse = await login.verify(code);

        let statusCode: StatusCodes = verifyCodeResponse.success == false ? StatusCodes.UNAUTHORIZED : StatusCodes.OK;

        return res.status(statusCode).json(verifyCodeResponse);

    }
    catch (error){
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: false, message: "Intenal server error", data: {} });
    }
});