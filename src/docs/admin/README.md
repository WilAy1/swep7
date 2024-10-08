## Endpoints (Admin)

### 1. Register

**Description:** Registration endpoint for creators of elections/collections.

**Parameters:** 
- `email` (string, required)
- `password` (string, required, >=8 characters)

**Example Request:**
```http
POST /api/manage/account/register
Content-Type: application/json

{
    "email": "example@gmail.com",
    "password": "password"
}
```

***Example Response:**
```json
{
    "success": true,
    "message": "Account successfully created",
    "data": {}
}
```

### 2. Login

**Description:** Login endpoint for creators of elections/collections

**Parameters:** 
- `email` (string, required)
- `password` (string, required, >=8 characters)

**Example Request:**
```http
POST /api/manage/account/login
Content-Type: application/json

{
    "email": "example@gmail.com",
    "password": "password"
}
```

***Example Response:**
```json
{
    "message": "Login Successful",
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbklkIjoiOTM3MjUxNDMtYTVmZi00MWVkLWEwZjgtN2YxNTk2NWEzN2IxIiwiZW1haWwiOiJheW9taWt1bmFraW50YWRlQGdtYWlsLmNvbSIsImlhdCI6MTcyNDE3OTg4MCwiZXhwIjoxNzI2NzcxODgwfQ.9pwLdmTbXdpHtXN0gQgJRoxt8yQSTxc36kv33mKTWO0",
        "expires_in": 2592000,
        "token_type": "jwt",
        "is_admin": true
    },
    "success": true
}
```

### 3. Verify Email Address

**Description:** Verify the email address.

**Parameters:** 
- `email` (string, required)
- `code` (string|number, count = 6)

**Example Request:**
```http
POST /api/manage/account/verify
Content-Type: application/json

{
    "email": "example@gmail.com",
    "code": "490292"
}
```

***Example Response:**
```json
{
    "success": true,
    "message": "Successfully verified account",
    "data": {}
}
```

### 4. Create Collection

**Description:** This endpoint creates a collection/election with polls and options. Authentication is required.

**Parameters:**
- `collection` (object, required): The collection details.
  - `title` (string, required): The title of the collection.
  - `start_time` (ISO 8601 string, required): The start time of the election.
  - `end_time` (ISO 8601 string, required): The end time of the election.
  - `eligible_voters` (file, required): File type is csv.
  - `polls` (array, required): An array of polls.
    - `polls[].title` (string, required): The title of the poll.
    - `polls[].required` (boolean, required): Indicates if the poll is required.
    - `polls[].options` (array, required): An array of poll options.
      - `options[].value` (string, required): The value of an option.
      - `options[].image` (image, optional): Image for an option.

**Example CSV file:**

|Email
|-----
|example@gmail.com
|exampl2@gmail.com
|example3@gmail.com
|example4@gmail.com
|exampl5@gmail.com
|exampl6@gmail.com
|exampl7@gmail.com
|example8@gmail.com
|...

**Example Request:** 
```http
POST /api/manage/collection/create
```

