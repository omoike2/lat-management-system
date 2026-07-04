# LAT Management System

LASU Academic Timetable — constraint-based timetable generation and student notification system built for Lagos State University.

## Stack

- **Framework:** Next.js 16 (App Router, RSC-first)
- **Language:** TypeScript (strict)
- **Database:** PostgreSQL via [Supabase](https://supabase.com) free tier
- **ORM:** Prisma
- **Auth:** NextAuth.js v5
- **Email:** Resend
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Package manager:** pnpm
- **Hosting:** Vercel

## Local Setup

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL (local or Supabase connection string)

### Install

```bash
git clone <repo>
cd lat-management-system
pnpm install
```

### Environment

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000
RESEND_API_KEY=re_...
ADMIN_EMAIL=admin@lasu.edu.ng
ADMIN_PASSWORD_HASH=          # bcrypt hash of admin password
CRON_SECRET=                  # random string, validates /api/cron/notify
```

Generate a bcrypt hash for the admin password:

```bash
node -e "const b=require('bcryptjs');b.hash('yourpassword',10).then(console.log)"
```

### Database

```bash
pnpm db:push      # sync schema to DB
pnpm db:seed      # seed admin account + sample data
```

### Dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Architecture

### Vertical Slice Feature Layout

Each feature owns its server actions, DB queries, Zod schemas, and types. No cross-slice imports — shared utilities go through `src/lib/`.

```
src/features/
  courses/        actions.ts  queries.ts  schema.ts  types.ts
  lecturers/      actions.ts  queries.ts  schema.ts  types.ts
  venues/         actions.ts  queries.ts  schema.ts  types.ts
  timetable/      actions.ts  queries.ts  generator.ts  constraints.ts  schema.ts  types.ts
  students/       actions.ts  queries.ts  schema.ts  types.ts
  notifications/  trigger.ts  templates.ts
```

### Data Flow

```
RSC Page
  → queries.ts (DB read, no auth check needed — layout handles session)
  → renders UI

Client Component
  → calls server action (actions.ts)
  → action validates with Zod → writes to DB → revalidatePath
  → UI updates via RSC re-render
```

### Timetable Generation

Pure in-memory greedy algorithm with backtracking. Runs in a single server action:

1. Fetch all courses, lecturers, venues, slots from DB
2. Sort courses by constraint density (most constrained first)
3. For each course: try slots × venues until all 3 hard constraints pass
4. Bulk insert assignments; return conflict report for failures
5. Admin resolves conflicts manually via validated form

Hard constraints (zero tolerance):
- Venue uniqueness per slot
- Lecturer uniqueness per slot
- Department+level uniqueness per slot

### Notification Cron

Vercel Cron fires every 5 minutes → `POST /api/cron/notify` (protected by `CRON_SECRET` header).

- Queries entries starting in 25–35 min window with `reminderSent = false`
- Fetches students matching `dept + level` of each entry
- Batch sends via Resend, sets `reminderSent = true`

Change notifications fire synchronously from `timetable/actions.ts` after any entry mutation.

---

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint |
| `pnpm db:push` | Push Prisma schema to DB |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm db:seed` | Seed demo data |
| `pnpm db:reset` | Drop + recreate DB (dev only) |

---

## Deployment

Push to `main` → Vercel auto-deploys.

Set all env vars in Vercel dashboard. Add cron in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/notify",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

Vercel sends `Authorization: Bearer <CRON_SECRET>` automatically when configured.

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Generation (50 courses) | < 2s |
| Timetable page LCP | < 1.5s |
| Notification delivery | < 60s |
| Conflict detection | 100% accuracy |

---

## Project Brief Objectives Mapping

| Objective | Implementation |
|-----------|---------------|
| Examine LASU weaknesses | `PRD.md` § Problem Statement |
| Admin data entry + auto generation | `features/timetable/generator.ts` + admin pages |
| Personal student timetable + notifications | `(student)/timetable` + `features/notifications/` |
| Performance testing | `PRD.md` § Performance Tests |
