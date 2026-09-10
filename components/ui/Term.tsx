"use client";

/**
 * A labelled term.
 *
 * Renders whichever vocabulary the reader chose, and always carries the
 * explanation plus the other name on hover. Nobody should have to already
 * know a word to read the screen, and nobody should lose the precise term
 * either.
 */

import { useWorkspace } from "@/lib/store";
import { label as pickLabel, term as lookup } from "@/lib/terms";
import { cn } from "@/lib/cn";

export function Term({
  id,
  short = false,
  className,
  plainOnly = false,
}: {
  id: string;
  short?: boolean;
  className?: string;
  /** Skip the dotted underline where the surrounding text is already small. */
  plainOnly?: boolean;
}) {
  const { plainMode } = useWorkspace();
  const t = lookup(id);
  const text = pickLabel(id, plainMode, short);
  if (!t || plainOnly) return <>{text}</>;

  const other = plainMode ? t.finance : t.plain;

  return (
    <span className="group/term relative inline-flex items-baseline">
      <span
        className={cn(
          "cursor-help decoration-line-strong decoration-dotted underline-offset-[3px] hover:decoration-brand",
          "underline",
          className,
        )}
      >
        {text}
      </span>
      <span
        role="tooltip"
        className={
          "pointer-events-none absolute bottom-full left-0 z-50 mb-1.5 w-60 origin-bottom scale-[0.97] " +
          "rounded-md border border-line bg-surface p-2.5 text-left text-[11.5px] leading-relaxed " +
          "font-normal text-ink-2 opacity-0 shadow-pop transition-[opacity,transform] " +
          "duration-[var(--dur-fast)] ease-[var(--ease-out)] group-hover/term:scale-100 " +
          "group-hover/term:opacity-100 group-hover/term:delay-[350ms]"
        }
      >
        <span className="block font-semibold text-ink">{text}</span>
        <span className="mt-0.5 block">{t.explain}</span>
        <span className="mt-1.5 block border-t border-line pt-1.5 text-[11.5px] text-ink-4">
          Also called {other}
        </span>
      </span>
    </span>
  );
}

/** The plain string only, for places that cannot host an element. */
export function useTermLabel() {
  const { plainMode } = useWorkspace();
  return (id: string, short = false) => pickLabel(id, plainMode, short);
}