**Example Response:** 
```json
{
    "success": true,
    "message": "success",
    "data": {
        "id": "b84fca04-a633-4c91-9835-dac5f30c331c",
        "creator_id": "550e8400-e29b-41d4-a716-446655440000",
        "title": "Student Election 2024",
        "start_time": "2024-08-19T17:46:22.741Z",
        "end_time": "2024-08-20T17:46:22.741Z",
        "eligible_voters": "example@gmail.com,example1@gmail.com",
        "no_of_eligible_voters": 2,
        "no_of_polls": 2,
        "no_of_votes": 0,
        "created": "2024-08-19T19:39:18.713Z",
        "last_updated": "2024-08-19T19:39:18.713Z",
        "polls": [
            {
                "id": "932610f3-105f-4d19-925e-0674d8a4e23e",
                "collection_id": "b84fca04-a633-4c91-9835-dac5f30c331c",
                "creator_id": "550e8400-e29b-41d4-a716-446655440000",
                "title": "President",
                "required": true,
                "no_of_options": 3,
                "no_of_votes": 0,
                "created": "2024-08-19T19:39:18.738Z",
                "last_updated": "2024-08-19T19:39:18.738Z",
                "options": [
                    {
                        "id": "9a628d5c-8bcd-41da-b98e-acb601da9e8a",
                        "collection_id": "b84fca04-a633-4c91-9835-dac5f30c331c",
                        "poll_id": "932610f3-105f-4d19-925e-0674d8a4e23e",
                        "creator_id": "550e8400-e29b-41d4-a716-446655440000",
                        "value": "DrBush",
                        "no_of_votes": 0,
                        "created": "2024-08-19T19:39:18.742Z",
                        "image_link": "localhost:3000/images/9a628d5c-8bcd-41da-b98e-acb601da9e8a.png"
                    },
                    {
                        "id": "580bfeaf-4541-4534-b38a-f4756d62de0d",
                        "collection_id": "b84fca04-a633-4c91-9835-dac5f30c331c",
                        "poll_id": "932610f3-105f-4d19-925e-0674d8a4e23e",
                        "creator_id": "550e8400-e29b-41d4-a716-446655440000",
                        "value": "LordFem",
                        "no_of_votes": 0,
                        "created": "2024-08-19T19:39:18.744Z"
                    },
                    {
                        "id": "4e621287-d9ca-4da9-8d6f-92b548e97a78",
                        "collection_id": "b84fca04-a633-4c91-9835-dac5f30c331c",
                        "poll_id": "932610f3-105f-4d19-925e-0674d8a4e23e",
                        "creator_id": "550e8400-e29b-41d4-a716-446655440000",
                        "value": "Wilson",
                        "no_of_votes": 0,
                        "created": "2024-08-19T19:39:18.744Z"
                    }
                ]
            },
            {
                "id": "a0b8aea7-64cb-4a0a-8c8c-7957812d7590",
                "collection_id": "b84fca04-a633-4c91-9835-dac5f30c331c",
                "creator_id": "550e8400-e29b-41d4-a716-446655440000",
                "title": "Treasurer",
                "required": false,
                "no_of_options": 2,
                "no_of_votes": 0,
                "created": "2024-08-19T19:39:18.745Z",
                "last_updated": "2024-08-19T19:39:18.745Z",
                "options": [
                    {
                        "id": "55dbb098-1788-4690-85c5-ce065e99dbc6",
                        "collection_id": "b84fca04-a633-4c91-9835-dac5f30c331c",
                        "poll_id": "a0b8aea7-64cb-4a0a-8c8c-7957812d7590",
                        "creator_id": "550e8400-e29b-41d4-a716-446655440000",
                        "value": "Ayomikun",
                        "no_of_votes": 0,
                        "created": "2024-08-19T19:39:18.745Z"
                    },
                    {
                        "id": "58bd9eae-5b0f-4bf1-a640-bacf46a6decd",
                        "collection_id": "b84fca04-a633-4c91-9835-dac5f30c331c",
                        "poll_id": "a0b8aea7-64cb-4a0a-8c8c-7957812d7590",
                        "creator_id": "550e8400-e29b-41d4-a716-446655440000",
                        "value": "Williams",
                        "no_of_votes": 0,
                        "created": "2024-08-19T19:39:18.746Z"
                    }
                ]
            }
        ]
    }
}
```

**Example Error:**
- This is the only endpoint to have errors in data

```json
{
    "success": false,
    "message": "Failed to create collection",
    "data": {
        "errors": [
            "Title cannot be empty",
            "Some poll data are invalid"
        ]
    }
}
```

**Implementation:** An example of how to implement it.

```javascript
const collectionData = {
    title: "Example Collection",
    start_time: "2024-08-19T12:00:00Z",
    end_time: "2024-08-26T12:00:00Z",
    eligible_voters: "",
    polls: [
        {
            title: "Poll 1",
            required: true,
            options: [
                {
                    value: "Option 1",
                    image: fileInput1.files[0]  // fileInput1 is an input of type file
                },
                {
                    value: "Option 2"
                    // no image for this option
                }
            ]
        }
    ]
};

const formData = new FormData(); // create new formdata
formData.append("collection", JSON.stringify(collectionData)); // add collection to formdata

formData.append("collection.eligible_voters", eligibleVotersFile);

// Attach images separately if they exist
collectionData.polls.forEach((poll, pollIndex) => {
    poll.options.forEach((option, optionIndex) => {
        if (option.image) {
            formData.append(`collection.polls[${pollIndex}].options[${optionIndex}].image`, option.image);
        }
    });
});

//send formdata as a request
```

### 5. Fetch All Collections

**Description:** This endpoint all the collections created by a particular user. This endpoint requires authentication.

**Parameters:** None

**Example Request:**
```http
GET /api/manage/collection/fetch/all
Accept: application/json
```

