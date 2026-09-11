"use client";

import { useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ArrowDownLeft, ArrowDownRight, ArrowUpLeft, ArrowUpRight } from "lucide-react";
import type { SkuRow } from "@/lib/data/skus";
import { axisMoney, money, num } from "@/lib/format";
import { cn } from "@/lib/cn";
import { ChartTooltip, linearScale, niceScale, useMeasure } from "./primitives";
import { placeLabels } from "./quadrant-layout";

const BOXES = {
  grow: { title: "Grow these", action: "Lower volume · Makes money", icon: ArrowUpLeft, color: "var(--brand)", ink: "text-brand-ink", background: "bg-brand-soft" },
  scale: { title: "Scale these", action: "Higher volume · Makes money", icon: ArrowUpRight, color: "var(--good)", ink: "text-good-ink", background: "bg-good-soft" },
  cut: { title: "Cut these", action: "Lower volume · Loses money", icon: ArrowDownLeft, color: "var(--warning)", ink: "text-warning-ink", background: "bg-warning-soft" },
  fix: { title: "Fix now", action: "Higher volume · Loses money", icon: ArrowDownRight, color: "var(--critical)", ink: "text-critical-ink", background: "bg-critical-soft" },
} as const;
type Group = keyof typeof BOXES;

function tickMoney(value: number) {
  return Math.abs(value) < 1000 && !Number.isInteger(value) ? money(value, { decimals: true }) : axisMoney(value);
}

function mapData(skus: SkuRow[]) {
  const rows = skus.filter((sku) => !sku.isLongTail && Number.isFinite(sku.orders) && Number.isFinite(sku.contributionPerOrder));
  const orders = rows.map((sku) => sku.orders).sort((a, b) => a - b);
  const middle = Math.floor(orders.length / 2);
  const median = orders.length ? (orders[middle] + orders[Math.max(0, Math.ceil(orders.length / 2) - 1)]) / 2 : 0;
  return { rows, median };
}

function groupFor(sku: SkuRow, median: number): Group {
  if (sku.contributionPerOrder >= 0) return sku.orders >= median ? "scale" : "grow";
  return sku.orders >= median ? "fix" : "cut";
}

/** Use the rendered font; names that cannot fit remain available in the tooltip. */
function useLabelWidths(names: string[]) {
  const ref = useRef<SVGGElement>(null);
  const [widths, setWidths] = useState<Record<string, number>>({});
  const namesKey = JSON.stringify(names);
  useLayoutEffect(() => {
    let mounted = true;
    const measure = () => {
      if (!mounted || !ref.current) return;
      const next: Record<string, number> = {};
      ref.current.querySelectorAll("text").forEach((text) => { next[text.textContent ?? ""] = text.getComputedTextLength(); });
      setWidths(next);
    };
    measure();
    void document.fonts.ready.then(measure);
    return () => { mounted = false; };
  }, [namesKey]);
  return { ref, widths };
}

