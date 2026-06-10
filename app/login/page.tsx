import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { verifyMemberToken, MEMBER_COOKIE } from "@/lib/member-auth";
import LoginForm from "@/components/member/LoginForm";

export const metadata: Metadata = {
  title: "로그인",
  description: "검파크 회원 로그인 페이지입니다.",
};

export default async function LoginPage() {
  const token = cookies().get(MEMBER_COOKIE)?.value;
  const member = token ? await verifyMemberToken(token) : null;
  if (member) redirect("/mypage");

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-2xl font-bold text-brand-green tracking-tight">kumpark</p>
          <p className="text-sm text-gray-500 mt-1">회원 로그인</p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
