# Deployment Guide: ASKI (MERN + Next.js)

Three independently deployed apps: **backend** (Express + Socket.IO API), **frontend** (Next.js user app), **admin** (Next.js admin portal). Deploy the backend first, then point both Next apps at it.

> There is **no `docker-compose.yml`** in this repo. Each app is built and started on its own (npm scripts or PM2). Earlier guidance referencing Docker was incorrect.

---

## 1. Database — MongoDB Atlas

A **replica set is required** (the payment/escrow code uses multi-document transactions; Atlas M0+ provides one).

1. Create a project and a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Network Access: allow your server IPs (or `0.0.0.0/0` for staging only).
3. Database Access: create a user + password.
4. Connect → Drivers → copy the connection string for `DATABASE_URL`, e.g.
   `mongodb+srv://<user>:<password>@cluster0.xxxx.mongodb.net/aski-db?retryWrites=true&w=majority`

---

## 2. Backend (Express API)

Root directory: `backend/`. Build: `npm ci`. Start: `npm start` (or `npm run pm2:start` for PM2).

**Required environment variables** (exact names the code reads):

```env
# Core
DATABASE_URL=               # Mongo Atlas connection string (replica set)
PORT=5000                   # the port the API listens on
NODE_ENV=production         # REQUIRED in prod: enables Secure/SameSite=None cookies
BACKEND_PUBLIC_URL=         # public https URL of this API (used to build payment callback/webhook URLs)

# Auth (JWT in httpOnly cookies)
JWT_ACCESS_TOKEN_SECRET_KEY=    # long random string
JWT_REFRESH_TOKEN_SECRET_KEY=   # DIFFERENT long random string
SALT=10                          # bcrypt rounds

# CORS / cookies (frontend + admin origins)
FRONTEND_HOST=https://aski.com
FRONTEND_HOSTS=https://admin.aski.com   # comma-separated for extra origins
COOKIE_DOMAIN=.aski.com                  # leading dot shares the login cookie across user+admin subdomains
COOKIE_SAME_SITE=none                    # use 'none' for cross-subdomain (requires https + NODE_ENV=production)

# Payments — UddoktaPay (Bangladeshi gateway)
UDDOKTAPAY_BASE_URL=
UDDOKTAPAY_API_KEY=
UDDOKTAPAY_WEBHOOK_API_KEY=    # set a value DISTINCT from the API key
UDDOKTAPAY_MOCK_MODE=false     # MUST be false/unset in production (true = fake test gateway)
UDDOKTAPAY_CURRENCY=BDT
PLATFORM_FEE_RATE=0.15         # platform cut (0..1); can be overridden per-record in PlatformSettings
MIN_TRANSACTION_FEE=10

# Files (AWS S3)
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=

# Email (native SMTP via nodemailer)
EMAIL_HOST=                    # e.g. smtp.gmail.com
EMAIL_PORT=587                 # 587 = STARTTLS, 465 = SSL
EMAIL_USER=                    # SMTP username (e.g. the Gmail address)
EMAIL_PASSWORD=                # SMTP password / Gmail App Password
EMAIL_FROM=                    # sender address shown to recipients
EMAIL_FROM_NAME=               # sender display name (optional)
GEMINI_KEY=                    # Google Gemini, quiz generation
GOOGLE_CLIENT_ID=              # Google OAuth
GOOGLE_CLIENT_SECRET=
```

Seed an admin account once, from the `backend/` directory: set `SEED_ADMIN_PASSWORD` (required — the script refuses to run without it) and optionally `SEED_ADMIN_EMAIL` (defaults to `admin@aski.com`), then run `node scripts/seed-admin.mjs`. **Warning:** this script also inserts demo students/tutors/transactions and clears existing quiz questions and admin logs — run it only against a fresh or staging database, never against production data you intend to keep.

---

## 3. Frontend and Admin (Next.js)

Root directories: `frontend/` and `admin/`. Build: `npm ci && npm run build`. Start: `npm start` (admin runs on port 3001 in dev).

**Required environment variables (BOTH apps):**

```env
NEXT_PUBLIC_API_URL=https://api.aski.com     # the backend's PUBLIC url — must resolve to the backend's PORT
NEXT_PUBLIC_SOCKET_URL=https://api.aski.com  # backend url for Socket.IO
# The Next middleware crypto-verifies the JWT, so the Next server ALSO needs the backend's JWT secrets:
JWT_ACCESS_TOKEN_SECRET_KEY=                 # must match the backend value
JWT_REFRESH_TOKEN_SECRET_KEY=                # must match the backend value
```

> **Port note:** the backend listens on `PORT` (default **5000**). `NEXT_PUBLIC_API_URL` must point at that backend (its public URL/port). Locally, either run the backend on `8000` or set `NEXT_PUBLIC_API_URL=http://localhost:5000` — the two must agree.

---

## 4. Go-live checklist

- [ ] `NODE_ENV=production` on the backend (and the Next apps).
- [ ] `UDDOKTAPAY_MOCK_MODE` is **false/unset** (mock checkout routes are auto-disabled when `NODE_ENV=production`).
- [ ] `UDDOKTAPAY_WEBHOOK_API_KEY` is set and **different** from `UDDOKTAPAY_API_KEY`; register the webhook URL `https://api.aski.com/api/assignments/payment/webhook` and `.../api/sessions/payment/webhook` in the UddoktaPay panel.
- [ ] `COOKIE_DOMAIN` + `COOKIE_SAME_SITE=none` + https so the login cookie works across the user and admin subdomains.
- [ ] `FRONTEND_HOST` / `FRONTEND_HOSTS` include both the user and admin origins (CORS + Socket.IO allowlists).
- [ ] The same `JWT_ACCESS_TOKEN_SECRET_KEY` / `JWT_REFRESH_TOKEN_SECRET_KEY` are set on the backend AND both Next apps.
- [ ] Health check passes: `GET https://api.aski.com/health`.

---

## 5. Summary of URLs

- **Frontend (users):** your Next deploy URL
- **Admin:** your admin Next deploy URL (add it to `FRONTEND_HOSTS`)
- **Backend health:** `https://api.aski.com/health`
