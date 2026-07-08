# Notification System

## Overview

Three notification events fire automatically:

| Event | Trigger | Recipients | Transport |
|---|---|---|---|
| **30-min class reminder** | cron every 5 min → `POST /api/cron/notify` | Students matching entry course's `dept + level` | Gmail SMTP |
| **Venue/time change** | Admin edits entry → `updateEntry` action | Same | Gmail SMTP |
| **Lecturer venue change** | Lecturer changes venue → `changeVenue` action | Same | Gmail SMTP |
| **Cancellation** | Admin deletes entry → `deleteEntry` action | Same | Gmail SMTP |

## Architecture

```
cron-job.org (every 5 min)
  → POST /api/cron/notify
  → Authorization: Bearer CRON_SECRET header
  → queries TimeSlots where startTime ∈ [now+25min, now+35min]
  → queries TimetableEntries in those slots where reminderSent=false
  → sendReminders(entries)         ← features/notifications/trigger.ts
      ├── fetch students by dept+level
      ├── mailer.sendMail × N      ← src/lib/mailer.ts (nodemailer Gmail)
      └── db.timetableEntry.update reminderSent=true

timetable/actions.ts: updateEntry / deleteEntry
  → sendChangeNotification(entryId, changeType, details)
      ├── fetch entry with course
      ├── fetch students by { department: course.department, level: course.level }
      └── mailer.sendMail × N (Promise.allSettled — fire and forget)

lecturers/actions.ts: changeVenue
  → same sendChangeNotification("venue", …)
```

## Duplicate prevention

`reminderSent: Boolean @default(false)` on `TimetableEntry`. Set to `true` after successful batch. The cron query always filters `reminderSent: false` — so if the cron fires multiple times in the same window, only the first pass sends.

## Testing manually

### Reminder email
1. Set `.env.local` with real `GMAIL_USER` + `GMAIL_APP_PASSWORD`.
2. Pick (or create) a `TimeSlot` with `startTime = now + 30 minutes`.
3. Ensure a `TimetableEntry` exists for that slot with `reminderSent = false`.
4. Ensure a `Student` exists with matching `department` + `level`.
5. Curl:
   ```bash
   curl -X POST http://localhost:3000/api/cron/notify \
     -H "Authorization: Bearer $CRON_SECRET"
   ```
6. Check Gmail inbox — expect subject "Class Reminder: …".

### Change / cancellation email
1. Log in to admin at `/login`.
2. Navigate to **Timetable** → click any entry → change the venue or time → save.
3. The `updateEntry` action fires `sendChangeNotification` synchronously.
4. Check Gmail inbox — subject will be "Venue Change" or "Schedule Change" depending on what changed.

### Lecturer venue change email
1. Log in as a lecturer at `/lecturer/login` (password: `lecturer123` for seeded accounts).
2. Select a different venue for a class → click **Change Venue**.
3. Students matching that course's dept+level receive a "Venue Change" email.

## Email templates

Templates live in `src/features/notifications/templates.ts`:
- `reminderEmailHtml(entry)` — 30-min reminder
- `changeEmailHtml(entry, changeType, details)` — venue/time/cancellation change

Both are plain HTML strings built without an external template engine.
