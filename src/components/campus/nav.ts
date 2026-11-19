import type { Role } from "@/lib/campus/store";

export type NavItem = { to: "/" | "/registration" | "/advisor" | "/faculty" | "/coordinator" | "/timetable" | "/helpdesk" | "/id-card" | "/attendance" | "/notices" | "/assignments" | "/lost-found"; label: string };

const common: NavItem[] = [
  { to: "/timetable", label: "Timetable" },
  { to: "/notices", label: "Notices & Exams" },
  { to: "/lost-found", label: "Lost & Found" },
  { to: "/helpdesk", label: "Jervis" },
];

export const NAV: Record<Role, NavItem[]> = {
  student: [
    { to: "/", label: "Home" },
    { to: "/registration", label: "Registration" },
    { to: "/id-card", label: "ID Card" },
    { to: "/attendance", label: "Attendance" },
    { to: "/assignments", label: "Assignments & Careers" },
    ...common,
  ],
  faculty: [
    { to: "/", label: "Home" },
    { to: "/faculty", label: "Faculty Desk" },
    { to: "/attendance", label: "QR Attendance" },
    { to: "/assignments", label: "Assignments" },
    ...common,
  ],
  advisor: [{ to: "/", label: "Home" }, { to: "/advisor", label: "Advisor Desk" }, ...common],
  coordinator: [{ to: "/", label: "Home" }, { to: "/coordinator", label: "Routine Builder" }, ...common],
};

export const ROLE_LABEL: Record<Role, string> = {
  student: "Student",
  faculty: "Faculty",
  advisor: "Academic Advisor",
  coordinator: "Dept. Coordinator",
};
