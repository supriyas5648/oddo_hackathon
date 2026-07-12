# AssetFlow — Backend (Organization Setup Module)

Enterprise Asset & Resource Management System. This module covers the
**organizational foundation**: Departments, Categories, and Users.

> Auth is intentionally **not** included yet. Password hashing is already
> wired into the User model so auth can be added later without a migration.

## Tech Stack

- **Node.js + Express** — HTTP layer
- **MongoDB + Mongoose** — persistence
- **Joi** — request validation
- **Service-layer MVC** — thin controllers, reusable business logic
- Security/hardening: `helmet`, `cors`, `express-rate-limit`, `express-mongo-sanitize`, `compression`

## Folder Structure

```
backend/
├── server.js                  # Process entry: DB connect + graceful shutdown
├── .env.example
└── src/
    ├── app.js                 # Express app: middleware + route mounting
    ├── config/
    │   ├── env.js             # Validated env config (fail-fast)
    │   ├── db.js              # Mongo connection lifecycle
    │   └── seed.js            # Dev seed script (npm run seed)
    ├── models/                # Mongoose schemas
    │   ├── department.model.js
    │   ├── category.model.js
    │   └── user.model.js
    ├── services/              # Business logic (validation of refs, integrity)
    │   ├── department.service.js
    │   ├── category.service.js
    │   └── user.service.js
    ├── controllers/           # Thin HTTP handlers (req -> service -> response)
    ├── routes/                # Route definitions + validation wiring
    ├── validations/           # Joi schemas per resource
    ├── middlewares/
    │   ├── validate.js        # Joi-driven body/query/params validation
    │   ├── notFound.js        # 404 handler
    │   └── errorHandler.js    # Centralized error normalization
    └── utils/
        ├── ApiError.js        # Operational error with HTTP status
        ├── catchAsync.js      # Async error forwarding wrapper
        ├── apiResponse.js     # Consistent success envelope
        └── queryFeatures.js   # Reusable pagination/search/sort
```

### Why this structure scales

- **Controllers stay thin** — they never touch Mongoose directly. All logic
  lives in `services/`, which are plain functions you can unit-test or reuse
  from a CLI, a job queue, or another service.
- **Centralized error handling** — services just `throw ApiError.notFound(...)`;
  the global handler also converts Mongoose cast/validation/duplicate-key
  errors into the same response shape. Controllers have zero try/catch.
- **Validation at the edge** — Joi schemas strip unknown keys and coerce
  types before anything reaches a service, so services trust their inputs.
- **Consistent contracts** — every success is `{ success, message, data, meta? }`
  and every failure is `{ success, message, errors? }`. Adding new modules
  (Assets, Requests, Maintenance) just means new model/service/controller/route
  quartets — the plumbing is reused.

## Getting Started

```bash
cd backend
cp .env.example .env          # then edit MONGODB_URI if needed
npm install
npm run seed                  # optional: sample departments/users/categories
npm run dev                   # nodemon, or `npm start` for production
```

Base URL: `http://localhost:5000/api/v1`

## API Reference

All list endpoints support: `?page=`, `?limit=` (max 100), `?sort=` (e.g. `-createdAt`, `name`), `?search=`.

### Departments  `/api/v1/departments`

| Method | Path            | Description                                  |
|--------|-----------------|----------------------------------------------|
| GET    | `/`             | List (filters: `status`, `parentDepartment`) |
| GET    | `/tree`         | Full hierarchy as a nested tree              |
| POST   | `/`             | Create                                       |
| GET    | `/:id`          | Get one (+ sub-departments)                  |
| PATCH  | `/:id`          | Update (cycle-safe)                          |
| DELETE | `/:id`          | Delete (blocked if it has children/users)    |

### Categories  `/api/v1/categories`

| Method | Path     | Description                                                |
|--------|----------|-----------------------------------------------------------|
| GET    | `/`      | List (filters: `isSharedResource`, `requiresWarranty`)    |
| POST   | `/`      | Create                                                    |
| GET    | `/:id`   | Get one                                                   |
| PATCH  | `/:id`   | Update                                                    |
| DELETE | `/:id`   | Delete                                                    |

### Users  `/api/v1/users`

| Method | Path     | Description                                       |
|--------|----------|---------------------------------------------------|
| GET    | `/`      | List (filters: `role`, `status`, `department`)    |
| POST   | `/`      | Create (password hashed automatically)            |
| GET    | `/:id`   | Get one (password never returned)                 |
| PATCH  | `/:id`   | Update (re-hashes password if changed)            |
| DELETE | `/:id`   | Delete (nulls this user from departments they head)|

## Sample Requests (cURL)

```bash
# Create a department
curl -X POST http://localhost:5000/api/v1/departments \
  -H "Content-Type: application/json" \
  -d '{ "name": "Finance", "code": "FIN", "description": "Handles budgets" }'

# Create a sub-department
curl -X POST http://localhost:5000/api/v1/departments \
  -H "Content-Type: application/json" \
  -d '{ "name": "Payroll", "code": "PAY", "parentDepartment": "<FINANCE_ID>" }'

# List active departments, page 1, 5 per page, searching "fin"
curl "http://localhost:5000/api/v1/departments?status=Active&page=1&limit=5&search=fin"

# Department hierarchy
curl http://localhost:5000/api/v1/departments/tree

# Create a category
curl -X POST http://localhost:5000/api/v1/categories \
  -H "Content-Type: application/json" \
  -d '{ "name": "Servers", "icon": "server", "requiresWarranty": true }'

# Create a user (password is hashed, never returned)
curl -X POST http://localhost:5000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{ "name": "Jane Doe", "email": "jane@corp.io", "password": "secret123", "role": "Asset Manager", "department": "<DEPT_ID>" }'

# Update a user's role
curl -X PATCH http://localhost:5000/api/v1/users/<USER_ID> \
  -H "Content-Type: application/json" \
  -d '{ "role": "Department Head" }'
```

## Response Shapes

**Success (single):**
```json
{ "success": true, "message": "Department created", "data": { "...": "..." } }
```

**Success (list):**
```json
{
  "success": true,
  "message": "Departments fetched",
  "data": [ /* ... */ ],
  "meta": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [ { "field": "code", "message": "'code' is required" } ]
}
```

## Postman

Import `postman/AssetFlow.postman_collection.json`. It contains a
`{{baseUrl}}` variable (default `http://localhost:5000/api/v1`) and capture
scripts that auto-store created IDs (`{{departmentId}}`, `{{userId}}`,
`{{categoryId}}`) into collection variables so requests chain naturally.
