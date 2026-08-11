import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { ChevronLeft } from "lucide-react";
import pool from "@/lib/db";
import { verifyMemberToken, MEMBER_COOKIE } from "@/lib/member-auth";
import { ensureMemberColumns } from "@/lib/ensure-tables";
import PublicPostForm from "@/components/community/PublicPostForm";

export const metadata: Metadata = { title: "코칭 게시판 글수정" };
export const dynamic = "force-dynamic";

export default async function EditCoachingPostPage({ params }: { params: { id: string } }) {
  const token = cookies().get(MEMBER_COOKIE)?.value;
  const member = token ? await verifyMemberToken(token) : null;
  if (!member) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 px-5 py-12 text-center text-sm text-gray-400">
        로그인이 필요합니다.
      </div>
    );
  }

  await ensureMemberColumns();
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
    `SELECT p.id, p.title, p.content, p.member_id
     FROM posts p
     JOIN boards b ON b.id = p.board_id
     WHERE p.id = $1 AND b.slug = 'coaching'`,
    [params.id]
  );
  const post = postRows[0];
  if (!post || post.member_id !== member.id) notFound();

  return (
    <div className="space-y-5">
      <div>
        <Link
          href={`/mypage/coaching/${post.id}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3"
        >
          <ChevronLeft size={15} /> 게시물로 돌아가기
        </Link>
        <h1 className="text-xl font-bold text-brand-text">글수정</h1>
      </div>
      <PublicPostForm slug="coaching" post={post} basePath="/mypage/coaching" />
    </div>
  );
}
