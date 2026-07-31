# HackVerse

A MERN stack hackathon management platform for college capstone projects.

Organizers create hackathons, invite judges, and announce winners.  
Participants register, form teams, and submit projects.  
Judges evaluate submissions and scores feed the public leaderboard.

## Features

- JWT auth with role-based access (participant / organizer / judge / admin)
- Email OTP verification at signup (Upstash Redis)
- Hackathon create, publish, open/close registration
- Judge invitations (existing users + register-via-link)
- Team create + email invitations
- Project submissions (GitHub URL, problem/solution, optional file uploads)
- Rubric-based evaluation and leaderboard
- Winner announcement with email + in-app notifications
- Role dashboards with stats; admin platform-wide oversight

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React (Vite) + Tailwind CSS |
| Backend | Node.js + Express |
| Database | MongoDB Atlas |
| OTP | Upstash Redis |
| Deploy | Vercel (frontend), Render or Azure (backend) |

## Quick Start (Local)

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Fill in `.env` with MongoDB URI, JWT secrets, and Upstash Redis keys (required for signup OTP).

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:3000 — API defaults to http://localhost:5000/api/v1.

### Docker (backend only)

```bash
cd backend
docker build -t hackverse-backend .
docker run -p 5000:5000 --env-file .env hackverse-backend
```

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Notes |
| --- | --- | --- |
| `MONGO_URI` | Yes | MongoDB / Atlas connection string |
| `JWT_ACCESS_SECRET` | Yes | Access token secret |
| `JWT_REFRESH_SECRET` | Yes | Refresh token secret |
| `UPSTASH_REDIS_REST_URL` | Yes (signup) | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Yes (signup) | Upstash Redis REST token |
| `ALLOWED_ORIGINS` | Yes (prod) | Frontend URLs, comma-separated |
| `FRONTEND_URL` | Yes (prod) | Used in invitation email links |
| `PORT` | No | Default `5000` |
| `SMTP_*` / `MAIL_*` | No | Emails skipped if incomplete |
| `OTP_TTL_SECONDS` | No | Default `180` (3 min) |

### Frontend (`frontend/.env`)

| Variable | Required | Notes |
| --- | --- | --- |
| `VITE_API_URL` | Yes (prod) | e.g. `https://your-api-host.example.com/api/v1` |

## Deploy

See **[`docs/DEPLOY.md`](docs/DEPLOY.md)** for full deployment steps (Vercel + Render or Azure).  
Record your live URLs in **[`docs/SUBMISSION_CHECKLIST.md`](docs/SUBMISSION_CHECKLIST.md)** — do not submit placeholder links.

## Documentation (Capstone §28)

| Document | Description |
| --- | --- |
| [`docs/PROJECT_REPORT.md`](docs/PROJECT_REPORT.md) | Structured project report |
| [`docs/SCHEMA.md`](docs/SCHEMA.md) | Database schema and ERD |
| [`docs/API.md`](docs/API.md) | REST API reference |
| [`docs/DEPLOY.md`](docs/DEPLOY.md) | Deployment guide |
| [`docs/SCREENSHOTS.md`](docs/SCREENSHOTS.md) | Screenshot capture checklist |
| [`docs/SUBMISSION_CHECKLIST.md`](docs/SUBMISSION_CHECKLIST.md) | What's done vs manual tasks |
| [`docs/postman/`](docs/postman/) | Postman collection + environment |

**Optional:** A short PowerPoint (10–15 slides) summarizing problem, architecture, demo screens, and conclusion — see outline in `docs/SUBMISSION_CHECKLIST.md` if your college requires it.

## API

- Base path: `/api/v1`
- Health check: `GET /health`
- Full reference: [`docs/API.md`](docs/API.md)
- Postman: import [`docs/postman/hackverse_collection.json`](docs/postman/hackverse_collection.json)

## Tests

```bash
cd backend
node test_full_flow.js
```

Requires the backend on port 5000 and a reachable MongoDB instance.

## Project Structure

```text
HacKVerse/
├── backend/              # Express API
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── routes/
│   │   └── ...
│   └── server.js
├── frontend/             # React client
│   └── src/
│       ├── pages/
│       ├── components/
│       └── routes/
└── docs/                 # Capstone submission docs
    ├── API.md
    ├── SCHEMA.md
    ├── PROJECT_REPORT.md
    ├── DEPLOY.md
    ├── SCREENSHOTS.md
    ├── SUBMISSION_CHECKLIST.md
    ├── postman/
    └── screenshots/      # Add captured PNGs here
```

## License

Academic / educational use — see your institution's guidelines.
