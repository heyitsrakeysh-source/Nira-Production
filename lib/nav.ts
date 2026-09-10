import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Compass,
  FileBarChart2,
  Gauge,
  LayoutDashboard,
  LifeBuoy,
  Megaphone,
  Palette,
  Plug,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  hint?: string;
  soon?: boolean;
}

export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

export const NAV: NavGroup[] = [
  {
    id: "profit",
    label: "Profitability",
    items: [
      { href: "/brands", label: "All brands", icon: LayoutDashboard, hint: "Portfolio health at a glance" },
      { href: "/overview", label: "Overview", icon: LayoutDashboard, hint: "The month at a glance" },
      { href: "/drr", label: "Daily run-rate", icon: Gauge, hint: "Daily pacing and signals" },
      { href: "/weekly", label: "Weekly performance", icon: FileBarChart2, hint: "Week-on-week operating view" },
      { href: "/product-analytics", label: "Product analytics", icon: Compass, hint: "Product-level performance" },
      { href: "/story", label: "What changed", icon: Sparkles, hint: "Why profit moved" },
      { href: "/statement", label: "P&L statement", icon: ReceiptText, hint: "Full line-by-line statement" },
      { href: "/forecast", label: "Forecast", icon: Target, hint: "Pacing and break-even" },
      { href: "/unit-economics", label: "Unit economics", icon: Gauge, hint: "Per-order and per-SKU" },
      { href: "/explorer", label: "Explorer", icon: Compass, hint: "Flow, leaks and what-if" },
      { href: "/reports", label: "Reports", icon: FileBarChart2, hint: "Board pack and digests" },
    ],
  },
  {
    id: "platform",
    label: "Platform",
    items: [
      { href: "/ads", label: "Ads", icon: Megaphone, soon: true },
      { href: "/creative", label: "Creative", icon: Palette, soon: true },
      { href: "/integrations", label: "Integrations", icon: Plug, hint: "Connect the Google Sheets source" },
      { href: "/admin", label: "Admin", icon: ShieldCheck, soon: true },
    ],
  },
  {
    id: "help",
    label: "Help",
    items: [
      { href: "/guide", label: "Guide & setup", icon: BookOpen, hint: "Take this local model live" },
      { href: "/support", label: "Support", icon: LifeBuoy, soon: true },
    ],
  },
];

export const ALL_NAV_ITEMS = NAV.flatMap((g) => g.items);
