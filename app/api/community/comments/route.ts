import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifyMemberToken, MEMBER_COOKIE } from "@/lib/member-auth";
import { ensureCategoryTables } from "@/lib/ensure-tables";

export async function POST(request: Request) {
  const token = cookies().get(MEMBER_COOKIE)?.value;
  const member = token ? await verifyMemberToken(token) : null;
  if (!member) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  await ensureCategoryTables();

  const { post_id, parent_id, content } = await request.json();
  if (!post_id || !content?.trim()) {
    return NextResponse.json({ error: "내용을 입력하세요." }, { status: 400 });
  }

  // 게시물의 게시판이 use_comment=true인지 확인
  const { rows: boardRows } = await pool.query(
    `SELECT b.use_comment FROM boards b JOIN posts p ON p.board_id = b.id WHERE p.id = $1`,
    [post_id]
  );
  if (!boardRows[0]?.use_comment) {
    return NextResponse.json({ error: "이 게시판은 댓글을 사용하지 않습니다." }, { status: 403 });
  }

  const { rows: memberRows } = await pool.query(
    "SELECT name, nickname FROM members WHERE id = $1",
    [member.id]
  );
  const authorName = memberRows[0]?.nickname || memberRows[0]?.name || member.name;

  const { rows } = await pool.query(
    `INSERT INTO comments (post_id, parent_id, author_name, author_type, author_id, content)
     VALUES ($1, $2, $3, 'member', $4, $5)
     RETURNING id, parent_id, author_name, author_type, author_id, content,
               TO_CHAR(created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI') AS created_at`,
    [post_id, parent_id ?? null, authorName, member.id, content.trim()]
  );

  return NextResponse.json(rows[0], { status: 201 });
}
