import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { COOKIE_NAME } from "@/lib/auth";

const secret = () => new TextEncoder().encode(process.env.JWT_SECRET!);

// 로그인 없이 호출 가능한 관리자 API
const PUBLIC_ADMIN_APIS = ["/api/admin/login", "/api/admin/logout"];

// 최고관리자(super)만 접근 가능한 경로
const SUPER_ONLY_PAGES = ["/admin/site"];
const SUPER_ONLY_APIS = ["/api/admin/admins", "/api/admin/site-settings"];

const matchesPrefix = (pathname: string, prefixes: string[]) =>
  prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith("/api/");

  if (pathname === "/admin/login" || PUBLIC_ADMIN_APIS.includes(pathname)) {
    return NextResponse.next();
  }

  const unauthorized = () => {
    if (isApi) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const res = NextResponse.redirect(new URL("/admin/login", request.url));
    res.cookies.delete(COOKIE_NAME);
    return res;
  };

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return unauthorized();

  try {
    const { payload } = await jwtVerify(token, secret());
    // 회원 토큰과 같은 secret을 쓰므로 관리자 토큰에만 있는 role로 구분
    if (typeof payload.role !== "string") return unauthorized();

    const superOnly = matchesPrefix(pathname, isApi ? SUPER_ONLY_APIS : SUPER_ONLY_PAGES);

    if (superOnly && payload.role !== "super") {
      if (isApi) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.next();
  } catch {
    return unauthorized();
  }
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
