"use client";

/**
 * GST breakdown.
 *
 * Output tax collected, input credit by cost line, and the net you actually
 * remit. The controls matter as much as the numbers: whether prices are
 * booked inclusive or exclusive, and how much input credit is really being
 * claimed, are the two settings that quietly distort a D2C P&L.
 */

import { useState } from "react";
import { Info, Percent, ReceiptIndianRupee } from "lucide-react";
import type { MonthFigures } from "@/lib/data/model";
import { computeGst, DEFAULT_TAX_CONFIG, HSN_BANDS, type TaxConfig } from "@/lib/data/tax";
import { money, pct } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Card, CardHeader } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";
import { Chip } from "@/components/ui/Bits";

export function GstPanel({ month }: { month: MonthFigures }) {
  const [cfg, setCfg] = useState<TaxConfig>(DEFAULT_TAX_CONFIG);
  const g = computeGst(month, cfg);
  const set = <K extends keyof TaxConfig>(k: K, v: TaxConfig[K]) => setCfg((c) => ({ ...c, [k]: v }));

  return (
    <Card>
      <CardHeader
        title="GST position"
        subtitle={`Output tax, input credit and what you remit for ${month.label}`}
        info="GST is a pass-through and does not sit in net profit. What does hit profit is input credit you never claim."
        action={
          <Chip tone={g.netPayable >= 0 ? "brand" : "good"}>
            {g.netPayable >= 0 ? `${money(g.netPayable)} payable` : `${money(-g.netPayable)} refundable`}
          </Chip>
        }
      />

      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[1.3fr_1fr]">
        {/* ---------------- the ledger ---------------- */}
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="w-full min-w-[420px] border-collapse text-[12.5px]">
            <caption className="sr-only">GST collected and claimable for {month.label}</caption>
            <thead className="bg-surface-2">
              <tr>
                <th scope="col" className="border-b border-line px-3 py-2.5 text-left text-[11.5px] font-semibold tracking-wide text-ink-3 ">
                  Line
                </th>
                <th scope="col" className="border-b border-line px-3 py-2.5 text-right text-[11.5px] font-semibold tracking-wide text-ink-3 ">
                  Taxable value
                </th>
                <th scope="col" className="border-b border-line px-3 py-2.5 text-right text-[11.5px] font-semibold tracking-wide text-ink-3 ">
                  Rate
                </th>
                <th scope="col" className="border-b border-line px-3 py-2.5 text-right text-[11.5px] font-semibold tracking-wide text-ink-3 ">
                  GST
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-brand-soft/40">
                <th scope="row" className="border-b border-line px-3 py-2 text-left font-semibold text-ink">
                  Output GST on sales
                </th>
                <td className="tnum border-b border-line px-3 py-2 text-right text-ink-2">{money(g.revenueExGst)}</td>
                <td className="tnum border-b border-line px-3 py-2 text-right text-ink-3">{pct(cfg.outputRate, 0)}</td>
                <td className="tnum border-b border-line px-3 py-2 text-right font-bold text-ink">{money(g.outputGst)}</td>
              </tr>

              <tr>
                <td colSpan={4} className="border-b border-line-soft bg-surface-2 px-3 py-1.5 text-[11.5px] font-semibold tracking-wide text-ink-4 ">
                  Input credit claimable
                </td>
              </tr>
              {g.inputLines.map((l) => (
                <tr key={l.id} className="transition-colors hover:bg-surface-2">
                  <th scope="row" className="border-b border-line-soft px-3 py-2 pl-5 text-left font-normal text-ink-2">
                    {l.label}
                  </th>
                  <td className="tnum border-b border-line-soft px-3 py-2 text-right text-ink-3">{money(l.base)}</td>
                  <td className="tnum border-b border-line-soft px-3 py-2 text-right text-ink-3">{pct(l.rate, 0)}</td>
                  <td className="tnum border-b border-line-soft px-3 py-2 text-right font-medium text-good-ink">
                    {money(l.gst)}
                  </td>
                </tr>
              ))}

              <tr className="bg-surface-2">
                <th scope="row" className="border-b border-line px-3 py-2 text-left font-semibold text-ink">
                  Total input credit
                </th>
                <td className="border-b border-line" />
                <td className="border-b border-line" />
                <td className="tnum border-b border-line px-3 py-2 text-right font-bold text-good-ink">
                  {money(g.totalInputGst)}
                </td>
              </tr>

              {cfg.itcClaimRate < 100 ? (
                <tr>
                  <th scope="row" className="border-b border-line-soft px-3 py-2 pl-5 text-left font-normal text-critical-ink">
                    Credit not claimed
                  </th>
                  <td className="border-b border-line-soft" />
                  <td className="tnum border-b border-line-soft px-3 py-2 text-right text-ink-3">
                    {pct(100 - cfg.itcClaimRate, 0)}
                  </td>
                  <td className="tnum border-b border-line-soft px-3 py-2 text-right font-semibold text-critical-ink">
                    {money(g.unclaimedItc)}
                  </td>
                </tr>
              ) : null}

              <tr className="bg-brand-soft/70">
                <th scope="row" className="px-3 py-2.5 text-left font-bold text-ink">
                  Net GST {g.netPayable >= 0 ? "payable" : "refundable"}
                </th>
                <td />
                <td />
                <td className="tnum px-3 py-2.5 text-right text-[13.5px] font-bold text-ink">
                  {money(Math.abs(g.netPayable))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ---------------- settings ---------------- */}
        <div className="space-y-3">
          <div className="rounded-lg border border-line p-3.5">
            <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-ink">
              <Percent size={13} className="text-ink-4" />
              How your figures are recorded
            </p>

            <div className="mt-3 space-y-3">
              <SettingRow
                label="Sale prices include GST"
                help="Tick this if the price a customer pays is what you record as revenue."
                checked={cfg.pricesIncludeGst}
                onChange={(v) => set("pricesIncludeGst", v)}
              />
              <SettingRow
                label="Product cost includes GST"
                help="Tick this if supplier invoices are recorded at their gross value."
                checked={cfg.cogsIncludesGst}
                onChange={(v) => set("cogsIncludesGst", v)}
              />
            </div>

            <div className="mt-3.5 border-t border-line pt-3">
              <div className="flex items-baseline justify-between">
                <label htmlFor="itc" className="text-[12.5px] font-medium text-ink">
                  Input credit actually claimed
                </label>
                <span className="tnum text-[12.5px] font-bold text-ink">{pct(cfg.itcClaimRate, 0)}</span>
              </div>
              <div className="slider-wrap mt-2">
                <span className="slider-track" aria-hidden />
                <span
                  className="slider-fill"
                  aria-hidden
                  style={{
                    left: 0,
                    width: `${cfg.itcClaimRate}%`,
                    background: cfg.itcClaimRate === 100 ? "var(--good)" : "var(--warning)",
                  }}
                />
                <input
                  id="itc"
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={cfg.itcClaimRate}
                  onChange={(e) => set("itcClaimRate", Number(e.target.value))}
                  className="slider"
                  aria-valuetext={`${cfg.itcClaimRate}% of input credit claimed`}
                />
              </div>
              <p
                className={cn(
                  "mt-1.5 text-[11.5px] leading-snug",
                  cfg.itcClaimRate < 100 ? "text-critical-ink" : "text-ink-4",
                )}
              >
                {cfg.itcClaimRate < 100
                  ? `${money(g.unclaimedItc)} of credit goes unclaimed, which is a real cost against a ${money(month.netProfit)} bottom line.`
                  : "All input credit is being claimed, so GST stays a pure pass-through."}
              </p>
            </div>
          </div>

          {cfg.pricesIncludeGst ? (
            <div className="flex items-start gap-2 rounded-lg border border-warning/25 bg-warning-soft p-3">
              <Info size={14} className="mt-px shrink-0 text-warning-ink" />
              <p className="text-[11.5px] leading-relaxed text-warning-ink">
                Booking GST-inclusive prices overstates revenue by{" "}
                <strong>{money(g.inclusiveOverstatement)}</strong> this month. The statement shows{" "}
                {money(g.revenueExGst)} because a P&amp;L should always be read excluding tax you are only
                holding on the government&apos;s behalf.
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-2 rounded-lg border border-line bg-surface-2 p-3">
              <ReceiptIndianRupee size={14} className="mt-px shrink-0 text-ink-4" />
              <p className="text-[11.5px] leading-relaxed text-ink-3">
                Figures are recorded excluding GST, which is correct for a P&amp;L. Customers pay{" "}
                <strong className="text-ink">{money(g.revenueIncGst)}</strong> in total;{" "}
                {money(g.outputGst)} of that is tax you collect and pass on.
              </p>
            </div>
          )}

          <details className="rounded-lg border border-line">
            <summary className="cursor-pointer px-3 py-2.5 text-[12.5px] font-medium text-ink transition-colors hover:bg-surface-2">
              Rate reference by category
            </summary>
            <ul className="border-t border-line p-2">
              {HSN_BANDS.map((b) => (
                <li key={b.label} className="flex items-center justify-between px-1.5 py-1 text-[11.5px]">
                  <span className="text-ink-2">{b.label}</span>
                  <span className="tnum font-semibold text-ink">{pct(b.rate, 0)}</span>
                </li>
              ))}
            </ul>
          </details>
        </div>
      </div>
    </Card>
  );
}

function SettingRow({
  label,
  help,
  checked,
  onChange,
}: {
  label: string;
  help: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-[12.5px] font-medium text-ink">{label}</p>
        <p className="mt-0.5 text-[11.5px] leading-snug text-ink-3">{help}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} label={label} size="sm" />
    </div>
  );
}
