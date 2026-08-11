import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { ChevronLeft } from "lucide-react";
import pool from "@/lib/db";
import { verifyMemberToken, MEMBER_COOKIE } from "@/lib/member-auth";
import { ensureMemberColumns } from "@/lib/ensure-tables";
import PublicPostForm from "@/components/community/PublicPostForm";

export const metadata: Metadata = { title: "코칭 게시판 글쓰기" };
export const dynamic = "force-dynamic";

export default async function NewCoachingPostPage() {
  const token = cookies().get(MEMBER_COOKIE)?.value;
  const member = token ? await verifyMemberToken(token) : null;

  await ensureMemberColumns();
  const rows = member
    ? (await pool.query(`SELECT coaching_yn FROM members WHERE id = $1`, [member.id])).rows
    : [];

  if (!member || rows[0]?.coaching_yn !== "Y") {
    return (
      <div className="bg-white rounded-xl border border-gray-100 px-5 py-12 text-center text-sm text-gray-400">
        코칭 신청 회원만 이용할 수 있는 게시판입니다.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/mypage/coaching"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3"
        >
          <ChevronLeft size={15} /> 코칭 게시판
        </Link>
        <h1 className="text-xl font-bold text-brand-text">글쓰기</h1>
      </div>
      <PublicPostForm slug="coaching" basePath="/mypage/coaching" />
    </div>
  );
}
