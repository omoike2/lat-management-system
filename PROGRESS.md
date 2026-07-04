# LAT — Build Progress

Last updated: 2026-07-04  ·  Current phase: 1

---

## Phase 0 — Scaffold & tooling  [x]

- [x] `pnpm dlx create-next-app` (TS, App Router, Tailwind, src dir)
- [x] Add deps: prisma, next-auth@beta, zod, resend, bcryptjs, lucide-react, shadcn/ui
- [x] Configure tsconfig strict + ESLint
- [x] Add package.json scripts: `dev build lint db:push db:studio db:seed db:reset`
- [x] Create `.env.example` (all vars from CLAUDE §ENV)
- [x] `.gitignore` entry for `.env.local`
- [x] Verify: `pnpm dev` boots default page
- [x] `pnpm test && pnpm build && pnpm lint` → commit `feat(phase-0): scaffold and tooling`

## Phase 1 — Data layer  [x]

- [x] `prisma/schema.prisma` — all models (Course, Lecturer, LecturerCourse, Venue, VenueType, TimeSlot, TimetableEntry, Student, Admin)
- [x] `src/lib/db.ts` — Prisma client singleton
- [x] `prisma/seed.ts` — admin account, 5 time-slots/day (P3 break), sample data
- [x] Verify: `db:push` syncs; `db:seed` populates; `db:studio` shows rows
- [x] `pnpm test && pnpm build && pnpm lint` → commit `feat(phase-1): data layer and seed`

## Phase 2 — Core lib + shared types  [x]

- [x] `src/types/index.ts` — `ActionResult<T>`, shared enums, day labels
- [x] `src/lib/auth.ts` — NextAuth v5, Credentials provider, `auth()` export
- [x] `src/lib/mailer.ts` — Resend client singleton
- [x] `src/lib/utils.ts` — `cn()`, `formatTime()`, `dayLabel()`
- [x] `src/proxy.ts` — protect `(admin)` routes, redirect → `/login` (Next.js 16 convention)
- [x] Verify: `pnpm build` typechecks clean
- [x] `pnpm test && pnpm build && pnpm lint` → commit `feat(phase-2): core lib auth and shared types`

## Phase 3 — Design tokens + shell  [x]

- [x] Global CSS: full color palette tokens from DESIGN.md, Inter font
- [x] shadcn primitives: button, input, select, sheet, sonner, table, label, separator, badge, dropdown-menu
- [x] `components/form-field.tsx` — label + input + error display
- [x] `components/data-table.tsx` — sort/filter/paginate
- [x] `components/slide-over.tsx` — reusable slide-over panel
- [x] `app/admin/layout.tsx` — sidebar w-64, nav items (lucide icons), active state, sign out
- [x] `app/login/page.tsx` — credentials form → `/admin/dashboard`
- [x] `app/page.tsx` — redirect to `/login` or `/admin`
- [x] Verify: build passes, /admin/dashboard URL correct
- [x] `pnpm test && pnpm build && pnpm lint` → commit `feat(phase-3): design tokens and admin shell`
- Note: route groups renamed to real path segments (admin/, student/) for correct URLs

## Phase 4 — CRUD slices (courses, lecturers, venues)  [ ]

Courses:
- [ ] `features/courses/schema.ts` — CreateCourseSchema, UpdateCourseSchema
- [ ] `features/courses/queries.ts` — list (paginated + search), getById
- [ ] `features/courses/actions.ts` — create, update, delete (cascade)
- [ ] `features/courses/types.ts` — CourseWithRelations
- [ ] `app/(admin)/courses/page.tsx` — table + add slide-over
- [ ] `app/(admin)/courses/[id]/page.tsx` — edit + lecturer assignment

Lecturers:
- [ ] `features/lecturers/schema.ts`
- [ ] `features/lecturers/queries.ts`
- [ ] `features/lecturers/actions.ts` — delete unassigns from courses
- [ ] `features/lecturers/types.ts`
- [ ] `app/(admin)/lecturers/page.tsx`
- [ ] `app/(admin)/lecturers/[id]/page.tsx`

