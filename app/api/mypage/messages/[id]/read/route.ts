import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifyMemberToken, MEMBER_COOKIE } from "@/lib/member-auth";
import { ensureMessagesTable } from "@/lib/ensure-tables";

// 회원이 받은 쪽지를 읽음 처리
export async function PATCH(_request: Request, { params }: { params: { id: string } }) {
  const token = cookies().get(MEMBER_COOKIE)?.value;
  const me = token ? await verifyMemberToken(token) : null;
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = Number(params.id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await ensureMessagesTable();
  await pool.query(
    `UPDATE messages SET read_at = NOW()
     WHERE id = $1 AND member_id = $2 AND direction = 'to_member' AND read_at IS NULL`,
    [id, me.id]
  );
  return NextResponse.json({ ok: true });
}
