# Deployment Guide

## Overview

LAT Management System deploys to **Vercel** (hosting + cron) with **Supabase** (managed PostgreSQL) and **Resend** (transactional email).

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 20+ | |
| pnpm | 11+ | `npm i -g pnpm` |
| Vercel CLI | latest | `pnpm i -g vercel` (optional, can use dashboard) |
| Supabase project | — | Free tier sufficient |
| Resend account | — | Free tier: 3 000 emails/month |

---

## 1. Database — Supabase

1. Create a new project at [supabase.com](https://supabase.com).
2. Go to **Settings → Database → Connection string → URI** and copy the pooled connection string (port `6543`).
3. Append `?pgbouncer=true&connection_limit=1` to the URI — required for serverless.
4. This becomes `DATABASE_URL`.

> **Direct connection** (port `5432`, no `pgbouncer` param) is used for migrations. If Supabase exposes both, use the pooled URL in `DATABASE_URL` and the direct URL in `DIRECT_URL` (optional Prisma `directUrl` field).

---

## 2. Email — Gmail SMTP

The app sends email via Gmail SMTP using a **Gmail App Password** — free, no domain purchase required, delivers to any email address.

### Setup

1. Use any Gmail account (create a dedicated one like `lat.lasu.notify@gmail.com` if preferred).
2. Enable 2-Step Verification on the account: **Google Account → Security → 2-Step Verification**.
3. Generate an App Password: **Security → 2-Step Verification → App Passwords** → choose "Mail" → copy the 16-character password.
4. Set environment variables:
   - `GMAIL_USER` = the Gmail address (e.g. `lat.lasu.notify@gmail.com`)
   - `GMAIL_APP_PASSWORD` = the 16-character app password (spaces optional)

The FROM address in emails will be the Gmail address. Students receive emails at whatever address they registered with.

---

## 3. Environment Variables

All variables required in Vercel dashboard and `.env.local` for local dev:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Supabase pooled connection (runtime) | `postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1` |
| `DIRECT_URL` | Supabase direct connection (schema ops) | `postgresql://postgres.[ref]:[pass]@db.[ref].supabase.co:5432/postgres` |
| `NEXTAUTH_SECRET` | Random 32-byte base64 string | `openssl rand -base64 32` |
| `GMAIL_USER` | Gmail address used to send emails | `lat.lasu.notify@gmail.com` |
| `GMAIL_APP_PASSWORD` | Gmail App Password (not login password) | `xxxx xxxx xxxx xxxx` |
| `ADMIN_EMAIL` | Admin login email | `admin@lasu.edu.ng` |
| `ADMIN_PASSWORD_HASH` | bcrypt hash of admin password | see below |
| `CRON_SECRET` | Token validating cron requests | `openssl rand -base64 32` |

### Generate ADMIN_PASSWORD_HASH

```bash
node -e "const b=require('bcryptjs');b.hash('yourpassword',10).then(console.log)"
```

Paste the output (starts with `$2b$10$...`) as the value.

### Generate secrets

```bash
openssl rand -base64 32   # use once for NEXTAUTH_SECRET, once for CRON_SECRET
```

---

## 4. Database Schema + Seed

Run locally with `DATABASE_URL` set to the **pooled** Supabase connection string (port 6543):

```bash
pnpm db:push    # applies prisma/schema.prisma to the live DB
pnpm db:seed    # creates admin account + sample time slots
```

Set both variables in `.env.local` — `db:push` uses the direct connection, the app uses the pooled one:

```env
# pooled — runtime (Vercel serverless)
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1

# direct — schema ops only (db:push, db:seed)
DIRECT_URL=postgresql://postgres.[ref]:[password]@db.[ref].supabase.co:5432/postgres
```

Both URLs are in Supabase: **Settings → Database → Connection string**. Pick "Transaction mode" for `DATABASE_URL`, "Direct connection" for `DIRECT_URL`.

> `db:push` uses `prisma db push` (no migration history). For production schema changes, re-run `db:push` — Prisma will warn about destructive changes before applying.

---

## 5. Deploy to Vercel

### Via CLI

```bash
vercel login
vercel --prod
```

Follow the prompts. On first deploy, set env vars via `vercel env add` or the dashboard.

### Via Dashboard

1. Import the GitHub repo at [vercel.com/new](https://vercel.com/new).
2. Set **Framework Preset** to `Next.js`.
3. Add all env vars under **Settings → Environment Variables**.
4. Click **Deploy**.

Subsequent pushes to `main` trigger automatic deployments.

---

## 6. Cron Job

The reminder handler is at `POST /api/cron/notify`, protected by `Authorization: Bearer <CRON_SECRET>`.

Vercel Hobby does not support sub-daily cron schedules, so use **cron-job.org** (free, no code required):

1. Create a free account at [cron-job.org](https://cron-job.org)
2. Click **Create cronjob** → choose **Import from curl**
3. Paste:
   ```
   curl -X POST https://lat-management-system.vercel.app/api/cron/notify -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```
4. Set schedule to every 5 minutes
5. Save and enable

**Cron behavior:**
- Fires every 5 minutes
- Queries entries with `startTime` in the 25–35 minute window from now
- Sends one email per matched student; sets `reminderSent = true` to prevent duplicates

---

## 7. Post-Deploy Verification

1. Visit `https://lat-management-system.vercel.app` → redirects to `/login`.
2. Log in with `ADMIN_EMAIL` + the plain password used to generate the hash.
3. Navigate to **Courses** → create a course — confirm it saves.
4. Navigate to **Timetable** → click **Generate** — confirm entries appear.
5. Register as a student at `/student/register` → confirm personal timetable loads.
6. Test the cron handler:
   ```bash
   curl -X POST https://lat-management-system.vercel.app/api/cron/notify \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```
   Expect `{"sent":0}` (or a positive count if entries fall in the 25–35 min window).

---

## 8. Local Development

```bash
cp .env.example .env.local   # fill in values
pnpm install
pnpm db:push
pnpm db:seed
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

For a local Postgres alternative to Supabase:

```bash
createdb lat_dev
# set DATABASE_URL=postgresql://localhost:5432/lat_dev in .env.local
```

---

## 9. Useful Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server (port 3000) |
| `pnpm build` | Production build + type check |
| `pnpm lint` | ESLint |
| `pnpm test` | Vitest unit + integration tests |
| `pnpm db:push` | Sync Prisma schema to DB |
| `pnpm db:seed` | Seed admin account + sample data |
| `pnpm db:studio` | Open Prisma Studio (DB browser) |
| `pnpm db:reset` | Drop + recreate DB (dev only) |

---

## 10. Troubleshooting

**Login fails after deploy**
- Confirm `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH` are set correctly in Vercel env vars.
- Verify the hash was generated with `bcryptjs` (not `bcrypt`) — the seed uses `bcryptjs`.

**Database connection errors**
- Use the **pooled** Supabase URL (port 6543) with `?pgbouncer=true&connection_limit=1`.
- If Prisma migrations fail, try the direct URL (port 5432) for `db:push`.

**Emails not sending**
- Confirm `GMAIL_USER` and `GMAIL_APP_PASSWORD` are set correctly.
- The App Password must be generated with 2-Step Verification enabled — your regular Gmail password will not work.
- Gmail may block the first send if the account has no prior app activity; check Gmail's security alerts inbox and approve the access.

**Cron not firing**
- Check cron-job.org dashboard — confirm the job is enabled and not erroring.
- Test the handler directly:
  ```bash
  curl -X POST https://lat-management-system.vercel.app/api/cron/notify \
    -H "Authorization: Bearer YOUR_CRON_SECRET"
  ```

**Auth redirect errors after deploy**
- NextAuth v5 auto-detects the URL from `VERCEL_URL` on Vercel — no manual `NEXTAUTH_URL` needed.
- If redirects still misbehave, set `AUTH_URL` (the v5 env var name) to your exact deployment URL with no trailing slash.
