import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Pin, Printer } from "lucide-react";
import { EXAM_ROUTINE, NOTICES, courseByCode, type NoticeCategory } from "@/lib/campus/data";
import { fmtDate } from "@/lib/campus/format";
import { PageHeader } from "@/components/campus/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notices")({
  head: () => ({
    meta: [
      { title: "Notices & Exam Routine — PUB CampusMate" },
      { name: "description", content: "Official PUB announcements by category and the downloadable CSE midterm examination schedule." },
      { property: "og:title", content: "Notices & Exam Routine — PUB CampusMate" },
      { property: "og:description", content: "Academic, exam, administration, event and career notices for PUB students." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NoticesPage,
});

const CATS: ("All" | NoticeCategory)[] = ["All", "Academic", "Exam", "Administration", "Event", "Career"];
const CAT_STYLE: Record<NoticeCategory, string> = {
  Academic: "bg-accent text-royal",
  Exam: "bg-danger-soft text-destructive",
  Administration: "bg-muted text-foreground",
  Event: "bg-success-soft text-success",
  Career: "bg-warning-soft text-warning-foreground",
};

function downloadCsv() {
  const rows = [["Date", "Day", "Time", "Course", "Title", "Room"], ...EXAM_ROUTINE.map((e) => [e.date, e.day, e.time, e.courseCode, courseByCode(e.courseCode)?.title ?? "Sessional lab quiz", e.room])];
  const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "PUB-CSE-2-1-Midterm-Schedule.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function NoticesPage() {
  const [cat, setCat] = useState<(typeof CATS)[number]>("All");
  const list = NOTICES.filter((n) => cat === "All" || n.category === cat).sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || b.date.localeCompare(a.date));
  return (
    <>
      <PageHeader eyebrow="Official announcements" title="Notices & Exam Routine" titleBn="নোটিশ ও পরীক্ষার রুটিন" />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[1fr_420px]">
        <section>
          <div className="flex flex-wrap gap-2">
            {CATS.map((c) => (
              <button key={c} type="button" onClick={() => setCat(c)} className={cn("rounded-full border px-3 py-1 text-sm", cat === c ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-royal")}>
                {c}
              </button>
            ))}
          </div>
          <ul className="mt-4 space-y-3">
            {list.map((n) => (
              <li key={n.id} className="rounded-lg border bg-card p-4 shadow-card">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className={cn("rounded-full px-2 py-0.5 font-semibold", CAT_STYLE[n.category])}>{n.category}</span>
                  <span className="text-muted-foreground">{fmtDate(n.date)}</span>
                  {n.pinned && <span className="flex items-center gap-1 font-semibold text-amber-foreground"><Pin className="size-3 text-amber" /> Pinned</span>}
                </div>
                <h2 className="mt-2 font-sans text-base font-semibold">{n.title}</h2>
                {n.titleBn && <p className="text-sm text-royal">{n.titleBn}</p>}
                <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
              </li>
            ))}
          </ul>
        </section>
        <aside className="lg:sticky lg:top-44 lg:self-start">
          <div className="rounded-lg border bg-card p-5 shadow-card">
            <Badge className="bg-maroon text-maroon-foreground">Midterm · Spring 2027</Badge>
            <h2 className="mt-2 text-xl font-bold text-primary">Exam routine — CSE 2-1</h2>
            <table className="mt-3 w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="py-1.5">Date</th><th>Course</th><th>Time</th></tr></thead>
              <tbody className="divide-y">
                {EXAM_ROUTINE.map((e) => (
                  <tr key={e.courseCode}>
                    <td className="py-2 pr-2 align-top"><p className="font-medium">{fmtDate(e.date)}</p><p className="text-xs text-muted-foreground">{e.day}</p></td>
                    <td className="pr-2 align-top"><p className="font-medium">{e.courseCode}</p><p className="text-xs text-muted-foreground">{e.room}</p></td>
                    <td className="align-top text-xs">{e.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={downloadCsv}><Download /> Download schedule</Button>
              <Button variant="outline" onClick={() => window.print()}><Printer /> Print</Button>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
