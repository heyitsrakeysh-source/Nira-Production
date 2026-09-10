import { NextResponse } from "next/server";
import { readBrandRows, sheetConfigStatus } from "@/lib/server/google-sheets";

export async function GET() {
  if (!sheetConfigStatus().configured) return NextResponse.json({ configured: false, rows: [] });
  try {
    return NextResponse.json({ configured: true, rows: await readBrandRows() });
  } catch (error) {
    return NextResponse.json({ configured: true, error: error instanceof Error ? error.message : "Google Sheets read failed" }, { status: 502 });
  }
}