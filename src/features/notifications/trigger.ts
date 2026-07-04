import { db } from "@/lib/db";
import { mailer } from "@/lib/mailer";
import { reminderEmailHtml, changeEmailHtml } from "./templates";
import type { ChangeType } from "@/types";
import { DAY_LABELS } from "@/types";

export async function sendChangeNotification(
  entryId: string,
  changeType: ChangeType,
  details: string
): Promise<void> {
  const entry = await db.timetableEntry.findUnique({
    where: { id: entryId },
    include: { course: true, lecturer: true, venue: true, slot: true },
  });
  if (!entry) return;

  const students = await db.student.findMany({
    where: { department: entry.course.department, level: entry.course.level },
    select: { name: true, email: true },
  });
  if (students.length === 0) return;

  const emails = students.map((s) => ({
    from: "LAT System <noreply@lasu.edu.ng>",
    to: s.email,
    subject: `${changeType === "cancellation" ? "Class Cancelled" : changeType === "venue" ? "Venue Change" : "Schedule Change"}: ${entry.course.code}`,
    html: changeEmailHtml({
      studentName: s.name,
      courseCode: entry.course.code,
      courseName: entry.course.title,
      changeType,
      details,
    }),
  }));

  await mailer.batch.send(emails).catch(console.error);
}

export async function sendReminders(entryIds: { id: string }[]): Promise<void> {
  if (entryIds.length === 0) return;

  const ids = entryIds.map((e) => e.id);
  const entries = await db.timetableEntry.findMany({
    where: { id: { in: ids } },
    include: { course: true, lecturer: true, venue: true, slot: true },
  });

  for (const entry of entries) {
    const students = await db.student.findMany({
      where: { department: entry.course.department, level: entry.course.level },
      select: { name: true, email: true },
    });
    if (students.length === 0) continue;

    const dayLabel = DAY_LABELS[entry.slot.dayOfWeek] ?? "Unknown";
    const emails = students.map((s) => ({
      from: "LAT System <noreply@lasu.edu.ng>",
      to: s.email,
      subject: `Reminder: ${entry.course.code} starts in 30 minutes`,
      html: reminderEmailHtml({
        studentName: s.name,
        courseCode: entry.course.code,
        courseName: entry.course.title,
        venueName: entry.venue.name,
        lecturerName: entry.lecturer.name,
        startTime: entry.slot.startTime,
        day: dayLabel,
      }),
    }));

    await mailer.batch.send(emails).catch(console.error);

    await db.timetableEntry.update({
      where: { id: entry.id },
      data: { reminderSent: true },
    });
  }
}
