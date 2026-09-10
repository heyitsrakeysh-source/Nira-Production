"use client";

/**
 * Integrations.
 *
 * Each source declares which sheet rows it fills. Connecting one is a data
 * dump followed by a mapping step: the raw pull is structured into the same
 * line items the model already reads, and anything it cannot fill stays
 * manual. Nothing an integration writes is final, because every cell it
 * touches can still be overridden by hand.
 *
 * PROTOTYPE: connecting runs a simulated pull. See /guide for the real
 * OAuth and sync work behind each provider.
 */

import { useState } from "react";
import { Check, Link2, Plug, RefreshCw, TriangleAlert } from "lucide-react";
import { ALL_FIELDS, SOURCE_META, type FieldSource } from "@/lib/data/workspace";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Bits";
import { useToast } from "@/components/shell/Toast";

interface Provider {
  id: FieldSource;
  name: string;
  blurb: string;
  fills: string;
  connected: boolean;
  lastSync: string;
}

const PROVIDERS: Provider[] = [
  {
    id: "shopify",
    name: "Shopify",
    blurb: "Orders, refunds, discounts and gateway fees from the Admin API.",
    fills: "Net sales, shipping income, gross sales, discounts and returns, gateway fees",
    connected: true,
    lastSync: "12 minutes ago",
  },
  {
    id: "meta",
    name: "Meta Ads",
    blurb: "Daily spend by campaign, pulled nightly.",
    fills: "Total ad spend, Meta portion",
    connected: true,
    lastSync: "6 hours ago",
  },
  {
    id: "google",
    name: "Google Ads",
    blurb: "Search and PMax spend into the same daily spend table as Meta.",
    fills: "Total ad spend, Google portion",
    connected: false,
    lastSync: "never",
  },
  {
    id: "amazon",
    name: "Amazon Seller",
    blurb: "Settlement reports for marketplace sales and fees.",
    fills: "Amazon sales, FBA fees, storage fees, settlement adjustments",
    connected: true,
    lastSync: "2 days ago",
  },
  {
    id: "cost-model",
    name: "Cost model",
    blurb: "Local product costs, packaging and courier rates from the mock model.",
    fills: "Product COGS, shipping charges, packaging charges",
    connected: true,
    lastSync: "just now",
  },
];

export function IntegrationPanel() {
  const { push } = useToast();
  const [state, setState] = useState<Record<string, boolean>>(
    Object.fromEntries(PROVIDERS.map((p) => [p.id, p.connected])),
  );
  const [syncing, setSyncing] = useState<string | null>(null);

  const fieldsFor = (id: FieldSource) => ALL_FIELDS.filter((f) => f.source === id).length;
  const manualCount = ALL_FIELDS.filter((f) => f.source === "manual").length;

  const run = (p: Provider) => {
    setSyncing(p.id);
    setTimeout(() => {
      setSyncing(null);
      const n = fieldsFor(p.id);
      push({
        title: `${p.name} pulled and mapped`,
        body: `${n} line item${n === 1 ? "" : "s"} filled from the dump. Manual overrides were preserved.`,
        tone: "good",
      });
    }, 1500);
  };

  return (
    <Card>
      <CardHeader
        title="Connected sources"
        subtitle="Each source fills specific rows of the sheet. Anything it cannot fill stays manual, and anything it does fill can still be overridden."
        action={
          <Chip tone="neutral">
            {Object.values(state).filter(Boolean).length} of {PROVIDERS.length} connected
          </Chip>
        }
      />

      <ul className="mt-4 grid grid-cols-1 gap-2.5 lg:grid-cols-2">
        {PROVIDERS.map((p) => {
          const on = state[p.id];
          const busy = syncing === p.id;
          return (
            <li
              key={p.id}
              className={cn(
                "rounded-lg border p-3.5 transition-colors",
                on ? "border-line bg-surface-2" : "border-dashed border-line-strong bg-surface",
              )}
            >
              <div className="flex items-start gap-2.5">
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-lg",
                    on ? "bg-brand-soft text-brand-ink" : "bg-surface-3 text-ink-4",
                  )}
                >
                  <Plug size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-[13.5px] font-semibold text-ink">
                    {p.name}
                    {on ? (
                      <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-good-ink">
                        <Check size={11} /> connected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-ink-4">
                        not connected
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-ink-3">{p.blurb}</p>
                  <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-4">
                    <span className="font-medium text-ink-3">Fills:</span> {p.fills}
                  </p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <span className="text-[11.5px] text-ink-4">
                      {on ? `Last pull ${p.lastSync}` : "Never pulled"}
                    </span>
                    <span className="ml-auto flex gap-1.5">
                      {on ? (
                        <Button size="sm" icon={busy ? <RefreshCw size={12} className="anim-spin" /> : <RefreshCw size={12} />} onClick={() => run(p)} disabled={busy}>
                          {busy ? "Pulling" : "Pull now"}
                        </Button>
                      ) : (
                        <Button size="sm" variant="primary" icon={<Link2 size={12} />} onClick={() => { setState((s) => ({ ...s, [p.id]: true })); run(p); }}>
                          Connect
                        </Button>
                      )}
                      {on ? (
                        <Button size="sm" onClick={() => { setState((s) => ({ ...s, [p.id]: false })); push({ title: `${p.name} disconnected`, body: "Its rows fall back to manual entry.", tone: "warning" }); }}>
                          Disconnect
                        </Button>
                      ) : null}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-line bg-surface-2 p-3.5">
        <TriangleAlert size={14} className="mt-px shrink-0 text-warning" />
        <p className="text-[11.5px] leading-relaxed text-ink-3">
          <strong className="text-ink">{manualCount} line items have no source</strong> and will always need entering
          by hand: taxes, warehouse handling, COD remittance, influencer fees and the rest. Those are the rows the
          completeness meter is counting, and the sheet marks them so they are easy to find.
        </p>
      </div>
    </Card>
  );
}

export { PROVIDERS };
