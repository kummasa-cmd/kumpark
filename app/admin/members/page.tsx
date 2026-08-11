import type { Metadata } from "next";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import pool from "@/lib/db";
import { ensureMemberColumns } from "@/lib/ensure-tables";
import MemberDeleteButton from "@/components/admin/MemberDeleteButton";
import Pagination from "@/components/admin/Pagination";

export const metadata: Metadata = { title: "회원목록" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 15;

export default async function MembersPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  await ensureMemberColumns();

  const { rows: countRows } = await pool.query(`SELECT COUNT(*)::int AS count FROM members`);
  const total = countRows[0].count;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1), totalPages);
  const offset = (page - 1) * PAGE_SIZE;

  const { rows } = await pool.query(
    `SELECT id, name, nickname, email, phone, status, sms_yn, email_yn, coaching_yn,
           TO_CHAR(created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD') AS created_at
    FROM members
    ORDER BY created_at DESC, id DESC
    LIMIT $1 OFFSET $2`,
    [PAGE_SIZE, offset]
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">회원목록</h1>
          <p className="text-sm text-gray-500 mt-0.5">총 {total}명의 회원이 있습니다.</p>
        </div>
        <Link
          href="/admin/members/new"
          className="inline-flex items-center gap-2 bg-brand-green text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-800 transition-colors"
        >
          <UserPlus size={15} /> 회원등록
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 border-b border-gray-100">
                <th className="text-left px-5 py-3 font-medium w-10">번호</th>
                <th className="text-left px-5 py-3 font-medium">이름</th>
                <th className="text-left px-5 py-3 font-medium hidden lg:table-cell">닉네임</th>
                <th className="text-left px-5 py-3 font-medium hidden md:table-cell">이메일</th>
                <th className="text-left px-5 py-3 font-medium hidden lg:table-cell">연락처</th>
                <th className="text-left px-5 py-3 font-medium hidden lg:table-cell">가입일</th>
                <th className="text-left px-5 py-3 font-medium">상태</th>
                <th className="text-left px-5 py-3 font-medium hidden md:table-cell">SMS</th>
                <th className="text-left px-5 py-3 font-medium hidden md:table-cell">이메일</th>
                <th className="text-left px-5 py-3 font-medium hidden md:table-cell">코칭</th>
                <th className="text-left px-5 py-3 font-medium w-24">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((m, idx) => (
                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-gray-400 text-xs">{total - (offset + idx)}</td>
                  <td className="px-5 py-3">
                    <div className="font-medium text-gray-800">{m.name}</div>
                  </td>
                  <td className="px-5 py-3 text-gray-500 hidden lg:table-cell">{m.nickname || "-"}</td>
                  <td className="px-5 py-3 text-gray-500 hidden md:table-cell">{m.email}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs hidden lg:table-cell">{m.phone || "-"}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs hidden lg:table-cell">{m.created_at}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      m.status === "active"
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-600"
                    }`}>
                      {m.status === "active" ? "정상" : "정지"}
                    </span>
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      m.sms_yn === "Y"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-gray-100 text-gray-400"
                    }`}>
                      {m.sms_yn === "Y" ? "동의" : "거부"}
                    </span>
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      m.email_yn === "Y"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-gray-100 text-gray-400"
                    }`}>
                      {m.email_yn === "Y" ? "동의" : "거부"}
                    </span>
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      m.coaching_yn === "Y"
                        ? "bg-purple-50 text-purple-700"
                        : "bg-gray-100 text-gray-400"
                    }`}>
                      {m.coaching_yn === "Y" ? "Y" : "N"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/members/${m.id}`}
                        className="text-xs text-brand-green hover:underline"
                      >
                        수정
                      </Link>
                      <MemberDeleteButton id={m.id} name={m.name} />
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-5 py-8 text-center text-sm text-gray-400">
                    등록된 회원이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination currentPage={page} totalPages={totalPages} basePath="/admin/members" />
    </div>
  );
}
