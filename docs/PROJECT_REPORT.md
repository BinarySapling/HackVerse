# HackVerse — Project Report

**Capstone submission document**  
*Replace bracketed placeholders with your name, roll number, guide, and institution before submitting.*

| Field | Value |
| --- | --- |
| Project title | HackVerse — Hackathon Management Platform |
| Student name | *[Your name]* |
| Roll / enrollment no. | *[Your ID]* |
| Guide | *[Guide name]* |
| Institution | *[College / university]* |
| Academic year | *[e.g. 2025–26]* |

---

## 1. Introduction

HackVerse is a full-stack web application that helps colleges and communities run hackathons online. Instead of juggling spreadsheets, email threads, and manual score sheets, organizers use one platform to publish events, manage registrations, form teams, collect project submissions, assign judges, and announce winners.

Participants register for hackathons, build teams, and submit GitHub repositories with project details. Judges score submissions against a rubric, and the system computes a leaderboard automatically. An admin role provides platform-wide oversight of users, teams, and submissions.

This report describes the problem HackVerse solves, the objectives we set, the technology choices, major modules, user roles, database design, and API surface. Screenshots of the live application should be added under `docs/screenshots/` (see `docs/SCREENSHOTS.md`).

---

## 2. Problem statement

College hackathons involve many coordinated steps: advertising the event, collecting registrations, approving participants, forming teams, tracking submissions before deadlines, distributing projects to judges, aggregating scores, and publishing results. When these steps are handled manually:

- Organizers lose time on repetitive admin work.
- Participants miss deadlines or duplicate registrations.
- Judges receive inconsistent information.
- Results are slow to compile and prone to errors.

There is a need for a **single, role-aware system** that enforces business rules (one team per hackathon, one submission per team, one evaluation per judge per project) while keeping the experience simple for students and faculty.

---

## 3. Objectives

| # | Objective | How HackVerse addresses it |
| --- | --- | --- |
| 1 | Secure multi-role authentication | JWT in HTTP-only cookies; roles: participant, organizer, judge, admin |
| 2 | End-to-end hackathon lifecycle | Create → publish → open/close registration → submit → judge → leaderboard → announce winners |
| 3 | Team collaboration | Team creation, member invites, leadership transfer |
| 4 | Structured submissions | GitHub URL, problem/solution text, optional demo links and file uploads |
| 5 | Fair evaluation | Rubric-based scores (innovation, UI/UX, technical, presentation, code quality, problem solving) |
| 6 | Transparency | Public hackathon listing, public leaderboard, in-app notifications |
| 7 | Platform governance | Admin dashboard; user block/unblock; platform-wide team and submission views |

---

## 4. Technology stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| Frontend | React 18, Vite, Tailwind CSS, React Router | SPA UI, role-based dashboards |
| Backend | Node.js, Express 4 | REST API, middleware, file uploads |
| Database | MongoDB Atlas, Mongoose | Document store for users, events, teams, scores |
| Auth | JWT (access + refresh), bcrypt | Session management, password hashing |
| OTP | Upstash Redis | Email verification codes at signup |
| Email | Nodemailer (optional SMTP) | Invitations, password reset, winner emails |
| Validation | Zod | Request body and param validation |
| API testing | Postman collection in `docs/postman/` | Manual API verification |
| Deployment | Vercel (frontend), Render or Azure (backend) | See `docs/DEPLOY.md` |

---

## 5. System modules

### 5.1 Authentication and users

- Signup with email OTP verification (Upstash Redis).
- Login, logout, token refresh, forgot/reset password.
- Profile update with optional avatar upload.
- Admin: list/search users, change roles, block/unblock, soft delete.

### 5.2 Hackathons

- Organizers create and edit hackathons (banner upload, dates, prizes, judging criteria, FAQ).
- Publish draft events; open and close registration windows.
- Public listing and detail pages by slug.
- Status flow: `draft` → `published` → `registration_open` → `ongoing` → `judging` → `completed` → `archived`.

### 5.3 Registrations

- Participants apply to a hackathon; organizers approve or reject.
- Participants view their registrations and cancel when allowed.

### 5.4 Teams

- Registered participants create a team (unique name per hackathon).
- Leaders invite members by email, add/remove members, transfer leadership.
- Organizers view all teams for an event.

### 5.5 Submissions

- One submission per team: GitHub repo, project summary, problem statement, solution, tech stack, optional URLs.
- Optional file uploads: screenshot (image) and presentation (image or PDF).
- Organizers review submission status; judges see approved submissions for scoring.

### 5.6 Evaluations and leaderboard

- Organizers assign judges to hackathons.
- Judges submit rubric scores and remarks per submission.
- Weighted total score is computed server-side.
- Public leaderboard; organizers close evaluation and announce winners (with optional email + notifications).

### 5.7 Invitations and notifications

- Judge invitations (existing users or register-via-link flow).
- Team member invitations with accept/decline.
- In-app notification center (read / mark all read).

