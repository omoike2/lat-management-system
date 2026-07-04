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

## 2. Email — Resend

> **Important:** The app's hosting domain (`.vercel.app`) does not affect email delivery. What matters is the **FROM address domain** in Resend. Without a verified domain, Resend's shared sender (`onboarding@resend.dev`) can only deliver to the email address used to sign up for Resend — students will not receive emails.

### For real student email delivery (recommended)

1. Register any domain (~$1–3/yr from Namecheap, Cloudflare Registrar, etc.).
2. In the Resend dashboard → **Domains** → add your domain → add the provided DNS records.
3. Use `notifications@yourdomain.com` (or similar) as the FROM address.
4. Create an account at [resend.com](https://resend.com) → **API Keys** → generate key → set as `RESEND_API_KEY`.
5. Update the `from` field in `src/features/notifications/trigger.ts`:
   ```ts
   from: "LAT Notifications <notifications@yourdomain.com>",
   ```

### For testing/demo only

Skip domain purchase. Resend provides `onboarding@resend.dev` as a shared sender but it only delivers to your own Resend account email. Use your own email as a student during testing.

In `src/features/notifications/trigger.ts` set:
```ts
from: "LAT Notifications <onboarding@resend.dev>",
```

---

## 3. Environment Variables

All variables required in Vercel dashboard and `.env.local` for local dev:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Supabase pooled connection string | `postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1` |
| `NEXTAUTH_SECRET` | Random 32-byte base64 string | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Canonical deployment URL | `https://your-app.vercel.app` |
| `RESEND_API_KEY` | Resend API key | `re_abc123...` |
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

Run once after setting `DATABASE_URL`:

```bash
pnpm db:push    # applies prisma/schema.prisma to the live DB
pnpm db:seed    # creates admin account + sample time slots
```

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
2. Click **Create cronjob**
3. Fill in:
   - **URL:** `https://your-deployment.vercel.app/api/cron/notify`
   - **Request method:** `POST`
   - **Schedule:** every 5 minutes
4. Under **Headers**, add:
   - Name: `Authorization`
   - Value: `Bearer <your CRON_SECRET value>`
5. Save and enable

**Cron behavior:**
- Fires every 5 minutes
- Queries entries with `startTime` in the 25–35 minute window from now
- Sends one email per matched student; sets `reminderSent = true` to prevent duplicates

---

## 7. Post-Deploy Verification

1. Visit `https://your-deployment.vercel.app` → redirects to `/login`.
2. Log in with `ADMIN_EMAIL` + the plain password used to generate the hash.
3. Navigate to **Courses** → create a course — confirm it saves.
4. Navigate to **Timetable** → click **Generate** — confirm entries appear.
5. Register as a student at `/student/register` → confirm personal timetable loads.
6. Manually trigger the cron:
   ```bash
   curl -X POST https://your-deployment.vercel.app/api/cron/notify \
     -H "Authorization: Bearer <CRON_SECRET>"
   ```
   Expect `{"ok":true,"sent":0}` (or a positive count if entries fall in window).

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
- Confirm `RESEND_API_KEY` is valid and the `from` address domain is verified in Resend.
- Check Resend dashboard logs for delivery errors.

**Cron not firing**
- Check cron-job.org dashboard — confirm the job is enabled and not erroring.
- Manually POST to `/api/cron/notify` to test the handler independently:
  ```bash
  curl -X POST https://your-deployment.vercel.app/api/cron/notify \
    -H "Authorization: Bearer <CRON_SECRET>"
  ```

**`NEXTAUTH_URL` mismatch**
- Must match the exact deployment URL (no trailing slash). Mismatches cause OAuth redirect errors.
