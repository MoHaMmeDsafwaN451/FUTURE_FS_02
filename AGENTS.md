# FUTURE_FS_02 repository guidance

## Project

Mini CRM for managing business leads. The planned stack is React/Vite on the frontend and Node.js/Express/MongoDB on the backend.

## Working conventions

- Keep frontend and backend as separate applications in `frontend/` and `backend/`.
- Do not commit `.env` files, credentials, JWT secrets, or MongoDB connection strings.
- Use only clearly labelled demo/seed data; never invent real personal or business information.
- Prefer beginner-friendly, readable code with small focused modules.
- Validate API input and protect lead endpoints once authentication is introduced.

## Before implementing a phase

Explain the flow and the purpose of the files being added in plain language. Run the relevant build, lint, or API checks after each phase.
