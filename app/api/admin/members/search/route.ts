import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { ensureMemberColumns } from "@/lib/ensure-tables";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET(req: Request) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  await ensureMemberColumns();
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (!q) return NextResponse.json([]);

  const { rows } = await pool.query(
    `SELECT id, name, nickname, phone, email
     FROM members
     WHERE name ILIKE $1 OR nickname ILIKE $1 OR phone ILIKE $1
     ORDER BY created_at DESC
     LIMIT 10`,
    [`%${q}%`]
  );
  return NextResponse.json(rows);
}
