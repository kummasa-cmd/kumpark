import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { ChevronLeft, Pencil } from "lucide-react";
import pool from "@/lib/db";
import { verifyMemberToken, MEMBER_COOKIE } from "@/lib/member-auth";
import { ensureCategoryTables, ensurePostMemberCol, ensureMemberColumns, ensurePostAdminReply } from "@/lib/ensure-tables";
import PublicCommentSection, { type Comment } from "@/components/community/PublicCommentSection";
import PublicPostDeleteButton from "@/components/community/PublicPostDeleteButton";

export const metadata: Metadata = { title: "코칭 게시판" };
export const dynamic = "force-dynamic";

export default async function MyCoachingPostPage({ params }: { params: { id: string } }) {
  await ensureCategoryTables();
  await ensurePostMemberCol();
  await ensureMemberColumns();
  await ensurePostAdminReply();

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
      <div className="bg-white rounded-xl border border-gray-100 px-5 py-12 text-center text-sm text-gray-400">
        코칭 신청 회원만 이용할 수 있는 게시판입니다.
      </div>
    );
  }

  const { rows: postRows } = await pool.query(
    `SELECT p.id, p.title, p.author_name, p.content, p.member_id, p.admin_reply,
            TO_CHAR(p.created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI') AS created_at,
            TO_CHAR(p.admin_replied_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI') AS admin_replied_at
     FROM posts p
     JOIN boards b ON b.id = p.board_id
     WHERE p.id = $1 AND b.slug = 'coaching'`,
    [params.id]
  );
  const post = postRows[0];
  if (!post || post.member_id !== member.id) notFound();

  const { rows: comments } = await pool.query<Comment>(
    `SELECT id, parent_id, author_name, author_type, author_id, content,
            TO_CHAR(created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI') AS created_at
     FROM comments
     WHERE post_id = $1
     ORDER BY COALESCE(parent_id, id) ASC, id ASC`,
    [post.id]
  );

  const answered = !!post.admin_reply;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/mypage/coaching"
          className="inline-flex items-center gap-1 text-sm text-brand-muted hover:text-brand-green mb-4 transition-colors"
        >
          <ChevronLeft size={15} /> 코칭 게시판
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${
                answered ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"
              }`}>
                {answered ? "답변완료" : "답변대기"}
              </span>
              <h1 className="text-xl font-bold text-brand-text">{post.title}</h1>
            </div>
            <p className="text-sm text-brand-muted">
              {post.author_name} · {post.created_at}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/mypage/coaching/${post.id}/edit`}
              className="inline-flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-700 border border-blue-200 hover:border-blue-400 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Pencil size={12} /> 수정
            </Link>
            <PublicPostDeleteButton
              postId={post.id}
              title={post.title}
              slug="coaching"
              basePath="/mypage/coaching"
            />
          </div>
        </div>
      </div>

      {/* 게시물 내용 */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>

      {/* 관리자 답변 */}
      {answered && (
        <div className="bg-green-50 rounded-xl border border-green-100 p-6">
          <p className="text-xs font-semibold text-green-700 mb-2">
            관리자 답변 · {post.admin_replied_at}
          </p>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {post.admin_reply}
          </p>
        </div>
      )}

      {/* 댓글 */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <PublicCommentSection
          postId={post.id}
          memberId={member.id}
          initialComments={comments}
        />
      </div>

      <div>
        <Link
          href="/mypage/coaching"
          className="inline-flex items-center gap-1 text-sm text-brand-muted hover:text-brand-green transition-colors"
        >
          <ChevronLeft size={15} /> 목록으로
        </Link>
      </div>
    </div>
  );
}
