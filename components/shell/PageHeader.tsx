"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative flex flex-wrap items-start justify-between gap-5 border-b border-line pb-5", className)}>
      <div className="min-w-0">
        {eyebrow ? <div className="mb-1.5 flex items-center gap-2">{eyebrow}</div> : null}
        <h1 className="text-[30px] leading-[1.08] font-semibold tracking-[-0.035em] text-ink sm:text-[32px]">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-2.5 max-w-3xl text-[13.5px] leading-[1.65] text-ink-3">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function PageShell({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[1760px] px-4 py-6 sm:px-7 lg:px-9 lg:py-8", className)}>{children}</div>;
}
