import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifyMemberToken, MEMBER_COOKIE } from "@/lib/member-auth";
import { ensureMemberTables } from "@/lib/ensure-tables";

async function getMe() {
  const token = cookies().get(MEMBER_COOKIE)?.value;
  if (!token) return null;
  return verifyMemberToken(token);
}

export async function GET() {
  const me = await getMe();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureMemberTables();
  const { rows } = await pool.query(
    `SELECT id, subject, message, status, reply, replied_at,
            TO_CHAR(created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI') AS created_at
     FROM member_inquiries
     WHERE member_id = $1
     ORDER BY created_at DESC`,
    [me.id]
  );
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const me = await getMe();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureMemberTables();

  const { subject, message } = await request.json();
  if (!subject || !message) {
    return NextResponse.json({ error: "제목과 내용을 입력하세요." }, { status: 400 });
  }

  const { rows } = await pool.query(
    `INSERT INTO member_inquiries (member_id, subject, message, status, created_at)
     VALUES ($1, $2, $3, 'pending', NOW())
     RETURNING id`,
    [me.id, subject.trim(), message.trim()]
  );
  return NextResponse.json({ ok: true, id: rows[0].id });
}
