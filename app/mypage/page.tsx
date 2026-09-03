import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { MessageSquare, BookOpen, HelpCircle, ArrowRight, Clock, CalendarDays } from "lucide-react";
import pool from "@/lib/db";
import { verifyMemberToken, MEMBER_COOKIE } from "@/lib/member-auth";
import {
  ensureMemberTables,
  ensureCoachingTable,
  ensureMemberColumns,
  ensureCoachingScheduleTable,
  autoCompleteCoachings,
} from "@/lib/ensure-tables";

export const metadata: Metadata = { title: "마이페이지" };
export const dynamic = "force-dynamic";

const BOOK_TYPE_LABEL: Record<string, string> = { paper: "종이책", ebook: "전자책" };
const CATEGORY_LABEL: Record<string, string> = { group: "그룹", individual: "개인" };
const COACHING_STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  pending:     { label: "입금대기", cls: "bg-yellow-50 text-yellow-700" },
  in_progress: { label: "코칭중",   cls: "bg-blue-50 text-blue-700" },
  completed:   { label: "코칭종료", cls: "bg-green-50 text-green-700" },
  refunded:    { label: "환불",     cls: "bg-red-50 text-red-600" },
};

const SCHEDULE_STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  pending:   { label: "확인중", cls: "bg-yellow-50 text-yellow-700" },
  confirmed: { label: "확정",   cls: "bg-green-50 text-green-700" },
  completed: { label: "완료",   cls: "bg-blue-50 text-blue-700" },
  rejected:  { label: "반려",   cls: "bg-red-50 text-red-600" },
};

