import express from 'express';
import multer from 'multer';
import APIResponse from '../../interface/api.interface';
import { isEmpty, isValidEmail } from '../../utils/utils';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import { env } from '../../utils/env';
import { AdminPolls } from '../../models/AdminPolls';
import Polls from '../../models/polls';

const upload = multer({ storage: multer.memoryStorage() });

export const collectionRouter = express.Router();


// const token = jwt.sign({
//     adminId: "550e8400-e29b-41d4-a716-446655440000"
// }, env.SECURE_ADMIN_AUTH_KEY, {expiresIn: 2592000000/1000} );
// console.log(token);

function areVotersValid(voters: string): boolean {
    return !isEmpty(voters) && voters.split(',').every(isValidEmail);
}

function arePollsValid(collection){
    return !isEmpty(collection.polls) && collection.polls.every(poll => 
        poll.title && poll.options.length >= 2 && poll.options.every(option => option.value && !isEmpty(option.value))
    );
    
}

function validateCreateCollection(collection){
    const errors = [];

    if (!collection.title) errors.push('Title cannot be empty');
    if (!collection.start_time || !collection.end_time) errors.push('Datetime for starting or ending vote not provided');
    
    if (!collection.eligible_voters) errors.push('Eligible voters not found');
    else if (!areVotersValid(collection.eligible_voters)) errors.push('Not all email addresses are valid');
    
    if (!collection.polls || !Array.isArray(collection.polls) || collection.polls.length === 0) {
        errors.push('Polls cannot be empty');
    } else {
        collection.polls.forEach(poll => {
            if (!poll.title || !poll.options || poll.options.length < 2) {
                errors.push('Invalid poll data');
            }
            poll.options.forEach(option => {
                if (!option.value) errors.push('Option value cannot be empty');
            });
        });
    }

    const startDate = new Date(collection.start_time);
    const endDate = new Date(collection.end_time);

    if(endDate.getTime() - startDate.getTime() <= 0){
        errors.push('Voting cannot end before or the same time it starts.');
    } 
    
    if(isEmpty(collection.polls)){
        errors.push('Polls cannot be empty');
    }

    const isPollValid = arePollsValid(collection);

    if(!isPollValid) {
        errors.push('Some poll data are invalid');
    }

    return errors;
}

collectionRouter.post('/create', upload.any(), async (req, res) => {
    try{
        const { collection } = req.body;
        const { adminId } = req['user'];

        // check valid params
        //const { title, start_time: startVoting, end_time: endVoting, eligible_voters, polls } = collection;


        const collectionErrors = validateCreateCollection(collection);
        

        if(isEmpty(collectionErrors)){
        
            const adminPolls = new AdminPolls(adminId);

            const collectionId = await adminPolls.createCollection(collection, req.files);

            if(collectionId){
                const polls = new Polls(collectionId);
                const collectionData = await polls.fetchCollection(true);


                const successResponse : APIResponse = {
                    success: true,
                    message: "success",
                    data: collectionData
                }
            
                return res.status(StatusCodes.OK).json(successResponse)
            }
        }

        const  response : APIResponse 
        
        = {
            success: false,
            message: "Failed to create collection",
            data: {
                errors: collectionErrors
            }
        }


        return res.status(StatusCodes.BAD_REQUEST).json(response);
    }
    catch (error){
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: false, message: "Intenal server error", data: {} });
    }
});


collectionRouter.get('/fetch/all', async (req, res) => {
    try {

        const { adminId } = req['user'];

        const adminPolls = new AdminPolls(adminId);
        const collection = await adminPolls.fetchAllCollection();
        const data = {
            no_of_collections: collection.length,
            collections: collection
        }
        const apiResponse: APIResponse = {
            success: true,
            message: "success",
            data: data
        } 
        return res.status(StatusCodes.OK).json(apiResponse);
    }
    catch (error){
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: false, message: "Intenal server error", data: {} });
    }
});

collectionRouter.get('/fetch', async ( req, res ) => {
    try {
        const { collection_id } = req.query;
        const { adminId } = req['user'];


        if(!collection_id){
            const response : APIResponse = {
                success: false,
                message: "Invalid collection ID",
                data: {}
            };
            return res.status(StatusCodes.BAD_REQUEST).json(response);
        }

        // check if collection belongs to the adminId

        const adminPolls = new AdminPolls(adminId);

        const isCollectionCreator = await adminPolls.ownsCollection(collection_id.toString());

        if(isCollectionCreator){

            const polls = new Polls(collection_id.toString());
            const collection = await polls.fetchCollection(true);

            if(!collection){
                const response = {
                    status: false,
                    message: "Collection doesn't exist",
                    data: {}
                }
            
                return res.status(StatusCodes.NOT_FOUND).json(response);
            }
        
            const response: APIResponse = {
                success: true,
                message: "success",
                data: collection
            }
            return res.status(StatusCodes.OK).json(response);

        }
        else {
            const response = {
                status: false,
                message: "You are not authorized to view this collection",
                data: {}
            }
        
            return res.status(StatusCodes.UNAUTHORIZED).json(response);
        }
    }
    catch (error){
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: false, message: "Intenal server error", data: {} });
    }
});

