import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpenCheck, CalendarDays, ClipboardCheck, IdCard, Megaphone, QrCode, Search, Briefcase, Users, LayoutGrid } from "lucide-react";
import { NOTICES, SEMESTER, STUDENTS, ADVISOR, COURSES } from "@/lib/campus/data";
import { useCampus } from "@/lib/campus/store";
import { useCurrentStudent, useCurrentTeacher } from "@/lib/campus/hooks";
import { fmtDate } from "@/lib/campus/format";
import { detectRoutineIssues } from "@/lib/campus/rules";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/campus/StatusBadge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PUB CampusMate — Smart Campus Companion | Pundra University" },
      { name: "description", content: "Academic planning, course registration with prerequisite and clash checks, timetables and a bilingual AI assistant, Jervis, for Pundra University of Science & Technology." },
      { property: "og:title", content: "PUB CampusMate — Smart Campus Companion" },
      { property: "og:description", content: "একাডেমিক প্ল্যানিং, কোর্স রেজিস্ট্রেশন এবং AI হেল্পডেস্ক — Pundra University of Science & Technology, Bogura." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const MODULES = [
  { to: "/registration", icon: BookOpenCheck, title: "Course Registration", bn: "কোর্স রেজিস্ট্রেশন", text: "Prerequisite, credit-limit and clash checks in real time." },
  { to: "/timetable", icon: CalendarDays, title: "Weekly Timetable", bn: "সাপ্তাহিক রুটিন", text: "Saturday–Tuesday & Friday grid with rooms, labs and instructors." },
  { to: "/helpdesk", icon: null, title: "Jervis", bn: "জারভিস", text: "Ask about grading, probation, fees — বাংলা or English." },
  { to: "/id-card", icon: IdCard, title: "Digital ID Card", bn: "ডিজিটাল আইডি কার্ড", text: "Flip card with QR code, barcode and blood group." },
  { to: "/attendance", icon: QrCode, title: "QR Attendance", bn: "কিউআর হাজিরা", text: "Time-expiring session codes for quick check-in." },
  { to: "/notices", icon: Megaphone, title: "Notices & Exams", bn: "নোটিশ ও পরীক্ষা", text: "Official announcements and midterm schedule download." },
  { to: "/assignments", icon: Briefcase, title: "Assignments & Careers", bn: "অ্যাসাইনমেন্ট ও ক্যারিয়ার", text: "Submit coursework, browse internships and jobs." },
  { to: "/lost-found", icon: Search, title: "Lost & Found", bn: "হারানো ও প্রাপ্তি", text: "Quick campus board for misplaced items." },
] as const;

function Index() {
  return (
    <>
      <Hero />
      <PortalToday />
      <section className="mx-auto max-w-7xl px-4 pt-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-royal">Campus companion</p>
            <h2 className="mt-1 text-2xl font-bold text-primary md:text-3xl">Everything for the semester, in one place</h2>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MODULES.map((m) => (
            <Link key={m.to} to={m.to} className="group rounded-lg border bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-royal hover:shadow-lift">
              {m.icon ? (
                <span className="inline-flex size-10 items-center justify-center rounded-md bg-accent text-royal group-hover:bg-royal group-hover:text-royal-foreground">
                  <m.icon className="size-5" />
                </span>
              ) : (
                <span className="inline-flex size-10" aria-hidden />
              )}
              <h3 className="mt-4 font-sans text-base font-semibold text-foreground">{m.title}</h3>
              <p className="text-sm text-royal">{m.bn}</p>
              <p className="mt-2 text-sm text-muted-foreground">{m.text}</p>
            </Link>
          ))}
        </div>
      </section>
      <NoticesPreview />
    </>
  );
}

