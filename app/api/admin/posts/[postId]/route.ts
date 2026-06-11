import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { ensurePostAdminReply } from "@/lib/ensure-tables";

export async function GET(
  _req: Request,
  { params }: { params: { postId: string } }
) {
  const { rows } = await pool.query(
    `SELECT id, board_id, title, author_name, content, is_notice, category_id,
            TO_CHAR(created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD') AS created_at
     FROM posts WHERE id = $1`,
    [params.postId]
  );
  if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function PUT(
  req: Request,
  { params }: { params: { postId: string } }
) {
  const { title, author_name, content, is_notice, created_at, category_id } = await req.json();

  if (!title || !author_name || !content) {
    return NextResponse.json({ error: "필수 항목을 입력하세요." }, { status: 400 });
  }

  const postDate = created_at ? new Date(created_at) : new Date();

  const { rowCount } = await pool.query(
    `UPDATE posts
     SET title=$1, author_name=$2, content=$3, is_notice=$4,
         category_id=$5, created_at=$6, updated_at=NOW()
     WHERE id=$7`,
    [title, author_name, content, is_notice ?? false, category_id ?? null, postDate, params.postId]
  );

  if (rowCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: Request,
  { params }: { params: { postId: string } }
) {
  await ensurePostAdminReply();
  const { reply } = await req.json();
  if (!reply?.trim()) {
    return NextResponse.json({ error: "답변 내용을 입력하세요." }, { status: 400 });
  }
  const { rowCount } = await pool.query(
    `UPDATE posts SET admin_reply=$1, admin_replied_at=NOW(), updated_at=NOW() WHERE id=$2`,
    [reply.trim(), params.postId]
  );
  if (rowCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { postId: string } }
) {
  const { rowCount } = await pool.query(
    `DELETE FROM posts WHERE id = $1`,
    [params.postId]
  );
  if (rowCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
