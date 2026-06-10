import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { ensureCategoryTables } from "@/lib/ensure-tables";

export async function GET() {
  await ensureCategoryTables();
  const { rows } = await pool.query(`
    SELECT b.id, b.name, b.slug, b.sort_order, b.is_visible, b.user_writable,
           b.use_category, b.use_comment,
           COALESCE(b.board_type, 'general') AS board_type,
           COUNT(p.id)::int AS post_count
    FROM boards b
    LEFT JOIN posts p ON p.board_id = b.id
    GROUP BY b.id
    ORDER BY b.sort_order ASC, b.id ASC
  `);
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const {
    name, slug, sort_order, is_visible, user_writable,
    use_category, use_comment, board_type,
  } = await req.json();

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

  const validTypes = ["general", "personal"];
  const type = validTypes.includes(board_type) ? board_type : "general";

  try {
    const { rows } = await pool.query(
      `INSERT INTO boards (name, slug, sort_order, is_visible, user_writable, use_category, use_comment, board_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [
        name, slug, sort_order ?? 0,
        is_visible ?? true, user_writable ?? true,
        use_category ?? false, use_comment ?? false, type,
      ]
    );
    return NextResponse.json({ id: rows[0].id }, { status: 201 });
  } catch (e: unknown) {
    if ((e as { code?: string }).code === "23505") {
      return NextResponse.json({ error: "이미 사용 중인 슬러그입니다." }, { status: 409 });
    }
    throw e;
  }
}
