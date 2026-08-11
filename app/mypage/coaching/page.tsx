import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { PenLine } from "lucide-react";
import pool from "@/lib/db";
import { verifyMemberToken, MEMBER_COOKIE } from "@/lib/member-auth";
import { ensureCategoryTables, ensurePostMemberCol, ensureMemberColumns, ensureCoachingBoard } from "@/lib/ensure-tables";
import Pagination from "@/components/admin/Pagination";

export const metadata: Metadata = { title: "코칭 게시판" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

export default async function MyCoachingBoardPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  await ensureCategoryTables();
  await ensurePostMemberCol();
  await ensureMemberColumns();
  await ensureCoachingBoard();

  const token = cookies().get(MEMBER_COOKIE)?.value;
  const member = token ? await verifyMemberToken(token) : null;
  if (!member) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 px-5 py-12 text-center text-sm text-gray-400">
        로그인이 필요합니다.
      </div>
    );
  }

  const { rows: memberRows } = await pool.query(
    `SELECT coaching_yn FROM members WHERE id = $1`,
    [member.id]
  );
  if (memberRows[0]?.coaching_yn !== "Y") {
    return (
      <div className="bg-white rounded-xl border border-gray-100 px-5 py-12 text-center">
        <p className="text-sm text-gray-400">코칭 신청 회원만 이용할 수 있는 게시판입니다.</p>
      </div>
    );
  }

  const { rows: countRows } = await pool.query(
    `SELECT COUNT(*)::int AS count
     FROM posts p
     JOIN boards b ON b.id = p.board_id
     WHERE b.slug = 'coaching' AND p.member_id = $1`,
    [member.id]
  );
  const total = countRows[0].count;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1), totalPages);
  const offset = (page - 1) * PAGE_SIZE;

  const { rows: posts } = await pool.query(
    `SELECT p.id, p.title,
            CASE WHEN p.admin_reply IS NULL THEN 'pending' ELSE 'answered' END AS status,
            TO_CHAR(p.created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD') AS created_at,
            TO_CHAR(p.admin_replied_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD') AS answered_at
     FROM posts p
     JOIN boards b ON b.id = p.board_id
     WHERE b.slug = 'coaching' AND p.member_id = $1
     ORDER BY p.created_at DESC
     LIMIT $2 OFFSET $3`,
    [member.id, PAGE_SIZE, offset]
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-brand-text">코칭 게시판</h1>
          <p className="text-sm text-brand-muted mt-0.5">코칭 진행 중 궁금한 점을 남겨주세요.</p>
        </div>
        <Link
          href="/mypage/coaching/new"
          className="inline-flex items-center gap-2 bg-brand-green text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-800 transition-colors"
        >
          <PenLine size={14} /> 글쓰기
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {posts.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-gray-400">
            작성한 글이 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 border-b border-gray-100">
                  <th className="text-left px-5 py-3 font-medium w-10">번호</th>
                  <th className="text-left px-5 py-3 font-medium">제목</th>
                  <th className="text-left px-5 py-3 font-medium">상태</th>
                  <th className="text-left px-5 py-3 font-medium hidden sm:table-cell">등록일</th>
                  <th className="text-left px-5 py-3 font-medium hidden sm:table-cell">답변일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {posts.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-gray-400 text-xs">{total - (offset + idx)}</td>
                    <td className="px-5 py-3">
                      <Link
                        href={`/mypage/coaching/${p.id}`}
                        className="font-medium text-brand-text hover:text-brand-green hover:underline"
                      >
                        {p.title}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        p.status === "answered"
                          ? "bg-green-50 text-green-700"
                          : "bg-yellow-50 text-yellow-700"
                      }`}>
                        {p.status === "answered" ? "답변완료" : "답변대기"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs hidden sm:table-cell">{p.created_at}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs hidden sm:table-cell">{p.answered_at ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} basePath="/mypage/coaching" />
    </div>
  );
}
