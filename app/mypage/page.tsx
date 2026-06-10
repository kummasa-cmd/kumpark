import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { MessageSquare, ShoppingBag, HelpCircle, ArrowRight, Clock } from "lucide-react";
import pool from "@/lib/db";
import { verifyMemberToken, MEMBER_COOKIE } from "@/lib/member-auth";
import { ensureMemberTables } from "@/lib/ensure-tables";

export const metadata: Metadata = { title: "마이페이지" };
export const dynamic = "force-dynamic";

export default async function MypageDashboard() {
  const token = cookies().get(MEMBER_COOKIE)?.value;
  const member = token ? await verifyMemberToken(token) : null;
  if (!member) return null;

  await ensureMemberTables();

  const [consultationsRes, ordersRes, inquiriesRes] = await Promise.all([
    pool.query(
      `SELECT id, subject, status, TO_CHAR(created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD') AS created_at
       FROM consultations WHERE member_id = $1 ORDER BY created_at DESC LIMIT 3`,
      [member.id]
    ),
    pool.query(
      `SELECT o.id, o.order_number, p.name AS product_name, o.amount_display, o.status,
              TO_CHAR(o.created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD') AS created_at
       FROM orders o JOIN products p ON p.id = o.product_id
       WHERE o.member_id = $1 ORDER BY o.created_at DESC LIMIT 3`,
      [member.id]
    ),
    pool.query(
      `SELECT id, subject, status, TO_CHAR(created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD') AS created_at
       FROM member_inquiries WHERE member_id = $1 ORDER BY created_at DESC LIMIT 3`,
      [member.id]
    ),
  ]);

  const totalOrders = await pool.query(
    "SELECT COUNT(*)::int AS cnt FROM orders WHERE member_id = $1",
    [member.id]
  );
  const pendingInquiries = await pool.query(
    "SELECT COUNT(*)::int AS cnt FROM member_inquiries WHERE member_id = $1 AND status = 'pending'",
    [member.id]
  );

  const stats = [
    {
      label: "전체 주문",
      value: `${totalOrders.rows[0].cnt}건`,
      icon: ShoppingBag,
      href: "/mypage/orders",
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
  ];

  const ORDER_STATUS: Record<string, { label: string; cls: string }> = {
    paid:        { label: "결제완료", cls: "bg-blue-50 text-blue-700" },
    consulting:  { label: "상담중",   cls: "bg-yellow-50 text-yellow-700" },
    in_progress: { label: "진행중",   cls: "bg-purple-50 text-purple-700" },
    completed:   { label: "완료",     cls: "bg-green-50 text-green-700" },
    cancelled:   { label: "취소",     cls: "bg-red-50 text-red-600" },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">안녕하세요, {member.name}님!</h1>
        <p className="text-sm text-gray-500 mt-0.5">검파크 마이페이지에 오신 것을 환영합니다.</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-3 gap-3">
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

      {/* 최근 주문 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-800 text-sm">최근 주문</h2>
          <Link href="/mypage/orders" className="text-xs text-brand-green hover:underline flex items-center gap-1">
            전체보기 <ArrowRight size={12} />
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {ordersRes.rows.length ? (
            ordersRes.rows.map((o) => {
              const st = ORDER_STATUS[o.status] ?? { label: o.status, cls: "bg-gray-100 text-gray-500" };
              return (
                <div key={o.id} className="flex items-center justify-between px-5 py-3">
                  <div className="min-w-0 flex-1 mr-3">
                    <p className="text-sm font-medium text-gray-800 truncate">{o.product_name}</p>
                    <p className="text-xs text-gray-400">{o.created_at}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <p className="text-sm font-semibold text-brand-green">{o.amount_display}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="px-5 py-6 text-sm text-gray-400 text-center">주문 내역이 없습니다.</p>
          )}
        </div>
      </div>

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
