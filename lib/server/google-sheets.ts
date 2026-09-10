import "server-only";
import { createSign } from "node:crypto";

export type SheetBrandRow = {
  brandId: string;
  brandName: string;
  monthKey: string;
  orders: number;
  revenue: number;
  marketingSpend: number;
  netProfit: number;
  source: "google-sheets";
};

type ServiceAccount = { client_email: string; private_key: string };

function env(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

function serviceAccount(): ServiceAccount {
  const raw = env("GOOGLE_SHEETS_SERVICE_ACCOUNT");
  const json = raw.trim().startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
  return JSON.parse(json) as ServiceAccount;
}

function base64Url(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

async function accessToken() {
  const account = serviceAccount();
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64Url(JSON.stringify({
    iss: account.client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  }));
  const unsigned = `${header}.${claim}`;
  const sign = createSign("RSA-SHA256");
  sign.update(unsigned);
  const assertion = `${unsigned}.${base64Url(sign.sign(account.private_key))}`;
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Google token request failed (${response.status})`);
  const body = (await response.json()) as { access_token: string };
  return body.access_token;
}

function number(value: unknown) {
  const parsed = Number(String(value ?? "").replaceAll(",", ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function readBrandRows() {
  const spreadsheetId = env("GOOGLE_SHEETS_SPREADSHEET_ID");
  const token = await accessToken();
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/Brands!A:G?majorDimension=ROWS`;
  const response = await fetch(url, { headers: { authorization: `Bearer ${token}` }, cache: "no-store" });
  if (!response.ok) throw new Error(`Google Sheets read failed (${response.status})`);
  const body = (await response.json()) as { values?: string[][] };
  const [header = [], ...rows] = body.values ?? [];
  const index = (name: string) => header.findIndex((cell) => cell.trim().toLowerCase() === name);
  const at = (row: string[], name: string) => row[index(name)] ?? "";
  return rows.filter((row) => at(row, "brandId")).map((row) => ({
    brandId: at(row, "brandId"),
    brandName: at(row, "brandName"),
    monthKey: at(row, "monthKey"),
    orders: number(at(row, "orders")),
    revenue: number(at(row, "revenue")),
    marketingSpend: number(at(row, "marketingSpend")),
    netProfit: number(at(row, "netProfit")),
    source: "google-sheets" as const,
  }));
}

export function sheetConfigStatus() {
  return {
    configured: Boolean(process.env.GOOGLE_SHEETS_SPREADSHEET_ID && process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT),
    spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID ? `${process.env.GOOGLE_SHEETS_SPREADSHEET_ID.slice(0, 8)}...` : null,
  };
}