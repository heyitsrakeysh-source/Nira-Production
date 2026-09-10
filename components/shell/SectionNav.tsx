"use client";

/**
 * In-page section rail.
 *
 * A long analytical page is fine as long as the reader can see its shape and
 * jump. Without this, twelve stacked cards is just scrolling and hoping.
 */

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

export interface SectionDef {
  id: string;
  label: string;
  hint?: string;
}

export function SectionNav({ sections, className }: { sections: SectionDef[]; className?: string }) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-84px 0px -68% 0px" },
    );
    for (const s of sections) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav
      aria-label="Sections on this page"
      className={cn(
        "sticky top-[68px] z-30 -mx-1 flex gap-1 overflow-x-auto rounded-lg bg-surface px-1 py-1",
        className,
      )}
    >
      {sections.map((s) => {
        const on = active === s.id;
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            aria-current={on ? "true" : undefined}
            className={cn(
              "shrink-0 rounded-md px-3 py-1.5 text-[12.5px] font-medium whitespace-nowrap",
              "transition-colors duration-[var(--dur-fast)]",
              on ? "bg-surface text-ink shadow-xs" : "text-ink-3 hover:text-ink",
            )}
          >
            {s.label}
          </a>
        );
      })}
    </nav>
  );
}

export function Section({
  id,
  title,
  hint,
  children,
  action,
}: {
  id: string;
  title: string;
  hint?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-[132px]">
      <header className="mt-6 mb-2.5 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-ink">{title}</h2>
          {hint ? <p className="mt-0.5 text-[12.5px] text-ink-3">{hint}</p> : null}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

/** Advanced detail, folded away until asked for. */
export function Disclosure({
  label,
  children,
  count,
}: {
  label: string;
  children: React.ReactNode;
  count?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-line bg-surface">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-4 py-3 text-left"
      >
        <span className="text-[13.5px] font-medium text-ink">{label}</span>
        {count ? <span className="text-[12.5px] text-ink-4">{count}</span> : null}
        <span className="ml-auto text-[12.5px] font-medium text-brand-ink">{open ? "Hide" : "Show"}</span>
      </button>
      {open ? <div className="anim-fade-in border-t border-line p-4">{children}</div> : null}
    </div>
  );
}
