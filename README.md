# SWEP GROUP 7 PROJECT API DOCUMENTATION

This API allows you to manage resources and perform various operations.

## Base URL

All API requests should be made to the following base URL:

http://localhost:3000


## Authorization

Some endpoints require a Bearer Token for authorization. The token should be included in the request's `Authorization` header.

**Example:**
Authorization: Bearer YOUR_ACCESS_TOKEN


## Error Handling

In case of an error, the API will return a response in the following format:

```json
{
    "success": false,
    "message": "an error message",
    "data": {}
}

```

## Endpoints (Voters)

### 1. Login

**Endpoint:** `POST /api/voters/login`

**Description:** This endpoint sends an email containing the code to vote if voter is eligible. It does not require authentication.

**Parameters:**
- `email` (string, required): The email address of the voter.
- `collection_id` (UUID, required): The ID of the collection the voter is associated with.

**Example Request:**
```http
POST /api/voters/login
Content-Type: application/json

{
    "email": "user@example.com",
    "collection_id": "550e8400-e29b-41d4-a716-446655440000"
}
```
**Example Response:**
```json
{
    "success": true,
    "message": "success",
    "data": {}
}
```

### 2. Verify Code

**Endpoint:** `POST /api/voters/verify-code`

**Description:** This endpoint gives access to voters to vote. It does not require authentication.

**Parameters:**
- `email` (string, required): The email address of the voter.
- `collection_id` (UUID, required): The ID of the collection the voter is associated with.
-  `code` (number, required): The code sent to the email of the voter.

**Example Request:**
```http
POST /api/voters/verify-code
Content-Type: application/json

{
    "email": "user@example.com",
    "collection_id": "550e8400-e29b-41d4-a716-446655440000",
    "code": "599015"
}
```

**Example Response:**
```json
{
    "success": true,
    "message": "success",
    "data": {
        "is_voter": true,
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImF5b21pa3VuYWtpbnRhZGVAZ21haWwuY29tIiwiY29kZSI6IjU5OTAxNSIsImNvbGxlY3Rpb25JZCI6IjUzNDkwYmNlLTNiNzAtNGQwNi1hZmIxLWU3NWM2ZjcyNTExMCIsImlhdCI6MTcyNDAxOTcxOCwiZXhwIjoxNzI2NjA3NDIwfQ.uwpXVwWXoUHm60SHuDsZOuEkktcTChJJgtMGjECIXW8",
        "token_type": "jwt",
        "expires_in": 2587702
    }
}
```

### 3. Collection Exists

**Description:** This endpoint checks if a collection with its `id (collection_id)` exists. This endpoint doesn't require authentication.

**Parameters:**
- `collection_id` (UUID, required): The ID of the collection we're checking if it exists.

**Example Request:**
```http
GET /api/voters/collection-exists?collection_id=53490bce-3b70-4d06-afb1-e75c6f725110
Accept: application/json
```

**Example Response:**
```json
{
    "success": true,
    "message": "success",
    "data": {}
}
```

### 4. Fetch Collection

***Description:** This endpoint fetches the collection details including polls and options. This endpoint requires authentication.

**Parameters:** None

**Example Request:**
```http
POST /api/voters/fetch-collection
```

**Example Response:** 
```json
{
    "success": true,
    "message": "success",
    "data": {
        "id": "b84fca04-a633-4c91-9835-dac5f30c331c",
        "title": "Student Election 2024",
        "start_time": "2024-08-19T17:46:22.741Z",
        "end_time": "2024-08-20T17:46:22.741Z",
        "no_of_polls": 2,
        "created": "2024-08-19T19:39:18.713Z",
        "polls": [
            {
                "id": "932610f3-105f-4d19-925e-0674d8a4e23e",
                "title": "President",
                "required": true,
                "no_of_options": 3,
                "created": "2024-08-19T19:39:18.738Z",
                "options": [
                    {
                        "id": "580bfeaf-4541-4534-b38a-f4756d62de0d",
                        "value": "LordFem",
                        "created": "2024-08-19T19:39:18.744Z"
                    },
                    {
                        "id": "4e621287-d9ca-4da9-8d6f-92b548e97a78",
                        "value": "Ayomide Wilson",
                        "created": "2024-08-19T19:39:18.744Z"
                    },
                    {
                        "id": "9a628d5c-8bcd-41da-b98e-acb601da9e8a",
                        "value": "DrBush",
                        "created": "2024-08-19T19:39:18.742Z"
                    }
                ]
            },
            {
                "id": "a0b8aea7-64cb-4a0a-8c8c-7957812d7590",
                "title": "Treasurer",
                "required": false,
                "no_of_options": 2,
                "created": "2024-08-19T19:39:18.745Z",
                "options": [
                    {
                        "id": "58bd9eae-5b0f-4bf1-a640-bacf46a6decd",
                        "value": "Williams",
                        "created": "2024-08-19T19:39:18.746Z"
                    },
                    {
                        "id": "55dbb098-1788-4690-85c5-ce065e99dbc6",
                        "value": "Ayomikun",
                        "created": "2024-08-19T19:39:18.745Z"
                    }
                ]
            }
        ]
    }
}
```



## Endpoints (Admin)

### 1. Login

**Description:** ...

**Parameters:** ...

**Example Request:** ...

**Example Response:** ...

### 2. Fetch Collection

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
        "eligible_voters": "ayomikunakintade@gmail.com,awakintade@gmail.com",
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
                        "value": "Ayomide Wilson",
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

### 3. Create collection

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
        "eligible_voters": "ayomikunakintade@gmail.com,awakintade@gmail.com",
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
                        "value": "Ayomide Wilson",
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

**Example Implementation:**

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