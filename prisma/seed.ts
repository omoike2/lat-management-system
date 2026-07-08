import { PrismaClient, VenueType } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const DEPARTMENTS = [
  "Electronics and Computer Engineering",
  "Mechanical Engineering",
  "Chemical Engineering",
];

const ECE_LECTURERS = [
  "A. Prof Shoewu",
  "Prof Yusuf",
  "Dr Mary",
  "Dr Ajasa",
  "Engr Mumini",
  "Dr L.A",
  "Engr Oni",
  "Engr Folorunsho",
  "Dr Ogundare",
  "Prof Adetona",
  "Dr Balogun",
  "Engr Nathaniel",
];

const ME_LECTURERS = [
  "Prof Mechanical 1",
  "Prof Mechanical 2",
  "Dr Mechanical 1",
  "Dr Mechanical 2",
  "Engr Mechanical 1",
  "Engr Mechanical 2",
];

const CHE_LECTURERS = [
  "Prof Chemical 1",
  "Prof Chemical 2",
  "Dr Chemical 1",
  "Dr Chemical 2",
  "Engr Chemical 1",
  "Engr Chemical 2",
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

  // Default password for all seeded lecturers (change per lecturer in production)
  const lecturerPasswordHash = await bcrypt.hash("lecturer123", 10);

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
    { name: "ECE Classroom 1", capacity: 120, type: VenueType.LECTURE_HALL },
    { name: "ECE Classroom 2", capacity: 120, type: VenueType.LECTURE_HALL },
    { name: "ECE Classroom 3", capacity: 120, type: VenueType.LECTURE_HALL },
    { name: "ECE Classroom 4", capacity: 120, type: VenueType.LECTURE_HALL },

    { name: "ME Classroom 1", capacity: 120, type: VenueType.LECTURE_HALL },
    { name: "ME Classroom 2", capacity: 120, type: VenueType.LECTURE_HALL },
    { name: "ME Lab 1", capacity: 60, type: VenueType.LAB },

    { name: "CHE Classroom 1", capacity: 120, type: VenueType.LECTURE_HALL },
    { name: "CHE Classroom 2", capacity: 120, type: VenueType.LECTURE_HALL },
    { name: "CHE Lab 1", capacity: 60, type: VenueType.LAB },
  ];
  await db.venue.createMany({ data: venueData });
  console.log("Venues: 10"); // Updated engineering venues

  // Lecturers
  const lecturers = [];

  for (const name of ECE_LECTURERS) {
    lecturers.push(
      await db.lecturer.create({
        data: {
          name,
          email:
            name.toLowerCase().replace(/[^a-z0-9]+/g, ".") + "@lasu.edu.ng",
          department: "Electronics and Computer Engineering",
          passwordHash: lecturerPasswordHash,
        },
      }),
    );
  }

  for (let i = 0; i < ME_LECTURERS.length; i++) {
    lecturers.push(
      await db.lecturer.create({
        data: {
          name: ME_LECTURERS[i],
          email: `me${i + 1}@lasu.edu.ng`,
          department: "Mechanical Engineering",
          passwordHash: lecturerPasswordHash,
        },
      }),
    );
  }

  for (let i = 0; i < CHE_LECTURERS.length; i++) {
    lecturers.push(
      await db.lecturer.create({
        data: {
          name: CHE_LECTURERS[i],
          email: `che${i + 1}@lasu.edu.ng`,
          department: "Chemical Engineering",
          passwordHash: lecturerPasswordHash,
        },
      }),
    );
  }

  console.log(`Lecturers: ${lecturers.length}`);

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
