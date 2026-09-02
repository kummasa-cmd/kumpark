import type { Metadata } from "next";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import pool from "@/lib/db";
import { ensureCoachingTable, autoCompleteCoachings } from "@/lib/ensure-tables";
import CoachingDeleteButton from "@/components/admin/CoachingDeleteButton";
import Pagination from "@/components/admin/Pagination";

export const metadata: Metadata = { title: "코칭목록" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 15;

const BOOK_TYPE_LABEL: Record<string, string> = { paper: "종이책", ebook: "전자책" };
const CATEGORY_LABEL: Record<string, string> = { group: "그룹", individual: "개인" };
const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  pending:     { label: "입금대기", cls: "bg-yellow-50 text-yellow-700" },
  in_progress: { label: "코칭중",   cls: "bg-blue-50 text-blue-700" },
  completed:   { label: "코칭종료", cls: "bg-green-50 text-green-700" },
  refunded:    { label: "환불",     cls: "bg-red-50 text-red-600" },
};

export default async function CoachingsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  await ensureCoachingTable();
  await autoCompleteCoachings();

  const { rows: countRows } = await pool.query(`SELECT COUNT(*)::int AS count FROM coachings`);
  const total = countRows[0].count;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1), totalPages);
  const offset = (page - 1) * PAGE_SIZE;

  const { rows } = await pool.query(
    `SELECT c.id, c.book_type, c.category, c.product_name, c.amount, c.session_count, c.completed_count, c.status,
            TO_CHAR(c.start_date, 'YYYY-MM-DD') AS start_date,
            TO_CHAR(c.end_date, 'YYYY-MM-DD') AS end_date,
            m.name AS member_name, m.nickname AS member_nickname
     FROM coachings c
     JOIN members m ON m.id = c.member_id
     ORDER BY c.created_at DESC, c.id DESC
     LIMIT $1 OFFSET $2`,
    [PAGE_SIZE, offset]
  );

  const formatAmount = (n: number) => `₩${new Intl.NumberFormat("ko-KR").format(n)}`;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">코칭목록</h1>
          <p className="text-sm text-gray-500 mt-0.5">총 {total}건의 코칭 신청이 있습니다.</p>
        </div>
        <Link
          href="/admin/coachings/new"
          className="inline-flex items-center gap-2 bg-brand-green text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-800 transition-colors"
        >
          <PlusCircle size={15} /> 코칭등록
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 border-b border-gray-100">
                <th className="text-left px-5 py-3 font-medium w-10">번호</th>
                <th className="text-left px-5 py-3 font-medium">이름(닉네임)</th>
                <th className="text-left px-5 py-3 font-medium hidden md:table-cell">유형</th>
                <th className="text-left px-5 py-3 font-medium hidden md:table-cell">구분</th>
                <th className="text-left px-5 py-3 font-medium">상품명</th>
                <th className="text-left px-5 py-3 font-medium hidden sm:table-cell">금액</th>
                <th className="text-left px-5 py-3 font-medium hidden lg:table-cell">코칭시작일</th>
                <th className="text-left px-5 py-3 font-medium hidden lg:table-cell">코칭종료일</th>
                <th className="text-left px-5 py-3 font-medium hidden lg:table-cell">코칭횟수</th>
                <th className="text-left px-5 py-3 font-medium">상태</th>
                <th className="text-left px-5 py-3 font-medium w-20">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((c, idx) => {
                const st = STATUS_LABEL[c.status] ?? { label: c.status, cls: "bg-gray-100 text-gray-500" };
                return (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-gray-400 text-xs">{total - (offset + idx)}</td>
                    <td className="px-5 py-3 font-medium text-gray-800">
                      {c.member_name}
                      {c.member_nickname && <span className="text-gray-400"> ({c.member_nickname})</span>}
                    </td>
                    <td className="px-5 py-3 text-gray-600 hidden md:table-cell">
                      {BOOK_TYPE_LABEL[c.book_type] ?? c.book_type}
                    </td>
                    <td className="px-5 py-3 text-gray-600 hidden md:table-cell">
                      {CATEGORY_LABEL[c.category] ?? c.category}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{c.product_name}</td>
                    <td className="px-5 py-3 font-medium text-brand-green hidden sm:table-cell">
                      {formatAmount(c.amount)}
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs hidden lg:table-cell">{c.start_date}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs hidden lg:table-cell">{c.end_date ?? "-"}</td>
                    <td className="px-5 py-3 text-gray-500 hidden lg:table-cell">
                      ({c.completed_count}/{c.session_count})
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/coachings/${c.id}`}
                          className="text-xs text-brand-green hover:underline"
                        >
                          수정
                        </Link>
                        <CoachingDeleteButton id={c.id} name={c.member_name} />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-5 py-8 text-center text-sm text-gray-400">
                    등록된 코칭 신청이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination currentPage={page} totalPages={totalPages} basePath="/admin/coachings" />
    </div>
  );
}
