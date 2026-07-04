# LAT Management System — Agent Operating Charter

**Project:** LASU Academic Timetable Management System  
**Stack:** Next.js 16 (App Router), TypeScript, PostgreSQL, Prisma, NextAuth.js v5, Tailwind CSS v4, shadcn/ui, Resend, pnpm  
**Owner:** logickoder — senior engineer standards apply to all output.

---

## CORE DIRECTIVES

### 1. SURGICAL EDITS ONLY
Modify only the target file/function. Do not reformat, rewrite, or restructure untouched code. Preserve exact indentation and ordering. Never rewrite a whole file to fix one function.

### 2. ZERO HALLUCINATION
If a library API is uncertain, check the installed version in `package.json`. Never invent method names, props, or config keys. Missing data → `TODO` comment, not a fabricated placeholder.

### 3. NO BOILERPLATE COMMENTS
No JSDoc on self-evident functions. Comment only: non-obvious algorithmic choices, constraint invariants, workarounds for specific bugs. One line max.

### 4. VERTICAL SLICE ARCHITECTURE
Every feature lives in `src/features/<feature>/`. Each slice owns its server actions, queries, types, and validation schema. Cross-slice imports go through `src/lib/` only — no slice imports another slice directly.

### 5. SERVER-FIRST
Default to React Server Components. Add `"use client"` only when: user interaction, browser APIs, or React hooks are required. Never add `"use client"` to a layout or page that doesn't need it.

### 6. TYPE SAFETY
No `any`. No `as unknown as X`. Use Prisma-generated types as ground truth. Zod schemas for all user input — validate at the action boundary, not in the component.

### 7. ERROR HANDLING
No try/catch in UI components. Server actions return `{ success: boolean; error?: string; data?: T }`. Never throw from a server action — return the error shape.

---

## PROJECT STRUCTURE

```
lat-management-system/
├── src/
│   ├── app/
│   │   ├── (admin)/                    # Admin route group
│   │   │   ├── layout.tsx              # Admin shell: sidebar + header
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── courses/
│   │   │   │   ├── page.tsx            # Course list + add form
│   │   │   │   └── [id]/page.tsx       # Edit course
│   │   │   ├── lecturers/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── venues/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   └── timetable/
│   │   │       ├── page.tsx            # Full grid + generate button
│   │   │       └── conflicts/page.tsx  # Conflict resolution UI
│   │   ├── (student)/                  # Student route group
│   │   │   ├── layout.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── timetable/page.tsx      # Personal filtered grid
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   └── cron/notify/route.ts    # Vercel cron endpoint
│   │   ├── login/page.tsx
│   │   ├── layout.tsx                  # Root layout: fonts, providers
│   │   └── page.tsx                    # Redirect to /login or /admin
│   ├── features/
│   │   ├── courses/
│   │   │   ├── actions.ts              # Server actions: create, update, delete
│   │   │   ├── queries.ts              # DB reads (used in RSC)
│   │   │   ├── schema.ts               # Zod schema
│   │   │   └── types.ts                # Feature-local types
│   │   ├── lecturers/
│   │   │   ├── actions.ts
│   │   │   ├── queries.ts
│   │   │   ├── schema.ts
│   │   │   └── types.ts
│   │   ├── venues/
│   │   │   ├── actions.ts
│   │   │   ├── queries.ts
│   │   │   ├── schema.ts
│   │   │   └── types.ts
│   │   ├── timetable/
│   │   │   ├── actions.ts              # generate, updateEntry, deleteEntry
│   │   │   ├── queries.ts
│   │   │   ├── generator.ts            # Constraint-satisfaction algorithm
│   │   │   ├── constraints.ts          # Pure constraint checkers
│   │   │   ├── schema.ts
│   │   │   └── types.ts
│   │   ├── students/
│   │   │   ├── actions.ts
│   │   │   ├── queries.ts
│   │   │   ├── schema.ts
│   │   │   └── types.ts
│   │   └── notifications/
│   │       ├── trigger.ts              # sendChangeNotification, sendReminders
│   │       └── templates.ts            # Email HTML templates
│   ├── components/
│   │   ├── ui/                         # shadcn/ui primitives (auto-generated)
│   │   ├── timetable-grid.tsx          # Reusable weekly grid (admin + student)
│   │   ├── conflict-badge.tsx
│   │   ├── data-table.tsx              # Generic table with sort/filter
│   │   └── form-field.tsx              # Controlled input with error display
│   ├── lib/
│   │   ├── db.ts                       # Prisma client singleton
│   │   ├── auth.ts                     # NextAuth config + session helpers
│   │   ├── mailer.ts                   # Resend client singleton
│   │   └── utils.ts                    # cn(), formatTime(), dayLabel()
│   └── types/
│       └── index.ts                    # Shared types across features
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── components.json                     # shadcn config
└── package.json
```

