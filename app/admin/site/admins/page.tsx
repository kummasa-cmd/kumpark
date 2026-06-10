import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import pool from "@/lib/db";
import AdminDeleteButton from "@/components/admin/AdminDeleteButton";

export const metadata: Metadata = { title: "관리자관리" };
export const dynamic = "force-dynamic";

const ROLE_LABEL: Record<string, string> = { super: "최고관리자", admin: "관리자" };
const STATUS_LABEL: Record<string, string> = { active: "활성", inactive: "비활성" };

export default async function SiteAdminsPage() {
  const { rows } = await pool.query(
    `SELECT id, name, email, role, status, last_login_at
     FROM admins ORDER BY created_at ASC`
  );

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">관리자관리</h1>
          <p className="text-sm text-gray-500 mt-0.5">관리자 계정을 관리합니다.</p>
        </div>
        <Link
          href="/admin/site/admins/new"
          className="inline-flex items-center gap-2 bg-brand-green text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-800 transition-colors"
        >
          <ShieldCheck size={15} /> 관리자 추가
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 border-b border-gray-100">
                <th className="text-left px-5 py-3 font-medium">이름</th>
                <th className="text-left px-5 py-3 font-medium">이메일</th>
                <th className="text-left px-5 py-3 font-medium">권한</th>
                <th className="text-left px-5 py-3 font-medium hidden md:table-cell">최근 로그인</th>
                <th className="text-left px-5 py-3 font-medium">상태</th>
                <th className="text-left px-5 py-3 font-medium">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-800">{a.name}</td>
                  <td className="px-5 py-3 text-gray-500">{a.email}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      a.role === "super"
                        ? "bg-brand-green text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {ROLE_LABEL[a.role] ?? a.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs hidden md:table-cell">
                    {a.last_login_at
                      ? new Date(a.last_login_at).toLocaleDateString("ko-KR")
                      : "-"}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      a.status === "active"
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {STATUS_LABEL[a.status] ?? a.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/site/admins/${a.id}`}
                        className="text-xs text-brand-green hover:underline"
                      >
                        수정
                      </Link>
                      <AdminDeleteButton id={a.id} name={a.name} />
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-sm text-gray-400">
                    등록된 관리자가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
