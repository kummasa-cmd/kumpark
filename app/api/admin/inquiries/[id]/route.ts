import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/auth";

async function getAdmin() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { reply } = await request.json();
  if (!reply) return NextResponse.json({ error: "답변 내용을 입력하세요." }, { status: 400 });

  await pool.query(
    `UPDATE member_inquiries
     SET reply = $1, status = 'answered', replied_at = NOW(), updated_at = NOW()
     WHERE id = $2`,
    [reply.trim(), params.id]
  );
  return NextResponse.json({ ok: true });
}
