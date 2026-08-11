import type { Metadata } from "next";
import Link from "next/link";
import pool from "@/lib/db";

export const metadata: Metadata = { title: "상담현황" };
export const dynamic = "force-dynamic";

const statLinks = [
  { label: "회원가입현황", href: "/admin/stats/members", active: false },
  { label: "상품판매현황", href: "/admin/stats/products", active: false },
  { label: "상담현황", href: "/admin/stats/consultations", active: true },
];

export default async function StatsConsultationsPage() {
  const [summaryRes, monthlyRes, subjectRes] = await Promise.all([
    pool.query(`
      SELECT
        (SELECT COUNT(*)::int FROM consultations)                                           AS total,
        (SELECT COUNT(*)::int FROM consultations
         WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW()))                AS month_total,
        (SELECT COUNT(*)::int FROM consultations WHERE status = 'pending')                  AS pending,
        (SELECT COUNT(*)::int FROM consultations WHERE status = 'resolved')                 AS resolved
    `),
    pool.query(`
      SELECT TO_CHAR(gs, 'YYYY.MM') AS month,
             COUNT(c.id)::int AS total,
             COUNT(c.id) FILTER (WHERE c.status = 'resolved')::int AS resolved
      FROM generate_series(
        DATE_TRUNC('month', NOW()) - INTERVAL '5 months',
        DATE_TRUNC('month', NOW()),
        INTERVAL '1 month'
      ) AS gs
      LEFT JOIN consultations c ON DATE_TRUNC('month', c.created_at) = gs
      GROUP BY gs
      ORDER BY gs
    `),
    pool.query(`
      SELECT subject, COUNT(*)::int AS count
      FROM consultations
      GROUP BY subject
      ORDER BY count DESC, subject ASC
    `),
  ]);

  const s = summaryRes.rows[0];
  const total = s.total as number;
  const resolved = s.resolved as number;
  const resolveRate = total === 0 ? 0 : Math.round((resolved / total) * 100);

  const monthly = monthlyRes.rows.map((m) => ({
    month: m.month as string,
    total: m.total as number,
    resolved: m.resolved as number,
  }));
  const maxTotal = Math.max(1, ...monthly.map((m) => m.total));

  const rawSubjects = subjectRes.rows.map((r) => ({ subject: r.subject as string, count: r.count as number }));
  const subjects =
    rawSubjects.length > 7
      ? [
          ...rawSubjects.slice(0, 7),
          { subject: "기타", count: rawSubjects.slice(7).reduce((acc, x) => acc + x.count, 0) },
        ]
      : rawSubjects;
  const subjectTotal = subjects.reduce((acc, x) => acc + x.count, 0);

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
          { label: "총 상담수", value: `${total}건` },
          { label: "이달 상담", value: `${s.month_total}건` },
          { label: "미처리", value: `${s.pending}건` },
          { label: "처리율", value: `${resolveRate}%` },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-2xl font-bold text-gray-900">{c.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Monthly bar chart */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-800 mb-6">월별 상담 현황</h2>
        <div className="flex items-end gap-4 h-40">
          {monthly.map((m) => (
            <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs font-semibold text-gray-700">{m.total}</span>
              <div
                className="w-full flex flex-col justify-end rounded-t-md overflow-hidden"
                style={{ height: `${(m.total / maxTotal) * 100}px` }}
              >
                <div
                  className="w-full bg-yellow-400"
                  style={{ height: m.total > 0 ? `${(m.resolved / m.total) * 100}%` : "0%" }}
                />
                <div className="w-full bg-yellow-200 flex-1" />
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap">{m.month.slice(5)}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-yellow-400 inline-block" /> 처리완료</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-yellow-200 inline-block" /> 미처리</span>
        </div>
      </div>

      {/* Subject breakdown */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">문의 유형별 현황</h2>
        {subjects.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">상담 문의가 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {subjects.map((s2) => {
              const pct = subjectTotal === 0 ? 0 : Math.round((s2.count / subjectTotal) * 100);
              return (
                <div key={s2.subject}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 truncate mr-3">{s2.subject}</span>
                    <span className="text-gray-500 font-medium shrink-0">{s2.count}건 ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
