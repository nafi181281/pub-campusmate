import { Link } from "@tanstack/react-router";
import { MapPin, RotateCcw } from "lucide-react";
import logo from "@/assets/pub-crest.jpg.asset.json";
import { useCampus } from "@/lib/campus/store";
import { NAV, ROLE_LABEL } from "./nav";
import { RoleSwitcher } from "./RoleSwitcher";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function BrandStrip() {
  return (
    <div className="flex h-1.5 w-full" aria-hidden>
      <span className="flex-[3] bg-royal" />
      <span className="flex-[2] bg-amber" />
      <span className="flex-[2] bg-leaf" />
      <span className="flex-[2] bg-maroon" />
    </div>
  );
}

export function SiteHeader() {
  const role = useCampus((s) => s.role);
  const resetDemo = useCampus((s) => s.resetDemo);

  return (
    <header className="sticky top-0 z-40">
      {/* Utility bar */}
      <div className="bg-navy-deep text-navy-deep-foreground">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2 text-xs">
          <div className="flex items-center gap-4">
            <span className="hidden items-center gap-1.5 sm:flex">
              <MapPin className="size-3.5 text-amber" /> Bogura, Bangladesh
            </span>
            <span className="hidden md:inline">Learn for Life</span>
          </div>
          <div className="flex flex-1 items-center justify-end gap-2 sm:flex-none">
            <span className="hidden rounded-sm bg-amber px-2 py-0.5 font-semibold uppercase tracking-wider text-amber-foreground sm:inline">
              Demo · {ROLE_LABEL[role]}
            </span>
            <RoleSwitcher className="h-8 w-full min-w-0 border-navy-deep-foreground/25 bg-primary text-xs text-primary-foreground sm:w-64" />
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2 text-navy-deep-foreground hover:bg-primary hover:text-primary-foreground"
              onClick={() => {
                resetDemo();
                toast.success("Demo data reset");
              }}
              aria-label="Reset demo data"
              title="Reset demo data"
            >
              <RotateCcw className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
      {/* Main header */}
      <div className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <img src="/logo.png" alt="Pundra University of Science & Technology logo" className="size-12 shrink-0 rounded-full bg-card object-contain sm:size-14" />
            <div className="min-w-0 leading-tight">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-lg font-bold text-primary sm:text-xl">PUB CampusMate</span>
              </div>
              <p className="truncate text-xs text-muted-foreground sm:text-sm">Pundra University of Science & Technology</p>
              <p className="hidden truncate text-xs text-muted-foreground sm:block">পুণ্ড্র ইউনিভার্সিটি অব সায়েন্স অ্যান্ড টেকনোলজি</p>
            </div>
          </Link>
          <Button asChild className="hidden bg-amber text-amber-foreground hover:bg-amber/90 md:inline-flex">
            <Link to="/helpdesk">
              Ask Jervis
            </Link>
          </Button>
        </div>
      </div>
      {/* Nav */}
      <nav className="bg-primary text-primary-foreground shadow-card" aria-label="Main">
        <div className="scrollbar-none mx-auto flex max-w-7xl gap-1 overflow-x-auto px-2">
          {NAV[role].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="whitespace-nowrap border-b-2 border-transparent px-3 py-3 text-sm font-medium text-primary-foreground/80 transition-colors hover:text-primary-foreground data-[status=active]:border-amber data-[status=active]:text-primary-foreground"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
