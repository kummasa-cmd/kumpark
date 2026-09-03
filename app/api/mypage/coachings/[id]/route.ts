import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifyMemberToken, MEMBER_COOKIE } from "@/lib/member-auth";

async function getMe() {
  const token = cookies().get(MEMBER_COOKIE)?.value;
  if (!token) return null;
  return verifyMemberToken(token);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const me = await getMe();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rows } = await pool.query(
    `SELECT id, member_id, status FROM coachings WHERE id = $1`,
    [params.id]
  );
  const coaching = rows[0];
  if (!coaching || coaching.member_id !== me.id) {
    return NextResponse.json({ error: "존재하지 않는 코칭 신청입니다." }, { status: 404 });
  }
  if (coaching.status !== "pending") {
    return NextResponse.json({ error: "입금대기 상태의 신청만 삭제할 수 있습니다." }, { status: 400 });
  }

  await pool.query(`DELETE FROM coachings WHERE id = $1`, [params.id]);
  return NextResponse.json({ ok: true });
}
