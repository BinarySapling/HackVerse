# HackVerse API Reference

Base URL: `/api/v1`

Authentication uses HTTP-only cookies (`accessToken` / `refreshToken`) unless noted. Send requests with `credentials: 'include'` from the browser. Most protected routes require a logged-in user with the right role.

**Roles:** `admin`, `organizer`, `judge`, `participant`

**Access shorthand:**
- **Public** — no login
- **Auth** — any logged-in user
- **Participant** — participant only
- **Organizer** — organizer only
- **Judge** — judge only
- **Admin** — admin only
- **Org+Admin** — organizer or admin

**Postman:** Import [`postman/hackverse_collection.json`](./postman/hackverse_collection.json) and [`postman/hackverse_environment.json`](./postman/hackverse_environment.json). Set `baseUrl` to your API host (without `/api/v1`).

---

## Auth — `/auth`

| Method | Path | Who | Notes |
|--------|------|-----|-------|
| POST | `/auth/signup` | Public | Body: `firstName`, `lastName`, `email`, `password`. Sends OTP email. |
| POST | `/auth/verify-otp` | Public | Body: `email`, `otp` |
| POST | `/auth/resend-otp` | Public | Body: `email` |
| POST | `/auth/login` | Public | Sets auth cookies |
| POST | `/auth/forgot-password` | Public | Body: `email` |
| POST | `/auth/reset-password` | Public | Body: `token`, `password` |
| POST | `/auth/refresh` | Public | Uses `refreshToken` cookie |
| POST | `/auth/logout` | Public | Clears cookies |
| GET | `/auth/me` | Auth | Current user profile |
| PATCH | `/auth/change-password` | Auth | Body: `currentPassword`, `newPassword` |

Rate limiting applies to auth endpoints.

---

## Users — `/users`

| Method | Path | Who | Notes |
|--------|------|-----|-------|
| GET | `/users` | Admin | Query: `?search`, `?role`, `?page`, `?limit` |
| PATCH | `/users/me` | Auth | Multipart optional `avatar` (image, max 2 MB) + profile fields |
| PATCH | `/users/:id` | Admin | Edit name or role |
| PATCH | `/users/:id/block` | Admin | Sets `isActive: false` |
| PATCH | `/users/:id/unblock` | Admin | Sets `isActive: true` |
| DELETE | `/users/:id` | Admin | Soft delete |

---

## Hackathons — `/hackathons`

| Method | Path | Who | Notes |
|--------|------|-----|-------|
| GET | `/hackathons` | Public | Query: `?status`, `?includeDrafts` (organizers/admins see drafts) |
| GET | `/hackathons/:slug` | Public | Detail by URL slug |
| POST | `/hackathons` | Organizer | Multipart: optional `banner` + JSON fields (see below) |
| PATCH | `/hackathons/:id` | Organizer | Update own event; multipart supported |
| POST | `/hackathons/:id/publish` | Org+Admin | `draft` → `published` |
| POST | `/hackathons/:id/open-registration` | Org+Admin | Opens registration window |
| POST | `/hackathons/:id/close-registration` | Org+Admin | Closes registration |
| DELETE | `/hackathons/:id` | Org+Admin | Soft delete |

**Create/update body (JSON or multipart `data` field):** `title`, `slug`, `description`, `registrationStart`, `registrationEnd`, `hackathonStart`, `hackathonEnd`, optional `submissionStart`, `submissionDeadline`, `maxTeamSize`, `minTeamSize`, `contactEmail`, `judgingCriteria`, `prizes`, `problemStatements`, `faq`, `mode`, `venue`, `theme`, etc.

**Banner upload:** field name `banner`, max 5 MB, JPEG/PNG/WebP/GIF.

---

## Registrations

| Method | Path | Who | Notes |
|--------|------|-----|-------|
| POST | `/hackathons/:hackathonId/register` | Participant | Creates pending registration |
| GET | `/registrations/me` | Participant | List own registrations |
| GET | `/hackathons/:hackathonId/registrations` | Org+Admin | All registrations for event |
| PATCH | `/registrations/:id/review` | Org+Admin | Body: `status` — `registered` or `rejected` |
| PATCH | `/registrations/:id/cancel` | Participant | Cancel own registration |

---

## Teams

| Method | Path | Who | Notes |
|--------|------|-----|-------|
| POST | `/hackathons/:hackathonId/teams` | Participant | Body: `name` — create team (leader) |
| GET | `/hackathons/:hackathonId/my-team` | Participant | Current user's team |
| GET | `/hackathons/:hackathonId/teams` | Org+Admin | All teams for event |
| PATCH | `/teams/:teamId/members` | Participant | Leader adds member by email/user |
| PATCH | `/teams/:teamId/remove-member` | Participant | Leader removes member |
| PATCH | `/teams/:teamId/transfer-leadership` | Participant | Leader only |
| PATCH | `/teams/:teamId/leave` | Participant | Member leaves team |
| DELETE | `/teams/:teamId` | Participant (leader) or Admin | Soft delete team |

---

## Submissions

