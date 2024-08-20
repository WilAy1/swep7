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
- `code` (string|number, required, >=8 characters)

**Example Request:**
```http
POST /api/manage/account/login
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
  - `eligible_voters` (string, required): Comma-separated list of email addresses of eligible voters.
  - `polls` (array, required): An array of polls.
    - `polls[].title` (string, required): The title of the poll.
    - `polls[].required` (boolean, required): Indicates if the poll is required.
    - `polls[].options` (array, required): An array of poll options.
      - `options[].value` (string, required): The value of an option.
      - `options[].image` (image, optional): Image for an option.


**Example Request:** 
```http
POST /api/manage/collection/create
Content-Type: multipart/form-data
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
                        "created": "2024-08-19T19:39:18.742Z"
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
    eligible_voters: "example@gmail.com,example1@gmail.com",
    polls: [
        {
            title: "Poll 1",
            required: true,
            options: [
                {
                    title: "Option 1",
                    image: fileInput1.files[0]  // fileInput1 is an input of type file
                },
                {
                    title: "Option 2"
                    // no image for this option
                }
            ]
        }
    ]
};

const formData = new FormData(); // create new formdata
formData.append("collection", JSON.stringify(collectionData)); // add collection to formdata

// Attach images separately if they exist
collectionData.polls.forEach((poll, pollIndex) => {
    poll.options.forEach((option, optionIndex) => {
        if (option.image) {
            formData.append(`polls[${pollIndex}].options[${optionIndex}].image`, option.image);
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
    "data": [
        {
            "id": "02c7a387-1063-47db-a4e9-68f623abfb71",
            "title": "Collection 1",
            "start_time": "2024-08-19T17:46:22.741Z",
            "end_time": "2024-08-20T17:46:22.741Z",
            "no_of_polls": 2,
            "created": "2024-08-20T20:39:10.483Z",
            "polls": [
                {
                    "id": "440b000b-4190-4eee-8aab-2ddda3b65cea",
                    "title": "President",
                    "required": true,
                    "no_of_options": 3,
                    "created": "2024-08-20T20:39:10.558Z",
                    "options": [
                        {
                            "id": "569d48d2-c435-470f-a1af-02c12d6c8442",
                            "value": "DrBush",
                            "created": "2024-08-20T20:39:10.568Z"
                        },
                        {
                            "id": "71433364-b8eb-4856-91c7-c615ffae9a39",
                            "value": "LordFem",
                            "created": "2024-08-20T20:39:10.570Z"
                        },
                        {
                            "id": "985ce850-8be1-4a1c-bbc6-11333a04c9c0",
                            "value": "Another Option",
                            "created": "2024-08-20T20:39:10.571Z"
                        }
                    ]
                },
                {
                    "id": "40dafdce-ab17-4ea2-9089-5e40c93e664e",
                    "title": "Treasurer",
                    "required": false,
                    "no_of_options": 2,
                    "created": "2024-08-20T20:39:10.573Z",
                    "options": [
                        {
                            "id": "9b162a88-410d-4aa4-86a4-c972e2d4629b",
                            "value": "Ayomikun",
                            "created": "2024-08-20T20:39:10.574Z"
                        },
                        {
                            "id": "0f17d931-c8e8-4633-84c4-4c7bd8827439",
                            "value": "Williams",
                            "created": "2024-08-20T20:39:10.575Z"
                        }
                    ]
                }
            ]
        },
        {
            "id": "52ca3c3b-c330-4e29-8e06-94ee5f3318ae",
            "title": "Collection 2",
            "start_time": "2024-08-19T17:46:22.741Z",
            "end_time": "2024-08-20T17:46:22.741Z",
            "no_of_polls": 1,
            "created": "2024-08-20T20:41:08.717Z",
            "polls": [
                {
                    "id": "8ff5984a-ab84-4a63-bb93-6c8b23eb17d5",
                    "title": "Poll 1",
                    "required": true,
                    "no_of_options": 4,
                    "created": "2024-08-20T20:41:08.722Z",
                    "options": [
                        {
                            "id": "2c0bf312-9474-4692-ba50-f3ab37585cc3",
                            "value": "Option 1",
                            "created": "2024-08-20T20:41:08.724Z"
                        },
                        {
                            "id": "ba3bae08-3e54-4a1e-ad0e-54cd7158b716",
                            "value": "Option 2",
                            "created": "2024-08-20T20:41:08.726Z"
                        },
                        {
                            "id": "5ad2d67e-9f60-4e16-ab57-d7f678e6dcd5",
                            "value": "Option 3",
                            "created": "2024-08-20T20:41:08.727Z"
                        },
                        {
                            "id": "f7436e55-eccc-44de-b491-2186fe4946f5",
                            "value": "Option 4",
                            "created": "2024-08-20T20:41:08.728Z"
                        }
                    ]
                }
            ]
        }
    ]
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