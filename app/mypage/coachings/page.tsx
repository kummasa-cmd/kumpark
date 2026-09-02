import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import pool from "@/lib/db";
import { verifyMemberToken, MEMBER_COOKIE } from "@/lib/member-auth";
import { ensureCoachingTable, autoCompleteCoachings } from "@/lib/ensure-tables";

export const metadata: Metadata = { title: "코칭 내역" };
export const dynamic = "force-dynamic";

const BOOK_TYPE_LABEL: Record<string, string> = { paper: "종이책", ebook: "전자책" };
const CATEGORY_LABEL: Record<string, string> = { group: "그룹", individual: "개인" };
const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  pending:     { label: "입금대기", cls: "bg-yellow-50 text-yellow-700" },
  in_progress: { label: "코칭중",   cls: "bg-blue-50 text-blue-700" },
  completed:   { label: "코칭종료", cls: "bg-green-50 text-green-700" },
  refunded:    { label: "환불",     cls: "bg-red-50 text-red-600" },
};

export default async function MyCoachingsPage() {
  const token = cookies().get(MEMBER_COOKIE)?.value;
  const member = token ? await verifyMemberToken(token) : null;
  if (!member) return null;

  await ensureCoachingTable();
  await autoCompleteCoachings();

  const { rows } = await pool.query(
    `SELECT id, book_type, category, product_name, amount, status, session_count, completed_count,
            TO_CHAR(start_date, 'YYYY-MM-DD') AS start_date,
            TO_CHAR(end_date, 'YYYY-MM-DD') AS end_date,
            TO_CHAR(created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD') AS created_at
     FROM coachings
     WHERE member_id = $1
     ORDER BY created_at DESC`,
    [member.id]
  );

  const formatAmount = (n: number) => `₩${new Intl.NumberFormat("ko-KR").format(n)}`;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">코칭 내역</h1>
        <p className="text-sm text-gray-500 mt-0.5">전체 코칭 {rows.length}건</p>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 px-5 py-12 text-center">
          <p className="text-gray-400 text-sm mb-4">코칭 신청 내역이 없습니다.</p>
          <Link
            href="/goods"
            className="inline-flex items-center gap-2 bg-brand-green text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-green-800 transition-colors"
          >
            상품 보러가기 <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((c) => {
            const st = STATUS_LABEL[c.status] ?? { label: c.status, cls: "bg-gray-100 text-gray-500" };
            return (
              <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="font-semibold text-gray-800">{c.product_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {BOOK_TYPE_LABEL[c.book_type] ?? c.book_type} · {CATEGORY_LABEL[c.category] ?? c.category}
                    </p>
                  </div>
                  <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${st.cls}`}>
                    {st.label}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <p className="text-lg font-bold text-brand-green">{formatAmount(c.amount)}</p>
                  <p className="text-xs text-gray-400">{c.completed_count}/{c.session_count}회 진행</p>
                </div>

                <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                  <span>{c.start_date ?? "-"} ~ {c.end_date ?? "-"}</span>
                  <span>신청일 {c.created_at}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
