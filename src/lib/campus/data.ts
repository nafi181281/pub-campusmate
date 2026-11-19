// Demo data for PUB CampusMate — CSE 2nd Year 1st Semester (OBE curriculum).

export type Day = "Sun" | "Mon" | "Tue" | "Wed" | "Thu";
export const DAYS: Day[] = ["Sun", "Mon", "Tue", "Wed", "Thu"];
export const DAY_LABEL: Record<Day, string> = {
  Sun: "Sunday",
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
};

export const SLOTS = [
  { id: "S1", start: "09:00", end: "10:20" },
  { id: "S2", start: "10:30", end: "11:50" },
  { id: "S3", start: "12:00", end: "13:20" },
  { id: "S4", start: "13:30", end: "14:50" },
  { id: "S5", start: "15:00", end: "16:30" },
] as const;

export const THEORY_ROOMS = ["Room 301", "Room 302", "Room 405"] as const;
export const LAB_ROOMS = ["Software Lab 1", "Database Lab", "Network & Hardware Lab"] as const;
export const ROOMS = [...THEORY_ROOMS, ...LAB_ROOMS];

export type Course = {
  code: string;
  title: string;
  credits: number;
  kind: "theory" | "lab";
  prereq?: { code: string; title: string };
};

export const COURSES: Course[] = [
  { code: "CSE 2101", title: "Design and Analysis of Algorithms", credits: 3, kind: "theory", prereq: { code: "CSE 1201", title: "Data Structures" } },
  { code: "CSE 2102", title: "Design and Analysis of Algorithms Sessional", credits: 1, kind: "lab" },
  { code: "CSE 2103", title: "Database Management Systems", credits: 3, kind: "theory", prereq: { code: "CSE 1101", title: "Structured Programming" } },
  { code: "CSE 2104", title: "Database Management Systems Sessional", credits: 1, kind: "lab" },
  { code: "CSE 2105", title: "Digital Electronics", credits: 3, kind: "theory" },
  { code: "CSE 2106", title: "Digital Electronics Sessional", credits: 1, kind: "lab" },
  { code: "MTH 2101", title: "Linear Algebra, Vector Analysis & Co-ordinate Geometry", credits: 3, kind: "theory" },
  { code: "SS 2101", title: "Engineering Economics", credits: 2, kind: "theory" },
];

export const courseByCode = (code: string) => COURSES.find((c) => c.code === code);

export type Availability = { days: Day[]; start: string; end: string };

export type Teacher = {
  id: string;
  name: string;
  designation: string;
  core: boolean;
  availability: Availability;
};

export const TEACHERS: Teacher[] = [
  { id: "habib", name: "Md. Habib Ehsanul Hoque", designation: "Assistant Professor & Head, Dept. of CSE", core: true, availability: { days: ["Sun", "Mon", "Tue", "Wed", "Thu"], start: "10:00", end: "16:00" } },
  { id: "moslema", name: "Moslema Jahan", designation: "Assistant Professor, Dept. of CSE", core: true, availability: { days: ["Sun", "Tue", "Wed"], start: "11:00", end: "15:00" } },
  { id: "indraneel", name: "Indraneel Misra", designation: "Assistant Professor, Dept. of CSE", core: true, availability: { days: ["Mon", "Wed", "Thu"], start: "09:00", end: "13:00" } },
  { id: "cse-lab", name: "CSE Lab Instructor", designation: "Lab Instructor, Dept. of CSE", core: false, availability: { days: ["Sun", "Mon", "Tue", "Wed", "Thu"], start: "09:00", end: "16:30" } },
  { id: "math", name: "Mathematics Faculty", designation: "Dept. of Mathematics", core: false, availability: { days: ["Sun", "Mon", "Tue", "Wed", "Thu"], start: "09:00", end: "16:30" } },
  { id: "econ", name: "Economics Faculty", designation: "Dept. of Social Science", core: false, availability: { days: ["Sun", "Mon", "Tue", "Wed", "Thu"], start: "09:00", end: "16:30" } },
];

export const teacherById = (id: string) => TEACHERS.find((t) => t.id === id);

export type Meeting = { day: Day; start: string; end: string; room: string };

export type Offering = {
  id: string;
  courseCode: string;
  section: "A" | "B";
  teacherId: string;
  meetings: Meeting[];
};

