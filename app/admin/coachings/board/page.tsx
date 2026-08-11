import type { Metadata } from "next";
import pool from "@/lib/db";
import { ensureCategoryTables, ensurePostAdminReply, ensureCoachingBoard } from "@/lib/ensure-tables";
import BoardInquiryItem, { type BoardInquiry } from "@/components/admin/BoardInquiryItem";
import Pagination from "@/components/admin/Pagination";

export const metadata: Metadata = { title: "코칭 게시판" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

export default async function AdminCoachingBoardPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  await ensureCategoryTables();
  await ensurePostAdminReply();
  await ensureCoachingBoard();

  const { rows } = await pool.query<BoardInquiry>(`
    SELECT p.id, p.title, p.content, p.admin_reply,
           m.name AS member_name,
           m.nickname AS member_nickname,
           TO_CHAR(p.created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI') AS created_at,
           TO_CHAR(p.admin_replied_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI') AS admin_replied_at
    FROM posts p
    JOIN boards b ON b.id = p.board_id
    LEFT JOIN members m ON m.id = p.member_id
    WHERE b.slug = 'coaching'
    ORDER BY
      CASE WHEN p.admin_reply IS NULL THEN 0 ELSE 1 END,
      p.created_at DESC
  `);

  const pending = rows.filter((r) => !r.admin_reply).length;

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1), totalPages);
  const offset = (page - 1) * PAGE_SIZE;
  const pagedRows = rows.slice(offset, offset + PAGE_SIZE);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">코칭 게시판</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          전체 {rows.length}건 ·{" "}
          미답변 <span className="text-yellow-600 font-semibold">{pending}건</span>
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 px-5 py-12 text-center">
          <p className="text-sm text-gray-400">등록된 글이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {pagedRows.map((q, idx) => (
            <BoardInquiryItem key={q.id} inquiry={q} number={rows.length - (offset + idx)} />
          ))}
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} basePath="/admin/coachings/board" />
    </div>
  );
}
