import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { ensureMemberColumns } from "@/lib/ensure-tables";

export async function GET(req: Request) {
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
