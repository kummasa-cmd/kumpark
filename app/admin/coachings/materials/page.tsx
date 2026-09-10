import type { Metadata } from "next";
import Link from "next/link";
import { PenLine, Pencil } from "lucide-react";
import pool from "@/lib/db";
import { ensureCategoryTables, ensureCoachingMaterialsBoard, ensurePostAttachmentsTable } from "@/lib/ensure-tables";
import PostDeleteButton from "@/components/admin/PostDeleteButton";
import Pagination from "@/components/admin/Pagination";

export const metadata: Metadata = { title: "코칭 자료실" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 15;

export default async function AdminMaterialsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  await ensureCategoryTables();
  await ensureCoachingMaterialsBoard();
  await ensurePostAttachmentsTable();

  const { rows: boardRows } = await pool.query(
    `SELECT id FROM boards WHERE slug = 'coaching-materials'`
  );
  const boardId = boardRows[0]?.id;

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
    `SELECT p.id, p.title, p.view_count, p.created_at,
            bc.name AS category_name,
            COALESCE(SUM(a.download_count), 0)::int AS download_count,
            COUNT(a.id)::int AS attachment_count,
            ROW_NUMBER() OVER (ORDER BY p.created_at ASC, p.id ASC) AS rn
     FROM posts p
     JOIN boards b ON b.id = p.board_id
     LEFT JOIN board_categories bc ON bc.id = p.category_id
     LEFT JOIN post_attachments a ON a.post_id = p.id
     WHERE b.slug = 'coaching-materials'
     GROUP BY p.id, bc.name
     ORDER BY p.created_at DESC
     LIMIT $1 OFFSET $2`,
    [PAGE_SIZE, offset]
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">코칭 자료실</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            전자책·종이책 코칭 회원에게만 공개되는 자료입니다. 총 {total}건
          </p>
        </div>
        <div className="flex items-center gap-2">
          {boardId && (
            <Link
              href="/admin/coachings/materials/new"
              className="inline-flex items-center gap-2 bg-brand-green text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-800 transition-colors"
            >
              <PenLine size={15} /> 자료 등록
            </Link>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 border-b border-gray-100">
                <th className="text-left px-5 py-3 font-medium w-10">번호</th>
                <th className="text-left px-5 py-3 font-medium hidden md:table-cell">분류</th>
                <th className="text-left px-5 py-3 font-medium">제목</th>
                <th className="text-left px-5 py-3 font-medium hidden md:table-cell">조회수</th>
                <th className="text-left px-5 py-3 font-medium hidden md:table-cell">다운로드수</th>
                <th className="text-left px-5 py-3 font-medium hidden md:table-cell">등록일</th>
                <th className="text-left px-5 py-3 font-medium w-24">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {posts.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-gray-400 text-xs">{p.rn}</td>
                  <td className="px-5 py-3 hidden md:table-cell">
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
                      href={`/admin/coachings/materials/${p.id}`}
                      className="text-gray-800 font-medium hover:text-brand-green hover:underline transition-colors"
                    >
                      {p.title}
                    </Link>
                    {p.attachment_count > 0 && (
                      <span className="ml-2 text-xs text-gray-400">파일 {p.attachment_count}</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs hidden md:table-cell">{p.view_count}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs hidden md:table-cell">{p.download_count}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs hidden md:table-cell">
                    {new Date(p.created_at).toLocaleDateString("ko-KR")}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/coachings/materials/${p.id}/edit`}
                        className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 transition-colors"
                      >
                        <Pencil size={12} /> 수정
                      </Link>
                      <PostDeleteButton postId={p.id} title={p.title} />
                    </div>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-sm text-gray-400">
                    등록된 자료가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination currentPage={page} totalPages={totalPages} basePath="/admin/coachings/materials" />
    </div>
  );
}
