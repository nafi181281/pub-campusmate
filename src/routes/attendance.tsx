import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Camera, CheckCircle2, QrCode, StopCircle, Timer, XCircle } from "lucide-react";
import { toast } from "sonner";
import { STUDENTS, courseByCode, studentById } from "@/lib/campus/data";
import { useCampus, type AttendanceSession } from "@/lib/campus/store";
import { useCurrentStudent, useCurrentTeacher, useNow } from "@/lib/campus/hooks";
import { PageHeader } from "@/components/campus/PageHeader";
import { RoleGate } from "@/components/campus/RoleGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/attendance")({
  head: () => ({
    meta: [
      { title: "QR Attendance — PUB CampusMate" },
      { name: "description", content: "Teachers generate time-expiring attendance QR codes; students scan or enter the code to check in." },
      { property: "og:title", content: "QR Attendance — PUB CampusMate" },
      { property: "og:description", content: "Fast, time-limited QR attendance for PUB classes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AttendancePage,
});

function AttendancePage() {
  const role = useCampus((s) => s.role);
  return (
    <>
      <PageHeader eyebrow="Smart campus" title="QR Attendance" titleBn="কিউআর হাজিরা" description="Faculty start a session with a QR code that expires automatically. Students check in before the timer runs out." />
      <RoleGate allow={["faculty", "student"]}>{role === "faculty" ? <TeacherView /> : <StudentView />}</RoleGate>
    </>
  );
}

function remaining(s: AttendanceSession, now: number | null) {
  if (now === null) return null;
  return Math.max(0, Math.ceil((s.expiresAt - now) / 1000));
}

function TeacherView() {
  const t = useCurrentTeacher();
  const published = useCampus((s) => s.published);
  const allSessions = useCampus((s) => s.sessions);
  const sessions = useMemo(() => allSessions.filter((x) => x.teacherId === t.id), [allSessions, t.id]);
  const startSession = useCampus((s) => s.startSession);
  const endSession = useCampus((s) => s.endSession);
  const mine = published.filter((o) => o.teacherId === t.id);
  const [offeringId, setOfferingId] = useState(mine[0]?.id ?? "");
  const [seconds, setSeconds] = useState("60");
  const now = useNow(500);
  const active = sessions[0];
  const left = active ? remaining(active, now) : null;
  const live = left !== null && left > 0;

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[380px_1fr]">
      <div className="rounded-lg border bg-card p-5 shadow-card">
        <h2 className="font-sans text-base font-semibold">Start a session</h2>
        <div className="mt-3 space-y-2">
          <Select value={offeringId} onValueChange={setOfferingId}>
            <SelectTrigger aria-label="Class"><SelectValue placeholder="Choose class" /></SelectTrigger>
            <SelectContent>{mine.map((o) => <SelectItem key={o.id} value={o.id}>{o.courseCode} · Section {o.section}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={seconds} onValueChange={setSeconds}>
            <SelectTrigger aria-label="Expires after"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="30">Expires in 30 seconds</SelectItem>
              <SelectItem value="60">Expires in 1 minute</SelectItem>
              <SelectItem value="180">Expires in 3 minutes</SelectItem>
              <SelectItem value="300">Expires in 5 minutes</SelectItem>
            </SelectContent>
          </Select>
          <Button className="w-full" disabled={!offeringId} onClick={() => { startSession(offeringId, t.id, Number(seconds)); toast.success("Attendance QR generated"); }}>
            <QrCode /> Generate QR code
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Tip: switch to a student in the demo bar and open Attendance to check in with the code.</p>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-card">
        {!active ? (
          <p className="text-sm text-muted-foreground">No session yet. Generate a QR code to begin.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-[auto_1fr]">
            <div className={cn("flex flex-col items-center rounded-xl border p-4", !live && "opacity-40 grayscale")}>
              <QRCodeSVG value={`PUB-ATT:${active.code}`} size={200} fgColor="currentColor" className="text-primary" />
              <p className="mt-3 font-mono text-2xl font-bold tracking-[0.3em]">{active.code}</p>
              <p className={cn("mt-1 flex items-center gap-1.5 text-sm font-semibold", live ? "text-success" : "text-destructive")}>
                <Timer className="size-4" /> {left === null ? "…" : live ? `${left}s remaining` : "Expired"}
              </p>
              {live && <Button size="sm" variant="outline" className="mt-3" onClick={() => endSession(active.id)}><StopCircle /> End now</Button>}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-royal">{active.offeringId.replace("-", " · Section ")}</p>
              <h3 className="font-sans text-lg font-semibold">{courseByCode((active.offeringId.split("-")[0] ?? "").replace(/([A-Z]+)(\d+)/, "$1 $2"))?.title}</h3>
              <p className="mt-3 text-sm font-medium">Checked in: {active.checkins.length}</p>
              <ul className="mt-2 divide-y text-sm">
                {active.checkins.map((c) => (
                  <li key={c.studentId} className="flex items-center gap-2 py-2"><CheckCircle2 className="size-4 text-success" /> {studentById(c.studentId)?.name} <span className="text-muted-foreground">· {c.studentId}</span></li>
                ))}
                {active.checkins.length === 0 && <li className="py-2 text-muted-foreground">Waiting for students…</li>}
              </ul>
              <p className="mt-4 text-xs text-muted-foreground">Absent so far: {STUDENTS.filter((s) => !active.checkins.some((c) => c.studentId === s.id)).map((s) => s.name).join(", ") || "none"}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StudentView() {
  const st = useCurrentStudent();
  const sessions = useCampus((s) => s.sessions);
  const checkIn = useCampus((s) => s.checkIn);
  const now = useNow(1000);
  const [code, setCode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const live = sessions.filter((s) => now !== null && s.expiresAt > now);

  const doCheckIn = (c: string) => {
    const r = checkIn(c, st.id);
    setResult(r);
    if (r.ok) toast.success(r.message);
    else toast.error(r.message);
  };

  const simulateScan = () => {
    setScanning(true);
    setResult(null);
    setTimeout(() => {
      setScanning(false);
      const target = useCampus.getState().sessions.find((s) => s.expiresAt > Date.now());
      if (!target) setResult({ ok: false, message: "No QR code detected. Ask your teacher to display a live session code." });
      else doCheckIn(target.code);
    }, 1800);
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 md:grid-cols-2">
      <div className="rounded-lg border bg-card p-5 shadow-card">
        <h2 className="font-sans text-base font-semibold">Scan the classroom QR</h2>
        <div className="relative mx-auto mt-4 flex size-48 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-royal bg-muted">
          {scanning ? (
            <>
              <span className="animate-scan absolute left-2 right-2 top-2 h-0.5 bg-amber" />
              <Camera className="size-10 text-royal" />
            </>
          ) : (
            <QrCode className="size-12 text-muted-foreground" />
          )}
        </div>
        <Button className="mt-4 w-full" onClick={simulateScan} disabled={scanning}><Camera /> {scanning ? "Scanning…" : "Open camera & scan"}</Button>
        <div className="mt-4 flex gap-2">
          <Input placeholder="Or enter 6-letter code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={6} className="font-mono tracking-widest" />
          <Button variant="secondary" disabled={code.length < 6} onClick={() => doCheckIn(code)}>Check in</Button>
        </div>
        {result && (
          <p className={cn("mt-3 flex items-center gap-1.5 rounded-md p-3 text-sm", result.ok ? "bg-success-soft text-success" : "bg-danger-soft text-destructive")}>
            {result.ok ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />} {result.message}
          </p>
        )}
      </div>
      <div className="rounded-lg border bg-card p-5 shadow-card">
        <h2 className="font-sans text-base font-semibold">Live sessions</h2>
        <ul className="mt-3 divide-y text-sm">
          {live.map((s) => {
            const done = s.checkins.some((c) => c.studentId === st.id);
            return (
              <li key={s.id} className="flex items-center justify-between py-2">
                <span>{s.offeringId.replace("-", " · ")} <span className="text-muted-foreground">· {remaining(s, now)}s</span></span>
                {done ? <span className="text-xs font-semibold text-success">Present</span> : <span className="text-xs text-muted-foreground">Not checked in</span>}
              </li>
            );
          })}
          {live.length === 0 && <li className="py-2 text-muted-foreground">No live attendance session right now.</li>}
        </ul>
        <h3 className="mt-5 font-sans text-sm font-semibold">My attendance log</h3>
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
          {sessions.filter((s) => s.checkins.some((c) => c.studentId === st.id)).map((s) => (
            <li key={s.id} className="flex items-center gap-1.5"><CheckCircle2 className="size-3.5 text-success" /> {s.offeringId.replace("-", " · ")}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
