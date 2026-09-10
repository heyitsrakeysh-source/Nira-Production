"use client";

/**
 * SKU quadrant.
 *
 * Replaces the bubble chart, which asked the reader to decode three encodings
 * at once (x, y and area) before it said anything. This says the thing
 * directly: the plot is split into four named boxes, and which box a product
 * sits in *is* the recommendation.
 */

import { useState } from "react";
import type { SkuRow } from "@/lib/data/skus";
import { money, num } from "@/lib/format";
import { cn } from "@/lib/cn";
import { ChartTooltip, linearScale, niceScale, useMeasure, useTooltip } from "./primitives";

interface Box {
  id: string;
  title: string;
  action: string;
  tone: "good" | "bad" | "warn" | "neutral";
}

const BOXES: Record<string, Box> = {
  scale: { id: "scale", title: "Scale these", action: "High volume, makes money on every order", tone: "good" },
  grow: { id: "grow", title: "Grow these", action: "Makes money, but not enough volume yet", tone: "neutral" },
  fix: { id: "fix", title: "Fix now", action: "Selling a lot, losing money on every order", tone: "bad" },
  cut: { id: "cut", title: "Cut these", action: "Low volume and loses money", tone: "warn" },
};

function boxFor(s: SkuRow, medianOrders: number) {
  const busy = s.orders >= medianOrders;
  if (s.contributionPerOrder >= 0) return busy ? BOXES.scale : BOXES.grow;
  return busy ? BOXES.fix : BOXES.cut;
}

export function SkuQuadrant({ skus, height = 380 }: { skus: SkuRow[]; height?: number }) {
  const { ref, width } = useMeasure<HTMLDivElement>();
  const { tip, show, hide } = useTooltip();
  const [hover, setHover] = useState<string | null>(null);

  const rows = skus.filter((s) => !s.isLongTail);
  if (!rows.length) return null;

  const sortedOrders = [...rows.map((s) => s.orders)].sort((a, b) => a - b);
  const medianOrders = sortedOrders[Math.floor(sortedOrders.length / 2)];

  const M = { top: 16, right: 16, bottom: 42, left: 58 };
  const plotH = height - M.top - M.bottom;
  const innerW = Math.max(0, width - M.left - M.right);

  const xAxis = niceScale(0, Math.max(...rows.map((s) => s.orders)) * 1.08, 4);
  const x = linearScale([xAxis.min, xAxis.max], [M.left, M.left + innerW]);
  const yVals = rows.map((s) => s.contributionPerOrder);
  const yAxis = niceScale(Math.min(...yVals) * 1.15, Math.max(...yVals) * 1.15, 3);
  const y = linearScale([yAxis.min, yAxis.max], [M.top + plotH, M.top]);

  const midX = x(medianOrders);
  const zeroY = y(0);

  const counts = rows.reduce<Record<string, number>>((acc, s) => {
    const b = boxFor(s, medianOrders);
    acc[b.id] = (acc[b.id] ?? 0) + 1;
    return acc;
  }, {});

  const fill = (tone: Box["tone"]) =>
    tone === "good" ? "var(--good)" : tone === "bad" ? "var(--critical)" : tone === "warn" ? "var(--warning)" : "var(--brand)";

  const quads = [
    { box: BOXES.grow, x0: M.left, x1: midX, y0: M.top, y1: zeroY, anchor: "start" as const },
    { box: BOXES.scale, x0: midX, x1: M.left + innerW, y0: M.top, y1: zeroY, anchor: "end" as const },
    { box: BOXES.cut, x0: M.left, x1: midX, y0: zeroY, y1: M.top + plotH, anchor: "start" as const },
    { box: BOXES.fix, x0: midX, x1: M.left + innerW, y0: zeroY, y1: M.top + plotH, anchor: "end" as const },
  ];

  return (
    <div ref={ref} className="relative w-full" style={{ height }}>
      {width > 0 ? (
        <svg width={width} height={height} role="img" aria-label="Products plotted by order volume against contribution per order, split into four action groups">
          {quads.map((q) => (
            <g key={q.box.id}>
              <rect
                x={q.x0}
                y={q.y0}
                width={Math.max(0, q.x1 - q.x0)}
                height={Math.max(0, q.y1 - q.y0)}
                fill={fill(q.box.tone)}
                opacity={0.05}
              />
              <text
                x={q.anchor === "start" ? q.x0 + 10 : q.x1 - 10}
                y={q.y0 + 16}
                textAnchor={q.anchor}
                fontSize={11.5}
                fontWeight={700}
                fill={
                  q.box.tone === "good"
                    ? "var(--good-ink)"
                    : q.box.tone === "bad"
                      ? "var(--critical-ink)"
                      : q.box.tone === "warn"
                        ? "var(--warning-ink)"
                        : "var(--brand-ink)"
                }
              >
                {q.box.title}
                <tspan fill="var(--ink-4)" fontWeight={500}>
                  {"  "}
                  {counts[q.box.id] ?? 0}
                </tspan>
              </text>
              <text
                x={q.anchor === "start" ? q.x0 + 10 : q.x1 - 10}
                y={q.y0 + 30}
                textAnchor={q.anchor}
                fontSize={11}
                fill="var(--ink-4)"
              >
                {q.box.action}
              </text>
            </g>
          ))}

          {/* the two dividing lines are the whole idea, so they are visible */}
          <line x1={midX} x2={midX} y1={M.top} y2={M.top + plotH} stroke="var(--line-strong)" strokeWidth={1} shapeRendering="crispEdges" />
          <line x1={M.left} x2={M.left + innerW} y1={zeroY} y2={zeroY} stroke="var(--axis)" strokeWidth={1.5} shapeRendering="crispEdges" />

          {yAxis.ticks.map((t) => (
            <text key={t} x={M.left - 8} y={y(t)} textAnchor="end" dominantBaseline="middle" fontSize={11} fill="var(--ink-4)" className="tnum">
              {money(t)}
            </text>
          ))}
          {xAxis.ticks.filter((t) => t > 0).map((t) => (
            <text key={t} x={x(t)} y={M.top + plotH + 16} textAnchor="middle" fontSize={11} fill="var(--ink-4)" className="tnum">
              {num(t)}
            </text>
          ))}
          <text x={M.left + innerW / 2} y={height - 6} textAnchor="middle" fontSize={11} fill="var(--ink-4)">
            Orders this month
          </text>
          <text x={14} y={M.top + plotH / 2} textAnchor="middle" fontSize={11} fill="var(--ink-4)" transform={`rotate(-90 14 ${M.top + plotH / 2})`}>
            Kept per order
          </text>

          {/* uniform dots: position carries the meaning, not area */}
          {rows.map((s) => {
            const cx = x(s.orders);
            const cy = y(s.contributionPerOrder);
            const box = boxFor(s, medianOrders);
            const active = hover === s.id;
            return (
              <g key={s.id}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={active ? 7 : 5}
                  fill={fill(box.tone)}
                  stroke="var(--surface)"
                  strokeWidth={2}
                  style={{ transition: "r 140ms" }}
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r={13}
                  fill="transparent"
                  tabIndex={0}
                  role="button"
                  aria-label={`${s.name}: ${num(s.orders)} orders, ${money(s.contributionPerOrder)} kept per order. ${box.title}.`}
                  className="cursor-pointer outline-none"
                  onMouseEnter={(e) => {
                    setHover(s.id);
                    const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
                    show({
                      x: e.clientX - rect.left,
                      y: cy - 30,
                      title: s.name,
                      rows: [
                        { label: "Kept per order", value: money(s.contributionPerOrder), strong: true },
                        { label: "Orders", value: num(s.orders) },
                        { label: "Total impact", value: money(s.totalContribution) },
                        { label: "Ad cost / order", value: money(s.cac) },
                      ],
                      note: `${box.title}: ${box.action.toLowerCase()}`,
                    });
                  }}
                  onFocus={() => setHover(s.id)}
                  onMouseLeave={() => {
                    setHover(null);
                    hide();
                  }}
                  onBlur={() => setHover(null)}
                />
              </g>
            );
          })}

          {/* name only the extremes, so the plot stays readable */}
          {[
            ...[...rows].sort((a, b) => a.contributionPerOrder - b.contributionPerOrder).slice(0, 2),
            ...[...rows].sort((a, b) => b.contributionPerOrder - a.contributionPerOrder).slice(0, 1),
          ].map((s, i) => {
            const cx = x(s.orders);
            const cy = y(s.contributionPerOrder);
            const flip = cx > M.left + innerW * 0.6;
            return (
              <text
                key={`lbl-${s.id}-${i}`}
                x={flip ? cx - 10 : cx + 10}
                y={cy + 3.5}
                textAnchor={flip ? "end" : "start"}
                fontSize={11}
                fontWeight={600}
                fill={s.contributionPerOrder < 0 ? "var(--critical-ink)" : "var(--good-ink)"}
              >
                {s.name.split(" - ")[0]}
              </text>
            );
          })}
        </svg>
      ) : null}
      <ChartTooltip tip={tip} containerWidth={width} />
    </div>
  );
}

