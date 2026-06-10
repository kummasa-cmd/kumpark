import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { signAdminToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "이메일과 비밀번호를 입력하세요." }, { status: 400 });
    }

    const { rows } = await pool.query(
      "SELECT id, email, name, password_hash, role, status FROM admins WHERE email = $1",
      [email]
    );

    const admin = rows[0];
    const valid = admin && (await bcrypt.compare(password, admin.password_hash));

    if (!valid) {
      return NextResponse.json(
        { error: "이메일 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }

    if (admin.status !== "active") {
      return NextResponse.json(
        { error: "비활성화된 계정입니다. 관리자에게 문의하세요." },
        { status: 403 }
      );
    }

    await pool.query("UPDATE admins SET last_login_at = NOW() WHERE id = $1", [admin.id]);

    const token = await signAdminToken({ id: admin.id, email: admin.email, role: admin.role });

    const response = NextResponse.json({ ok: true });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });
    return response;
  } catch (err) {
    console.error("[admin/login]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