export function SkuQuadrant({ skus, height = 380 }: { skus: SkuRow[]; height?: number }) {
  const { ref, width } = useMeasure<HTMLDivElement>();
  const tooltipId = useId();
  const descriptionId = useId();
  const [activeId, setActiveId] = useState<string | null>(null);
  const { rows, median } = useMemo(() => mapData(skus), [skus]);
  // Prioritise the largest gain, largest loss, and busiest product.
  const priorities = useMemo(() => {
    const impact = [...rows].sort((a, b) => b.totalContribution - a.totalContribution);
    const busiest = [...rows].sort((a, b) => b.orders - a.orders)[0];
    return [...new Map([impact[0], impact[impact.length - 1], busiest].filter((sku): sku is SkuRow => Boolean(sku)).map((sku) => [sku.id, sku])).values()];
  }, [rows]);
  const { ref: textRef, widths } = useLabelWidths(priorities.map((sku) => sku.name));
  const values = rows.map((sku) => sku.contributionPerOrder);
  const magnitude = Math.max(1, ...values.map(Math.abs));
  // Retain a visible zero reference even when every product has the same sign.
  const yAxis = niceScale(Math.min(-Math.max(1, magnitude * 0.2), ...values) * 1.15, Math.max(Math.max(1, magnitude * 0.2), ...values) * 1.15, 5);
  const tickWidth = Math.max(...yAxis.ticks.map((value) => tickMoney(value).length)) * 7;
  const margin = { left: tickWidth + 12, right: 18, top: 16, bottom: 46 };
  const chartHeight = Math.max(height, 280);
  const plot = { x: margin.left, y: margin.top, width: Math.max(0, width - margin.left - margin.right), height: chartHeight - margin.top - margin.bottom };
  const xAxis = niceScale(0, Math.max(1, ...rows.map((sku) => sku.orders)) * 1.1, 6);
  const allXTicks = xAxis.ticks.filter(Number.isInteger);
  const tickGap = Math.max(70, ...allXTicks.map((tick) => num(tick).length * 7 + 16));
  const tickStride = Math.max(1, Math.ceil((allXTicks.length - 1) / Math.max(1, Math.floor(plot.width / tickGap))));
  const xTicks = allXTicks.filter((_, index) => index % tickStride === 0);
  const x = linearScale([xAxis.min, xAxis.max], [plot.x, plot.x + plot.width]);
  const y = linearScale([yAxis.min, yAxis.max], [plot.y + plot.height, plot.y]);
  const midX = x(median);
  const zeroY = y(0);
  const points = rows.map((sku) => ({ id: sku.id, x: x(sku.orders), y: y(sku.contributionPerOrder), sku }));
  const labels = placeLabels(
    priorities.filter((sku) => widths[sku.name] > 0).map((sku) => ({ id: sku.id, text: sku.name, width: widths[sku.name], x: x(sku.orders), y: y(sku.contributionPerOrder) })),
    points, plot,
    [{ x: midX - 3, y: plot.y, width: 6, height: plot.height }, { x: plot.x, y: zeroY - 3, width: plot.width, height: 6 }],
    width < 360 ? 1 : 3,
  );
  const active = points.find((point) => point.id === activeId);
  const activeBox = active ? BOXES[groupFor(active.sku, median)] : null;
  const tip = active && activeBox ? {
    x: active.x, y: active.y, title: active.sku.name,
    rows: [
      { label: "Kept per order", value: money(active.sku.contributionPerOrder, { decimals: Math.abs(active.sku.contributionPerOrder) < 1 }), strong: true },
      { label: "Orders", value: num(active.sku.orders) },
      { label: "Total impact", value: money(active.sku.totalContribution) },
      { label: "Ad cost / order", value: money(active.sku.cac) },
    ],
    note: `${activeBox.title} · ${active.sku.contributionPerOrder === 0 ? "Break-even per order" : activeBox.action}`,
  } : null;

  return (
    <div className="min-w-0">
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-[12px]">
        <p className="font-medium text-ink-2">Kept per order</p>
        <p className="text-ink-4">Hover, focus or tap a dot</p>
      </div>
      <p id={descriptionId} className="sr-only">Products above zero make money before fixed overhead; products below zero lose money. The vertical line splits order volume at the catalogue median. The action guide follows the same layout as the plot. Use Table view to read every product, including overlapping dots.</p>
      <div ref={ref} className="relative w-full min-w-0" style={{ height: rows.length ? chartHeight : undefined }}>
        {rows.length ? (
          <svg width="100%" height={chartHeight} role="group" aria-label="Product profitability map" aria-describedby={descriptionId} onKeyDown={(event) => { if (event.key === "Escape") setActiveId(null); }}>
            <g ref={textRef} visibility="hidden" aria-hidden="true" fontSize={12} fontWeight={600}>
              {priorities.map((sku) => <text key={sku.id}>{sku.name}</text>)}
            </g>
            {width > 0 ? <>
              <g aria-hidden="true">
                <rect x={plot.x} y={plot.y} width={Math.max(0, midX - plot.x)} height={zeroY - plot.y} fill={BOXES.grow.color} opacity={0.06} />
                <rect x={midX} y={plot.y} width={Math.max(0, plot.x + plot.width - midX)} height={zeroY - plot.y} fill={BOXES.scale.color} opacity={0.06} />
                <rect x={plot.x} y={zeroY} width={Math.max(0, midX - plot.x)} height={plot.y + plot.height - zeroY} fill={BOXES.cut.color} opacity={0.07} />
                <rect x={midX} y={zeroY} width={Math.max(0, plot.x + plot.width - midX)} height={plot.y + plot.height - zeroY} fill={BOXES.fix.color} opacity={0.06} />
                {yAxis.ticks.map((tick) => <g key={tick}>
                  <line x1={plot.x} x2={plot.x + plot.width} y1={y(tick)} y2={y(tick)} stroke={tick === 0 ? "var(--axis)" : "var(--grid)"} strokeWidth={tick === 0 ? 1.5 : 1} />
                  <text x={plot.x - 8} y={y(tick)} textAnchor="end" dominantBaseline="middle" fontSize={12} fontWeight={tick === 0 ? 700 : 400} fill={tick === 0 ? "var(--ink-2)" : "var(--ink-3)"} className="tnum">{tickMoney(tick)}</text>
                </g>)}
                <line x1={midX} x2={midX} y1={plot.y} y2={plot.y + plot.height} stroke="var(--line-strong)" strokeWidth={1.5} />
                {xTicks.map((tick, index) => <text key={tick} x={x(tick)} y={plot.y + plot.height + 19} textAnchor={index === 0 ? "start" : tick === xAxis.max ? "end" : "middle"} fontSize={12} fill="var(--ink-3)" className="tnum">{num(tick)}</text>)}
                <text x={plot.x + plot.width / 2} y={chartHeight - 4} textAnchor="middle" fontSize={12} fill="var(--ink-2)">Orders this month</text>
              </g>
              {points.map((point) => {
                const box = BOXES[groupFor(point.sku, median)];
                const selected = activeId === point.id;
                return <g key={point.id}>
                  <circle cx={point.x} cy={point.y} r={selected ? 7 : 5} fill={box.color} stroke="var(--surface)" strokeWidth={2} aria-hidden="true" />
                  <circle cx={point.x} cy={point.y} r={12} fill="transparent" stroke={selected ? "var(--ink-2)" : "transparent"} strokeWidth={1.5} tabIndex={0} role="button" aria-label={`${point.sku.name}: ${num(point.sku.orders)} orders, ${money(point.sku.contributionPerOrder, { decimals: Math.abs(point.sku.contributionPerOrder) < 1 })} kept per order. ${box.title}.`} aria-describedby={selected ? tooltipId : undefined} className="cursor-pointer outline-none focus-visible:stroke-ink"
                    onPointerEnter={() => setActiveId(point.id)}
                    onPointerLeave={(event) => { if (document.activeElement !== event.currentTarget) setActiveId(null); }}
                    onFocus={() => setActiveId(point.id)} onBlur={() => setActiveId(null)}
                    onClick={() => setActiveId(point.id)}
                    onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setActiveId(point.id); } }}
                  />
                </g>;
              })}
              <g pointerEvents="none" aria-hidden="true" fontSize={12} fontWeight={600} fill="var(--ink-2)">
                {labels.map((label) => <text key={label.id} data-product-label={label.id} x={label.box.x} y={label.box.y + label.box.height / 2} dominantBaseline="central" paintOrder="stroke" stroke="var(--surface)" strokeWidth={3} strokeLinejoin="round">{label.text}</text>)}
              </g>
            </> : null}
          </svg>
        ) : <p className="rounded-md bg-surface-2 px-4 py-10 text-center text-[13px] text-ink-3">No individual product data for this period.</p>}
        <ChartTooltip id={tooltipId} tip={tip} containerWidth={width} containerHeight={chartHeight} />
      </div>
      {rows.length ? <p className="mt-2 text-[12px] leading-relaxed text-ink-3">Volume split: <span className="tnum font-medium text-ink-2">{num(median, Number.isInteger(median) ? 0 : 1)} orders</span> (catalogue median). Zero is break-even before fixed costs.</p> : null}
    </div>
  );
}

