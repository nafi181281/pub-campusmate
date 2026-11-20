// Demo data for PUB CampusMate — CSE 2nd Year 1st Semester (OBE curriculum).

export type Day = "Sat" | "Sun" | "Mon" | "Tue" | "Fri";
export const DAYS: Day[] = ["Sat", "Sun", "Mon", "Tue", "Fri"];
export const DAY_LABEL: Record<Day, string> = {
  Sat: "Saturday",
  Sun: "Sunday",
  Mon: "Monday",
  Tue: "Tuesday",
  Fri: "Friday",
};

export const SLOTS = [
  { id: "S1", start: "09:30", end: "10:45" },
  { id: "S2", start: "10:45", end: "12:00" },
  { id: "S3", start: "12:00", end: "13:15" },
  { id: "S4", start: "14:30", end: "15:45" },
] as const;

export const THEORY_ROOMS = ["NB-502", "NB-503", "NB-504", "NB-702", "NB-703"] as const;
export const LAB_ROOMS = ["NB-281", "NB-406", "NB-606", "NB-608"] as const;
export const ROOMS = [...THEORY_ROOMS, ...LAB_ROOMS];

export type Course = {
  code: string;
  title: string;
  credits: number;
  kind: "theory" | "lab";
  prereq?: { code: string; title: string };
};