const m = (day: Day, from: number, to: number, room: string): Meeting => ({
  day,
  start: SLOTS[from - 1]!.start,
  end: SLOTS[to - 1]!.end,
  room,
});

export function makeSeedRoutine(): Offering[] {
  return [
    // Section A
    { id: "CSE2101-A", courseCode: "CSE 2101", section: "A", teacherId: "habib", meetings: [m("Sun", 2, 2, "Room 301"), m("Tue", 2, 2, "Room 301")] },
    { id: "CSE2102-A", courseCode: "CSE 2102", section: "A", teacherId: "habib", meetings: [m("Thu", 3, 4, "Software Lab 1")] },
    { id: "CSE2103-A", courseCode: "CSE 2103", section: "A", teacherId: "moslema", meetings: [m("Sun", 3, 3, "Room 405"), m("Tue", 3, 3, "Room 405")] },
    { id: "CSE2104-A", courseCode: "CSE 2104", section: "A", teacherId: "moslema", meetings: [m("Wed", 3, 4, "Database Lab")] },
    { id: "CSE2105-A", courseCode: "CSE 2105", section: "A", teacherId: "indraneel", meetings: [m("Mon", 1, 1, "Room 301"), m("Thu", 1, 1, "Room 301")] },
    { id: "CSE2106-A", courseCode: "CSE 2106", section: "A", teacherId: "indraneel", meetings: [m("Wed", 1, 2, "Network & Hardware Lab")] },
    { id: "MTH2101-A", courseCode: "MTH 2101", section: "A", teacherId: "math", meetings: [m("Mon", 2, 2, "Room 405"), m("Tue", 4, 4, "Room 301")] },
    { id: "SS2101-A", courseCode: "SS 2101", section: "A", teacherId: "econ", meetings: [m("Sun", 4, 4, "Room 301")] },
    // Section B
    { id: "CSE2101-B", courseCode: "CSE 2101", section: "B", teacherId: "habib", meetings: [m("Mon", 3, 3, "Room 302"), m("Wed", 2, 2, "Room 302")] },
    { id: "CSE2102-B", courseCode: "CSE 2102", section: "B", teacherId: "habib", meetings: [m("Wed", 3, 4, "Software Lab 1")] },
    { id: "CSE2103-B", courseCode: "CSE 2103", section: "B", teacherId: "moslema", meetings: [m("Sun", 4, 4, "Room 405"), m("Tue", 4, 4, "Room 405")] },
    { id: "CSE2104-B", courseCode: "CSE 2104", section: "B", teacherId: "cse-lab", meetings: [m("Thu", 3, 4, "Database Lab")] },
    { id: "CSE2105-B", courseCode: "CSE 2105", section: "B", teacherId: "indraneel", meetings: [m("Mon", 2, 2, "Room 302"), m("Thu", 2, 2, "Room 302")] },
    { id: "CSE2106-B", courseCode: "CSE 2106", section: "B", teacherId: "cse-lab", meetings: [m("Sun", 1, 2, "Network & Hardware Lab")] },
    { id: "MTH2101-B", courseCode: "MTH 2101", section: "B", teacherId: "math", meetings: [m("Tue", 2, 2, "Room 405"), m("Thu", 1, 1, "Room 302")] },
    { id: "SS2101-B", courseCode: "SS 2101", section: "B", teacherId: "econ", meetings: [m("Mon", 4, 4, "Room 301")] },
  ];
}

export type TranscriptEntry = { code: string; title: string; grade: string };

export type Student = {
  id: string;
  name: string;
  nameBn: string;
  cgpa: number;
  passed: string[];
  transcript: TranscriptEntry[];
  bloodGroup: string;
  section: "A" | "B";
  completedCredits: number;
  phone: string;
  note: string;
};

const firstYear = (ds: string): TranscriptEntry[] => [
  { code: "CSE 1101", title: "Structured Programming", grade: "A" },
  { code: "CSE 1201", title: "Data Structures", grade: ds },
  { code: "MTH 1101", title: "Differential & Integral Calculus", grade: "B+" },
  { code: "PHY 1101", title: "Physics I", grade: "A-" },
  { code: "EEE 1101", title: "Basic Electrical Engineering", grade: "B" },
  { code: "ENG 1101", title: "English Language Skills", grade: "A" },
];

