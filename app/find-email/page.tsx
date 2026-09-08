import type { Metadata } from "next";
import FindEmailForm from "@/components/member/FindEmailForm";

export const metadata: Metadata = {
  title: "이메일 확인",
  description: "이름과 연락처로 검파크 회원 이메일을 확인합니다.",
};

export default function FindEmailPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-2xl font-bold text-brand-green tracking-tight">kumpark</p>
          <p className="text-sm text-gray-500 mt-1">이메일 확인</p>
        </div>
        <FindEmailForm />
      </div>
    </div>
  );
}
