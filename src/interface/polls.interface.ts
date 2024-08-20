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

interface VoteStruct {
    poll_id: string,
    option_value: string,
    option_id: string
}

function isValidVoteStruct(vote: any): vote is VoteStruct {
    return (
        vote !== null &&
        typeof vote === 'object' &&
        typeof vote.poll_id === 'string' &&
        typeof vote.option_value === 'string' &&
        typeof vote.option_id === 'string'
    );
}

export { PollOption, CollectionPoll, Collection, CollectionExists, VoteStruct, isValidVoteStruct};