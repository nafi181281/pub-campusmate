export const GRADE_SCALE = [
  { min: 80, letter: "A+", point: 4.0, range: "80% and above" },
  { min: 75, letter: "A", point: 3.75, range: "75% to less than 80%" },
  { min: 70, letter: "A-", point: 3.5, range: "70% to less than 75%" },
  { min: 65, letter: "B+", point: 3.25, range: "65% to less than 70%" },
  { min: 60, letter: "B", point: 3.0, range: "60% to less than 65%" },
  { min: 55, letter: "B-", point: 2.75, range: "55% to less than 60%" },
  { min: 50, letter: "C+", point: 2.5, range: "50% to less than 55%" },
  { min: 45, letter: "C", point: 2.25, range: "45% to less than 50%" },
  { min: 40, letter: "D", point: 2.0, range: "40% to less than 45%" },
  { min: 0, letter: "F", point: 0.0, range: "Below 40%" },
] as const;

export function gradeFor(percent: number) {
  const p = Math.max(0, Math.min(100, percent));
  return GRADE_SCALE.find((g) => p >= g.min) ?? GRADE_SCALE[GRADE_SCALE.length - 1]!;
}
