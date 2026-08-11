"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, ClipboardList, HelpCircle, Settings, LayoutDashboard, BookOpen } from "lucide-react";

const navItems = [
  { href: "/mypage",               label: "대시보드", icon: LayoutDashboard, exact: true },
  { href: "/mypage/consultations", label: "상담",     icon: MessageSquare },
  { href: "/mypage/coachings",     label: "코칭내역", icon: ClipboardList },
  { href: "/mypage/inquiry",       label: "문의",     icon: HelpCircle },
  { href: "/mypage/coaching",      label: "코칭글",   icon: BookOpen, coachingOnly: true },
  { href: "/mypage/profile",       label: "설정",     icon: Settings },
];

export default function MypageMobileNav({ showCoaching }: { showCoaching: boolean }) {
  const pathname = usePathname();
  const visibleItems = navItems.filter((item) => !item.coachingOnly || showCoaching);

  return (
    <nav className="md:hidden flex border-b border-gray-100 mb-6 overflow-x-auto">
      {visibleItems.map((item) => {
        const Icon = item.icon;
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 px-4 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
              active
                ? "border-brand-green text-brand-green"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            <Icon size={18} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
