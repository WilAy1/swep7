"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const query_1 = __importDefault(require("../db/query"));
const csv_1 = require("../services/csv");
const utils_1 = require("../utils/utils");
const fs_1 = __importDefault(require("fs"));
class Polls {
    constructor(collectionId) {
        this.table = new query_1.default("collection");
        this.pollsTable = new query_1.default("polls");
        this.optionsTable = new query_1.default("poll_options");
        this.collectionId = collectionId;
        const currentDirectory = process.cwd();
        const rootDir = currentDirectory.includes('/src')
            ? path_1.default.resolve(currentDirectory, '../')
            : currentDirectory;
        this.fileDir = `${rootDir}/uploads`;
    }
    async collectionExists() {
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
        if ((0, utils_1.isEmpty)(result))
            return { exists: false, reason: "Collection doesn't exist" }; // collection doesn't exist
        const collection = result[0];
        const start_time = new Date(collection['start_time']);
        const end_time = new Date(collection['end_time']);
        const current_time = new Date();
        if (current_time >= start_time && current_time < end_time) {
            return { exists: true };
        }
        else if (current_time < start_time) {
            return { exists: false, reason: "Voting hasn't started" };
        }
        return { exists: false, reason: "Voting has ended" };
    }
    async isEligibleVoter(emailAddress) {
        const collection = await this.fetchCollectionData(true);
        if (!collection)
            return false;
        const isElgible = await (0, csv_1.checkEmailInCsv)(emailAddress, collection['id']);
        return isElgible;
    }
    async fetchCollectionData(isAdmin = false) {
        const cols = isAdmin ? null : ['id', 'title', 'start_time', 'end_time', 'no_of_polls', 'created'];
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
        if ((0, utils_1.isEmpty)(result))
            return;
        return result[0];
    }
    async fetchCollection(isAdmin = false) {
        const collection = await this.fetchCollectionData(isAdmin);
        if (collection) {
            const polls = await this.fetchPolls(isAdmin);
            if (polls) {
                for (const poll of polls) {
                    const options = await this.fetchOptions(poll['id'], isAdmin);
                    poll['options'] = options || []; // add empty list if poll is undefined
                }
            }
            collection['polls'] = polls;
            return collection;
        }
        return;
    }
    async fetchPolls(isAdmin = false) {
        const cols = ['id', 'title', 'required', 'no_of_options', 'created'];
        if (isAdmin) {
            cols.push('no_of_votes', 'last_updated');
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
        if ((0, utils_1.isEmpty)(result))
            return;
        return result;
    }
    async fetchPoll(pollId) {
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
        if ((0, utils_1.isEmpty)(result))
            return;
        return result[0];
    }
    async fetchOptions(pollId, isAdmin = false) {
        const cols = ['id', 'value', 'created'];
        if (isAdmin) {
            cols.push('no_of_votes');
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
        if ((0, utils_1.isEmpty)(result))
            return;
        for (const option of result) {
            const optionFilePath = path_1.default.join(this.fileDir, 'option-images', `${option['id']}.png`);
            if (fs_1.default.existsSync(optionFilePath)) {
                option['image_link'] = `localhost:3000/images/${option['id']}.png`;
            }
        }
        return result;
    }
    async fetchOption({ optionId, pollId }) {
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
        if ((0, utils_1.isEmpty)(result))
            return;
        return result[0];
    }
}
exports.default = Polls;
//# sourceMappingURL=Polls.js.map