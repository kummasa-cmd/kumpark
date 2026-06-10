import type { Metadata } from "next";
import { cookies } from "next/headers";
import AdminShell from "@/components/admin/AdminShell";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/auth";

export const metadata: Metadata = {
  title: { template: "%s | 관리자", default: "대시보드 | 관리자" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const token = cookies().get(COOKIE_NAME)?.value;
  const payload = token ? await verifyAdminToken(token) : null;
  const role = (payload?.role ?? "admin") as string;

  return <AdminShell role={role}>{children}</AdminShell>;
}
