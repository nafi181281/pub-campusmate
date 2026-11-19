import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Lock, Send, XCircle, CalendarDays, FileText } from "lucide-react";
import { toast } from "sonner";
import { COURSES, SEMESTER, teacherById, type Offering } from "@/lib/campus/data";
import { checkSelection, isOnProbation, missingPrereq, MIN_CREDITS } from "@/lib/campus/rules";
import { fmtDate, fmtRange } from "@/lib/campus/format";
import { useCampus } from "@/lib/campus/store";
import { useCurrentStudent } from "@/lib/campus/hooks";
import { PageHeader } from "@/components/campus/PageHeader";
import { RoleGate } from "@/components/campus/RoleGate";
import { StatusBadge } from "@/components/campus/StatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/registration")({
  head: () => ({
    meta: [
      { title: "Course Registration — PUB CampusMate" },
      { name: "description", content: "Register CSE 2nd Year 1st Semester courses with automatic prerequisite, credit-limit and schedule-clash checks, then submit for advisor approval." },
      { property: "og:title", content: "Course Registration — PUB CampusMate" },
      { property: "og:description", content: "Prerequisite verification, 12–21 credit rules and live clash detection for PUB CSE students." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RegistrationPage,
});

function RegistrationPage() {
  return (
    <>
      <PageHeader eyebrow={`${SEMESTER} · CSE 2nd Year 1st Semester`} title="Course Registration" titleBn="কোর্স রেজিস্ট্রেশন" description="Pick one section per course. Prerequisites, credit limits and timetable clashes are checked as you select." />
      <RoleGate allow={["student"]}>
        <RegistrationBody />
      </RoleGate>
    </>
  );
}

function RegistrationBody() {
  const student = useCurrentStudent();
  const published = useCampus((s) => s.published);
  const reg = useCampus((s) => s.registrations[student.id]);
  const setSelection = useCampus((s) => s.setSelection);
  const submit = useCampus((s) => s.submitRegistration);

  const status = reg?.status ?? "draft";
  const locked = status === "pending" || status === "approved";
  const selectedIds = reg?.offeringIds ?? [];
  const selected = useMemo(() => selectedIds.map((id) => published.find((o) => o.id === id)).filter(Boolean) as Offering[], [selectedIds, published]);
  const check = checkSelection(student, selected);
  const clashIds = new Set(check.clashes.flatMap((c) => [c.a.id, c.b.id]));

  const toggle = (o: Offering) => {
    if (locked) return;
    const without = selectedIds.filter((id) => published.find((x) => x.id === id)?.courseCode !== o.courseCode);
    const next = selectedIds.includes(o.id) ? without : [...without, o.id];
    setSelection(student.id, next);
  };

  const autofill = () => {
    const ids = published.filter((o) => o.section === student.section && !missingPrereq(COURSES.find((c) => c.code === o.courseCode)!, student.passed)).map((o) => o.id);
    setSelection(student.id, ids);
    toast.success(`Selected all eligible Section ${student.section} courses`);
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[1fr_340px]">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-4 shadow-card">
          <div>
            <p className="font-semibold">{student.name} <span className="text-muted-foreground">· {student.nameBn}</span></p>
            <p className="text-sm text-muted-foreground">
              ID {student.id} · CGPA {student.cgpa.toFixed(2)} · Passed: {student.transcript.map((t) => `${t.code} (${t.grade})`).join(", ")}
            </p>
          </div>
          {!locked && (
            <Button variant="outline" onClick={autofill}>
              <Wand2 /> Auto-select Section {student.section}
            </Button>
          )}
        </div>

        {status !== "draft" && <StatusPanel />}

        {COURSES.map((course) => {
          const pre = missingPrereq(course, student.passed);
          const offerings = published.filter((o) => o.courseCode === course.code);
          return (
            <article key={course.code} className={cn("rounded-lg border bg-card p-4 shadow-card", pre && "border-destructive/40 bg-danger-soft/40")}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-royal">{course.code}</p>
                  <h3 className="font-sans text-base font-semibold">{course.title}</h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="secondary">{course.credits.toFixed(1)} Cr</Badge>
                  <Badge variant="outline">{course.kind === "lab" ? "Lab / Sessional" : "Theory"}</Badge>
                </div>
              </div>
              {course.prereq && (
                <p className={cn("mt-2 flex items-center gap-1.5 text-sm", pre ? "font-medium text-destructive" : "text-success")}>
                  {pre ? <Lock className="size-4" /> : <CheckCircle2 className="size-4" />}
                  Prerequisite: {course.prereq.code} {course.prereq.title} — {pre ? "not passed. Registration blocked." : "passed"}
                </p>
              )}
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {offerings.map((o) => {
                  const isSel = selectedIds.includes(o.id);
                  const clash = isSel && clashIds.has(o.id);
                  return (
                    <button
                      key={o.id}
                      type="button"
                      disabled={!!pre || locked}
                      onClick={() => toggle(o)}
                      aria-pressed={isSel}
                      className={cn(
                        "rounded-md border p-3 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                        isSel ? "border-royal bg-accent ring-1 ring-royal" : "hover:border-royal/60",
                        clash && "border-destructive bg-danger-soft ring-1 ring-destructive",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Section {o.section}</span>
                        {isSel && !clash && <CheckCircle2 className="size-4 text-royal" />}
                        {clash && <AlertTriangle className="size-4 text-destructive" />}
                      </div>
                      <p className="text-xs text-muted-foreground">{teacherById(o.teacherId)?.name}</p>
                      <ul className="mt-1 space-y-0.5 text-xs">
                        {o.meetings.map((mt, i) => (
                          <li key={i}>
                            {mt.day} {fmtRange(mt.start, mt.end)} · {mt.room}
                          </li>
                        ))}
                      </ul>
                      {clash && <p className="mt-1 text-xs font-semibold text-destructive">Time clash with another selected course</p>}
                    </button>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>

      <aside className="space-y-4 lg:sticky lg:top-44 lg:self-start">
        <div className="rounded-lg border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="font-sans text-base font-semibold">Registration summary</h2>
            <StatusBadge status={status} />
          </div>
          <CreditMeter total={check.totalCredits} max={check.maxCredits} />
          <p className="mt-2 text-xs text-muted-foreground">
            Limit: {MIN_CREDITS}–{check.maxCredits} credits{isOnProbation(student.cgpa) ? " (academic probation ceiling)" : ""}.
          </p>
          <ul className="mt-4 space-y-1.5 text-sm">
            {selected.map((o) => (
              <li key={o.id} className="flex justify-between gap-2">
                <span>{o.courseCode} · {o.section}</span>
                <span className="text-muted-foreground">{COURSES.find((c) => c.code === o.courseCode)?.credits.toFixed(1)}</span>
              </li>
            ))}
            {selected.length === 0 && <li className="text-muted-foreground">No courses selected yet.</li>}
          </ul>
          {check.errors.length > 0 && (
            <div className="mt-4 space-y-1.5 rounded-md bg-danger-soft p-3">
              {check.errors.map((e) => (
                <p key={e} className="flex gap-1.5 text-xs text-destructive"><XCircle className="mt-0.5 size-3.5 shrink-0" /> {e}</p>
              ))}
            </div>
          )}
          {check.ok && !locked && <p className="mt-4 flex items-center gap-1.5 rounded-md bg-success-soft p-3 text-xs text-success"><CheckCircle2 className="size-4" /> All checks passed. Ready to submit.</p>}
          <Button
            className="mt-4 w-full"
            disabled={!check.ok || locked}
            onClick={() => {
              submit(student.id);
              toast.success("Submitted to advisor — status: Pending Approval");
            }}
          >
            <Send /> {status === "rejected" ? "Resubmit for approval" : "Submit for advisor approval"}
          </Button>
          <Button asChild variant="ghost" className="mt-2 w-full">
            <Link to="/timetable"><CalendarDays /> View on timetable</Link>
          </Button>
        </div>
        {status === "approved" && <PetitionForm />}
      </aside>
    </div>
  );
}

function CreditMeter({ total, max }: { total: number; max: number }) {
  const scale = 22;
  const pct = Math.min(100, (total / scale) * 100);
  const color = total < MIN_CREDITS ? "bg-warning" : total > max ? "bg-destructive" : "bg-success";
  return (
    <div className="mt-4">
      <div className="flex items-baseline justify-between">
        <span className="font-display text-3xl font-bold text-primary">{total}</span>
        <span className="text-xs text-muted-foreground">credits</span>
      </div>
      <div className="relative mt-2 h-2.5 rounded-full bg-muted">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
        <span className="absolute -top-1 h-4.5 w-0.5 bg-foreground/50" style={{ left: `${(MIN_CREDITS / scale) * 100}%` }} title="Minimum" />
        <span className="absolute -top-1 h-4.5 w-0.5 bg-foreground/50" style={{ left: `${(max / scale) * 100}%` }} title="Maximum" />
      </div>
      <div className="relative mt-1 h-4 text-[10px] text-muted-foreground">
        <span className="absolute -translate-x-1/2" style={{ left: `${(MIN_CREDITS / scale) * 100}%` }}>min {MIN_CREDITS}</span>
        <span className="absolute -translate-x-1/2" style={{ left: `${(max / scale) * 100}%` }}>max {max}</span>
      </div>
    </div>
  );
}

function StatusPanel() {
  const student = useCurrentStudent();
  const reg = useCampus((s) => s.registrations[student.id])!;
  const setSelection = useCampus((s) => s.setSelection);
  const tone = reg.status === "approved" ? "border-success/40 bg-success-soft" : reg.status === "rejected" ? "border-destructive/40 bg-danger-soft" : "border-warning/50 bg-warning-soft";
  return (
    <div className={cn("rounded-lg border p-4", tone)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold">
          {reg.status === "pending" && "Submitted — waiting for advisor approval"}
          {reg.status === "approved" && "Registration approved by your advisor"}
          {reg.status === "rejected" && "Registration returned by your advisor"}
        </p>
        <StatusBadge status={reg.status} />
      </div>
      {reg.submittedAt && <p className="mt-1 text-xs text-muted-foreground">Submitted {fmtDate(reg.submittedAt.slice(0, 10))}</p>}
      {reg.advisorComment && (
        <p className="mt-2 rounded-md bg-card p-3 text-sm"><span className="font-semibold">Advisor comment:</span> {reg.advisorComment}</p>
      )}
      {reg.status === "rejected" && (
        <Button size="sm" variant="outline" className="mt-3" onClick={() => setSelection(student.id, reg.offeringIds)}>
          Edit selection and resubmit
        </Button>
      )}
    </div>
  );
}

function PetitionForm() {
  const student = useCurrentStudent();
  const published = useCampus((s) => s.published);
  const reg = useCampus((s) => s.registrations[student.id])!;
  const allPetitions = useCampus((s) => s.petitions);
  const petitions = useMemo(() => allPetitions.filter((p) => p.studentId === student.id), [allPetitions, student.id]);
  const addPetition = useCampus((s) => s.addPetition);
  const [kind, setKind] = useState<"add" | "drop">("drop");
  const [offeringId, setOfferingId] = useState("");
  const [reason, setReason] = useState("");

  const regCodes = reg.offeringIds.map((id) => published.find((o) => o.id === id)?.courseCode);
  const options = kind === "drop" ? published.filter((o) => reg.offeringIds.includes(o.id)) : published.filter((o) => !regCodes.includes(o.courseCode));

  return (
    <div className="rounded-lg border bg-card p-5 shadow-card">
      <h2 className="flex items-center gap-2 font-sans text-base font-semibold"><FileText className="size-4 text-royal" /> Add / drop petition</h2>
      <p className="mt-1 text-xs text-muted-foreground">Drops in the first 2 weeks carry no penalty fee.</p>
      <div className="mt-3 space-y-2">
        <Select value={kind} onValueChange={(v) => { setKind(v as "add" | "drop"); setOfferingId(""); }}>
          <SelectTrigger aria-label="Petition type"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="drop">Drop a course</SelectItem>
            <SelectItem value="add">Add a course</SelectItem>
          </SelectContent>
        </Select>
        <Select value={offeringId} onValueChange={setOfferingId}>
          <SelectTrigger aria-label="Course"><SelectValue placeholder="Choose course" /></SelectTrigger>
          <SelectContent>
            {options.map((o) => (
              <SelectItem key={o.id} value={o.id}>{o.courseCode} · Section {o.section}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Textarea placeholder="Reason for the request" value={reason} onChange={(e) => setReason(e.target.value)} />
        <Button
          className="w-full"
          variant="secondary"
          disabled={!offeringId || reason.trim().length < 5}
          onClick={() => {
            addPetition({ studentId: student.id, kind, offeringId, reason: reason.trim() });
            setReason("");
            setOfferingId("");
            toast.success("Petition sent to your advisor");
          }}
        >
          Send petition
        </Button>
      </div>
      {petitions.length > 0 && (
        <ul className="mt-4 space-y-2 border-t pt-3 text-sm">
          {petitions.map((p) => (
            <li key={p.id}>
              <div className="flex justify-between gap-2">
                <span className="capitalize">{p.kind} {p.offeringId.replace("-", " · ")}</span>
                <StatusBadge status={p.status} />
              </div>
              {p.comment && <p className="text-xs text-muted-foreground">Advisor: {p.comment}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
