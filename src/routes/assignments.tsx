import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Briefcase, CheckCircle2, MapPin, Upload } from "lucide-react";
import { toast } from "sonner";
import { ASSIGNMENTS, JOBS, STUDENTS, courseByCode, type Assignment } from "@/lib/campus/data";
import { fmtDate } from "@/lib/campus/format";
import { useCampus } from "@/lib/campus/store";
import { useCurrentStudent } from "@/lib/campus/hooks";
import { PageHeader } from "@/components/campus/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/assignments")({
  head: () => ({
    meta: [
      { title: "Assignments & Career Hub — PUB CampusMate" },
      { name: "description", content: "Submit CSE coursework online and browse internships, part-time and full-time job notices for PUB students." },
      { property: "og:title", content: "Assignments & Career Hub — PUB CampusMate" },
      { property: "og:description", content: "Assignment submission and internship & job board for PUB." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AssignmentsPage,
});

function AssignmentsPage() {
  return (
    <>
      <PageHeader eyebrow="Coursework & careers" title="Assignments & Career Hub" titleBn="অ্যাসাইনমেন্ট ও ক্যারিয়ার হাব" />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Tabs defaultValue="assignments">
          <TabsList>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="career">Career Hub</TabsTrigger>
          </TabsList>
          <TabsContent value="assignments" className="mt-4"><AssignmentList /></TabsContent>
          <TabsContent value="career" className="mt-4"><CareerHub /></TabsContent>
        </Tabs>
      </div>
    </>
  );
}

function AssignmentList() {
  const role = useCampus((s) => s.role);
  const st = useCurrentStudent();
  const submissions = useCampus((s) => s.submissions);
  const [open, setOpen] = useState<Assignment | null>(null);
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {ASSIGNMENTS.map((a) => {
        const sub = submissions[`${st.id}:${a.id}`];
        const count = STUDENTS.filter((s) => submissions[`${s.id}:${a.id}`]).length;
        return (
          <article key={a.id} className="flex flex-col rounded-lg border bg-card p-5 shadow-card">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-royal">{a.courseCode} · {courseByCode(a.courseCode)?.title}</p>
                <h2 className="mt-1 font-sans text-base font-semibold">{a.title}</h2>
              </div>
              <Badge variant="secondary">{a.marks} marks</Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{a.brief}</p>
            <div className="mt-auto flex items-center justify-between gap-2 pt-4">
              <span className="text-sm">Due <span className="font-semibold">{fmtDate(a.due)}</span></span>
              {role === "student" ? (
                sub ? (
                  <span className="flex items-center gap-1.5 text-sm font-medium text-success"><CheckCircle2 className="size-4" /> Submitted · {sub.fileName}</span>
                ) : (
                  <Button size="sm" onClick={() => setOpen(a)}><Upload /> Submit</Button>
                )
              ) : (
                <span className="text-sm text-muted-foreground">{count}/{STUDENTS.length} submitted</span>
              )}
            </div>
          </article>
        );
      })}
      <SubmitDialog assignment={open} onClose={() => setOpen(null)} />
    </div>
  );
}

function SubmitDialog({ assignment, onClose }: { assignment: Assignment | null; onClose: () => void }) {
  const st = useCurrentStudent();
  const submit = useCampus((s) => s.submitAssignment);
  const [fileName, setFileName] = useState("");
  const [note, setNote] = useState("");
  return (
    <Dialog open={!!assignment} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit: {assignment?.title}</DialogTitle>
          <DialogDescription>{assignment?.courseCode} · due {assignment ? fmtDate(assignment.due) : ""}. Files stay in this demo browser only.</DialogDescription>
        </DialogHeader>
        <Input type="file" accept=".pdf,.doc,.docx,.zip" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")} aria-label="Assignment file" />
        <Textarea placeholder="Note for the teacher (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
        <DialogFooter>
          <Button
            disabled={!fileName}
            onClick={() => {
              if (!assignment) return;
              submit(st.id, assignment.id, { fileName, note, at: new Date().toISOString() });
              toast.success("Assignment submitted");
              setFileName("");
              setNote("");
              onClose();
            }}
          >
            Submit assignment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CareerHub() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {JOBS.map((j) => (
        <article key={j.id} className="flex flex-col rounded-lg border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="inline-flex size-9 items-center justify-center rounded-md bg-warning-soft text-amber-foreground"><Briefcase className="size-4" /></span>
            <Badge variant={j.kind === "Internship" ? "default" : "secondary"}>{j.kind}</Badge>
          </div>
          <h2 className="mt-3 font-sans text-base font-semibold">{j.title}</h2>
          <p className="text-sm text-muted-foreground">{j.org}</p>
          <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3.5" /> {j.location}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">{j.tags.map((t) => <Badge key={t} variant="outline">{t}</Badge>)}</div>
          <p className="mt-auto pt-4 text-sm">Apply by <span className="font-semibold">{fmtDate(j.deadline)}</span></p>
        </article>
      ))}
    </div>
  );
}