function Hero() {
  const role = useCampus((s) => s.role);
  return (
    <section className="relative isolate overflow-hidden bg-slate-900">
      <img
        src="/versity.png"
        alt="Aerial view of the Pundra University of Science & Technology campus in Bogura"[cite: 1]
        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover opacity-45"
      />
      <div className="pointer-events-none absolute inset-0 z-10 bg-slate-950/60" />
      <div className="relative z-20 mx-auto max-w-7xl px-4 py-20 md:py-28">
        <p className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-amber">
          {SEMESTER} · Department of CSE
        </p>
        <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight text-primary-foreground md:text-6xl">
          Learn for Life
          <span className="block text-2xl font-semibold text-primary-foreground/85 md:text-3xl">Pundra University of Science & Technology</span>
        </h1>
        <p className="mt-4 max-w-2xl text-base text-primary-foreground/80 md:text-lg">
          একাডেমিক প্ল্যানিং, কোর্স রেজিস্ট্রেশন এবং AI হেল্পডেস্ক সম্বলিত স্মার্ট ক্যাম্পাস কম্প্যানিয়ন।
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {role === "student" && (
            <Button asChild size="lg" className="bg-amber text-amber-foreground hover:bg-amber/90">
              <Link to="/registration">Register courses <ArrowRight /></Link>
            </Button>
          )}
          {role === "faculty" && (
            <Button asChild size="lg" className="bg-amber text-amber-foreground hover:bg-amber/90">
              <Link to="/faculty">Open faculty desk <ArrowRight /></Link>
            </Button>
          )}
          {role === "advisor" && (
            <Button asChild size="lg" className="bg-amber text-amber-foreground hover:bg-amber/90">
              <Link to="/advisor">Review registrations <ArrowRight /></Link>
            </Button>
          )}
          {role === "coordinator" && (
            <Button asChild size="lg" className="bg-amber text-amber-foreground hover:bg-amber/90">
              <Link to="/coordinator">Build the routine <ArrowRight /></Link>
            </Button>
          )}
          <Button asChild size="lg" variant="outline" className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
            <Link to="/helpdesk">Ask in বাংলা / English</Link>
          </Button>
        </div>
        <dl className="mt-12 grid max-w-2xl grid-cols-3 gap-6 border-t border-primary-foreground/20 pt-6 text-primary-foreground">
          <div><dt className="text-xs uppercase tracking-wider text-primary-foreground/60">Courses offered</dt><dd className="font-display text-3xl font-bold">{COURSES.length}</dd></div>
          <div><dt className="text-xs uppercase tracking-wider text-primary-foreground/60">Credit range</dt><dd className="font-display text-3xl font-bold">12–21</dd></div>
          <div><dt className="text-xs uppercase tracking-wider text-primary-foreground/60">Since</dt><dd className="font-display text-3xl font-bold">2001</dd></div>
        </dl>
      </div>
    </section>
  );
}

function Tile({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="rounded-lg border bg-card p-5 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="mt-2 text-2xl font-bold text-primary">{value}</div>
      {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}

function PortalToday() {
  const role = useCampus((s) => s.role);
  return (
    <section className="relative z-10 mx-auto -mt-10 max-w-7xl px-4">
      {role === "student" && <StudentToday />}
      {role === "faculty" && <FacultyToday />}
      {role === "advisor" && <AdvisorToday />}
      {role === "coordinator" && <CoordinatorToday />}
    </section>
  );
}

function StudentToday() {
  const st = useCurrentStudent();
  const reg = useCampus((s) => s.registrations[st.id]);
  const published = useCampus((s) => s.published);
  const credits = (reg?.offeringIds ?? []).reduce((sum, id) => {
    const o = published.find((x) => x.id === id);
    return sum + (COURSES.find((c) => c.code === o?.courseCode)?.credits ?? 0);
  }, 0);
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Tile label="Welcome back" value={<span className="text-xl">{st.name}</span>} hint={`ID ${st.id} · Section ${st.section}`} />
      <Tile label="CGPA" value={st.cgpa.toFixed(2)} hint={st.note} />
      <Tile label="Registration" value={<StatusBadge status={reg?.status ?? "draft"} className="text-sm" />} hint={reg ? `${credits} credits selected` : "Not started yet"} />
      <Tile label="Advisor" value={<span className="text-base">{ADVISOR.name}</span>} hint="Department Advisor" />
    </div>
  );
}

function FacultyToday() {
  const t = useCurrentTeacher();
  const published = useCampus((s) => s.published);
  const av = useCampus((s) => s.availability[t.id]);
  const mine = published.filter((o) => o.teacherId === t.id);
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Tile label="Faculty" value={<span className="text-xl">{t.name}</span>} hint={t.designation} />
      <Tile label="Assigned sections" value={mine.length} hint={mine.map((o) => `${o.courseCode}-${o.section}`).join(", ")} />
      <Tile label="Availability" value={<span className="text-base">{av?.days.join(", ")}</span>} hint={av ? `${av.start} – ${av.end}` : ""} />
    </div>
  );
}

