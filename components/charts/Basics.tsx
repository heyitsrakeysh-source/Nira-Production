"use client";

/**
 * The familiar chart types: pie, column and ranked bar.
 *
 * Nothing exotic, which is the point. These answer "what share", "how has it
 * moved" and "which items are worst" in the shapes most people already read
 * without instruction.
 */

import { useState } from "react";
import { axisMoney, money, moneyCompact, pct } from "@/lib/format";
import { cn } from "@/lib/cn";
import {
  barPath,
  ChartTooltip,
  GridLines,
  linearScale,
  niceScale,
  useMeasure,
  useTooltip,
  XLabels,
} from "./primitives";

/* ============================================================================
 * PIE / DONUT
 * ==========================================================================*/

export interface Slice {
  id: string;
  label: string;
  value: number;
  share: number;
  color: string;
}

function arcPath(cx: number, cy: number, rOuter: number, rInner: number, a0: number, a1: number) {
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const x0 = cx + Math.cos(a0) * rOuter;
  const y0 = cy + Math.sin(a0) * rOuter;
  const x1 = cx + Math.cos(a1) * rOuter;
  const y1 = cy + Math.sin(a1) * rOuter;
  const x2 = cx + Math.cos(a1) * rInner;
  const y2 = cy + Math.sin(a1) * rInner;
  const x3 = cx + Math.cos(a0) * rInner;
  const y3 = cy + Math.sin(a0) * rInner;
  return `M${x0},${y0}A${rOuter},${rOuter} 0 ${large} 1 ${x1},${y1}L${x2},${y2}A${rInner},${rInner} 0 ${large} 0 ${x3},${y3}Z`;
}

export function DonutChart({
  slices,
  centerLabel,
  centerValue,
  height = 260,
}: {
  slices: Slice[];
  centerLabel: string;
  centerValue: string;
  height?: number;
}) {
  const { ref, width } = useMeasure<HTMLDivElement>();
  const { tip, show, hide } = useTooltip();
  const [hover, setHover] = useState<string | null>(null);

  const total = slices.reduce((s, x) => s + x.value, 0);
  const cx = width / 2;
  const cy = height / 2;
  const rOuter = Math.min(width, height) / 2 - 34;
  const rInner = rOuter * 0.58;
  // A 2px surface gap between slices, expressed as an angle at this radius.
  const gap = rOuter > 0 ? 2 / rOuter : 0;

  let angle = -Math.PI / 2;
  const arcs = slices.map((s) => {
    const sweep = (s.value / total) * Math.PI * 2;
    const a0 = angle + gap / 2;
    const a1 = angle + sweep - gap / 2;
    angle += sweep;
    return { ...s, a0: Math.min(a0, a1), a1: Math.max(a0, a1), mid: (a0 + a1) / 2, sweep };
  });

  return (
    <div ref={ref} className="relative w-full" style={{ height }}>
      {width > 0 ? (
        <svg width={width} height={height} role="img" aria-label="Share of spend by cost category">
          {arcs.map((a) => {
            const dim = hover !== null && hover !== a.id;
            return (
              <g key={a.id}>
                <path
                  d={arcPath(cx, cy, rOuter, rInner, a.a0, a.a1)}
                  fill={a.color}
                  style={{
                    opacity: dim ? 0.28 : 1,
                    transition: "opacity 150ms",
                    transformOrigin: `${cx}px ${cy}px`,
                  }}
                  onMouseEnter={(e) => {
                    setHover(a.id);
                    const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
                    show({
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top - 40,
                      title: a.label,
                      rows: [
                        { label: "Amount", value: money(a.value), color: a.color, strong: true },
                        { label: "Share of spend", value: pct(a.share) },
                      ],
                    });
                  }}
                  onMouseLeave={() => {
                    setHover(null);
                    hide();
                  }}
                  className="cursor-pointer"
                />
                {/* direct labels, leader-lined, only where the slice can carry one */}
                {a.sweep > 0.34 ? (
                  <text
                    x={cx + Math.cos(a.mid) * ((rOuter + rInner) / 2)}
                    y={cy + Math.sin(a.mid) * ((rOuter + rInner) / 2)}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={11.5}
                    fontWeight={700}
                    fill="#fff"
                    className="tnum pointer-events-none"
                  >
                    {pct(a.share, 0)}
                  </text>
                ) : null}
                <title>{`${a.label}: ${money(a.value)} (${pct(a.share)})`}</title>
              </g>
            );
          })}

          <text x={cx} y={cy - 8} textAnchor="middle" fontSize={20.0} fontWeight={600} fill="var(--ink)" className="figure-lg">
            {centerValue}
          </text>
          <text x={cx} y={cy + 12} textAnchor="middle" fontSize={11} fill="var(--ink-4)">
            {centerLabel}
          </text>
        </svg>
      ) : null}
      <ChartTooltip tip={tip} containerWidth={width} />
    </div>
  );
}

