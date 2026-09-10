"use client";

import Link from "next/link";
import { ArrowRight, Download, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { useWorkspace } from "@/lib/store";
import { money, num, pct, pctDelta } from "@/lib/format";
import { Chip, StatusBadge } from "@/components/ui/Bits";
import { PageHeader, PageShell } from "@/components/shell/PageHeader";

type Mode = "week" | "month" | "quarter";
type Metric = { label: string; values: number[]; format: (value: number) => string; cost?: boolean };

const WEEK_WEIGHTS = [0.21, 0.24, 0.26, 0.29];

export default function ScrumPage() {
  const { brand, current, comparison } = useWorkspace();
  const [mode, setMode] = useState<Mode>("week");
  const [open, setOpen] = useState<Record<string, boolean>>({ blended: true, meta: true, google: false, shopify: false });

  const weeks = useMemo(() => WEEK_WEIGHTS.map((weight, index) => ({
    label: `W${index + 1}`,
    revenue: current.totalRevenue * weight,
    spend: current.totalMarketing * weight,
    orders: Math.round(current.orders * weight),
  })), [current]);

  const periods = mode === "week" ? weeks : mode === "month" ? [current, comparison] : [comparison, current];
  const periodLabel = mode === "week" ? "Current month · weekly view" : mode === "month" ? `${current.label} vs ${comparison.label}` : "Quarter comparison · modelled";
  const rowsFor = (section: string): Metric[] => {
    const split = section === "meta" ? 0.58 : section === "google" ? 0.27 : section === "shopify" ? 0.15 : 1;
    const revenueSplit = section === "meta" ? 0.61 : section === "google" ? 0.29 : section === "shopify" ? 1 : 1;
    const values = (key: "revenue" | "spend" | "orders") => periods.map((period) => {
      if ("totalRevenue" in period) return period[key === "revenue" ? "totalRevenue" : key === "spend" ? "totalMarketing" : "orders"] * (key === "revenue" ? revenueSplit : split);
      return period[key];
    });
    const revenue = values("revenue");
    const spend = values("spend");
    const orders = values("orders");
    return [
      { label: "Revenue", values: revenue, format: money },
      { label: "Spend", values: spend, format: money, cost: true },
      { label: "ROAS", values: revenue.map((value, index) => value / Math.max(spend[index], 1)), format: (value) => `${value.toFixed(2)}x` },
      { label: "Orders", values: orders, format: num },
      { label: "CAC", values: spend.map((value, index) => value / Math.max(orders[index], 1)), format: money, cost: true },
      { label: "AOV", values: revenue.map((value, index) => value / Math.max(orders[index], 1)), format: money },
    ];
  };

  const sections = [
    { id: "blended", label: "Blended store", sub: "all channels combined" },
    { id: "meta", label: "Meta", sub: "paid social" },
    { id: "google", label: "Google", sub: "search and shopping" },
    { id: "shopify", label: "Shopify store", sub: "store-level totals" },
  ];

  const downloadCsv = () => {
    const lines = ["Section,Metric," + periods.map((period, index) => mode === "week" ? weeks[index].label : "Period " + (index + 1)).join(",")];
    sections.forEach((section) => rowsFor(section.id).forEach((metric) => lines.push(`${section.label},${metric.label},${metric.values.join(",")}`)));
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${brand.name.toLowerCase().replaceAll(" ", "-")}-scrum.csv`; anchor.click(); URL.revokeObjectURL(url);
  };

  return <PageShell><PageHeader eyebrow={<><Chip tone="brand">{brand.name}</Chip><Chip tone="neutral">Nira detail report</Chip></>} title="Weekly scrum" subtitle="The operating grid from Nira: channel sections, week-on-week movement, and enough context to decide what changes next." actions={<div className="flex flex-wrap gap-2"><button onClick={downloadCsv} className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-3.5 py-2.5 text-[13px] font-semibold text-ink hover:border-line-strong"><Download size={15} /> Export CSV</button><Link href="/story" className="inline-flex items-center gap-2 rounded-lg bg-brand px-3.5 py-2.5 text-[13px] font-semibold text-[#173f28] hover:bg-brand-hover">Read the story <ArrowRight size={15} /></Link></div>} />
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3"><div><p className="text-[13px] font-semibold text-ink">{periodLabel}</p><p className="mt-1 text-[12px] text-ink-3">Ratios are recomputed from the underlying revenue, spend, and order values.</p></div><div className="flex rounded-lg border border-line bg-surface p-1">{(["week", "month", "quarter"] as Mode[]).map((option) => <button key={option} onClick={() => setMode(option)} className={`rounded-md px-3 py-1.5 text-[12px] font-semibold capitalize ${mode === option ? "bg-brand text-[#173f28]" : "text-ink-3 hover:bg-surface-2"}`}>{option}</button>)}</div></div>
    <div className="mt-5 space-y-3">{sections.map((section) => { const metrics = rowsFor(section.id); const first = metrics[0]; const latest = first.values[first.values.length - 1]; const previous = first.values[first.values.length - 2]; const change = previous ? ((latest - previous) / Math.abs(previous)) * 100 : 0; const isOpen = open[section.id]; return <section key={section.id} className="overflow-hidden rounded-xl border border-line bg-surface shadow-xs"><button onClick={() => setOpen((state) => ({ ...state, [section.id]: !state[section.id] }))} className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-surface-2"><span className="text-ink-4">{isOpen ? "▾" : "▸"}</span><span className="grid size-7 place-items-center rounded-full bg-brand-soft text-[11px] font-bold text-brand-ink">{section.label.slice(0, 1)}</span><span><span className="block text-[13.5px] font-semibold text-ink">{section.label}</span><span className="block text-[11.5px] text-ink-4">{section.sub}</span></span><span className="ml-auto flex items-center gap-4 text-[12px] text-ink-3"><span>Revenue <strong className="text-ink">{money(latest)}</strong></span><span className={change >= 0 ? "text-good-ink" : "text-critical-ink"}>{change >= 0 ? <TrendingUp size={13} className="inline" /> : <TrendingDown size={13} className="inline" />} {pctDelta(change, 0)}</span></span></button>{isOpen ? <div className="overflow-x-auto border-t border-line"><table className="w-full min-w-[680px] text-left"><thead><tr className="bg-surface-2 text-[11px] text-ink-4"><th className="w-44 px-4 py-2.5 font-semibold">Metric</th>{periods.map((_, index) => <th key={index} className="px-4 py-2.5 text-right font-semibold">{mode === "week" ? weeks[index].label : index === 0 ? comparison.label : current.label}</th>)}<th className="px-4 py-2.5 text-right font-semibold">Trend</th></tr></thead><tbody>{metrics.map((metric) => { const last = metric.values.at(-1) ?? 0; const prev = metric.values.at(-2) ?? 0; const delta = prev ? ((last - prev) / Math.abs(prev)) * 100 : 0; return <tr key={metric.label} className="border-t border-line-soft"><th className="px-4 py-3 text-[12.5px] font-semibold text-ink">{metric.label}</th>{metric.values.map((value, index) => <td key={index} className="tnum px-4 py-3 text-right text-[12.5px] text-ink-2">{metric.format(value)}</td>)}<td className={`tnum px-4 py-3 text-right text-[12px] font-semibold ${metric.cost ? delta <= 0 ? "text-good-ink" : "text-critical-ink" : delta >= 0 ? "text-good-ink" : "text-critical-ink"}`}>{pctDelta(delta, 0)}</td></tr>; })}</tbody></table></div> : null}</section>; })}</div>
  </PageShell>;
}