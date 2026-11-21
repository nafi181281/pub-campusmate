import { Link } from "@tanstack/react-router";
import { BrandStrip } from "./SiteHeader";

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-navy-deep text-navy-deep-foreground">
      <BrandStrip />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="flex gap-4">
          <img
            src="/logo.png"
            alt="PUB logo"
            className="size-16 shrink-0 rounded-full bg-card object-contain p-0.5"
          />
          <div>
            <p className="font-display text-lg font-semibold text-primary-foreground">
              Pundra University of Science & Technology
            </p>
            <p className="text-sm">পুণ্ড্র ইউনিভার্সিটি অব সায়েন্স অ্যান্ড টেকনোলজি</p>
            <p className="mt-2 text-sm opacity-80">Bogura, Bangladesh · Established 2001</p>
            <p className="mt-1 text-sm italic text-amber">Learn for Life</p>
          </div>
        </div>
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-amber">Academics</p>
          <ul className="space-y-2 text-sm">
            <li><Link to="/registration" className="hover:text-primary-foreground">Course Registration</Link></li>
            <li><Link to="/timetable" className="hover:text-primary-foreground">Class Timetable</Link></li>
            <li><Link to="/notices" className="hover:text-primary-foreground">Notices & Exam Routine</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-amber">Campus life</p>
          <ul className="space-y-2 text-sm">
            <li><Link to="/helpdesk" className="hover:text-primary-foreground">Jervis (বাংলা / English)</Link></li>
            <li><Link to="/assignments" className="hover:text-primary-foreground">Assignments & Career Hub</Link></li>
            <li><Link to="/lost-found" className="hover:text-primary-foreground">Lost & Found</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-navy-deep-foreground/15">
        <p className="mx-auto max-w-7xl px-4 py-4 text-xs opacity-70">
          PUB CampusMate — smart campus companion demo for the Department of CSE. Data in this demo is stored in your browser.
        </p>
      </div>
    </footer>
  );
}
