import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/auth";
import { ensureCategoryTables } from "@/lib/ensure-tables";

export async function POST(req: Request) {
  await ensureCategoryTables();

  const token = cookies().get(COOKIE_NAME)?.value;
  const payload = token ? await verifyAdminToken(token) : null;
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { post_id, parent_id, content, author_name } = await req.json();

  if (!post_id || !content?.trim()) {
    return NextResponse.json({ error: "내용을 입력하세요." }, { status: 400 });
  }

  const adminRow = await pool.query(`SELECT name FROM admins WHERE id = $1`, [payload.id]);
  const defaultName = adminRow.rows[0]?.name ?? "관리자";
  const authorName = author_name?.trim() || defaultName;

  const { rows } = await pool.query(
    `INSERT INTO comments (post_id, parent_id, author_name, author_type, author_id, content)
     VALUES ($1, $2, $3, 'admin', $4, $5)
     RETURNING id, parent_id, author_name, author_type, author_id, content,
               TO_CHAR(created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI') AS created_at`,
    [post_id, parent_id ?? null, authorName, payload.id, content.trim()]
  );

  return NextResponse.json(rows[0], { status: 201 });
}
