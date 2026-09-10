/**
 * GST.
 *
 * GST is a pass-through: you collect it on sales, you pay it on purchases, and
 * you remit the difference. It should not touch net profit at all, and in this
 * model it does not. What it *does* do is cause two very common mistakes,
 * which this module exists to surface:
 *
 *   1. Recording GST-inclusive prices as revenue, which overstates the top
 *      line by the tax rate and flatters every margin below it.
 *   2. Not claiming input credit on cost lines that carry GST, which turns a
 *      recoverable tax into a real cost.
 *
 * PROTOTYPE: rates are defaults for a footwear brand. Read them from the
 * workspace's tax settings, and from the HSN code on each product, before
 * relying on the output.
 */

import type { MonthFigures } from "./model";

export interface TaxConfig {
  /** Output GST charged to the customer on the sale. */
  outputRate: number;
  /** Input GST embedded in each cost line, claimable as credit. */
  inputRates: {
    cogs: number;
    shipping: number;
    packaging: number;
    fees: number;
    marketing: number;
  };
  /** True when the recorded sale price already contains GST. */
  pricesIncludeGst: boolean;
  /** True when the recorded product cost already contains GST. */
  cogsIncludesGst: boolean;
  /** Share of input credit actually claimed. Unclaimed credit is a real cost. */
  itcClaimRate: number;
}

export const DEFAULT_TAX_CONFIG: TaxConfig = {
  // Footwear above ₹1,000 attracts 12%; services attract 18%.
  outputRate: 12,
  inputRates: { cogs: 12, shipping: 18, packaging: 18, fees: 18, marketing: 18 },
  pricesIncludeGst: false,
  cogsIncludesGst: false,
  itcClaimRate: 100,
};

export interface GstLine {
  id: string;
  label: string;
  base: number;
  rate: number;
  gst: number;
  claimable: boolean;
}

export interface GstSummary {
  outputGst: number;
  inputLines: GstLine[];
  totalInputGst: number;
  claimedItc: number;
  unclaimedItc: number;
  netPayable: number;
  /** Revenue with GST stripped out, which is what the P&L should show. */
  revenueExGst: number;
  /** What revenue would read as if GST were left in. */
  revenueIncGst: number;
  /** How much the top line is overstated when prices are booked inclusive. */
  inclusiveOverstatement: number;
  effectiveTaxOnMargin: number;
}

/** Removes an embedded tax from a gross figure. */
export function stripGst(amount: number, rate: number) {
  return amount / (1 + rate / 100);
}

export function addGst(amount: number, rate: number) {
  return amount * (1 + rate / 100);
}

export function computeGst(m: MonthFigures, cfg: TaxConfig = DEFAULT_TAX_CONFIG): GstSummary {
  // The engine holds GST-exclusive figures, which is what a P&L should carry.
  const revenueExGst = cfg.pricesIncludeGst ? stripGst(m.totalRevenue, cfg.outputRate) : m.totalRevenue;
  const revenueIncGst = addGst(revenueExGst, cfg.outputRate);
  const outputGst = revenueIncGst - revenueExGst;

  const cogsBase = cfg.cogsIncludesGst ? stripGst(m.cogs, cfg.inputRates.cogs) : m.cogs;

  const inputLines: GstLine[] = [
    { id: "cogs", label: "Cost of goods", base: cogsBase, rate: cfg.inputRates.cogs, gst: cogsBase * (cfg.inputRates.cogs / 100), claimable: true },
    { id: "shipping", label: "Shipping", base: m.shipping, rate: cfg.inputRates.shipping, gst: m.shipping * (cfg.inputRates.shipping / 100), claimable: true },
    { id: "packaging", label: "Packaging", base: m.packaging, rate: cfg.inputRates.packaging, gst: m.packaging * (cfg.inputRates.packaging / 100), claimable: true },
    { id: "fees", label: "Payment gateway fees", base: m.transactionFees, rate: cfg.inputRates.fees, gst: m.transactionFees * (cfg.inputRates.fees / 100), claimable: true },
    { id: "marketing", label: "Advertising", base: m.totalMarketing, rate: cfg.inputRates.marketing, gst: m.totalMarketing * (cfg.inputRates.marketing / 100), claimable: true },
  ];

  const totalInputGst = inputLines.reduce((s, l) => s + l.gst, 0);
  const claimedItc = totalInputGst * (cfg.itcClaimRate / 100);
  const unclaimedItc = totalInputGst - claimedItc;
  const netPayable = outputGst - claimedItc;

  return {
    outputGst,
    inputLines,
    totalInputGst,
    claimedItc,
    unclaimedItc,
    netPayable,
    revenueExGst,
    revenueIncGst,
    inclusiveOverstatement: revenueIncGst - revenueExGst,
    // Unclaimed credit never comes back, so it lands on the bottom line.
    effectiveTaxOnMargin: unclaimedItc,
  };
}

/** Which GST rate applies to a product, by price band. */
export const HSN_BANDS = [
  { label: "Footwear under ₹1,000", rate: 5 },
  { label: "Footwear ₹1,000 and above", rate: 12 },
  { label: "Apparel under ₹1,000", rate: 5 },
  { label: "Apparel ₹1,000 and above", rate: 12 },
  { label: "Accessories", rate: 18 },
  { label: "Services (courier, ads, gateway)", rate: 18 },
];
