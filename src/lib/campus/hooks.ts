import { useEffect, useState } from "react";
import { studentById, teacherById } from "./data";
import { useCampus } from "./store";

export function useCurrentStudent() {
  const id = useCampus((s) => s.studentId);
  return studentById(id)!;
}

export function useCurrentTeacher() {
  const id = useCampus((s) => s.teacherId);
  return teacherById(id)!;
}

/** Current time that ticks every `ms`; null until mounted (avoids hydration mismatch). */
export function useNow(ms = 1000) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}
