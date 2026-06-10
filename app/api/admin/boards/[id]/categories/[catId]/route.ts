import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function PUT(
  req: Request,
  { params }: { params: { id: string; catId: string } }
) {
  const { name, sort_order } = await req.json();
  if (!name) return NextResponse.json({ error: "카테고리명을 입력하세요." }, { status: 400 });

  const { rowCount } = await pool.query(
    `UPDATE board_categories SET name=$1, sort_order=$2 WHERE id=$3 AND board_id=$4`,
    [name, sort_order ?? 0, params.catId, params.id]
  );
  if (rowCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string; catId: string } }
) {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS cnt FROM posts WHERE category_id = $1`,
    [params.catId]
  );
  if (rows[0].cnt > 0) {
    return NextResponse.json(
      { error: `해당 카테고리를 사용하는 게시물이 ${rows[0].cnt}개 있습니다. 게시물을 먼저 변경해 주세요.` },
      { status: 409 }
    );
  }
  await pool.query(
    `DELETE FROM board_categories WHERE id=$1 AND board_id=$2`,
    [params.catId, params.id]
  );
  return NextResponse.json({ ok: true });
}
