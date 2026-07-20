# HackVerse - Hackathon Management Platform

HackVerse is an enterprise-grade platform built to handle the full lifecycle of Hackathons: from registration and team formation to project submissions, judging evaluations, and leaderboards.

---

## 🚀 Key Features

* **Layered Clean Architecture:** Strict separation of routes, validations, controllers, services, repositories, and models.
* **Secure Session Management:** Token rotation using access tokens (15m) and refresh tokens (30d) stored in HTTP-only cookies.
* **Cryptographic Hardening:** Refresh tokens are hashed using SHA-256 before database storage to prevent database breach exploits.
* **Robust Input Validation:** Standardized, type-safe validations using Zod schemas.
* **Centralized Error System:** Predictable response formats using custom `AppError` handlers that mask stack traces in production.
* **Auditability:** Correlation ID tracking (`X-Request-Id`) across files and Winston logging.
* **Lifecycle Management:** Database model structure prepared for Hackathon CRUD and team formations.

---

## 📂 Folder Structure

```text
hackverse/
├── backend/
│   ├── src/
│   │   ├── config/             # Settings drivers (env, logger, jwt)
│   │   ├── constants/          # Static frozen tables (httpStatus, roles, hackathonStatus)
│   │   ├── controllers/        # Express handlers parsing HTTP payloads
│   │   ├── database/           # Mongoose driver and close routines
│   │   ├── errors/             # Custom exceptions catalog (AppError, ErrorCodes)
│   │   ├── middleware/         # Security headers, rate limiters, auth/RBAC guards
│   │   ├── models/             # Schema definitions and indexes declarations
│   │   ├── repositories/       # Isolated database query layer
│   │   ├── routes/             # API routing mappings
│   │   ├── services/           # Hashing, token rotation, and business workflows
│   │   ├── utils/              # Resusable helper methods (cookie, jwt, asyncHandler)
│   │   └── validators/         # Zod schemas mapping
│   ├── server.js               # Startup bootstrapper
│   └── package.json            # Node dependencies
├── docker/                     # Docker containers configs
├── docs/                       # Project specifications and guidelines
├── frontend/                   # UI client source code
├── nginx/                      # Proxy routing profiles
└── scripts/                    # Helper setup files
```

---

## 🛠️ Installation & Setup

### Prerequisites
* Node.js (v22+)
* MongoDB instance (v6+)

### Installation
1. Clone the repository and navigate to the backend folder:
   ```bash
   cd hackverse/backend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```

### Environment Configuration
Create a `.env` file in the `backend` root directory using the variables template:
```env
PORT=5000
NODE_ENV=development

MONGO_URI=mongodb://127.0.0.1:27017/HacVerse

JWT_ACCESS_SECRET=your_access_secret_key_here
JWT_ACCESS_EXPIRES_IN=15m

JWT_REFRESH_SECRET=your_refresh_secret_key_here
JWT_REFRESH_EXPIRES_IN=30d

ALLOWED_ORIGINS=http://localhost:3000
```

### Start Development Server
```bash
npm run dev
```

---

## 🔑 Authentication Flow

### Session Control Sequence
```text
  [Signup] ────► [Login] ────► [Authorize access token] ────► [Refresh token rotation] ───► [Logout]
  Registers      Issues        Authorization: Bearer          Cookie: refreshToken       Clears database
  clean user     cookie &      header validated by            validated, rotated to      hash and client
  record         access token  middleware guards              new cookie and token       cookie
```

---

## 📋 API Overview

All routes are prefixed with `/api/v1`.

| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/auth/signup` | Public | Register participant user. |
| **POST** | `/auth/login` | Public | Authenticate user, return JWT access token, and set refresh cookie. |
| **POST** | `/auth/refresh` | Public | Rotate refresh session cookies and issue a new access token. |
| **POST** | `/auth/logout` | Public | Invalidate database session and clear refresh cookies. |
| **GET** | `/auth/me` | Protected | Fetch current user details. |
| **GET** | `/health` | Public | Check database connectivity and API status. |

---

## 🗺️ Future Roadmap

* **Phase 3:** Create Hackathon registration, invitation workflows, and admin dashboards.
* **Phase 4:** Build submissions module, judging scoring rubrics, and automated scoreboard calculations.
* **Phase 5:** Integrate caching (Redis), Docker orchestration, and CI/CD pipelines.
