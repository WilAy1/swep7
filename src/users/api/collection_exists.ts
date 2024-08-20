// import express from 'express';
// import { Polls, Votes } from '../../admin/polls/polls';
// import { StatusCodes } from 'http-status-codes';
// import APIResponse from '../../interface/api.interface';

// const collection = express.Router();


// collection.get('/collection_exists', async (req, res) => {
//     try {
//         const { collection_id } = req.query;

//         const polls = new Polls(collection_id.toString());

//         const {exists, reason} = await polls.collectionExists();

//         const response : APIResponse = {
//             success: exists,
//             message: reason || "success",
//             data: {}
//         }

//         return res.status(StatusCodes.OK).json(response);
//     }
//     catch {
//         return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: false, message: "Intenal server error", data: {} });
//     }
// });


// collection.get('/fetch_collection', async (req, res) => {
//     try {
//         const { collection_id } = req.query;
//         const email = req['email'];
        

//         const polls = new Polls(collection_id.toString());

//         // check if voter is eligible to vote
        
//         const isEligble = polls.isEligibleVoter(email);
//         if(!isEligble){
//             const response = {
//                 status: false,
//                 message: "Polls aren't available for this voter",
//                 data: {}
//             }
//         }

//         const collection = polls.fetchCollection();


//     }
//     catch {
//         return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: false, message: "Intenal server error", data: {} });
//     }
// })


// collection.post('/submit_vote', async (req, res) => {
//     try {
//         const { collection_id, votes } = req.body;
//         const email = req["email"];
        
//         const polls = new Polls(collection_id);
//         const isEligiible = await polls.isEligibleVoter(email);
//         const { exists } = await polls.collectionExists();

//         if(!isEligiible || !exists) return // error

//         if(votes && Array.isArray(votes)){
//             const voteClass = new Votes(collection_id, { emailAddress: email });
//             await voteClass.vote(votes);
//         }

//         /**
//          * body fotmat
//          * {
//          *  collection_id: string,
//          *  votes: [
//          *      {
//          *          poll_id: "p_id",
//          *          option_value: "",
//          *          option_id: "o_id"
//          *      },
//          *      {
//          *          poll_id: "p_id",
//          *          option_value: "",
//          *          option_id: "o_id"
//          *      },
//          *  ]
//          * }
//          */
//     }
//     catch {
//         return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: false, message: "Intenal server error", data: {} });
//     }
// });