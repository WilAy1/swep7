import Query from '../../db/query';
import { isEmpty, sanitizeString, uniqueList } from '../../utils/utils';

interface PollOption {
    id: string,
    value: string,
    no_of_votes: number,
}

interface CollectionPoll {
    id: string
    title: string,
    required: boolean,
    no_of_options: number,
    no_of_votes: number,
    options: PollOption[],
}

interface Collection {
    id: string,
    title: string,
    no_of_eligible_voters: number,
    start_time: string,
    end_time: string,
    started: boolean,
    polls: CollectionPoll[]
}

interface CollectionExists {
    exists: boolean,
    reason?: string
}

export class Polls {
    protected readonly table: Query;
    protected readonly pollsTable: Query;
    protected readonly optionsTable: Query;

    protected readonly collectionId: string;
    
    constructor(collectionId: string){
        this.table = new Query("collection");
        this.pollsTable = new Query("polls")
        this.optionsTable = new Query("poll_options");

        this.collectionId = collectionId;
    }

    async collectionExists() : Promise<CollectionExists> {
        const result = await this.table.select({
            conditions: {
                compulsory: [
                    {
                        key: "id",
                        value: this.collectionId
                    }
                ]
            }
        });

        if(isEmpty(result)) return { exists: false, reason: "Collection doesn't exist" }; // collection doesn't exist

        const collection = result[0];

        const start_time = new Date(collection['start_time']);
        const end_time = new Date(collection['end_time']);
        const current_time = new Date();

        if(current_time >= start_time && current_time < end_time) {
            return { exists: true }; 
        }
        else if(current_time < start_time){
            return {exists: false, reason: "Voting hasn't started"}
        }
        
        return { exists: false, reason: "Voting has ended" };
        
    }


    async isEligibleVoter(emailAddress: string) : Promise<boolean> {
        const collection = await this.fetchCollectionData(true);
        if(!collection) return false;

        const eligibleVoters = collection['eligible_voters'].split(',');
        
        return eligibleVoters.includes(emailAddress);
    }
    

    async fetchCollectionData(isAdmin = false){
        const cols = isAdmin ? null : ['id', 'title', 'start_time', 'end_time', 'no_of_polls', 'created']
        const result = await this.table.select({
            cols: cols,
            conditions: {
                compulsory: [
                    {
                        key: "id",
                        value: this.collectionId
                    },
                ]
            }
        });

        if(isEmpty(result)) return;

        return result[0];
    }

    async fetchCollection(isAdmin = false){

        const collection = await this.fetchCollectionData(isAdmin);

        const polls = await this.fetchPolls(isAdmin);
        if(polls){
            for(const poll of polls){
                const options = await this.fetchOptions(poll['id'], isAdmin);
                poll['options'] = options || []; // add empty list if poll is undefined
            }
        }
        

        collection['polls'] = polls as CollectionPoll[];

        return collection as Collection;

    }

    async fetchPolls(isAdmin = false){
        const cols = ['id', 'title', 'required', 'no_of_options', 'created'];
        if(isAdmin){
            cols.push('no_of_votes', 'last_updated')
        }
        const result = await this.pollsTable.select({
            cols: cols,
            conditions: {
                compulsory: [
                    {
                        key: "collection_id",
                        value: this.collectionId
                    },
                ]
            }
        });

        if(isEmpty(result)) return;

        return result;
    }

    async fetchPoll(pollId: string){
        const result = await this.pollsTable.select({
            conditions: {
                compulsory: [
                    {
                        key: "collection_id",
                        value: this.collectionId
                    },
                    {
                        key: "id",
                        value: pollId
                    }
                ]
            }
        });

        if(isEmpty(result)) return;

        return result[0];
    }


    async fetchOptions(pollId: string, isAdmin = false){
        const cols = ['id', 'value', 'created'];
        if(isAdmin){
            cols.push('no_of_votes')
        }
        const result = await this.optionsTable.select({
            cols: cols,
            conditions: {
                compulsory: [
                    {
                        key: "poll_id",
                        value: pollId
                    },
                    {
                        key: "collection_id",
                        value: this.collectionId
                    }
                ]
            }
        });

        if(isEmpty(result)) return;

        return result as PollOption[];
    }

    async fetchOption({optionId, pollId}: {optionId: string, pollId: string}){
        const result = await this.optionsTable.select({
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
                        key: "id",
                        value: optionId
                    }
                ]
            }
        });

        if(isEmpty(result)) return;

        return result[0];
    }
}


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


export interface VoteStruct {
    poll_id: string,
    option_value: string,
    option_id: string
}

export function isValidVoteStruct(vote: any): vote is VoteStruct {
    return (
        vote !== null &&
        typeof vote === 'object' &&
        typeof vote.poll_id === 'string' &&
        typeof vote.option_value === 'string' &&
        typeof vote.option_id === 'string'
    );
}



