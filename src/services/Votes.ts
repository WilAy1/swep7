import Query from "../db/query";
import { VoteStruct } from "../interface/polls.interface";
import { isEmpty } from "../utils/utils";
import Polls from "./polls";

export class Votes extends Polls {
    protected readonly votesTable: Query;

    
    private readonly emailAddress: string;

    constructor(collection_id:string, { emailAddress }: { emailAddress: string }){
        super(collection_id);

        this.votesTable = new Query('votes');
        this.emailAddress = emailAddress;
    }

    async votedInCollection() : Promise<boolean> {
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

        return !isEmpty(result);
    }

    async voteExists({ pollId } : { pollId: string}){
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

        return !isEmpty(result); // returns true if vote exists
    }

    private async fetchVoterDetails(){
        const votersTable = new Query("voters");
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

        if(!result) return;

        return result[0];
    }

    private async insertVote(vote: VoteStruct, votersId){
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
        ])
        //            "id",
        //            "voting_time"
    }

    async vote(votes: VoteStruct[]){
        try {
            const votersDetails = await this.fetchVoterDetails();
            if(!votersDetails) return false; // shouldn't call

            for(const vote of votes){
                const pollId = vote.poll_id;
                const optionId = vote.option_id;

                const pollDetails = await this.fetchPoll(pollId);
                const optionDetails = await this.fetchOption({optionId: optionId, pollId: pollId});

                const userHasVoted = await this.voteExists({pollId: pollId});
                vote.option_value = optionDetails['value'];

                if(userHasVoted) continue; // shouldn't happen tho



                await this.insertVote(vote, votersDetails['id']);
                await this.updateCollectionVotes(pollId, optionId);

                // update votes in collection, polls and options

            }

            // don't loop this, only updates once per voter
            await this.table.customQuery("UPDATE collection SET no_of_votes=no_of_votes+1 WHERE id=$1", [this.collectionId]);

            return true;
        }
        catch(error){
            console.error(error);
            throw new Error(error);
        }
    }

    async updateCollectionVotes(pollId: string, optionId: string){
        try {
            await this.pollsTable.customQuery("UPDATE polls SET no_of_votes=no_of_votes+1 WHERE collection_id=$1 AND id=$2", [this.collectionId, pollId]);
            await this.optionsTable.customQuery("UPDATE poll_options SET no_of_votes=no_of_votes+1 WHERE collection_id=$1 AND poll_id=$2 AND id=$3", [this.collectionId, pollId, optionId]);
        }
        catch(error){
            console.error(error);
            throw new Error(error);
        }
    }
}