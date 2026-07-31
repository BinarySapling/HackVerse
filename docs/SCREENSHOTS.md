# HackVerse — Screenshot Checklist

Use this list when capturing screens for the capstone report and viva. Save all images under **`docs/screenshots/`** using the filenames below.

## How to capture

1. Run the app locally (`npm run dev` in `frontend/` and `backend/`) **or** use your deployed Vercel URL.
2. Use a desktop browser at **1280×720** or wider (Chrome recommended).
3. Hide personal email addresses in screenshots if submitting publicly.
4. Save as **PNG** (preferred) or JPEG.
5. After saving, embed images in `docs/PROJECT_REPORT.md` §9.

## Directory structure

```text
docs/screenshots/
├── .gitkeep
├── 01-landing.png
├── 02-login.png
├── 03-signup-verify.png
├── ...
└── 15-admin-submissions.png
```

---

## Checklist

Mark each row when the file exists and looks good in the report.

| Done | Filename | Screen | Route / how to reach | Role |
| --- | --- | --- | --- | --- |
| ☐ | `01-landing.png` | Landing / home | `/` | Public |
| ☐ | `02-login.png` | Login page | `/login` | Public |
| ☐ | `03-signup-verify.png` | Signup or email OTP verify | `/signup` or `/verify-email` | Public |
| ☐ | `04-hackathon-list.png` | Browse hackathons | `/hackathons` | Public |
| ☐ | `05-hackathon-detail.png` | Single hackathon detail | `/hackathons/:slug` | Public |
| ☐ | `06-participant-dashboard.png` | Participant dashboard | `/dashboard/participant` | Participant |
| ☐ | `07-my-registrations.png` | My registrations | `/registrations/me` | Participant |
| ☐ | `08-team-management.png` | Team page (members, invite) | `/hackathons/:id/team` | Participant |
| ☐ | `09-project-submission.png` | Submit project form | `/hackathons/:id/submit` | Participant |
| ☐ | `10-organizer-dashboard.png` | Organizer dashboard | `/dashboard/organizer` | Organizer |
| ☐ | `11-hackathon-create.png` | Create hackathon form | `/hackathons/create` | Organizer |
| ☐ | `12-organizer-registrations.png` | Approve registrations | `/hackathons/:id/registrations` | Organizer |
| ☐ | `13-organizer-submissions.png` | Review submissions | `/hackathons/:id/submissions` | Organizer |
| ☐ | `14-judge-evaluate.png` | Judge scoring form | `/judge/submissions/:id/evaluate` | Judge |
| ☐ | `15-leaderboard.png` | Public leaderboard | `/hackathons/:id/leaderboard` | Public |
| ☐ | `16-organizer-results.png` | Results / announce winners | `/hackathons/:id/results` | Organizer |
| ☐ | `17-admin-dashboard.png` | Admin overview | `/dashboard/admin` | Admin |
| ☐ | `18-profile.png` | User profile | `/profile` | Any logged-in user |

### Optional (nice to have)

| Done | Filename | Screen |
| --- | --- | --- |
| ☐ | `19-forgot-password.png` | Forgot password flow |
| ☐ | `20-judge-dashboard.png` | Judge assigned hackathons |
| ☐ | `21-organizer-teams.png` | Organizer teams list |
| ☐ | `22-notifications.png` | Notification dropdown/panel |

---

## Tips for a strong submission

- Include **at least one screen per role** (participant, organizer, judge, admin).
- Show **real data** from a test hackathon you created (not empty tables).
- Pair screenshots with short captions in the project report.
- If deploying live, capture the **same flows on production** and note the URL in `SUBMISSION_CHECKLIST.md`.
