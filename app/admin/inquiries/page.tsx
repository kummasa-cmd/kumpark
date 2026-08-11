import type { Metadata } from "next";
import pool from "@/lib/db";
import { ensureMemberTables, ensurePostAdminReply } from "@/lib/ensure-tables";
import InquiryReplySection from "@/components/admin/InquiryReplySection";
import BoardInquiryItem, { type BoardInquiry } from "@/components/admin/BoardInquiryItem";
import Pagination from "@/components/admin/Pagination";

export const metadata: Metadata = { title: "1대1 문의" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: { tab?: string; page?: string };
}) {
  await ensureMemberTables();
  await ensurePostAdminReply();

  const tab = searchParams.tab === "board" ? "board" : "mypage";

  // 마이페이지 문의 (member_inquiries)
  const { rows: mypageRows } = await pool.query(`
    SELECT i.id, i.subject, i.message, i.status, i.reply, i.category,
           m.name AS member_name, m.email AS member_email,
           TO_CHAR(i.created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI') AS created_at,
           TO_CHAR(i.replied_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI') AS replied_at
    FROM member_inquiries i
    JOIN members m ON m.id = i.member_id
    ORDER BY
      CASE WHEN i.status = 'pending' THEN 0 ELSE 1 END,
      i.created_at DESC
  `);

  // 게시판 문의 (qna 게시판 posts)
  const { rows: boardRows } = await pool.query<BoardInquiry>(`
    SELECT p.id, p.title, p.content, p.admin_reply,
           m.name  AS member_name,
           m.email AS member_email,
           TO_CHAR(p.created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI') AS created_at,
           TO_CHAR(p.admin_replied_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI') AS admin_replied_at
    FROM posts p
    JOIN boards b ON b.id = p.board_id
    LEFT JOIN members m ON m.id = p.member_id
    WHERE b.slug = 'qna'
    ORDER BY
      CASE WHEN p.admin_reply IS NULL THEN 0 ELSE 1 END,
      p.created_at DESC
  `);

  const mypagePending = mypageRows.filter((r) => r.status === "pending").length;
  const boardPending  = boardRows.filter((r) => !r.admin_reply).length;

  const tabs = [
    { value: "mypage", label: "마이페이지 문의", pending: mypagePending, total: mypageRows.length },
    { value: "board",  label: "게시판 문의",     pending: boardPending,  total: boardRows.length },
  ];

  const activeRows = tab === "board" ? boardRows : mypageRows;
  const activePending = tab === "board" ? boardPending : mypagePending;

  const totalPages = Math.max(1, Math.ceil(activeRows.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1), totalPages);
  const pagedRows = activeRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">1대1 문의</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          전체 {activeRows.length}건 · 미답변{" "}
          <span className="text-yellow-600 font-semibold">{activePending}건</span>
        </p>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map((t) => (
          <a
            key={t.value}
            href={`/admin/inquiries?tab=${t.value}`}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              tab === t.value
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
            {t.pending > 0 && (
              <span className="bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full text-xs">
                {t.pending}
              </span>
            )}
          </a>
        ))}
      </div>

      {/* 목록 */}
      {activeRows.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 px-5 py-12 text-center">
          <p className="text-gray-400 text-sm">문의 내역이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tab === "board"
            ? (pagedRows as BoardInquiry[]).map((q) => (
                <BoardInquiryItem key={q.id} inquiry={q} />
              ))
            : (pagedRows as typeof mypageRows).map((q) => (
                <InquiryReplySection key={q.id} inquiry={q} />
              ))
          }
        </div>
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath="/admin/inquiries"
        searchParams={{ tab }}
      />
    </div>
  );
}
