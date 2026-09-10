"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsLeft, Command } from "lucide-react";
import { NAV } from "@/lib/nav";
import { cn } from "@/lib/cn";
import { Logo, Wordmark } from "./Logo";
import { Kbd } from "@/components/ui/Bits";
import { useWorkspace } from "@/lib/store";

export function Sidebar({
  collapsed,
  onToggle,
  onOpenPalette,
  mobileOpen,
  onCloseMobile,
}: {
  collapsed: boolean;
  onToggle: () => void;
  onOpenPalette: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const pathname = usePathname();
  const { completeness } = useWorkspace();

  return (
    <>
      {mobileOpen ? (
        <button
          aria-label="Close navigation"
          onClick={onCloseMobile}
          className="anim-fade-in fixed inset-0 z-40 lg:hidden"
          style={{ background: "var(--overlay)" }}
        />
      ) : null}

      <aside
        data-print-hide
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-line bg-surface",
          "transition-[width,transform] duration-260 ease-[var(--ease-out)]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
        style={{ width: collapsed ? "var(--sidebar-w-collapsed)" : "var(--sidebar-w)" }}
      >
        {/* brand */}
        <div className={cn("relative flex h-[68px] shrink-0 items-center gap-2.5 border-b border-line", collapsed ? "justify-center px-3" : "px-5")}>
          <Link href="/overview" className="flex items-center gap-2.5" aria-label="Nira home">
            <Logo size={26} />
            {!collapsed ? <Wordmark /> : null}
          </Link>
          <button
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "hidden size-7 place-items-center rounded-md text-ink-4 transition-colors hover:bg-surface-3 hover:text-ink lg:grid",
              collapsed ? "absolute right-2 top-2" : "ml-auto",
            )}
          >
            <ChevronsLeft size={15} className={collapsed ? "rotate-180" : undefined} />
          </button>
        </div>

        {/* search trigger */}
        <div className={cn("shrink-0 py-4", collapsed ? "px-2.5" : "px-4")}>
          <button
            onClick={onOpenPalette}
            className={cn(
              "group flex w-full items-center rounded-md border border-line bg-surface-2 text-ink-3",
              "transition-colors hover:border-line-strong hover:text-ink-2",
              collapsed ? "h-8 justify-center" : "h-8.5 gap-2 px-2.5 py-1.5",
            )}
            aria-label="Open command palette"
          >
            <Command size={14} className="shrink-0" />
            {!collapsed ? (
              <>
                <span className="text-[12.5px]">Search or jump to…</span>
                <span className="ml-auto flex gap-0.5">
                  <Kbd>⌘</Kbd>
                  <Kbd>K</Kbd>
                </span>
              </>
            ) : null}
          </button>
        </div>

        {/* nav */}
        <nav className={cn("min-h-0 flex-1 overflow-y-auto pb-3", collapsed ? "px-2.5" : "px-3")}>
          {NAV.map((group) => (
            <div key={group.id} className="mb-5">
              {!collapsed ? (
                <p className="label-xs mb-1.5 px-2.5 text-[11.5px]">{group.label}</p>
              ) : (
                <div className="mx-auto mb-2 h-px w-6 bg-line" />
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.soon ? "#" : item.href}
                        onClick={(e) => {
                          if (item.soon) e.preventDefault();
                          else onCloseMobile();
                        }}
                        aria-disabled={item.soon}
                        aria-current={active ? "page" : undefined}
                        title={collapsed ? item.label : undefined}
                        className={cn(
                          "group relative flex items-center rounded-md text-[13.5px] font-medium",
                          "transition-[background-color,color] duration-150",
                          collapsed ? "h-9 justify-center" : "h-9 gap-2.5 px-2.5",
                          item.soon
                            ? "cursor-not-allowed text-ink-4"
                            : active
                              ? "bg-surface-3 font-semibold text-ink"
                              : "text-ink-2 hover:bg-surface-3 hover:text-ink",
                        )}
                      >
                        {active ? (
                          <span
                            aria-hidden
                            className="absolute top-1.5 bottom-1.5 -left-3 w-[3px] rounded-r-full bg-brand"
                          />
                        ) : null}
                        <Icon size={16} strokeWidth={active ? 2.3 : 1.9} className="shrink-0" />
                        {!collapsed ? (
                          <>
                            <span className="truncate">{item.label}</span>
                            {item.soon ? (
                              <span className="ml-auto rounded-full bg-surface-3 px-1.5 py-0.5 text-[11.5px] font-semibold tracking-wide text-ink-4 ">
                                Soon
                              </span>
                            ) : null}
                          </>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* data health footer */}
        {!collapsed ? (
          <div className="shrink-0 border-t border-line p-3">
            <Link
              href="/statement"
              className="block rounded-lg border border-line bg-surface-2 p-3 transition-colors hover:border-line-strong"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11.5px] font-semibold text-ink">Data health</span>
                <span className="tnum text-[11.5px] font-bold text-brand-ink">
                  {completeness.pct.toFixed(0)}%
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${completeness.pct}%`, transition: "width 260ms var(--ease-out)" }}
                />
              </div>
              <p className="mt-1.5 text-[11.5px] text-ink-3">
                {completeness.missing} input{completeness.missing === 1 ? "" : "s"} still missing
              </p>
            </Link>
          </div>
        ) : null}
      </aside>
    </>
  );
}
