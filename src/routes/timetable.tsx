import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ROOMS, TEACHERS, SEMESTER } from "@/lib/campus/data";
import { findStudentClashes } from "@/lib/campus/rules";
import { fmtDate } from "@/lib/campus/format";
import { useCampus } from "@/lib/campus/store";
import { PageHeader } from "@/components/campus/PageHeader";
import { TimetableGrid } from "@/components/campus/TimetableGrid";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/campus/StatusBadge";

export const Route = createFileRoute("/timetable")({
  head: () => ({
    meta: [
      { title: "Weekly Timetable — PUB CampusMate" },
      { name: "description", content: "Saturday to Tuesday and Friday class routine for CSE 2nd Year 1st Semester with rooms, labs, instructors and clash highlighting." },
      { property: "og:title", content: "Weekly Timetable — PUB CampusMate" },
      { property: "og:description", content: "Clash-free weekly routine, 09:30 AM to 03:45 PM, for PUB CSE." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TimetablePage,
});

function TimetablePage() {
  const { role, studentId, teacherId, published, publishedAt, registrations } = useCampus();
  const [view, setView] = useState("my");
  useEffect(() => setView("my"), [role]);

  const reg = registrations[studentId];
  let offerings = published;
  let caption = "";
  if (view === "my") {
    if (role === "student") {
      offerings = published.filter((o) => reg?.offeringIds.includes(o.id));
      caption = reg ? `Your ${reg.status === "approved" ? "approved" : "selected"} courses` : "Select courses on the Registration page to build your timetable.";
    } else if (role === "faculty") {
      offerings = published.filter((o) => o.teacherId === teacherId);
      caption = "Your assigned teaching sections";
    } else {
      offerings = published;
      caption = "All CSE 2nd Year 1st Semester sections";
    }
  } else if (view.startsWith("section:")) {
    offerings = published.filter((o) => o.section === view.split(":")[1]);
    caption = `Section ${view.split(":")[1]} routine`;
  } else if (view.startsWith("room:")) {
    const room = view.slice(5);
    offerings = published.map((o) => ({ ...o, meetings: o.meetings.filter((m) => m.room === room) })).filter((o) => o.meetings.length);
    caption = `${room} allocation`;
  } else if (view.startsWith("teacher:")) {
    offerings = published.filter((o) => o.teacherId === view.slice(8));
    caption = `${TEACHERS.find((t) => t.id === view.slice(8))?.name} teaching schedule`;
  }

  const clashes = view === "my" && role === "student" ? findStudentClashes(offerings) : [];
  const highlight = new Set(clashes.flatMap((c) => [c.a.id, c.b.id]));
  const myLabel = role === "student" ? "My courses" : role === "faculty" ? "My teaching" : "All sections";

  return (
    <>
      <PageHeader eyebrow={`${SEMESTER} · Published ${publishedAt ? fmtDate(publishedAt.slice(0, 10)) : ""}`} title="Weekly Timetable" titleBn="সাপ্তাহিক ক্লাস রুটিন" description="Saturday to Tuesday and Friday, 09:30 AM – 03:45 PM. Theory in NB-502, 503, 504, 702 and 703; labs in NB-281, 406, 606 and 608." />
      <div className="mx-auto max-w-7xl space-y-4 px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold">{caption}</p>
            {role === "student" && view === "my" && reg && <StatusBadge status={reg.status} className="mt-1" />}
          </div>
          <Select value={view} onValueChange={setView}>
            <SelectTrigger className="w-64" aria-label="Timetable view"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="my">{myLabel}</SelectItem>
              <SelectGroup>
                <SelectLabel>Sections</SelectLabel>
                <SelectItem value="section:A">Section A</SelectItem>
                <SelectItem value="section:B">Section B</SelectItem>
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Rooms & labs</SelectLabel>
                {ROOMS.map((r) => <SelectItem key={r} value={`room:${r}`}>{r}</SelectItem>)}
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Instructors</SelectLabel>
                {TEACHERS.map((t) => <SelectItem key={t.id} value={`teacher:${t.id}`}>{t.name}</SelectItem>)}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        {clashes.length > 0 && (
          <p className="rounded-md border border-destructive/40 bg-danger-soft p-3 text-sm text-destructive">
            {clashes.length} time clash{clashes.length > 1 ? "es" : ""} in your selection — change a section on the Registration page.
          </p>
        )}
        <TimetableGrid offerings={offerings} highlight={highlight} />
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="size-3 rounded-sm border-l-4 border-royal bg-accent" /> Theory</span>
          <span className="flex items-center gap-1.5"><span className="size-3 rounded-sm border-l-4 border-amber bg-warning-soft" /> Lab / Sessional</span>
          <span className="flex items-center gap-1.5"><span className="size-3 rounded-sm border-l-4 border-destructive bg-danger-soft" /> Clash</span>
        </div>
      </div>
    </>
  );
}
