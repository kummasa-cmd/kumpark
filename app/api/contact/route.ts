import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifyMemberToken, MEMBER_COOKIE } from "@/lib/member-auth";
import { ensureMemberTables } from "@/lib/ensure-tables";
import { sendConsultationAlert } from "@/lib/mailer";

export async function POST(request: Request) {
  try {
    await ensureMemberTables();

    const { name, email, phone, subject, message } = await request.json();
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "필수 항목을 모두 입력하세요." }, { status: 400 });
    }

    // 로그인된 회원이면 member_id 연결
    const token = cookies().get(MEMBER_COOKIE)?.value;
    const member = token ? await verifyMemberToken(token) : null;

    const now = new Date();
    await pool.query(
      `INSERT INTO consultations (name, email, phone, subject, message, status, member_id, created_at)
       VALUES ($1, $2, $3, $4, $5, 'pending', $6, NOW())`,
      [
        name.trim(),
        email.trim().toLowerCase(),
        phone?.trim() ?? null,
        subject.trim(),
        message.trim(),
        member?.id ?? null,
      ]
    );

    // 관리자 알림 메일 — 실패해도 상담 접수는 성공으로 처리
    const submittedAt = now.toLocaleString("ko-KR", {
      timeZone: "Asia/Seoul",
      year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

    sendConsultationAlert({
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim() ?? null,
      subject: subject.trim(),
      message: message.trim(),
      submittedAt,
    }).catch((err) => console.error("[mailer] 알림 메일 발송 실패:", err));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
