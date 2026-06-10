"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

interface ConditionalShellProps {
  children: React.ReactNode;
  memberName?: string | null;
}

export default function ConditionalShell({ children, memberName }: ConditionalShellProps) {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <>
      <Header memberName={memberName} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
