import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "상품소개",
  description: "전자책 코칭, 종이책 코칭 상품을 소개합니다. 기획부터 출간, 마케팅까지.",
};

const ebookItems = [
  "전자책 기획 (주제 선정, 목차 구성)",
  "작업 환경 설정 및 도구 안내",
  "초고 & 퇴고 방법",
  "플랫폼 등록 및 출간 방법",
  "출간 후 마케팅 & 작가 브랜딩",
];

const printItems = [
  "주제 및 목차 설계",
  "초고 & 퇴고 작성법",
  "원고 첨삭 지도",
  "출간 기획서 작성법",
  "주 1회 전화/온라인 줌 코치",
  "오프라인 코칭 4회",
  "기획에서 투고까지 5개월 밀착 과정",
];

export default function GoodsPage() {
  return (
    <div className="py-16 sm:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-brand-green uppercase tracking-widest mb-3">상품소개</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-brand-text mb-4">코칭 프로그램</h1>
          <p className="text-brand-muted">
            당신의 상황에 맞는 코칭을 선택하세요. 궁금한 점은 무료 상담으로 먼저 확인하실 수 있습니다.
          </p>
        </div>

        {/* E-book Coaching */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-brand-text mb-6 pb-3 border-b border-gray-200">
            전자책 코칭
          </h2>
          <div className="border border-gray-200 rounded-xl p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
              <div className="flex-1">
                <p className="text-xs font-semibold text-brand-green bg-green-50 px-2 py-0.5 rounded-full inline-block mb-3">
                  1대1 코칭
                </p>
                <h3 className="text-xl font-bold text-brand-text mb-1">전자책 코칭</h3>
                <p className="text-sm text-brand-muted mb-4">6주 과정 · 1대1 맞춤</p>
                <ul className="space-y-2">
                  {ebookItems.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-brand-text">
                      <CheckCircle size={16} className="text-brand-green flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="sm:text-right">
                <p className="text-2xl font-bold text-brand-green mb-1">상담 후 안내</p>
                <p className="text-xs text-brand-muted mb-6">6주 과정</p>
                <Link
                  href="/contact"
                  className="bg-brand-green text-white font-semibold px-6 py-3 rounded-lg hover:bg-green-800 transition-colors inline-flex items-center gap-2"
                >
                  상담 신청 <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Print book Coaching */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-brand-text mb-6 pb-3 border-b border-gray-200">
            종이책 코칭
          </h2>
          <div className="border border-gray-200 rounded-xl p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
              <div className="flex-1">
                <p className="text-xs font-semibold text-brand-green bg-green-50 px-2 py-0.5 rounded-full inline-block mb-3">
                  1대1 코칭
                </p>
                <h3 className="text-xl font-bold text-brand-text mb-1">종이책 출간 코칭</h3>
                <p className="text-sm text-brand-muted mb-4">5개월 밀착 과정 · 1대1</p>
                <ul className="space-y-2">
                  {printItems.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-brand-text">
                      <CheckCircle size={16} className="text-brand-green flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="sm:text-right">
                <p className="text-2xl font-bold text-brand-green mb-1">상담 후 안내</p>
                <p className="text-xs text-brand-muted mb-6">5개월 과정</p>
                <Link
                  href="/contact"
                  className="bg-brand-green text-white font-semibold px-6 py-3 rounded-lg hover:bg-green-800 transition-colors inline-flex items-center gap-2"
                >
                  상담 신청 <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ / Note */}
        <section className="bg-gray-50 rounded-2xl p-8 text-center">
          <h3 className="text-lg font-bold text-brand-text mb-2">어떤 코칭이 맞을지 모르겠나요?</h3>
          <p className="text-brand-muted text-sm mb-6">
            무료 상담을 통해 현재 상황과 목표를 공유해 주시면 가장 적합한 과정을 안내해 드립니다.
          </p>
          <Link
            href="/contact"
            className="bg-brand-green text-white font-semibold px-8 py-3 rounded-lg hover:bg-green-800 transition-colors inline-flex items-center gap-2"
          >
            무료 상담 신청 <ArrowRight size={16} />
          </Link>
        </section>
      </div>
    </div>
  );
}
