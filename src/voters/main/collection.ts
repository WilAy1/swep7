import express from 'express';
import { StatusCodes } from 'http-status-codes';
import APIResponse from '../../interface/api.interface';
import { isEmpty } from '../../utils/utils';
import Polls from '../../services/polls';
import { isValidVoteStruct } from '../../interface/polls.interface';
import { Votes } from '../../services/Votes';

export const collection = express.Router();


collection.get('/collection-exists', async (req, res) => {
    try {
        const { collection_id } = req.query;

        if(!collection_id){
            const response : APIResponse = {
                success: false,
                message: "Invalid params",
                data: {}
            }

            return res.status(StatusCodes.BAD_REQUEST).json(response);
        }

        const polls = new Polls(collection_id.toString());

        const {exists, reason} = await polls.collectionExists();

        const response : APIResponse = {
            success: exists,
            message: reason || "success",
            data: {}
        }

        return res.status(StatusCodes.OK).json(response);
    }
    catch(error) {
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: false, message: "Intenal server error", data: {} });
    }
});


collection.get('/fetch-collection', async (req, res) => {
    try {
        const { collection_id } = req.query;
        
        const { email, collectionId } = req['voter'];

        const polls = new Polls(collection_id.toString());

        // check if voter is eligible to vote
        
        const isEligble = await polls.isEligibleVoter(email);
        if(!isEligble){
            const response = {
                status: false,
                message: "Polls aren't available for this voter",
                data: {}
            }

            return res.status(StatusCodes.UNAUTHORIZED).json(response);
        }

        const collection = await polls.fetchCollection();

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
    catch (error){
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: false, message: "Intenal server error", data: {} });
    }
})


collection.post('/submit-vote', async (req, res) => {
    try {
        const { collection_id, votes } = req.body;
        if(!collection_id || !votes) {
            const response : APIResponse = {
                success: false,
                message: "Invalid params",
                data: {}
            }
            return res.status(StatusCodes.BAD_REQUEST).json(response);
        }
        const { email, collectionId } = req['voter'];
        
        const polls = new Polls(collection_id);
        const isEligiible = await polls.isEligibleVoter(email);
        const { exists, reason } = await polls.collectionExists();

        if(!isEligiible || !exists) {
            const response : APIResponse = {
                success: false,
                message: "",
                data: {}
            }
            if(!exists){
                response.message = reason;
            }
            if(!isEligiible){
                response.message = "You're not eligible to vote";
            }

            return res.status(StatusCodes.UNAUTHORIZED).json(response);
        }

        if(votes && Array.isArray(votes)){
            const isVotesValid = votes.every(isValidVoteStruct);
            if(!isVotesValid || isEmpty(votes)){
                const response : APIResponse = {
                    success: false,
                    message: "Invalid vote param",
                    data: {}
                }
                return res.status(StatusCodes.BAD_REQUEST).json(response);
            }

            const voteClass = new Votes(collection_id, { emailAddress: email });
            await voteClass.vote(votes);

            const response: APIResponse = {
                success: true,
                message: "successfully voted",
                data: {}
            }
            return res.status(StatusCodes.OK).json(response);
            
        }

        /**
         * body fotmat
         * {
         *  collection_id: string,
         *  votes: [
         *      {
         *          poll_id: "p_id",
         *          option_value: "",
         *          option_id: "o_id"
         *      },
         *      {
         *          poll_id: "p_id",
         *          option_value: "",
         *          option_id: "o_id"
         *      }, 
         *  ]
         * }
         */
    }
    catch {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: false, message: "Intenal server error", data: {} });
    }
});