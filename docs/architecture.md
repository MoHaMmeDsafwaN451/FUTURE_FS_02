# Architecture

```text
Browser (React + Vite)
        │ HTTPS / JSON + Bearer token
        ▼
Express REST API
 ├── auth middleware verifies JWT
 ├── routes select a controller
 └── Mongoose models read/write MongoDB
        ▼
MongoDB Atlas
```

The browser never receives MongoDB credentials, JWT secrets, or password hashes. React stores the session token locally and sends it only as an `Authorization: Bearer` header to protected API endpoints.
