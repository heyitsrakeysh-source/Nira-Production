"use client";

import Link from "next/link";
import { BarChart3, FileText, Gauge, LayoutDashboard, PackageSearch, Settings, UserRound } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const TOOLS: { id: string; label: string; href: string; icon: typeof LayoutDashboard; match: string[] }[] = [
  { id: "portfolio", label: "Portfolio", href: "/brands", icon: LayoutDashboard, match: ["/brands"] },
  { id: "overview", label: "Overview", href: "/overview", icon: BarChart3, match: ["/overview", "/weekly"] },
  { id: "report", label: "Detail report", href: "/scrum", icon: FileText, match: ["/scrum", "/story", "/statement", "/reports"] },
  { id: "unit", label: "Unit economics", href: "/unit-economics", icon: Gauge, match: ["/unit-economics"] },
  { id: "products", label: "Product analytics", href: "/product-analytics", icon: PackageSearch, match: ["/product-analytics"] },
  { id: "monitor", label: "Monitor", href: "/drr", icon: BarChart3, match: ["/drr", "/forecast", "/explorer"] },
] as const;

export function ToolRail() {
  const pathname = usePathname();
  return (
    <nav aria-label="Nira workflow tools" className="min-w-0 border-b border-line bg-surface px-4 py-3 sm:px-7 lg:px-9">
      <div className="mx-auto flex max-w-[1760px] min-w-0 items-center justify-between gap-3">
        <div className="grid min-w-0 flex-1 grid-cols-3 gap-1.5 md:flex md:items-center lg:gap-2.5">
          {TOOLS.map((tool, index) => {
            const active = tool.match.includes(pathname);
            const Icon = tool.icon;
            return (
              <div key={tool.id} className="flex min-w-0 items-center md:flex-1 lg:flex-none lg:gap-2.5">
                <Link
                  href={tool.href}
                  aria-current={active ? "step" : undefined}
                  className={cn(
                    "group flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1.5 py-1.5 text-center text-[11px] leading-snug font-semibold transition-colors sm:px-2 lg:min-w-[82px]",
                    active ? "bg-brand-soft text-brand-ink" : "text-ink-4 hover:bg-surface-2 hover:text-ink-2",
                  )}
                >
                  <span className={cn("grid size-8 place-items-center rounded-full border text-[12px] transition-colors", active ? "border-brand bg-brand text-[#173f28]" : "border-line-strong bg-surface-2 group-hover:border-brand/60")}>
                    <Icon size={15} strokeWidth={2.1} />
                  </span>
                  {tool.label}
                </Link>
                {index < TOOLS.length - 1 ? <span aria-hidden className="hidden shrink-0 text-line-strong lg:inline">→</span> : null}
              </div>
            );
          })}
        </div>
        <div className="hidden shrink-0 items-center gap-2 text-ink-4 lg:flex" aria-label="Account and settings">
          <span className="grid size-8 place-items-center rounded-full border border-line bg-surface-2 text-brand-ink"><UserRound size={15} /></span>
          <span className="grid size-8 place-items-center rounded-lg border border-line bg-surface-2"><Settings size={15} /></span>
        </div>
      </div>
    </nav>
  );
}