| Method | Path | Who | Notes |
|--------|------|-----|-------|
| POST | `/hackathons/:hackathonId/submissions` | Participant | Create submission (see body below) |
| GET | `/hackathons/:hackathonId/my-submission` | Participant | Own team's submission |
| GET | `/hackathons/:hackathonId/submissions` | Org+Admin | All submissions for event |
| GET | `/hackathons/:hackathonId/judge-submissions` | Judge | Submissions assigned for scoring |
| PATCH | `/submissions/:submissionId` | Participant | Update before deadline |
| PATCH | `/submissions/:submissionId/review` | Org+Admin | Body: `status` — `under_review`, `approved`, `rejected` |
| DELETE | `/submissions/:submissionId` | Participant or Admin | Soft delete |

**Create/update body (JSON or multipart):**

| Field | Required | Notes |
| --- | --- | --- |
| `githubRepo` | Yes | Must be a `github.com` URL |
| `description` | Yes | Project summary (10–2000 chars) |
| `problemStatement` | Yes | 10–3000 chars |
| `solution` | Yes | 10–3000 chars |
| `projectName` | No | Display name |
| `techStack` | No | String array |
| `demoUrl`, `videoUrl` | No | HTTP(S) URLs |
| `screenshot` | No | Multipart file — image, max 10 MB |
| `presentation` | No | Multipart file — image or PDF, max 10 MB |

Uploaded files are stored under `/uploads/submissions/`; response includes `screenshotUrl` / `presentationUrl` paths.

---

## Evaluations

| Method | Path | Who | Notes |
|--------|------|-----|-------|
| PATCH | `/hackathons/:hackathonId/judges/:judgeId` | Org+Admin | Assign or remove judge |
| POST | `/submissions/:submissionId/evaluate` | Judge | Body: rubric scores + `remarks` |
| PATCH | `/evaluations/:evaluationId` | Judge | Update own evaluation |
| GET | `/evaluations/me` | Judge | List evaluations by current judge |
| GET | `/hackathons/:hackathonId/evaluations` | Org+Admin | All evaluations for event |

**Score fields (0–10 each):** `innovationScore`, `uiuxScore`, `technicalScore`, `presentationScore`, `codeQualityScore`, `problemSolvingScore`, `remarks` (required).

---

## Leaderboard & Results

| Method | Path | Who | Notes |
|--------|------|-----|-------|
| GET | `/hackathons/:hackathonId/leaderboard` | Public | Ranked teams (after scores exist) |
| GET | `/hackathons/:hackathonId/results` | Org+Admin | Detailed results for organizers |
| GET | `/hackathons/:hackathonId/my-result` | Participant | Own team's result |
| POST | `/hackathons/:hackathonId/close-evaluation` | Org+Admin | Locks judging phase |
| POST | `/hackathons/:hackathonId/announce-winners` | Org+Admin | Publishes winners; optional emails |

---

## Invitations

| Method | Path | Who | Notes |
|--------|------|-----|-------|
| POST | `/hackathons/:hackathonId/judges/invite` | Org+Admin | Body: `email` |
| POST | `/judge-invitations/register` | Public | Register via invite token |
| POST | `/judge-invitations/respond` | Judge | Accept/decline judge invite |
| POST | `/teams/:teamId/invitations` | Participant | Leader invites member by email |
| POST | `/team-invitations/respond` | Participant | Accept/decline team invite |

---

## Notifications

| Method | Path | Who | Notes |
|--------|------|-----|-------|
| GET | `/notifications/me` | Auth | Paginated inbox |
| PATCH | `/notifications/read-all` | Auth | Mark all as read |
| PATCH | `/notifications/:id/read` | Auth | Mark one as read |

---

## Dashboard

| Method | Path | Who | Notes |
|--------|------|-----|-------|
| GET | `/dashboard/stats` | Auth | Role-specific overview counts |

---

## Admin — `/admin`

Platform-wide read-only lists for administrators.

| Method | Path | Who | Query params | Response highlights |
|--------|------|-----|--------------|---------------------|
| GET | `/admin/teams` | Admin | `?page` (default 1), `?limit` (default 50) | `id`, `name`, `hackathonTitle`, `hackathonSlug`, `leader`, `memberCount` |
| GET | `/admin/submissions` | Admin | `?page`, `?limit` | `id`, `projectName`, `teamName`, `hackathonTitle`, `hackathonSlug`, `status`, `submittedAt` |

Both endpoints return paginated `data` arrays with `meta`: `{ total, page, limit, pages }`.

---

## Health

| Method | Path | Who | Notes |
|--------|------|-----|-------|
| GET | `/health` | Public | Mounted at app root (not under `/api/v1`) |

---

## Response format

Success responses:

```json
{
  "success": true,
  "message": "...",
  "data": { },
  "meta": { "total": 0, "page": 1, "limit": 50, "pages": 1 }
}
```

List endpoints return an array in `data` and pagination in `meta` when applicable.

Errors return `success: false` with an HTTP status code and message.

---

## Related documentation

- Database schema: [`SCHEMA.md`](./SCHEMA.md)
- Deployment: [`DEPLOY.md`](./DEPLOY.md)
- Project report: [`PROJECT_REPORT.md`](./PROJECT_REPORT.md)
