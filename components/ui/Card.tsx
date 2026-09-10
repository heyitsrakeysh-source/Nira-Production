import type { ReactNode } from "react";
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
        "relative rounded-lg border border-line bg-surface shadow-xs",
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
    <header className={cn("flex items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        <h2 className="flex items-center gap-1.5 text-[13.5px] font-semibold tracking-[-0.012em] text-ink">
          {title}
          {info ? <InfoDot text={info} /> : null}
        </h2>
        {subtitle ? (
          <p className="mt-0.5 text-[12.5px] leading-snug text-ink-3">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
    </header>
  );
}

export function InfoDot({ text }: { text: string }) {
  return (
    <span className="group/info relative inline-flex">
      <button
        type="button"
        aria-label={text}
        className="grid size-[15px] cursor-help place-items-center rounded-full border border-line-strong text-[11.5px] font-bold text-ink-4 transition-colors group-hover/info:border-brand group-hover/info:text-brand"
      >
        i
      </button>
      <span className="sr-only">{text}</span>
      <span
        role="tooltip"
        className={
          // Origin-aware and delayed: a tooltip that fires the instant the
          // pointer grazes it is noise, not help.
          "pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-56 origin-bottom " +
          "-translate-x-1/2 scale-[0.97] rounded-md border border-line bg-surface p-2.5 " +
          "text-[11.5px] font-normal leading-relaxed text-ink-2 opacity-0 shadow-pop " +
          "transition-[opacity,transform] duration-[var(--dur-fast)] ease-[var(--ease-out)] " +
          "group-hover/info:scale-100 group-hover/info:opacity-100 group-hover/info:delay-[400ms] " +
          "group-focus-within/info:scale-100 group-focus-within/info:opacity-100"
        }
      >
        {text}
      </span>
    </span>
  );
}
