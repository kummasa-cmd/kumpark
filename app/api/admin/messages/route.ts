import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { ensureMessagesTable } from "@/lib/ensure-tables";
import { sendMessageMail } from "@/lib/mailer";
import { validateMessageContent, formatSentAt, SITE_URL } from "@/lib/messages";
import { requireAdmin } from "@/lib/admin-guard";

// 관리자 → 회원 쪽지 발송
export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  try {
    const body = await request.json().catch(() => null);
    const memberId = Number(body?.memberId);
    if (!Number.isInteger(memberId)) {
      return NextResponse.json({ error: "받는 회원을 선택하세요." }, { status: 400 });
    }
    const result = validateMessageContent(body?.content);
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });

    const { rows: memberRows } = await pool.query(
      "SELECT id, name, email FROM members WHERE id = $1",
      [memberId]
    );
    const member = memberRows[0];
    if (!member) return NextResponse.json({ error: "회원을 찾을 수 없습니다." }, { status: 404 });

    await ensureMessagesTable();
    const { rows } = await pool.query(
      `INSERT INTO messages (member_id, admin_id, direction, content)
       VALUES ($1, $2, 'to_member', $3) RETURNING id`,
      [member.id, guard.id, result.content]
    );

    // 회원 이메일로 쪽지 내용 전송 — 실패해도 발송은 성공 처리
    sendMessageMail({
      fromName: "검파크 관리자",
      toName: member.name,
      toEmail: member.email,
      content: result.content,
      sentAt: formatSentAt(new Date()),
      listUrl: `${SITE_URL}/mypage/messages`,
    }).catch((err) => console.error("[mailer] 쪽지 메일 발송 실패:", err));

    return NextResponse.json({ ok: true, id: rows[0].id });
  } catch (err) {
    console.error("[admin/messages]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
