import Query from '../../db/query';
import { VoteStruct } from '../../interface/polls.interface';
import Polls from '../../services/polls';
import { isEmpty, sanitizeString, uniqueList } from '../../utils/utils';



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
    private readonly creatorTable: Query;
    
    constructor(adminId: string){
        this.adminId = adminId;

        this.collectionTable = new Query("collection");
        this.pollsTable = new Query("polls");
        this.optionsTable = new Query("poll_options");
        this.creatorTable = new Query("creators");
    }

    async ownsCollection(collectionId: string) : Promise<boolean> {
        try {
            const result = await this.collectionTable.select({
                conditions: {
                    compulsory: [
                        {
                            key: "creator_id",
                            value: this.adminId
                        },
                        {
                            key: "id",
                            value: collectionId
                        }
                    ]
                }
            })

            return !isEmpty(result);
        }
        catch(error){
            console.error(error);
            throw new Error(error);
        }
    }

    async fetchAllCollection(){
        try {

            const result = await this.collectionTable.select({
                cols: ["id"],
                conditions: {
                    compulsory: [
                        {
                            key: "creator_id",
                            value: this.adminId
                        }
                    ]
                }
            });

            const collections = [];

            for(const row of result){
                try {
                    const polls = new Polls(row['id']);
                    const collection = await polls.fetchCollection();
                    collections.push(collection);
                }
                catch(error){
                    console.error(error);
                    throw new Error(error);
                }
            }


            return collections;
        }
        catch(error){
            console.error(error);
            throw new Error(error);
        }
    }

    async createCollection(collection, files){

        try {

            const creatorResult = await this.creatorTable.select({
                cols: ["id"],
                conditions: {
                    compulsory: [
                        {
                            key: "id",
                            value: this.adminId
                        }
                    ]
                }
            });

            if(!isEmpty(creatorResult)){

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