import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function GET() {
  const config = {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    passSet: !!process.env.SMTP_PASS,
    from: process.env.SMTP_FROM,
    adminEmail: process.env.ADMIN_EMAIL,
  };

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST ?? "smtp.naver.com",
      port: Number(process.env.SMTP_PORT ?? 465),
      secure: Number(process.env.SMTP_PORT ?? 465) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: { rejectUnauthorized: false },
    });

    // 연결 검증
    await transporter.verify();

    // 테스트 메일 발송
    await transporter.sendMail({
      from: `"검파크 테스트" <${process.env.SMTP_FROM}>`,
      to: process.env.ADMIN_EMAIL,
      subject: "[검파크] SMTP 테스트 메일",
      text: "SMTP 설정이 정상입니다.",
    });

    return NextResponse.json({ ok: true, message: "테스트 메일 발송 성공", config });
  } catch (err: unknown) {
    const error = err as Error & { code?: string; responseCode?: number; response?: string };
    return NextResponse.json({
      ok: false,
      config,
      error: error.message,
      code: error.code,
      responseCode: error.responseCode,
      response: error.response,
    }, { status: 500 });
  }
}
