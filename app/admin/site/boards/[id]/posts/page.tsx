import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, PenLine, Tag, Pencil, MessageSquare } from "lucide-react";
import { notFound } from "next/navigation";
import pool from "@/lib/db";
import { ensureCategoryTables } from "@/lib/ensure-tables";
import PostDeleteButton from "@/components/admin/PostDeleteButton";

export const metadata: Metadata = { title: "게시물 관리" };
export const dynamic = "force-dynamic";

export default async function BoardPostsPage({ params }: { params: { id: string } }) {
  await ensureCategoryTables();

  const { rows: boardRows } = await pool.query(
    `SELECT id, name, slug,
            COALESCE(use_category, FALSE) AS use_category,
            COALESCE(use_comment, FALSE) AS use_comment,
            COALESCE(board_type, 'general') AS board_type
     FROM boards WHERE id = $1`,
    [params.id]
  );
  if (!boardRows[0]) notFound();
  const board = boardRows[0];

  const { rows: posts } = await pool.query(
    `SELECT p.id, p.title, p.author_name, p.is_notice, p.view_count, p.created_at,
            bc.name AS category_name,
            ROW_NUMBER() OVER (ORDER BY p.created_at ASC, p.id ASC) AS rn,
            (SELECT COUNT(*)::int FROM comments c WHERE c.post_id = p.id) AS comment_count
     FROM posts p
     LEFT JOIN board_categories bc ON bc.id = p.category_id
     WHERE p.board_id = $1
     ORDER BY p.is_notice DESC, p.created_at DESC`,
    [params.id]
  );

  const colSpan = board.use_category ? 7 : 6;

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/admin/site/boards"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3"
        >
          <ChevronLeft size={15} /> 게시판 목록
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">{board.name}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                board.board_type === "personal"
                  ? "bg-purple-50 text-purple-700"
                  : "bg-gray-100 text-gray-600"
              }`}>
                {board.board_type === "personal" ? "개인" : "일반"}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              <span className="font-mono text-xs">/community/{board.slug}</span> · 총 {posts.length}개
            </p>
          </div>
          <div className="flex items-center gap-2">
            {board.use_category && (
              <Link
                href={`/admin/site/boards/${params.id}/categories`}
                className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:border-brand-green hover:text-brand-green transition-colors"
              >
                <Tag size={15} /> 카테고리 관리
              </Link>
            )}
            <Link
              href={`/admin/site/boards/${params.id}/posts/new`}
              className="inline-flex items-center gap-2 bg-brand-green text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-800 transition-colors"
            >
              <PenLine size={15} /> 게시물 추가
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 border-b border-gray-100">
                <th className="text-left px-5 py-3 font-medium w-10">번호</th>
                {board.use_category && (
                  <th className="text-left px-5 py-3 font-medium hidden md:table-cell">카테고리</th>
                )}
                <th className="text-left px-5 py-3 font-medium">제목</th>
                <th className="text-left px-5 py-3 font-medium hidden md:table-cell">작성자</th>
                <th className="text-left px-5 py-3 font-medium hidden md:table-cell">조회</th>
                <th className="text-left px-5 py-3 font-medium hidden md:table-cell">작성일</th>
                <th className="text-left px-5 py-3 font-medium w-24">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {posts.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-gray-400 text-xs">{p.rn}</td>
                  {board.use_category && (
                    <td className="px-5 py-3 hidden md:table-cell">
                      {p.category_name ? (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {p.category_name}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300">-</span>
                      )}
                    </td>
                  )}
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      {p.is_notice && (
                        <span className="text-xs bg-brand-green text-white px-1.5 py-0.5 rounded">
                          공지
                        </span>
                      )}
                      <Link
                        href={`/admin/site/boards/${params.id}/posts/${p.id}`}
                        className="text-gray-800 font-medium hover:text-brand-green hover:underline transition-colors"
                      >
                        {p.title}
                      </Link>
                      {board.use_comment && p.comment_count > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-xs text-brand-green font-medium">
                          <MessageSquare size={11} />
                          {p.comment_count}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-500 hidden md:table-cell">{p.author_name}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs hidden md:table-cell">{p.view_count}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs hidden md:table-cell">
                    {new Date(p.created_at).toLocaleDateString("ko-KR")}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/site/boards/${params.id}/posts/${p.id}/edit`}
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
                  <td colSpan={colSpan} className="px-5 py-8 text-center text-sm text-gray-400">
                    게시물이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