function AdvisorToday() {
  const regs = useCampus((s) => s.registrations);
  const petitions = useCampus((s) => s.petitions);
  const pending = Object.values(regs).filter((r) => r.status === "pending").length;
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Tile label="Advisor" value={<span className="text-xl">{ADVISOR.name}</span>} hint={ADVISOR.designation} />
      <Tile label="Pending registrations" value={pending} hint={`${STUDENTS.length} advisees in CSE 2nd year`} />
      <Tile label="Open petitions" value={petitions.filter((p) => p.status === "pending").length} hint="Add / drop requests" />
    </div>
  );
}

function CoordinatorToday() {
  const draft = useCampus((s) => s.routineDraft);
  const availability = useCampus((s) => s.availability);
  const publishedAt = useCampus((s) => s.publishedAt);
  const issues = detectRoutineIssues(draft, availability);
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Tile label="Coordinator desk" value={<span className="flex items-center gap-2 text-xl"><LayoutGrid className="size-5 text-royal" /> CSE 2-1</span>} hint={`${draft.length} section offerings in draft`} />
      <Tile label="Draft clashes" value={<span className={issues.length ? "text-destructive" : "text-success"}>{issues.length}</span>} hint={issues.length ? "Resolve before publishing" : "Clash-free — ready to publish"} />
      <Tile label="Last published" value={<span className="text-base">{publishedAt ? fmtDate(publishedAt.slice(0, 10)) : "—"}</span>} hint="Timetable visible to students" />
    </div>
  );
}

function NoticesPreview() {
  const items = NOTICES.slice(0, 4);
  return (
    <section className="mx-auto max-w-7xl px-4 pt-14">
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-lg border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-primary">Latest notices</h2>
            <Link to="/notices" className="text-sm font-medium text-royal hover:underline">All notices →</Link>
          </div>
          <ul className="mt-4 divide-y">
            {items.map((n) => (
              <li key={n.id} className="flex gap-4 py-3">
                <div className="w-16 shrink-0 rounded-md bg-primary py-1.5 text-center text-primary-foreground">
                  <p className="text-lg font-bold leading-none">{n.date.slice(8, 10)}</p>
                  <p className="text-[10px] uppercase tracking-wider">{fmtDate(n.date).split(" ")[1]}</p>
                </div>
                <div className="min-w-0">
                  <Badge variant="secondary" className="mb-1">{n.category}</Badge>
                  <p className="font-medium leading-snug">{n.title}</p>
                  {n.titleBn && <p className="text-sm text-muted-foreground">{n.titleBn}</p>}
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col justify-between rounded-lg bg-gradient-navy p-6 text-primary-foreground shadow-lift">
          <div>
            <Users className="size-8 text-amber" />
            <h2 className="mt-3 text-xl font-bold">Try every portal</h2>
            <p className="mt-2 text-sm text-primary-foreground/80">
              Use the demo bar at the top to switch between students, faculty, the academic advisor and the department coordinator.
              Submit a registration as Nusrat to see the prerequisite block, then approve it as the advisor.
            </p>
          </div>
          <Button asChild className="mt-6 w-fit bg-amber text-amber-foreground hover:bg-amber/90">
            <Link to="/registration"><ClipboardCheck /> Start with registration</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
