# Users API

A small Node.js and Express REST API for managing users. Data is stored in
memory and is cleared whenever the server restarts.

## Run

```bash
npm install
npm start
```

The server listens on port `3000` by default. Set the `PORT` environment
variable to use a different port.

## Endpoints

- `GET /api/users` — list users
- `GET /api/users/:id` — get a user
- `POST /api/users` — create a user with `{ "name": "...", "email": "..." }`
- `PUT /api/users/:id` — replace a user's name and email
- `DELETE /api/users/:id` — delete a user

Emails must be valid and unique. Responses use JSON except successful deletes,
which return `204 No Content`.

Run tests with `npm test`.