export function SliceLegend({ slices, onHover }: { slices: Slice[]; onHover?: (id: string | null) => void }) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5">
      {[...slices]
        .sort((a, b) => b.value - a.value)
        .map((s) => (
          <li
            key={s.id}
            onMouseEnter={() => onHover?.(s.id)}
            onMouseLeave={() => onHover?.(null)}
            className="flex items-center gap-1.5 text-[11.5px]"
          >
            <span className="size-2.5 shrink-0 rounded-[3px]" style={{ background: s.color }} aria-hidden />
            <span className="min-w-0 flex-1 truncate text-ink-2">{s.label}</span>
            <span className="tnum shrink-0 font-semibold text-ink">{pct(s.share)}</span>
          </li>
        ))}
    </ul>
  );
}

/* ============================================================================
 * GROUPED COLUMNS
 * ==========================================================================*/

export function ColumnChart({
  data,
  height = 250,
}: {
  data: { label: string; a: number; b: number }[];
  height?: number;
}) {
  const { ref, width } = useMeasure<HTMLDivElement>();
  const { tip, show, hide } = useTooltip();
  const [hover, setHover] = useState<number | null>(null);

  const M = { top: 14, right: 12, bottom: 24, left: 50 };
  const plotH = height - M.top - M.bottom;
  const innerW = Math.max(0, width - M.left - M.right);
  const band = data.length ? innerW / data.length : 0;
  const barW = Math.min(20, Math.max(5, band * 0.3));

  const axis = niceScale(0, Math.max(...data.flatMap((d) => [d.a, d.b]), 1), 3);
  const y = linearScale([axis.min, axis.max], [M.top + plotH, M.top]);

  return (
    <div ref={ref} className="relative w-full" style={{ height }}>
      {width > 0 ? (
        <svg width={width} height={height} role="img" aria-label="Revenue against total cost, by month">
          <GridLines ticks={axis.ticks} scale={y} x0={M.left} x1={width - M.right} format={axisMoney} />
          {data.map((d, i) => {
            const cx = M.left + band * i + band / 2;
            const dim = hover !== null && hover !== i;
            // Two adjacent bars keep a 2px surface gap between them.
            return (
              <g key={d.label} style={{ opacity: dim ? 0.35 : 1, transition: "opacity 150ms" }}>
                <path
                  d={barPath(cx - barW - 1, y(d.a), barW, M.top + plotH - y(d.a), 4, "top")}
                  fill="var(--brand)"
                  className="grow-y"
                  style={{ transformOrigin: `${cx}px ${M.top + plotH}px`, animationDelay: `${i * 30}ms` }}
                />
                <path
                  d={barPath(cx + 1, y(d.b), barW, M.top + plotH - y(d.b), 4, "top")}
                  fill="var(--series-5)"
                  className="grow-y"
                  style={{ transformOrigin: `${cx}px ${M.top + plotH}px`, animationDelay: `${i * 30 + 60}ms` }}
                />
                <rect
                  x={M.left + band * i}
                  y={M.top}
                  width={band}
                  height={plotH}
                  fill="transparent"
                  tabIndex={0}
                  role="button"
                  aria-label={`${d.label}: revenue ${money(d.a)}, cost ${money(d.b)}`}
                  className="cursor-crosshair outline-none"
                  onMouseEnter={(e) => {
                    setHover(i);
                    const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
                    show({
                      x: e.clientX - rect.left,
                      y: 6,
                      title: d.label,
                      rows: [
                        { label: "Revenue", value: moneyCompact(d.a), color: "var(--brand)" },
                        { label: "Total cost", value: moneyCompact(d.b), color: "var(--series-5)" },
                        { label: "Kept", value: moneyCompact(d.a - d.b), strong: true },
                      ],
                    });
                  }}
                  onFocus={() => setHover(i)}
                  onMouseLeave={() => {
                    setHover(null);
                    hide();
                  }}
                  onBlur={() => setHover(null)}
                />
              </g>
            );
          })}
          <XLabels
            labels={data.map((d) => d.label)}
            band={band}
            y={height - 6}
            x0={M.left}
            highlight={data.length - 1}
          />
        </svg>
      ) : null}
      <ChartTooltip tip={tip} containerWidth={width} />
    </div>
  );
}

