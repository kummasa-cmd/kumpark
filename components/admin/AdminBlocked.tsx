"use client";

import { useRouter } from "next/navigation";

// 비활성화되었거나 삭제된 관리자 계정으로 접근했을 때 표시
export default function AdminBlocked() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center max-w-sm w-full">
        <h1 className="text-lg font-bold text-gray-900 mb-2">사용할 수 없는 관리자 계정입니다</h1>
        <p className="text-sm text-gray-500 mb-6">
          비활성화되었거나 삭제된 계정입니다. 최고관리자에게 문의하세요.
        </p>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full bg-brand-green text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-green-800 transition-colors"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}
