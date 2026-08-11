import type { Metadata } from "next";
import Link from "next/link";
import pool from "@/lib/db";
import { ensureCoachingTable } from "@/lib/ensure-tables";

export const metadata: Metadata = { title: "코칭매출현황" };
export const dynamic = "force-dynamic";

const statLinks = [
  { label: "회원가입현황", href: "/admin/stats/members", active: false },
  { label: "상품판매현황", href: "/admin/stats/products", active: true },
  { label: "상담현황", href: "/admin/stats/consultations", active: false },
];

const formatKRW = (n: number) => `₩${new Intl.NumberFormat("ko-KR").format(n)}`;

export default async function StatsProductsPage() {
  await ensureCoachingTable();

  const [summaryRes, monthlyRes, productRes] = await Promise.all([
    pool.query(`
      SELECT
        (SELECT COUNT(*)::int FROM coachings)                                               AS total_coachings,
        (SELECT COUNT(*)::int FROM coachings
         WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW()))                AS month_coachings,
        (SELECT COALESCE(SUM(amount), 0)::bigint FROM coachings
         WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())
           AND status IN ('in_progress', 'completed'))                                      AS revenue_this_month,
        (SELECT COALESCE(SUM(amount), 0)::bigint FROM coachings
         WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW() - INTERVAL '1 month')
           AND status IN ('in_progress', 'completed'))                                      AS revenue_last_month
    `),
    pool.query(`
      SELECT TO_CHAR(gs, 'YYYY.MM') AS month,
             COUNT(c.id)::int AS sales,
             COALESCE(SUM(c.amount) FILTER (WHERE c.status IN ('in_progress', 'completed')), 0)::bigint AS revenue
      FROM generate_series(
        DATE_TRUNC('month', NOW()) - INTERVAL '5 months',
        DATE_TRUNC('month', NOW()),
        INTERVAL '1 month'
      ) AS gs
      LEFT JOIN coachings c ON DATE_TRUNC('month', c.created_at) = gs
      GROUP BY gs
      ORDER BY gs
    `),
    pool.query(`
      SELECT product_name,
             COUNT(*)::int AS coachings,
             COALESCE(SUM(amount) FILTER (WHERE status IN ('in_progress', 'completed')), 0)::bigint AS revenue
      FROM coachings
      GROUP BY product_name
      ORDER BY coachings DESC, revenue DESC
    `),
  ]);

  const s = summaryRes.rows[0];
  const thisMonth = Number(s.revenue_this_month);
  const lastMonth = Number(s.revenue_last_month);

  let growthLabel = "매출 없음";
  if (lastMonth === 0 && thisMonth === 0) {
    growthLabel = "매출 없음";
  } else if (lastMonth === 0) {
    growthLabel = "전월 대비 신규";
  } else {
    const pct = Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
    growthLabel = `${pct >= 0 ? "+" : ""}${pct}%`;
  }

  const monthly = monthlyRes.rows.map((m) => ({
    month: m.month as string,
    sales: m.sales as number,
    revenue: Number(m.revenue),
  }));
  const products = productRes.rows.map((p) => ({
    name: p.product_name as string,
    coachings: p.coachings as number,
    revenue: Number(p.revenue),
  }));

  const maxSales = Math.max(1, ...monthly.map((m) => m.sales));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">통계</h1>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {statLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`text-sm px-4 py-1.5 rounded-md font-medium transition-colors ${
              l.active
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "총 코칭수", value: `${s.total_coachings}건` },
          { label: "이달 코칭", value: `${s.month_coachings}건` },
          { label: "이달 매출", value: formatKRW(thisMonth) },
          { label: "전월 대비", value: growthLabel },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-2xl font-bold text-gray-900">{c.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Monthly bar chart */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-800 mb-6">월별 코칭 현황</h2>
        <div className="flex items-end gap-4 h-40">
          {monthly.map((m) => (
            <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs font-semibold text-gray-700">{m.sales}</span>
              <div
                className="w-full bg-purple-500 rounded-t-md transition-all"
                style={{ height: `${(m.sales / maxSales) * 100}px` }}
              />
              <span className="text-xs text-gray-400 whitespace-nowrap">{m.month.slice(5)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Product breakdown */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h2 className="text-sm font-semibold text-gray-800">상품별 코칭 현황</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-500 border-b border-gray-100">
              <th className="text-left px-5 py-3 font-medium">상품명</th>
              <th className="text-left px-5 py-3 font-medium">코칭수</th>
              <th className="text-left px-5 py-3 font-medium">매출</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map((p) => (
              <tr key={p.name} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-800">{p.name}</td>
                <td className="px-5 py-3 text-brand-green font-medium">{p.coachings}건</td>
                <td className="px-5 py-3 text-gray-600">{formatKRW(p.revenue)}</td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center text-sm text-gray-400">
                  등록된 코칭 신청이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
