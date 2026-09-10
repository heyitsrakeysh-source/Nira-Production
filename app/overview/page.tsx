"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";
import { useWorkspace } from "@/lib/store";
import { profitBridge } from "@/lib/data/derived";
import {
  explainProfitMove,
  momInsight,
  performanceInsight,
  perOrderInsight,
  profitBridgeInsight,
  qoqInsight,
  rupeeRulerInsight,
  skuInsight,
} from "@/lib/data/insights";
import { DEFAULT_TILE_IDS } from "@/lib/data/metrics";
import { money, moneyCompact, num, pct } from "@/lib/format";
import { PageHeader, PageShell } from "@/components/shell/PageHeader";
import { SectionNav, Section, Disclosure } from "@/components/shell/SectionNav";
import { Term } from "@/components/ui/Term";
import { FilterBar } from "@/components/shell/FilterBar";
import { CompletenessStrip } from "@/components/pnl/CompletenessStrip";
import { MetricTile, useTileChoice } from "@/components/pnl/MetricTile";
import { PeriodComparison } from "@/components/pnl/PeriodComparison";
import { StatementTable } from "@/components/pnl/StatementTable";
import { ChartCard } from "@/components/charts/primitives";
import { ChartInsight } from "@/components/charts/ChartInsight";
import { PerformancePanels } from "@/components/charts/PerformancePanels";
import { QuarterBars } from "@/components/charts/QuarterBars";
import { ColumnChart, DonutChart, HBarChart, SliceLegend, ChartLegendInline } from "@/components/charts/Basics";
import { SkuQuadrant, QuadrantKey } from "@/components/charts/Quadrant";
import { ContributionExplainer } from "@/components/pnl/ContributionExplainer";
import { skuRowsFor, losingSkus } from "@/lib/data/skus";
import { costBreakdownRing } from "@/lib/data/model";
import { RupeeRuler } from "@/components/charts/RupeeRuler";
import { Waterfall } from "@/components/charts/Waterfall";
import { MarginGauge, PerOrderBar } from "@/components/charts/Misc";
import { Chip, StatusBadge } from "@/components/ui/Bits";
import { Card, CardHeader } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

/** Total spend for the month: everything that left the business. */
function totalSpend(m: { totalRevenue: number; netProfit: number }) {
  return m.totalRevenue - m.netProfit;
}

