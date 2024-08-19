# SWEP GROUP 7 PROJECT API DOCUMENTATION

This API allows you to manage resources and perform various operations.

## Base URL

All API requests should be made to the following base URL:

http://localhost:3000


## Authorization

Some endpoints require a Bearer Token for authorization. The token should be included in the `Authorization` header of the request.

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

## Endpoints

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
    "email: "user@example.com",
    "collection_id: "550e8400-e29b-41d4-a716-446655440000",
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

**Description:** This endpoint checks if a collection with it's `id (collection_id)` exists. This endpoint doesn't require authentication.

**Parameters:**
- `collection_id` (UUID, required): The ID of the collection we're checking if it exists.

**Example Request:**
```http
GET api/voters/collection-exists?collection_id=53490bce-3b70-4d06-afb1-e75c6f725110
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

**Example Response:** 
```json
{
    "id": "53490bce-3b70-4d06-afb1-e75c6f725110",
    "title": "Test Vote Collection 2024",
    "start_time": "2024-08-18T21:08:09.526Z",
    "end_time": "2024-09-17T21:10:20.739Z",
    "no_of_polls": 0,
    "created": "2024-08-18T22:11:30.566Z",
    "polls": [
        {
            "id": "bca34935-7005-4cec-bc5c-f9edb49f1952",
            "title": "Student Union President",
            "required": true,
            "no_of_options": 4,
            "created": "2024-08-18T22:31:11.197Z",
            "options": [
                {
                    "id": "dd194ed1-7377-4413-9aa3-34b23df3bcea",
                    "value": "Lord em",
                    "created": "2024-08-18T22:33:29.982Z"
                },
                {
                    "id": "7fca6e35-499b-45fd-be46-f02f100db35c",
                    "value": "DrBush",
                    "created": "2024-08-18T22:33:29.982Z"
                },
                {
                    "id": "393bd489-4bee-4602-8042-57c9b5c0a20e",
                    "value": "Somebody",
                    "created": "2024-08-18T22:33:29.982Z"
                },
                {
                    "id": "5e48caaf-82f3-4cd3-8412-8f5db0bc4e71",
                    "value": "SomeoneElse",
                    "created": "2024-08-18T22:33:29.982Z"
                }
            ]
        }
    ]
}
```