export function QuadrantKey({ skus }: { skus: SkuRow[] }) {
  const rows = skus.filter((s) => !s.isLongTail);
  const sorted = [...rows.map((s) => s.orders)].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const groups = Object.values(BOXES).map((b) => {
    const items = rows.filter((s) => boxFor(s, median).id === b.id);
    return { box: b, items, total: items.reduce((sum, s) => sum + s.totalContribution, 0) };
  });

  return (
    <ul className="grid grid-cols-2 gap-2">
      {groups.map(({ box, items, total }) => (
        <li
          key={box.id}
          className={cn(
            "rounded-md border px-3 py-2",
            box.tone === "good" && "border-good/20 bg-good-soft",
            box.tone === "bad" && "border-critical/20 bg-critical-soft",
            box.tone === "warn" && "border-warning/25 bg-warning-soft",
            box.tone === "neutral" && "border-line bg-surface-2",
          )}
        >
          <p
            className={cn(
              "text-[12.5px] font-semibold",
              box.tone === "good" && "text-good-ink",
              box.tone === "bad" && "text-critical-ink",
              box.tone === "warn" && "text-warning-ink",
              box.tone === "neutral" && "text-ink",
            )}
          >
            {box.title}
            <span className="ml-1.5 font-normal text-ink-4">{items.length}</span>
          </p>
          <p className="tnum mt-0.5 text-[12.5px] font-bold text-ink">{money(total)}</p>
          <p className="mt-0.5 text-[11.5px] leading-snug text-ink-4">{box.action}</p>
        </li>
      ))}
    </ul>
  );
}
