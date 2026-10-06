import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import {
  validateMessageContent,
  createAdminMessages,
  MAX_SELECTED_RECIPIENTS,
} from "@/lib/messages";

// 관리자 → 회원 쪽지 발송
// target: "selected" = 선택한 회원(1명 이상), "all" = 활성 회원 전체
export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  try {
    const body = await request.json().catch(() => null);
    const target = body?.target === "all" ? "all" : "selected";

    const memberIds: number[] = Array.isArray(body?.memberIds)
      ? Array.from(new Set<number>(body.memberIds.map(Number).filter(Number.isInteger)))
      : [];
    if (target === "selected") {
      if (memberIds.length === 0) {
        return NextResponse.json({ error: "받는 회원을 선택하세요." }, { status: 400 });
      }
      if (memberIds.length > MAX_SELECTED_RECIPIENTS) {
        return NextResponse.json(
          { error: `한 번에 최대 ${MAX_SELECTED_RECIPIENTS}명까지 선택할 수 있습니다.` },
          { status: 400 }
        );
      }
    }

    const result = validateMessageContent(body?.content);
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });

    const count = await createAdminMessages({
      adminId: guard.id,
      target,
      memberIds,
      content: result.content,
    });
    if (count === 0) {
      return NextResponse.json({ error: "쪽지를 받을 회원이 없습니다." }, { status: 400 });
    }

    return NextResponse.json({ ok: true, count });
  } catch (err) {
    console.error("[admin/messages]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
