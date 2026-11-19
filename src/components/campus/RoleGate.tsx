import type { ReactNode } from "react";
import { ShieldAlert } from "lucide-react";
import { useCampus, type Role } from "@/lib/campus/store";
import { ROLE_LABEL } from "./nav";
import { Button } from "@/components/ui/button";

export function RoleGate({ allow, children }: { allow: Role[]; children: ReactNode }) {
  const role = useCampus((s) => s.role);
  const setRole = useCampus((s) => s.setRole);
  if (allow.includes(role)) return <>{children}</>;
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <div className="rounded-lg border bg-card p-8 text-center shadow-card">
        <ShieldAlert className="mx-auto size-10 text-amber" />
        <h2 className="mt-3 text-xl font-semibold">This desk is for {allow.map((r) => ROLE_LABEL[r]).join(" / ")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">You are viewing the {ROLE_LABEL[role]} portal. Switch role from the demo bar at the top, or jump straight in:</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {allow.map((r) => (
            <Button key={r} onClick={() => setRole(r)}>
              Open as {ROLE_LABEL[r]}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
