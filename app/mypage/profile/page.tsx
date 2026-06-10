import type { Metadata } from "next";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifyMemberToken, MEMBER_COOKIE } from "@/lib/member-auth";
import { ensureMemberColumns } from "@/lib/ensure-tables";
import ProfileForm from "@/components/mypage/ProfileForm";

export const metadata: Metadata = { title: "회원정보 수정" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const token = cookies().get(MEMBER_COOKIE)?.value;
  const member = token ? await verifyMemberToken(token) : null;
  if (!member) return null;

  await ensureMemberColumns();

  const { rows } = await pool.query(
    `SELECT id, name, nickname, email, phone, status,
            blog_url, threads_url, instagram_url, x_url, brunch_url, youtube_url, homepage_url,
            sms_yn, email_yn
     FROM members WHERE id = $1`,
    [member.id]
  );

  if (!rows[0]) return null;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">회원정보 수정</h1>
        <p className="text-sm text-gray-500 mt-0.5">개인정보 및 비밀번호를 수정할 수 있습니다.</p>
      </div>
      <ProfileForm member={rows[0]} />
    </div>
  );
}
