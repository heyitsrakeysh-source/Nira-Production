/**
 * Plain-language layer.
 *
 * Finance vocabulary is precise and, to most founders, opaque. Rather than
 * pick a side, the product carries both: a toggle swaps every label between
 * the term an accountant expects and the phrase everyone else understands,
 * and the explanation is always one hover away in either mode.
 *
 * The rule: never show a term the reader has to already know in order to read
 * the screen.
 */

export interface Term {
  id: string;
  /** What an accountant would call it. */
  finance: string;
  /** What it actually means, in words anyone can read. */
  plain: string;
  /** One sentence, shown on hover in both modes. */
  explain: string;
  /** Optional short form for tight spaces. */
  shortPlain?: string;
}

export const TERMS: Record<string, Term> = {
  revenue: {
    id: "revenue",
    finance: "Total revenue",
    plain: "Money in",
    explain: "Everything customers paid you, after discounts and returns are taken off.",
  },
  cogs: {
    id: "cogs",
    finance: "COGS",
    plain: "What the products cost you",
    shortPlain: "Product cost",
    explain: "What you paid to make or buy the things you sold this period.",
  },
  grossProfit: {
    id: "grossProfit",
    finance: "Gross profit",
    plain: "Left after product cost",
    explain: "Revenue minus what the products cost you, before any other expense.",
  },
  grossMargin: {
    id: "grossMargin",
    finance: "Gross margin",
    plain: "Share left after product cost",
    explain: "Gross profit as a percentage of revenue. Higher is better.",
  },
  netProfit: {
    id: "netProfit",
    finance: "Net profit",
    plain: "What you actually kept",
    explain: "What is left after every single cost, including rent and salaries.",
  },
  netMargin: {
    id: "netMargin",
    finance: "Net margin",
    plain: "Share you kept",
    explain: "Net profit as a percentage of revenue. Zero means you broke even.",
  },
  contribution: {
    id: "contribution",
    finance: "Contribution per order",
    plain: "Kept per order",
    explain:
      "What one order leaves behind after the product, shipping, packaging, payment fees and the ads that won it. Rent and salaries come out of this next.",
  },
  contributionMargin: {
    id: "contributionMargin",
    finance: "Contribution margin",
    plain: "Share kept per order",
    explain: "What you keep on an order as a percentage of what the customer paid.",
  },
  cac: {
    id: "cac",
    finance: "CAC",
    plain: "Cost to win one order",
    shortPlain: "Cost per order",
    explain: "Total advertising spend divided by orders. What it costs you, in ads, to get one sale.",
  },
  aov: {
    id: "aov",
    finance: "AOV",
    plain: "Average order size",
    explain: "The average amount a customer spends in one order.",
  },
  roas: {
    id: "roas",
    finance: "ROAS",
    plain: "Revenue per ₹1 of ads",
    explain: "How much revenue each rupee of advertising brings back. 2.4x means ₹2.40 back for every ₹1 spent.",
  },
  breakEvenRoas: {
    id: "breakEvenRoas",
    finance: "Break-even ROAS",
    plain: "Ads return you need",
    explain: "The revenue-per-rupee-of-ads at which you would exactly break even. Below it, you lose money.",
  },
  breakEvenCac: {
    id: "breakEvenCac",
    finance: "Break-even CAC",
    plain: "Most you can pay per order",
    explain: "The highest you could pay to win an order and still not lose money on it.",
  },
  fixedCost: {
    id: "fixedCost",
    finance: "Fixed cost",
    plain: "Costs you pay anyway",
    explain: "Rent, salaries and software. These land whether you sell one order or a thousand.",
  },
  opCosts: {
    id: "opCosts",
    finance: "Operational costs",
    plain: "Cost of getting orders out",
    explain: "Shipping, packaging, payment fees and your fixed overhead.",
  },
  marketing: {
    id: "marketing",
    finance: "Marketing spend",
    plain: "Spent on ads",
    explain: "Everything paid to advertising platforms, agencies and creative production.",
  },
  orders: {
    id: "orders",
    finance: "Orders",
    plain: "Orders",
    explain: "Delivered orders, after cancellations are removed.",
  },
  returnRate: {
    id: "returnRate",
    finance: "Return rate",
    plain: "Share sent back",
    explain: "How many of the orders you delivered came back to you.",
  },
  shipping: {
    id: "shipping",
    finance: "Shipping cost",
    plain: "Courier cost",
    explain: "What couriers charge you to deliver orders.",
  },
  cogsPerOrder: {
    id: "cogsPerOrder",
    finance: "COGS per order",
    plain: "Product cost per order",
    explain: "What the goods in one average order cost you.",
  },
};

export function term(id: string): Term | undefined {
  return TERMS[id];
}

/** The label to show, given the reader's chosen mode. */
export function label(id: string, plainMode: boolean, short = false): string {
  const t = TERMS[id];
  if (!t) return id;
  if (!plainMode) return t.finance;
  return short && t.shortPlain ? t.shortPlain : t.plain;
}