export default function OverviewPage() {
  const {
    brand,
    current,
    comparison,
    comparisonLabel,
    bestMonth,
    visibleMonths,
    quarters,
    isPending,
  } = useWorkspace();

  const { ids, setAt } = useTileChoice(DEFAULT_TILE_IDS);
  const bridge = profitBridge(current);

  const why = useMemo(
    () => explainProfitMove(current, comparison, bestMonth),
    [current, comparison, bestMonth],
  );

  const skuRows = useMemo(() => skuRowsFor(current), [current]);
  const slices = useMemo(
    () => costBreakdownRing(current).map((p) => ({ ...p, share: (p.value / totalSpend(current)) * 100 })),
    [current],
  );
  const rankedSkus = useMemo(() => {
    const rows = skuRows.filter((s) => !s.isLongTail);
    const worst = [...rows].sort((a, b) => a.totalContribution - b.totalContribution).slice(0, 5);
    const best = [...rows].sort((a, b) => b.totalContribution - a.totalContribution).slice(0, 5);
    return [...best, ...worst.reverse()].map((s) => ({
      id: s.id,
      label: s.name.split(" - ")[0],
      value: s.totalContribution,
      note: `${s.orders} orders`,
    }));
  }, [skuRows]);

  const prevQuarter = quarters.length > 1 ? quarters[quarters.length - 2] : undefined;
  const lastQuarter = quarters[quarters.length - 1];

  return (
    <PageShell>
      <PageHeader
        eyebrow={
          <>
            <Chip tone="brand">{brand.name}</Chip>
            <Chip tone="neutral">{current.label}</Chip>
            <StatusBadge status="warning" label="Month in progress · day 24 of 31" />
            <span className="inline-flex items-center gap-1 text-[11.5px] text-ink-4">
              <Clock3 size={12} /> synced 12 minutes ago
            </span>
          </>
        }
        title="Profit overview"
        subtitle={
          <>
            {num(current.orders)} orders brought in {money(current.totalRevenue)} and kept{" "}
            <strong className={current.netProfit < 0 ? "text-critical-ink" : "text-good-ink"}>
              {money(current.netProfit)}
            </strong>
            . Every figure below is derived from one reconciling model and is scoped to the period and comparison
            you pick in the filter bar.
          </>
        }
        actions={
          <Link
            href="/story"
            className="group inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-3.5 py-2 text-[13.5px] font-medium text-ink transition-[border-color,box-shadow] hover:border-line-strong hover:shadow-sm"
          >
            Why did profit move?
            <ArrowRight size={14} className="text-brand transition-transform group-can-hover:translate-x-0.5" />
          </Link>
        }
      />

      {/* ------------------------------------------------ the one-line why --- */}
      <ChartInsight insight={why} className="mt-5" />

      {/* ------------------------------------------------- configurable KPIs --- */}
      <div className={cn("stagger mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5", isPending && "is-pending")}>
        {ids.map((id, i) => (
          <MetricTile
            key={`${id}-${i}`}
            index={i}
            metricId={id}
            onChangeMetric={(next) => setAt(i, next)}
            current={current}
            comparison={comparison}
            comparisonLabel={comparisonLabel}
            series={visibleMonths}
            taken={ids}
          />
        ))}

        <Card className="sm:col-span-2 lg:col-span-4 2xl:col-span-1" interactive>
          <div className="flex flex-row items-center gap-5 2xl:flex-col 2xl:gap-1">
            <div className="2xl:w-full">
              <span className="text-[12.5px] font-medium text-ink-3">Net margin</span>
            </div>
            <MarginGauge value={current.netMarginPct} min={-3} max={6} target={0} size={132} label="break-even at 0%" />
            <p className="max-w-[190px] text-[11.5px] leading-snug text-ink-3 2xl:mt-2 2xl:max-w-none 2xl:text-center">
              <strong className={current.netMarginPct < comparison.netMarginPct ? "text-critical-ink" : "text-good-ink"}>
                {pct(Math.abs(current.netMarginPct - comparison.netMarginPct), 2)}{" "}
                {current.netMarginPct < comparison.netMarginPct ? "down" : "up"}
              </strong>{" "}
              on {pct(comparison.netMarginPct, 2)} in {comparison.label}
            </p>

            <dl className="ml-auto hidden gap-8 sm:flex 2xl:hidden">
              {[
                { k: "Break-even ROAS", v: current.breakEvenRoas.toFixed(2) + "x", n: `running ${current.roas.toFixed(2)}x` },
                { k: "Contribution / order", v: money(current.contributionPerOrder), n: `less ${money(current.fixedPerOrder)} overhead` },
                { k: "Net per order", v: money(current.netProfit / current.orders), n: `${num(current.orders)} orders` },
              ].map((s) => (
                <div key={s.k}>
                  <dt className="text-[11.5px] font-medium text-ink-4">{s.k}</dt>
                  <dd className="figure-lg mt-0.5 text-[17px] text-ink">{s.v}</dd>
                  <dd className="text-[11.5px] text-ink-4">{s.n}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Card>
      </div>

      <div className="mt-4 space-y-3">
        <FilterBar />
        <CompletenessStrip />
      </div>

      <SectionNav
        className="mt-4"
        sections={[
          { id: "sec-trend", label: "How the year is going" },
          { id: "sec-compare", label: "Compare periods" },
          { id: "sec-costs", label: "Where money went" },
          { id: "sec-products", label: "Products" },
          { id: "sec-order", label: "One order" },
          { id: "sec-statement", label: "Statement" },
        ]}
      />

      {/* --------------------------------------------------------- charts --- */}
      <Section id="sec-trend" title="How the year is going" hint="Revenue, what it cost to earn, and what survived.">
      <div className={cn("grid grid-cols-1 items-start gap-3 xl:grid-cols-3", isPending && "is-pending")}>
        <ChartCard
          className="xl:col-span-2"
          title="Performance over time"
          subtitle="Cost stack against the revenue it has to fit inside, with net profit on its own scale below."
          info="Two panels rather than two y-axes: a single plot with two scales invents a relationship the data does not contain."
          insight={performanceInsight(visibleMonths, comparison)}
          table={{
            columns: ["Month", "Revenue", "COGS", "Operations", "Marketing", "Net profit"],
            rows: visibleMonths.map((m) => [
              m.label,
              money(m.totalRevenue),
              money(m.cogs),
              money(m.totalOperationalCosts),
              money(m.totalMarketing),
              money(m.netProfit),
            ]),
          }}
        >
          <PerformancePanels months={visibleMonths} />
        </ChartCard>

        <ChartCard
          title="Where your rupee goes"
          subtitle={`${current.label} against ${comparison.label}`}
          info="Segments are labelled directly so the composition is readable without hovering, and the marker shows where spending crossed the revenue line."
          insight={rupeeRulerInsight(current, comparison)}
        >
          <RupeeRuler current={current} comparison={comparison} />
        </ChartCard>
      </div>

      </Section>

      {/* ------------------------------------------- period on period ------- */}
      <Section id="sec-compare" title="This period against another" hint="Every headline number side by side, with the size of each movement.">
      <Card>
        <CardHeader
          title={`${current.label} against ${comparison.label}`}
          subtitle="Every headline metric, side by side, with the size of each movement"
          action={<Chip tone="brand">{comparisonLabel}</Chip>}
        />
        <div className="mt-4">
          <PeriodComparison
            current={current}
            comparison={comparison}
            currentLabel={current.label}
            comparisonLabel={comparison.label}
          />
        </div>
        <ChartInsight insight={momInsight(current, comparison)} className="mt-3.5" />
      </Card>

      {/* ------------------------------------------------ quarter on quarter --- */}
      <div className="mt-3">
      <Disclosure label="Quarter on quarter" count={`${quarters.length} quarters in range`}>
      <div className={cn("grid grid-cols-1 items-start gap-3 xl:grid-cols-[1.4fr_1fr]", isPending && "is-pending")}>
        <ChartCard
          title="Quarter on quarter"
          subtitle="Months in range rolled into quarters. Rates are recomputed from the totals, not averaged."
          insight={qoqInsight(quarters)}
          table={{
            columns: ["Quarter", "Revenue", "COGS", "Marketing", "Net profit", "Margin"],
            rows: quarters.map((q) => [
              `${q.label}${q.partial ? " (partial)" : ""}`,
              money(q.totalRevenue),
              money(q.cogs),
              money(q.totalMarketing),
              money(q.netProfit),
              pct(q.netMarginPct, 2),
            ]),
          }}
        >
          <QuarterBars quarters={quarters} />
        </ChartCard>

        <Card className="flex flex-col">
          <CardHeader
            title="Latest quarter"
            subtitle={
              prevQuarter
                ? `${lastQuarter?.label} against ${prevQuarter.label}`
                : "Widen the range to compare two quarters"
            }
          />
          {prevQuarter && lastQuarter ? (
            <div className="mt-4">
              {lastQuarter.months.length !== prevQuarter.months.length ? (
                <p className="mb-2.5 rounded-md bg-warning-soft px-2.5 py-1.5 text-[11.5px] font-medium text-warning-ink">
                  {lastQuarter.label} covers {lastQuarter.months.length} of 3 months against{" "}
                  {prevQuarter.months.length} in {prevQuarter.label}, so totals are not like for like.
                </p>
              ) : null}
              <PeriodComparison
                current={lastQuarter}
                comparison={prevQuarter}
                currentLabel={lastQuarter.label}
                comparisonLabel={prevQuarter.label}
                rowIds={["revenue", "grossProfit", "marketing", "netProfit", "netMargin", "cac"]}
              />
            </div>
          ) : (
            <p className="mt-4 text-[12.5px] text-ink-3">
              Only {quarters.length} quarter is in range. Pick a longer period to see a quarter-on-quarter
              comparison.
            </p>
          )}
        </Card>
      </div>

      </Disclosure>
      </div>
      </Section>

      {/* ---------------------------------------------------- at a glance --- */}
      <Section id="sec-costs" title="Where the money went" hint="The same spend, shown three ways: as a share, against revenue, and step by step.">
      <div className={cn("grid grid-cols-1 items-start gap-3 lg:grid-cols-2", isPending && "is-pending")}>
        <ChartCard
          title="Cost mix"
          subtitle={`Where every rupee of spend went in ${current.label}`}
          info="Share of total spend, not of revenue. Six categories, each keeping its own colour across the product."
          insight={rupeeRulerInsight(current, comparison)}
          legend={<SliceLegend slices={slices} />}
          table={{
            columns: ["Category", "Amount", "Share of spend"],
            rows: slices.map((p) => [p.label, money(p.value), pct(p.share)]),
          }}
        >
          <DonutChart
            slices={slices}
            centerLabel="total spend"
            centerValue={moneyCompact(totalSpend(current))}
            height={250}
          />
        </ChartCard>

        <ChartCard
          title="Revenue against cost"
          subtitle="The gap between the two bars is what you keep"
          insight={performanceInsight(visibleMonths, comparison)}
          legend={
            <ChartLegendInline
              items={[
                { label: "Revenue", color: "var(--brand)" },
                { label: "Total cost", color: "var(--series-5)" },
              ]}
            />
          }
          table={{
            columns: ["Month", "Revenue", "Total cost", "Kept"],
            rows: visibleMonths.map((m) => [
              m.label,
              money(m.totalRevenue),
              money(m.totalRevenue - m.netProfit),
              money(m.netProfit),
            ]),
          }}
        >
          <ColumnChart
            data={visibleMonths.map((m) => ({
              label: m.shortLabel,
              a: m.totalRevenue,
              b: m.totalRevenue - m.netProfit,
            }))}
            height={250}
          />
        </ChartCard>
      </div>

      </Section>

      <Section id="sec-products" title="Which products to act on" hint="Split by how much each sells and whether it makes money on every sale.">
      <div className={cn("grid grid-cols-1 items-start gap-3 xl:grid-cols-[1.25fr_1fr]", isPending && "is-pending")}>
        <ChartCard
          title="Product map"
          subtitle="Split by how much they sell and whether each sale makes money. The box a product lands in is the action."
          info="Uniform dots: position carries the meaning here, so nothing has to be decoded from size."
          insight={skuInsight(losingSkus(skuRows), losingSkus(skuRows).reduce((s2, k) => s2 + k.totalContribution, 0), current, skuRows.length)}
          footer={<QuadrantKey skus={skuRows} />}
          table={{
            columns: ["SKU", "Orders", "Kept per order", "Total impact"],
            rows: skuRows
              .filter((s) => !s.isLongTail)
              .map((s) => [s.name, num(s.orders), money(s.contributionPerOrder), money(s.totalContribution)]),
          }}
        >
          <SkuQuadrant skus={skuRows} height={360} />
        </ChartCard>

        <ChartCard
          title="Best and worst products"
          subtitle="Total profit impact this month, top five each way"
          table={{
            columns: ["SKU", "Profit impact"],
            rows: rankedSkus.map((r) => [r.label, money(r.value)]),
          }}
        >
          <HBarChart rows={rankedSkus} />
        </ChartCard>
      </div>

      </Section>

      {/* ------------------------------------------------- bridge + per order --- */}
      <Section id="sec-order" title="What one order is worth" hint="The economics of a single sale, which is where the whole picture comes from.">
      <div className={cn("grid grid-cols-1 items-start gap-3 xl:grid-cols-2", isPending && "is-pending")}>
        <ChartCard
          title="Profit bridge"
          subtitle={`${current.label} revenue down to net profit`}
          insight={profitBridgeInsight(current)}
          table={{
            columns: ["Step", "Amount"],
            rows: bridge.map((b) => [b.label, money(b.value)]),
          }}
        >
          <Waterfall
            items={bridge.map((b) => ({
              label: b.label,
              value: b.value,
              kind: b.kind === "cost" ? "delta" : "anchor",
            }))}
            height={240}
          />
        </ChartCard>

        <ChartCard
          title="Unit economics"
          subtitle={`An average ${money(current.aov)} order, broken down`}
          info="Contribution is what is left of one order after goods, fulfilment, fees and acquisition, before fixed overhead."
          insight={perOrderInsight(current, comparison)}
          action={
            <Link href="/unit-economics" className="text-[12.5px] font-medium text-brand-ink hover:underline">
              Detail
            </Link>
          }
        >
          <div className="pt-1">
            <PerOrderBar month={current} />
          </div>
          <ContributionExplainer month={current} className="mt-4" />
          <dl className="mt-5 space-y-2 border-t border-line pt-4 text-[12.5px]">
            {[
              { k: "Break-even ROAS", v: `${current.breakEvenRoas.toFixed(2)}x`, note: `running ${current.roas.toFixed(2)}x` },
              { k: "Return rate", v: pct(current.returnRate), note: `${num(Math.round((current.returnRate / 100) * current.orders))} orders back` },
              { k: "Break-even CAC", v: money(current.breakEvenCac), note: `running ${money(current.cac)}` },
            ].map((r) => (
              <div key={r.k} className="flex items-baseline justify-between gap-2">
                <dt className="text-ink-3">{r.k}</dt>
                <dd className="flex items-baseline gap-1.5">
                  <span className="tnum font-semibold text-ink">{r.v}</span>
                  <span className="text-[11.5px] text-ink-4">{r.note}</span>
                </dd>
              </div>
            ))}
          </dl>
        </ChartCard>
      </div>
      </Section>

      {/* ------------------------------------------------------ statement --- */}
      <Section id="sec-statement" title="The statement" hint="The same figures in accounting form.">
      <Card padded>
        <CardHeader
          title="P&L summary"
          subtitle={`${visibleMonths[0]?.label} to ${current.label}`}
          action={
            <Link
              href="/statement"
              className="group inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-[12.5px] font-medium text-ink-2 transition-colors hover:border-line-strong hover:text-ink"
            >
              Open full statement
              <ArrowRight size={13} className="transition-transform group-can-hover:translate-x-0.5" />
            </Link>
          }
        />
        <div className="mt-4">
          <StatementTable months={visibleMonths.slice(-4)} condensed showMemo={false} />
        </div>
      </Card>
      </Section>
    </PageShell>
  );
}
