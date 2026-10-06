import { NextResponse } from "next/server";
import crypto from "crypto";
import pool from "@/lib/db";
import { ensurePasswordResetTable } from "@/lib/ensure-tables";
import { sendPasswordResetMail } from "@/lib/mailer";
import { isLimited, recordAttempt, getClientIp, TOO_MANY } from "@/lib/rate-limit";

const GENERIC_MESSAGE =
  "입력하신 이메일로 회원 정보가 있다면 비밀번호 재설정 메일을 보내드렸습니다.";

export async function POST(request: Request) {
  try {
    await ensurePasswordResetTable();

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "이메일을 입력하세요." }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // 메일 폭탄 방지: 1시간 내 이메일당 3회, IP당 10회
    const attempts = [
      { scope: "reset_request_email", key: normalizedEmail },
      { scope: "reset_request_ip", key: getClientIp(request) },
    ];
    if (
      await isLimited([
        { ...attempts[0], max: 3, windowMinutes: 60 },
        { ...attempts[1], max: 10, windowMinutes: 60 },
      ])
    ) {
      return NextResponse.json({ error: TOO_MANY }, { status: 429 });
    }
    await recordAttempt(attempts);

    const { rows } = await pool.query(
      "SELECT id, name, email FROM members WHERE email = $1 AND status = 'active'",
      [normalizedEmail]
    );
    const member = rows[0];

    if (member) {
      const token = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1시간

      await pool.query(
        `INSERT INTO password_resets (member_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
        [member.id, tokenHash, expiresAt]
      );

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kumpark.com";
      const resetUrl = `${siteUrl}/reset-password/confirm?token=${token}`;

      await sendPasswordResetMail({ toName: member.name, toEmail: member.email, resetUrl });
    }

    return NextResponse.json({ ok: true, message: GENERIC_MESSAGE });
  } catch (err) {
    console.error("[auth/password-reset/request]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
