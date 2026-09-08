import { NextResponse } from "next/server";
import pool from "@/lib/db";

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const keep = local.length <= 2 ? 1 : 2;
  return `${local.slice(0, keep)}${"*".repeat(Math.max(local.length - keep, 2))}@${domain}`;
}

const onlyDigits = (value: string) => value.replace(/\D/g, "");

export async function POST(request: Request) {
  try {
    const { name, phone } = await request.json();

    if (!name || !phone) {
      return NextResponse.json({ error: "이름과 연락처를 입력하세요." }, { status: 400 });
    }

    const targetPhone = onlyDigits(phone);

    const { rows } = await pool.query(
      "SELECT email, phone FROM members WHERE name = $1 AND status = 'active'",
      [name.trim()]
    );

    const member = rows.find((row) => row.phone && onlyDigits(row.phone) === targetPhone);

    if (!member) {
      return NextResponse.json(
        { error: "일치하는 회원 정보를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, email: maskEmail(member.email) });
  } catch (err) {
    console.error("[auth/find-email]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
