"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidVoteStruct = isValidVoteStruct;
function isValidVoteStruct(vote) {
    return (vote !== null &&
        typeof vote === 'object' &&
        typeof vote.poll_id === 'string' &&
        typeof vote.option_value === 'string' &&
        typeof vote.option_id === 'string');
}
//# sourceMappingURL=polls.interface.js.map