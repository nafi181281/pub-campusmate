import type { ReactNode } from "react";

export function PageHeader({ eyebrow, title, titleBn, description, actions }: { eyebrow: string; title: string; titleBn?: string; description?: string; actions?: ReactNode }) {
  return (
    <section className="bg-gradient-navy text-primary-foreground">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">{title}</h1>
          {titleBn && <p className="mt-1 text-lg text-primary-foreground/80">{titleBn}</p>}
          {description && <p className="mt-3 text-sm text-primary-foreground/75 md:text-base">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </section>
  );
}
