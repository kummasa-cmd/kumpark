import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = { title: "관리자관리" };

const admins = [
  { id: 1, name: "홍성호", email: "kummasa@naver.com", role: "최고관리자", lastLogin: "2026-06-09", status: "활성" },
];

export default function SiteAdminsPage() {
  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">관리자관리</h1>
          <p className="text-sm text-gray-500 mt-0.5">관리자 계정을 관리합니다.</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-brand-green text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-800 transition-colors">
          <ShieldCheck size={15} /> 관리자 추가
        </button>
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
              {admins.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-800">{a.name}</td>
                  <td className="px-5 py-3 text-gray-500">{a.email}</td>
                  <td className="px-5 py-3">
                    <span className="text-xs bg-brand-green text-white px-2 py-0.5 rounded-full">
                      {a.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs hidden md:table-cell">{a.lastLogin}</td>
                  <td className="px-5 py-3">
                    <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                      {a.status}
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

      {/* Password change */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-800 pb-2 border-b border-gray-100">비밀번호 변경</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">현재 비밀번호</label>
          <input
            type="password"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">새 비밀번호</label>
          <input
            type="password"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">새 비밀번호 확인</label>
          <input
            type="password"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors"
          />
        </div>
        <button className="bg-brand-green text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-green-800 transition-colors">
          변경하기
        </button>
      </div>
    </div>
  );
}
