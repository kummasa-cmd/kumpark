import { NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { rows } = await pool.query(
    `SELECT id, name, email, role, status FROM admins WHERE id = $1`,
    [params.id]
  );
  if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { name, email, role, status, password } = await req.json();

  if (!name || !email) {
    return NextResponse.json({ error: "필수 항목을 입력하세요." }, { status: 400 });
  }

  try {
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      await pool.query(
        `UPDATE admins SET name=$1, email=$2, role=$3, status=$4, password_hash=$5 WHERE id=$6`,
        [name, email, role, status, hash, params.id]
      );
    } else {
      await pool.query(
        `UPDATE admins SET name=$1, email=$2, role=$3, status=$4 WHERE id=$5`,
        [name, email, role, status, params.id]
      );
    }
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    if ((e as { code?: string }).code === "23505") {
      return NextResponse.json({ error: "이미 사용 중인 이메일입니다." }, { status: 409 });
    }
    throw e;
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  // 현재 로그인한 관리자 확인
  const cookie = req.headers.get("cookie") ?? "";
  const tokenMatch = cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  const token = tokenMatch?.[1];
  const me = token ? await verifyAdminToken(decodeURIComponent(token)) : null;

  if (me && me.id === Number(params.id)) {
    return NextResponse.json({ error: "본인 계정은 삭제할 수 없습니다." }, { status: 400 });
  }

  // 마지막 최고관리자 삭제 방지
  const { rows: target } = await pool.query(
    `SELECT role FROM admins WHERE id = $1`,
    [params.id]
  );
  if (!target[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (target[0].role === "super") {
    const { rows: supers } = await pool.query(
      `SELECT COUNT(*) AS cnt FROM admins WHERE role = 'super' AND status = 'active'`
    );
    if (Number(supers[0].cnt) <= 1) {
      return NextResponse.json(
        { error: "최고관리자가 1명뿐이라 삭제할 수 없습니다." },
        { status: 400 }
      );
    }
  }

  await pool.query(`DELETE FROM admins WHERE id = $1`, [params.id]);
  return NextResponse.json({ ok: true });
}
