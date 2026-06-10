import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/auth";
import { ensureMemberTables } from "@/lib/ensure-tables";

async function getAdmin() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export async function GET() {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureMemberTables();
  const { rows } = await pool.query(`
    SELECT i.id, i.subject, i.message, i.status, i.reply,
           m.name AS member_name, m.email AS member_email,
           TO_CHAR(i.created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI') AS created_at,
           TO_CHAR(i.replied_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI') AS replied_at
    FROM member_inquiries i
    JOIN members m ON m.id = i.member_id
    ORDER BY i.created_at DESC
  `);
  return NextResponse.json(rows);
}
