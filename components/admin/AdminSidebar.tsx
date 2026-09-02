"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  MessageSquare,
  BarChart2,
  Settings,
  ChevronDown,
  X,
} from "lucide-react";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  role: string;
}

type MenuItem = {
  id: string;
  label: string;
  icon: React.ElementType;
  href?: string;
  children?: { label: string; href: string }[];
};

const menuConfig: MenuItem[] = [
  { id: "home", label: "홈", icon: LayoutDashboard, href: "/admin" },
  {
    id: "members",
    label: "회원관리",
    icon: Users,
    children: [
      { label: "회원목록", href: "/admin/members" },
      { label: "회원등록", href: "/admin/members/new" },
    ],
  },
  {
    id: "products",
    label: "상품관리",
    icon: Package,
    children: [
      { label: "상품목록", href: "/admin/products" },
      { label: "상품등록", href: "/admin/products/new" },
    ],
  },
  {
    id: "coachings",
    label: "코칭관리",
    icon: ShoppingCart,
    children: [
      { label: "코칭목록", href: "/admin/coachings" },
      { label: "코칭등록", href: "/admin/coachings/new" },
      { label: "코칭일정", href: "/admin/coachings/schedule" },
      { label: "코칭 게시판", href: "/admin/coachings/board" },
    ],
  },
  {
    id: "consultations",
    label: "상담관리",
    icon: MessageSquare,
    children: [
      { label: "상담목록", href: "/admin/consultations" },
      { label: "1대1 문의", href: "/admin/inquiries" },
    ],
  },
  {
    id: "stats",
    label: "통계",
    icon: BarChart2,
    children: [
      { label: "회원가입현황", href: "/admin/stats/members" },
      { label: "상품판매현황", href: "/admin/stats/products" },
      { label: "상담현황", href: "/admin/stats/consultations" },
    ],
  },
  {
    id: "site",
    label: "사이트관리",
    icon: Settings,
    children: [
      { label: "메인관리", href: "/admin/site/main" },
      { label: "게시판관리", href: "/admin/site/boards" },
      { label: "관리자관리", href: "/admin/site/admins" },
    ],
  },
];

export default function AdminSidebar({ isOpen, onClose, role }: AdminSidebarProps) {
  const pathname = usePathname();
  const visibleMenu = menuConfig.filter((item) => !(item.id === "site" && role !== "super"));

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const item of visibleMenu) {
      if (item.children) {
        initial[item.id] = item.children.some((c) => pathname.startsWith(c.href));
      }
    }
    return initial;
  });

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-full z-30 w-56 bg-gray-900 text-white flex flex-col transform transition-transform duration-300 md:relative md:translate-x-0 md:flex-shrink-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Logo */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-gray-700 flex-shrink-0">
        <Link href="/admin" className="font-bold text-white text-base tracking-tight">
          kumpark
        </Link>
        <button
          className="md:hidden p-1 text-gray-400 hover:text-white"
          onClick={onClose}
          aria-label="메뉴 닫기"
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3">
        {visibleMenu.map((item) => {
          const Icon = item.icon;

          if (!item.children) {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href!}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-brand-green text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          }

          const isGroupActive = item.children.some((c) => pathname.startsWith(c.href));
          const groupOpen = openGroups[item.id];

          return (
            <div key={item.id}>
              <button
                onClick={() => toggleGroup(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  isGroupActive
                    ? "text-white bg-gray-800"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Icon size={16} />
                <span className="flex-1 text-left">{item.label}</span>
                <ChevronDown
                  size={13}
                  className={`transition-transform duration-200 ${groupOpen ? "rotate-180" : ""}`}
                />
              </button>
              {groupOpen && (
                <div className="ml-7 border-l border-gray-700 pl-3 py-1">
                  {item.children.map((child) => {
                    const isChildActive = pathname === child.href;
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={onClose}
                        className={`block py-1.5 px-2 text-xs rounded transition-colors ${
                          isChildActive
                            ? "text-green-400 font-semibold"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-700 px-4 py-3">
        <p className="text-xs text-gray-500">© 2026 kumpark</p>
      </div>
    </aside>
  );
}
