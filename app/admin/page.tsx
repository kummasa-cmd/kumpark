import type { Metadata } from "next";
import Link from "next/link";
import { Users, ShoppingCart, MessageSquare, TrendingUp, ArrowRight } from "lucide-react";
import pool from "@/lib/db";

export const metadata: Metadata = { title: "대시보드" };
export const dynamic = "force-dynamic";

async function getDashboardData() {
  try {
    const [statsRow, recentMembers, recentConsultations, recentOrders] = await Promise.all([
      // 통계 — 단일 쿼리로 한 번에
      pool.query(`
        SELECT
          (SELECT COUNT(*)::int FROM members)                                               AS total_members,
          (SELECT COUNT(*)::int FROM members
           WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW()))             AS new_members,
          (SELECT COUNT(*)::int FROM orders)                                                AS total_orders,
          (SELECT COUNT(*)::int FROM orders
           WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW()))             AS new_orders,
          (SELECT COUNT(*)::int FROM consultations WHERE status = 'pending')               AS pending_consultations,
          (SELECT COUNT(*)::int FROM consultations)                                         AS total_consultations,
          (SELECT COALESCE(SUM(amount), 0)::bigint FROM orders
           WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())
             AND status IN ('paid', 'completed', 'in_progress'))                           AS revenue_this_month,
          (SELECT COALESCE(SUM(amount), 0)::bigint FROM orders
           WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW() - INTERVAL '1 month')
             AND status IN ('paid', 'completed', 'in_progress'))                           AS revenue_last_month
      `),

      // 최근 가입 회원 5명
      pool.query(`
        SELECT name, email,
               TO_CHAR(created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD') AS created_at
        FROM members
        ORDER BY created_at DESC, id DESC
        LIMIT 5
      `),

      // 최근 상담 문의 5건
      pool.query(`
        SELECT name, subject, status,
               TO_CHAR(created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD') AS created_at
        FROM consultations
        ORDER BY created_at DESC
        LIMIT 5
      `),

      // 최근 주문 5건
      pool.query(`
        SELECT o.order_number, m.name AS member_name, p.name AS product_name,
               o.amount_display, o.status,
               TO_CHAR(o.created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD') AS created_at
        FROM orders o
        JOIN members m ON m.id = o.member_id
        JOIN products p ON p.id = o.product_id
        ORDER BY o.created_at DESC
        LIMIT 5
      `),
    ]);

    const s = statsRow.rows[0];
    const thisMonth = Number(s.revenue_this_month);
    const lastMonth = Number(s.revenue_last_month);

    let revenueGrowth = "";
    if (lastMonth === 0 && thisMonth === 0) {
      revenueGrowth = "매출 없음";
    } else if (lastMonth === 0) {
      revenueGrowth = "전월 대비 신규";
    } else {
      const pct = Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
      revenueGrowth = `전월 대비 ${pct >= 0 ? "+" : ""}${pct}%`;
    }

    return {
      stats: {
        totalMembers: s.total_members,
        newMembers: s.new_members,
        totalOrders: s.total_orders,
        newOrders: s.new_orders,
        pendingConsultations: s.pending_consultations,
        totalConsultations: s.total_consultations,
        revenueThisMonth: thisMonth,
        revenueGrowth,
      },
      recentMembers: recentMembers.rows,
      recentConsultations: recentConsultations.rows,
      recentOrders: recentOrders.rows,
    };
  } catch {
    return null;
  }
}

const ORDER_STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  paid:        { label: "결제완료", cls: "bg-blue-50 text-blue-700" },
  consulting:  { label: "상담중",   cls: "bg-yellow-50 text-yellow-700" },
  in_progress: { label: "진행중",   cls: "bg-purple-50 text-purple-700" },
  completed:   { label: "완료",     cls: "bg-green-50 text-green-700" },
  cancelled:   { label: "취소",     cls: "bg-red-50 text-red-600" },
};

