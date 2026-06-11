import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ChevronDown } from "lucide-react";
import pool from "@/lib/db";
import { verifyMemberToken, MEMBER_COOKIE } from "@/lib/member-auth";
import { ensureMemberTables, ensureInquiryCategory } from "@/lib/ensure-tables";
import InquiryForm from "@/components/mypage/InquiryForm";

export const metadata: Metadata = { title: "1대1 문의" };
export const dynamic = "force-dynamic";

export default async function InquiryPage() {
  const token = cookies().get(MEMBER_COOKIE)?.value;
  const member = token ? await verifyMemberToken(token) : null;
  if (!member) return null;

  await ensureMemberTables();
  await ensureInquiryCategory();

  // qna 게시판 카테고리 조회
  const { rows: categories } = await pool.query<{ id: number; name: string }>(
    `SELECT bc.id, bc.name
     FROM board_categories bc
     JOIN boards b ON b.id = bc.board_id
     WHERE b.slug = 'qna' AND b.use_category = TRUE
     ORDER BY bc.sort_order, bc.name`
  );

  const { rows } = await pool.query(
    `SELECT id, subject, message, status, reply, category,
            TO_CHAR(created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI') AS created_at,
            TO_CHAR(replied_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI') AS replied_at
     FROM member_inquiries
     WHERE member_id = $1
     ORDER BY created_at DESC`,
    [member.id]
  );

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">1대1 문의</h1>
          <p className="text-sm text-gray-500 mt-0.5">코치와 직접 소통하세요. 영업일 기준 1~2일 내 답변드립니다.</p>
        </div>
      </div>

      <InquiryForm categories={categories} />

      {rows.length > 0 && (
        <div className="space-y-3 mt-2">
          {rows.map((q) => (
            <details key={q.id} className="bg-white rounded-xl border border-gray-100 group">
              <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${
                    q.status === "pending"
                      ? "bg-yellow-50 text-yellow-700"
                      : "bg-green-50 text-green-700"
                  }`}>
                    {q.status === "pending" ? "답변대기" : "답변완료"}
                  </span>
                  {q.category && (
                    <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                      {q.category}
                    </span>
                  )}
                  <p className="text-sm font-medium text-gray-800 truncate">{q.subject}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <p className="text-xs text-gray-400 hidden sm:block">{q.created_at}</p>
                  <ChevronDown
                    size={16}
                    className="text-gray-400 transition-transform group-open:rotate-180"
                  />
                </div>
              </summary>

              <div className="px-5 pb-5 border-t border-gray-50 pt-4 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-1">문의 내용</p>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{q.message}</p>
                </div>

                {q.reply ? (
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-xs font-semibold text-green-700 mb-1">
                      관리자 답변 · {q.replied_at}
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{q.reply}</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg px-4 py-3">
                    <p className="text-xs text-gray-400">아직 답변이 등록되지 않았습니다.</p>
                  </div>
                )}
              </div>
            </details>
          ))}
        </div>
      )}

      {rows.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 px-5 py-12 text-center">
          <p className="text-gray-400 text-sm">아직 문의 내역이 없습니다.</p>
          <p className="text-gray-400 text-xs mt-1">위 버튼을 눌러 첫 문의를 남겨보세요.</p>
        </div>
      )}
    </div>
  );
}
