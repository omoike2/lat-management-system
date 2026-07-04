import { describe, it, expect } from "vitest";
import { generate } from "../generator";
import type { CourseForGeneration } from "../types";
import type { Venue, TimeSlot } from "@prisma/client";

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeSlot(id: string, day: number, start: string): TimeSlot {
  return {
    id,
    dayOfWeek: day,
    startTime: start,
    endTime: start.replace(/\d+/, (h) => String(Number(h) + 2)),
    available: true,
  };
}

function makeVenue(id: string, capacity = 100): Venue {
  return { id, name: id, capacity, type: "LECTURE_HALL" };
}

function makeLecturer(id: string) {
  return {
    lecturer: {
      id,
      name: `Lecturer ${id}`,
      email: `${id}@test.com`,
      department: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };
}

function makeCourse(
  id: string,
  code: string,
  dept: string,
  level: number,
  lecturerIds: string[],
  weeklyFreq = 2
): CourseForGeneration {
  return {
    id,
    code,
    title: code,
    department: dept,
    level,
    units: 3,
    weeklyFreq,
    createdAt: new Date(),
    updatedAt: new Date(),
    lecturers: lecturerIds.map(makeLecturer),
  };
}

// 5 slots Mon–Fri (P1 only for simplicity in some tests)
const SLOTS_5 = [
  makeSlot("s0", 0, "08:00"),
  makeSlot("s1", 1, "08:00"),
  makeSlot("s2", 2, "08:00"),
  makeSlot("s3", 3, "08:00"),
  makeSlot("s4", 4, "08:00"),
];

// 20 slots across 4 time-periods × 5 days
const SLOTS_20: TimeSlot[] = [];
for (let day = 0; day < 5; day++) {
  for (const [i, t] of ["08:00", "10:00", "14:00", "16:00"].entries()) {
    SLOTS_20.push(makeSlot(`s${day * 4 + i}`, day, t));
  }
}

const VENUES_10 = Array.from({ length: 10 }, (_, i) => makeVenue(`v${i}`, 200));

const semester = "test-sem";

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("generate", () => {
  it("assigns a single course with weeklyFreq=1", () => {
    const course = makeCourse("c1", "CSC101", "CS", 100, ["l1"], 1);
    const { entries, conflicts } = generate([course], [makeVenue("v1")], [makeSlot("s1", 0, "08:00")], semester);
    expect(conflicts).toHaveLength(0);
    expect(entries).toHaveLength(1);
    expect(entries[0].courseId).toBe("c1");
  });

  it("assigns weeklyFreq=2 as 2 separate slots", () => {
    const course = makeCourse("c1", "CSC101", "CS", 100, ["l1"], 2);
    const { entries, conflicts } = generate([course], [makeVenue("v1")], SLOTS_5, semester);
    expect(conflicts).toHaveLength(0);
    expect(entries).toHaveLength(2);
    const slotIds = new Set(entries.map((e) => e.slotId));
    expect(slotIds.size).toBe(2); // must be different slots
  });

  it("reports conflict when no slots available", () => {
    const course = makeCourse("c1", "CSC101", "CS", 100, ["l1"], 1);
    const { conflicts } = generate([course], [makeVenue("v1")], [], semester);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].courseCode).toBe("CSC101");
  });

  it("reports conflict when course has no lecturers", () => {
    const course = makeCourse("c1", "CSC101", "CS", 100, [], 1);
    const { conflicts } = generate([course], [makeVenue("v1")], SLOTS_5, semester);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].reason).toBe("LECTURER_UNAVAILABLE");
  });

  it("produces zero venue clashes across all entries", () => {
    const courses = Array.from({ length: 5 }, (_, i) =>
      makeCourse(`c${i}`, `CSC${i}`, "CS", 100 + i * 100, [`l${i}`], 2)
    );
    const { entries } = generate(courses, VENUES_10, SLOTS_20, semester);

    // no two entries share venue+slot
    const seen = new Set<string>();
    for (const e of entries) {
      const key = `${e.venueId}:${e.slotId}`;
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    }
  });

  it("produces zero lecturer clashes", () => {
    const courses = [
      makeCourse("c1", "CSC101", "CS", 100, ["l1"], 2),
      makeCourse("c2", "CSC102", "CS", 200, ["l1"], 2), // same lecturer
    ];
    const { entries } = generate(courses, VENUES_10, SLOTS_20, semester);

    const bySlot = new Map<string, string[]>();
    for (const e of entries) {
      const existing = bySlot.get(e.slotId) ?? [];
      expect(existing.includes(e.lecturerId)).toBe(false);
      bySlot.set(e.slotId, [...existing, e.lecturerId]);
    }
  });

  it("produces zero group clashes (same dept+level)", () => {
    const courses = [
      makeCourse("c1", "CSC101", "CS", 200, ["l1"], 2),
      makeCourse("c2", "CSC102", "CS", 200, ["l2"], 2), // same group
    ];
    const { entries } = generate(courses, VENUES_10, SLOTS_20, semester);

    // c1 and c2 must never share the same slot
    const c1Slots = new Set(entries.filter((e) => e.courseId === "c1").map((e) => e.slotId));
    const c2Slots = entries.filter((e) => e.courseId === "c2").map((e) => e.slotId);
    for (const s of c2Slots) {
      expect(c1Slots.has(s)).toBe(false);
    }
  });

  it("completes 50-course generation in under 2 seconds", () => {
    const courses: CourseForGeneration[] = [];
    const depts = ["CS", "Math", "Physics", "Chemistry", "Biology"];
    const levels = [100, 200, 300, 400, 500];
    let idx = 0;
    for (const dept of depts) {
      for (const level of levels) {
        for (let i = 0; i < 2; i++) {
          courses.push(makeCourse(`c${idx}`, `${dept.slice(0, 3)}${level}${i}`, dept, level, [`l${idx}`], 2));
          idx++;
        }
      }
    }
    expect(courses).toHaveLength(50);

    const start = performance.now();
    generate(courses, VENUES_10, SLOTS_20, semester);
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(2000);
  });

  it("10 consecutive runs produce zero constraint violations each time", () => {
    const courses = Array.from({ length: 10 }, (_, i) =>
      makeCourse(`c${i}`, `CSC${i}`, "CS", 100 + (i % 5) * 100, [`l${i}`], 2)
    );

    for (let run = 0; run < 10; run++) {
      const { entries } = generate(courses, VENUES_10, SLOTS_20, `sem-${run}`);

      const venueSlots = new Set<string>();
      for (const e of entries) {
        const key = `${e.venueId}:${e.slotId}:${e.semester}`;
        expect(venueSlots.has(key)).toBe(false);
        venueSlots.add(key);
      }
    }
  });
});
