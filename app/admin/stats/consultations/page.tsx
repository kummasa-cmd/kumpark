import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "상담현황" };

const monthly = [
  { month: "2026.01", total: 1, resolved: 1 },
  { month: "2026.02", total: 2, resolved: 2 },
  { month: "2026.03", total: 3, resolved: 3 },
  { month: "2026.04", total: 1, resolved: 1 },
  { month: "2026.05", total: 3, resolved: 3 },
  { month: "2026.06", total: 2, resolved: 0 },
];

const subjects = [
  { subject: "전자책 그룹 코칭 문의", count: 5 },
  { subject: "전자책 개인 코칭 문의", count: 3 },
  { subject: "종이책 코칭 문의", count: 2 },
  { subject: "기타 문의", count: 2 },
];

const maxTotal = Math.max(...monthly.map((m) => m.total));

const statLinks = [
  { label: "회원가입현황", href: "/admin/stats/members", active: false },
  { label: "상품판매현황", href: "/admin/stats/products", active: false },
  { label: "상담현황", href: "/admin/stats/consultations", active: true },
];

export default function StatsConsultationsPage() {
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
          { label: "총 상담수", value: "12건" },
          { label: "이달 상담", value: "2건" },
          { label: "미처리", value: "2건" },
          { label: "처리율", value: "83%" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
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
              <div className="w-full flex flex-col justify-end rounded-t-md overflow-hidden" style={{ height: `${(m.total / maxTotal) * 100}px` }}>
                <div className="w-full bg-yellow-400" style={{ height: `${(m.resolved / m.total) * 100}%` }} />
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
        <div className="space-y-3">
          {subjects.map((s) => {
            const total = subjects.reduce((acc, x) => acc + x.count, 0);
            const pct = Math.round((s.count / total) * 100);
            return (
              <div key={s.subject}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{s.subject}</span>
                  <span className="text-gray-500 font-medium">{s.count}건 ({pct}%)</span>
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
      </div>
    </div>
  );
}
