import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "검파크소개",
  description:
    "루틴의 설계 베스트셀러 작가 홍성호의 작품 활동과 경력을 소개합니다. 12권 전자책, 1권 종이책 출간.",
};

// TODO: link에 실제 판매 페이지 URL을 채워주세요. 비어있으면 링크가 표시되지 않습니다.
const printBook = {
  publisher: "모모북스",
  date: "2025.08",
  title: "루틴의 설계",
  genre: "자기계발",
  badge: "베스트셀러",
  link: "https://product.kyobobook.co.kr/detail/S000217241447",
};

const ebooks = [
  { year: "2024.03", title: "3달만에 0에서 5천 인플루언서 블로거가 되는 법", genre: "자기계발", link: "https://www.yes24.com/Product/Goods/125234464" },
  { year: "2024.03", title: "평범한 블로거를 3달 만에 베스트셀러작가로 만든 비결", genre: "자기계발", link: "https://www.yes24.com/Product/Goods/125713878" },
  { year: "2024.05", title: "B형 남자", genre: "에세이", link: "https://www.yes24.com/Product/Goods/126468407" },
  { year: "2024.07", title: "극복하지 못해도 괜찮아", genre: "자기계발", link: "https://www.yes24.com/Product/Goods/128739566" },
  { year: "2024.09", title: "50대에 시작하는 SNS", genre: "자기계발", link: "https://www.yes24.com/Product/Goods/133869955" },
  { year: "2024.12", title: "블로그 1년, 두근거리는 인생 2막의 시작", genre: "자기계발", link: "https://www.yes24.com/Product/Goods/140244236" },
  { year: "2025.02", title: "글쓰기 초보를 위한 SNS 글감 찾기", genre: "자기계발", link: "https://www.yes24.com/Product/Goods/142703098" },
  { year: "2025.09", title: "한 번뿐인 인생을 깨우는 5가지 키워드", genre: "자기계발", link: "https://www.yes24.com/product/goods/155075285" },
  { year: "2025.12", title: "꾸준함 관리 비법", genre: "자기계발", link: "https://www.yes24.com/product/goods/167782427" },
  { year: "2026.01", title: "코드를 짜던 사람이 삶을 기록하기 시작했다", genre: "에세이", link: "https://www.yes24.com/product/goods/155075285" },
  { year: "2026.05", title: "오십, 내 인생은 아직 끝나지 않았다", genre: "자기계발", link: "https://www.yes24.com/product/goods/177256726" },
  { year: "2026.08", title: "매일 한 줄이 인생을 바꾼다", genre: "자기계발", link: "https://www.yes24.com/product/goods/194645680" },
];

export default function AboutPage() {
  return (
    <div className="py-16 sm:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* Profile */}
        <section className="mb-16 flex flex-col sm:flex-row gap-10 items-center sm:items-start">
          <div className="w-40 h-40 flex-shrink-0 relative rounded-2xl overflow-hidden">
            <Image
              src="/images/profile_img2.png"
              alt="홍성호 프로필 사진"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div>
            <p className="text-xs font-semibold text-brand-green uppercase tracking-widest mb-2">검마사</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-brand-text mb-4">홍성호</h1>
            <p className="text-brand-muted leading-relaxed">
              IT 개발자로 20년을 살다가 50대에 글을 쓰기 시작했습니다. 블로그 하나로 인플루언서가 되고,
              전자책 11권을 출간했으며, 2025년에는 종이책 <strong>루틴의 설계</strong>를
              모모북스에서 출간했습니다. 지금은 책을 쓰고 싶은 분들을 코칭하며, 기록이 브랜드가 되는
              여정을 함께하고 있습니다.
            </p>
          </div>
        </section>

        {/* Print book */}
        <section className="mb-16">
          <h2 className="text-xl font-bold text-brand-text mb-6 pb-3 border-b border-gray-200">
            종이책
          </h2>
          <div className="bg-green-50 rounded-xl p-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-brand-muted mb-1">{printBook.publisher} · {printBook.date}</p>
              <p className="text-lg font-bold text-brand-text">{printBook.title}</p>
              <p className="text-sm text-brand-muted mt-1">{printBook.genre}</p>
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <div className="text-brand-green font-bold text-sm px-3 py-1 bg-white rounded-full border border-green-200">
                {printBook.badge}
              </div>
              {printBook.link && (
                <a
                  href={printBook.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-brand-green hover:underline"
                >
                  구매하기 <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>
        </section>

        {/* E-books */}
        <section className="mb-16">
          <h2 className="text-xl font-bold text-brand-text mb-6 pb-3 border-b border-gray-200">
            전자책 ({ebooks.length}권)
          </h2>
          <div className="space-y-3">
            {ebooks.map((book, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 py-3 border-b border-gray-100 last:border-0"
              >
                <span className="text-xs text-brand-muted mt-0.5 w-16 flex-shrink-0">{book.year}</span>
                <div className="flex-1">
                  {book.link ? (
                    <a
                      href={book.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-brand-text hover:text-brand-green hover:underline inline-flex items-center gap-1"
                    >
                      {book.title} <ExternalLink size={12} className="flex-shrink-0" />
                    </a>
                  ) : (
                    <p className="text-sm font-medium text-brand-text">{book.title}</p>
                  )}
                </div>
                <span className="text-xs text-brand-muted bg-gray-50 px-2 py-0.5 rounded-full flex-shrink-0">
                  {book.genre}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center bg-gray-50 rounded-2xl p-10">
          <h3 className="text-xl font-bold text-brand-text mb-3">코칭이 궁금하신가요?</h3>
          <p className="text-brand-muted mb-6">무료 상담으로 당신에게 맞는 코칭을 찾아보세요.</p>
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
