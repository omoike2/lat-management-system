import { describe, it, expect } from "vitest";
import {
  checkVenueClash,
  checkLecturerClash,
  checkGroupClash,
  type EntryMinimal,
  type CourseGroup,
} from "../constraints";

const semester = "2025/2026 Second";

const entry = (overrides: Partial<EntryMinimal> = {}): EntryMinimal => ({
  courseId: "c1",
  lecturerId: "l1",
  venueId: "v1",
  slotId: "s1",
  semester,
  ...overrides,
});

describe("checkVenueClash", () => {
  it("returns false when no entries exist", () => {
    expect(checkVenueClash("v1", "s1", semester, [])).toBe(false);
  });

  it("detects clash when same venue+slot+semester occupied", () => {
    expect(checkVenueClash("v1", "s1", semester, [entry()])).toBe(true);
  });

  it("no clash when different venue", () => {
    expect(checkVenueClash("v2", "s1", semester, [entry()])).toBe(false);
  });

  it("no clash when different slot", () => {
    expect(checkVenueClash("v1", "s2", semester, [entry()])).toBe(false);
  });

  it("no clash when different semester", () => {
    expect(checkVenueClash("v1", "s1", "other", [entry()])).toBe(false);
  });
});

describe("checkLecturerClash", () => {
  it("returns false when no entries", () => {
    expect(checkLecturerClash(["l1"], "s1", semester, [])).toBe(false);
  });

  it("detects clash for same lecturer+slot+semester", () => {
    expect(checkLecturerClash(["l1"], "s1", semester, [entry()])).toBe(true);
  });

  it("detects clash when one of multiple lecturers is busy", () => {
    expect(checkLecturerClash(["l2", "l1"], "s1", semester, [entry()])).toBe(true);
  });

  it("no clash when different lecturer", () => {
    expect(checkLecturerClash(["l99"], "s1", semester, [entry()])).toBe(false);
  });

  it("no clash when different slot", () => {
    expect(checkLecturerClash(["l1"], "s2", semester, [entry()])).toBe(false);
  });
});

describe("checkGroupClash", () => {
  const courseGroupMap = new Map<string, CourseGroup>([
    ["c1", { department: "CS", level: 200 }],
    ["c2", { department: "CS", level: 200 }],
    ["c3", { department: "Math", level: 200 }],
    ["c4", { department: "CS", level: 300 }],
  ]);

  it("returns false when no entries", () => {
    expect(checkGroupClash("CS", 200, "s1", semester, [], courseGroupMap)).toBe(false);
  });

  it("detects clash when same dept+level has a class at slot", () => {
    const existing = [entry({ courseId: "c1" })];
    expect(checkGroupClash("CS", 200, "s1", semester, existing, courseGroupMap)).toBe(true);
  });

  it("detects clash via different courseId in same group", () => {
    const existing = [entry({ courseId: "c2" })];
    expect(checkGroupClash("CS", 200, "s1", semester, existing, courseGroupMap)).toBe(true);
  });

  it("no clash when different department", () => {
    const existing = [entry({ courseId: "c1" })];
    expect(checkGroupClash("Math", 200, "s1", semester, existing, courseGroupMap)).toBe(false);
  });

  it("no clash when different level", () => {
    const existing = [entry({ courseId: "c1" })];
    expect(checkGroupClash("CS", 300, "s1", semester, existing, courseGroupMap)).toBe(false);
  });

  it("no clash when different slot", () => {
    const existing = [entry({ courseId: "c1" })];
    expect(checkGroupClash("CS", 200, "s2", semester, existing, courseGroupMap)).toBe(false);
  });

  it("no clash when different semester", () => {
    const existing = [entry({ courseId: "c1" })];
    expect(checkGroupClash("CS", 200, "s1", "other", existing, courseGroupMap)).toBe(false);
  });
});
