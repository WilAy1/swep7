import path from "path";
import Query from "../db/query";
import { Collection, CollectionExists, CollectionPoll, PollOption } from "../interface/polls.interface";
import { checkEmailInCsv } from "../services/csv";
import { isEmpty } from "../utils/utils";
import fs from 'fs';

export default class Polls {
    protected readonly table: Query;
    protected readonly pollsTable: Query;
    protected readonly optionsTable: Query;

    protected readonly collectionId: string;

    private readonly fileDir: string;
    
    constructor(collectionId: string){
        this.table = new Query("collection");
        this.pollsTable = new Query("polls")
        this.optionsTable = new Query("poll_options");

        this.collectionId = collectionId;

        const currentDirectory = process.cwd();

        const rootDir = currentDirectory.includes('/src')
        ? path.resolve(currentDirectory, '../')
        : currentDirectory;
      
        this.fileDir = `${rootDir}/uploads`;
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

        const isElgible = await checkEmailInCsv(emailAddress, collection['id']);

        return isElgible;
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

        if(collection){
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

        return;

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

        

        for(const option of result){
            const optionFilePath = path.join(this.fileDir, 'option-images', `${option['id']}.png`);
            console.log(optionFilePath);
            if (fs.existsSync(optionFilePath)) {
                option['image_link'] = `localhost:3000/images/${option['id']}.png`
            }
        }

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