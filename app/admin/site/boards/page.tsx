import type { Metadata } from "next";
import Link from "next/link";
import { LayoutList } from "lucide-react";
import pool from "@/lib/db";
import { ensureCategoryTables } from "@/lib/ensure-tables";
import BoardDeleteButton from "@/components/admin/BoardDeleteButton";
import Pagination from "@/components/admin/Pagination";

export const metadata: Metadata = { title: "게시판관리" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 15;

export default async function SiteBoardsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  await ensureCategoryTables();

  const { rows: countRows } = await pool.query(`SELECT COUNT(*)::int AS count FROM boards`);
  const total = countRows[0].count;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1), totalPages);
  const offset = (page - 1) * PAGE_SIZE;

  const { rows } = await pool.query(
    `SELECT b.id, b.name, b.slug, b.sort_order, b.is_visible,
           COALESCE(b.user_writable, TRUE) AS user_writable,
           COALESCE(b.board_type, 'general') AS board_type,
           COUNT(p.id)::int AS post_count
    FROM boards b
    LEFT JOIN posts p ON p.board_id = b.id
    GROUP BY b.id
    ORDER BY b.sort_order ASC, b.id ASC
    LIMIT $1 OFFSET $2`,
    [PAGE_SIZE, offset]
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">게시판관리</h1>
          <p className="text-sm text-gray-500 mt-0.5">커뮤니티 게시판의 설정을 관리합니다.</p>
        </div>
        <Link
          href="/admin/site/boards/new"
          className="inline-flex items-center gap-2 bg-brand-green text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-800 transition-colors"
        >
          <LayoutList size={15} /> 게시판 추가
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 border-b border-gray-100">
                <th className="text-left px-5 py-3 font-medium">순서</th>
                <th className="text-left px-5 py-3 font-medium">게시판명</th>
                <th className="text-left px-5 py-3 font-medium hidden md:table-cell">슬러그</th>
                <th className="text-left px-5 py-3 font-medium">유형</th>
                <th className="text-left px-5 py-3 font-medium">게시물수</th>
                <th className="text-left px-5 py-3 font-medium">노출</th>
                <th className="text-left px-5 py-3 font-medium hidden lg:table-cell">사용자 입력</th>
                <th className="text-left px-5 py-3 font-medium">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-gray-400 text-xs">{b.sort_order}</td>
                  <td className="px-5 py-3 font-medium text-gray-800">{b.name}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs font-mono hidden md:table-cell">
                    /community/{b.slug}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        b.board_type === "personal"
                          ? "bg-purple-50 text-purple-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {b.board_type === "personal" ? "개인" : "일반"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/site/boards/${b.id}/posts`}
                      className="text-brand-green hover:underline font-medium"
                    >
                      {b.post_count}개
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        b.is_visible ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {b.is_visible ? "노출" : "숨김"}
                    </span>
                  </td>
                  <td className="px-5 py-3 hidden lg:table-cell">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        b.user_writable
                          ? "bg-blue-50 text-blue-700"
                          : "bg-orange-50 text-orange-600"
                      }`}
                    >
                      {b.user_writable ? "가능" : "불가"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/site/boards/${b.id}`}
                        className="text-xs text-brand-green hover:underline"
                      >
                        수정
                      </Link>
                      <BoardDeleteButton id={b.id} name={b.name} />
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-sm text-gray-400">
                    등록된 게시판이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination currentPage={page} totalPages={totalPages} basePath="/admin/site/boards" />
    </div>
  );
}
