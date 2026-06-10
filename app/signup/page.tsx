import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyMemberToken, MEMBER_COOKIE } from "@/lib/member-auth";
import SignupForm from "@/components/member/SignupForm";

export const metadata: Metadata = {
  title: "회원가입",
  description: "검파크 회원가입 페이지입니다.",
};

export default async function SignupPage() {
  const token = cookies().get(MEMBER_COOKIE)?.value;
  const member = token ? await verifyMemberToken(token) : null;
  if (member) redirect("/mypage");

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-2xl font-bold text-brand-green tracking-tight">kumpark</p>
          <p className="text-sm text-gray-500 mt-1">회원가입</p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
