import type { Metadata } from "next";
import Link from "next/link";
import { UserPlus } from "lucide-react";

export const metadata: Metadata = { title: "회원목록" };

const members = [
  { id: 1, name: "김철수", email: "kim@example.com", phone: "010-1234-5678", joinDate: "2026-06-08", status: "정상" },
  { id: 2, name: "이영희", email: "lee@example.com", phone: "010-2345-6789", joinDate: "2026-06-07", status: "정상" },
  { id: 3, name: "박민준", email: "park@example.com", phone: "010-3456-7890", joinDate: "2026-06-05", status: "정상" },
  { id: 4, name: "최수진", email: "choi@example.com", phone: "010-4567-8901", joinDate: "2026-05-28", status: "정상" },
  { id: 5, name: "정동현", email: "jung@example.com", phone: "010-5678-9012", joinDate: "2026-05-20", status: "정지" },
  { id: 6, name: "강지민", email: "kang@example.com", phone: "010-6789-0123", joinDate: "2026-05-15", status: "정상" },
  { id: 7, name: "오준혁", email: "oh@example.com", phone: "010-7890-1234", joinDate: "2026-05-10", status: "정상" },
];

export default function MembersPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">회원목록</h1>
          <p className="text-sm text-gray-500 mt-0.5">총 {members.length}명의 회원이 있습니다.</p>
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
                <th className="text-left px-5 py-3 font-medium">번호</th>
                <th className="text-left px-5 py-3 font-medium">이름</th>
                <th className="text-left px-5 py-3 font-medium">이메일</th>
                <th className="text-left px-5 py-3 font-medium hidden md:table-cell">연락처</th>
                <th className="text-left px-5 py-3 font-medium hidden md:table-cell">가입일</th>
                <th className="text-left px-5 py-3 font-medium">상태</th>
                <th className="text-left px-5 py-3 font-medium">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-gray-400 text-xs">{m.id}</td>
                  <td className="px-5 py-3 font-medium text-gray-800">{m.name}</td>
                  <td className="px-5 py-3 text-gray-600">{m.email}</td>
                  <td className="px-5 py-3 text-gray-500 hidden md:table-cell">{m.phone}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs hidden md:table-cell">{m.joinDate}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        m.status === "정상"
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <button className="text-xs text-brand-green hover:underline">수정</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
