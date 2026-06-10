import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifyMemberToken, MEMBER_COOKIE } from "@/lib/member-auth";

async function getMe() {
  const token = cookies().get(MEMBER_COOKIE)?.value;
  if (!token) return null;
  return verifyMemberToken(token);
}

export async function PUT(
  request: Request,
  { params }: { params: { postId: string } }
) {
  const member = await getMe();
  if (!member) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rows } = await pool.query(
    "SELECT id, member_id FROM posts WHERE id = $1",
    [params.postId]
  );
  const post = rows[0];
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (post.member_id !== member.id)
    return NextResponse.json({ error: "자신의 게시물만 수정할 수 있습니다." }, { status: 403 });

  const { title, content } = await request.json();
  if (!title?.trim() || !content?.trim())
    return NextResponse.json({ error: "제목과 내용을 입력하세요." }, { status: 400 });

  await pool.query(
    "UPDATE posts SET title=$1, content=$2, updated_at=NOW() WHERE id=$3",
    [title.trim(), content.trim(), params.postId]
  );
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { postId: string } }
) {
  const member = await getMe();
  if (!member) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rows } = await pool.query(
    "SELECT id, member_id FROM posts WHERE id = $1",
    [params.postId]
  );
  const post = rows[0];
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (post.member_id !== member.id)
    return NextResponse.json({ error: "자신의 게시물만 삭제할 수 있습니다." }, { status: 403 });

  await pool.query("DELETE FROM posts WHERE id = $1", [params.postId]);
  return NextResponse.json({ ok: true });
}
