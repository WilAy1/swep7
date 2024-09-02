"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectionRouter = void 0;
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const utils_1 = require("../../utils/utils");
const http_status_codes_1 = require("http-status-codes");
const AdminPolls_1 = require("../../models/AdminPolls");
const Polls_1 = __importDefault(require("../../models/Polls"));
const csv_1 = require("../../services/csv");
const path_1 = __importDefault(require("path"));
const currentDirectory = process.cwd();
const rootDirectory = currentDirectory.includes('/src')
    ? path_1.default.resolve(currentDirectory, '../')
    : currentDirectory;
const memoryStorage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: memoryStorage });
exports.collectionRouter = express_1.default.Router();
// const token = jwt.sign({
//     adminId: "550e8400-e29b-41d4-a716-446655440000"
// }, env.SECURE_ADMIN_AUTH_KEY, {expiresIn: 2592000000/1000} );
// console.log(token);
function areVotersValid(voters) {
    return !(0, utils_1.isEmpty)(voters) && voters.split(',').every(utils_1.isValidEmail);
}
function arePollsValid(collection) {
    return !(0, utils_1.isEmpty)(collection.polls) && collection.polls.every(poll => poll.title && poll.options.length >= 1 && poll.options.every(option => option.value && !(0, utils_1.isEmpty)(option.value)));
}
function validateCreateCollection(collection) {
    const errors = [];
    if (!collection.title)
        errors.push('Title cannot be empty');
    if (!collection.start_time || !collection.end_time)
        errors.push('Datetime for starting or ending vote not provided');
    // if (!collection.eligible_voters) errors.push('Eligible voters not found');
    // else if (!areVotersValid(collection.eligible_voters)) errors.push('Not all email addresses are valid');
    if (!collection.polls || !Array.isArray(collection.polls) || collection.polls.length === 0) {
        errors.push('Polls cannot be empty');
    }
    else {
        collection.polls.forEach(poll => {
            if (!poll.title || !poll.options || poll.options.length < 1) {
                errors.push('Invalid poll data');
            }
            poll.options.forEach(option => {
                if (!option.value)
                    errors.push('Option value cannot be empty');
            });
        });
    }
    const startDate = new Date(collection.start_time);
    const endDate = new Date(collection.end_time);
    if (endDate.getTime() - startDate.getTime() <= 0) {
        errors.push('Voting cannot end before or the same time it starts.');
    }
    if ((0, utils_1.isEmpty)(collection.polls)) {
        errors.push('Polls cannot be empty');
    }
    const isPollValid = arePollsValid(collection);
    if (!isPollValid) {
        errors.push('Some poll data are invalid');
    }
    return errors;
}
exports.collectionRouter.post('/create', upload.any(), async (req, res) => {
    try {
        let { collection } = req.body;
        collection = JSON.parse(collection);
        const { adminId } = req['user'];
        const files = req.files;
        let eligibleVotersFile = null;
        let numberOfEligibleVoters = 0;
        if (Array.isArray(files)) {
            eligibleVotersFile = files.find(file => file.fieldname === "collection.eligible_voters");
        }
        if (eligibleVotersFile) {
            const { isValid, emailCount } = await (0, csv_1.isValidEmailFile)(eligibleVotersFile);
            const response = {
                success: false,
                message: "Couldn't read email addresses from file",
                data: {}
            };
            if (!isValid)
                return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json(response);
            numberOfEligibleVoters = emailCount;
        }
        else {
            const response = {
                success: false,
                message: "Couldn't find email addresses file",
                data: {}
            };
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json(response);
        }
        const collectionErrors = validateCreateCollection(collection);
        if ((0, utils_1.isEmpty)(collectionErrors)) {
            const adminPolls = new AdminPolls_1.AdminPolls(adminId);
            const collectionId = await adminPolls.createCollection(collection, req.files, numberOfEligibleVoters);
            if (collectionId) {
                const polls = new Polls_1.default(collectionId);
                const collectionData = await polls.fetchCollection(true);
                const successResponse = {
                    success: true,
                    message: "success",
                    data: collectionData
                };
                return res.status(http_status_codes_1.StatusCodes.OK).json(successResponse);
            }
        }
        const response = {
            success: false,
            message: "Failed to create collection",
            data: {
                errors: collectionErrors
            }
        };
        return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json(response);
    }
    catch (error) {
        console.error(error);
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ status: false, message: "Intenal server error", data: {} });
    }
});
exports.collectionRouter.get('/fetch/all', async (req, res) => {
    try {
        const { adminId } = req['user'];
        const adminPolls = new AdminPolls_1.AdminPolls(adminId);
        const collection = await adminPolls.fetchAllCollection();
        const data = {
            no_of_collections: collection.length,
            collections: collection
        };
        const apiResponse = {
            success: true,
            message: "success",
            data: data
        };
        return res.status(http_status_codes_1.StatusCodes.OK).json(apiResponse);
    }
    catch (error) {
        console.error(error);
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ status: false, message: "Intenal server error", data: {} });
    }
});
exports.collectionRouter.get('/fetch', async (req, res) => {
    try {
        const { collection_id } = req.query;
        const { adminId } = req['user'];
        if (!collection_id) {
            const response = {
                success: false,
                message: "Invalid collection ID",
                data: {}
            };
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json(response);
        }
        // check if collection belongs to the adminId
        const adminPolls = new AdminPolls_1.AdminPolls(adminId);
        const isCollectionCreator = await adminPolls.ownsCollection(collection_id.toString());
        if (isCollectionCreator) {
            const polls = new Polls_1.default(collection_id.toString());
            const collection = await polls.fetchCollection(true);
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
        else {
            const response = {
                status: false,
                message: "You are not authorized to view this collection",
                data: {}
            };
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json(response);
        }
    }
    catch (error) {
        console.error(error);
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ status: false, message: "Intenal server error", data: {} });
    }
});
//# sourceMappingURL=collection.router.js.map