"use client";

import Link from "next/link";
import { BarChart3, CheckCircle2, Code2, Hammer, Radio, Rocket, Settings, UserRound } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const TOOLS: { id: string; label: string; href: string; icon: typeof Radio; match: string[] }[] = [
  { id: "live", label: "Live", href: "/overview", icon: Radio, match: ["/overview", "/brands", "/weekly"] },
  { id: "code", label: "Code", href: "/guide#api", icon: Code2, match: ["/guide"] },
  { id: "test", label: "Test", href: "/integrations", icon: CheckCircle2, match: ["/integrations"] },
  { id: "build", label: "Build", href: "/reports", icon: Hammer, match: ["/reports", "/statement"] },
  { id: "deploy", label: "Deploy", href: "/guide#deploy", icon: Rocket, match: [] },
  { id: "monitor", label: "Monitor", href: "/drr", icon: BarChart3, match: ["/drr", "/forecast", "/product-analytics"] },
] as const;

export function ToolRail() {
  const pathname = usePathname();
  return (
    <nav aria-label="Nira workflow tools" className="border-b border-line bg-surface px-4 py-3 sm:px-7 lg:px-9">
      <div className="mx-auto flex max-w-[1760px] items-center justify-between gap-3 overflow-x-auto">
        <div className="flex min-w-max items-center gap-1.5 sm:gap-2.5">
          {TOOLS.map((tool, index) => {
            const active = tool.match.includes(pathname);
            const Icon = tool.icon;
            return (
              <div key={tool.id} className="flex items-center gap-1.5 sm:gap-2.5">
                <Link
                  href={tool.href}
                  aria-current={active ? "step" : undefined}
                  className={cn(
                    "group flex min-w-[72px] flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[11px] font-semibold transition-colors sm:min-w-[82px]",
                    active ? "bg-brand-soft text-brand-ink" : "text-ink-4 hover:bg-surface-2 hover:text-ink-2",
                  )}
                >
                  <span className={cn("grid size-8 place-items-center rounded-full border text-[12px] transition-colors", active ? "border-brand bg-brand text-[#173f28]" : "border-line-strong bg-surface-2 group-hover:border-brand/60")}>
                    <Icon size={15} strokeWidth={2.1} />
                  </span>
                  {tool.label}
                </Link>
                {index < TOOLS.length - 1 ? <span aria-hidden className="text-line-strong">→</span> : null}
              </div>
            );
          })}
        </div>
        <div className="hidden shrink-0 items-center gap-2 text-ink-4 sm:flex" aria-label="Account and settings">
          <span className="grid size-8 place-items-center rounded-full border border-line bg-surface-2 text-brand-ink"><UserRound size={15} /></span>
          <span className="grid size-8 place-items-center rounded-lg border border-line bg-surface-2"><Settings size={15} /></span>
        </div>
      </div>
    </nav>
  );
}