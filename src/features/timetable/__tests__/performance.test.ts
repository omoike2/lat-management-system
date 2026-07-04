import { describe, it, expect } from "vitest";
import { generate } from "../generator";
import {
  checkVenueClash,
  checkLecturerClash,
  checkGroupClash,
  type EntryMinimal,
} from "../constraints";
import type { CourseForGeneration } from "../types";
import type { Venue, TimeSlot } from "@prisma/client";

function makeSlot(id: string, day: number, start: string): TimeSlot {
  return { id, dayOfWeek: day, startTime: start, endTime: "10:00", available: true };
}

function makeVenue(id: string, capacity = 200): Venue {
  return { id, name: id, capacity, type: "LECTURE_HALL" };
}

function makeLecturer(id: string) {
  return {
    lecturer: {
      id,
      name: `Dr. ${id}`,
      email: `${id}@test.edu`,
      department: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };
}

function makeCourse(
  id: string,
  dept: string,
  level: number,
  lecturerId: string,
  freq = 2
): CourseForGeneration {
  return {
    id,
    code: `${dept.slice(0, 3).toUpperCase()}${level}${id}`,
    title: `${dept} ${level} ${id}`,
    department: dept,
    level,
    units: 3,
    weeklyFreq: freq,
    createdAt: new Date(),
    updatedAt: new Date(),
    lecturers: [makeLecturer(lecturerId)],
  };
}

const DEPTS = ["CS", "Math", "Physics", "Chemistry", "Biology"];
const LEVELS = [100, 200, 300, 400, 500];

const SLOTS_20: TimeSlot[] = [];
for (let day = 0; day < 5; day++) {
  for (const [i, t] of ["08:00", "10:00", "14:00", "16:00"].entries()) {
    SLOTS_20.push(makeSlot(`s${day * 4 + i}`, day, t));
  }
}

const VENUES_10 = Array.from({ length: 10 }, (_, i) => makeVenue(`v${i}`));

const COURSES_50: CourseForGeneration[] = [];
let idx = 0;
for (const dept of DEPTS) {
  for (const level of LEVELS) {
    for (let n = 0; n < 2; n++) {
      COURSES_50.push(makeCourse(`c${idx}`, dept, level, `l${idx}`, 2));
      idx++;
    }
  }
}

describe("Timetable generator — performance & integrity", () => {
  it("all assigned entries reference valid input IDs", () => {
    const slotIds = new Set(SLOTS_20.map((s) => s.id));
    const venueIds = new Set(VENUES_10.map((v) => v.id));
    const lecturerIds = new Set(COURSES_50.flatMap((c) => c.lecturers.map((lc) => lc.lecturer.id)));
    const courseIds = new Set(COURSES_50.map((c) => c.id));

    const { entries } = generate(COURSES_50, VENUES_10, SLOTS_20, "perf-ref");

    for (const e of entries) {
      expect(slotIds.has(e.slotId), `slotId ${e.slotId} not in input`).toBe(true);
      expect(venueIds.has(e.venueId), `venueId ${e.venueId} not in input`).toBe(true);
      expect(lecturerIds.has(e.lecturerId), `lecturerId ${e.lecturerId} not in input`).toBe(true);
      expect(courseIds.has(e.courseId), `courseId ${e.courseId} not in input`).toBe(true);
    }
  });

  it("constraint checkers confirm zero violations in generated output", () => {
    const { entries } = generate(COURSES_50, VENUES_10, SLOTS_20, "perf-constraints");
    const semester = "perf-constraints";

    const courseGroupMap = new Map(
      COURSES_50.map((c) => [c.id, { department: c.department, level: c.level }])
    );

    const minimal: EntryMinimal[] = entries.map((e) => ({
      courseId: e.courseId,
      lecturerId: e.lecturerId,
      venueId: e.venueId,
      slotId: e.slotId,
      semester: e.semester,
    }));

    for (let i = 0; i < minimal.length; i++) {
      const rest = minimal.filter((_, j) => j !== i);
      const e = minimal[i];

      expect(
        checkVenueClash(e.venueId, e.slotId, semester, rest),
        `venue clash at entry ${i}`
      ).toBe(false);

      expect(
        checkLecturerClash([e.lecturerId], e.slotId, semester, rest),
        `lecturer clash at entry ${i}`
      ).toBe(false);

      const group = courseGroupMap.get(e.courseId)!;
      expect(
        checkGroupClash(group.department, group.level, e.slotId, semester, rest, courseGroupMap),
        `group clash at entry ${i}`
      ).toBe(false);
    }
  });

  it("reminder flag defaults to false on all generated entries", () => {
    const { entries } = generate(COURSES_50, VENUES_10, SLOTS_20, "perf-flags");
    for (const e of entries) {
      expect(e.reminderSent).toBe(false);
    }
  });
});
