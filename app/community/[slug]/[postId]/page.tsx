import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { ChevronLeft, Pencil } from "lucide-react";
import pool from "@/lib/db";
import { verifyMemberToken, MEMBER_COOKIE } from "@/lib/member-auth";
import { ensureCategoryTables, ensurePostMemberCol } from "@/lib/ensure-tables";
import PublicCommentSection, {
  type Comment,
} from "@/components/community/PublicCommentSection";
import PublicPostDeleteButton from "@/components/community/PublicPostDeleteButton";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string; postId: string };
}): Promise<Metadata> {
  const { rows } = await pool.query("SELECT title FROM posts WHERE id = $1", [params.postId]);
  return { title: rows[0]?.title ?? "게시물" };
}

export default async function PublicPostPage({
  params,
}: {
  params: { slug: string; postId: string };
}) {
  await ensureCategoryTables();
  await ensurePostMemberCol();

  const [boardRes, postRes] = await Promise.all([
    pool.query(
      `SELECT id, name, slug,
              COALESCE(use_comment, FALSE) AS use_comment,
              COALESCE(board_type, 'general') AS board_type
       FROM boards WHERE slug = $1 AND is_visible = TRUE`,
      [params.slug]
    ),
    pool.query(
      `SELECT p.id, p.title, p.author_name, p.content,
              COALESCE(p.is_notice, FALSE) AS is_notice,
              p.view_count, p.member_id,
              bc.name AS category_name,
              TO_CHAR(p.created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI') AS created_at
       FROM posts p
       LEFT JOIN board_categories bc ON bc.id = p.category_id
       WHERE p.id = $1`,
      [params.postId]
    ),
  ]);

  const board = boardRes.rows[0];
  const post = postRes.rows[0];
  if (!board || !post) notFound();

  // personal 게시판 접근 제어
  const token = cookies().get(MEMBER_COOKIE)?.value;
  const member = token ? await verifyMemberToken(token) : null;

  if (board.board_type === "personal" && !post.is_notice) {
    if (!member || post.member_id !== member.id) notFound();
  }

  // 조회수 증가
  await pool.query(
    `UPDATE posts SET view_count = COALESCE(view_count, 0) + 1 WHERE id = $1`,
    [post.id]
  );

  // 댓글 로드
  let comments: Comment[] = [];
  if (board.use_comment) {
    const { rows } = await pool.query(
      `SELECT id, parent_id, author_name, author_type, author_id, content,
              TO_CHAR(created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI') AS created_at
       FROM comments
       WHERE post_id = $1
       ORDER BY COALESCE(parent_id, id) ASC, id ASC`,
      [post.id]
    );
    comments = rows;
  }

  const isMyPost = member && post.member_id === member.id;

  return (
    <div className="py-10 sm:py-14">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        {/* 헤더 */}
        <div>
          <Link
            href={`/community/${params.slug}`}
            className="inline-flex items-center gap-1 text-sm text-brand-muted hover:text-brand-green mb-4 transition-colors"
          >
            <ChevronLeft size={15} /> {board.name}
          </Link>

          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {post.is_notice && (
                  <span className="shrink-0 text-xs bg-brand-green text-white px-2 py-0.5 rounded font-medium">
                    공지
                  </span>
                )}
                {post.category_name && (
                  <span className="shrink-0 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {post.category_name}
                  </span>
                )}
                <h1 className="text-xl font-bold text-brand-text">{post.title}</h1>
              </div>
              <p className="text-sm text-brand-muted">
                {post.author_name} · {post.created_at} · 조회 {(post.view_count ?? 0) + 1}
              </p>
            </div>

            {/* 본인 글 수정/삭제 */}
            {isMyPost && (
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/community/${params.slug}/${post.id}/edit`}
                  className="inline-flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-700 border border-blue-200 hover:border-blue-400 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Pencil size={12} /> 수정
                </Link>
                <PublicPostDeleteButton
                  postId={post.id}
                  title={post.title}
                  slug={params.slug}
                />
              </div>
            )}
          </div>
        </div>

        {/* 게시물 내용 */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        {/* 댓글 */}
        {board.use_comment && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <PublicCommentSection
              postId={post.id}
              memberId={member?.id ?? null}
              initialComments={comments}
            />
          </div>
        )}

        {/* 목록으로 */}
        <div>
          <Link
            href={`/community/${params.slug}`}
            className="inline-flex items-center gap-1 text-sm text-brand-muted hover:text-brand-green transition-colors"
          >
            <ChevronLeft size={15} /> 목록으로
          </Link>
        </div>
      </div>
    </div>
  );
}