### 5.8 Dashboards

- Role-specific stats: participant, organizer, judge, admin.
- Admin: platform-wide teams and submissions lists.

---

## 6. User roles

| Role | Primary responsibilities |
| --- | --- |
| **Participant** | Register for hackathons, join/create teams, submit projects, view own results |
| **Organizer** | Create and manage hackathons, review registrations and submissions, assign judges, announce winners |
| **Judge** | View assigned hackathons, evaluate submissions, update scores |
| **Admin** | Manage all users, view all teams/submissions platform-wide, assist organizers |

Access is enforced on both the API (middleware `authenticate` + `authorize`) and the frontend (`RoleGuard` on routes).

---

## 7. Database overview

MongoDB stores eight main collections:

- **User** — accounts, roles, verification flags
- **Hackathon** — event metadata, dates, judging criteria, assigned judges
- **Registration** — participant ↔ hackathon link
- **Team** — group within one hackathon
- **Submission** — team's project entry (unique per team)
- **Evaluation** — judge's score for one submission (unique per judge + submission)
- **Invitation** — judge or team email invites with expiring tokens
- **Notification** — in-app alerts per user

Key rules: one registration per user per hackathon; one team name per hackathon; one submission per team; one evaluation per judge per submission. Soft delete (`isDeleted`) is used on several entities.

Full field-level documentation: [`docs/SCHEMA.md`](./SCHEMA.md).

---

## 8. API overview

All REST endpoints are prefixed with `/api/v1`. Authentication uses HTTP-only cookies (`accessToken`, `refreshToken`).

Major route groups:

| Prefix / area | Examples |
| --- | --- |
| `/auth` | signup, verify-otp, login, me, change-password |
| `/hackathons` | list, detail by slug, create, publish, open/close registration |
| `/registrations` | register, my registrations, organizer review |
| `/teams` | create, my-team, invitations |
| `/submissions` | create/update, organizer list, judge list, review status |
| `/evaluations` | assign judge, submit scores |
| `/hackathons/:id/leaderboard` | public rankings |
| `/admin` | all teams, all submissions (admin only) |
| `/users` | admin user management |
| `/notifications` | user inbox |

Complete reference: [`docs/API.md`](./API.md).  
Postman: import [`docs/postman/hackverse_collection.json`](./postman/hackverse_collection.json) and [`docs/postman/hackverse_environment.json`](./postman/hackverse_environment.json).

---

## 9. Screenshots

Add captured screens to `docs/screenshots/` following the checklist in [`docs/SCREENSHOTS.md`](./SCREENSHOTS.md). Suggested minimum set:

| # | Screen | Suggested filename |
| --- | --- | --- |
| 1 | Landing page | `01-landing.png` |
| 2 | Login / signup | `02-auth.png` |
| 3 | Hackathon list | `03-hackathon-list.png` |
| 4 | Hackathon detail | `04-hackathon-detail.png` |
| 5 | Participant dashboard | `05-participant-dashboard.png` |
| 6 | Team management | `06-team.png` |
| 7 | Project submission form | `07-submission.png` |
| 8 | Organizer dashboard | `08-organizer-dashboard.png` |
| 9 | Judge evaluation form | `09-judge-evaluate.png` |
| 10 | Public leaderboard | `10-leaderboard.png` |
| 11 | Admin dashboard | `11-admin-dashboard.png` |

*Embed images here after capture, e.g. `![Landing page](./screenshots/01-landing.png)`*

---

## 10. Deployment

HackVerse is designed to deploy with:

- **Frontend:** Vercel (`frontend/` root)
- **Backend:** Render Web Service or Azure Container Apps (`backend/` root)
- **Database:** MongoDB Atlas

Step-by-step instructions (no placeholder live URLs): [`docs/DEPLOY.md`](./DEPLOY.md).

Record your actual frontend and API URLs in [`docs/SUBMISSION_CHECKLIST.md`](./SUBMISSION_CHECKLIST.md) before final submission.

---

## 11. Testing

- Backend integration script: `node backend/test_full_flow.js` (requires local API + MongoDB).
- Postman collection for auth and manual API checks.
- Manual UI walkthrough per role (participant → organizer → judge → admin).

---

## 12. Conclusion

HackVerse demonstrates a production-style MERN application with clear separation of concerns: React client, Express API, Mongoose models, and role-based authorization. It automates the hackathon workflow from registration through judging and results, reducing manual effort for organizers and giving participants and judges a consistent experience.

Future enhancements could include real-time chat, integrated video demos, cloud object storage for uploads, and richer analytics for organizers.

---

## References

- Repository README: [`../README.md`](../README.md)
- Database schema: [`SCHEMA.md`](./SCHEMA.md)
- API reference: [`API.md`](./API.md)
- Deployment: [`DEPLOY.md`](./DEPLOY.md)
- Submission checklist: [`SUBMISSION_CHECKLIST.md`](./SUBMISSION_CHECKLIST.md)
