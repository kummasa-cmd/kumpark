import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import ConditionalShell from "@/components/layout/ConditionalShell";
import { verifyMemberToken, MEMBER_COOKIE } from "@/lib/member-auth";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "검파크 | 기록이 모여 브랜드가 되는 공간",
    template: "%s | 검파크",
  },
  description:
    "루틴의 설계 베스트셀러 작가 홍성호의 공간. 전자책·종이책 코칭, 강의, 작가 브랜딩을 도와드립니다.",
  keywords: ["전자책 코칭", "종이책 코칭", "작가 코칭", "홍성호", "검파크", "kumpark", "루틴의 설계"],
  authors: [{ name: "홍성호" }],
  openGraph: {
    title: "검파크 | 기록이 모여 브랜드가 되는 공간",
    description:
      "루틴의 설계 베스트셀러 작가 홍성호의 공간. 전자책·종이책 코칭, 강의, 작가 브랜딩을 도와드립니다.",
    locale: "ko_KR",
    type: "website",
    siteName: "검파크",
  },
  twitter: {
    card: "summary_large_image",
    title: "검파크 | 기록이 모여 브랜드가 되는 공간",
    description: "루틴의 설계 베스트셀러 작가 홍성호의 공간. 작가 코칭, 전자책, 강의를 만나보세요.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const token = cookies().get(MEMBER_COOKIE)?.value;
  const member = token ? await verifyMemberToken(token) : null;

  return (
    <html lang="ko" className={inter.variable}>
      <head>
        <link
          rel="stylesheet"
          as="style"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        <ConditionalShell memberName={member?.name ?? null}>{children}</ConditionalShell>
      </body>
    </html>
  );
}
