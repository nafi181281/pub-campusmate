import { DAYS, DAY_LABEL, SLOTS, courseByCode, teacherById, type Meeting, type Offering } from "@/lib/campus/data";
import { fmtTime, toMinutes } from "@/lib/campus/format";
import { cn } from "@/lib/utils";

type Item = { o: Offering; mt: Meeting };

function slotIndexForStart(t: string) {
  const m = toMinutes(t);
  let idx = 0;
  SLOTS.forEach((s, i) => {
    if (toMinutes(s.start) <= m) idx = i;
  });
  return idx;
}
function slotIndexForEnd(t: string) {
  const m = toMinutes(t);
  const i = SLOTS.findIndex((s) => toMinutes(s.end) >= m);
  return i === -1 ? SLOTS.length - 1 : i;
}

function overlaps(a: Meeting, b: Meeting) {
  return toMinutes(a.start) < toMinutes(b.end) && toMinutes(b.start) < toMinutes(a.end);
}

export function TimetableGrid({ offerings, highlight = new Set<string>(), compact = false }: { offerings: Offering[]; highlight?: Set<string>; compact?: boolean }) {
  const clusters: { day: number; from: number; to: number; items: Item[] }[] = [];
  DAYS.forEach((day, di) => {
    const items: Item[] = offerings.flatMap((o) => o.meetings.filter((mt) => mt.day === day).map((mt) => ({ o, mt })));
    items.sort((a, b) => toMinutes(a.mt.start) - toMinutes(b.mt.start));
    const groups: Item[][] = [];
    for (const it of items) {
      const g = groups.find((grp) => grp.some((x) => overlaps(x.mt, it.mt)));
      if (g) g.push(it);
      else groups.push([it]);
    }
    for (const g of groups) {
      clusters.push({
        day: di,
        from: Math.min(...g.map((x) => slotIndexForStart(x.mt.start))),
        to: Math.max(...g.map((x) => slotIndexForEnd(x.mt.end))),
        items: g,
      });
    }
  });

  return (
    <div className="overflow-x-auto rounded-lg border bg-card shadow-card">
      <div
        className="grid min-w-[760px]"
        style={{ gridTemplateColumns: "92px repeat(5, minmax(0, 1fr))", gridTemplateRows: `auto repeat(${SLOTS.length}, minmax(${compact ? 64 : 92}px, auto))` }}
      >
        <div className="border-b bg-muted/60 p-2" />
        {DAYS.map((d) => (
          <div key={d} className="border-b border-l bg-primary p-2 text-center text-sm font-semibold text-primary-foreground">
            {DAY_LABEL[d]}
          </div>
        ))}
        {SLOTS.map((s, si) => (
          <div key={s.id} className="border-b bg-muted/60 p-2 text-[11px] leading-tight text-muted-foreground" style={{ gridColumn: 1, gridRow: si + 2 }}>
            <p className="font-semibold text-foreground">{fmtTime(s.start)}</p>
            <p>{fmtTime(s.end)}</p>
          </div>
        ))}
        {SLOTS.map((s, si) =>
          DAYS.map((d, di) => <div key={`${s.id}-${d}`} className="border-b border-l" style={{ gridColumn: di + 2, gridRow: si + 2 }} />),
        )}
        {clusters.map((c, ci) => {
          const clash = c.items.length > 1;
          return (
            <div key={ci} className="flex gap-1 p-1" style={{ gridColumn: c.day + 2, gridRow: `${c.from + 2} / ${c.to + 3}` }}>
              {c.items.map(({ o, mt }, i) => {
                const course = courseByCode(o.courseCode);
                const isLab = course?.kind === "lab";
                const hot = clash || highlight.has(o.id);
                return (
                  <div
                    key={i}
                    className={cn(
                      "flex min-w-0 flex-1 flex-col rounded-md border-l-4 p-2 text-xs",
                      isLab ? "border-amber bg-warning-soft" : "border-royal bg-accent",
                      hot && "border-destructive bg-danger-soft ring-1 ring-destructive",
                    )}
                  >
                    <p className="font-semibold text-foreground">{o.courseCode} <span className="font-normal text-muted-foreground">· {o.section}</span></p>
                    {!compact && <p className="line-clamp-2 text-[11px] text-muted-foreground">{course?.title}</p>}
                    <p className="mt-auto pt-1 text-[11px]">{mt.room}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{teacherById(o.teacherId)?.name}</p>
                    {hot && <p className="text-[10px] font-bold uppercase text-destructive">Clash</p>}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
