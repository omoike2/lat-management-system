import { PrismaClient, VenueType } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const DEPARTMENTS = [
  "Computer Science",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
];

const LEVELS = [100, 200, 300, 400, 500];

const TIME_SLOTS = [
  { startTime: "08:00", endTime: "10:00", available: true },
  { startTime: "10:00", endTime: "12:00", available: true },
  { startTime: "12:00", endTime: "14:00", available: false }, // lunch break
  { startTime: "14:00", endTime: "16:00", available: true },
  { startTime: "16:00", endTime: "18:00", available: true },
];

const DAYS = [0, 1, 2, 3, 4]; // Mon–Fri

async function main() {
  console.log("Seeding…");

  await db.timetableEntry.deleteMany();
  await db.lecturerCourse.deleteMany();
  await db.course.deleteMany();
  await db.lecturer.deleteMany();
  await db.venue.deleteMany();
  await db.timeSlot.deleteMany();
  await db.student.deleteMany();
  await db.admin.deleteMany();

  // Admin
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@lasu.edu.ng";
  const rawPassword = process.env.ADMIN_PASSWORD ?? "admin123";
  const passwordHash =
    process.env.ADMIN_PASSWORD_HASH ?? (await bcrypt.hash(rawPassword, 10));

  await db.admin.create({ data: { email: adminEmail, passwordHash } });
  console.log(`Admin: ${adminEmail}`);

  // Time slots — 5 per day × 5 days = 25 total
  for (const day of DAYS) {
    for (const slot of TIME_SLOTS) {
      await db.timeSlot.create({
        data: { dayOfWeek: day, ...slot },
      });
    }
  }
  console.log("Time slots: 25");

  // Venues — 10 total
  const venueData = [
    { name: "LT-1", capacity: 300, type: VenueType.LECTURE_HALL },
    { name: "LT-2", capacity: 250, type: VenueType.LECTURE_HALL },
    { name: "LT-3", capacity: 200, type: VenueType.LECTURE_HALL },
    { name: "LT-4", capacity: 150, type: VenueType.LECTURE_HALL },
    { name: "CS Lab A", capacity: 50, type: VenueType.LAB },
    { name: "CS Lab B", capacity: 50, type: VenueType.LAB },
    { name: "Sci Lab A", capacity: 60, type: VenueType.LAB },
    { name: "Sci Lab B", capacity: 60, type: VenueType.LAB },
    { name: "Seminar A", capacity: 40, type: VenueType.SEMINAR_ROOM },
    { name: "Seminar B", capacity: 40, type: VenueType.SEMINAR_ROOM },
  ];
  await db.venue.createMany({ data: venueData });
  console.log("Venues: 10");

  // Lecturers — 20 total (4 per department)
  const lecturers = await Promise.all(
    DEPARTMENTS.flatMap((dept, di) =>
      [1, 2, 3, 4].map((n) =>
        db.lecturer.create({
          data: {
            name: `Dr. ${dept.split(" ")[0]} ${n}`,
            email: `lecturer${di * 4 + n}@lasu.edu.ng`,
            department: dept,
          },
        })
      )
    )
  );
  console.log("Lecturers: 20");

  // Courses — 50 total (2 per dept × 5 levels × 1 per combo = 10 per dept = 50)
  // Each course gets weeklyFreq=2 and one lecturer assigned
  let courseCount = 0;
  for (const dept of DEPARTMENTS) {
    const deptLecturers = lecturers.filter((l) => l.department === dept);
    for (const [li, level] of LEVELS.entries()) {
      for (let i = 1; i <= 2; i++) {
        const code = `${dept.slice(0, 3).toUpperCase()} ${level + i - 1}`;
        const course = await db.course.create({
          data: {
            code,
            title: `${dept} ${level} Module ${i}`,
            department: dept,
            level,
            units: 3,
            weeklyFreq: 2,
          },
        });
        // Assign lecturer (round-robin within dept)
        const lecturer = deptLecturers[(li * 2 + i - 1) % deptLecturers.length];
        await db.lecturerCourse.create({
          data: { lecturerId: lecturer.id, courseId: course.id },
        });
        courseCount++;
      }
    }
  }
  console.log(`Courses: ${courseCount}`);

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
