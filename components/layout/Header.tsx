"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X, User, LogOut } from "lucide-react";

const navLinks = [
  { href: "/about", label: "검파크소개" },
  { href: "/goods", label: "상품소개" },
  { href: "/community", label: "커뮤니티" },
  { href: "/contact", label: "무료상담" },
];

interface HeaderProps {
  memberName?: string | null;
}

export default function Header({ memberName }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
    setLoggingOut(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-brand-green tracking-tight">
          kumpark
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium transition-colors hover:text-brand-green ${
                pathname === href ? "text-brand-green" : "text-brand-text"
              }`}
            >
              {label}
            </Link>
          ))}

          {memberName ? (
            <div className="flex items-center gap-3">
              <Link
                href="/mypage"
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-brand-green ${
                  pathname.startsWith("/mypage") ? "text-brand-green" : "text-brand-text"
                }`}
              >
                <User size={15} />
                마이페이지
              </Link>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <LogOut size={14} />
                로그아웃
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-sm font-medium text-brand-text hover:text-brand-green transition-colors"
              >
                로그인
              </Link>
              <Link
                href="/contact"
                className="bg-brand-green text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-green-800 transition-colors"
              >
                코칭 신청
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 text-brand-text"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="메뉴 열기"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-4">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium py-1 transition-colors hover:text-brand-green ${
                pathname === href ? "text-brand-green" : "text-brand-text"
              }`}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}

          {memberName ? (
            <>
              <Link
                href="/mypage"
                className="flex items-center gap-2 text-sm font-medium text-brand-text hover:text-brand-green py-1"
                onClick={() => setMenuOpen(false)}
              >
                <User size={15} />
                마이페이지
              </Link>
              <button
                onClick={() => { setMenuOpen(false); handleLogout(); }}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 py-1 text-left"
              >
                <LogOut size={14} />
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium py-1 text-brand-text hover:text-brand-green"
                onClick={() => setMenuOpen(false)}
              >
                로그인
              </Link>
              <Link
                href="/contact"
                className="bg-brand-green text-white text-sm font-medium px-4 py-2 rounded-md text-center hover:bg-green-800 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                코칭 신청
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
