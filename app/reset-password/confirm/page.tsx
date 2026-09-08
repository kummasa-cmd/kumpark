import type { Metadata } from "next";
import { Suspense } from "react";
import ResetPasswordConfirmForm from "@/components/member/ResetPasswordConfirmForm";

export const metadata: Metadata = {
  title: "비밀번호 재설정",
  description: "새 비밀번호를 설정합니다.",
};

export default function ResetPasswordConfirmPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-2xl font-bold text-brand-green tracking-tight">kumpark</p>
          <p className="text-sm text-gray-500 mt-1">비밀번호 재설정</p>
        </div>
        <Suspense>
          <ResetPasswordConfirmForm />
        </Suspense>
      </div>
    </div>
  );
}
