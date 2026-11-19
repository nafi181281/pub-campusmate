import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { fmtDate } from "@/lib/campus/format";
import { useCampus } from "@/lib/campus/store";
import { PageHeader } from "@/components/campus/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/lost-found")({
  head: () => ({
    meta: [
      { title: "Lost & Found — PUB CampusMate" },
      { name: "description", content: "Quick campus board to report lost items and found belongings at Pundra University of Science & Technology." },
      { property: "og:title", content: "Lost & Found — PUB CampusMate" },
      { property: "og:description", content: "Report and find misplaced items on the PUB campus." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LostFoundPage,
});

function LostFoundPage() {
  const items = useCampus((s) => s.lostFound);
  const addLost = useCampus((s) => s.addLost);
  const toggleResolved = useCampus((s) => s.toggleResolved);
  const [filter, setFilter] = useState<"All" | "Lost" | "Found">("All");
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<"Lost" | "Found">("Lost");
  const [title, setTitle] = useState("");
  const [place, setPlace] = useState("");
  const [contact, setContact] = useState("");

  const list = items.filter((i) => (filter === "All" || i.kind === filter) && (i.title + i.place).toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <PageHeader eyebrow="Campus community" title="Lost & Found" titleBn="হারানো ও প্রাপ্তি" />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[1fr_340px]">
        <section>
          <div className="flex flex-wrap items-center gap-2">
            {(["All", "Lost", "Found"] as const).map((f) => (
              <button key={f} type="button" onClick={() => setFilter(f)} className={cn("rounded-full border px-3 py-1 text-sm", filter === f ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-royal")}>{f}</button>
            ))}
            <div className="relative ml-auto w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input className="pl-8" placeholder="Search items" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {list.map((i) => (
              <article key={i.id} className={cn("rounded-lg border bg-card p-4 shadow-card", i.resolved && "opacity-60")}>
                <div className="flex items-center justify-between">
                  <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", i.kind === "Lost" ? "bg-danger-soft text-destructive" : "bg-success-soft text-success")}>{i.kind}</span>
                  <span className="text-xs text-muted-foreground">{fmtDate(i.date)}</span>
                </div>
                <h2 className={cn("mt-2 font-sans text-base font-semibold", i.resolved && "line-through")}>{i.title}</h2>
                <p className="text-sm text-muted-foreground">{i.place} · Contact: {i.contact}</p>
                <Button size="sm" variant="ghost" className="mt-2 px-2" onClick={() => toggleResolved(i.id)}>
                  {i.resolved ? "Mark as open" : i.kind === "Lost" ? "Mark as recovered" : "Mark as returned"}
                </Button>
              </article>
            ))}
            {list.length === 0 && <p className="text-sm text-muted-foreground">No items match.</p>}
          </div>
        </section>
        <aside className="rounded-lg border bg-card p-5 shadow-card lg:sticky lg:top-44 lg:self-start">
          <h2 className="flex items-center gap-2 font-sans text-base font-semibold"><Plus className="size-4 text-royal" /> Post an item</h2>
          <div className="mt-3 space-y-2">
            <Select value={kind} onValueChange={(v) => setKind(v as "Lost" | "Found")}>
              <SelectTrigger aria-label="Type"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="Lost">I lost something</SelectItem><SelectItem value="Found">I found something</SelectItem></SelectContent>
            </Select>
            <Input placeholder="What is it?" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input placeholder="Where? (e.g. Room 301)" value={place} onChange={(e) => setPlace(e.target.value)} />
            <Input placeholder="How to reach you" value={contact} onChange={(e) => setContact(e.target.value)} />
            <Button
              className="w-full"
              disabled={!title.trim() || !place.trim() || !contact.trim()}
              onClick={() => {
                addLost({ kind, title: title.trim(), place: place.trim(), contact: contact.trim(), date: new Date().toISOString().slice(0, 10) });
                setTitle(""); setPlace(""); setContact("");
                toast.success("Posted to the board");
              }}
            >
              Post to board
            </Button>
          </div>
        </aside>
      </div>
    </>
  );
}
