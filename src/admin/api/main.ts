import express from 'express';
import multer from 'multer';
import APIResponse from '../../interface/api.interface';
import { isEmpty, isValidEmail } from '../../utils/utils';
import { AdminPolls, Polls } from '../polls/polls';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import { env } from '../../utils/env';

const upload = multer({ storage: multer.memoryStorage() });

export const collectionRouter = express.Router();


// const token = jwt.sign({
//     adminId: "550e8400-e29b-41d4-a716-446655440000"
// }, env.SECURE_ADMIN_AUTH_KEY, {expiresIn: 2592000000/1000} );
// console.log(token);


collectionRouter.post('/create', upload.any(), async (req, res) => {
    const { collection } = req.body;
    const { adminId } = req['user'];

    // check valid params
    const { title, start_time: startVoting, end_time: endVoting, eligible_voters, polls } = collection;

    let response : APIResponse;

    response = {
        success: false,
        message: "Failed to create collection",
        data: {
            errors: []
        }
    }

    if(!title || !startVoting || !endVoting){
        if(!title){
            response.data['errors'].push('Title cannot be empty');
        }
        if(!startVoting || !endVoting){
            response.data['errors'].push('Datetime for starting or ending vote not provided')
        }
    }
    
    if(!eligible_voters){
        response.data['errors'].push('Eligible voters not found');
    }

    const allVotersAreEligible = isEmpty(eligible_voters) ? false : (eligible_voters.split(',').forEach(voter => {
        if(!isValidEmail(voter)) return false;
    }) || true)


    if(!allVotersAreEligible) {
        response.data['errors'].push('Not all email addresses are valid');
    }

    const startDate = new Date(startVoting);
    const endDate = new Date(endVoting);

    if(endDate.getTime() - startDate.getTime() <= 0){
        response.data['errors'].push('Voting cannot end before or the same time it starts.');
    } 

    if(isEmpty(polls)){
        response.data['errors'].push('Polls cannot be empty');
    }

    const isPollValid = isEmpty(collection.polls) ? false : (collection.polls.forEach(poll => {
        if(!poll.title || poll.options.length < 2){
            return false;
        }
        poll.options.forEach(option => {
            if(!option.value || (option.value && isEmpty(option.value))) return false;
        })
    }) || true)

    if(!isPollValid) {
        response.data['errors'].push('Some poll data are invalid');
    }

    if(isEmpty(response.data['errors'])){
    
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

    return res.status(StatusCodes.BAD_REQUEST).json(response);
});

collectionRouter.get('/fetch', async ( req, res ) => {
    const { collection_id } = req.query;

    if(!collection_id){
        const response : APIResponse = {
            success: false,
            message: "Invalid collection ID",
            data: {}
        };
        return res.status(StatusCodes.BAD_REQUEST).json(response);
    }

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
});