import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import pool from "@/lib/db";
import { verifyMemberToken, MEMBER_COOKIE } from "@/lib/member-auth";

export const metadata: Metadata = { title: "주문 내역" };
export const dynamic = "force-dynamic";

const ORDER_STATUS: Record<string, { label: string; cls: string }> = {
  paid:        { label: "결제완료", cls: "bg-blue-50 text-blue-700" },
  consulting:  { label: "상담중",   cls: "bg-yellow-50 text-yellow-700" },
  in_progress: { label: "진행중",   cls: "bg-purple-50 text-purple-700" },
  completed:   { label: "완료",     cls: "bg-green-50 text-green-700" },
  cancelled:   { label: "취소",     cls: "bg-red-50 text-red-600" },
};

export default async function OrdersPage() {
  const token = cookies().get(MEMBER_COOKIE)?.value;
  const member = token ? await verifyMemberToken(token) : null;
  if (!member) return null;

  const { rows } = await pool.query(
    `SELECT o.id, o.order_number, p.name AS product_name, p.description AS product_desc,
            o.amount_display, o.status, o.memo,
            TO_CHAR(o.created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD') AS created_at
     FROM orders o
     JOIN products p ON p.id = o.product_id
     WHERE o.member_id = $1
     ORDER BY o.created_at DESC`,
    [member.id]
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">주문 내역</h1>
        <p className="text-sm text-gray-500 mt-0.5">전체 주문 {rows.length}건</p>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 px-5 py-12 text-center">
          <p className="text-gray-400 text-sm mb-4">주문 내역이 없습니다.</p>
          <Link
            href="/goods"
            className="inline-flex items-center gap-2 bg-brand-green text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-green-800 transition-colors"
          >
            상품 보러가기 <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((o) => {
            const st = ORDER_STATUS[o.status] ?? { label: o.status, cls: "bg-gray-100 text-gray-500" };
            return (
              <div key={o.id} className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="font-semibold text-gray-800">{o.product_name}</p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{o.order_number}</p>
                  </div>
                  <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${st.cls}`}>
                    {st.label}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-lg font-bold text-brand-green">{o.amount_display}</p>
                  <p className="text-xs text-gray-400">{o.created_at}</p>
                </div>
                {o.memo && (
                  <p className="text-xs text-gray-500 mt-2 bg-gray-50 rounded-lg px-3 py-2">
                    {o.memo}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
