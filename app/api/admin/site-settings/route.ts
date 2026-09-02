import { NextResponse } from "next/server";
import pool from "@/lib/db";

const DEFAULTS: Record<string, string> = {
  hero_title_1: "기록이 모여",
  hero_title_2: "브랜드가 됩니다",
  hero_subtitle:
    "베스트셀러 루틴의 설계 홍성호 작가입니다.\n11권의 전자책을 썼고, 60권 이상의 전자책 출간을 코칭했습니다.\n1대 1 맞춤형 종이책 코칭도 진행 중입니다.\n당신의 작가 꿈을 이룰 수 있도록 함께하겠습니다.",
  hero_badge: "루틴의 설계 베스트셀러 작가",
  banner_interval: "10",
  banner_1_label: "11권의 전자책 출간",
  banner_2_label: "60+ 전자책 코칭",
  banner_3_label: "",
};

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key        VARCHAR(100) PRIMARY KEY,
      value      TEXT         NOT NULL DEFAULT '',
      updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY`);

  const entries = Object.entries(DEFAULTS);
  for (const [key, value] of entries) {
    await pool.query(
      `INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING`,
      [key, value]
    );
  }
}

export async function GET() {
  await ensureTable();
  const { rows } = await pool.query(`SELECT key, value FROM site_settings`);
  const settings: Record<string, string> = {};
  for (const row of rows) settings[row.key] = row.value;
  return NextResponse.json({ ...DEFAULTS, ...settings });
}

export async function PUT(req: Request) {
  const body: Record<string, string> = await req.json();
  await ensureTable();

  for (const [key, value] of Object.entries(body)) {
    if (!(key in DEFAULTS)) continue;
    await pool.query(
      `INSERT INTO site_settings (key, value, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
      [key, value]
    );
  }

  return NextResponse.json({ ok: true });
}
