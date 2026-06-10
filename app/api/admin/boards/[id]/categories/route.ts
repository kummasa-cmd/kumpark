import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { ensureCategoryTables } from "@/lib/ensure-tables";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await ensureCategoryTables();
  const { rows } = await pool.query(
    `SELECT id, name, sort_order FROM board_categories
     WHERE board_id = $1 ORDER BY sort_order ASC, id ASC`,
    [params.id]
  );
  return NextResponse.json(rows);
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  await ensureCategoryTables();
  const { name, sort_order } = await req.json();
  if (!name) return NextResponse.json({ error: "카테고리명을 입력하세요." }, { status: 400 });

  const { rows } = await pool.query(
    `INSERT INTO board_categories (board_id, name, sort_order) VALUES ($1, $2, $3) RETURNING id`,
    [params.id, name, sort_order ?? 0]
  );
  return NextResponse.json({ id: rows[0].id }, { status: 201 });
}
