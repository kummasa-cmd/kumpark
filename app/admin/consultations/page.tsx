import type { Metadata } from "next";

export const metadata: Metadata = { title: "상담목록" };

const consultations = [
  { id: 1, name: "정수연", email: "jung@example.com", phone: "010-1111-2222", subject: "전자책 그룹 코칭 문의", message: "6월에 그룹 코칭 신청 가능한가요? 일정이 궁금합니다.", date: "2026-06-08", status: "미처리" },
  { id: 2, name: "최동욱", email: "choi2@example.com", phone: "010-3333-4444", subject: "종이책 코칭 문의", message: "종이책 코칭 비용과 일정이 궁금합니다. 전화 상담 가능한가요?", date: "2026-06-07", status: "미처리" },
  { id: 3, name: "강지민", email: "kang@example.com", phone: "010-5555-6666", subject: "개인 코칭 일정 문의", message: "7월 중에 1:1 코칭 시작하고 싶은데 자리가 있는지 확인 부탁드립니다.", date: "2026-06-06", status: "처리완료" },
  { id: 4, name: "한소희", email: "han@example.com", phone: "010-7777-8888", subject: "전자책 개인 코칭 가격 문의", message: "전자책 개인 코칭 진행 방식과 가격이 궁금합니다.", date: "2026-06-02", status: "처리완료" },
  { id: 5, name: "임재현", email: "im@example.com", phone: "010-9999-0000", subject: "코칭 후기 작성 문의", message: "코칭을 받고 싶은데 먼저 후기를 더 확인할 수 있을까요?", date: "2026-05-30", status: "처리완료" },
];

export default function ConsultationsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">상담목록</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          총 {consultations.length}건 · 미처리{" "}
          <span className="text-yellow-600 font-semibold">
            {consultations.filter((c) => c.status === "미처리").length}건
          </span>
        </p>
      </div>

      <div className="space-y-3">
        {consultations.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-semibold text-gray-900">{c.name}</span>
                  <span className="text-xs text-gray-400">{c.email}</span>
                  <span className="text-xs text-gray-400">{c.phone}</span>
                </div>
                <p className="text-sm font-medium text-gray-700 mb-1">{c.subject}</p>
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{c.message}</p>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    c.status === "미처리"
                      ? "bg-yellow-50 text-yellow-700"
                      : "bg-green-50 text-green-700"
                  }`}
                >
                  {c.status}
                </span>
                <p className="text-xs text-gray-400">{c.date}</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-50 flex gap-2">
              <button className="text-xs bg-brand-green text-white px-3 py-1.5 rounded-lg hover:bg-green-800 transition-colors">
                답변하기
              </button>
              {c.status === "미처리" && (
                <button className="text-xs border border-gray-200 text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                  처리완료
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
