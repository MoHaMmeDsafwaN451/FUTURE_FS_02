# API setup

Copy `.env.example` to `.env`, set your MongoDB Atlas URI and secrets, then run `npm install` and `npm run seed:admin`. Use `npm run dev` for local development.

All `/api/leads` endpoints require `Authorization: Bearer <token>`. Obtain a token with `POST /api/auth/login`.
