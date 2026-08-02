# HackVerse Data Schema

Brief ERD-style overview of core MongoDB collections and how they relate.

## Entity Relationship Diagram

```
User ──────────────┬──────────────────────────────────────────┐
  │                │                                          │
  │ organizer      │ judges[]                                 │ user
  ▼                ▼                                          ▼
Hackathon ◄── Registration                          Notification
  │                │
  │                │ hackathon
  ├── Team ◄───────┘
  │     │
  │     └── Submission ──► Evaluation (judge scores submission)
  │
  └── Invitation (judge or team invite)
```

---

## User

Platform account. Roles: `participant`, `organizer`, `judge`, `admin`.

| Field | Type | Notes |
|-------|------|-------|
| firstName, lastName | String | Required, max 50 chars |
| email | String | Unique, lowercase |
| password | String | Hashed (bcrypt), `select: false` — not returned in API |
| avatar | String | URL path under `/uploads/avatars/`, optional |
| role | String | Enum: `participant`, `organizer`, `judge`, `admin` |
| isActive | Boolean | `false` = blocked by admin |
| isVerified | Boolean | Email verified via OTP at signup |
| isDeleted | Boolean | Soft delete |
| lastLogin | Date | Updated on successful login |
| refreshToken | String | Stored hashed, `select: false` |
| createdAt, updatedAt | Date | Mongoose timestamps |

**Relations:** owns hackathons (`organizer`), appears in `Team.leader` / `Team.members`, receives `Notification`, may be `Evaluation.judge`, referenced in `Invitation`.

---

## Hackathon

An event created by an organizer.

| Field | Type | Notes |
|-------|------|-------|
| title, slug | String | Slug unique, lowercase, used in URLs |
| tagline | String | Optional, max 150 chars |
| description | String | Required |
| banner | String | Image path under `/uploads/banners/`, optional |
| organizer | ObjectId → User | Required |
| registrationStart / registrationEnd | Date | Required |
| hackathonStart / hackathonEnd | Date | Required |
| submissionStart / submissionDeadline | Date | Optional |
| maxTeamSize, minTeamSize | Number | Defaults 4 / 1 |
| maxTeams | Number | Optional cap |
| prizePool | String | Optional display text |
| status | String | See status enum below |
| evaluationClosed | Boolean | Set when organizer closes judging |
| winnersAnnounced | Boolean | |
| winnersAnnouncedAt | Date | Set when winners are announced |
| visibility | String | `public` or `private` |
| theme | String | Optional, max 100 chars |
| mode | String | `online`, `offline`, or `hybrid` |
| venue | String | Optional, for offline/hybrid |
| problemStatements | Array | `{ title, description }` |
| techStack | String[] | Suggested technologies |
| rules | String | Markdown/plain text |
| prizes | Array | `{ title, value, description }` |
| judgingCriteria | Array | `{ criteriaName, weight (0–100), description }` |
| contactEmail | String | Required, validated email |
| faq | Array | `{ question, answer }` |
| judges | ObjectId[] → User | Assigned judges |
| isDeleted | Boolean | Soft delete |
| createdAt, updatedAt | Date | Mongoose timestamps |

**Status enum:** `draft`, `published`, `registration_open`, `ongoing`, `judging`, `completed`, `archived`

**Indexes:** `slug` (unique), `organizer`, `status`

**Relations:** has many `Registration`, `Team`, `Submission`, `Evaluation`, `Invitation`.

---

## Registration

Links a participant to a hackathon.

| Field | Type | Notes |
|-------|------|-------|
| user | ObjectId → User | |
| hackathon | ObjectId → Hackathon | |
| registrationDate | Date | Default now |
| status | String | `pending`, `registered`, `rejected`, `cancelled` |
| isDeleted | Boolean | Soft delete |
| createdAt, updatedAt | Date | Mongoose timestamps |

**Unique:** one registration per user per hackathon (`user` + `hackathon` compound index).

---

## Team

A group competing in one hackathon.

| Field | Type | Notes |
|-------|------|-------|
| name | String | Unique within hackathon |
| hackathon | ObjectId → Hackathon | |
| leader | ObjectId → User | Team creator / leader |
| members | ObjectId[] → User | Includes leader |
| maxMembers | Number | Copied from hackathon `maxTeamSize` |
| isDeleted | Boolean | Soft delete |
| createdAt, updatedAt | Date | Mongoose timestamps |

