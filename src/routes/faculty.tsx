import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { AlertTriangle, CalendarPlus, Clock, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DAYS, ROOMS, courseByCode, type Day, type Offering } from "@/lib/campus/data";
import { contactHours, detectRoutineIssues, meetingsOverlap } from "@/lib/campus/rules";
import { fmtDate, fmtRange, fmtTime } from "@/lib/campus/format";
import { useCampus } from "@/lib/campus/store";
import { useCurrentTeacher } from "@/lib/campus/hooks";
import { PageHeader } from "@/components/campus/PageHeader";
import { RoleGate } from "@/components/campus/RoleGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/faculty")({
  head: () => ({
    meta: [
      { title: "Faculty Desk — PUB CampusMate" },
      { name: "description", content: "Assigned courses, teaching load breakdown, availability and make-up class proposals for PUB CSE faculty." },
      { property: "og:title", content: "Faculty Desk — PUB CampusMate" },
      { property: "og:description", content: "Teaching load, availability and make-up classes for the Department of CSE, PUB." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FacultyPage,
});

const TIMES = Array.from({ length: 19 }, (_, i) => {
  const mins = 8 * 60 + i * 30;
  return `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
});

function FacultyPage() {
  const t = useCurrentTeacher();
  return (
    <>
      <PageHeader eyebrow="Faculty portal" title="Faculty Desk" titleBn="শিক্ষক ডেস্ক" {...(t ? { description: `${t.name} — ${t.designation}` } : {})} />
      <RoleGate allow={["faculty"]}>
        <FacultyBody />
      </RoleGate>
    </>
  );
}

function FacultyBody() {
  const t = useCurrentTeacher();
  const published = useCampus((s) => s.published);
  const mine = published.filter((o) => o.teacherId === t.id);
  const theory = mine.filter((o) => courseByCode(o.courseCode)?.kind === "theory");
  const labs = mine.filter((o) => courseByCode(o.courseCode)?.kind === "lab");
  const credits = mine.reduce((s, o) => s + (courseByCode(o.courseCode)?.credits ?? 0), 0);
  const hours = mine.reduce((s, o) => s + contactHours(o), 0);

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <section className="grid gap-4 sm:grid-cols-4">
          <Stat label="Sections" value={mine.length} />
          <Stat label="Credit hours" value={credits.toFixed(1)} />
          <Stat label="Contact hrs / week" value={hours.toFixed(1)} />
          <Stat label="Theory · Lab" value={`${theory.length} · ${labs.length}`} />
        </section>
        <section className="rounded-lg border bg-card p-5 shadow-card">
          <h2 className="font-sans text-base font-semibold">Assigned courses</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr><th className="py-2">Course</th><th>Section</th><th>Schedule</th><th className="text-right">Hrs/wk</th></tr>
              </thead>
              <tbody className="divide-y">
                {mine.map((o) => (
                  <tr key={o.id}>
                    <td className="py-2"><p className="font-medium">{o.courseCode}</p><p className="text-xs text-muted-foreground">{courseByCode(o.courseCode)?.title}</p></td>
                    <td>{o.section}</td>
                    <td className="text-xs">{o.meetings.map((m, i) => <p key={i}>{m.day} {fmtRange(m.start, m.end)} · {m.room}</p>)}</td>
                    <td className="text-right">{contactHours(o).toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <LoadBars offerings={mine} />
        </section>
        <MakeupSection mine={mine} />
      </div>
      <AvailabilityEditor />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-card">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold text-primary">{value}</p>
    </div>
  );
}

function LoadBars({ offerings }: { offerings: Offering[] }) {
  const total = offerings.reduce((s, o) => s + contactHours(o), 0) || 1;
  return (
    <div className="mt-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Teaching load breakdown</p>
      <div className="mt-2 flex h-3 overflow-hidden rounded-full bg-muted">
        {offerings.map((o, i) => (
          <div key={o.id} className={cn(i % 2 ? "bg-amber" : "bg-royal", courseByCode(o.courseCode)?.kind === "lab" && "opacity-70")} style={{ width: `${(contactHours(o) / total) * 100}%` }} title={`${o.courseCode}-${o.section}`} />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
        {offerings.map((o) => <span key={o.id}>{o.courseCode}-{o.section}: {((contactHours(o) / total) * 100).toFixed(0)}%</span>)}
      </div>
    </div>
  );
}

function AvailabilityEditor() {
  const t = useCurrentTeacher();
  const saved = useCampus((s) => s.availability[t.id]);
  const setAvailability = useCampus((s) => s.setAvailability);
  const published = useCampus((s) => s.published);
  const [days, setDays] = useState<Day[]>(saved?.days ?? []);
  const [start, setStart] = useState(saved?.start ?? "09:00");
  const [end, setEnd] = useState(saved?.end ?? "16:00");

  useEffect(() => {
    setDays(saved?.days ?? []);
    setStart(saved?.start ?? "09:00");
    setEnd(saved?.end ?? "16:00");
  }, [saved, t.id]);

  const preview = detectRoutineIssues(published.filter((o) => o.teacherId === t.id), { [t.id]: { days, start, end } }).filter((i) => i.kind === "availability");

  return (
    <aside className="space-y-4 lg:sticky lg:top-44 lg:self-start">
      <div className="rounded-lg border bg-card p-5 shadow-card">
        <h2 className="flex items-center gap-2 font-sans text-base font-semibold"><Clock className="size-4 text-royal" /> Weekly availability</h2>
        <p className="mt-1 text-xs text-muted-foreground">The coordinator's routine builder warns when classes fall outside this window.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {DAYS.map((d) => (
            <button
              key={d}
              type="button"
              aria-pressed={days.includes(d)}
              onClick={() => setDays(days.includes(d) ? days.filter((x) => x !== d) : DAYS.filter((x) => x === d || days.includes(x)))}
              className={cn("rounded-md border px-3 py-1.5 text-sm font-medium", days.includes(d) ? "border-royal bg-royal text-royal-foreground" : "hover:border-royal")}
            >
              {d}
            </button>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Select value={start} onValueChange={setStart}>
            <SelectTrigger aria-label="From"><SelectValue /></SelectTrigger>
            <SelectContent>{TIMES.map((x) => <SelectItem key={x} value={x}>{fmtTime(x)}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={end} onValueChange={setEnd}>
            <SelectTrigger aria-label="To"><SelectValue /></SelectTrigger>
            <SelectContent>{TIMES.map((x) => <SelectItem key={x} value={x}>{fmtTime(x)}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        {preview.length > 0 && (
          <div className="mt-3 space-y-1 rounded-md bg-warning-soft p-3 text-xs text-warning-foreground">
            {preview.map((p, i) => <p key={i} className="flex gap-1.5"><AlertTriangle className="size-3.5 shrink-0" /> {p.message}</p>)}
          </div>
        )}
        <Button
          className="mt-4 w-full"
          onClick={() => {
            setAvailability(t.id, { days, start, end });
            toast.success("Availability saved");
          }}
        >
          Save availability
        </Button>
      </div>
    </aside>
  );
}

const WEEKDAY: (Day | null)[] = ["Sun", "Mon", "Tue", null, null, "Fri", "Sat"];

function MakeupSection({ mine }: { mine: Offering[] }) {
  const t = useCurrentTeacher();
  const published = useCampus((s) => s.published);
  const allMakeups = useCampus((s) => s.makeups);
  const makeups = useMemo(() => allMakeups.filter((m) => m.teacherId === t.id), [allMakeups, t.id]);
  const addMakeup = useCampus((s) => s.addMakeup);
  const removeMakeup = useCampus((s) => s.removeMakeup);
  const [offeringId, setOfferingId] = useState("");
  const [date, setDate] = useState("");
  const [start, setStart] = useState("15:00");
  const [end, setEnd] = useState("16:30");
  const [room, setRoom] = useState("NB-504");
  const [reason, setReason] = useState("");

  const target = published.find((o) => o.id === offeringId);
  const weekday = date ? WEEKDAY[new Date(date + "T00:00:00").getDay()] : null;
  const conflicts =
    target && weekday
      ? published.filter((o) =>
          o.meetings.some(
            (mt) => meetingsOverlap(mt, { day: weekday, start, end, room }) && (mt.room === room || o.teacherId === t.id || o.section === target.section),
          ),
        )
      : [];

  return (
    <section className="rounded-lg border bg-card p-5 shadow-card">
      <h2 className="flex items-center gap-2 font-sans text-base font-semibold"><CalendarPlus className="size-4 text-royal" /> Propose a make-up class</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Select value={offeringId} onValueChange={setOfferingId}>
          <SelectTrigger aria-label="Course"><SelectValue placeholder="Course & section" /></SelectTrigger>
          <SelectContent>{mine.map((o) => <SelectItem key={o.id} value={o.id}>{o.courseCode} · Section {o.section}</SelectItem>)}</SelectContent>
        </Select>
        <Input type="date" aria-label="Date" value={date} onChange={(e) => setDate(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <Select value={start} onValueChange={setStart}>
            <SelectTrigger aria-label="Start"><SelectValue /></SelectTrigger>
            <SelectContent>{TIMES.map((x) => <SelectItem key={x} value={x}>{fmtTime(x)}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={end} onValueChange={setEnd}>
            <SelectTrigger aria-label="End"><SelectValue /></SelectTrigger>
            <SelectContent>{TIMES.map((x) => <SelectItem key={x} value={x}>{fmtTime(x)}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <Select value={room} onValueChange={setRoom}>
          <SelectTrigger aria-label="Room"><SelectValue /></SelectTrigger>
          <SelectContent>{ROOMS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
        </Select>
        <Textarea className="sm:col-span-2" placeholder="Reason (e.g. class missed due to university holiday)" value={reason} onChange={(e) => setReason(e.target.value)} />
      </div>
      {conflicts.length > 0 ? (
        <p className="mt-3 flex gap-1.5 rounded-md bg-danger-soft p-3 text-xs text-destructive">
          <AlertTriangle className="size-3.5 shrink-0" /> Clashes with the regular routine: {conflicts.map((o) => `${o.courseCode}-${o.section}`).join(", ")}
        </p>
      ) : target && date ? (
        <p className="mt-3 rounded-md bg-success-soft p-3 text-xs text-success">No clash with the regular routine for {weekday ?? "this weekend day"}.</p>
      ) : null}
      <Button
        className="mt-4"
        disabled={!offeringId || !date || conflicts.length > 0 || start >= end}
        onClick={() => {
          addMakeup({ teacherId: t.id, offeringId, date, start, end, room, reason: reason.trim() || "Make-up class" });
          setReason("");
          toast.success("Make-up class proposed and shared with the section");
        }}
      >
        Propose make-up class
      </Button>
      {makeups.length > 0 && (
        <ul className="mt-5 divide-y border-t">
          {makeups.map((m) => (
            <li key={m.id} className="flex items-start justify-between gap-3 py-3 text-sm">
              <div>
                <p className="font-medium">{m.offeringId.replace("-", " · Section ")} — {fmtDate(m.date)}</p>
                <p className="text-xs text-muted-foreground">{fmtRange(m.start, m.end)} · {m.room} · {m.reason}</p>
              </div>
              <Button size="icon" variant="ghost" aria-label="Withdraw proposal" onClick={() => removeMakeup(m.id)}><Trash2 /></Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
