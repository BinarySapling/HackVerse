# HackVerse API Guidelines

This document outlines the design standards, naming conventions, versioning strategy, and response envelopes for the HackVerse API.

---

## 1. API Versioning Strategy
To prevent breaking changes, the API uses URL-path versioning.
* **Format:** `/api/v1/...`
* **Rules:**
  * Major version increments (e.g., `/v2/`) are reserved for breaking model changes or architectural refactors.
  * Minor features (e.g., adding properties to response JSON) occur backward-compatibly under `/v1/`.

---

## 2. Naming Conventions

### Endpoint Paths
* **Resource Pluralization:** Paths should reference resources in plural (e.g., `/api/v1/users`, `/api/v1/hackathons`).
* **Casing:** URL segments should use lowercase and hyphens (`kebab-case`). For example, `/api/v1/team-members`.
* **Actions:** Avoid embedding verbs in URLs (e.g. use `POST /api/v1/auth/login` instead of `POST /api/v1/auth/executeLogin`).

### HTTP Methods
Enforce RESTful verb mappings:
* `GET`: Retrieve a resource or list of resources. Must be idempotent and safe.
* `POST`: Create a new resource or initiate an authentication session.
* `PUT`: Replace an existing resource entirely.
* `PATCH`: Partially update an existing resource.
* `DELETE`: Soft-delete or purge a resource.

---

## 3. Response Standards

All success responses must be returned in a standardized envelope:
```json
{
  "success": true,
  "message": "Resource-specific action success description",
  "data": {},
  "requestId": "correlation-request-id"
}
```

### HTTP Status Code Mappings
* **`200 OK`**: Successful `GET`, `PUT`, `PATCH`, or session-destroying `POST` requests.
* **`201 Created`**: Successful creation of a user or resource.
* **`202 Accepted`**: Request received and queued for asynchronous processing.
* **`204 No Content`**: Successful execution where no response body is returned (e.g., clearing a cache).

---

## 4. Error Standards

All errors must be caught by the global error handler middleware and returned in this standard envelope:
```json
{
  "success": false,
  "message": "User-friendly description of the error",
  "requestId": "correlation-request-id",
  "errorCode": "ERROR_CODE_CONSTANT"
}
```

### HTTP Error Status Mappings
* **`400 Bad Request`** (`VALIDATION_ERROR`): Malformed JSON, syntax errors, or Zod schema validation failures.
* **`401 Unauthorized`** (`UNAUTHORIZED`): Expired tokens, invalid credentials, or missing cookies.
* **`403 Forbidden`** (`FORBIDDEN`): Suspended accounts or users attempting to access resources above their role authorization level.
* **`404 Not Found`** (`NOT_FOUND`): Non-existent routes or resource IDs.
* **`409 Conflict`** (`CONFLICT`): Duplicate resource creation attempts (e.g., register existing email).
* **`429 Too Many Requests`** (`TOO_MANY_REQUESTS`): API request limits exceeded.
* **`500 Internal Server Error`** (`INTERNAL_ERROR`): Unhandled system exceptions.
