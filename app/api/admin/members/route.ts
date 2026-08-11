import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { ensureMemberColumns } from "@/lib/ensure-tables";

export async function GET() {
  await ensureMemberColumns();
  const { rows } = await pool.query(`
    SELECT id, name, nickname, email, phone, status, sms_yn, email_yn, coaching_yn,
           TO_CHAR(created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD') AS created_at
    FROM members
    ORDER BY created_at DESC, id DESC
  `);
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  await ensureMemberColumns();
  const {
    name, nickname, email, phone, password, status, memo,
    blog_url, threads_url, instagram_url, x_url, brunch_url, youtube_url, homepage_url,
    sms_yn, email_yn, coaching_yn,
  } = await req.json();

  if (!name || !nickname || !email || !password) {
    return NextResponse.json({ error: "이름, 닉네임, 이메일, 비밀번호는 필수입니다." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "비밀번호는 8자 이상이어야 합니다." }, { status: 400 });
  }

  const password_hash = await bcrypt.hash(password, 10);

  try {
    const { rows } = await pool.query(
      `INSERT INTO members
         (name, nickname, email, phone, password_hash, status, memo,
          blog_url, threads_url, instagram_url, x_url, brunch_url, youtube_url, homepage_url,
          sms_yn, email_yn, coaching_yn)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
       RETURNING id`,
      [
        name, nickname, email, phone ?? null,
        password_hash, status ?? "active", memo ?? null,
        blog_url ?? null, threads_url ?? null, instagram_url ?? null,
        x_url ?? null, brunch_url ?? null, youtube_url ?? null, homepage_url ?? null,
        sms_yn ?? "Y", email_yn ?? "Y", coaching_yn ?? "N",
      ]
    );
    return NextResponse.json({ id: rows[0].id }, { status: 201 });
  } catch (e: unknown) {
    if ((e as { code?: string }).code === "23505") {
      return NextResponse.json({ error: "이미 사용 중인 이메일입니다." }, { status: 409 });
    }
    throw e;
  }
}
