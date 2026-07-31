# HackVerse — Deployment Guide

This document explains how to deploy HackVerse for the capstone submission. **Do not submit placeholder URLs** — replace every `<your-...>` value with your real deployment addresses after you deploy.

## Architecture overview

| Layer | Technology | Typical host |
| --- | --- | --- |
| Frontend | React (Vite) + Tailwind CSS | [Vercel](https://vercel.com) |
| Backend | Node.js + Express | [Render](https://render.com), [Azure Container Apps](https://azure.microsoft.com/products/container-apps), or Docker |
| Database | MongoDB | [MongoDB Atlas](https://www.mongodb.com/atlas) |
| OTP / rate limiting | Upstash Redis | [Upstash](https://upstash.com) |

```
Browser  →  Vercel (frontend)  →  API host (backend)  →  MongoDB Atlas
                                      ↘  Upstash Redis (signup OTP)
```

## Prerequisites

1. MongoDB Atlas cluster with a connection string (`MONGO_URI`).
2. Upstash Redis REST URL and token (required for email OTP during signup).
3. Strong random values for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`.
4. (Optional) SMTP credentials for transactional email (invitations, password reset, winner announcements). The app runs without SMTP, but emails will be skipped.

Copy `backend/.env.example` to `backend/.env` and fill in all required values before deploying.

---

## Option A — Backend on Render + Frontend on Vercel (recommended for students)

### 1. Deploy the backend (Render)

1. Push this repository to GitHub.
2. In Render: **New → Web Service** → connect the repo.
3. Set **Root Directory** to `backend`.
4. **Build command:** `npm install`
5. **Start command:** `npm start`
6. Add environment variables from `backend/.env.example` (use Atlas URI, JWT secrets, Upstash keys).
7. Set production values:
   - `NODE_ENV=production`
   - `ALLOWED_ORIGINS=https://<your-vercel-app>.vercel.app` (comma-separated if multiple)
   - `FRONTEND_URL=https://<your-vercel-app>.vercel.app`
8. Deploy and note the service URL, e.g. `https://<your-render-service>.onrender.com`.

Health check: `GET https://<your-render-service>.onrender.com/health`

### 2. Deploy the frontend (Vercel)

1. In Vercel: **Add New Project** → import the same GitHub repo.
2. Set **Root Directory** to `frontend`.
3. Add environment variable:
   - `VITE_API_URL=https://<your-render-service>.onrender.com/api/v1`
4. Deploy. Note the URL, e.g. `https://<your-vercel-app>.vercel.app`.

`frontend/vercel.json` configures SPA routing so client-side routes work on refresh.

### 3. Verify end-to-end

- Open the Vercel URL in a browser.
- Sign up, verify OTP, log in, and browse hackathons.
- Confirm API calls succeed (browser DevTools → Network).

---

## Option B — Backend on Azure Container Apps (CI/CD)

This repo includes `.github/workflows/deploy-backend.yml`, which builds a Docker image and pushes it to Azure Container Registry (`hackverseacr123.azurecr.io`) on push to `main` or `production`.

### One-time Azure setup

1. Create an Azure Container Registry and a Container App (e.g. `hackverse-api`).
2. In GitHub → **Settings → Secrets and variables → Actions**, add:
   - `ACR_USERNAME`
   - `ACR_PASSWORD`
3. Point the Container App at image tag `latest` and enable continuous deployment from the registry (or redeploy after each push).

### Container App environment

Configure the same variables as `backend/.env.example` in the Container App settings (Atlas, JWT, Upstash, `ALLOWED_ORIGINS`, `FRONTEND_URL`, etc.).

### Frontend

Deploy the frontend to Vercel as in Option A, but set:

`VITE_API_URL=https://<your-azure-container-app-fqdn>/api/v1`

---

## Option C — Local Docker (backend only)

```bash
cd backend
docker build -t hackverse-backend .
docker run -p 5000:5000 --env-file .env hackverse-backend
```

Run the frontend locally with `npm run dev` in `frontend/` and set `VITE_API_URL=http://localhost:5000/api/v1`.

---

## Submission checklist (deployment)

After deploying, record your URLs in `docs/SUBMISSION_CHECKLIST.md`:

| Item | Your value |
| --- | --- |
| Frontend (live) | `https://<your-vercel-app>.vercel.app` |
| Backend API base | `https://<your-api-host>/api/v1` |
| Health endpoint | `https://<your-api-host>/health` |
| GitHub repository | `https://github.com/<your-org>/HacKVerse` |

**Do not invent URLs for the report** — only document hosts you have actually deployed and tested.

---

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| CORS errors in browser | `ALLOWED_ORIGINS` does not include your Vercel URL |
| Login works locally but not in prod | `VITE_API_URL` wrong or cookies blocked (check `SameSite` / HTTPS) |
| Signup OTP fails | Missing or invalid `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` |
| 502 / cold start on Render free tier | First request after idle may be slow; retry or upgrade plan |
| Uploaded images 404 in prod | Ephemeral disk on some hosts — use persistent volume or external storage for production uploads |
