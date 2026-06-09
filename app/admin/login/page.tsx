import type { Metadata } from "next";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "관리자 로그인" };

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-2xl font-bold text-brand-green tracking-tight">kumpark</p>
          <p className="text-sm text-gray-500 mt-1">관리자 로그인</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
