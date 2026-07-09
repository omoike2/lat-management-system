# Notification System

## Overview

| Event | Trigger | Recipients | Transport |
|---|---|---|---|
| **Welcome** | Student registers at `/student/register` | The new student | Gmail SMTP |
| **Course registered** | Student adds elective/carryover course | The student | Gmail SMTP |
| **Course removed** | Student removes a registered course | The student | Gmail SMTP |
| **30-min class reminder** | cron every 5 min → `POST /api/cron/notify` | Students matching entry course's `dept + level` | Gmail SMTP |
| **Venue/time change** | Admin edits entry → `updateEntry` action | Students matching course's `dept + level` | Gmail SMTP |
| **Lecturer venue change** | Lecturer changes venue → `changeVenue` action | Same | Gmail SMTP |
| **Cancellation** | Admin deletes entry → `deleteEntry` action | Same | Gmail SMTP |

## Architecture

```
students/actions.ts: registerStudent
  → sendWelcomeEmail(name, email, department, level)   ← fire-and-forget
      └── mailer.sendMail × 1

students/actions.ts: registerCourse / unregisterCourse
  → sendCourseRegistrationEmail(name, email, code, title, action)  ← fire-and-forget
      └── mailer.sendMail × 1

cron-job.org (every 5 min)
  → POST /api/cron/notify
  → Authorization: Bearer CRON_SECRET header
  → queries TimetableEntries where slot.startTime ∈ [now+25min, now+35min]
                                AND reminderSent = false
  → sendReminders(entries)         ← features/notifications/trigger.ts
      ├── fetch students by dept+level
      ├── mailer.sendMail × N      ← src/lib/mailer.ts (nodemailer Gmail)
      └── db.timetableEntry.update reminderSent=true

timetable/actions.ts: updateEntry / deleteEntry
  → sendChangeNotification(entryId, changeType, details)
      ├── fetch entry with course
      ├── fetch students by { department: course.department, level: course.level }
      └── mailer.sendMail × N (Promise.allSettled)

lecturers/actions.ts: changeVenue
  → sendChangeNotification(entryId, "venue", …)
```

## Duplicate prevention

`reminderSent: Boolean @default(false)` on `TimetableEntry`. Set `true` after first batch. Cron always filters `reminderSent: false`.

## Email templates

All in `src/features/notifications/templates.ts`:

| Function | Email subject |
|---|---|
| `welcomeEmailHtml` | "Welcome to LASU Academic Timetable" |
| `courseRegistrationEmailHtml` | "Course Registered: …" / "Course Removed: …" |
| `reminderEmailHtml` | "Class Reminder: …" |
| `changeEmailHtml` | "Venue Change / Schedule Change / Class Cancelled: …" |

Header color: `#0055a4` (LASU blue).

## Testing locally

### Prerequisites

`.env.local` must have:
```env
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx   # Gmail App Password, not login password
CRON_SECRET=any-random-string
```

Run dev server: `pnpm dev`

---

### Welcome email

1. Go to `http://localhost:3000/student/register`
2. Register a new student — use **your real email** in the email field
3. Submit → welcome email arrives within seconds

---

### Course registration email

1. Register (or already be logged in) as a student
2. Go to `http://localhost:3000/student/courses`
3. Check any elective/carryover course checkbox → email arrives confirming registration
4. Uncheck it → email arrives confirming removal

---

### 30-min reminder email

1. Open Prisma Studio: `pnpm db:studio`
2. Find a `TimetableEntry` and note its `slotId`
3. Find the linked `TimeSlot` — temporarily set `startTime` to a value 30 minutes from now (e.g. if it's 14:00, set `14:30`)
4. Ensure a `Student` exists with matching `department` + `level`, and their email is yours
5. Curl the cron endpoint:
   ```bash
   curl -X POST http://localhost:3000/api/cron/notify \
     -H "Authorization: Bearer <your CRON_SECRET>"
   ```
6. Email arrives with class details; `reminderSent` flips to `true` in DB

---

### Change/cancellation email

1. Log in as admin at `http://localhost:3000/login`
2. Navigate to **Timetable** → click any entry → change venue or time → save
3. Email arrives to all students in that course's dept + level

---

### Lecturer venue change email

1. Log in at `http://localhost:3000/lecturer/login` (seeded accounts use `lecturer123`)
2. Change venue on any class → **Change Venue**
3. Email arrives to affected students
