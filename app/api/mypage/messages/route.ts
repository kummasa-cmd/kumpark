import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifyMemberToken, MEMBER_COOKIE } from "@/lib/member-auth";
import { ensureMessagesTable } from "@/lib/ensure-tables";
import { sendMessageMail } from "@/lib/mailer";
import { validateMessageContent, formatSentAt, SITE_URL } from "@/lib/messages";

// 도배 방지: 직전 발송 후 대기 시간 / 24시간 내 최대 발송 수
const COOLDOWN_SECONDS = 10;
const DAILY_LIMIT = 30;

// 회원 → 관리자 쪽지 발송
export async function POST(request: Request) {
  try {
    const token = cookies().get(MEMBER_COOKIE)?.value;
    const me = token ? await verifyMemberToken(token) : null;
    if (!me) return NextResponse.json({ error: "로그인 후 이용할 수 있습니다." }, { status: 401 });

    const { rows: memberRows } = await pool.query(
      "SELECT id, name, email, status FROM members WHERE id = $1",
      [me.id]
    );
    const member = memberRows[0];
    if (!member || member.status !== "active") {
      return NextResponse.json({ error: "이용할 수 없는 계정입니다." }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const result = validateMessageContent(body?.content);
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });

    await ensureMessagesTable();

    const { rows: rateRows } = await pool.query(
      `SELECT
         COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours')::int AS daily,
         COUNT(*) FILTER (WHERE created_at > NOW() - make_interval(secs => $2))::int AS recent
       FROM messages
       WHERE member_id = $1 AND direction = 'to_admin'`,
      [member.id, COOLDOWN_SECONDS]
    );
    if (rateRows[0].recent > 0) {
      return NextResponse.json({ error: "잠시 후 다시 시도해 주세요." }, { status: 429 });
    }
    if (rateRows[0].daily >= DAILY_LIMIT) {
      return NextResponse.json(
        { error: `쪽지는 하루 ${DAILY_LIMIT}건까지 보낼 수 있습니다.` },
        { status: 429 }
      );
    }

    const { rows } = await pool.query(
      `INSERT INTO messages (member_id, direction, content) VALUES ($1, 'to_admin', $2) RETURNING id`,
      [member.id, result.content]
    );

    // 관리자 이메일로 쪽지 내용 전송 — 실패해도 발송은 성공 처리
    sendMessageMail({
      fromName: member.name,
      toName: "관리자",
      toEmail: process.env.ADMIN_EMAIL ?? "kummasa@naver.com",
      content: result.content,
      sentAt: formatSentAt(new Date()),
      listUrl: `${SITE_URL}/admin/messages`,
    }).catch((err) => console.error("[mailer] 쪽지 메일 발송 실패:", err));

    return NextResponse.json({ ok: true, id: rows[0].id });
  } catch (err) {
    console.error("[mypage/messages]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
