"use client";

/**
 * What "contribution" means, in the reader's own numbers.
 *
 * The word is jargon. Rather than define it abstractly, this walks one real
 * order through the subtractions, so the number on screen is the answer to
 * "what is left after everything a sale costs me".
 */

import type { MonthFigures } from "@/lib/data/model";
import { money } from "@/lib/format";
import { cn } from "@/lib/cn";

export function ContributionExplainer({ month, className }: { month: MonthFigures; className?: string }) {
  const steps = [
    { label: "You charge", value: month.aov, sign: "" as const, tone: "in" as const },
    { label: "Product cost", value: month.cogsPerOrder, sign: "−" as const, tone: "out" as const },
    { label: "Shipping", value: month.shippingPerOrder, sign: "−" as const, tone: "out" as const },
    { label: "Packaging", value: month.packagingPerOrder, sign: "−" as const, tone: "out" as const },
    { label: "Payment fees", value: month.txnFeePerOrder, sign: "−" as const, tone: "out" as const },
    { label: "Ads to win it", value: month.cac, sign: "−" as const, tone: "out" as const },
  ];

  const contribution = month.contributionPerOrder;
  const net = month.netProfit / month.orders;

  return (
    <div className={cn("rounded-lg border border-line bg-surface-2 p-3.5", className)}>
      <p className="text-[12.5px] font-semibold text-ink">What &ldquo;contribution&rdquo; means</p>
      <p className="mt-1 text-[11.5px] leading-relaxed text-ink-3">
        It is what one order leaves behind after everything that sale directly costs you. Rent and salaries are
        not in it yet, because those get paid whether or not this order happens.
      </p>

      <div className="mt-3 flex flex-wrap items-stretch gap-1.5">
        {steps.map((s, i) => (
          <div key={s.label} className="flex items-stretch gap-1.5">
            {i > 0 ? (
              <span className="flex items-center text-[13.5px] font-semibold text-ink-4">{s.sign}</span>
            ) : null}
            <div
              className={cn(
                "rounded-md border px-2.5 py-1.5",
                s.tone === "in" ? "border-brand/25 bg-brand-soft" : "border-line bg-surface",
              )}
            >
              <p className="text-[11.5px] font-medium text-ink-4">{s.label}</p>
              <p
                className={cn(
                  "tnum text-[13.5px] font-semibold",
                  s.tone === "in" ? "text-brand-ink" : "text-ink",
                )}
              >
                {money(s.value)}
              </p>
            </div>
          </div>
        ))}

        <span className="flex items-center text-[13.5px] font-semibold text-ink-4">=</span>
        <div
          className={cn(
            "rounded-md border px-2.5 py-1.5",
            contribution >= 0 ? "border-good/30 bg-good-soft" : "border-critical/30 bg-critical-soft",
          )}
        >
          <p className={cn("text-[11.5px] font-semibold", contribution >= 0 ? "text-good-ink" : "text-critical-ink")}>
            Contribution
          </p>
          <p className={cn("tnum text-[13.5px] font-bold", contribution >= 0 ? "text-good-ink" : "text-critical-ink")}>
            {money(contribution)}
          </p>
        </div>
      </div>

      <p className="mt-3 border-t border-line pt-2.5 text-[11.5px] leading-relaxed text-ink-3">
        Overhead comes out of that next: rent, salaries and software work out at{" "}
        <strong className="text-ink">{money(month.fixedPerOrder)}</strong> per order this month, which leaves{" "}
        <strong className={net >= 0 ? "text-good-ink" : "text-critical-ink"}>{money(net)}</strong> of actual profit
        on an average order.{" "}
        {contribution >= 0 && net < 0
          ? "Each sale does pay for itself, but not for the business around it."
          : contribution < 0
            ? "Each sale loses money before overhead is even counted."
            : "Each sale pays for itself and for its share of overhead."}
      </p>
    </div>
  );
}