Venues:
- [ ] `features/venues/schema.ts`
- [ ] `features/venues/queries.ts`
- [ ] `features/venues/actions.ts` — delete blocked if active entries
- [ ] `features/venues/types.ts`
- [ ] `app/(admin)/venues/page.tsx`
- [ ] `app/(admin)/venues/[id]/page.tsx`

- [ ] Verify: full CRUD all three; validation errors surface; search + pagination work
- [ ] `pnpm test && pnpm build && pnpm lint` → commit `feat(phase-4): CRUD slices courses lecturers venues`

## Phase 5 — Timetable generation engine  [ ]

- [ ] `features/timetable/constraints.ts` — pure checkers: checkVenueClash, checkLecturerClash, checkGroupClash
- [ ] `features/timetable/generator.ts` — greedy CSP w/ backtracking, returns `{ entries, conflicts }`
- [ ] `features/timetable/queries.ts` — fetch-all-for-semester, grid reads
- [ ] `features/timetable/actions.ts` — generate, updateEntry, deleteEntry, manualAssign
- [ ] `features/timetable/schema.ts` + `types.ts` — ConflictReport shape
- [ ] Verify: unit-test constraints; generate on seed → zero violations; conflicts reported correctly
- [ ] `pnpm test && pnpm build && pnpm lint` → commit `feat(phase-5): timetable generation engine and constraints`

## Phase 6 — Timetable UI  [ ]

- [ ] `components/timetable-grid.tsx` — CSS Grid, dept color coding, admin/student modes
- [ ] `components/conflict-badge.tsx`
- [ ] `app/(admin)/timetable/page.tsx` — semester selector, Generate button + overlay, grid, conflicts panel
- [ ] `app/(admin)/timetable/conflicts/page.tsx` — manual slot+venue picker, live validation
- [ ] `app/(admin)/dashboard/page.tsx` — stat cards
- [ ] Verify: generate → color-coded grid; conflict resolution validates correctly
- [ ] `pnpm test && pnpm build && pnpm lint` → commit `feat(phase-6): timetable grid and admin UI`

## Phase 7 — Notifications  [ ]

- [ ] `features/notifications/templates.ts` — reminder + change HTML emails
- [ ] `features/notifications/trigger.ts` — sendChangeNotification, sendReminders
- [ ] `app/api/cron/notify/route.ts` — CRON_SECRET guard, 25–35min window query, reminderSent flag
- [ ] `vercel.json` — cron `*/5 * * * *`
- [ ] Wire change notifications into timetable/actions.ts mutations
- [ ] Verify: manual POST sends reminder; updateEntry fires change email
- [ ] `pnpm test && pnpm build && pnpm lint` → commit `feat(phase-7): notifications cron and email triggers`

## Phase 8 — Student flow  [ ]

- [ ] `features/students/` — schema, actions (register → cookie), queries
- [ ] `app/(student)/layout.tsx` — top bar, no sidebar
- [ ] `app/(student)/register/page.tsx` — form → cookie → redirect
- [ ] `app/(student)/timetable/page.tsx` — read-only filtered grid, mobile stacked cards < md
- [ ] Verify: register → filtered timetable; mobile layout stacks correctly
- [ ] `pnpm test && pnpm build && pnpm lint` → commit `feat(phase-8): student registration and personal timetable`

## Phase 9 — Performance tests + polish  [ ]

- [ ] Test 1: 50-course generation < 2s
- [ ] Test 2: conflict-detection accuracy (zero false negatives)
- [ ] Test 3: notification delivery < 60s
- [ ] Test 4: 10× generation runs all clean
- [ ] Responsive pass: sidebar hamburger < md
- [ ] Loading states, empty states, toasts throughout
- [ ] `pnpm build && pnpm lint` clean
- [ ] Verify: 4/4 perf assertions pass; production build succeeds
- [ ] `pnpm test && pnpm build && pnpm lint` → commit `feat(phase-9): performance tests and polish`

---

## Notes / blockers

- 2026-07-04: Plan finalized. Starting Phase 0 next session.
