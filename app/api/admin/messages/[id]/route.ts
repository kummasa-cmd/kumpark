import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { deleteMessageFor } from "@/lib/messages";

// 관리자 쪽지함에서 쪽지 삭제 (관리자 공용, 회원 쪽지함에는 남음)
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const id = Number(params.id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const deleted = await deleteMessageFor("admin", id);
  if (!deleted) return NextResponse.json({ error: "쪽지를 찾을 수 없습니다." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
