"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

export function Card({
  children,
  className,
  interactive = false,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  padded?: boolean;
}) {
  return (
    <section
      className={cn(
        "relative min-w-0 rounded-lg border border-line bg-surface shadow-xs",
        "transition-[box-shadow,border-color,transform] duration-200",
        interactive &&
          "can-hover:-translate-y-px hover:border-line-strong hover:shadow-md focus-within:border-line-strong",
        padded && "p-4",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  className,
  info,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
  info?: string;
}) {
  return (
    <header className={cn("flex flex-wrap items-start justify-between gap-3", className)}>
      <div className="min-w-0 flex-1 basis-32">
        <h2 className="flex items-center gap-1.5 text-[13.5px] font-semibold tracking-[-0.012em] text-ink">
          {title}
          {info ? <InfoDot text={info} /> : null}
        </h2>
        {subtitle ? (
          <p className="mt-0.5 text-[12.5px] leading-snug text-ink-3">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2">{action}</div> : null}
    </header>
  );
}

export function InfoDot({ text }: { text: string }) {
  const id = useId();
  const [position, setPosition] = useState<{ left: number; bottom: number; width: number } | null>(null);
  const show = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const width = Math.min(224, document.documentElement.clientWidth - 24);
    setPosition({ left: Math.max(12, Math.min(rect.left + rect.width / 2 - width / 2, document.documentElement.clientWidth - width - 12)), bottom: window.innerHeight - rect.top + 8, width });
  };
  useEffect(() => {
    if (!position) return;
    const hide = () => setPosition(null);
    window.addEventListener("resize", hide);
    window.addEventListener("scroll", hide, true);
    return () => { window.removeEventListener("resize", hide); window.removeEventListener("scroll", hide, true); };
  }, [position]);
  return (
    <span className="group/info relative inline-flex">
      <button
        type="button"
        aria-label={text}
        aria-describedby={position ? id : undefined}
        onMouseEnter={(event) => show(event.currentTarget)}
        onMouseLeave={() => setPosition(null)}
        onFocus={(event) => show(event.currentTarget)}
        onBlur={() => setPosition(null)}
        onKeyDown={(event) => { if (event.key === "Escape") setPosition(null); }}
        className="grid size-[15px] cursor-help place-items-center rounded-full border border-line-strong text-[11.5px] font-bold text-ink-4 transition-colors group-hover/info:border-brand group-hover/info:text-brand"
      >
        i
      </button>
      {position ? createPortal(<span
        id={id}
        role="tooltip"
        style={position}
        className="pointer-events-none fixed z-50 rounded-md border border-line bg-surface p-2.5 text-[12px] font-normal leading-relaxed text-ink-2 shadow-pop [overflow-wrap:anywhere]"
      >
        {text}
      </span>, document.body) : null}
    </span>
  );
}
