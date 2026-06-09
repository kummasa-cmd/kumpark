import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "상품판매현황" };

const monthly = [
  { month: "2026.01", sales: 1, revenue: 150000 },
  { month: "2026.02", sales: 2, revenue: 300000 },
  { month: "2026.03", sales: 3, revenue: 450000 },
  { month: "2026.04", sales: 2, revenue: 300000 },
  { month: "2026.05", sales: 3, revenue: 450000 },
  { month: "2026.06", sales: 4, revenue: 1350000 },
];

const products = [
  { name: "전자책 그룹 코칭", orders: 12, revenue: "₩1,800,000" },
  { name: "전자책 개인 코칭", orders: 4, revenue: "상담 후 안내" },
  { name: "종이책 1대1 코칭", orders: 2, revenue: "상담 후 안내" },
];

const maxSales = Math.max(...monthly.map((m) => m.sales));

const statLinks = [
  { label: "회원가입현황", href: "/admin/stats/members", active: false },
  { label: "상품판매현황", href: "/admin/stats/products", active: true },
  { label: "상담현황", href: "/admin/stats/consultations", active: false },
];

export default function StatsProductsPage() {
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
          { label: "총 주문수", value: "18건" },
          { label: "이달 주문", value: "4건" },
          { label: "이달 매출", value: "₩1,350,000" },
          { label: "전월 대비", value: "+200%" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Monthly bar chart */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-800 mb-6">월별 판매 현황</h2>
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
          <h2 className="text-sm font-semibold text-gray-800">상품별 판매 현황</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-500 border-b border-gray-100">
              <th className="text-left px-5 py-3 font-medium">상품명</th>
              <th className="text-left px-5 py-3 font-medium">주문수</th>
              <th className="text-left px-5 py-3 font-medium">매출</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map((p) => (
              <tr key={p.name} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-800">{p.name}</td>
                <td className="px-5 py-3 text-brand-green font-medium">{p.orders}건</td>
                <td className="px-5 py-3 text-gray-600">{p.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
