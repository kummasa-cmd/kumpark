import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ChevronLeft } from "lucide-react";
import pool from "@/lib/db";
import { verifyMemberToken, MEMBER_COOKIE } from "@/lib/member-auth";
import PublicPostForm from "@/components/community/PublicPostForm";

export const metadata: Metadata = { title: "게시물 수정" };

export default async function EditPostPage({
  params,
}: {
  params: { slug: string; postId: string };
}) {
  if (params.slug === "coaching") redirect(`/mypage/coaching/${params.postId}`);

  const token = cookies().get(MEMBER_COOKIE)?.value;
  const member = token ? await verifyMemberToken(token) : null;
  if (!member) redirect(`/login?redirect=/community/${params.slug}/${params.postId}/edit`);

  const { rows: boardRows } = await pool.query(
    "SELECT id, name FROM boards WHERE slug = $1 AND is_visible = TRUE",
    [params.slug]
  );
  const board = boardRows[0];
  if (!board) notFound();

  const { rows: postRows } = await pool.query(
    "SELECT id, title, content, member_id FROM posts WHERE id = $1 AND board_id = $2",
    [params.postId, board.id]
  );
  const post = postRows[0];
  if (!post || post.member_id !== member.id) notFound();

  return (
    <div className="py-10 sm:py-14">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        <div>
          <Link
            href={`/community/${params.slug}/${params.postId}`}
            className="inline-flex items-center gap-1 text-sm text-brand-muted hover:text-brand-green mb-4 transition-colors"
          >
            <ChevronLeft size={15} /> 게시물로 돌아가기
          </Link>
          <h1 className="text-xl font-bold text-brand-text">게시물 수정</h1>
        </div>
        <PublicPostForm slug={params.slug} post={post} />
      </div>
    </div>
  );
}
