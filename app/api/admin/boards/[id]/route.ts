import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { ensureCategoryTables } from "@/lib/ensure-tables";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await ensureCategoryTables();
  const { rows } = await pool.query(
    `SELECT id, name, slug, sort_order, is_visible, user_writable, use_category,
            COALESCE(use_comment, FALSE) AS use_comment,
            COALESCE(board_type, 'general') AS board_type
     FROM boards WHERE id = $1`,
    [params.id]
  );
  if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  await ensureCategoryTables();
  const { name, slug, sort_order, is_visible, user_writable, use_category, use_comment, board_type } =
    await req.json();

  if (!name || !slug) {
    return NextResponse.json({ error: "게시판명과 슬러그를 입력하세요." }, { status: 400 });
  }

  const slugPattern = /^[a-z0-9-]+$/;
  if (!slugPattern.test(slug)) {
    return NextResponse.json(
      { error: "슬러그는 영소문자, 숫자, 하이픈만 사용할 수 있습니다." },
      { status: 400 }
    );
  }

  try {
    const validTypes = ["general", "personal"];
    const type = validTypes.includes(board_type) ? board_type : "general";

    const { rowCount } = await pool.query(
      `UPDATE boards
       SET name=$1, slug=$2, sort_order=$3, is_visible=$4,
           user_writable=$5, use_category=$6, use_comment=$7, board_type=$8
       WHERE id=$9`,
      [
        name, slug, sort_order ?? 0,
        is_visible ?? true, user_writable ?? true,
        use_category ?? false, use_comment ?? false, type,
        params.id,
      ]
    );
    if (rowCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    if ((e as { code?: string }).code === "23505") {
      return NextResponse.json({ error: "이미 사용 중인 슬러그입니다." }, { status: 409 });
    }
    throw e;
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS cnt FROM posts WHERE board_id = $1`,
    [params.id]
  );

  if (rows[0].cnt > 0) {
    return NextResponse.json(
      { error: `게시물이 ${rows[0].cnt}개 있어 삭제할 수 없습니다. 게시물을 먼저 삭제해 주세요.` },
      { status: 409 }
    );
  }

  const { rowCount } = await pool.query(`DELETE FROM boards WHERE id = $1`, [params.id]);
  if (rowCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
