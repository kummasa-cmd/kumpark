import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { signMemberToken, MEMBER_COOKIE } from "@/lib/member-auth";
import { isLimited, recordAttempt, clearAttempts, getClientIp, TOO_MANY } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "이메일과 비밀번호를 입력하세요." }, { status: 400 });
    }

    // 무차별 대입 방지: 15분 내 계정당 5회, IP당 30회 실패 시 차단
    const normalizedEmail = String(email).trim().toLowerCase();
    const ip = getClientIp(request);
    const failKeys = [
      { scope: "member_login_email", key: normalizedEmail },
      { scope: "member_login_ip", key: ip },
    ];
    if (
      await isLimited([
        { ...failKeys[0], max: 5, windowMinutes: 15 },
        { ...failKeys[1], max: 30, windowMinutes: 15 },
      ])
    ) {
      return NextResponse.json({ error: TOO_MANY }, { status: 429 });
    }

    const { rows } = await pool.query(
      "SELECT id, email, name, password_hash, status FROM members WHERE email = $1",
      [normalizedEmail]
    );

    const member = rows[0];
    const valid = member && (await bcrypt.compare(password, member.password_hash));

    if (!valid) {
      await recordAttempt(failKeys);
      return NextResponse.json(
        { error: "이메일 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }

    if (member.status !== "active") {
      return NextResponse.json(
        { error: "정지된 계정입니다. 관리자에게 문의하세요." },
        { status: 403 }
      );
    }

    await clearAttempts("member_login_email", normalizedEmail);
    const token = await signMemberToken({ id: member.id, email: member.email, name: member.name });

    const response = NextResponse.json({ ok: true, name: member.name });
    response.cookies.set(MEMBER_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  } catch (err) {
    console.error("[auth/login]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
