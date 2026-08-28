# API

| Method | Endpoint | Authentication | Purpose |
| --- | --- | --- | --- |
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/login` | No | Get a JWT for an existing admin |
| GET | `/api/auth/me` | Yes | Get the current admin |
| GET | `/api/leads` | Yes | List/search/filter leads |
| GET | `/api/leads/stats` | Yes | Dashboard counts |
| GET | `/api/leads/:id` | Yes | Get one lead |
| POST | `/api/leads` | Yes | Create a lead |
| PUT | `/api/leads/:id` | Yes | Update a lead |
| DELETE | `/api/leads/:id` | Yes | Delete a lead |

`GET /api/leads` accepts optional `search`, `status`, and `source` query parameters.
