# HackVerse

A MERN stack hackathon management platform for college projects.

Organizers create hackathons, invite judges, and announce winners.  
Participants register, form teams, and submit projects.  
Judges evaluate submissions and scores feed the leaderboard.

## Features

- JWT auth with role-based access (organizer / judge / participant / admin)
- Hackathon create, publish, registration windows
- Judge invitations (existing users + new registration links)
- Team create + email invitations
- Project submissions (GitHub URL, demo links)
- Rubric-based evaluation and leaderboard
- Winner announcement with email + in-app notifications
- Role dashboards with basic stats

## Tech Stack

- **Frontend:** React (Vite) + Tailwind CSS — deploy on Vercel
- **Backend:** Node.js + Express — deploy on Render
- **Database:** MongoDB Atlas

## Setup (Local)

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Fill in `.env` with your MongoDB URI, JWT secrets, and optional SMTP settings.

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:3000

### Backend with Docker (optional)

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
| `ALLOWED_ORIGINS` | Yes (prod) | Frontend URLs, comma-separated |
| `FRONTEND_URL` | Yes (prod) | Used in invitation email links |
| `PORT` | No | Default `5000` |
| `SMTP_*` / `MAIL_*` | No | Emails skipped if incomplete |

### Frontend (`frontend/.env`)

| Variable | Required | Notes |
| --- | --- | --- |
| `VITE_API_URL` | Yes (prod) | Example: `https://your-api.onrender.com/api/v1` |

## Deploy

### Backend → Render

1. New Web Service from this repo (`backend` root).
2. Build: `npm install`
3. Start: `npm start`
4. Add env vars from `.env.example` (use Atlas URI + strong JWT secrets).
5. Set `ALLOWED_ORIGINS` to your Vercel URL and `FRONTEND_URL` to the same.

### Frontend → Vercel

1. Import the repo, set root to `frontend`.
2. Add `VITE_API_URL=https://<your-render-service>.onrender.com/api/v1`
3. Deploy. `vercel.json` handles SPA routing.

## API

All APIs are under `/api/v1`.

Health check: `GET /health`

## Tests

```bash
cd backend
node test_full_flow.js
```

Requires the backend running on port 5000 and a local/Atlas MongoDB.

## Project Structure

```text
hackverse/
├── backend/          # Express API
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── routes/
│   │   └── ...
│   └── server.js
├── frontend/         # React client
│   └── src/
│       ├── pages/
│       ├── components/
│       └── ...
└── docs/postman/     # Optional Postman collection
```