/** Ordered like the plot, so explanations never compete with data marks. */
export function QuadrantKey({ skus }: { skus: SkuRow[] }) {
  const { rows, median } = mapData(skus);
  return (
    <ul aria-label="Product map action guide, arranged like the plot" className="grid min-w-0 grid-cols-2 gap-2">
      {(Object.keys(BOXES) as Group[]).map((id) => {
        const box = BOXES[id];
        const Icon = box.icon;
        const items = rows.filter((sku) => groupFor(sku, median) === id);
        const total = items.reduce((sum, sku) => sum + sku.totalContribution, 0);
        return <li key={id} className={cn("min-w-0 rounded-md p-3", box.background)}>
          <p className={cn("flex flex-wrap items-baseline gap-x-1.5 text-[13px] font-semibold", box.ink)}><span className="inline-flex items-center gap-1"><Icon size={13} aria-hidden="true" />{box.title}</span><span className="tnum font-normal text-ink-3">{items.length}<span className="sr-only"> products</span></span></p>
          <p className="mt-1 text-[12px] leading-relaxed text-ink-3">{items.some((sku) => sku.contributionPerOrder === 0) ? `${id === "grow" ? "Lower" : "Higher"} volume · Break-even or better` : box.action}</p>
          <p className="tnum mt-1.5 break-words text-[12.5px] font-semibold text-ink">{money(total)}<span className="font-normal text-ink-3"> impact</span></p>
        </li>;
      })}
    </ul>
  );
}
