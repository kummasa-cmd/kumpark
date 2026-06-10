import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import pool from "@/lib/db";
import { ensureMemberColumns } from "@/lib/ensure-tables";
import MemberForm from "@/components/admin/MemberForm";

export const metadata: Metadata = { title: "회원수정" };
export const dynamic = "force-dynamic";

export default async function MemberEditPage({ params }: { params: { id: string } }) {
  await ensureMemberColumns();

  const { rows } = await pool.query(
    `SELECT id, name, nickname, email, phone, status, memo,
            blog_url, threads_url, instagram_url, x_url, brunch_url, youtube_url, homepage_url,
            sms_yn, email_yn
     FROM members WHERE id = $1`,
    [params.id]
  );
  if (!rows[0]) notFound();

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <Link
          href="/admin/members"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3"
        >
          <ChevronLeft size={15} /> 회원목록
        </Link>
        <h1 className="text-xl font-bold text-gray-900">회원수정</h1>
        <p className="text-sm text-gray-500 mt-0.5">{rows[0].name} 회원 정보를 수정합니다.</p>
      </div>
      <MemberForm member={rows[0]} />
    </div>
  );
}
