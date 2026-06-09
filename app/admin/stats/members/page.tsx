import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "회원가입현황" };

const monthly = [
  { month: "2026.01", count: 2, cumulative: 14 },
  { month: "2026.02", count: 1, cumulative: 15 },
  { month: "2026.03", count: 3, cumulative: 18 },
  { month: "2026.04", count: 2, cumulative: 20 },
  { month: "2026.05", count: 1, cumulative: 21 },
  { month: "2026.06", count: 3, cumulative: 24 },
];

const maxCount = Math.max(...monthly.map((m) => m.count));

const statLinks = [
  { label: "회원가입현황", href: "/admin/stats/members", active: true },
  { label: "상품판매현황", href: "/admin/stats/products", active: false },
  { label: "상담현황", href: "/admin/stats/consultations", active: false },
];

export default function StatsMembersPage() {
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
          { label: "총 회원수", value: "24명" },
          { label: "이달 신규", value: "3명" },
          { label: "전월 대비", value: "+200%" },
          { label: "이탈 회원", value: "0명" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Monthly bar chart */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-800 mb-6">월별 회원가입 현황</h2>
        <div className="flex items-end gap-4 h-40">
          {monthly.map((m) => (
            <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs font-semibold text-gray-700">{m.count}</span>
              <div
                className="w-full bg-brand-green rounded-t-md transition-all"
                style={{ height: `${(m.count / maxCount) * 100}px` }}
              />
              <span className="text-xs text-gray-400 whitespace-nowrap">{m.month.slice(5)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h2 className="text-sm font-semibold text-gray-800">월별 상세</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-500 border-b border-gray-100">
              <th className="text-left px-5 py-3 font-medium">월</th>
              <th className="text-left px-5 py-3 font-medium">신규 가입</th>
              <th className="text-left px-5 py-3 font-medium">누적 회원수</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {[...monthly].reverse().map((m) => (
              <tr key={m.month} className="hover:bg-gray-50">
                <td className="px-5 py-3 text-gray-600">{m.month}</td>
                <td className="px-5 py-3 font-medium text-brand-green">{m.count}명</td>
                <td className="px-5 py-3 text-gray-600">{m.cumulative}명</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