**Example Response:**
```json
{
    "success": true,
    "message": "success",
    "data": {
        "no_of_collections": 1,
        "collections": [
            {
                "id": "2e30f29d-d495-42ef-a490-69b5251997b9",
                "title": "Collection 2",
                "start_time": "2024-08-19T17:46:22.741Z",
                "end_time": "2024-08-20T17:46:22.741Z",
                "no_of_polls": 1,
                "created": "2024-08-21T22:03:05.969Z",
                "polls": [
                    {
                        "id": "9bb6ade4-cdfc-4b95-b71a-b799d79e3f8d",
                        "title": "Poll 1",
                        "required": true,
                        "no_of_options": 4,
                        "created": "2024-08-21T22:03:05.982Z",
                        "options": [
                            {
                                "id": "334cc699-934d-44bd-8808-27c027e96d47",
                                "value": "Option 1",
                                "created": "2024-08-21T22:03:05.986Z"
                            },
                            {
                                "id": "27e6f25f-23d6-4ec2-a4f0-4e4dc3900eb5",
                                "value": "Option 2",
                                "created": "2024-08-21T22:03:05.992Z"
                            },
                            {
                                "id": "1e23fba3-de91-4a7d-860d-f7345753e6de",
                                "value": "Option 3",
                                "created": "2024-08-21T22:03:05.993Z"
                            },
                            {
                                "id": "869d9250-0e4b-4790-8d7e-bbecd7dad1e2",
                                "value": "Option 4",
                                "created": "2024-08-21T22:03:05.998Z"
                            }
                        ]
                    }
                ]
            }
        ]
    }
}
```


### 6. Fetch Collection

**Description:** This endpoint fetches the collection details including polls and options. It also fetches number of votes which and some other data with isn't available for the voter's endpoint. This endpoint requires authentication.

**Parameters:**
- `collection_id` (UUID, required): The ID of the collection we're fetching.

**Example Request:**
```http
GET /api/manage/collection/fetch?collection_id=b84fca04-a633-4c91-9835-dac5f30c331c
Accept: application/json
```

**Example Response:**
```json
{
    "success": true,
    "message": "success",
    "data": {
        "id": "b84fca04-a633-4c91-9835-dac5f30c331c",
        "creator_id": "550e8400-e29b-41d4-a716-446655440000",
        "title": "Student Election 2024",
        "start_time": "2024-08-19T17:46:22.741Z",
        "end_time": "2024-08-20T17:46:22.741Z",
        "eligible_voters": "example@gmail.com,example1@gmail.com",
        "no_of_eligible_voters": 2,
        "no_of_polls": 2,
        "no_of_votes": 2,
        "created": "2024-08-19T19:39:18.713Z",
        "last_updated": "2024-08-19T19:39:18.713Z",
        "polls": [
            {
                "id": "932610f3-105f-4d19-925e-0674d8a4e23e",
                "title": "President",
                "required": true,
                "no_of_options": 3,
                "created": "2024-08-19T19:39:18.738Z",
                "no_of_votes": 1,
                "last_updated": "2024-08-19T19:39:18.738Z",
                "options": [
                    {
                        "id": "580bfeaf-4541-4534-b38a-f4756d62de0d",
                        "value": "LordFem",
                        "created": "2024-08-19T19:39:18.744Z",
                        "no_of_votes": 0
                    },
                    {
                        "id": "4e621287-d9ca-4da9-8d6f-92b548e97a78",
                        "value": "Wilson",
                        "created": "2024-08-19T19:39:18.744Z",
                        "no_of_votes": 0
                    },
                    {
                        "id": "9a628d5c-8bcd-41da-b98e-acb601da9e8a",
                        "value": "DrBush",
                        "created": "2024-08-19T19:39:18.742Z",
                        "no_of_votes": 1
                    }
                ]
            },
            {
                "id": "a0b8aea7-64cb-4a0a-8c8c-7957812d7590",
                "title": "Treasurer",
                "required": false,
                "no_of_options": 2,
                "created": "2024-08-19T19:39:18.745Z",
                "no_of_votes": 1,
                "last_updated": "2024-08-19T19:39:18.745Z",
                "options": [
                    {
                        "id": "58bd9eae-5b0f-4bf1-a640-bacf46a6decd",
                        "value": "Williams",
                        "created": "2024-08-19T19:39:18.746Z",
                        "no_of_votes": 0
                    },
                    {
                        "id": "55dbb098-1788-4690-85c5-ce065e99dbc6",
                        "value": "Ayomikun",
                        "created": "2024-08-19T19:39:18.745Z",
                        "no_of_votes": 1
                    }
                ]
            }
        ]
    }
}
```

