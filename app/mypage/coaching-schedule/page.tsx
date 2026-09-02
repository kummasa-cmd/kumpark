import type { Metadata } from "next";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifyMemberToken, MEMBER_COOKIE } from "@/lib/member-auth";
import { ensureCoachingTable, ensureCoachingScheduleTable, autoCompleteCoachings } from "@/lib/ensure-tables";
import CoachingScheduleCalendar from "@/components/mypage/CoachingScheduleCalendar";

export const metadata: Metadata = { title: "코칭 일정" };
export const dynamic = "force-dynamic";

export default async function MyCoachingSchedulePage() {
  const token = cookies().get(MEMBER_COOKIE)?.value;
  const member = token ? await verifyMemberToken(token) : null;
  if (!member) return null;

  await ensureCoachingTable();
  await ensureCoachingScheduleTable();
  await autoCompleteCoachings();

  const { rows: coachings } = await pool.query(
    `SELECT id, product_name, book_type, category, session_count,
            TO_CHAR(start_date, 'YYYY-MM-DD') AS start_date,
            TO_CHAR(end_date, 'YYYY-MM-DD') AS end_date,
            (SELECT COUNT(*)::int FROM coaching_schedules s
              WHERE s.coaching_id = c.id AND s.status IN ('pending', 'confirmed', 'completed')) AS used_count
     FROM coachings c
     WHERE member_id = $1 AND status = 'in_progress'
     ORDER BY start_date ASC`,
    [member.id]
  );

  const { rows: schedules } = await pool.query(
    `SELECT s.id, s.coaching_id, c.product_name,
            TO_CHAR(s.session_date, 'YYYY-MM-DD') AS session_date,
            s.session_time, s.status, s.member_memo, s.admin_memo,
            TO_CHAR(s.created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD') AS created_at
     FROM coaching_schedules s
     JOIN coachings c ON c.id = s.coaching_id
     WHERE s.member_id = $1
     ORDER BY s.session_date ASC, s.session_time ASC`,
    [member.id]
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">코칭 일정</h1>
        <p className="text-sm text-gray-500 mt-0.5">달력에서 날짜를 선택해 코칭 일정을 신청하세요.</p>
      </div>
      <CoachingScheduleCalendar coachings={coachings} schedules={schedules} />
    </div>
  );
}
