import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, Pencil } from "lucide-react";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/auth";
import { ensureCategoryTables } from "@/lib/ensure-tables";
import PostDeleteButton from "@/components/admin/PostDeleteButton";
import CommentSection, { type Comment } from "@/components/admin/CommentSection";

export const metadata: Metadata = { title: "게시물 상세" };
export const dynamic = "force-dynamic";

export default async function PostViewPage({
  params,
}: {
  params: { id: string; postId: string };
}) {
  await ensureCategoryTables();

  const [boardResult, postResult] = await Promise.all([
    pool.query(
      `SELECT id, name, COALESCE(use_comment, FALSE) AS use_comment FROM boards WHERE id = $1`,
      [params.id]
    ),
    pool.query(
      `SELECT p.id, p.title, p.author_name, p.content,
              COALESCE(p.is_notice, FALSE) AS is_notice,
              p.view_count,
              bc.name AS category_name,
              TO_CHAR(p.created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI') AS created_at
       FROM posts p
       LEFT JOIN board_categories bc ON bc.id = p.category_id
       WHERE p.id = $1 AND p.board_id = $2`,
      [params.postId, params.id]
    ),
  ]);

  if (!boardResult.rows[0] || !postResult.rows[0]) notFound();
  const board = boardResult.rows[0];
  const post = postResult.rows[0];

  // 조회수 증가
  await pool.query(`UPDATE posts SET view_count = COALESCE(view_count, 0) + 1 WHERE id = $1`, [
    params.postId,
  ]);

  const token = cookies().get(COOKIE_NAME)?.value;
  const payload = token ? await verifyAdminToken(token) : null;
  const adminRow = payload
    ? (await pool.query(`SELECT id, name FROM admins WHERE id = $1`, [payload.id])).rows[0]
    : null;
  const adminId = adminRow?.id ?? 0;
  const adminName = adminRow?.name ?? "관리자";

  let comments: Comment[] = [];
  if (board.use_comment) {
    try {
      const { rows } = await pool.query(
        `SELECT id, parent_id, author_name, author_type, author_id, content,
                TO_CHAR(created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI') AS created_at
         FROM comments
         WHERE post_id = $1
         ORDER BY COALESCE(parent_id, id) ASC, id ASC`,
        [params.postId]
      );
      comments = rows;
    } catch {}
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back + actions header */}
      <div>
        <Link
          href={`/admin/site/boards/${params.id}/posts`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3"
        >
          <ChevronLeft size={15} /> {board.name} 게시물 목록
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              {post.is_notice && (
                <span className="text-xs bg-brand-green text-white px-2 py-0.5 rounded font-medium">
                  공지
                </span>
              )}
              {post.category_name && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {post.category_name}
                </span>
              )}
              <h1 className="text-xl font-bold text-gray-900">{post.title}</h1>
            </div>
            <p className="text-sm text-gray-500">
              {post.author_name} · {post.created_at} · 조회 {post.view_count}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/admin/site/boards/${params.id}/posts/${params.postId}/edit`}
              className="inline-flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-700 border border-blue-200 hover:border-blue-400 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Pencil size={12} /> 수정
            </Link>
            <PostDeleteButton postId={post.id} title={post.title} />
          </div>
        </div>
      </div>

      {/* Post content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>

      {/* Comment section */}
      {board.use_comment && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <CommentSection
            postId={post.id}
            adminId={adminId}
            adminName={adminName}
            initialComments={comments}
          />
        </div>
      )}
    </div>
  );
}
