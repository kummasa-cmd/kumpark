import { NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET() {
  const { rows } = await pool.query(
    `SELECT id, name, email, role, status, last_login_at, created_at
     FROM admins ORDER BY created_at ASC`
  );
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const { name, email, password, role, status } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "필수 항목을 입력하세요." }, { status: 400 });
  }

  const hash = await bcrypt.hash(password, 10);

  try {
    const { rows } = await pool.query(
      `INSERT INTO admins (name, email, password_hash, role, status)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [name, email, hash, role ?? "admin", status ?? "active"]
    );
    return NextResponse.json({ id: rows[0].id }, { status: 201 });
  } catch (e: unknown) {
    if ((e as { code?: string }).code === "23505") {
      return NextResponse.json({ error: "이미 사용 중인 이메일입니다." }, { status: 409 });
    }
    throw e;
  }
}
