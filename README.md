# HackVerse

**A full-stack hackathon management platform built on the MERN stack.**

HackVerse provides a unified system for organizing, participating in, and judging hackathons. It replaces the typical patchwork of spreadsheets, email threads, and manual coordination with a single web application that covers the entire hackathon lifecycle — from event creation through team formation, project submission, evaluation, and winner announcement.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Docker](#docker)
- [Deployment](#deployment)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [License](#license)

---

## Overview

HackVerse serves three primary user roles:

- **Organizers** create and configure hackathons, define evaluation rubrics, invite judges, manage registrations, and announce winners.
- **Participants** discover hackathons, register, form teams via email invitations, and submit projects with GitHub links, descriptions, and optional file uploads.
- **Judges** receive event assignments, evaluate submissions against defined criteria, and submit scores that feed a real-time leaderboard.

A fourth role, **Admin**, provides platform-wide oversight including user management and aggregate statistics across all hackathons.

---

## Key Features

**Authentication and Authorization**
- JWT-based authentication with access and refresh token rotation
- Email OTP verification at signup, backed by Upstash Redis
- Role-based access control across four roles: participant, organizer, judge, and admin

**Hackathon Management**
- Full event lifecycle: create, publish, open/close registration, and archive
- Configurable evaluation rubrics with weighted criteria
- Slug-based URLs for public hackathon pages

**Team Collaboration**
- Team creation with email-based member invitations
- Invitation acceptance flow for both existing and new users

**Project Submissions**
- GitHub repository URL, problem statement, and solution description
- Optional file uploads via Multer with server-side storage

**Evaluation and Leaderboard**
- Rubric-based scoring by assigned judges
- Aggregated leaderboard with automatic ranking
- Winner announcement with email and in-app notifications

**Notifications**
- Transactional email delivery via SMTP (Nodemailer)
- In-app notification system with read/unread tracking

**Platform Administration**
- Admin dashboard with platform-wide statistics
- User management and role oversight

---

## Architecture

HackVerse follows a client-server architecture with clear separation between the frontend single-page application and the backend REST API.

```
                         +------------------+
                         |   React Client   |
                         |   (Vite + SPA)   |
                         +--------+---------+
                                  |
                            HTTPS / REST
                                  |
                         +--------+---------+
                         |   Express API    |
                         |   /api/v1/*      |
                         +--------+---------+
                                  |
                    +-------------+-------------+
                    |             |              |
              +-----+----+ +-----+----+  +------+------+
              | MongoDB  | | Upstash  |  |    SMTP     |
              |  Atlas   | |  Redis   |  | (Nodemailer)|
              +----------+ +----------+  +-------------+
```

The backend uses a layered architecture: **Routes** define endpoints, **Controllers** handle HTTP request/response, **Services** contain business logic, **Repositories** abstract database access, and **Models** define Mongoose schemas. Cross-cutting concerns (authentication, validation, rate limiting, error handling) are implemented as Express middleware.

---

## Tech Stack

### Frontend
![React](https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router_v6-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)
![React Hook Form](https://img.shields.io/badge/React_Hook_Form-EC5990?style=for-the-badge&logo=reacthookform&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express_4-000000?style=for-the-badge&logo=express&logoColor=white)
![Nodemailer](https://img.shields.io/badge/Nodemailer-22B573?style=for-the-badge&logo=minutemailer&logoColor=white)
![Multer](https://img.shields.io/badge/Multer-FF6600?style=for-the-badge&logo=files&logoColor=white)

### Database & Caching
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose_ODM-880000?style=for-the-badge&logo=mongoose&logoColor=white)
![Redis](https://img.shields.io/badge/Upstash_Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)

### Auth & Security
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Helmet](https://img.shields.io/badge/Helmet-eee?style=for-the-badge&logo=helmet&logoColor=black)
![Zod Validation](https://img.shields.io/badge/Zod_Validation-3E67B1?style=for-the-badge&logo=zod&logoColor=white)

### Logging
![Winston](https://img.shields.io/badge/Winston-231F20?style=for-the-badge&logo=winston&logoColor=white)
![Morgan](https://img.shields.io/badge/Morgan-333333?style=for-the-badge&logo=express&logoColor=white)

### DevOps & Deployment
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=black)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)

---

## Prerequisites

- **Node.js** v18 or later
- **npm** v9 or later
- **MongoDB** — local instance or MongoDB Atlas cluster
- **Upstash Redis** account — required for signup OTP verification
- **SMTP credentials** — optional; transactional emails are skipped if not configured

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/HackVerse.git
cd HackVerse
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Edit `backend/.env` with your MongoDB connection string, JWT secrets, and Upstash Redis credentials. See the [Environment Variables](#environment-variables) section for the full reference.

The API server starts on `http://localhost:5000` by default. Verify with:

```bash
curl http://localhost:5000/health
```

### 3. Frontend Setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

The development server starts on `http://localhost:3000`. It expects the backend API at `http://localhost:5000/api/v1` by default.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable                     | Required       | Default       | Description                                          |
|------------------------------|----------------|---------------|------------------------------------------------------|
| `MONGO_URI`                  | Yes            | --            | MongoDB / Atlas connection string                    |
| `JWT_ACCESS_SECRET`          | Yes            | --            | Secret for signing access tokens (min 32 characters) |
| `JWT_REFRESH_SECRET`         | Yes            | --            | Secret for signing refresh tokens (min 32 characters)|
| `JWT_ACCESS_EXPIRES_IN`      | No             | `15m`         | Access token TTL                                     |
| `JWT_REFRESH_EXPIRES_IN`     | No             | `30d`         | Refresh token TTL                                    |
| `UPSTASH_REDIS_REST_URL`     | Yes            | --            | Upstash Redis REST endpoint                          |
| `UPSTASH_REDIS_REST_TOKEN`   | Yes            | --            | Upstash Redis REST token                             |
| `OTP_TTL_SECONDS`            | No             | `180`         | OTP validity duration in seconds                     |
| `OTP_RESEND_COOLDOWN_SECONDS`| No             | `180`         | Minimum interval between OTP resend requests         |
| `OTP_MAX_ATTEMPTS`           | No             | `5`           | Maximum OTP verification attempts                    |
| `ALLOWED_ORIGINS`            | Yes (prod)     | localhost      | Comma-separated list of allowed frontend origins     |
| `FRONTEND_URL`               | Yes (prod)     | localhost      | Base URL used in invitation and notification emails  |
| `PORT`                       | No             | `5000`        | Server listening port                                |
| `NODE_ENV`                   | No             | `development` | Set to `production` for secure cookies and JSON logs |
| `TRUST_PROXY`                | No             | --            | Set to `1` behind reverse proxies                    |
| `SMTP_HOST`                  | No             | --            | SMTP server hostname                                 |
| `SMTP_PORT`                  | No             | `587`         | SMTP server port                                     |
| `SMTP_SECURE`                | No             | `false`       | Use TLS for SMTP connection                          |
| `SMTP_USER`                  | No             | --            | SMTP authentication username                         |
| `SMTP_PASS`                  | No             | --            | SMTP authentication password                         |
| `MAIL_FROM_NAME`             | No             | `HackVerse`   | Display name in outbound emails                      |
| `MAIL_FROM_EMAIL`            | No             | --            | Sender email address                                 |
| `DISABLE_LIMITER`            | No             | --            | Set to `true` to disable rate limiting (dev only)    |

### Frontend (`frontend/.env`)

| Variable       | Required   | Default                            | Description                       |
|----------------|------------|------------------------------------|-----------------------------------|
| `VITE_API_URL` | Yes (prod) | `http://localhost:5000/api/v1`     | Backend API base URL              |

---

## Docker

A Dockerfile is provided for the backend. Build and run with:

```bash
cd backend
docker build -t hackverse-backend .
docker run -p 5000:5000 --env-file .env hackverse-backend
```

The image uses Node.js 20, installs production dependencies only, and exposes port 5000.

---

## Deployment

**Frontend** — Deploy to Vercel. The `frontend/vercel.json` includes a catch-all rewrite for client-side routing.

**Backend** — Deploy to Render, Azure Container Apps, or any Node.js-compatible hosting platform. When deploying behind a reverse proxy, set `TRUST_PROXY=1` and `NODE_ENV=production` to enable secure cookies.

A GitHub Actions workflow for backend deployment is included at `.github/workflows/deploy-backend.yml`.

For detailed, step-by-step deployment instructions, see [`docs/DEPLOY.md`](docs/DEPLOY.md).

---

## API Reference

All endpoints are served under the `/api/v1` prefix. A health check is available at `GET /health`.

**Core Resource Groups:**

| Resource        | Base Path                          | Description                           |
|-----------------|------------------------------------|---------------------------------------|
| Authentication  | `/api/v1/auth`                     | Register, login, logout, token refresh, OTP verification |
| Hackathons      | `/api/v1/hackathons`               | CRUD operations, status transitions, search |
| Registrations   | `/api/v1/...`                      | Participant registration for events   |
| Teams           | `/api/v1/...`                      | Team creation, member invitations     |
| Submissions     | `/api/v1/...`                      | Project submission and file uploads   |
| Evaluations     | `/api/v1/...`                      | Judge scoring against rubrics         |
| Leaderboard     | `/api/v1/...`                      | Rankings and score aggregation        |
| Invitations     | `/api/v1/...`                      | Judge and team member invitations     |
| Notifications   | `/api/v1/...`                      | In-app notification management        |
| Dashboard       | `/api/v1/...`                      | Role-specific statistics              |
| Users           | `/api/v1/users`                    | Profile management                    |
| Admin           | `/api/v1/admin`                    | Platform-wide administration          |

For the full endpoint reference with request/response schemas, see [`docs/API.md`](docs/API.md).

A Postman collection and environment file are available at [`docs/postman/`](docs/postman/) for interactive testing.

---

## Testing

An end-to-end integration test script exercises the complete application flow:

```bash
cd backend
npm run test:flow
```

This requires the backend server running on port 5000 and a reachable MongoDB instance. The script covers authentication, hackathon creation, registration, team workflows, submissions, evaluation, and leaderboard operations.

---

## Project Structure

```
HackVerse/
|
+-- backend/                    # Express REST API
|   +-- server.js               # Entry point with graceful shutdown
|   +-- Dockerfile              # Container build configuration
|   +-- .env.example            # Environment variable template
|   +-- src/
|       +-- app.js              # Express app setup and middleware
|       +-- config/             # Environment and logger configuration
|       +-- constants/          # Application-wide constants
|       +-- controllers/        # HTTP request handlers
|       +-- database/           # MongoDB connection management
|       +-- errors/             # Custom error classes
|       +-- middleware/         # Auth, validation, rate limiting, uploads
|       +-- models/             # Mongoose schema definitions
|       +-- repositories/       # Data access layer
|       +-- routes/             # Route definitions
|       +-- services/           # Business logic layer
|       +-- templates/          # Email templates
|       +-- utils/              # Shared utilities
|       +-- validators/         # Zod input validation schemas
|
+-- frontend/                   # React single-page application
|   +-- index.html              # HTML entry point
|   +-- vite.config.js          # Vite build configuration
|   +-- vercel.json             # Vercel deployment routing
|   +-- .env.example            # Environment variable template
|   +-- src/
|       +-- App.jsx             # Root component with providers
|       +-- main.jsx            # Application bootstrap
|       +-- index.css           # Global styles
|       +-- assets/             # Static assets (images, logos)
|       +-- components/         # Reusable UI components
|       +-- config/             # Axios instance and API configuration
|       +-- context/            # React context providers (auth)
|       +-- layouts/            # Page layout wrappers
|       +-- pages/              # Route-level page components
|       +-- routes/             # Route definitions and guards
|       +-- utils/              # Frontend utilities
|       +-- validations/        # Client-side Zod schemas
|
+-- docs/                       # Project documentation
|   +-- API.md                  # REST API reference
|   +-- SCHEMA.md               # Database schema and ERD
|   +-- PROJECT_REPORT.md       # Structured project report
|   +-- DEPLOY.md               # Deployment guide
|   +-- SCREENSHOTS.md          # Screenshot capture checklist
|   +-- SUBMISSION_CHECKLIST.md # Submission tracking
|   +-- postman/                # Postman collection and environment
|   +-- screenshots/            # Captured application screenshots
|
+-- .github/
    +-- workflows/
        +-- deploy-backend.yml  # CI/CD for backend deployment
```

---

## Documentation

| Document                                                        | Description                          |
|-----------------------------------------------------------------|--------------------------------------|
| [`docs/API.md`](docs/API.md)                                   | Complete REST API reference          |
| [`docs/SCHEMA.md`](docs/SCHEMA.md)                             | Database schema definitions and ERD  |
| [`docs/PROJECT_REPORT.md`](docs/PROJECT_REPORT.md)             | Structured project report            |
| [`docs/DEPLOY.md`](docs/DEPLOY.md)                             | Step-by-step deployment guide        |
| [`docs/SCREENSHOTS.md`](docs/SCREENSHOTS.md)                   | Screenshot capture checklist         |
| [`docs/SUBMISSION_CHECKLIST.md`](docs/SUBMISSION_CHECKLIST.md) | Submission status and tracking       |
| [`docs/postman/`](docs/postman/)                                | Postman collection and environment   |

---

## License

This project is developed for academic and educational purposes. Refer to your institution's guidelines for usage and distribution policies.
