import type { Metadata } from "next";
import pool from "@/lib/db";
import { ensureCoachingScheduleTable, autoCompleteCoachings } from "@/lib/ensure-tables";
import AdminCoachingScheduleCalendar from "@/components/admin/AdminCoachingScheduleCalendar";

export const metadata: Metadata = { title: "코칭일정" };
export const dynamic = "force-dynamic";

export default async function AdminCoachingSchedulePage() {
  await ensureCoachingScheduleTable();
  await autoCompleteCoachings();

  const { rows } = await pool.query(
    `SELECT s.id, s.coaching_id, TO_CHAR(s.session_date, 'YYYY-MM-DD') AS session_date,
            s.session_time, s.status, s.member_memo, s.admin_memo,
            TO_CHAR(s.created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI') AS created_at,
            m.name AS member_name, m.nickname AS member_nickname,
            c.product_name, c.book_type, c.category
     FROM coaching_schedules s
     JOIN members m ON m.id = s.member_id
     JOIN coachings c ON c.id = s.coaching_id
     ORDER BY s.session_date ASC, s.session_time ASC`
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">코칭일정</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          회원의 코칭 일정 신청 내역을 확인하고 확정/반려 처리하세요.
        </p>
      </div>
      <AdminCoachingScheduleCalendar schedules={rows} />
    </div>
  );
}
