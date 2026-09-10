"use client";

import { useState } from "react";
import { CheckCircle2, Cloud, RefreshCw, Table2 } from "lucide-react";
import { Chip, StatusBadge } from "@/components/ui/Bits";
import { PageHeader, PageShell } from "@/components/shell/PageHeader";

export default function IntegrationsPage() {
  const [state, setState] = useState<"idle" | "loading" | "connected" | "error">("idle");
  const [message, setMessage] = useState("Not tested yet");
  const test = async () => {
    setState("loading");
    try {
      const response = await fetch("/api/sheets/brands", { cache: "no-store" });
      const body = await response.json() as { configured?: boolean; rows?: unknown[]; error?: string };
      if (!response.ok) throw new Error(body.error ?? "Connection failed");
      setState(body.configured ? "connected" : "error");
      setMessage(body.configured ? `${body.rows?.length ?? 0} rows available` : "Add the Google Sheets environment variables first");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Connection failed");
    }
  };
  return <PageShell><PageHeader eyebrow={<Chip tone="brand">Data connections</Chip>} title="Integrations" subtitle="Use one private Google Workbook as the temporary operating source. Platform exports from Shopify, Meta, and Google can land there while Nira keeps the same product model." actions={<button onClick={test} className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-[13px] font-semibold text-[#173f28] hover:bg-brand-hover">{state === "loading" ? <RefreshCw size={15} className="anim-spin" /> : <Cloud size={15} />} Test connection</button>} /><div className="mt-6 grid gap-3 lg:grid-cols-[1.15fr_0.85fr]"><div className="card p-5"><div className="flex items-start gap-3"><span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand-ink"><Table2 size={19} /></span><div><h2 className="text-[16px] font-semibold text-ink">Google Sheets source</h2><p className="mt-1 text-[12.5px] text-ink-3">Read-only server connection. Credentials stay in Vercel environment variables.</p></div></div><div className="mt-5 rounded-lg border border-line bg-surface-2 p-4"><p className="label-xs">Required tab</p><p className="mt-1 font-mono text-[13px] font-semibold text-ink">Brands</p><p className="mt-3 label-xs">Required columns</p><p className="mt-1 font-mono text-[12px] leading-relaxed text-ink-2">brandId, brandName, monthKey, orders, revenue, marketingSpend, netProfit</p></div><div className="mt-4 flex items-center gap-2 text-[12.5px] text-ink-3"><CheckCircle2 size={15} className="text-good" /> Add a new brand by adding another `brandId` and its monthly rows. No new deployment is needed.</div></div><div className="card p-5"><p className="label-xs">Connection status</p><div className="mt-3 flex items-center gap-2"><StatusBadge status={state === "connected" ? "good" : state === "error" ? "critical" : "warning"} label={state === "connected" ? "Connected" : state === "error" ? "Needs setup" : "Not tested"} /></div><p className="mt-4 text-[13px] leading-relaxed text-ink-2">{message}</p><div className="mt-5 border-t border-line pt-4 text-[12px] leading-relaxed text-ink-3">Production path: platform connectors write normalized rows into this workbook, Nira reads the workbook server-side, and the mock model remains available as a fallback until the first live brand is connected.</div></div></div></PageShell>;
}