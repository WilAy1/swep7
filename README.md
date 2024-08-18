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

**Description:** This endpoint allows users to log in. It does not require authentication.

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
```
{
    "success": true,
    "message": "success",
    "data": {}
}
```