---

## FEATURE SLICE RULES

Each `src/features/<name>/` slice follows this contract:

**`actions.ts`**
- All functions are `async` Server Actions (`"use server"` at top of file)
- Return type: `ActionResult<T>` from `src/types/index.ts`
- Validate input with the slice's Zod schema before touching the DB
- Call `trigger.ts` in `notifications/` after mutations that affect live timetable entries

**`queries.ts`**
- Plain async functions — no `"use server"`, called directly from RSC
- Return Prisma types or mapped feature types
- No business logic — pure DB reads

**`schema.ts`**
- Zod schemas only
- Export `CreateXSchema`, `UpdateXSchema` and their inferred TS types

**`types.ts`**
- Feature-local types not generated by Prisma
- Export `XWithRelations` types built from Prisma includes

---

## STYLING SYSTEM

**Framework:** Tailwind CSS v4 + shadcn/ui  
**Theme:** Neutral base, LASU green accent (`#006633`), white surface

### Design tokens (set in `app/layout.tsx` globals):
```css
:root {
  --color-brand: #006633;
  --color-brand-light: #e6f2ec;
  --color-danger: #dc2626;
  --color-warning: #d97706;
  --color-surface: #ffffff;
  --color-muted: #f8fafc;
  --radius: 0.5rem;
}
```

### Component patterns:
- **Pages:** `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8`
- **Section headers:** `text-2xl font-semibold text-gray-900` + description `text-sm text-gray-500 mt-1`
- **Cards:** `bg-white rounded-lg border border-gray-200 shadow-sm p-6`
- **Primary button:** `bg-brand text-white hover:bg-brand/90` (map `--color-brand`)
- **Danger button:** `bg-red-600 text-white hover:bg-red-700`
- **Form labels:** `text-sm font-medium text-gray-700`
- **Error text:** `text-xs text-red-600 mt-1`
- **Empty state:** centered column, muted icon, `text-gray-400 text-sm`

### Timetable grid:
- CSS Grid: columns = days (Mon–Fri), rows = time slots
- Occupied cell: colored card with course code + venue abbreviation + lecturer surname
- Conflict cell: red border + warning icon
- Empty cell: dashed border, hover shows `+` for manual assignment
- Department color coding: each dept gets a consistent pastel from a fixed palette

### Admin sidebar:
- Fixed left, `w-64`, white background, `border-r border-gray-200`
- Nav items: icon + label, active state = `bg-brand-light text-brand font-medium`
- LASU logo/wordmark at top

---

## ALGORITHM (timetable/generator.ts)

Greedy constraint satisfaction with backtracking on conflict:

```
Input: Course[], Lecturer[], Venue[], TimeSlot[], Semester
Output: TimetableEntry[] | ConflictReport[]

Sort courses descending by constraint density:
  density = lecturer.courseCount + dept_level_courseCount

For each course:
  For each time_slot (shuffled to avoid column bias):
    For each venue (sorted by capacity fit ascending):
      if checkVenueClash(venue, slot, existing) === false
      AND checkLecturerClash(course.lecturers, slot, existing) === false
      AND checkGroupClash(course.dept, course.level, slot, existing) === false:
        assign → push to result
        break both loops
  if no assignment found:
    push to conflicts[]

Return { entries: TimetableEntry[], conflicts: ConflictReport[] }
```

Pure constraint checkers live in `constraints.ts` — no DB calls, takes existing `TimetableEntry[]` as parameter. Generator calls DB once to fetch all existing entries for the semester, runs algorithm in memory, bulk-inserts result.

---

## NOTIFICATION SYSTEM

