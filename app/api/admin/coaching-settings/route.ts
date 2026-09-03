import { NextResponse } from "next/server";
import pool from "@/lib/db";
import {
  COACHING_SETTINGS_DEFAULTS,
  ensureCoachingSettingsTable,
  getCoachingSettings,
} from "@/lib/coaching-settings";

export async function GET() {
  const settings = await getCoachingSettings();
  return NextResponse.json(settings);
}

export async function PUT(req: Request) {
  const body: Record<string, string> = await req.json();
  await ensureCoachingSettingsTable();

  for (const [key, value] of Object.entries(body)) {
    if (!(key in COACHING_SETTINGS_DEFAULTS)) continue;
    await pool.query(
      `INSERT INTO site_settings (key, value, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
      [key, value]
    );
  }

  return NextResponse.json({ ok: true });
}
