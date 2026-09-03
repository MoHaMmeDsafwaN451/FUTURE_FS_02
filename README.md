# FUTURE_FS_02 — Client Lead Management System

https://future-fs-02-phi-seven.vercel.app/ 

A full-stack Mini CRM planned for the Future Interns Full Stack Web Development internship.

## Status

The application is implemented and ready for local setup. Deployment needs your own MongoDB Atlas cluster and production environment variables.

## Planned stack

- Frontend: React, Vite, JavaScript, CSS
- Backend: Node.js, Express
- Database: MongoDB with Mongoose
- Authentication: JWT and bcrypt

## Planned capabilities

- Secure admin login
- Lead CRUD (create, read, update, delete)
- Lead statuses, notes, and follow-up dates
- Search and filtering
- Dashboard statistics

## Intended structure

```text
FUTURE_FS_02/
├── frontend/       # React application (planned)
├── backend/        # Express API (planned)
├── docs/           # Architecture, API, and screenshots
├── AGENTS.md
├── .gitignore
└── README.md
```

## Local setup

1. Copy `backend/.env.example` to `backend/.env` and add a MongoDB Atlas connection string, a long JWT secret, and a local admin email/password.
2. Copy `frontend/.env.example` to `frontend/.env`.
3. Run `npm run install:all` from this repository.
4. Run `npm run seed:admin` from `backend/` once to create the first admin.
5. Run `npm run dev` at the repository root. Open `http://localhost:5173`.

## Production deployment

Deploy `frontend/` to Vercel and `backend/` to Render/Railway. Configure these values in each host's environment-variable dashboard, never in source control:

| Service | Variables |
| --- | --- |
| Frontend | `VITE_API_URL=https://your-api-domain/api` |
| Backend | `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL=https://your-frontend-domain`, `PORT` |

For the backend use `npm start`; for Vercel use `npm run build` and publish `dist`. In MongoDB Atlas, allow the deployment provider's network access and use a dedicated least-privilege database user.

## Security notes

- Passwords are bcrypt hashes and never returned by the API.
- All lead routes require a valid JWT bearer token.
- Inputs are validated and invalid MongoDB IDs are safely rejected.
- `.env` files are ignored by Git.

See [architecture documentation](docs/architecture.md) and the [API reference](docs/api.md) for the request flow and endpoint details.
