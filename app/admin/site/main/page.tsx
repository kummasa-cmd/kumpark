import type { Metadata } from "next";

export const metadata: Metadata = { title: "메인관리" };

export default function SiteMainPage() {
  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">메인관리</h1>
        <p className="text-sm text-gray-500 mt-0.5">메인 페이지의 노출 콘텐츠를 관리합니다.</p>
      </div>

      {/* Hero section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-800 pb-2 border-b border-gray-100">히어로 섹션</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">메인 제목</label>
          <input
            type="text"
            defaultValue="기록이 모여 브랜드가 됩니다"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">서브 텍스트</label>
          <textarea
            rows={3}
            defaultValue="베스트셀러 루틴의 설계 홍성호 작가입니다. 11권의 전자책을 썼고, 60권 이상의 전자책 출간을 코칭했습니다."
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">뱃지 텍스트</label>
          <input
            type="text"
            defaultValue="루틴의 설계 베스트셀러 작가"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors"
          />
        </div>
      </div>

      {/* Banner settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-800 pb-2 border-b border-gray-100">배너 설정</h2>
        {[
          { no: 1, src: "/images/my_banner1.png", label: "11권의 전자책 출간" },
          { no: 2, src: "/images/my_banner2.jpg", label: "60+ 전자책 코칭" },
          { no: 3, src: "/images/main_banner3.png", label: "없음" },
        ].map((b) => (
          <div key={b.no} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <span className="text-xs font-semibold text-gray-500 w-6">#{b.no}</span>
            <div className="flex-1">
              <p className="text-xs text-gray-400 mb-0.5">이미지</p>
              <p className="text-sm text-gray-700">{b.src}</p>
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-400 mb-0.5">텍스트</p>
              <p className="text-sm text-gray-700">{b.label}</p>
            </div>
            <button className="text-xs text-brand-green hover:underline flex-shrink-0">수정</button>
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">자동 전환 간격 (초)</label>
          <input
            type="number"
            defaultValue={10}
            min={3}
            max={60}
            className="w-32 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-green transition-colors"
          />
        </div>
      </div>

      <button className="bg-brand-green text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-green-800 transition-colors">
        저장하기
      </button>
    </div>
  );
}
