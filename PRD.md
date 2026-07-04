# PRD — LASU Academic Timetable Management System

**Version:** 1.0  
**Author:** logickoder  
**Last updated:** 2026-07-04  
**Status:** Implemented — all phases complete

---

## Problem Statement

Lagos State University (and similar Nigerian universities) generate timetables manually — spreadsheets, ad-hoc conflict resolution, paper notices for changes. This produces:

- Venue clashes (two classes assigned the same room at the same time)
- Lecturer clashes (one lecturer scheduled for two simultaneous classes)
- Student group clashes (a department/level double-booked in a time slot)
- No mechanism for students to receive timely updates when schedules change

This system eliminates all four failure modes via automated constraint-based generation and a real-time notification layer.

---

## Objectives (from project brief)

1. Examine existing academic arrangement and document weaknesses
2. Web-based admin system: input courses, assign lecturers, allocate venues, generate conflict-free timetables
3. Personal student timetable module (by dept + level) + automated 30-min reminders + instant change notifications
4. Performance testing: generation time, conflict detection accuracy, notification delivery latency

---

## Users

### Admin (single account — university timetable officer)
- Creates and manages all master data (courses, lecturers, venues)
- Triggers timetable generation per semester
- Resolves flagged conflicts manually
- Can edit any generated entry

### Student
- Self-registers with matric number, department, level, email
- Views personal filtered timetable
- Receives email notifications (reminders + changes)
- No edit access

---

## Functional Requirements

### F1 — Course Management

| Field | Type | Rules |
|-------|------|-------|
| code | string | unique, e.g. `CSC 201` |
| title | string | required |
| department | string | e.g. `Computer Science` |
| level | int | 100 \| 200 \| 300 \| 400 \| 500 |
| units | int | 1–6 |
| weeklyFrequency | int | how many slots/week (default 2) |
| lecturers | Lecturer[] | many-to-many |

Actions: create, update, delete (cascades entries), list with pagination + search.

### F2 — Lecturer Management

| Field | Type | Rules |
|-------|------|-------|
| name | string | required |
| email | string | unique |
| department | string | optional filter |
| courses | Course[] | via join table |

Actions: create, update, delete (unassigns from courses), list.

### F3 — Venue Management

| Field | Type | Rules |
|-------|------|-------|
| name | string | unique, e.g. `LT-1`, `CS Lab A` |
| capacity | int | used for fit-sorting in algorithm |
| type | enum | LECTURE_HALL \| LAB \| SEMINAR_ROOM |

Actions: create, update, delete (blocks generation if has active entries), list.

### F4 — Time Slot Configuration

Admin configures available slots once per setup (not per semester):

```
Monday–Friday
Periods:
  P1: 08:00–10:00
  P2: 10:00–12:00
  P3: 12:00–14:00  (can mark as break — excluded from generation)
  P4: 14:00–16:00
  P5: 16:00–18:00
```

Lunch break (P3) is configurable — admin can toggle it available/unavailable.

### F5 — Timetable Generation

**Trigger:** Admin clicks "Generate Timetable" for a given semester string (e.g. `2025/2026 Second Semester`).

**Pre-conditions:**
- At least 1 course, 1 lecturer assigned to each course, 1 venue, time slots configured
- No active generation in progress

**Process:**
1. Clear all existing `TimetableEntry` rows for that semester (after confirmation prompt)
2. Run constraint-satisfaction algorithm (see CLAUDE.md algorithm spec)
3. Bulk insert successful assignments
4. Return `{ assigned: number, conflicts: ConflictReport[] }`

**Conflict report shape:**
```ts
type ConflictReport = {
  courseId: string
  courseCode: string
  reason: 'NO_VENUE_AVAILABLE' | 'LECTURER_UNAVAILABLE' | 'GROUP_CLASH'
  triedSlots: number
}
```

**Post-generation:**
- Admin sees full grid immediately
- Conflicts panel shows unresolved courses with reason + manual assignment form

### F6 — Manual Conflict Resolution

For each unresolved conflict, admin can:
- Pick a specific time slot + venue manually
- System validates the pick against hard constraints in real-time before saving
- If still invalid, shows which constraint is violated

### F7 — Student Registration

Form fields: name, matric number, email, department (select), level (select).  
No email verification for FYP scope. Matric number unique constraint.

### F8 — Personal Timetable View

Query: `TimetableEntry WHERE course.department = student.department AND course.level = student.level`

Renders same grid component as admin view, read-only, no conflict display.

### F9 — Notifications

**30-minute reminder:**
- Cron runs every 5 minutes
- Finds entries `startTime BETWEEN (now + 25min) AND (now + 35min)`
- Skips entries already flagged `reminderSent = true`
- Sends email, sets `reminderSent = true`

**Change notification (immediate):**
Triggered on:
- `updateEntry` (time, venue, or lecturer changed)
- `deleteEntry` (cancellation)

Email includes: course name, what changed, new details (or "class cancelled").

**Email template data:**
```
Subject: [LAT] Reminder: {courseCode} in 30 minutes — {venueName}
Subject: [LAT] Schedule change: {courseCode} — {changeType}
```

---

## Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Generation time (50 courses) | < 2 seconds |
| Conflict detection accuracy | 100% (zero false negatives) |
| Notification delivery | < 60 seconds from trigger |
| Page load (timetable grid) | < 1.5s (LCP) |
| Mobile responsive | Yes — student view primarily mobile |
| Auth security | bcrypt passwords, HTTP-only session cookie |

---

## Data Model (Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Course {
  id             String           @id @default(cuid())
  code           String           @unique
  title          String
  department     String
  level          Int
  units          Int
  weeklyFreq     Int              @default(2)
  lecturers      LecturerCourse[]
  entries        TimetableEntry[]
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt
}

model Lecturer {
  id         String           @id @default(cuid())
  name       String
  email      String           @unique
  department String?
  courses    LecturerCourse[]
  entries    TimetableEntry[]
  createdAt  DateTime         @default(now())
  updatedAt  DateTime         @updatedAt
}

model LecturerCourse {
  lecturer   Lecturer @relation(fields: [lecturerId], references: [id], onDelete: Cascade)
  lecturerId String
  course     Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  courseId   String

  @@id([lecturerId, courseId])
}

model Venue {
  id       String      @id @default(cuid())
  name     String      @unique
  capacity Int
  type     VenueType   @default(LECTURE_HALL)
  entries  TimetableEntry[]
}

enum VenueType {
  LECTURE_HALL
  LAB
  SEMINAR_ROOM
}

model TimeSlot {
  id        String           @id @default(cuid())
  dayOfWeek Int              // 0=Mon ... 4=Fri
  startTime String           // "08:00"
  endTime   String           // "10:00"
  available Boolean          @default(true)
  entries   TimetableEntry[]

  @@unique([dayOfWeek, startTime])
}

model TimetableEntry {
  id             String     @id @default(cuid())
  course         Course     @relation(fields: [courseId], references: [id])
  courseId       String
  lecturer       Lecturer   @relation(fields: [lecturerId], references: [id])
  lecturerId     String
  venue          Venue      @relation(fields: [venueId], references: [id])
  venueId        String
  slot           TimeSlot   @relation(fields: [slotId], references: [id])
  slotId         String
  semester       String
  reminderSent   Boolean    @default(false)
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt

  @@unique([venueId, slotId, semester])
  @@unique([lecturerId, slotId, semester])
  @@unique([courseId, slotId, semester])
}

model Student {
  id         String  @id @default(cuid())
  name       String
  matric     String  @unique
  email      String  @unique
  department String
  level      Int
  createdAt  DateTime @default(now())
}

model Admin {
  id           String @id @default(cuid())
  email        String @unique
  passwordHash String
}
```

---

## Pages Specification

### `/login`
- Email + password form
- Admin only (single account)
- On success → `/admin/dashboard`
- No student login (students access via direct URL with matric lookup)

### `/admin/dashboard`
Stats cards: total courses, lecturers, venues, students registered, last generation timestamp + conflict count.

### `/admin/courses`
- Table: code, title, dept, level, units, freq, lecturer count, actions
- Add course: slide-over panel with form
- Click row → `/admin/courses/[id]` for edit + lecturer assignment

### `/admin/lecturers`
- Table: name, email, dept, assigned course count, actions
- Add / edit via slide-over

### `/admin/venues`
- Table: name, capacity, type, actions
- Add / edit via slide-over

### `/admin/timetable`
- Semester selector (text input or recent history dropdown)
- "Generate Timetable" button → loading state → result toast
- Full grid (all depts, all levels — color coded by dept)
- Conflicts panel (collapsible) showing unresolved courses
- Click any cell → edit entry (change venue or slot)

### `/admin/timetable/conflicts`
- List of conflict reports
- Per-conflict: manual slot picker + venue picker + live validation

### `/student/register`
- Form: name, matric, email, dept (select from DB), level (select)
- On submit → set cookie with studentId → redirect to `/student/timetable`

### `/student/timetable`
- Read-only grid filtered to their dept + level
- Mobile-first layout: stacked day cards on small screens, grid on md+
- "Your schedule" header with dept + level badge

---

## Performance Tests (Objective 4)

### Test 1 — Generation Speed
- Seed 50 courses across 5 departments, 3 levels
- 20 lecturers, 10 venues, 5 slots/day
- Measure: `Date.now()` before/after algorithm run
- Assert: < 2000ms

### Test 2 — Conflict Detection
- Manually insert two entries with same venue + slot
- Verify constraint checker returns `true` for clash
- Verify generator never produces this state

### Test 3 — Notification Delivery
- Insert entry with `startTime = now + 28min`
- Trigger cron endpoint manually
- Verify Resend delivery within 60s (Resend dashboard + email received)

### Test 4 — Zero False Negatives
- Run generation 10× with identical data
- Assert: all runs produce zero constraint violations on the output set

---

## Out of Scope

- Exam timetable (separate concern, different constraint set)
- Course registration / enrolment
- Payment / fee management
- Mobile native app
- Multi-university support
- Role hierarchy beyond Admin + Student
- SMS notifications (email only for FYP)
- Real-time websockets (polling-free; cron + server actions sufficient)
