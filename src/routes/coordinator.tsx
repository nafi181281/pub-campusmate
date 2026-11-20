import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertOctagon, CheckCircle2, FlaskConical, RotateCcw, Upload } from "lucide-react";
import { toast } from "sonner";
import { COURSES, DAYS, ROOMS, SLOTS, TEACHERS, SEMESTER, courseByCode, type Day, type Offering } from "@/lib/campus/data";
import { detectRoutineIssues, type RoutineIssue } from "@/lib/campus/rules";
import { fmtDate, fmtRange } from "@/lib/campus/format";
import { useCampus } from "@/lib/campus/store";
import { PageHeader } from "@/components/campus/PageHeader";
import { RoleGate } from "@/components/campus/RoleGate";
import { TimetableGrid } from "@/components/campus/TimetableGrid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/coordinator")({
  head: () => ({
    meta: [
      { title: "Routine Builder — PUB CampusMate" },
      { name: "description", content: "Department coordinator desk: manage semester offerings, build the class routine with automatic teacher, room and section clash detection, and publish." },
      { property: "og:title", content: "Routine Builder — PUB CampusMate" },
      { property: "og:description", content: "Clash-free routine builder for the Department of CSE, PUB." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CoordinatorPage,
});

const BLOCKS = [
  ...SLOTS.map((s) => ({ start: s.start, end: s.end })),
  ...SLOTS.slice(0, -1).map((s, i) => ({ start: s.start, end: SLOTS[i + 1]!.end })),
];

const KIND_LABEL: Record<RoutineIssue["kind"], string> = { teacher: "Instructor", room: "Room", section: "Section", availability: "Availability" };

function CoordinatorPage() {
  return (
    <>
      <PageHeader eyebrow={`${SEMESTER} · Department Coordinator Desk`} title="Routine Builder" titleBn="রুটিন নির্মাতা" description="Assign instructors, rooms and time blocks. Clashes are detected automatically before you publish the timetable." />
      <RoleGate allow={["coordinator"]}>
        <CoordinatorBody />
      </RoleGate>
    </>
  );
}

function CoordinatorBody() {
  const { routineDraft, updateDraft, publishRoutine, resetDraft, availability, publishedAt, published } = useCampus();
  const [preview, setPreview] = useState("A");
  const issues = detectRoutineIssues(routineDraft, availability);
  const hard = issues.filter((i) => i.kind !== "availability");
  const flagged = new Set(issues.flatMap((i) => i.offeringIds));
  const dirty = JSON.stringify(routineDraft) !== JSON.stringify(published);

  const update = (id: string, fn: (o: Offering) => Offering) => updateDraft(routineDraft.map((o) => (o.id === id ? fn(o) : o)));

  const injectClash = () => {
    update("MTH2101-A", (o) => ({ ...o, meetings: [{ day: "Sat", start: "09:30", end: "10:45", room: "NB-504" }, ...o.meetings.slice(1)] }));
    toast("Moved MTH 2101-A to Saturday 09:30 AM in NB-504 — see the clash report");
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <div className="grid gap-4 md:grid-cols-[1fr_360px]">
        <section className="rounded-lg border bg-card p-5 shadow-card">
          <h2 className="font-sans text-base font-semibold">Semester offerings — CSE 2nd Year 1st Semester</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {COURSES.map((c) => {
              const secs = routineDraft.filter((o) => o.courseCode === c.code);
              return (
                <div key={c.code} className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium">{c.code} <span className="text-muted-foreground">· {c.credits.toFixed(1)} Cr</span></p>
                    <p className="truncate text-xs text-muted-foreground">{c.title}</p>
                  </div>
                  <Badge variant="secondary">{secs.length} sections</Badge>
                </div>
              );
            })}
          </div>
        </section>
        <section className={cn("rounded-lg border p-5 shadow-card", hard.length ? "border-destructive/40 bg-danger-soft" : "border-success/40 bg-success-soft")}>
          <h2 className="flex items-center gap-2 font-sans text-base font-semibold">
            {hard.length ? <AlertOctagon className="size-5 text-destructive" /> : <CheckCircle2 className="size-5 text-success" />}
            Clash report
          </h2>
          <p className="mt-1 text-sm">{hard.length ? `${hard.length} hard clash${hard.length > 1 ? "es" : ""} must be fixed before publishing.` : "No instructor, room or section clashes."}</p>
          <ul className="mt-3 max-h-56 space-y-2 overflow-y-auto text-xs">
            {issues.map((i, idx) => (
              <li key={idx} className="rounded-md bg-card p-2">
                <Badge variant={i.kind === "availability" ? "outline" : "destructive"} className="mb-1">{KIND_LABEL[i.kind]}</Badge>
                <p>{i.message}</p>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              disabled={hard.length > 0 || !dirty}
              onClick={() => {
                publishRoutine();
                toast.success("Timetable published to students and faculty");
              }}
            >
              <Upload /> Publish timetable
            </Button>
            <Button variant="outline" disabled={!dirty} onClick={resetDraft}><RotateCcw /> Revert</Button>
            <Button variant="ghost" onClick={injectClash}><FlaskConical /> Demo a clash</Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Last published {publishedAt ? fmtDate(publishedAt.slice(0, 10)) : "—"}{dirty ? " · unpublished changes" : ""}</p>
        </section>
      </div>

      <section className="rounded-lg border bg-card shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="px-4 py-2">Offering</th><th>Instructor</th><th>Meetings (day · time · room)</th></tr>
            </thead>
            <tbody className="divide-y">
              {routineDraft.map((o) => (
                <tr key={o.id} className={cn(flagged.has(o.id) && "bg-danger-soft/60")}>
                  <td className="px-4 py-2 align-top">
                    <p className="font-medium">{o.courseCode} · {o.section}</p>
                    <p className="text-xs text-muted-foreground">{courseByCode(o.courseCode)?.kind === "lab" ? "Lab" : "Theory"}</p>
                  </td>
                  <td className="py-2 pr-2 align-top">
                    <Select value={o.teacherId} onValueChange={(v) => update(o.id, (x) => ({ ...x, teacherId: v }))}>
                      <SelectTrigger className="h-8 w-52 text-xs" aria-label={`Instructor for ${o.id}`}><SelectValue /></SelectTrigger>
                      <SelectContent>{TEACHERS.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </td>
                  <td className="space-y-1.5 py-2 pr-4">
                    {o.meetings.map((mt, mi) => {
                      const setMeeting = (patch: Partial<typeof mt>) => update(o.id, (x) => ({ ...x, meetings: x.meetings.map((y, yi) => (yi === mi ? { ...y, ...patch } : y)) }));
                      return (
                        <div key={mi} className="flex flex-wrap gap-1.5">
                          <Select value={mt.day} onValueChange={(v) => setMeeting({ day: v as Day })}>
                            <SelectTrigger className="h-8 w-24 text-xs" aria-label="Day"><SelectValue /></SelectTrigger>
                            <SelectContent>{DAYS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                          </Select>
                          <Select value={`${mt.start}-${mt.end}`} onValueChange={(v) => { const [start = mt.start, end = mt.end] = v.split("-"); setMeeting({ start, end }); }}>
                            <SelectTrigger className="h-8 w-48 text-xs" aria-label="Time"><SelectValue /></SelectTrigger>
                            <SelectContent>{BLOCKS.map((b) => <SelectItem key={`${b.start}-${b.end}`} value={`${b.start}-${b.end}`}>{fmtRange(b.start, b.end)}</SelectItem>)}</SelectContent>
                          </Select>
                          <Select value={mt.room} onValueChange={(v) => setMeeting({ room: v })}>
                            <SelectTrigger className="h-8 w-48 text-xs" aria-label="Room"><SelectValue /></SelectTrigger>
                            <SelectContent>{ROOMS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                      );
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <Tabs value={preview} onValueChange={setPreview}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-primary">Draft preview</h2>
            <TabsList>
              <TabsTrigger value="A">Section A</TabsTrigger>
              <TabsTrigger value="B">Section B</TabsTrigger>
            </TabsList>
          </div>
          {(["A", "B"] as const).map((sec) => (
            <TabsContent key={sec} value={sec} className="mt-3">
              <TimetableGrid offerings={routineDraft.filter((o) => o.section === sec)} highlight={flagged} compact />
            </TabsContent>
          ))}
        </Tabs>
      </section>
    </div>
  );
}
