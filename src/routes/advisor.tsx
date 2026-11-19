import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Inbox, XCircle } from "lucide-react";
import { toast } from "sonner";
import { ADVISOR, COURSES, STUDENTS, studentById, type Offering } from "@/lib/campus/data";
import { checkSelection } from "@/lib/campus/rules";
import { fmtDate } from "@/lib/campus/format";
import { useCampus } from "@/lib/campus/store";
import { PageHeader } from "@/components/campus/PageHeader";
import { RoleGate } from "@/components/campus/RoleGate";
import { StatusBadge } from "@/components/campus/StatusBadge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/advisor")({
  head: () => ({
    meta: [
      { title: "Advisor Desk — PUB CampusMate" },
      { name: "description", content: "Review CSE student registration requests, approve or reject with comments and manage add/drop petitions." },
      { property: "og:title", content: "Advisor Desk — PUB CampusMate" },
      { property: "og:description", content: "Registration approvals and add/drop petitions for the Department of CSE, PUB." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdvisorPage,
});

function AdvisorPage() {
  return (
    <>
      <PageHeader eyebrow="Academic Advisor" title="Advisor Desk" titleBn="উপদেষ্টা ডেস্ক" description={`${ADVISOR.name} — ${ADVISOR.designation}`} />
      <RoleGate allow={["advisor"]}>
        <AdvisorBody />
      </RoleGate>
    </>
  );
}

function AdvisorBody() {
  const petitions = useCampus((s) => s.petitions);
  const regs = useCampus((s) => s.registrations);
  const pendingCount = Object.values(regs).filter((r) => r.status === "pending").length;
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Tabs defaultValue="requests">
        <TabsList>
          <TabsTrigger value="requests">Registration requests ({pendingCount} pending)</TabsTrigger>
          <TabsTrigger value="petitions">Add / drop petitions ({petitions.filter((p) => p.status === "pending").length})</TabsTrigger>
        </TabsList>
        <TabsContent value="requests" className="mt-4 space-y-4">
          {STUDENTS.map((s) => (
            <RequestCard key={s.id} studentId={s.id} />
          ))}
        </TabsContent>
        <TabsContent value="petitions" className="mt-4">
          <Petitions />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RequestCard({ studentId }: { studentId: string }) {
  const st = studentById(studentId)!;
  const reg = useCampus((s) => s.registrations[studentId]);
  const published = useCampus((s) => s.published);
  const decide = useCampus((s) => s.decideRegistration);
  const [comment, setComment] = useState("");

  const selected = (reg?.offeringIds ?? []).map((id) => published.find((o) => o.id === id)).filter(Boolean) as Offering[];
  const check = checkSelection(st, selected);
  const status = reg?.status ?? "draft";

  return (
    <article className="rounded-lg border bg-card p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{st.name} <span className="text-muted-foreground">· ID {st.id}</span></p>
          <p className="text-sm text-muted-foreground">CGPA {st.cgpa.toFixed(2)} · Section {st.section} · {st.completedCredits} credits completed</p>
        </div>
        <StatusBadge status={status} />
      </div>
      {!reg || reg.offeringIds.length === 0 ? (
        <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground"><Inbox className="size-4" /> No registration submitted yet.</p>
      ) : (
        <>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr><th className="py-1.5">Course</th><th>Title</th><th>Section</th><th className="text-right">Cr</th></tr>
              </thead>
              <tbody className="divide-y">
                {selected.map((o) => {
                  const c = COURSES.find((x) => x.code === o.courseCode)!;
                  return (
                    <tr key={o.id}>
                      <td className="py-1.5 font-medium">{c.code}</td>
                      <td>{c.title}</td>
                      <td>{o.section}</td>
                      <td className="text-right">{c.credits.toFixed(1)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-sm">
            Total <span className="font-semibold">{check.totalCredits}</span> credits ·{" "}
            {check.ok ? <span className="text-success">All system checks passed</span> : <span className="text-destructive">{check.errors.join(" ")}</span>}
          </p>
          {reg.submittedAt && <p className="text-xs text-muted-foreground">Submitted {fmtDate(reg.submittedAt.slice(0, 10))}</p>}
          {reg.advisorComment && <p className="mt-2 text-sm"><span className="font-semibold">Your comment:</span> {reg.advisorComment}</p>}
          {status === "pending" && (
            <div className="mt-4 space-y-2">
              <Textarea placeholder="Comment for the student (optional for approval, required for rejection)" value={comment} onChange={(e) => setComment(e.target.value)} />
              <div className="flex flex-wrap gap-2">
                <Button
                  className="bg-success text-success-foreground hover:bg-success/90"
                  onClick={() => {
                    decide(studentId, true, comment.trim() || "Approved. Best wishes for the semester.");
                    toast.success(`Approved ${st.name}'s registration`);
                  }}
                >
                  <CheckCircle2 /> Approve
                </Button>
                <Button
                  variant="destructive"
                  disabled={comment.trim().length < 3}
                  onClick={() => {
                    decide(studentId, false, comment.trim());
                    toast(`Returned ${st.name}'s registration with comments`);
                  }}
                >
                  <XCircle /> Reject with comment
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </article>
  );
}

function Petitions() {
  const petitions = useCampus((s) => s.petitions);
  const decide = useCampus((s) => s.decidePetition);
  const [comments, setComments] = useState<Record<string, string>>({});
  if (petitions.length === 0)
    return <p className="rounded-lg border bg-card p-6 text-sm text-muted-foreground shadow-card">No petitions yet. Students can file add/drop petitions after their registration is approved.</p>;
  return (
    <div className="space-y-3">
      {petitions.map((p) => {
        const st = studentById(p.studentId);
        return (
          <div key={p.id} className="rounded-lg border bg-card p-4 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold capitalize">{p.kind} · {p.offeringId.replace("-", " Section ")}</p>
              <StatusBadge status={p.status} />
            </div>
            <p className="text-sm text-muted-foreground">{st?.name} ({p.studentId}) · {fmtDate(p.createdAt.slice(0, 10))}</p>
            <p className="mt-2 text-sm">“{p.reason}”</p>
            {p.status === "pending" ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <input
                  className="h-9 min-w-56 flex-1 rounded-md border bg-background px-3 text-sm"
                  placeholder="Comment"
                  value={comments[p.id] ?? ""}
                  onChange={(e) => setComments({ ...comments, [p.id]: e.target.value })}
                />
                <Button size="sm" onClick={() => { decide(p.id, true, comments[p.id] || "Approved."); toast.success("Petition approved"); }}>Approve</Button>
                <Button size="sm" variant="outline" onClick={() => { decide(p.id, false, comments[p.id] || "Rejected."); toast("Petition rejected"); }}>Reject</Button>
              </div>
            ) : (
              p.comment && <p className="mt-2 text-xs text-muted-foreground">Comment: {p.comment}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
