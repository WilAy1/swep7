import { Stream } from "stream";
import Query from "../db/query";
import { isEmpty, sanitizeString, uniqueList } from "../utils/utils";
import Polls from "./polls";
import fs from 'fs';
import { writeFile } from 'fs/promises';
import path from "path";
import mime from 'mime-types';

export class AdminPolls {
    private readonly adminId: string;
    private readonly collectionTable: Query;
    private readonly pollsTable: Query;
    private readonly optionsTable: Query;
    private readonly creatorTable: Query;
    private readonly fileDir: string;
    
    constructor(adminId: string){
        this.adminId = adminId;

        this.collectionTable = new Query("collection");
        this.pollsTable = new Query("polls");
        this.optionsTable = new Query("poll_options");
        this.creatorTable = new Query("creators");

        const currentDirectory = process.cwd();

        const rootDir = currentDirectory.includes('/src')
        ? path.resolve(currentDirectory, '../')
        : currentDirectory;
      
        this.fileDir = `${rootDir}/uploads`;
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

    async saveFile(file: { buffer: string | NodeJS.ArrayBufferView | Iterable<string | NodeJS.ArrayBufferView> | AsyncIterable<string | NodeJS.ArrayBufferView> | Stream; }, filePath: fs.PathLike | fs.promises.FileHandle) {
        try {
            await writeFile(filePath, file.buffer);
        }
        catch(error){
            console.error(error);
            throw new Error(error);
        }
    }

    async createCollection(collection, files, noOfVoters){

        try {
            const eligibleVotersFile = files.find(file => file.fieldname === "collection.eligible_voters");


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
                        "",
                        noOfVoters,
                        noOfPolls,
                        0
                    ],
                    {returnColumn: 'id'}
                );

            
                if(insertResponse){
                    const collectionId = insertResponse['id'];

                    const fileName = `${collectionId}${path.extname(eligibleVotersFile.originalname)}`;
                    const fDir = path.join(this.fileDir, 'csv', fileName);

                    await this.saveFile(eligibleVotersFile, fDir);

                    for(const [ key, poll ] of polls.entries()){
                        await this.createPoll({index: key, poll: poll}, collectionId, files);
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
    
    async createPoll({index, poll}, collectionId: string, files){
        
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

                for(const [ key, option ] of options.entries()){
                    const imageFile = files.find(file => file.fieldname === `collection.polls[${index}].options[${key}].image`) || null;
                    await this.createOption(option, collectionId, pollId, imageFile);
                }
            }
        }
        catch(error){
            console.error(error);
            throw new Error(error);
        }
    }

    async createOption(option, collectionId: string, pollId:string, file){
        try {



            const value = sanitizeString(option.value);

            const response = await this.optionsTable.insert(
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

            if(response && file) {

                const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
                const fileMimeType = mime.lookup(file.originalname);
                
                const optionId = response['id'];

                if (allowedMimeTypes.includes(fileMimeType)) {
                    const fileName = `${optionId}.png`;
                    const fDir = path.join(this.fileDir, 'option-images', fileName);

                    await this.saveFile(file, fDir);
                }
            }

        }
        catch(error){
            console.error(error);
            throw new Error(error);
        }

    }

}