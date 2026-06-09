import type { Metadata } from "next";

export const metadata: Metadata = { title: "주문관리" };

const orders = [
  { id: "ORD-018", name: "김철수", email: "kim@example.com", product: "전자책 그룹 코칭", amount: "₩150,000", date: "2026-06-08", status: "결제완료" },
  { id: "ORD-017", name: "이영희", email: "lee@example.com", product: "전자책 개인 코칭", amount: "상담 후 안내", date: "2026-06-06", status: "상담중" },
  { id: "ORD-016", name: "오준혁", email: "oh@example.com", product: "종이책 1대1 코칭", amount: "상담 후 안내", date: "2026-06-03", status: "진행중" },
  { id: "ORD-015", name: "강지민", email: "kang@example.com", product: "전자책 그룹 코칭", amount: "₩150,000", date: "2026-05-28", status: "완료" },
  { id: "ORD-014", name: "최수진", email: "choi@example.com", product: "전자책 그룹 코칭", amount: "₩150,000", date: "2026-05-20", status: "완료" },
  { id: "ORD-013", name: "정동현", email: "jung@example.com", product: "전자책 개인 코칭", amount: "상담 후 안내", date: "2026-05-15", status: "완료" },
];

const statusStyle: Record<string, string> = {
  결제완료: "bg-blue-50 text-blue-700",
  상담중: "bg-yellow-50 text-yellow-700",
  진행중: "bg-purple-50 text-purple-700",
  완료: "bg-green-50 text-green-700",
};

export default function OrdersPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">주문관리</h1>
        <p className="text-sm text-gray-500 mt-0.5">총 {orders.length}건의 주문이 있습니다.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "결제완료", count: 1, color: "text-blue-600" },
          { label: "상담중", count: 1, color: "text-yellow-600" },
          { label: "진행중", count: 1, color: "text-purple-600" },
          { label: "완료", count: 3, color: "text-green-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
            <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 border-b border-gray-100">
                <th className="text-left px-5 py-3 font-medium">주문번호</th>
                <th className="text-left px-5 py-3 font-medium">회원명</th>
                <th className="text-left px-5 py-3 font-medium hidden md:table-cell">이메일</th>
                <th className="text-left px-5 py-3 font-medium">상품</th>
                <th className="text-left px-5 py-3 font-medium hidden sm:table-cell">금액</th>
                <th className="text-left px-5 py-3 font-medium hidden md:table-cell">주문일</th>
                <th className="text-left px-5 py-3 font-medium">상태</th>
                <th className="text-left px-5 py-3 font-medium">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-xs text-gray-400">{o.id}</td>
                  <td className="px-5 py-3 font-medium text-gray-800">{o.name}</td>
                  <td className="px-5 py-3 text-gray-500 hidden md:table-cell">{o.email}</td>
                  <td className="px-5 py-3 text-gray-600">{o.product}</td>
                  <td className="px-5 py-3 font-medium text-brand-green hidden sm:table-cell">{o.amount}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs hidden md:table-cell">{o.date}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusStyle[o.status] ?? "bg-gray-50 text-gray-500"}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <button className="text-xs text-brand-green hover:underline">상세</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
