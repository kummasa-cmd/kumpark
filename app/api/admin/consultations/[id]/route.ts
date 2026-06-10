import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/auth";
import { sendConsultationReply } from "@/lib/mailer";

async function getAdmin() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

// 상태 변경 / 답변 등록 / 메모 저장
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { action, status, reply, memo } = body;

  const { rows } = await pool.query(
    "SELECT id, name, email, subject FROM consultations WHERE id = $1",
    [params.id]
  );
  if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const consultation = rows[0];

  if (action === "status") {
    await pool.query(
      "UPDATE consultations SET status = $1 WHERE id = $2",
      [status, params.id]
    );
    return NextResponse.json({ ok: true });
  }

  if (action === "reply") {
    if (!reply?.trim()) {
      return NextResponse.json({ error: "답변 내용을 입력하세요." }, { status: 400 });
    }
    await pool.query(
      `UPDATE consultations
       SET reply = $1, replied_at = NOW(), status = 'resolved'
       WHERE id = $2`,
      [reply.trim(), params.id]
    );
    // 신청자에게 답변 이메일 발송
    sendConsultationReply({
      toName: consultation.name,
      toEmail: consultation.email,
      subject: consultation.subject,
      reply: reply.trim(),
    }).catch((err) => console.error("[mailer] 답변 메일 발송 실패:", err));
    return NextResponse.json({ ok: true });
  }

  if (action === "memo") {
    await pool.query(
      "UPDATE consultations SET memo = $1 WHERE id = $2",
      [memo ?? null, params.id]
    );
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await pool.query("DELETE FROM consultations WHERE id = $1", [params.id]);
  return NextResponse.json({ ok: true });
}
