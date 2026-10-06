"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, LogOut, Mail } from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import UnreadMessageAlert from "@/components/messages/UnreadMessageAlert";

export default function AdminShell({
  children,
  role,
  unreadMessages,
}: {
  children: React.ReactNode;
  role: string;
  unreadMessages: number;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (pathname === "/admin/login") return <>{children}</>;

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <UnreadMessageAlert count={unreadMessages} href="/admin/messages" storageKey="kumpark_admin_unread_alerted" />
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} role={role} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-gray-200 h-14 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-1.5 rounded-md hover:bg-gray-100 text-gray-600"
              onClick={() => setSidebarOpen(true)}
              aria-label="메뉴 열기"
            >
              <Menu size={20} />
            </button>
            <span className="font-semibold text-gray-800 text-sm">kumpark 관리자</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/messages"
              className="relative p-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-brand-green transition-colors"
              aria-label={`쪽지목록 (확인하지 않은 쪽지 ${unreadMessages}개)`}
            >
              <Mail size={18} />
              {unreadMessages > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadMessages > 99 ? "99+" : unreadMessages}
                </span>
              )}
            </Link>
            <Link
              href="/"
              target="_blank"
              className="text-xs text-brand-green hover:underline hidden sm:inline"
            >
              사이트 보기 →
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-500 transition-colors px-2 py-1 rounded hover:bg-gray-100"
            >
              <LogOut size={13} />
              로그아웃
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
