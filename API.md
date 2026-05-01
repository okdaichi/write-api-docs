# API

All endpoints for this API are documented in this file.

The format is based on the API.md Convention and is intended to be read and edited as plain Markdown.

## Endpoints

### GET /v1/items

Description: List items

Request:

- limit: integer, optional
- cursor: string, optional

Response:

- 200 OK
- items: array
- next_cursor: string, optional

---

### POST /v1/items

Description: Create an item

Request:

- name: string, required
- description: string, optional

Response:

- 201 Created
- id: string
- name: string

Errors:

- 400 Bad Request
- 401 Unauthorized

---

### GET /v1/items/{item_id}

Description: Get an item

Request:

- item_id: string, required

Response:

- 200 OK
- id: string
- name: string
- description: string, optional

Errors:

- 404 Not Found

---

### PATCH /v1/items/{item_id}

Description: Update an item

Request:

- item_id: string, required
- name: string, optional
- description: string, optional

Response:

- 200 OK
- id: string
- name: string
- description: string, optional

Notes:

- Omitted fields are not changed.

---

### DELETE /v1/items/{item_id}

Description: Delete an item

Request:

- item_id: string, required

Response:

- 204 No Content
