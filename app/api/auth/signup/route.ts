import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { signMemberToken, MEMBER_COOKIE } from "@/lib/member-auth";
import { ensureMemberColumns } from "@/lib/ensure-tables";

export async function POST(request: Request) {
  try {
    await ensureMemberColumns();

    const { name, email, password, phone, nickname } = await request.json();

    if (!name || !email || !password || !nickname) {
      return NextResponse.json(
        { error: "이름, 닉네임, 이메일, 비밀번호는 필수입니다." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "비밀번호는 8자 이상이어야 합니다." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await pool.query("SELECT id FROM members WHERE email = $1", [normalizedEmail]);
    if (existing.rows[0]) {
      return NextResponse.json({ error: "이미 사용 중인 이메일입니다." }, { status: 409 });
    }

    const hash = await bcrypt.hash(password, 12);

    const { rows } = await pool.query(
      `INSERT INTO members (name, nickname, email, phone, password_hash, status, sms_yn, email_yn, created_at)
       VALUES ($1, $2, $3, $4, $5, 'active', 'Y', 'Y', NOW())
       RETURNING id, email, name`,
      [name.trim(), nickname.trim(), normalizedEmail, phone?.trim() ?? null, hash]
    );

    const member = rows[0];
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
    console.error("[auth/signup]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
