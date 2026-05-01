# API.md Convention

This document defines the specification and execution model for the API.md format.

## Core Principles

* Human-readable first
* Parsable with simple rules
* No schema validation
* No code generation assumptions

## Endpoint Definition

Each endpoint MUST be defined as a Markdown heading:

### METHOD PATH

Example:

### GET /resources

## Authentication

Allowed values only:

* Auth: Required
* Auth: None

Rules:

* No token formats (Bearer, OAuth, etc.)
* No auth flows
* Tools inject credentials externally

## Request Structure

Use the following sections:

* Query
* Headers
* Body

### Query

```markdown
Query:
- limit
- offset
```

### Headers

```markdown
Headers:
- X-Client-Id
```

### Body (IMPORTANT)

Body MUST be expressed as a JSON code block.

````markdown
Body:
```json
{
  "name": "example-resource"
}
```
````

Rules:

- Must be fenced with ```json
- Can include nested structures
- Treated as an example (NOT a schema)
- Parsers may extract but MUST NOT validate structure

## Response

```markdown
Response:
- 200 OK
```

Rules:

* List of status codes
* Body is optional and not strictly defined

## Endpoint Overrides

Endpoint-level fields override global fields:

```markdown
### GET /public

Auth: None
```

# Test Generation / Execution Model

## Goal

Enable simple HTTP execution from API.md without requiring full specifications.

## Extraction Rules

From each endpoint, extract:

* method (GET, POST, etc.)
* path
* query params (optional)
* headers (optional)
* body (JSON block, optional)
* auth requirement (Required / None)

## Execution Behavior

### Base Request

```text
METHOD {BaseURL}{BasePath}{Path}
```

### Auth Handling

If `Auth: Required`, then `Authorization: $TOKEN`. Token is injected externally.

### Query Handling

Values provided at runtime or defaulted.

### Headers Handling

Maps directly to HTTP headers.

### Body Handling

* Use JSON block as-is
* No transformation
* No validation

## Philosophy

API.md provides structure and minimal execution hints. Tools provide values and runtime behavior.
