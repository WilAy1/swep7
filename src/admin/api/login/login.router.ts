import express from 'express';
import { StatusCodes } from 'http-status-codes';
import AdminLogin from './login';

export const adminLoginRouter = express.Router();

adminLoginRouter.post('/login', async (req, res)=>{
    try {
        const { email, password } = req.body;


        if(!email || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Invalid parameters",
                data: {}
            });
        }

        const adminLogin = new AdminLogin();
        const response = await adminLogin.login(
            {
                email: email,
                password: password
            }
        );

        let statusCode: StatusCodes;

        switch(response.success){
            case true:
                statusCode = StatusCodes.OK;
                break;
            case false:
                statusCode = StatusCodes.UNAUTHORIZED;
                break;
            default:
                statusCode = StatusCodes.NOT_FOUND;
        }

        return res.status(statusCode).json(response);
    }
    catch (error){
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: false, message: "Intenal server error", data: {} });
    }
});



adminLoginRouter.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        if(!email || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Invalid parameters",
                data: {}
            });
        }

        const adminLogin = new AdminLogin();
        const response = await adminLogin.register(
            {
                email: email,
                password: password
            }
        );

        let statusCode: StatusCodes;

        switch(response.success){
            case true:
                statusCode = StatusCodes.OK;
                break;
            case false:
                statusCode = StatusCodes.BAD_GATEWAY;
                break;
            default:
                statusCode = StatusCodes.NOT_FOUND;
        }

        return res.status(statusCode).json(response);
    }
    catch (error){
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: false, message: "Intenal server error", data: {} });
    }
});

adminLoginRouter.post('/verify', async (req, res)=>{
    try {
        const { code, email } = req.body;
        if(!code || !email) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Invalid parameters",
                data: {}
            });
        }

        const adminLogin = new AdminLogin();
        if(typeof code != "number"){
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Code must be a number",
                data: {}
            });
        }
        const response = await adminLogin.verify(
            {
                email: email,
                code: code
            }
        );

        let statusCode: StatusCodes;

        switch(response.success){
            case true:
                statusCode = StatusCodes.OK;
                break;
            case false:
                statusCode = StatusCodes.BAD_GATEWAY;
                break;
            default:
                statusCode = StatusCodes.NOT_FOUND;
        }

        return res.status(statusCode).json(response);
    }
    catch (error){
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: false, message: "Intenal server error", data: {} });
    }
});