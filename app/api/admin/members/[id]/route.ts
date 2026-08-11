import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { ensureMemberColumns } from "@/lib/ensure-tables";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await ensureMemberColumns();
  const { rows } = await pool.query(
    `SELECT id, name, nickname, email, phone, status, memo,
            blog_url, threads_url, instagram_url, x_url, brunch_url, youtube_url, homepage_url,
            sms_yn, email_yn
     FROM members WHERE id = $1`,
    [params.id]
  );
  if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const {
    name, nickname, email, phone, password, status, memo,
    blog_url, threads_url, instagram_url, x_url, brunch_url, youtube_url, homepage_url,
    sms_yn, email_yn,
  } = await req.json();

  if (!name || !nickname || !email) {
    return NextResponse.json({ error: "이름, 닉네임, 이메일은 필수입니다." }, { status: 400 });
  }

  try {
    if (password) {
      if (password.length < 8) {
        return NextResponse.json({ error: "비밀번호는 8자 이상이어야 합니다." }, { status: 400 });
      }
      const password_hash = await bcrypt.hash(password, 10);
      await pool.query(
        `UPDATE members
         SET name=$1, nickname=$2, email=$3, phone=$4, password_hash=$5, status=$6, memo=$7,
             blog_url=$8, threads_url=$9, instagram_url=$10, x_url=$11,
             brunch_url=$12, youtube_url=$13, homepage_url=$14, sms_yn=$15, email_yn=$16
         WHERE id=$17`,
        [
          name, nickname, email, phone ?? null, password_hash,
          status ?? "active", memo ?? null,
          blog_url ?? null, threads_url ?? null, instagram_url ?? null,
          x_url ?? null, brunch_url ?? null, youtube_url ?? null, homepage_url ?? null,
          sms_yn ?? "Y", email_yn ?? "Y",
          params.id,
        ]
      );
    } else {
      await pool.query(
        `UPDATE members
         SET name=$1, nickname=$2, email=$3, phone=$4, status=$5, memo=$6,
             blog_url=$7, threads_url=$8, instagram_url=$9, x_url=$10,
             brunch_url=$11, youtube_url=$12, homepage_url=$13, sms_yn=$14, email_yn=$15
         WHERE id=$16`,
        [
          name, nickname, email, phone ?? null,
          status ?? "active", memo ?? null,
          blog_url ?? null, threads_url ?? null, instagram_url ?? null,
          x_url ?? null, brunch_url ?? null, youtube_url ?? null, homepage_url ?? null,
          sms_yn ?? "Y", email_yn ?? "Y",
          params.id,
        ]
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
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { rowCount } = await pool.query(`DELETE FROM members WHERE id = $1`, [params.id]);
    if (rowCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    if ((e as { code?: string }).code === "23503") {
      return NextResponse.json(
        { error: "이 회원에게 연결된 주문 또는 코칭 신청이 있어 삭제할 수 없습니다." },
        { status: 409 }
      );
    }
    throw e;
  }
}