**Indexes:** unique `(name, hackathon)`; `hackathon`, `leader`, `members`

**Relations:** one `Submission` per team (unique index on `team`).

---

## Submission

A team's project entry for a hackathon.

| Field | Type | Notes |
|-------|------|-------|
| team | ObjectId → Team | Unique — one submission per team |
| hackathon | ObjectId → Hackathon | |
| githubRepo | String | Required, must be a GitHub URL |
| projectName | String | Optional display name |
| techStack | String[] | |
| demoUrl, presentationUrl, videoUrl, screenshotUrl | String | Optional URLs or `/uploads/submissions/...` paths |
| description | String | Required — project summary |
| problemStatement | String | Required |
| solution | String | Required |
| status | String | `pending`, `under_review`, `approved`, `rejected` |
| submittedAt | Date | Default now |
| isDeleted | Boolean | Soft delete |
| createdAt, updatedAt | Date | Mongoose timestamps |

**File uploads (API):** optional multipart fields `screenshot` (image) and `presentation` (image or PDF, max 10 MB each). Stored under `/uploads/submissions/`; URLs saved in `screenshotUrl` / `presentationUrl` when uploaded.

**Relations:** scored by many `Evaluation` records (one per judge).

---

## Evaluation

A judge's score for one submission.

| Field | Type | Notes |
|-------|------|-------|
| hackathon | ObjectId → Hackathon | |
| submission | ObjectId → Submission | |
| judge | ObjectId → User | |
| innovationScore | Number | 0–10, required |
| uiuxScore | Number | 0–10 |
| technicalScore | Number | 0–10, required |
| presentationScore | Number | 0–10, required |
| codeQualityScore | Number | 0–10 |
| problemSolvingScore | Number | 0–10 |
| remarks | String | Required |
| totalScore | Number | Computed weighted sum from hackathon criteria |
| evaluatedAt | Date | Default now |
| createdAt, updatedAt | Date | Mongoose timestamps |

**Unique:** one evaluation per judge per submission (`judge` + `submission` compound index).

---

## Invitation

Email invite for a judge or team member.

| Field | Type | Notes |
|-------|------|-------|
| type | String | `judge` or `team` |
| email | String | Lowercase |
| tokenHash | String | Unique, used in invite link |
| hackathon | ObjectId → Hackathon | |
| team | ObjectId → Team | Set for team invites |
| invitedBy | ObjectId → User | |
| status | String | `pending`, `accepted`, `declined`, `expired` |
| expiresAt | Date | TTL index (30-day cleanup) |
| acceptedBy | ObjectId → User | |
| respondedAt | Date | |
| createdAt, updatedAt | Date | Mongoose timestamps |

---

## Notification

In-app alert for a user.

| Field | Type | Notes |
|-------|------|-------|
| user | ObjectId → User | |
| type | String | e.g. `registration_approved`, `winner_announced` |
| title, message | String | |
| meta | Mixed | Optional JSON context (hackathon id, etc.) |
| isRead | Boolean | Default `false` |
| createdAt, updatedAt | Date | Mongoose timestamps |

**Indexes:** `(user, createdAt)`, `(user, isRead)`

---

## Key constraints

| Rule | Enforcement |
| --- | --- |
| One registration per user per hackathon | Unique compound index on `Registration` |
| One team name per hackathon | Unique compound index on `Team` |
| One submission per team | Unique index on `Submission.team` |
| One evaluation per judge per submission | Unique compound index on `Evaluation` |
| Soft delete | `isDeleted` on User (via admin), Hackathon, Team, Registration, Submission |
| Invite expiry | MongoDB TTL on `Invitation.expiresAt` |

---

## Static uploads (not MongoDB collections)

Files served from `backend/uploads/`:

| Path | Purpose | Max size |
| --- | --- | --- |
| `/uploads/avatars/` | User profile pictures | 2 MB |
| `/uploads/banners/` | Hackathon banner images | 5 MB |
| `/uploads/submissions/` | Submission screenshot / presentation | 10 MB per file |

In production, ensure persistent storage or external object storage if the host uses ephemeral disks.
