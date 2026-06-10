import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { title, author_name, content, is_notice, created_at, category_id } = await req.json();

  if (!title || !author_name || !content) {
    return NextResponse.json({ error: "필수 항목을 입력하세요." }, { status: 400 });
  }

  const { rows: boardRows } = await pool.query(
    `SELECT id FROM boards WHERE id = $1`,
    [params.id]
  );
  if (!boardRows[0]) {
    return NextResponse.json({ error: "게시판을 찾을 수 없습니다." }, { status: 404 });
  }

  const postDate = created_at ? new Date(created_at) : new Date();

  const { rows } = await pool.query(
    `INSERT INTO posts (board_id, title, author_name, content, is_notice, category_id, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $7) RETURNING id`,
    [params.id, title, author_name, content, is_notice ?? false, category_id ?? null, postDate]
  );

  return NextResponse.json({ id: rows[0].id }, { status: 201 });
}