**30-min reminder cron:** `api/cron/notify/route.ts`
- Vercel Cron: `"*/5 * * * *"` (every 5 min, check window 25–35 min ahead)
- Query entries where `startTime BETWEEN now+25min AND now+35min`
- Fetch students matching `dept + level`
- Batch send via Resend (one email per student per entry)
- Guard: check `notificationSent` flag on entry to avoid duplicates

**Change notification:** called from `timetable/actions.ts` after every `updateEntry`
- Accepts `TimetableEntry` + `changeType: 'venue' | 'time' | 'cancellation'`
- Fetches affected students, fires Resend batch

---

## ENV VARS

```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
RESEND_API_KEY=
ADMIN_EMAIL=
ADMIN_PASSWORD_HASH=          # bcrypt hash
CRON_SECRET=                  # validates Vercel cron calls
```

---

## COMMANDS

```bash
pnpm dev          # local dev
pnpm build        # production build
pnpm db:push      # prisma db push (schema sync)
pnpm db:studio    # prisma studio
pnpm db:seed      # seed demo data
pnpm lint         # eslint
```

---

## CLEAN CODE

- **Meaningful names.** Variables, functions, and files name what they do. No `data`, `obj`, `temp`, `handleStuff`.
- **Small functions.** One function = one action. If you need "and" to describe it, split it.
- **No dead code.** Delete unused functions, imports, and variables. Don't comment them out.
- **DRY at the right altitude.** Extract when the same logic appears 3+ times AND the abstraction has a clear name. Don't extract for 2 occurrences.
- **Readable over clever.** Explicit beats implicit. Clear beats terse.

---

## SOLID

### S — Single Responsibility
Each module, file, and function has **one reason to change**:
- `constraints.ts` — only checks constraints. No DB, no formatting, no side effects.
- `generator.ts` — only runs the algorithm. No DB calls, no HTTP.
- `actions.ts` — only orchestrates: validate → call domain logic → persist → notify.
- `queries.ts` — only reads from DB. No mutation, no business logic.

### O — Open/Closed
Add behaviour by adding new functions/files, not by editing existing ones where possible. New constraint type → new checker function in `constraints.ts`, not a patched `if` chain.

### L — Liskov Substitution
Any `ActionResult<T>` returned from an action must be safely consumable by callers without type-narrowing hacks. Subtypes must not weaken the contract.

### I — Interface Segregation
Keep interfaces narrow. Don't pass a full `TimetableEntry` to a function that only needs `slotId` + `venueId` — pass only what it needs.

### D — Dependency Inversion
Pure domain functions (`generator.ts`, `constraints.ts`) accept data as parameters — they don't import `db` or `mailer`. Side-effectful dependencies are injected at the action boundary.

---

## TESTING

**Framework:** Vitest (unit + integration). Playwright for e2e (student + admin flows).

**What to test:**
- `constraints.ts` — unit test every checker with both pass and fail cases. Pure functions = no mocks needed.
- `generator.ts` — unit test output: zero constraint violations, all courses assigned or in conflicts[], correct ConflictReport shape.
- `actions.ts` — integration test with a real test DB (no mocks): create → read → update → delete round-trips.
- Perf: 50-course generation < 2s (timed in test).
- Notification cron: integration test with mocked Resend, assert correct students targeted.

**Test location:** `src/features/<name>/__tests__/` for unit/integration. `tests/e2e/` for Playwright.

**Rules:**
- No mocking of internal domain code — mock only external I/O (Resend, Prisma in e2e only).
- Tests must pass before any commit. Failing tests = do not commit.
- Each phase ends: run tests → green → commit → next phase.

---

## COMMIT WORKFLOW

After completing each implementation phase:
1. Run `pnpm test` (Vitest) — all must pass.
2. Run `pnpm build` — must compile clean.
3. Run `pnpm lint` — zero errors.
4. Commit with a message scoped to the phase: `feat(phase-N): <what landed>`.
5. Update the corresponding phase checkbox in `PROGRESS.md`.
6. Proceed to next phase.

Never commit with failing tests or type errors.

---

## WHAT NOT TO DO

- No `useEffect` for data fetching — use RSC + server actions
- No client-side routing for form submissions — use server actions with `revalidatePath`
- No global state management (Zustand/Redux) — server state via RSC, client state via `useState` locally
- No axios — use `fetch` or server actions
- No CSS-in-JS — Tailwind only
- No `any` type — ever
- No mocking internal domain logic in tests — mock only external I/O
