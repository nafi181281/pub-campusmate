import { STUDENTS, TEACHERS, ADVISOR } from "@/lib/campus/data";
import { useCampus } from "@/lib/campus/store";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

export function RoleSwitcher({ className }: { className?: string }) {
  const { role, studentId, teacherId, setRole, setStudent, setTeacher } = useCampus();
  const value = role === "student" ? `student:${studentId}` : role === "faculty" ? `faculty:${teacherId}` : role;

  return (
    <Select
      value={value}
      onValueChange={(v) => {
        const [r, id = ""] = v.split(":");
        if (r === "student") setStudent(id);
        else if (r === "faculty") setTeacher(id);
        else setRole(r as "advisor" | "coordinator");
      }}
    >
      <SelectTrigger aria-label="Switch demo portal" className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Student</SelectLabel>
          {STUDENTS.map((s) => (
            <SelectItem key={s.id} value={`student:${s.id}`}>
              {s.name} · {s.id}
            </SelectItem>
          ))}
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Faculty</SelectLabel>
          {TEACHERS.filter((t) => t.core).map((t) => (
            <SelectItem key={t.id} value={`faculty:${t.id}`}>
              {t.name}
            </SelectItem>
          ))}
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Academic Advisor</SelectLabel>
          <SelectItem value="advisor">{ADVISOR.name}</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Department Coordinator</SelectLabel>
          <SelectItem value="coordinator">Department Coordinator Desk</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
