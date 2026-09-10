"use client";

import Link from "next/link";
import { ArrowRight, CalendarRange } from "lucide-react";
import { useWorkspace } from "@/lib/store";
import { money, num, pct } from "@/lib/format";
import { Chip, StatusBadge } from "@/components/ui/Bits";
import { PageHeader, PageShell } from "@/components/shell/PageHeader";

export default function WeeklyPage() {
  const { brand, current, comparison } = useWorkspace();
  const weights = [0.22, 0.24, 0.26, 0.28];
  const weeks = weights.map((weight, index) => ({
    label: `Week ${index + 1}`,
    revenue: current.totalRevenue * weight,
    spend: (current.totalMarketing + current.totalOperationalCosts) * weight,
    orders: Math.round(current.orders * weight),
    profit: current.netProfit * weight,
  }));
  const previous = weeks[weeks.length - 2];
  const latest = weeks[weeks.length - 1];
  const revenueDelta = previous ? ((latest.revenue - previous.revenue) / previous.revenue) * 100 : 0;
  return <PageShell><PageHeader eyebrow={<><Chip tone="brand">{brand.name}</Chip><Chip tone="neutral">Operating review</Chip></>} title="Weekly performance" subtitle="A focused week-on-week read for the current brand. Revenue, spend, orders, and profit stay reconciled to the same local model." actions={<Link href="/overview" className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-3.5 py-2.5 text-[13px] font-semibold text-ink hover:border-line-strong">Back to overview <ArrowRight size={15} /></Link>} /><div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><div className="card p-4"><p className="label-xs">Latest revenue</p><p className="figure-lg mt-2 text-[25px]">{money(latest.revenue)}</p><p className={`mt-1 text-[12px] font-semibold ${revenueDelta >= 0 ? "text-good-ink" : "text-critical-ink"}`}>{revenueDelta >= 0 ? "+" : ""}{revenueDelta.toFixed(0)}% vs last week</p></div><div className="card p-4"><p className="label-xs">Latest orders</p><p className="figure-lg mt-2 text-[25px]">{num(latest.orders)}</p><p className="mt-1 text-[12px] text-ink-3">AOV {money(latest.revenue / latest.orders)}</p></div><div className="card p-4"><p className="label-xs">Latest profit</p><p className={`figure-lg mt-2 text-[25px] ${latest.profit < 0 ? "text-critical-ink" : "text-good-ink"}`}>{money(latest.profit)}</p><p className="mt-1 text-[12px] text-ink-3">Current month {money(current.netProfit)}</p></div><div className="card p-4"><p className="label-xs">Baseline</p><p className="figure-lg mt-2 text-[25px]">{money(comparison.totalRevenue)}</p><p className="mt-1 text-[12px] text-ink-3">{comparison.label}</p></div></div><div className="card mt-6 overflow-hidden"><div className="flex items-start justify-between border-b border-line px-4 py-4"><div><h2 className="text-[15px] font-semibold text-ink">Week-on-week scorecard</h2><p className="mt-1 text-[12px] text-ink-3">Use the latest column for the next operating conversation.</p></div><CalendarRange size={18} className="text-brand-ink" /></div><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left"><thead><tr className="border-b border-line bg-surface-2 text-[11.5px] text-ink-4"><th className="px-4 py-3 font-semibold">Metric</th>{weeks.map((week) => <th key={week.label} className="px-4 py-3 text-right font-semibold">{week.label}</th>)}</tr></thead><tbody>{[{ label: "Revenue", values: weeks.map((week) => money(week.revenue)) }, { label: "Marketing + operations", values: weeks.map((week) => money(week.spend)) }, { label: "Orders", values: weeks.map((week) => num(week.orders)) }, { label: "Net profit", values: weeks.map((week) => money(week.profit)) }, { label: "Net margin", values: weeks.map((week) => pct((week.profit / week.revenue) * 100, 1)) }].map((row) => <tr key={row.label} className="border-b border-line-soft last:border-0"><th className="px-4 py-3 text-[13px] font-semibold text-ink">{row.label}</th>{row.values.map((value, index) => <td key={`${row.label}-${index}`} className="tnum px-4 py-3 text-right text-[13px] text-ink-2">{value}</td>)}</tr>)}</tbody></table></div><div className="flex items-center gap-2 border-t border-line px-4 py-3 text-[12px] text-ink-3"><StatusBadge status={latest.profit < 0 ? "critical" : "good"} label={latest.profit < 0 ? "Profit needs attention" : "Profit is healthy"} /><span>Weekly values are a deterministic view of the current mock month.</span></div></div></PageShell>;
}