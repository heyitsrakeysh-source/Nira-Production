"use client";

import Link from "next/link";
import { ArrowUpRight, UserRound } from "lucide-react";
import { BRAND_PROFILES } from "@/lib/data/model";
import { useWorkspace } from "@/lib/store";
import { money } from "@/lib/format";
import { Chip } from "@/components/ui/Bits";
import { PageHeader, PageShell } from "@/components/shell/PageHeader";

export default function TeamPage() {
  const { current } = useWorkspace();
  const owners = [
    { name: "Rakesh Suthar", role: "Founder · portfolio owner", initials: "RS", brands: BRAND_PROFILES.map((brand) => brand.name), spend: current.totalMarketing },
    { name: "Ananya Patel", role: "Performance marketing", initials: "AP", brands: ["Nike", "Lune Labs"], spend: current.adSpend * 0.62 },
    { name: "Dev Raman", role: "Analytics and reporting", initials: "DR", brands: ["Northwear Co."], spend: current.adSpend * 0.38 },
  ];
  return <PageShell><PageHeader eyebrow={<Chip tone="brand">People</Chip>} title="Team & ownership" subtitle="The operating map from Nira: who owns each brand, which channel they watch, and where the next review belongs." actions={<Link href="/alerts" className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-3.5 py-2.5 text-[13px] font-semibold text-ink hover:border-line-strong">View alerts <ArrowUpRight size={15} /></Link>} /><div className="mt-6 grid gap-3 lg:grid-cols-3">{owners.map((owner) => <div key={owner.name} className="card p-4"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-brand text-[12px] font-bold text-[#173f28]">{owner.initials}</span><div><h2 className="text-[14px] font-semibold text-ink">{owner.name}</h2><p className="text-[12px] text-ink-4">{owner.role}</p></div></div><div className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-4"><div><p className="label-xs">Brands</p><p className="mt-1 text-[15px] font-semibold text-ink">{owner.brands.length}</p></div><div><p className="label-xs">Managed spend</p><p className="mt-1 text-[15px] font-semibold text-ink">{money(owner.spend)}</p></div></div><div className="mt-4 flex flex-wrap gap-1.5">{owner.brands.map((brand) => <span key={brand} className="rounded-full bg-surface-2 px-2 py-1 text-[11.5px] text-ink-2">{brand}</span>)}</div></div>)}</div><div className="card mt-6 overflow-hidden"><div className="border-b border-line px-4 py-4"><h2 className="text-[15px] font-semibold text-ink">Ownership matrix</h2><p className="mt-1 text-[12px] text-ink-3">Channel responsibility by brand. Edit controls will connect to the workspace directory later.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left"><thead><tr className="bg-surface-2 text-[11.5px] text-ink-4"><th className="px-4 py-3">Brand</th><th className="px-4 py-3">Meta</th><th className="px-4 py-3">Google</th><th className="px-4 py-3 text-right">Current spend</th></tr></thead><tbody>{BRAND_PROFILES.map((brand, index) => <tr key={brand.id} className="border-t border-line-soft"><th className="px-4 py-3 text-[13px] font-semibold text-ink">{brand.name}</th><td className="px-4 py-3 text-[12.5px] text-ink-2">{index === 0 ? "Ananya Patel" : "Rakesh Suthar"}</td><td className="px-4 py-3 text-[12.5px] text-ink-2">{index === 2 ? "Dev Raman" : "Ananya Patel"}</td><td className="tnum px-4 py-3 text-right text-[12.5px] text-ink-2">{money(current.adSpend * (index === 0 ? 1 : 0.5))}</td></tr>)}</tbody></table></div></div></PageShell>;
}