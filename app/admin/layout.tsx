import type { Metadata } from "next";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import AdminShell from "@/components/admin/AdminShell";
import AdminBlocked from "@/components/admin/AdminBlocked";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/auth";
import { countAdminUnread } from "@/lib/messages";

export const metadata: Metadata = {
  title: { template: "%s | 관리자", default: "대시보드 | 관리자" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const token = cookies().get(COOKIE_NAME)?.value;
  const payload = token ? await verifyAdminToken(token) : null;

  // 토큰이 유효해도 DB에서 비활성화·삭제된 관리자는 즉시 차단
  let role = "admin";
  if (payload) {
    const { rows } = await pool.query<{ role: string; status: string }>(
      "SELECT role, status FROM admins WHERE id = $1",
      [payload.id]
    );
    if (!rows[0] || rows[0].status !== "active") return <AdminBlocked />;
    role = rows[0].role;
  }

  const unreadMessages = payload ? await countAdminUnread().catch(() => 0) : 0;

  return (
    <AdminShell role={role} unreadMessages={unreadMessages}>
      {children}
    </AdminShell>
  );
}
