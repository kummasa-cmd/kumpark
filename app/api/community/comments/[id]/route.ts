import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifyMemberToken, MEMBER_COOKIE } from "@/lib/member-auth";

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const token = cookies().get(MEMBER_COOKIE)?.value;
  const member = token ? await verifyMemberToken(token) : null;
  if (!member) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rows } = await pool.query(
    "SELECT id, author_type, author_id FROM comments WHERE id = $1",
    [params.id]
  );
  const comment = rows[0];
  if (!comment) return NextResponse.json({ error: "댓글을 찾을 수 없습니다." }, { status: 404 });

  if (!(comment.author_type === "member" && comment.author_id === member.id)) {
    return NextResponse.json({ error: "자신의 댓글만 삭제할 수 있습니다." }, { status: 403 });
  }

  await pool.query("DELETE FROM comments WHERE id = $1", [params.id]);
  return NextResponse.json({ ok: true });
}
