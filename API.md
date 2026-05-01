# API

Auth: Required

## Endpoints

### GET /resources

Description: List all resources

Query:

- limit
- offset

Response:

- 200 OK

### POST /resources

Description: Create a new resource

Headers:

- X-Client-Id

Body:

```json
{
  "name": "example-resource",
  "metadata": {
    "tags": ["initial", "demo"]
  }
}
```

Response:

- 201 Created

### GET /resources/{id}

Description: Get resource details

Response:

- 200 OK

### DELETE /resources/{id}

Description: Delete a resource

Response:

- 204 No Content

### GET /public/status

Description: System status check

Auth: None

Response:

- 200 OK
