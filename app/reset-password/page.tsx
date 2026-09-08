import type { Metadata } from "next";
import ResetPasswordRequestForm from "@/components/member/ResetPasswordRequestForm";

export const metadata: Metadata = {
  title: "비밀번호 찾기",
  description: "가입하신 이메일로 비밀번호 재설정 링크를 보내드립니다.",
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-2xl font-bold text-brand-green tracking-tight">kumpark</p>
          <p className="text-sm text-gray-500 mt-1">비밀번호 찾기</p>
        </div>
        <ResetPasswordRequestForm />
      </div>
    </div>
  );
}
