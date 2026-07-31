# Capstone §28 — Submission Checklist

Track what is **ready in the repository** vs what **you must complete manually** before final submission.

---

## Repository deliverables

| Item | Status | Location / notes |
| --- | --- | --- |
| GitHub repository with source code | ✅ In repo | Push to your GitHub org/account |
| README (overview, setup, links) | ✅ Done | [`../README.md`](../README.md) |
| Project report | ✅ Done | [`PROJECT_REPORT.md`](./PROJECT_REPORT.md) — fill student name, guide, institution |
| Database schema doc | ✅ Done | [`SCHEMA.md`](./SCHEMA.md) |
| API documentation | ✅ Done | [`API.md`](./API.md) |
| Deployment guide | ✅ Done | [`DEPLOY.md`](./DEPLOY.md) — no fake URLs |
| Screenshot checklist | ✅ Done | [`SCREENSHOTS.md`](./SCREENSHOTS.md) |
| Screenshot folder | ✅ Ready | [`screenshots/`](./screenshots/) — add PNG files |
| Postman collection | ✅ In repo | [`postman/hackverse_collection.json`](./postman/hackverse_collection.json) |
| Postman environment | ✅ In repo | [`postman/hackverse_environment.json`](./postman/hackverse_environment.json) |

---

## Your manual tasks

| Task | Status | Action |
| --- | --- | --- |
| **Live frontend URL** | ☐ You | Deploy to Vercel; record URL below |
| **Live API URL** | ☐ You | Deploy backend; record URL below |
| **GitHub repo URL** | ☐ You | Public or shared with evaluator |
| **Real screenshots** | ☐ You | Capture per [`SCREENSHOTS.md`](./SCREENSHOTS.md) → `docs/screenshots/` |
| **Embed screenshots in report** | ☐ You | Update §9 in [`PROJECT_REPORT.md`](./PROJECT_REPORT.md) |
| **Student details in report** | ☐ You | Name, roll no., guide, institution |
| **Presentation (PPT)** | ☐ Optional | 10–15 slides; not required if college says docs only |
| **Demo video** | ☐ If required | Record walkthrough; link in report or README |

---

## Record your URLs here

*Fill in after deployment — do not use placeholder links in the submitted report.*

| Service | URL |
| --- | --- |
| GitHub repository | |
| Frontend (live) | |
| Backend API base (`/api/v1`) | |
| Health check (`/health`) | |

---

## Quick verification before submit

- [ ] `npm install` + `npm run dev` works locally (frontend + backend).
- [ ] Signup → OTP → login flow works on **deployed** environment.
- [ ] At least one full hackathon flow: create → register → team → submit → judge → leaderboard.
- [ ] Postman collection runs against your API base URL.
- [ ] All §28 documents linked from README.
- [ ] No secrets committed (`.env` in `.gitignore`).

---

## Optional PPT outline (if your college asks for slides)

1. Title, team, guide  
2. Problem statement  
3. Objectives  
4. Architecture diagram (browser → API → MongoDB)  
5. Tech stack  
6. User roles demo  
7. Key screens (use `docs/screenshots/`)  
8. Database ERD (from `SCHEMA.md`)  
9. API highlights  
10. Deployment  
11. Challenges and learnings  
12. Conclusion + Q&A
