"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Votes = void 0;
const query_1 = __importDefault(require("../db/query"));
const utils_1 = require("../utils/utils");
const Polls_1 = __importDefault(require("./Polls"));
class Votes extends Polls_1.default {
    constructor(collection_id, { emailAddress }) {
        super(collection_id);
        this.votesTable = new query_1.default('votes');
        this.emailAddress = emailAddress;
    }
    async votedInCollection() {
        /*
            if a voter has voted in collection, that voter shouldn't be allowed to vote again
        */
        const result = await this.votesTable.select({
            conditions: {
                compulsory: [
                    {
                        key: "collection_id",
                        value: this.collectionId
                    },
                    {
                        key: "voter_email",
                        value: this.emailAddress
                    }
                ]
            }
        });
        return !(0, utils_1.isEmpty)(result);
    }
    async voteExists({ pollId }) {
        const result = await this.votesTable.select({
            conditions: {
                compulsory: [
                    {
                        key: "poll_id",
                        value: pollId
                    },
                    {
                        key: "collection_id",
                        value: this.collectionId
                    },
                    {
                        key: "voter_email",
                        value: this.emailAddress
                    }
                ]
            }
        });
        return !(0, utils_1.isEmpty)(result); // returns true if vote exists
    }
    async fetchVoterDetails() {
        const votersTable = new query_1.default("voters");
        const result = await votersTable.select({
            conditions: {
                compulsory: [
                    {
                        key: "email",
                        value: this.emailAddress
                    },
                    {
                        key: "for_collection",
                        value: this.collectionId
                    }
                ]
            }
        });
        if (!result)
            return;
        return result[0];
    }
    async insertVote(vote, votersId) {
        return await this.votesTable.insert([
            "collection_id",
            "poll_id",
            "option_id",
            "option_value",
            "voter_id",
            "voter_email"
        ], [
            this.collectionId,
            vote.poll_id,
            vote.option_id,
            vote.option_value,
            votersId,
            this.emailAddress
        ]);
        //            "id",
        //            "voting_time"
    }
    async vote(votes) {
        try {
            const votersDetails = await this.fetchVoterDetails();
            if (!votersDetails)
                return false; // shouldn't call
            let allPollsVoted = true;
            for (const vote of votes) {
                const pollId = vote.poll_id;
                const optionId = vote.option_id;
                const pollDetails = await this.fetchPoll(pollId);
                const optionDetails = await this.fetchOption({ optionId: optionId, pollId: pollId });
                if (!pollDetails || !optionDetails) {
                    allPollsVoted = false;
                    continue;
                }
                const userHasVoted = await this.voteExists({ pollId: pollId });
                vote.option_value = optionDetails['value'];
                if (userHasVoted)
                    continue; // shouldn't happen tho
                await this.insertVote(vote, votersDetails['id']);
                await this.updateCollectionVotes(pollId, optionId);
                // update votes in collection, polls and options
            }
            // don't loop this, only updates once per voter
            await this.table.customQuery("UPDATE collection SET no_of_votes=no_of_votes+1 WHERE id=$1", [this.collectionId]);
            return allPollsVoted;
        }
        catch (error) {
            console.error(error);
            throw new Error(error);
        }
    }
    async updateCollectionVotes(pollId, optionId) {
        try {
            await this.pollsTable.customQuery("UPDATE polls SET no_of_votes=no_of_votes+1 WHERE collection_id=$1 AND id=$2", [this.collectionId, pollId]);
            await this.optionsTable.customQuery("UPDATE poll_options SET no_of_votes=no_of_votes+1 WHERE collection_id=$1 AND poll_id=$2 AND id=$3", [this.collectionId, pollId, optionId]);
        }
        catch (error) {
            console.error(error);
            throw new Error(error);
        }
    }
}
exports.Votes = Votes;
//# sourceMappingURL=Votes.js.map