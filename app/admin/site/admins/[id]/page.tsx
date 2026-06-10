import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import pool from "@/lib/db";
import AdminForm from "@/components/admin/AdminForm";

export const metadata: Metadata = { title: "관리자 수정" };
export const dynamic = "force-dynamic";

export default async function AdminEditPage({ params }: { params: { id: string } }) {
  const { rows } = await pool.query(
    `SELECT id, name, email, role, status FROM admins WHERE id = $1`,
    [params.id]
  );

  if (!rows[0]) notFound();

  const admin = rows[0] as {
    id: number;
    name: string;
    email: string;
    role: "super" | "admin";
    status: "active" | "inactive";
  };

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/admin/site/admins"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3"
        >
          <ChevronLeft size={15} /> 관리자 목록
        </Link>
        <h1 className="text-xl font-bold text-gray-900">관리자 수정</h1>
        <p className="text-sm text-gray-500 mt-0.5">{admin.name} 계정 정보를 수정합니다.</p>
      </div>
      <AdminForm admin={admin} />
    </div>
  );
}
