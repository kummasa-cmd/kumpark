import type { Metadata } from "next";

export const metadata: Metadata = { title: "게시판관리" };

const boards = [
  { id: 1, name: "공지사항", slug: "notice", posts: 3, visible: true, order: 1 },
  { id: 2, name: "코칭 후기", slug: "review", posts: 8, visible: true, order: 2 },
  { id: 3, name: "글귀 나눔", slug: "quotes", posts: 15, visible: true, order: 3 },
  { id: 4, name: "자유 게시판", slug: "free", posts: 22, visible: true, order: 4 },
  { id: 5, name: "챌린지", slug: "challenge", posts: 5, visible: false, order: 5 },
];

export default function SiteBoardsPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">게시판관리</h1>
          <p className="text-sm text-gray-500 mt-0.5">커뮤니티 게시판의 설정을 관리합니다.</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-brand-green text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-800 transition-colors">
          게시판 추가
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 border-b border-gray-100">
                <th className="text-left px-5 py-3 font-medium">순서</th>
                <th className="text-left px-5 py-3 font-medium">게시판명</th>
                <th className="text-left px-5 py-3 font-medium">슬러그</th>
                <th className="text-left px-5 py-3 font-medium">게시물수</th>
                <th className="text-left px-5 py-3 font-medium">노출</th>
                <th className="text-left px-5 py-3 font-medium">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {boards.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-gray-400 text-xs">{b.order}</td>
                  <td className="px-5 py-3 font-medium text-gray-800">{b.name}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs font-mono">/community/{b.slug}</td>
                  <td className="px-5 py-3 text-gray-600">{b.posts}개</td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        b.visible ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {b.visible ? "노출" : "숨김"}
                    </span>
                  </td>
                  <td className="px-5 py-3 flex gap-2">
                    <button className="text-xs text-brand-green hover:underline">수정</button>
                    <button className="text-xs text-gray-400 hover:text-red-500">삭제</button>
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