export default async function MypageDashboard() {
  const token = cookies().get(MEMBER_COOKIE)?.value;
  const member = token ? await verifyMemberToken(token) : null;
  if (!member) return null;

  await ensureMemberTables();
  await ensureCoachingTable();
  await ensureMemberColumns();
  await ensureCoachingScheduleTable();
  await autoCompleteCoachings();

  const [consultationsRes, coachingsRes, boardPostsRes, inquiriesRes, memberRes, upcomingSchedulesRes] = await Promise.all([
    pool.query(
      `SELECT id, subject, status, TO_CHAR(created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD') AS created_at
       FROM consultations WHERE member_id = $1 ORDER BY created_at DESC LIMIT 3`,
      [member.id]
    ),
    pool.query(
      `SELECT id, book_type, category, product_name, status, session_count, completed_count,
              TO_CHAR(created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD') AS created_at
       FROM coachings WHERE member_id = $1 ORDER BY created_at DESC LIMIT 3`,
      [member.id]
    ),
    pool.query(
      `SELECT p.id, p.title,
              CASE WHEN p.admin_reply IS NULL THEN 'pending' ELSE 'answered' END AS status,
              TO_CHAR(p.created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD') AS created_at
       FROM posts p JOIN boards b ON b.id = p.board_id
       WHERE b.slug = 'coaching' AND p.member_id = $1
       ORDER BY p.created_at DESC LIMIT 3`,
      [member.id]
    ),
    pool.query(
      `SELECT id, subject, status, TO_CHAR(created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD') AS created_at
       FROM member_inquiries WHERE member_id = $1 ORDER BY created_at DESC LIMIT 3`,
      [member.id]
    ),
    pool.query(`SELECT coaching_yn FROM members WHERE id = $1`, [member.id]),
    pool.query(
      `SELECT s.id, TO_CHAR(s.session_date, 'YYYY-MM-DD') AS session_date, s.session_time, s.status, c.product_name
       FROM coaching_schedules s
       JOIN coachings c ON c.id = s.coaching_id
       WHERE s.member_id = $1 AND s.session_date >= CURRENT_DATE AND s.status IN ('pending', 'confirmed')
       ORDER BY s.session_date ASC, s.session_time ASC
       LIMIT 3`,
      [member.id]
    ),
  ]);

  const totalCoachings = await pool.query(
    "SELECT COUNT(*)::int AS cnt FROM coachings WHERE member_id = $1",
    [member.id]
  );
  const pendingInquiries = await pool.query(
    "SELECT COUNT(*)::int AS cnt FROM member_inquiries WHERE member_id = $1 AND status = 'pending'",
    [member.id]
  );
  const upcomingSchedulesCount = await pool.query(
    `SELECT COUNT(*)::int AS cnt FROM coaching_schedules
     WHERE member_id = $1 AND session_date >= CURRENT_DATE AND status IN ('pending', 'confirmed')`,
    [member.id]
  );

  const showCoachingBoard = memberRes.rows[0]?.coaching_yn === "Y";

  const stats = [
    {
      label: "코칭 신청",
      value: `${totalCoachings.rows[0].cnt}건`,
      icon: BookOpen,
      href: "/mypage/coachings",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "상담 내역",
      value: `${consultationsRes.rows.length ? consultationsRes.rows.length + "+" : "0"}건`,
      icon: MessageSquare,
      href: "/mypage/consultations",
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "미답변 문의",
      value: `${pendingInquiries.rows[0].cnt}건`,
      icon: HelpCircle,
      href: "/mypage/inquiry",
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      label: "다가오는 코칭 일정",
      value: `${upcomingSchedulesCount.rows[0].cnt}건`,
      icon: CalendarDays,
      href: "/mypage/coaching-schedule",
      color: "text-teal-600",
      bg: "bg-teal-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">안녕하세요, {member.name}님!</h1>
        <p className="text-sm text-gray-500 mt-0.5">검파크 마이페이지에 오신 것을 환영합니다.</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.label}
              href={s.href}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className={`w-9 h-9 ${s.bg} rounded-lg flex items-center justify-center mb-2`}>
                <Icon size={18} className={s.color} />
              </div>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </Link>
          );
        })}
      </div>

      {/* 코칭 목록 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-800 text-sm">코칭 목록</h2>
          <Link href="/mypage/coachings" className="text-xs text-brand-green hover:underline flex items-center gap-1">
            전체보기 <ArrowRight size={12} />
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {coachingsRes.rows.length ? (
            coachingsRes.rows.map((c) => {
              const st = COACHING_STATUS_LABEL[c.status] ?? { label: c.status, cls: "bg-gray-100 text-gray-500" };
              return (
                <Link
                  key={c.id}
                  href={`/mypage/coachings/${c.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-0 flex-1 mr-3">
                    <p className="text-sm font-medium text-gray-800 truncate">{c.product_name}</p>
                    <p className="text-xs text-gray-400">
                      {BOOK_TYPE_LABEL[c.book_type] ?? c.book_type} · {CATEGORY_LABEL[c.category] ?? c.category} · {c.created_at}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <p className="text-xs text-gray-400">{c.completed_count}/{c.session_count}회</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
                  </div>
                </Link>
              );
            })
          ) : (
            <p className="px-5 py-6 text-sm text-gray-400 text-center">코칭 신청 내역이 없습니다.</p>
          )}
        </div>
      </div>

      {/* 다가오는 코칭 일정 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-800 text-sm">다가오는 코칭 일정</h2>
          <Link href="/mypage/coaching-schedule" className="text-xs text-brand-green hover:underline flex items-center gap-1">
            전체보기 <ArrowRight size={12} />
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {upcomingSchedulesRes.rows.length ? (
            upcomingSchedulesRes.rows.map((s) => {
              const st = SCHEDULE_STATUS_LABEL[s.status] ?? { label: s.status, cls: "bg-gray-100 text-gray-500" };
              return (
                <div key={s.id} className="flex items-center justify-between px-5 py-3">
                  <div className="min-w-0 flex-1 mr-3">
                    <p className="text-sm font-medium text-gray-800 truncate">{s.product_name}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={10} /> {s.session_date} {s.session_time}
                    </p>
                  </div>
                  <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
                </div>
              );
            })
          ) : (
            <p className="px-5 py-6 text-sm text-gray-400 text-center">예정된 코칭 일정이 없습니다.</p>
          )}
        </div>
      </div>

      {/* 코칭 게시판 */}
      {showCoachingBoard && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-800 text-sm">코칭 게시판</h2>
            <Link href="/mypage/coaching" className="text-xs text-brand-green hover:underline flex items-center gap-1">
              전체보기 <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {boardPostsRes.rows.length ? (
              boardPostsRes.rows.map((p) => (
                <Link
                  key={p.id}
                  href={`/mypage/coaching/${p.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-0 flex-1 mr-3">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.title}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={10} /> {p.created_at}
                    </p>
                  </div>
                  <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${
                    p.status === "pending" ? "bg-yellow-50 text-yellow-700" : "bg-green-50 text-green-700"
                  }`}>
                    {p.status === "pending" ? "답변대기" : "답변완료"}
                  </span>
                </Link>
              ))
            ) : (
              <p className="px-5 py-6 text-sm text-gray-400 text-center">작성한 글이 없습니다.</p>
            )}
          </div>
        </div>
      )}

      {/* 최근 1대1 문의 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-800 text-sm">최근 1대1 문의</h2>
          <Link href="/mypage/inquiry" className="text-xs text-brand-green hover:underline flex items-center gap-1">
            전체보기 <ArrowRight size={12} />
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {inquiriesRes.rows.length ? (
            inquiriesRes.rows.map((q) => (
              <div key={q.id} className="flex items-center justify-between px-5 py-3">
                <div className="min-w-0 flex-1 mr-3">
                  <p className="text-sm font-medium text-gray-800 truncate">{q.subject}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock size={10} /> {q.created_at}
                  </p>
                </div>
                <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${
                  q.status === "pending" ? "bg-yellow-50 text-yellow-700" : "bg-green-50 text-green-700"
                }`}>
                  {q.status === "pending" ? "답변대기" : "답변완료"}
                </span>
              </div>
            ))
          ) : (
            <p className="px-5 py-6 text-sm text-gray-400 text-center">문의 내역이 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}
