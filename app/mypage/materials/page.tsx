import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { Paperclip } from "lucide-react";
import pool from "@/lib/db";
import { verifyMemberToken, MEMBER_COOKIE } from "@/lib/member-auth";
import {
  ensureCategoryTables,
  ensureCoachingMaterialsBoard,
  ensurePostAttachmentsTable,
  ensureMemberColumns,
} from "@/lib/ensure-tables";
import { hasCoachingBoardAccess } from "@/lib/coaching-access";
import Pagination from "@/components/admin/Pagination";

export const metadata: Metadata = { title: "코칭 자료실" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

export default async function MyMaterialsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  await ensureCategoryTables();
  await ensureCoachingMaterialsBoard();
  await ensurePostAttachmentsTable();
  await ensureMemberColumns();

  const token = cookies().get(MEMBER_COOKIE)?.value;
  const member = token ? await verifyMemberToken(token) : null;
  if (!member) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 px-5 py-12 text-center text-sm text-gray-400">
        로그인이 필요합니다.
      </div>
    );
  }

  if (!(await hasCoachingBoardAccess(member.id))) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 px-5 py-12 text-center">
        <p className="text-sm text-gray-400">코칭 신청 회원만 이용할 수 있는 자료실입니다.</p>
      </div>
    );
  }

  const { rows: countRows } = await pool.query(
    `SELECT COUNT(*)::int AS count FROM posts p
     JOIN boards b ON b.id = p.board_id
     WHERE b.slug = 'coaching-materials'`
  );
  const total = countRows[0].count;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1), totalPages);
  const offset = (page - 1) * PAGE_SIZE;

  const { rows: posts } = await pool.query(
    `SELECT p.id, p.title, p.view_count,
            bc.name AS category_name,
            TO_CHAR(p.created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD') AS created_at,
            (SELECT COUNT(*)::int FROM post_attachments a WHERE a.post_id = p.id) AS attachment_count
     FROM posts p
     JOIN boards b ON b.id = p.board_id
     LEFT JOIN board_categories bc ON bc.id = p.category_id
     WHERE b.slug = 'coaching-materials'
     ORDER BY p.created_at DESC
     LIMIT $1 OFFSET $2`,
    [PAGE_SIZE, offset]
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-brand-text">코칭 자료실</h1>
        <p className="text-sm text-brand-muted mt-0.5">코칭에 필요한 자료를 확인하고 다운로드하세요.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {posts.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-gray-400">
            등록된 자료가 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 border-b border-gray-100">
                  <th className="text-left px-5 py-3 font-medium w-10">번호</th>
                  <th className="text-left px-5 py-3 font-medium hidden sm:table-cell">분류</th>
                  <th className="text-left px-5 py-3 font-medium">제목</th>
                  <th className="text-left px-5 py-3 font-medium hidden sm:table-cell">등록일</th>
                  <th className="text-left px-5 py-3 font-medium hidden sm:table-cell">조회</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {posts.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-gray-400 text-xs">{total - (offset + idx)}</td>
                    <td className="px-5 py-3 hidden sm:table-cell">
                      {p.category_name ? (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {p.category_name}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <Link
                        href={`/mypage/materials/${p.id}`}
                        className="font-medium text-brand-text hover:text-brand-green hover:underline inline-flex items-center gap-1.5"
                      >
                        {p.title}
                        {p.attachment_count > 0 && (
                          <Paperclip size={12} className="text-gray-400" />
                        )}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs hidden sm:table-cell">{p.created_at}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs hidden sm:table-cell">{p.view_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} basePath="/mypage/materials" />
    </div>
  );
}
