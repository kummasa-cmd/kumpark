import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifyMemberToken, MEMBER_COOKIE } from "@/lib/member-auth";
import { ensureCoachingScheduleTable, autoCompleteCoachings } from "@/lib/ensure-tables";
import { sendScheduleAppliedMail } from "@/lib/mailer";

async function getMe() {
  const token = cookies().get(MEMBER_COOKIE)?.value;
  if (!token) return null;
  return verifyMemberToken(token);
}

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

export async function POST(request: Request) {
  const me = await getMe();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureCoachingScheduleTable();
  await autoCompleteCoachings();

  const { coaching_id, session_date, session_time, memo } = await request.json();

  if (!coaching_id || !session_date || !session_time) {
    return NextResponse.json({ error: "코칭, 날짜, 시간을 모두 선택하세요." }, { status: 400 });
  }
  if (!TIME_RE.test(session_time)) {
    return NextResponse.json({ error: "시간 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const { rows: coachingRows } = await pool.query(
    `SELECT id, product_name, status, session_count,
            TO_CHAR(start_date, 'YYYY-MM-DD') AS start_date,
            TO_CHAR(end_date, 'YYYY-MM-DD') AS end_date
     FROM coachings
     WHERE id = $1 AND member_id = $2`,
    [coaching_id, me.id]
  );
  const coaching = coachingRows[0];
  if (!coaching) {
    return NextResponse.json({ error: "존재하지 않는 코칭입니다." }, { status: 404 });
  }
  if (coaching.status !== "in_progress") {
    return NextResponse.json({ error: "코칭중 상태에서만 일정을 신청할 수 있습니다." }, { status: 400 });
  }
  if (session_date < coaching.start_date) {
    return NextResponse.json({ error: "코칭 시작일 이후 날짜만 신청할 수 있습니다." }, { status: 400 });
  }
  if (coaching.end_date && session_date > coaching.end_date) {
    return NextResponse.json({ error: "코칭 기간이 종료되어 신청할 수 없습니다." }, { status: 400 });
  }

  const { rows: countRows } = await pool.query(
    `SELECT COUNT(*)::int AS count FROM coaching_schedules
     WHERE coaching_id = $1 AND status IN ('pending', 'confirmed')`,
    [coaching_id]
  );
  if (countRows[0].count >= coaching.session_count) {
    return NextResponse.json({ error: "신청 가능한 코칭 횟수를 모두 사용했습니다." }, { status: 400 });
  }

  const { rows } = await pool.query(
    `INSERT INTO coaching_schedules (coaching_id, member_id, session_date, session_time, member_memo, status)
     VALUES ($1, $2, $3, $4, $5, 'pending')
     RETURNING id`,
    [coaching_id, me.id, session_date, session_time, memo?.trim() || null]
  );

  sendScheduleAppliedMail({
    memberName: me.name,
    memberEmail: me.email,
    productName: coaching.product_name,
    sessionDate: session_date,
    sessionTime: session_time,
    memo: memo?.trim() || null,
  }).catch((err) => console.error("[mailer] 코칭 일정 신청 메일 발송 실패:", err));

  return NextResponse.json({ ok: true, id: rows[0].id }, { status: 201 });
}
