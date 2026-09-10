import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider, THEME_BOOT_SCRIPT } from "@/components/shell/ThemeProvider";
import { ToastProvider } from "@/components/shell/Toast";
import { WorkspaceProvider } from "@/lib/store";
import { AppShell } from "@/components/shell/AppShell";

export const metadata: Metadata = {
  title: {
  default: "Nira · Profitability Intelligence",
  template: "%s · Nira",
  },
  description:
    "Nira is a profitability intelligence workspace for D2C brands: P&L, daily run-rate, product analytics and forecasting.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f5f9" },
    { media: "(prefers-color-scheme: dark)", color: "#090b12" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <ToastProvider>
            <WorkspaceProvider>
              <AppShell>{children}</AppShell>
            </WorkspaceProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