export const STUDENTS: Student[] = [
  {
    id: "210101",
    name: "Tanvir Ahmed",
    nameBn: "তানভীর আহমেদ",
    cgpa: 3.45,
    passed: ["CSE 1101", "CSE 1201", "MTH 1101", "PHY 1101", "EEE 1101", "ENG 1101"],
    transcript: firstYear("A-"),
    bloodGroup: "B+",
    section: "A",
    completedCredits: 38,
    phone: "+880 1711-210101",
    note: "All prerequisites clear — normal registration.",
  },
  {
    id: "210102",
    name: "Nusrat Jahan",
    nameBn: "নুসরাত জাহান",
    cgpa: 2.7,
    passed: ["CSE 1101", "MTH 1101", "PHY 1101", "EEE 1101", "ENG 1101"],
    transcript: firstYear("F"),
    bloodGroup: "O+",
    section: "A",
    completedCredits: 35,
    phone: "+880 1811-210102",
    note: "Failed CSE 1201 — CSE 2101 is blocked by prerequisite check.",
  },
  {
    id: "210103",
    name: "Arifur Rahman",
    nameBn: "আরিফুর রহমান",
    cgpa: 3.82,
    passed: ["CSE 1101", "CSE 1201", "MTH 1101", "PHY 1101", "EEE 1101", "ENG 1101"],
    transcript: firstYear("A+").map((t) => ({ ...t, grade: t.grade === "B" ? "A" : t.grade === "B+" ? "A+" : t.grade })),
    bloodGroup: "A+",
    section: "B",
    completedCredits: 40,
    phone: "+880 1911-210103",
    note: "High achiever — 1st year complete, full credit load.",
  },
];

export const studentById = (id: string) => STUDENTS.find((s) => s.id === id);

export const ADVISOR = {
  name: "Dr. Imtiazul Alam Mahfuz",
  designation: "Students Welfare Adviser / Department Advisor",
};

export const SEMESTER = "Spring 2027";

export type NoticeCategory = "Academic" | "Exam" | "Administration" | "Event" | "Career";
export type Notice = { id: string; title: string; titleBn?: string; date: string; category: NoticeCategory; body: string; pinned?: boolean };

export const NOTICES: Notice[] = [
  { id: "n1", title: "Spring 2027 course registration is open for CSE 2nd Year", titleBn: "স্প্রিং ২০২৭ কোর্স রেজিস্ট্রেশন চলছে", date: "2026-11-15", category: "Academic", pinned: true, body: "Register through CampusMate and submit for advisor approval by 30 November 2026. Minimum 12, maximum 21 credits." },
  { id: "n2", title: "Midterm examination routine published", titleBn: "মিডটার্ম পরীক্ষার রুটিন প্রকাশিত", date: "2026-11-12", category: "Exam", body: "Midterm examinations begin on 10 January 2027. Download the full schedule below." },
  { id: "n3", title: "First tuition installment (30%) due at semester start", date: "2026-11-10", category: "Administration", body: "Pay 30% of tuition at semester start. The remaining 70% is due in two installments before Midterm and Final examinations." },
  { id: "n4", title: "Course drop window: first 2 weeks without penalty", date: "2026-11-08", category: "Academic", body: "Students may drop courses within the first two weeks of classes without any penalty fee via an add/drop petition." },
  { id: "n5", title: "PUB Intra-University Programming Contest 2026", titleBn: "আন্তঃবিশ্ববিদ্যালয় প্রোগ্রামিং প্রতিযোগিতা", date: "2026-11-05", category: "Event", body: "Teams of three. Registration at the CSE office, Academic Building, by 25 November." },
  { id: "n6", title: "Software engineering internship drive — final-year and 2nd-year students", date: "2026-11-03", category: "Career", body: "Career Hub is hosting an internship drive with local IT firms. See Career Hub for details." },
  { id: "n7", title: "Library extended hours during examinations", date: "2026-10-28", category: "Administration", body: "The central library will remain open until 9:00 PM from 1 January 2027." },
  { id: "n8", title: "Blood donation camp at the campus field", date: "2026-10-20", category: "Event", body: "Organised by the Students Welfare office. All blood groups welcome." },
];

export type ExamEntry = { date: string; day: string; time: string; courseCode: string; room: string };

