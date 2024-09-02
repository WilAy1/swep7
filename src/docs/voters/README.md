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
                        "value": "Wilson",
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

### 5. Vote
***Description:** This endpoint submits all selected options in polls. This endpoint requires authentication.

**Parameters:** 
- `collection_id` (UUID, required): ID for the collection the voter is voting in
- `votes` (array, required): an array of votes.
    - `poll_id` (UUID, required): ID for a particular poll.
    - `option_id` (UUID, required): ID for the selected option.
    - `option_value` (UUID, required): Value of the selected option.

**Example Request:**
```http
POST /api/voters/submit-vote

{
    "collection_id": "02c7a387-1063-47db-a4e9-68f623abfb71",
    "votes": [
        {
            "poll_id": "440b000b-4190-4eee-8aab-2ddda3b65cea",
            "option_value": "LordFem",
            "option_id": "71433364-b8eb-4856-91c7-c615ffae9a39"
        },
        {
            "poll_id": "40dafdce-ab17-4ea2-9089-5e40c93e664e",
            "option_id": "9b162a88-410d-4aa4-86a4-c972e2d4629b",
            "option_value": "Ayomikun"
        }
    ]
}
```

**Example Response:**

```json
{
    "success": true,
    "message": "successfully voted",
    "data": {}
}
```


