"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  MessageSquare,
  ShoppingBag,
  HelpCircle,
  Settings,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/mypage",               label: "대시보드",      icon: LayoutDashboard, exact: true },
  { href: "/mypage/consultations", label: "상담 내역",     icon: MessageSquare },
  { href: "/mypage/orders",        label: "주문 내역",     icon: ShoppingBag },
  { href: "/mypage/inquiry",       label: "1대1 문의",     icon: HelpCircle },
  { href: "/mypage/profile",       label: "회원정보 수정", icon: Settings },
];

interface Props {
  memberName: string;
}

export default function MypageSidebar({ memberName }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  const isActive = (item: typeof navItems[0]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <aside className="w-56 shrink-0">
      {/* 사용자 정보 */}
      <div className="bg-brand-green rounded-xl px-4 py-5 text-white mb-4">
        <p className="text-xs text-green-200 mb-0.5">환영합니다</p>
        <p className="font-bold text-base truncate">{memberName}</p>
        <p className="text-xs text-green-200 mt-0.5">회원님</p>
      </div>

      {/* 메뉴 */}
      <nav className="space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-brand-green text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
        >
          <LogOut size={16} />
          로그아웃
        </button>
      </nav>
    </aside>
  );
}
