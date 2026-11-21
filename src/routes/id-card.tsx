import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Droplet, RefreshCw } from "lucide-react";
import { useCurrentStudent } from "@/lib/campus/hooks";
import { PageHeader } from "@/components/campus/PageHeader";
import { RoleGate } from "@/components/campus/RoleGate";
import { BrandStrip } from "@/components/campus/SiteHeader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/id-card")({
  head: () => ({
    meta: [
      { title: "Digital Student ID Card — PUB CampusMate" },
      { name: "description", content: "Flip-able digital student ID card with QR code, barcode, department, blood group and validity for PUB students." },
      { property: "og:title", content: "Digital Student ID Card — PUB CampusMate" },
      { property: "og:description", content: "Your PUB student ID with QR and barcode, always in your pocket." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: IdCardPage,
});

function IdCardPage() {
  return (
    <>
      <PageHeader eyebrow="Smart campus" title="Digital Student ID" titleBn="ডিজিটাল স্টুডেন্ট আইডি কার্ড" description="Tap the card to flip it. Show the QR code at the library, labs and exam hall." />
      <RoleGate allow={["student"]}>
        <IdCard />
      </RoleGate>
    </>
  );
}

function Barcode({ value }: { value: string }) {
  // Deterministic visual barcode derived from the ID digits.
  const bars: number[] = [];
  for (const ch of `*${value}*`) {
    const code = ch === "*" ? 42 : ch.charCodeAt(0);
    for (let i = 0; i < 6; i++) bars.push(((code >> i) & 1) + 1, ((code >> (5 - i)) & 1) + 1);
  }
  let x = 0;
  return (
    <svg viewBox={`0 0 ${bars.reduce((a, b) => a + b, 0)} 40`} className="h-12 w-full" preserveAspectRatio="none" role="img" aria-label={`Barcode ${value}`}>
      {bars.map((w, i) => {
        const rect = i % 2 === 0 ? <rect key={i} x={x} y={0} width={w} height={40} className="fill-foreground" /> : null;
        x += w;
        return rect;
      })}
    </svg>
  );
}

function IdCard() {
  const st = useCurrentStudent();
  const [flipped, setFlipped] = useState(false);
  const initials = st.name.split(" ").map((p) => p[0]).join("");

  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-10">
      <button type="button" onClick={() => setFlipped(!flipped)} className="flip-card h-[520px] w-[330px] text-left" aria-label="Flip ID card">
        <div className={cn("flip-inner relative size-full", flipped && "rotate-y-180")}>
          {/* Front */}
          <div className="flip-face absolute inset-0 flex flex-col overflow-hidden rounded-2xl border bg-card shadow-lift">
            <div className="bg-gradient-navy px-5 pb-12 pt-5 text-primary-foreground">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="PUB logo" className="size-12 rounded-full bg-card object-contain p-0.5" />
                <div className="leading-tight">
                  <p className="text-sm font-semibold">Pundra University of</p>
                  <p className="text-sm font-semibold">Science & Technology</p>
                  <p className="text-[10px] text-primary-foreground/70">Bogura, Bangladesh</p>
                </div>
              </div>
            </div>
            <BrandStrip />
            <div className="-mt-10 flex flex-col items-center px-5">
              <div className="flex size-24 items-center justify-center rounded-xl border-4 border-card bg-royal font-display text-3xl font-bold text-royal-foreground shadow-card">{initials}</div>
              <p className="mt-3 text-xl font-bold text-primary">{st.name}</p>
              <p className="text-sm text-muted-foreground">{st.nameBn}</p>
              <span className="mt-2 rounded-full bg-amber px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-amber-foreground">Student</span>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 px-6 text-sm">
              <div><dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Student ID</dt><dd className="font-semibold">{st.id}</dd></div>
              <div><dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Department</dt><dd className="font-semibold">CSE</dd></div>
              <div><dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Program</dt><dd className="font-semibold">B.Sc. in CSE</dd></div>
              <div><dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Blood group</dt><dd className="flex items-center gap-1 font-semibold text-destructive"><Droplet className="size-3.5" /> {st.bloodGroup}</dd></div>
            </dl>
            <div className="mt-auto px-6 pb-5"><Barcode value={st.id} /></div>
          </div>
          {/* Back */}
          <div className="flip-face rotate-y-180 absolute inset-0 flex flex-col items-center overflow-hidden rounded-2xl border bg-card p-6 shadow-lift">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-royal">Scan to verify</p>
            <div className="mt-4 rounded-xl border bg-card p-3">
              <QRCodeSVG value={`PUB-ID:${st.id}|${st.name}|CSE|VALID:2029-12-31`} size={170} fgColor="currentColor" className="text-primary" />
            </div>
            <dl className="mt-5 w-full space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Valid till</dt><dd className="font-semibold">31 Dec 2029</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Emergency</dt><dd className="font-semibold">{st.phone}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Section</dt><dd className="font-semibold">2nd Year · {st.section}</dd></div>
            </dl>
            <p className="mt-auto text-center text-[11px] text-muted-foreground">If found, please return to the Registrar Office, Pundra University of Science & Technology, Bogura.</p>
          </div>
        </div>
      </button>
      <Button variant="outline" onClick={() => setFlipped(!flipped)}><RefreshCw /> Flip card</Button>
    </div>
  );
}
