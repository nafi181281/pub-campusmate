import { COURSES, courseByCode, teacherById, type Availability, type Course, type Meeting, type Offering, type Student, type Teacher } from "./data";
import { toMinutes } from "./format";

export const MIN_CREDITS = 12;
export const MAX_CREDITS = 21;
export const PROBATION_MAX_CREDITS = 15;
export const PROBATION_CGPA = 2.0;

export const isOnProbation = (cgpa: number) => cgpa < PROBATION_CGPA;
export const maxCreditsFor = (cgpa: number) => (isOnProbation(cgpa) ? PROBATION_MAX_CREDITS : MAX_CREDITS);

/** Returns the missing prerequisite, or null when the student may take the course. */
export function missingPrereq(course: Course, passed: string[]) {
  if (!course.prereq) return null;
  return passed.includes(course.prereq.code) ? null : course.prereq;
}

export function meetingsOverlap(a: Meeting, b: Meeting) {
  return a.day === b.day && toMinutes(a.start) < toMinutes(b.end) && toMinutes(b.start) < toMinutes(a.end);
}

export type StudentClash = { a: Offering; b: Offering; day: string; start: string; end: string };

export function findStudentClashes(selected: Offering[]): StudentClash[] {
  const out: StudentClash[] = [];
  for (let i = 0; i < selected.length; i++) {
    for (let j = i + 1; j < selected.length; j++) {
      const a = selected[i]!;
      const b = selected[j]!;
      for (const ma of a.meetings) {
        for (const mb of b.meetings) {
          if (meetingsOverlap(ma, mb)) {
            out.push({ a, b, day: ma.day, start: ma.start, end: ma.end });
          }
        }
      }
    }
  }
  return out;
}

export type SelectionCheck = {
  totalCredits: number;
  maxCredits: number;
  errors: string[];
  clashes: StudentClash[];
  blocked: { offering: Offering; reason: string }[];
  ok: boolean;
};

export function checkSelection(student: Student, selected: Offering[]): SelectionCheck {
  const errors: string[] = [];
  const blocked: SelectionCheck["blocked"] = [];
  let totalCredits = 0;
  for (const o of selected) {
    const c = courseByCode(o.courseCode);
    if (!c) continue;
    totalCredits += c.credits;
    const pre = missingPrereq(c, student.passed);
    if (pre) {
      const reason = `${c.code} requires ${pre.code} ${pre.title}, which is not passed.`;
      blocked.push({ offering: o, reason });
      errors.push(reason);
    }
  }
  const codes = selected.map((o) => o.courseCode);
  const dup = codes.filter((c, i) => codes.indexOf(c) !== i);
  if (dup.length) errors.push(`Only one section allowed per course (${[...new Set(dup)].join(", ")}).`);

  const maxCredits = maxCreditsFor(student.cgpa);
  if (totalCredits < MIN_CREDITS) errors.push(`Minimum ${MIN_CREDITS} credits required (selected ${totalCredits}).`);
  if (totalCredits > maxCredits)
    errors.push(
      isOnProbation(student.cgpa)
        ? `Probation limit is ${PROBATION_MAX_CREDITS} credits (selected ${totalCredits}).`
        : `Maximum ${MAX_CREDITS} credits allowed (selected ${totalCredits}).`,
    );
  const clashes = findStudentClashes(selected);
  for (const cl of clashes) errors.push(`Schedule clash: ${cl.a.courseCode} (${cl.a.section}) and ${cl.b.courseCode} (${cl.b.section}) on ${cl.day}.`);
  return { totalCredits, maxCredits, errors, clashes, blocked, ok: errors.length === 0 };
}

export type RoutineIssue = {
  kind: "teacher" | "room" | "section" | "availability";
  offeringIds: string[];
  day: string;
  message: string;
};

function withinAvailability(meeting: Meeting, av: Availability) {
  return av.days.includes(meeting.day) && toMinutes(meeting.start) >= toMinutes(av.start) && toMinutes(meeting.end) <= toMinutes(av.end);
}

export function detectRoutineIssues(offerings: Offering[], availability?: Record<string, Availability>, teachers?: Teacher[]): RoutineIssue[] {
  const issues: RoutineIssue[] = [];
  const flat = offerings.flatMap((o) => o.meetings.map((mt, idx) => ({ o, mt, idx })));
  for (let i = 0; i < flat.length; i++) {
    for (let j = i + 1; j < flat.length; j++) {
      const A = flat[i]!;
      const B = flat[j]!;
      if (A.o.id === B.o.id) continue;
      if (!meetingsOverlap(A.mt, B.mt)) continue;
      const ids = [A.o.id, B.o.id];
      if (A.o.teacherId === B.o.teacherId) {
        const t = (teachers ? teachers.find((x) => x.id === A.o.teacherId) : teacherById(A.o.teacherId))?.name ?? A.o.teacherId;
        issues.push({ kind: "teacher", offeringIds: ids, day: A.mt.day, message: `${t} is double-booked: ${A.o.courseCode}-${A.o.section} and ${B.o.courseCode}-${B.o.section} on ${A.mt.day}.` });
      }
      if (A.mt.room === B.mt.room) {
        issues.push({ kind: "room", offeringIds: ids, day: A.mt.day, message: `${A.mt.room} is double-booked: ${A.o.courseCode}-${A.o.section} and ${B.o.courseCode}-${B.o.section} on ${A.mt.day}.` });
      }
      if (A.o.section === B.o.section) {
        issues.push({ kind: "section", offeringIds: ids, day: A.mt.day, message: `Section ${A.o.section} has two classes at once: ${A.o.courseCode} and ${B.o.courseCode} on ${A.mt.day}.` });
      }
    }
  }
  if (availability) {
    for (const o of offerings) {
      const av = availability[o.teacherId];
      if (!av) continue;
      for (const mt of o.meetings) {
        if (!withinAvailability(mt, av)) {
          const t = teacherById(o.teacherId)?.name ?? o.teacherId;
          issues.push({ kind: "availability", offeringIds: [o.id], day: mt.day, message: `${o.courseCode}-${o.section} on ${mt.day} ${mt.start}–${mt.end} is outside ${t}'s availability.` });
        }
      }
    }
  }
  return issues;
}

export function totalProgramCredits() {
  return COURSES.reduce((s, c) => s + c.credits, 0);
}

export function contactHours(o: Offering) {
  return o.meetings.reduce((s, mt) => s + (toMinutes(mt.end) - toMinutes(mt.start)) / 60, 0);
}
