import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  pending: "bg-warning-soft text-warning-foreground",
  approved: "bg-success-soft text-success",
  rejected: "bg-danger-soft text-destructive",
};

const labels: Record<string, string> = { draft: "Draft", pending: "Pending Approval", approved: "Approved", rejected: "Rejected" };

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", styles[status] ?? styles["draft"], className)}>{labels[status] ?? status}</span>;
}
