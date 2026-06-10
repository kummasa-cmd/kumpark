import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/auth";

export async function PUT(
  req: Request,
  { params }: { params: { commentId: string } }
) {
  const token = cookies().get(COOKIE_NAME)?.value;
  const payload = token ? await verifyAdminToken(token) : null;
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { content, author_name } = await req.json();
  if (!content?.trim()) {
    return NextResponse.json({ error: "내용을 입력하세요." }, { status: 400 });
  }

  // 자신이 쓴 댓글만 수정 가능
  const { rows } = await pool.query(
    `SELECT author_type, author_id, author_name FROM comments WHERE id = $1`,
    [params.commentId]
  );
  if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (rows[0].author_type !== "admin" || rows[0].author_id !== payload.id) {
    return NextResponse.json({ error: "자신이 작성한 댓글만 수정할 수 있습니다." }, { status: 403 });
  }

  const newAuthorName = author_name?.trim() || rows[0].author_name;

  const { rowCount } = await pool.query(
    `UPDATE comments SET content=$1, author_name=$2, updated_at=NOW() WHERE id=$3`,
    [content.trim(), newAuthorName, params.commentId]
  );
  if (rowCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { commentId: string } }
) {
  const token = cookies().get(COOKIE_NAME)?.value;
  const payload = token ? await verifyAdminToken(token) : null;
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 관리자는 모든 댓글 삭제 가능
  const { rowCount } = await pool.query(
    `DELETE FROM comments WHERE id = $1`,
    [params.commentId]
  );
  if (rowCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
