import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { listBroadcastRecipients, deleteBroadcastForAdmin } from "@/lib/messages";

// 묶음 발송 받는 회원별 확인 현황
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const id = Number(params.id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(await listBroadcastRecipients(id));
}

// 관리자 쪽지함에서 묶음 발송 삭제 (회원 쪽지함에는 남음)
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const id = Number(params.id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const deleted = await deleteBroadcastForAdmin(id);
  if (!deleted) return NextResponse.json({ error: "쪽지를 찾을 수 없습니다." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