/*const collection: Collection = {
    id: 'random_id',
    title: 'Students Vote 2024',
    no_of_eligible_voters: 10304,
    start_time: 'time',
    end_time: 'time',
    polls: [
        {
            id: 'random_id',
            title: 'President',
            required: true,
            no_of_options: 7,
            no_of_votes: 0,
            options: [
                {
                    id: 'random_id',
                    value: 'LordFem',
                    no_of_votes: 0
                },
                {
                    id: 'random_id',
                    value: 'LordFem',
                    no_of_votes: 0
                },
            ]
        },
        {
            id: 'random_id',
            title: 'President',
            required: true,
            no_of_options: 7,
            no_of_votes: 0,
            options: [
                {
                    id: 'random_id',
                    value: 'LordFem',
                    no_of_votes: 0
                },
                {
                    id: 'random_id',
                    value: 'LordFem',
                    no_of_votes: 0
                },
            ]
        },
    ]
}*/

export class AdminPolls {
    private readonly adminId: string;
    private readonly collectionTable: Query;
    private readonly pollsTable: Query;
    private readonly optionsTable: Query;
    
    constructor(adminId: string){
        this.adminId = adminId;

        this.collectionTable = new Query("collection");
        this.pollsTable = new Query("polls");
        this.optionsTable = new Query("poll_options");
    }
    
    async createCollection(collection, files){

        try {
            const { title, start_time: startVoting, end_time: endVoting, eligible_voters, polls } = collection;
            
            const startDate = new Date(startVoting);
            const endDate = new Date(endVoting);
            
            const startAt = startDate.toISOString();
            const endAt = endDate.toISOString();
            
            const eligibleVoters = uniqueList(eligible_voters.split(","));
            const noOfVoters = eligibleVoters.length;
            
            const collectionTitle = sanitizeString(title);
            const noOfPolls = polls.length;
            
            // create collection
            
            const insertResponse = await this.collectionTable.insert(
                [
                    "creator_id",
                    "title",
                    "start_time",
                    "end_time",
                    "eligible_voters",
                    "no_of_eligible_voters",
                    "no_of_polls",
                    "no_of_votes",
                ],
                [
                    this.adminId,
                    collectionTitle,
                    startAt,
                    endAt,
                    eligibleVoters.toString(), //convert the list to string
                    noOfVoters,
                    noOfPolls,
                    0
                ],
                {returnColumn: 'id'}
            );
            
        
            if(insertResponse){
                const collectionId = insertResponse['id'];
                
                for(const poll of polls){
                    await this.createPoll(poll, collectionId, files);
                }

                return collectionId;
            }

            return false;
        }
        catch(error){
            console.error(error);
            throw new Error(error);
        }
        

    //expected params
        
    // collection: {
    //  title: "",
    //  start_time: "",
    //  end_time: "",
    //  eligiible_voters: "",
    //  polls: [
    //      {
    //      title: "",
    //      required: "",
    //      otpions: [
    //          {
    //              title: "",
                 
    //          }
    //      ]
    //  ]
    // }
    // }
        
        //const {}
    }
    
    async createPoll(poll, collectionId: string, files){
        try{
            const { title, options } = poll;
            const pollTitle = sanitizeString(title);
            const required = poll.required || false;

            const noOfOptions = options.length;

            const insertResult = await this.pollsTable.insert(
                [
                    "collection_id",
                    "creator_id",
                    "title",
                    "required",
                    "no_of_options",
                    "no_of_votes",
                ],
                [
                    collectionId,
                    this.adminId,
                    pollTitle,
                    required,
                    noOfOptions,
                    0
                ],
                {returnColumn: 'id'}
            );

            if(insertResult){
                const pollId = insertResult['id'];

                for(const option of options){
                    await this.createOption(option, collectionId, pollId, files);
                }
            }
        }
        catch(error){
            console.error(error);
            throw new Error(error);
        }
    }

    async createOption(option, collectionId: string, pollId:string, files){
        try {
            const value = sanitizeString(option.value);
            if(files){
                // files.forEach(file => {
                //     // Process and save the file
                //     const filePath = `/uploads/${file.originalname}`; // Save the image
                //     // Update the JSON structure with file paths
                //     const [pollIndex, optionIndex] = file.fieldname.match(/\d+/g).map(Number);
                //     option.image = filePath;
                // });
            }

            await this.optionsTable.insert(
                [
                    'collection_id',
                    'poll_id',
                    'creator_id',
                    'value',
                    'no_of_votes'
                ],
                [
                    collectionId,
                    pollId,
                    this.adminId,
                    value,
                    0
                ],
                {returnColumn: 'id'}
            );
        }
        catch(error){
            console.error(error);
            throw new Error(error);
        }

    }

}


// interface ExpectedCollection {
//     collection: {
//         title: string,
//         start_time: string,
//         end_time: string,
//         eligible_voters: string,
//         polls: [
//             {
//                 title: string,
//                 required: boolean,
//                 options: [
//                     {
//                         title: string
//                     }
//                 ]
//             }
//         ]
//     }
// }