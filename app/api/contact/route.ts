import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifyMemberToken, MEMBER_COOKIE } from "@/lib/member-auth";
import { ensureMemberTables } from "@/lib/ensure-tables";
import { sendConsultationAlert } from "@/lib/mailer";

const MAX_SUBJECT = 100;
const MAX_MESSAGE = 3000;
const MIN_MESSAGE = 10;
// 도배 방지: 직전 등록 후 대기 시간 / 24시간 내 최대 등록 수
const COOLDOWN_SECONDS = 60;
const DAILY_LIMIT = 5;

const PHONE_RE = /^[0-9+\-\s()]{8,20}$/;

export async function POST(request: Request) {
  try {
    // 로그인한 회원만 상담 등록 가능
    const token = cookies().get(MEMBER_COOKIE)?.value;
    const me = token ? await verifyMemberToken(token) : null;
    if (!me) {
      return NextResponse.json({ error: "로그인 후 이용할 수 있습니다." }, { status: 401 });
    }

    await ensureMemberTables();

    // 토큰만 믿지 않고 DB에서 활성 회원인지 재확인 (탈퇴·정지 회원 차단)
    const { rows: memberRows } = await pool.query(
      "SELECT id, name, email, status FROM members WHERE id = $1",
      [me.id]
    );
    const member = memberRows[0];
    if (!member || member.status !== "active") {
      return NextResponse.json({ error: "이용할 수 없는 계정입니다." }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
    }

    const subject = typeof body.subject === "string" ? body.subject.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";

    if (!subject || !message) {
      return NextResponse.json({ error: "필수 항목을 모두 입력하세요." }, { status: 400 });
    }
    if (subject.length > MAX_SUBJECT) {
      return NextResponse.json({ error: `제목은 ${MAX_SUBJECT}자 이내로 입력하세요.` }, { status: 400 });
    }
    if (message.length < MIN_MESSAGE || message.length > MAX_MESSAGE) {
      return NextResponse.json(
        { error: `문의 내용은 ${MIN_MESSAGE}~${MAX_MESSAGE}자로 입력하세요.` },
        { status: 400 }
      );
    }
    if (phone && !PHONE_RE.test(phone)) {
      return NextResponse.json({ error: "휴대폰 번호 형식이 올바르지 않습니다." }, { status: 400 });
    }

    // 회원별 등록 빈도 제한
    const { rows: rateRows } = await pool.query(
      `SELECT
         COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours')::int AS daily,
         COUNT(*) FILTER (WHERE created_at > NOW() - make_interval(secs => $2))::int AS recent
       FROM consultations
       WHERE member_id = $1`,
      [member.id, COOLDOWN_SECONDS]
    );
    if (rateRows[0].recent > 0) {
      return NextResponse.json(
        { error: "잠시 후 다시 시도해 주세요." },
        { status: 429 }
      );
    }
    if (rateRows[0].daily >= DAILY_LIMIT) {
      return NextResponse.json(
        { error: `상담 신청은 하루 ${DAILY_LIMIT}건까지 가능합니다.` },
        { status: 429 }
      );
    }

    // 이름·이메일은 클라이언트 입력이 아닌 회원 정보로 저장 (사칭 방지)
    const now = new Date();
    await pool.query(
      `INSERT INTO consultations (name, email, phone, subject, message, status, member_id, created_at)
       VALUES ($1, $2, $3, $4, $5, 'pending', $6, NOW())`,
      [member.name, member.email, phone || null, subject, message, member.id]
    );

    // 관리자 알림 메일 — 실패해도 상담 접수는 성공으로 처리
    const submittedAt = now.toLocaleString("ko-KR", {
      timeZone: "Asia/Seoul",
      year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

    sendConsultationAlert({
      name: member.name,
      email: member.email,
      phone: phone || null,
      subject,
      message,
      submittedAt,
    }).catch((err) => console.error("[mailer] 알림 메일 발송 실패:", err));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
