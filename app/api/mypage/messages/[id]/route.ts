import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyMemberToken, MEMBER_COOKIE } from "@/lib/member-auth";
import { deleteMessageFor } from "@/lib/messages";

// 회원 쪽지함에서 쪽지 삭제 (본인 대화만, 관리자 쪽지함에는 남음)
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const token = cookies().get(MEMBER_COOKIE)?.value;
  const me = token ? await verifyMemberToken(token) : null;
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = Number(params.id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const deleted = await deleteMessageFor("member", id, me.id);
  if (!deleted) return NextResponse.json({ error: "쪽지를 찾을 수 없습니다." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
