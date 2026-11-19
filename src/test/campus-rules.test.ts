import { describe, expect, it } from "vitest";
import { TEACHERS, makeSeedRoutine, studentById, type Offering } from "@/lib/campus/data";
import { checkSelection, detectRoutineIssues, maxCreditsFor } from "@/lib/campus/rules";
import { gradeFor } from "@/lib/campus/grading";

const routine = makeSeedRoutine();
const pick = (...ids: string[]) => ids.map((id) => routine.find((o) => o.id === id) as Offering);
const sectionA = routine.filter((o) => o.section === "A");
const availability = Object.fromEntries(TEACHERS.map((t) => [t.id, t.availability]));

describe("registration rules", () => {
  it("blocks CSE 2101 for Nusrat because CSE 1201 is not passed", () => {
    const res = checkSelection(studentById("210102")!, sectionA);
    expect(res.blocked.map((b) => b.offering.courseCode)).toEqual(["CSE 2101"]);
    expect(res.ok).toBe(false);
  });

  it("lets Tanvir register the full Section A load (17 credits)", () => {
    const res = checkSelection(studentById("210101")!, sectionA);
    expect(res.totalCredits).toBe(17);
    expect(res.ok).toBe(true);
  });

  it("requires at least 12 credits", () => {
    const res = checkSelection(studentById("210101")!, pick("CSE2101-A", "CSE2103-A", "CSE2105-A", "CSE2102-A"));
    expect(res.totalCredits).toBe(10);
    expect(res.errors.some((e) => e.includes("Minimum 12"))).toBe(true);
  });

  it("caps regular students at 21 credits and probation (CGPA < 2.00) at 15", () => {
    expect(maxCreditsFor(3.45)).toBe(21);
    expect(maxCreditsFor(2.0)).toBe(21);
    expect(maxCreditsFor(1.99)).toBe(15);
    const probation = { ...studentById("210101")!, cgpa: 1.8 };
    const res = checkSelection(probation, sectionA);
    expect(res.errors.some((e) => e.includes("Probation limit is 15"))).toBe(true);
  });

  it("detects a time clash between overlapping sections", () => {
    // CSE 2101-A meets Sun 10:30; CSE 2106-B lab is Sun 09:00–11:50
    const res = checkSelection(studentById("210101")!, pick("CSE2101-A", "CSE2106-B"));
    expect(res.clashes).toHaveLength(1);
  });
});

describe("routine clash engine", () => {
  it("seed routine has no teacher, room, section or availability clashes", () => {
    expect(detectRoutineIssues(routine, availability)).toEqual([]);
  });

  it("flags a double-booked room", () => {
    const bad = routine.map((o) => (o.id === "MTH2101-A" ? { ...o, meetings: [{ ...o.meetings[0], day: "Sun" as const, start: "10:30", end: "11:50", room: "Room 301" }] } : o));
    const kinds = detectRoutineIssues(bad).map((i) => i.kind);
    expect(kinds).toContain("room");
    expect(kinds).toContain("section");
  });
});

describe("grading scale", () => {
  it.each([
    [80, "A+", 4.0],
    [79.9, "A", 3.75],
    [70, "A-", 3.5],
    [65, "B+", 3.25],
    [60, "B", 3.0],
    [55, "B-", 2.75],
    [50, "C+", 2.5],
    [45, "C", 2.25],
    [40, "D", 2.0],
    [39.9, "F", 0],
  ])("%s%% is %s (%s)", (pct, letter, point) => {
    expect(gradeFor(pct).letter).toBe(letter);
    expect(gradeFor(pct).point).toBe(point);
  });
});
