"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.collection = void 0;
const express_1 = __importDefault(require("express"));
const http_status_codes_1 = require("http-status-codes");
const utils_1 = require("../../utils/utils");
const Polls_1 = __importDefault(require("../../models/Polls"));
const polls_interface_1 = require("../../interface/polls.interface");
const Votes_1 = require("../../models/Votes");
exports.collection = express_1.default.Router();
exports.collection.get('/collection-exists', async (req, res) => {
    try {
        const { collection_id } = req.query;
        if (!collection_id) {
            const response = {
                success: false,
                message: "Invalid params",
                data: {}
            };
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json(response);
        }
        const polls = new Polls_1.default(collection_id.toString());
        const { exists, reason } = await polls.collectionExists();
        const response = {
            success: exists,
            message: reason || "success",
            data: {}
        };
        return res.status(http_status_codes_1.StatusCodes.OK).json(response);
    }
    catch (error) {
        console.error(error);
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ status: false, message: "Intenal server error", data: {} });
    }
});
exports.collection.get('/fetch-collection', async (req, res) => {
    try {
        const { collection_id } = req.query;
        const { email, collectionId } = req['voter'];
        const polls = new Polls_1.default(collection_id.toString());
        // check if voter is eligible to vote
        const isEligble = await polls.isEligibleVoter(email);
        if (!isEligble) {
            const response = {
                status: false,
                message: "Polls aren't available for this voter",
                data: {}
            };
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json(response);
        }
        const collection = await polls.fetchCollection();
        if (!collection) {
            const response = {
                status: false,
                message: "Collection doesn't exist",
                data: {}
            };
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json(response);
        }
        const response = {
            success: true,
            message: "success",
            data: collection
        };
        return res.status(http_status_codes_1.StatusCodes.OK).json(response);
    }
    catch (error) {
        console.error(error);
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ status: false, message: "Intenal server error", data: {} });
    }
});
exports.collection.post('/submit-vote', async (req, res) => {
    try {
        const { email, collectionId } = req['voter'];
        const { collection_id, votes } = req.body;
        if (!collection_id || !votes) {
            const response = {
                success: false,
                message: "Invalid params",
                data: {}
            };
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json(response);
        }
        const polls = new Polls_1.default(collection_id);
        const isEligiible = await polls.isEligibleVoter(email);
        const { exists, reason } = await polls.collectionExists();
        if (!isEligiible || !exists || (collectionId != collection_id)) {
            const response = {
                success: false,
                message: "",
                data: {}
            };
            if (!exists) {
                response.message = reason;
            }
            if (!isEligiible || (collectionId != collection_id)) {
                response.message = "You're not eligible to vote";
            }
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json(response);
        }
        if (votes && Array.isArray(votes)) {
            const isVotesValid = votes.every(polls_interface_1.isValidVoteStruct);
            if (!isVotesValid || (0, utils_1.isEmpty)(votes)) {
                const response = {
                    success: false,
                    message: "Invalid vote param",
                    data: {}
                };
                return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json(response);
            }
            const voteClass = new Votes_1.Votes(collection_id, { emailAddress: email });
            const hasVoterVoted = await voteClass.votedInCollection();
            if (hasVoterVoted) {
                const response = {
                    success: false,
                    message: "Voting failed. You have already voted.",
                    data: {}
                };
                return res.status(http_status_codes_1.StatusCodes.FORBIDDEN).json(response);
                ;
            }
            const voteResult = await voteClass.vote(votes);
            let response;
            if (!voteResult) {
                response = {
                    success: true,
                    message: "Successfully voted. Some votes were not casted.",
                    data: {}
                };
            }
            else {
                response = {
                    success: true,
                    message: "Successfully voted",
                    data: {}
                };
            }
            return res.status(http_status_codes_1.StatusCodes.OK).json(response);
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
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ status: false, message: "Intenal server error", data: {} });
    }
});
//# sourceMappingURL=collection.js.map