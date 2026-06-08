import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, Users, BookMarked } from "lucide-react";
import BannerCarousel from "@/components/main/BannerCarousel";

export const metadata: Metadata = {
  title: "검파크 | 기록이 모여 브랜드가 되는 공간",
  description:
    "루틴의 설계 베스트셀러 작가 홍성호입니다. 11권의 전자책, 60권 이상의 코칭 경험으로 당신의 작가 꿈을 도와드립니다.",
};

const featuredProducts = [
  {
    icon: Users,
    title: "전자책 그룹 코칭",
    description:
      "6주 과정으로 기획부터 출간, 마케팅까지 함께합니다. 같은 목표를 가진 동료들과 함께 성장하세요.",
    price: "₩150,000",
    period: "6주 과정",
    href: "/goods",
  },
  {
    icon: BookOpen,
    title: "전자책 개인 코칭",
    description:
      "1대1 맞춤 코칭으로 나만의 전자책을 완성합니다. 기획, 초고, 퇴고, 출간, 마케팅을 밀착 지원합니다.",
    price: "상담 후 안내",
    period: "6주 과정",
    href: "/goods",
  },
  {
    icon: BookMarked,
    title: "종이책 1대1 코칭",
    description:
      "꿈꾸던 종이책 출간을 현실로. 주 1회 코치 + 오프라인 4회로 기획에서 투고까지 5개월 밀착 과정입니다.",
    price: "상담 후 안내",
    period: "5개월 과정",
    href: "/goods",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-white py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="inline-block bg-brand-yellow text-brand-text text-xs font-semibold px-3 py-1 rounded-full mb-6">
            루틴의 설계 베스트셀러 작가
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-brand-text leading-tight tracking-tight mb-6">
            기록이 모여
            <br />
            <span className="text-brand-green">브랜드가 됩니다</span>
          </h1>
          <p className="text-lg sm:text-xl text-brand-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            베스트셀러 루틴의 설계 홍성호 작가입니다. 
	    <br className="hidden sm:block" />
	    11권의 전자책을 썼고, 60권 이상의 전자책 출간을 코칭했습니다.
            <br className="hidden sm:block" />
	    1대 1 맞춤형 종이책 코칭도 진행 중입니다.
	    <br className="hidden sm:block" />
            당신의 작가 꿈을 이룰 수 있도록 함께하겠습니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/goods"
              className="bg-brand-green text-white font-semibold px-8 py-3 rounded-lg hover:bg-green-800 transition-colors inline-flex items-center justify-center gap-2"
            >
              상품 보기 <ArrowRight size={18} />
            </Link>
            <Link
              href="/contact"
              className="border border-gray-300 text-brand-text font-semibold px-8 py-3 rounded-lg hover:border-brand-green hover:text-brand-green transition-colors inline-flex items-center justify-center"
            >
              무료 상담 신청
            </Link>
          </div>
        </div>
      </section>

      {/* Banner Carousel */}
      <BannerCarousel />

      {/* Featured Products */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-brand-text mb-3">대표 상품</h2>
            <p className="text-brand-muted">당신에게 맞는 코칭을 선택하세요</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {featuredProducts.map((product) => {
              const Icon = product.icon;
              return (
                <div
                  key={product.title}
                  className="border border-gray-200 rounded-xl p-6 hover:border-brand-green hover:shadow-sm transition-all flex flex-col"
                >
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-4">
                    <Icon size={20} className="text-brand-green" />
                  </div>
                  <h3 className="text-lg font-bold text-brand-text mb-2">{product.title}</h3>
                  <p className="text-sm text-brand-muted leading-relaxed flex-1">{product.description}</p>
                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-brand-muted">{product.period}</p>
                      <p className="text-base font-bold text-brand-green">{product.price}</p>
                    </div>
                    <Link
                      href={product.href}
                      className="text-sm font-medium text-brand-green hover:underline inline-flex items-center gap-1"
                    >
                      자세히 <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About snippet */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <p className="text-xs font-semibold text-brand-green uppercase tracking-widest mb-3">About</p>
            <h2 className="text-3xl font-bold text-brand-text mb-4">검마사 홍성호</h2>
            <p className="text-brand-muted leading-relaxed mb-6">
              &ldquo;검파크&rdquo;는 기록이 모여 브랜드가 되는 공간입니다. 전직 IT 개발자에서 베스트셀러
              작가로, 그 경험을 바탕으로 책을 쓰고 싶은 분들의 꿈을 현실로 만들어 드리고 있습니다.
              2024년부터 전자책 코칭을 시작해 60권 이상의 출간을 도왔습니다.
            </p>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-brand-green font-medium hover:underline"
            >
              더 알아보기 <ArrowRight size={16} />
            </Link>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="w-64 h-64 relative rounded-2xl overflow-hidden">
              <Image
                src="/images/profile_img2.png"
                alt="홍성호 프로필 사진"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-brand-green">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            작가의 꿈, 지금 시작할 수 있습니다
          </h2>
          <p className="text-green-100 mb-8">무료 상담으로 당신에게 맞는 코칭을 찾아보세요</p>
          <Link
            href="/contact"
            className="bg-brand-yellow text-brand-text font-bold px-8 py-3 rounded-lg hover:bg-yellow-300 transition-colors inline-flex items-center gap-2"
          >
            무료 상담 신청하기 <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
