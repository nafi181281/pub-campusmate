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

  it("lets Tanvir register the regular Section A load (20 credits, without the CSE 2101 backlog)", () => {
    const regular = sectionA.filter((o) => o.courseCode !== "CSE 2101");
    const res = checkSelection(studentById("210101")!, regular);
    expect(res.totalCredits).toBe(20);
    expect(res.ok).toBe(true);
  });

  it("requires at least 12 credits", () => {
    const res = checkSelection(studentById("210101")!, pick("CSE2101-A", "CSE2105-A", "CSE1201-A", "CSE2106-A"));
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
    // CSE 2105-A meets Sat 09:30–12:00; CHM 2101-B lab is Sat 09:30–10:45
    const res = checkSelection(studentById("210101")!, pick("CSE2105-A", "CHM2101-B"));
    expect(res.clashes).toHaveLength(1);
  });
});

describe("routine clash engine", () => {
  it("seed routine has no teacher, room, section or availability clashes", () => {
    expect(detectRoutineIssues(routine, availability)).toEqual([]);
  });

  it("flags a double-booked room", () => {
    const bad = routine.map((o) => (o.id === "MTH2101-A" ? { ...o, meetings: [{ ...o.meetings[0], day: "Sat" as const, start: "09:30", end: "10:45", room: "NB-504" }] } : o));
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