export const EXAM_ROUTINE: ExamEntry[] = [
  { date: "2027-01-10", day: "Sunday", time: "10:00 AM – 11:30 AM", courseCode: "CSE 2101", room: "Room 301, 302" },
  { date: "2027-01-12", day: "Tuesday", time: "10:00 AM – 11:30 AM", courseCode: "CSE 2103", room: "Room 301, 302" },
  { date: "2027-01-14", day: "Thursday", time: "10:00 AM – 11:30 AM", courseCode: "CSE 2105", room: "Room 405" },
  { date: "2027-01-17", day: "Sunday", time: "10:00 AM – 11:30 AM", courseCode: "MTH 2101", room: "Room 301, 405" },
  { date: "2027-01-19", day: "Tuesday", time: "10:00 AM – 11:00 AM", courseCode: "SS 2101", room: "Room 302" },
  { date: "2027-01-21", day: "Thursday", time: "09:30 AM – 12:30 PM", courseCode: "CSE 2102 / 2104 / 2106", room: "Respective labs (lab quiz)" },
];

export type Assignment = { id: string; courseCode: string; title: string; due: string; marks: number; brief: string };

export const ASSIGNMENTS: Assignment[] = [
  { id: "a1", courseCode: "CSE 2101", title: "Asymptotic analysis problem set", due: "2026-11-28", marks: 10, brief: "Solve 8 recurrence problems using the Master theorem and recursion tree method." },
  { id: "a2", courseCode: "CSE 2103", title: "ER diagram for a university library", due: "2026-12-02", marks: 10, brief: "Design an ER diagram and convert it to a relational schema in 3NF." },
  { id: "a3", courseCode: "CSE 2105", title: "Karnaugh map simplification", due: "2026-12-05", marks: 5, brief: "Simplify four Boolean functions and implement them with NAND gates only." },
  { id: "a4", courseCode: "SS 2101", title: "Break-even analysis case study", due: "2026-12-09", marks: 10, brief: "Analyse the break-even point of a small Bogura-based manufacturing firm." },
];

export type Job = { id: string; title: string; org: string; kind: "Internship" | "Part-time" | "Full-time"; location: string; deadline: string; tags: string[] };

export const JOBS: Job[] = [
  { id: "j1", title: "Software Engineering Intern (Web)", org: "Karatoa Soft Ltd. (sample listing)", kind: "Internship", location: "Bogura · On-site", deadline: "2026-12-10", tags: ["React", "Node.js"] },
  { id: "j2", title: "Database Assistant (Part-time)", org: "PUB ICT Cell", kind: "Part-time", location: "PUB Campus", deadline: "2026-11-30", tags: ["SQL", "MS Excel"] },
  { id: "j3", title: "Junior QA Tester Intern", org: "Mohasthan Digital (sample listing)", kind: "Internship", location: "Remote", deadline: "2026-12-15", tags: ["Testing", "Documentation"] },
  { id: "j4", title: "Lab Teaching Assistant — Digital Electronics", org: "Dept. of CSE, PUB", kind: "Part-time", location: "Network & Hardware Lab", deadline: "2026-12-01", tags: ["Logic design", "Mentoring"] },
  { id: "j5", title: "Graduate Trainee — Software", org: "North Bengal IT Park (sample listing)", kind: "Full-time", location: "Bogura", deadline: "2027-01-05", tags: ["Java", "Python"] },
];

export type LostItem = { id: string; kind: "Lost" | "Found"; title: string; place: string; date: string; contact: string; resolved: boolean };

export const SEED_LOST_FOUND: LostItem[] = [
  { id: "l1", kind: "Found", title: "Black Casio scientific calculator", place: "Room 302", date: "2026-11-16", contact: "CSE office, Academic Building", resolved: false },
  { id: "l2", kind: "Lost", title: "Blue water bottle with PUB sticker", place: "Central library", date: "2026-11-15", contact: "Tanvir · 210101", resolved: false },
  { id: "l3", kind: "Found", title: "Student ID card (ID ending 0219)", place: "Canteen", date: "2026-11-14", contact: "Proctor office", resolved: false },
  { id: "l4", kind: "Lost", title: "Pen drive (32 GB, silver)", place: "Software Lab 1", date: "2026-11-12", contact: "Nusrat · 210102", resolved: true },
];
