import type { Metadata } from "next";
import Link from "next/link";
import { Users, ShoppingCart, MessageSquare, TrendingUp, ArrowRight } from "lucide-react";

export const metadata: Metadata = { title: "대시보드" };

const stats = [
  {
    label: "총 회원수",
    value: "24명",
    sub: "이달 신규 3명",
    icon: Users,
    color: "text-blue-600",
    bg: "bg-blue-50",
    href: "/admin/members",
  },
  {
    label: "총 주문수",
    value: "18건",
    sub: "이달 신규 4건",
    icon: ShoppingCart,
    color: "text-green-600",
    bg: "bg-green-50",
    href: "/admin/orders",
  },
  {
    label: "미처리 상담",
    value: "2건",
    sub: "전체 상담 12건",
    icon: MessageSquare,
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    href: "/admin/consultations",
  },
  {
    label: "이달 매출",
    value: "₩1,350,000",
    sub: "전월 대비 +12%",
    icon: TrendingUp,
    color: "text-purple-600",
    bg: "bg-purple-50",
    href: "/admin/stats/products",
  },
];

const recentMembers = [
  { name: "김철수", email: "kim@example.com", date: "2026-06-08" },
  { name: "이영희", email: "lee@example.com", date: "2026-06-07" },
  { name: "박민준", email: "park@example.com", date: "2026-06-05" },
];

const recentConsultations = [
  { name: "정수연", subject: "전자책 그룹 코칭 문의", date: "2026-06-08", status: "미처리" },
  { name: "최동욱", subject: "종이책 코칭 문의", date: "2026-06-07", status: "미처리" },
  { name: "강지민", subject: "개인 코칭 일정 문의", date: "2026-06-06", status: "처리완료" },
];

const recentOrders = [
  { id: "ORD-018", name: "김철수", product: "전자책 그룹 코칭", amount: "₩150,000", date: "2026-06-08" },
  { id: "ORD-017", name: "이영희", product: "전자책 개인 코칭", amount: "상담 후 안내", date: "2026-06-06" },
  { id: "ORD-016", name: "오준혁", product: "종이책 1대1 코칭", amount: "상담 후 안내", date: "2026-06-03" },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">대시보드</h1>
        <p className="text-sm text-gray-500 mt-0.5">kumpark 관리 현황을 한눈에 확인하세요.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
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

      {/* Tables */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent members */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 text-sm">최근 가입 회원</h2>
            <Link href="/admin/members" className="text-xs text-brand-green hover:underline flex items-center gap-1">
              전체보기 <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentMembers.map((m) => (
              <div key={m.email} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">{m.name}</p>
                  <p className="text-xs text-gray-400">{m.email}</p>
                </div>
                <p className="text-xs text-gray-400">{m.date}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent consultations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 text-sm">최근 상담 문의</h2>
            <Link href="/admin/consultations" className="text-xs text-brand-green hover:underline flex items-center gap-1">
              전체보기 <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentConsultations.map((c, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">{c.name}</p>
                  <p className="text-xs text-gray-400">{c.subject}</p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    c.status === "미처리"
                      ? "bg-yellow-50 text-yellow-700"
                      : "bg-green-50 text-green-700"
                  }`}
                >
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 text-sm">최근 주문</h2>
            <Link href="/admin/orders" className="text-xs text-brand-green hover:underline flex items-center gap-1">
              전체보기 <ArrowRight size={12} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-50">
                  <th className="text-left px-5 py-3 font-medium">주문번호</th>
                  <th className="text-left px-5 py-3 font-medium">회원명</th>
                  <th className="text-left px-5 py-3 font-medium">상품</th>
                  <th className="text-left px-5 py-3 font-medium">금액</th>
                  <th className="text-left px-5 py-3 font-medium">주문일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-xs text-gray-400">{o.id}</td>
                    <td className="px-5 py-3 font-medium text-gray-800">{o.name}</td>
                    <td className="px-5 py-3 text-gray-600">{o.product}</td>
                    <td className="px-5 py-3 font-medium text-brand-green">{o.amount}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{o.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