export const COURSES: Course[] = [
  { code: "CSE 2105", title: "Digital Electronics", credits: 3, kind: "theory" },
  { code: "CSE 2106", title: "Digital Electronics Sessional", credits: 1, kind: "lab" },
  { code: "CSE 1201", title: "Data Structure", credits: 3, kind: "theory" },
  { code: "CSE 1202", title: "Data Structure Sessional", credits: 1, kind: "lab" },
  { code: "MTH 2101", title: "Linear Algebra, Vector Analysis and Co-ordinate Geometry", credits: 3, kind: "theory" },
  { code: "CHM 2101", title: "Chemistry", credits: 3, kind: "theory" },
  { code: "CHM 2102", title: "Chemistry Sessional", credits: 1, kind: "lab" },
  { code: "SS 2101", title: "Engineering Economics", credits: 2, kind: "theory" },
  { code: "BUS 2201", title: "Financial, Cost and Managerial Accounting", credits: 3, kind: "theory" },
  { code: "CSE 2101", title: "Design and Analysis of Algorithm", credits: 3, kind: "theory", prereq: { code: "CSE 1201", title: "Data Structure" } },
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

const ALL_DAYS: Day[] = ["Sat", "Sun", "Mon", "Tue", "Fri"];

export const TEACHERS: Teacher[] = [
  { id: "aps", name: "APS", designation: "Dept. of CSE", core: true, availability: { days: ALL_DAYS, start: "09:00", end: "16:00" } },
  { id: "amar", name: "AMAR", designation: "Dept. of CSE", core: true, availability: { days: ALL_DAYS, start: "09:00", end: "16:00" } },
  { id: "sr", name: "SR", designation: "Dept. of CSE", core: true, availability: { days: ALL_DAYS, start: "09:00", end: "16:00" } },
  { id: "dsr", name: "DSR", designation: "Dept. of Chemistry", core: false, availability: { days: ALL_DAYS, start: "09:00", end: "16:00" } },
  { id: "mj", name: "MJ", designation: "Dept. of Mathematics", core: false, availability: { days: ALL_DAYS, start: "09:00", end: "16:00" } },
  { id: "as", name: "AS", designation: "Dept. of Social Science", core: false, availability: { days: ALL_DAYS, start: "09:00", end: "16:00" } },
  { id: "bnr", name: "BNR", designation: "Dept. of Business Administration", core: false, availability: { days: ALL_DAYS, start: "09:00", end: "16:00" } },
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

// Matches the official PUB CSE Class Routine, Summer 2026 (27th batch, 2nd Year 1st Semester).
export function makeSeedRoutine(): Offering[] {
  return [
    // Section A
    { id: "CSE2105-A", courseCode: "CSE 2105", section: "A", teacherId: "amar", meetings: [m("Sat", 1, 2, "NB-504")] },
    { id: "BUS2201-A", courseCode: "BUS 2201", section: "A", teacherId: "bnr", meetings: [m("Sat", 3, 3, "NB-703"), m("Mon", 2, 2, "NB-702")] },
    { id: "CSE2101-A", courseCode: "CSE 2101", section: "A", teacherId: "aps", meetings: [m("Sat", 4, 4, "NB-281")] },
    { id: "CSE1201-A", courseCode: "CSE 1201", section: "A", teacherId: "aps", meetings: [m("Sun", 1, 1, "NB-504")] },
    { id: "CHM2102-A", courseCode: "CHM 2102", section: "A", teacherId: "dsr", meetings: [m("Sun", 2, 2, "NB-606")] },
    { id: "CHM2101-A", courseCode: "CHM 2101", section: "A", teacherId: "dsr", meetings: [m("Sun", 3, 3, "NB-606"), m("Mon", 4, 4, "NB-606")] },
    { id: "CSE1202-A", courseCode: "CSE 1202", section: "A", teacherId: "aps", meetings: [m("Sun", 4, 4, "NB-406")] },
    { id: "MTH2101-A", courseCode: "MTH 2101", section: "A", teacherId: "mj", meetings: [m("Mon", 1, 1, "NB-504"), m("Tue", 3, 3, "NB-504")] },
    { id: "CSE2106-A", courseCode: "CSE 2106", section: "A", teacherId: "sr", meetings: [m("Tue", 1, 1, "NB-608")] },
    { id: "SS2101-A", courseCode: "SS 2101", section: "A", teacherId: "as", meetings: [m("Tue", 2, 2, "NB-503")] },
    // Section B
    { id: "CSE2105-B", courseCode: "CSE 2105", section: "B", teacherId: "amar", meetings: [m("Sun", 2, 3, "NB-503")] },
    { id: "BUS2201-B", courseCode: "BUS 2201", section: "B", teacherId: "bnr", meetings: [m("Sun", 1, 1, "NB-702"), m("Fri", 1, 1, "NB-702")] },
    { id: "CSE2101-B", courseCode: "CSE 2101", section: "B", teacherId: "aps", meetings: [m("Sat", 3, 3, "NB-503")] },
    { id: "CSE1201-B", courseCode: "CSE 1201", section: "B", teacherId: "aps", meetings: [m("Mon", 1, 1, "NB-503")] },
    { id: "CHM2102-B", courseCode: "CHM 2102", section: "B", teacherId: "dsr", meetings: [m("Mon", 2, 2, "NB-606")] },
    { id: "CHM2101-B", courseCode: "CHM 2101", section: "B", teacherId: "dsr", meetings: [m("Mon", 3, 3, "NB-606"), m("Sat", 1, 1, "NB-606")] },
    { id: "CSE1202-B", courseCode: "CSE 1202", section: "B", teacherId: "aps", meetings: [m("Mon", 4, 4, "NB-406")] },
    { id: "MTH2101-B", courseCode: "MTH 2101", section: "B", teacherId: "mj", meetings: [m("Sat", 2, 2, "NB-502"), m("Tue", 4, 4, "NB-504")] },
    { id: "CSE2106-B", courseCode: "CSE 2106", section: "B", teacherId: "sr", meetings: [m("Fri", 2, 2, "NB-608")] },
    { id: "SS2101-B", courseCode: "SS 2101", section: "B", teacherId: "as", meetings: [m("Fri", 3, 3, "NB-503")] },
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
  { date: "2027-01-10", day: "Sunday", time: "10:00 AM – 11:30 AM", courseCode: "CSE 2101", room: "NB-503, 504" },
  { date: "2027-01-12", day: "Tuesday", time: "10:00 AM – 11:30 AM", courseCode: "CSE 1201", room: "NB-503, 504" },
  { date: "2027-01-14", day: "Thursday", time: "10:00 AM – 11:30 AM", courseCode: "CSE 2105", room: "NB-504" },
  { date: "2027-01-17", day: "Sunday", time: "10:00 AM – 11:30 AM", courseCode: "MTH 2101", room: "NB-502, 504" },
  { date: "2027-01-19", day: "Tuesday", time: "10:00 AM – 11:00 AM", courseCode: "SS 2101", room: "NB-503" },
  { date: "2027-01-21", day: "Thursday", time: "09:30 AM – 12:30 PM", courseCode: "CSE 1202 / 2106 / CHM 2102", room: "Respective labs (lab quiz)" },
];

export type Assignment = { id: string; courseCode: string; title: string; due: string; marks: number; brief: string };

export const ASSIGNMENTS: Assignment[] = [
  { id: "a1", courseCode: "CSE 2101", title: "Asymptotic analysis problem set", due: "2026-11-28", marks: 10, brief: "Solve 8 recurrence problems using the Master theorem and recursion tree method." },
  { id: "a2", courseCode: "CSE 1201", title: "Linked list and stack implementation", due: "2026-12-02", marks: 10, brief: "Implement a doubly linked list in C and use it to build a stack and a queue." },
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
  { id: "l1", kind: "Found", title: "Black Casio scientific calculator", place: "NB-503", date: "2026-11-16", contact: "CSE office, Academic Building", resolved: false },
  { id: "l2", kind: "Lost", title: "Blue water bottle with PUB sticker", place: "Central library", date: "2026-11-15", contact: "Tanvir · 210101", resolved: false },
  { id: "l3", kind: "Found", title: "Student ID card (ID ending 0219)", place: "Canteen", date: "2026-11-14", contact: "Proctor office", resolved: false },
  { id: "l4", kind: "Lost", title: "Pen drive (32 GB, silver)", place: "NB-406", date: "2026-11-12", contact: "Nusrat · 210102", resolved: true },
];
