CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


CREATE TABLE collection(
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	creator_id UUID NOT NULL,
	title TEXT NOT NULL,
	start_time TIMESTAMP NOT NULL,
	end_time TIMESTAMP NOT NULL,
	eligible_voters TEXT NOT NULL,
	no_of_eligible_voters INTEGER NOT NULL DEFAULT 0,
	no_of_polls INTEGER NOT NULL DEFAULT 0,
	no_of_votes INTEGER NOT NULL DEFAULT 0,
	created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE polls(
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	collection_id UUID NOT NULL REFERENCES collection(id) ON DELETE CASCADE,
	creator_id UUID NOT NULL,
	title TEXT NOT NULL,
	required BOOL NOT NULL,
	no_of_options INTEGER NOT NULL,
	no_of_votes INTEGER NOT NULL,
	created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE poll_options(
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	collection_id UUID NOT NULL REFERENCES collection(id) ON DELETE CASCADE,
	poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
	creator_id UUID NOT NULL,
	value TEXT NOT NULL,
	no_of_votes INT NOT NULL DEFAULT 0,
	created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE voters(
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	for_collection UUID NOT NULL,
	email VARCHAR(255) NOT NULL,
	access_code VARCHAR(7) NOT NULL,
	code_expires TIMESTAMP NOT NULL,
	created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE votes(
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	collection_id UUID NOT NULL REFERENCES collection(id) ON DELETE CASCADE,
	poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
	option_id UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
	voter_id UUID NOT NULL,
	voter_email VARCHAR(255) NOT NULL,
	option_value TEXT NOT NULL,
	casted TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	UNIQUE(voter_id, poll_id)
);

CREATE TABLE creators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_verified BOOL NOT NULL DEFAULT FALSE,
    verification_time TIMESTAMP,
    status VARCHAR(16) DEFAULT 'inactive' CHECK (status IN ('active', 'inactive')), -- Enum-like check for active and inactive
    verification_code INT NOT NULL, 
    code_expires TIMESTAMP,
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
