import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { ensureCoachingScheduleTable, autoCompleteCoachings } from "@/lib/ensure-tables";
import { sendScheduleReminderMail } from "@/lib/mailer";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureCoachingScheduleTable();
  await autoCompleteCoachings();

  const { rows } = await pool.query(
    `SELECT s.id, TO_CHAR(s.session_date, 'YYYY-MM-DD') AS session_date, s.session_time,
            m.name AS member_name, m.email AS member_email, c.product_name
     FROM coaching_schedules s
     JOIN members m ON m.id = s.member_id
     JOIN coachings c ON c.id = s.coaching_id
     WHERE s.status = 'confirmed'
       AND s.reminder_sent_at IS NULL
       AND s.session_date = (NOW() AT TIME ZONE 'Asia/Seoul')::date + 1`
  );

  let sent = 0;
  for (const row of rows) {
    try {
      await sendScheduleReminderMail({
        memberName: row.member_name,
        memberEmail: row.member_email,
        productName: row.product_name,
        sessionDate: row.session_date,
        sessionTime: row.session_time,
      });
      await pool.query(
        `UPDATE coaching_schedules SET reminder_sent_at = NOW() WHERE id = $1`,
        [row.id]
      );
      sent++;
    } catch (err) {
      console.error("[cron] 코칭 리마인드 메일 발송 실패:", row.id, err);
    }
  }

  return NextResponse.json({ ok: true, remindersSent: sent });
}
