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
	collection_id UUID NOT NULL,
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
	collection_id UUID NOT NULL,
	poll_id UUID NOT NULL,
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
	collection_id UUID NOT NULL,
	poll_id UUID NOT NULL,
	option_id UUID NOT NULL,
	voter_id UUID NOT NULL,
	voter_email VARCHAR(255) NOT NULL,
	option_value TEXT NOT NULL,
	casted TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	UNIQUE(voter_id, poll_id)
);