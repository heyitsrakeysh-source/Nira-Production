"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Topbar } from "./Topbar";
import { CommandPalette } from "./CommandPalette";
import { ToolRail } from "./ToolRail";

export function AppShell({ children }: { children: ReactNode }) {
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const openPalette = useCallback(() => setPaletteOpen(true), []);

  return (
    <div className="min-h-dvh">
      <div data-shell-main className="flex min-h-dvh flex-col">
        <Topbar onOpenPalette={openPalette} />
        <ToolRail />

        <main className="flex-1">{children}</main>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