/* ============================================================================
 * RANKED HORIZONTAL BARS (diverging when values cross zero)
 * ==========================================================================*/

export function HBarChart({
  rows,
  format = money,
  height,
}: {
  rows: { id: string; label: string; value: number; note?: string }[];
  format?: (v: number) => string;
  height?: number;
}) {
  const { ref, width } = useMeasure<HTMLDivElement>();
  const rowH = 30;
  const LABEL_W = 160;
  const h = height ?? rows.length * rowH + 8;

  const hasNegative = rows.some((r) => r.value < 0);
  const maxAbs = Math.max(...rows.map((r) => Math.abs(r.value)), 1);
  const trackW = Math.max(0, width - LABEL_W - 90);
  const zeroX = hasNegative ? LABEL_W + trackW / 2 : LABEL_W;
  const scale = hasNegative ? trackW / 2 / maxAbs : trackW / maxAbs;

  return (
    <div ref={ref} className="relative w-full" style={{ height: h }}>
      {width > 0 ? (
        <svg width={width} height={h} role="img" aria-label="Ranked contribution by item">
          {hasNegative ? (
            <line x1={zeroX} x2={zeroX} y1={0} y2={h} stroke="var(--axis)" strokeWidth={1} shapeRendering="crispEdges" />
          ) : null}
          {rows.map((r, i) => {
            const y = i * rowH + 4;
            const w = Math.abs(r.value) * scale;
            const x = r.value < 0 ? zeroX - w : zeroX;
            const positive = r.value >= 0;
            return (
              <g key={r.id} className="group">
                <rect x={0} y={y} width={width} height={rowH - 4} fill="transparent" className="group-hover:fill-surface-2" />
                <text x={0} y={y + (rowH - 4) / 2} dominantBaseline="middle" fontSize={11.5} fill="var(--ink-2)">
                  {r.label.length > 24 ? `${r.label.slice(0, 23)}…` : r.label}
                </text>
                <path
                  d={barPath(x, y + 5, Math.max(w, 2), rowH - 14, 3, positive ? "right" : "left")}
                  fill={positive ? "var(--div-pos-2)" : "var(--div-neg-2)"}
                  className="grow-x"
                  style={{ transformOrigin: `${zeroX}px center`, animationDelay: `${i * 35}ms` }}
                />
                <text
                  x={width - 4}
                  y={y + (rowH - 4) / 2}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize={11.5}
                  fontWeight={600}
                  fill={positive ? "var(--good-ink)" : "var(--critical-ink)"}
                  className="tnum"
                >
                  {format(r.value)}
                </text>
                <title>{`${r.label}: ${format(r.value)}${r.note ? ` · ${r.note}` : ""}`}</title>
              </g>
            );
          })}
        </svg>
      ) : null}
    </div>
  );
}

export function ChartLegendInline({ items }: { items: { label: string; color: string }[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {items.map((i) => (
        <li key={i.label} className={cn("flex items-center gap-1.5 text-[11.5px]")}>
          <span className="size-2.5 rounded-[3px]" style={{ background: i.color }} aria-hidden />
          <span className="text-ink-2">{i.label}</span>
        </li>
      ))}
    </ul>
  );
}
