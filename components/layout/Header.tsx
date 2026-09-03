"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X, User, LogOut, ChevronDown } from "lucide-react";

const navLinks = [
  { href: "/about", label: "검파크소개" },
  {
    label: "상품소개",
    children: [
      { href: "/goods/ebook", label: "전자책 코칭" },
      { href: "/goods/print", label: "종이책 코칭" },
    ],
  },
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
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState(false);

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
          {navLinks.map((link) =>
            link.children ? (
              <div key={link.label} className="relative group">
                <button
                  className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-brand-green ${
                    pathname.startsWith("/goods") ? "text-brand-green" : "text-brand-text"
                  }`}
                >
                  {link.label}
                  <ChevronDown size={14} />
                </button>
                <div className="absolute left-0 top-full pt-2 hidden group-hover:block">
                  <div className="bg-white border border-gray-100 rounded-lg shadow-lg py-2 w-40">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`block px-4 py-2 text-sm transition-colors hover:text-brand-green hover:bg-gray-50 ${
                          pathname === child.href ? "text-brand-green" : "text-brand-text"
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-brand-green ${
                  pathname === link.href ? "text-brand-green" : "text-brand-text"
                }`}
              >
                {link.label}
              </Link>
            )
          )}

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
          {navLinks.map((link) =>
            link.children ? (
              <div key={link.label}>
                <button
                  onClick={() => setMobileSubmenuOpen((prev) => !prev)}
                  className={`flex items-center justify-between w-full text-sm font-medium py-1 transition-colors hover:text-brand-green ${
                    pathname.startsWith("/goods") ? "text-brand-green" : "text-brand-text"
                  }`}
                >
                  {link.label}
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${mobileSubmenuOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {mobileSubmenuOpen && (
                  <div className="mt-2 ml-3 flex flex-col gap-3 border-l border-gray-100 pl-3">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`text-sm py-1 transition-colors hover:text-brand-green ${
                          pathname === child.href ? "text-brand-green" : "text-brand-muted"
                        }`}
                        onClick={() => {
                          setMenuOpen(false);
                          setMobileSubmenuOpen(false);
                        }}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium py-1 transition-colors hover:text-brand-green ${
                  pathname === link.href ? "text-brand-green" : "text-brand-text"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            )
          )}

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
            <Link
              href="/login"
              className="text-sm font-medium py-1 text-brand-text hover:text-brand-green"
              onClick={() => setMenuOpen(false)}
            >
              로그인
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
