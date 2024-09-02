"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminPolls = void 0;
const query_1 = __importDefault(require("../db/query"));
const utils_1 = require("../utils/utils");
const Polls_1 = __importDefault(require("./Polls"));
const promises_1 = require("fs/promises");
const path_1 = __importDefault(require("path"));
const mime_types_1 = __importDefault(require("mime-types"));
class AdminPolls {
    constructor(adminId) {
        this.adminId = adminId;
        this.collectionTable = new query_1.default("collection");
        this.pollsTable = new query_1.default("polls");
        this.optionsTable = new query_1.default("poll_options");
        this.creatorTable = new query_1.default("creators");
        const currentDirectory = process.cwd();
        const rootDir = currentDirectory.includes('/src')
            ? path_1.default.resolve(currentDirectory, '../')
            : currentDirectory;
        this.fileDir = `${rootDir}/uploads`;
    }
    async ownsCollection(collectionId) {
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
            });
            return !(0, utils_1.isEmpty)(result);
        }
        catch (error) {
            console.error(error);
            throw new Error(error);
        }
    }
    async fetchAllCollection() {
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
            for (const row of result) {
                try {
                    const polls = new Polls_1.default(row['id']);
                    const collection = await polls.fetchCollection();
                    collections.push(collection);
                }
                catch (error) {
                    console.error(error);
                    throw new Error(error);
                }
            }
            return collections;
        }
        catch (error) {
            console.error(error);
            throw new Error(error);
        }
    }
    async saveFile(file, filePath) {
        try {
            await (0, promises_1.writeFile)(filePath, file.buffer);
        }
        catch (error) {
            console.error(error);
            throw new Error(error);
        }
    }
    async createCollection(collection, files, noOfVoters) {
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
            if (!(0, utils_1.isEmpty)(creatorResult)) {
                const { title, start_time: startVoting, end_time: endVoting, eligible_voters, polls } = collection;
                const startDate = new Date(startVoting);
                const endDate = new Date(endVoting);
                const startAt = startDate.toISOString();
                const endAt = endDate.toISOString();
                const collectionTitle = (0, utils_1.sanitizeString)(title);
                const noOfPolls = polls.length;
                // create collection
                const insertResponse = await this.collectionTable.insert([
                    "creator_id",
                    "title",
                    "start_time",
                    "end_time",
                    "eligible_voters",
                    "no_of_eligible_voters",
                    "no_of_polls",
                    "no_of_votes",
                ], [
                    this.adminId,
                    collectionTitle,
                    startAt,
                    endAt,
                    "",
                    noOfVoters,
                    noOfPolls,
                    0
                ], { returnColumn: 'id' });
                if (insertResponse) {
                    const collectionId = insertResponse['id'];
                    const fileName = `${collectionId}${path_1.default.extname(eligibleVotersFile.originalname)}`;
                    const fDir = path_1.default.join(this.fileDir, 'csv', fileName);
                    await this.saveFile(eligibleVotersFile, fDir);
                    for (const [key, poll] of polls.entries()) {
                        await this.createPoll({ index: key, poll: poll }, collectionId, files);
                    }
                    return collectionId;
                }
            }
            return false;
        }
        catch (error) {
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
    async createPoll({ index, poll }, collectionId, files) {
        try {
            const { title, options } = poll;
            const pollTitle = (0, utils_1.sanitizeString)(title);
            const required = poll.required || false;
            const noOfOptions = options.length;
            const insertResult = await this.pollsTable.insert([
                "collection_id",
                "creator_id",
                "title",
                "required",
                "no_of_options",
                "no_of_votes",
            ], [
                collectionId,
                this.adminId,
                pollTitle,
                required,
                noOfOptions,
                0
            ], { returnColumn: 'id' });
            if (insertResult) {
                const pollId = insertResult['id'];
                for (const [key, option] of options.entries()) {
                    const imageFile = files.find(file => file.fieldname === `collection.polls[${index}].options[${key}].image`) || null;
                    await this.createOption(option, collectionId, pollId, imageFile);
                }
            }
        }
        catch (error) {
            console.error(error);
            throw new Error(error);
        }
    }
    async createOption(option, collectionId, pollId, file) {
        try {
            const value = (0, utils_1.sanitizeString)(option.value);
            const response = await this.optionsTable.insert([
                'collection_id',
                'poll_id',
                'creator_id',
                'value',
                'no_of_votes'
            ], [
                collectionId,
                pollId,
                this.adminId,
                value,
                0
            ], { returnColumn: 'id' });
            if (response && file) {
                const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
                const fileMimeType = mime_types_1.default.lookup(file.originalname).toString();
                const optionId = response['id'];
                if (allowedMimeTypes.includes(fileMimeType)) {
                    const fileName = `${optionId}.png`;
                    const fDir = path_1.default.join(this.fileDir, 'option-images', fileName);
                    await this.saveFile(file, fDir);
                }
            }
        }
        catch (error) {
            console.error(error);
            throw new Error(error);
        }
    }
}
exports.AdminPolls = AdminPolls;
//# sourceMappingURL=AdminPolls.js.map