export default async function AdminDashboard() {
  const data = await getDashboardData();

  const formatKRW = (n: number) =>
    n === 0 ? "₩0" : `₩${new Intl.NumberFormat("ko-KR").format(n)}`;

  const statCards = data
    ? [
        {
          label: "총 회원수",
          value: `${data.stats.totalMembers}명`,
          sub: `이달 신규 ${data.stats.newMembers}명`,
          icon: Users,
          color: "text-blue-600",
          bg: "bg-blue-50",
          href: "/admin/members",
        },
        {
          label: "총 주문수",
          value: `${data.stats.totalOrders}건`,
          sub: `이달 신규 ${data.stats.newOrders}건`,
          icon: ShoppingCart,
          color: "text-green-600",
          bg: "bg-green-50",
          href: "/admin/orders",
        },
        {
          label: "미처리 상담",
          value: `${data.stats.pendingConsultations}건`,
          sub: `전체 상담 ${data.stats.totalConsultations}건`,
          icon: MessageSquare,
          color: "text-yellow-600",
          bg: "bg-yellow-50",
          href: "/admin/consultations",
        },
        {
          label: "이달 매출",
          value: formatKRW(data.stats.revenueThisMonth),
          sub: data.stats.revenueGrowth,
          icon: TrendingUp,
          color: "text-purple-600",
          bg: "bg-purple-50",
          href: "/admin/stats/products",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">대시보드</h1>
        <p className="text-sm text-gray-500 mt-0.5">kumpark 관리 현황을 한눈에 확인하세요.</p>
      </div>

      {!data && (
        <div className="bg-yellow-50 text-yellow-700 text-sm px-4 py-3 rounded-lg">
          데이터베이스에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.
        </div>
      )}

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.label}
              href={s.href}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center mb-3`}>
                <Icon size={20} className={s.color} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
            </Link>
          );
        })}
      </div>

      {/* 목록 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* 최근 가입 회원 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 text-sm">최근 가입 회원</h2>
            <Link
              href="/admin/members"
              className="text-xs text-brand-green hover:underline flex items-center gap-1"
            >
              전체보기 <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {data?.recentMembers.length ? (
              data.recentMembers.map((m) => (
                <div key={m.email} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{m.name}</p>
                    <p className="text-xs text-gray-400">{m.email}</p>
                  </div>
                  <p className="text-xs text-gray-400">{m.created_at}</p>
                </div>
              ))
            ) : (
              <p className="px-5 py-6 text-sm text-gray-400 text-center">가입 회원이 없습니다.</p>
            )}
          </div>
        </div>

        {/* 최근 상담 문의 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 text-sm">최근 상담 문의</h2>
            <Link
              href="/admin/consultations"
              className="text-xs text-brand-green hover:underline flex items-center gap-1"
            >
              전체보기 <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {data?.recentConsultations.length ? (
              data.recentConsultations.map((c, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3">
                  <div className="min-w-0 flex-1 mr-3">
                    <p className="text-sm font-medium text-gray-800">{c.name}</p>
                    <p className="text-xs text-gray-400 truncate">{c.subject}</p>
                  </div>
                  <span
                    className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${
                      c.status === "pending"
                        ? "bg-yellow-50 text-yellow-700"
                        : "bg-green-50 text-green-700"
                    }`}
                  >
                    {c.status === "pending" ? "미처리" : "처리완료"}
                  </span>
                </div>
              ))
            ) : (
              <p className="px-5 py-6 text-sm text-gray-400 text-center">상담 문의가 없습니다.</p>
            )}
          </div>
        </div>

        {/* 최근 주문 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 text-sm">최근 주문</h2>
            <Link
              href="/admin/orders"
              className="text-xs text-brand-green hover:underline flex items-center gap-1"
            >
              전체보기 <ArrowRight size={12} />
            </Link>
          </div>
          {data?.recentOrders.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 border-b border-gray-50">
                    <th className="text-left px-5 py-3 font-medium">주문번호</th>
                    <th className="text-left px-5 py-3 font-medium">회원명</th>
                    <th className="text-left px-5 py-3 font-medium hidden md:table-cell">상품</th>
                    <th className="text-left px-5 py-3 font-medium">금액</th>
                    <th className="text-left px-5 py-3 font-medium hidden md:table-cell">상태</th>
                    <th className="text-left px-5 py-3 font-medium hidden md:table-cell">주문일</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.recentOrders.map((o) => {
                    const st = ORDER_STATUS_LABEL[o.status] ?? { label: o.status, cls: "bg-gray-100 text-gray-500" };
                    return (
                      <tr key={o.order_number} className="hover:bg-gray-50">
                        <td className="px-5 py-3 text-xs text-gray-400 font-mono">{o.order_number}</td>
                        <td className="px-5 py-3 font-medium text-gray-800">{o.member_name}</td>
                        <td className="px-5 py-3 text-gray-600 hidden md:table-cell">{o.product_name}</td>
                        <td className="px-5 py-3 font-medium text-brand-green">{o.amount_display}</td>
                        <td className="px-5 py-3 hidden md:table-cell">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${st.cls}`}>
                            {st.label}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-400 text-xs hidden md:table-cell">{o.created_at}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="px-5 py-6 text-sm text-gray-400 text-center">주문 내역이 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}
