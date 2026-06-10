import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { verifyMemberToken, MEMBER_COOKIE } from "@/lib/member-auth";
import { ensureMemberColumns } from "@/lib/ensure-tables";

async function getMe() {
  const token = cookies().get(MEMBER_COOKIE)?.value;
  if (!token) return null;
  return verifyMemberToken(token);
}

export async function GET() {
  const me = await getMe();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureMemberColumns();
  const { rows } = await pool.query(
    `SELECT id, name, nickname, email, phone, status,
            blog_url, threads_url, instagram_url, x_url, brunch_url, youtube_url, homepage_url,
            sms_yn, email_yn
     FROM members WHERE id = $1`,
    [me.id]
  );
  if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function PUT(request: Request) {
  const me = await getMe();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureMemberColumns();

  const body = await request.json();
  const {
    name, nickname, phone,
    blog_url, threads_url, instagram_url, x_url, brunch_url, youtube_url, homepage_url,
    sms_yn, email_yn,
    current_password, new_password,
  } = body;

  if (!name || !nickname) {
    return NextResponse.json({ error: "이름과 닉네임은 필수입니다." }, { status: 400 });
  }

  // 비밀번호 변경 처리
  let passwordUpdate = "";
  const params: unknown[] = [name.trim(), nickname.trim(), phone?.trim() ?? null,
    blog_url ?? null, threads_url ?? null, instagram_url ?? null, x_url ?? null,
    brunch_url ?? null, youtube_url ?? null, homepage_url ?? null,
    sms_yn ?? "Y", email_yn ?? "Y"];

  if (new_password) {
    if (!current_password) {
      return NextResponse.json({ error: "현재 비밀번호를 입력하세요." }, { status: 400 });
    }
    if (new_password.length < 8) {
      return NextResponse.json({ error: "새 비밀번호는 8자 이상이어야 합니다." }, { status: 400 });
    }
    const { rows } = await pool.query("SELECT password_hash FROM members WHERE id = $1", [me.id]);
    const valid = await bcrypt.compare(current_password, rows[0].password_hash);
    if (!valid) {
      return NextResponse.json({ error: "현재 비밀번호가 올바르지 않습니다." }, { status: 400 });
    }
    const hash = await bcrypt.hash(new_password, 12);
    params.push(hash);
    passwordUpdate = `, password_hash = $${params.length}`;
  }

  params.push(me.id);
  const idIdx = params.length;

  await pool.query(
    `UPDATE members SET
       name=$1, nickname=$2, phone=$3,
       blog_url=$4, threads_url=$5, instagram_url=$6, x_url=$7,
       brunch_url=$8, youtube_url=$9, homepage_url=$10,
       sms_yn=$11, email_yn=$12
       ${passwordUpdate}
     WHERE id=$${idIdx}`,
    params
  );

  return NextResponse.json({ ok: true });
}
