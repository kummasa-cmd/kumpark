import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/auth";
import { ensureCoachingScheduleTable } from "@/lib/ensure-tables";
import { sendScheduleDecisionMail } from "@/lib/mailer";

async function getAdmin() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

const STATUSES = ["confirmed", "rejected", "completed"];

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureCoachingScheduleTable();

  const { status, memo } = await request.json();
  if (!STATUSES.includes(status)) {
    return NextResponse.json({ error: "상태가 올바르지 않습니다." }, { status: 400 });
  }

  const { rows } = await pool.query(
    `SELECT s.id, s.coaching_id, s.status AS old_status,
            TO_CHAR(s.session_date, 'YYYY-MM-DD') AS session_date, s.session_time,
            m.id AS member_id, m.name AS member_name, m.email AS member_email,
            c.product_name
     FROM coaching_schedules s
     JOIN members m ON m.id = s.member_id
     JOIN coachings c ON c.id = s.coaching_id
     WHERE s.id = $1`,
    [params.id]
  );
  const schedule = rows[0];
  if (!schedule) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await pool.query(
    `UPDATE coaching_schedules
     SET status = $1, admin_memo = $2, decided_at = NOW(), updated_at = NOW()
     WHERE id = $3`,
    [status, memo?.trim() || null, params.id]
  );

  if (status === "completed" && schedule.old_status !== "completed") {
    await pool.query(
      `UPDATE coachings SET completed_count = completed_count + 1, updated_at = NOW() WHERE id = $1`,
      [schedule.coaching_id]
    );
  }

  if (status === "confirmed" || status === "rejected") {
    sendScheduleDecisionMail(status, {
      memberName: schedule.member_name,
      memberEmail: schedule.member_email,
      productName: schedule.product_name,
      sessionDate: schedule.session_date,
      sessionTime: schedule.session_time,
      memo: memo?.trim() || null,
    }).catch((err) => console.error("[mailer] 코칭 일정 처리 메일 발송 실패:", err));
  }

  return NextResponse.json({ ok: true });
}
