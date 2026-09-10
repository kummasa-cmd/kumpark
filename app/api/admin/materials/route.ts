import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/auth";
import { ensureCoachingMaterialsBoard } from "@/lib/ensure-tables";

export async function POST(req: Request) {
  await ensureCoachingMaterialsBoard();

  const token = cookies().get(COOKIE_NAME)?.value;
  const payload = token ? await verifyAdminToken(token) : null;
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, category_id, content } = await req.json();
  if (!title?.trim() || !content || content === "<p></p>") {
    return NextResponse.json({ error: "필수 항목을 입력하세요." }, { status: 400 });
  }

  const adminRow = await pool.query(`SELECT name FROM admins WHERE id = $1`, [payload.id]);
  const authorName = adminRow.rows[0]?.name ?? "관리자";

  const { rows: boardRows } = await pool.query(
    `SELECT id FROM boards WHERE slug = 'coaching-materials'`
  );
  const boardId = boardRows[0]?.id;
  if (!boardId) {
    return NextResponse.json({ error: "게시판을 찾을 수 없습니다." }, { status: 500 });
  }

  const { rows } = await pool.query(
    `INSERT INTO posts (board_id, title, author_name, content, category_id)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [boardId, title.trim(), authorName, content, category_id || null]
  );

  return NextResponse.json({ id: rows[0].id }, { status: 201 });
}
