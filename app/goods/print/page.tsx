import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  Phone,
  Users2,
  Compass,
  BookOpen,
  ListOrdered,
  PenLine,
  Sparkles,
  Send,
  Receipt,
  Star,
} from "lucide-react";

export const metadata: Metadata = {
  title: "종이책 코칭",
  description:
    "검마사와 함께하는 1대1 종이책 코칭. 주 1회 전화·온라인 줌 코칭과 오프라인 코칭 4회로 기획부터 투고까지 5개월간 밀착 지원합니다.",
};

const stuckPoints = [
  "주제와 방향을 정하지 못할 때",
  "출간 기획서와 목차를 구성하지 못할 때",
  "초고를 쓰다가 막힐 때",
  "퇴고와 투고 단계에서 방향을 잃을 때",
];

const curriculum = [
  {
    icon: Compass,
    step: "1",
    title: "기획",
    desc: "무엇을 쓰고 싶은지, 왜 이 책을 쓰고 싶은지 정리합니다. 막연한 아이디어를 한 권의 종이책으로 발전시킬 수 있도록 방향을 구체화합니다.",
  },
  {
    icon: BookOpen,
    step: "2",
    title: "주제",
    desc: "나의 경험과 지식에서 독자에게 전할 수 있는 핵심 주제를 찾습니다. 출판 시장에서 통하는 관점과 메시지로 다듬습니다.",
  },
  {
    icon: ListOrdered,
    step: "3",
    title: "목차",
    desc: "책 전체의 흐름을 살펴보고 독자가 이해하기 쉬운 순서로 목차를 구성합니다. 목차가 정리되면 무엇을 써야 할지 더욱 선명해집니다.",
  },
  {
    icon: PenLine,
    step: "4",
    title: "초고",
    desc: "완벽하게 쓰려고 하기보다, 자신의 생각을 끝까지 꺼내는 것이 중요합니다. 초고를 완성할 수 있도록 집필 요령과 진행 방향을 함께 살펴봅니다.",
  },
  {
    icon: Sparkles,
    step: "5",
    title: "퇴고 & 원고 첨삭",
    desc: "문장의 흐름과 내용의 연결을 점검합니다. 독자에게 책의 메시지가 더 분명하게 전달될 수 있도록 원고를 직접 첨삭하며 퇴고 방향을 안내합니다.",
  },
  {
    icon: Send,
    step: "6",
    title: "투고",
    desc: "완성된 원고와 출간 기획서로 출판사에 투고합니다. 투고 전략과 출간 기획서 작성법을 함께 점검합니다.",
  },
];

const recommendedFor = [
  "종이책을 쓰고 싶지만 아직 시작하지 못한 분",
  "쓰고 싶은 주제는 있지만 책의 방향이 정리되지 않은 분",
  "출간 기획서와 목차를 구체적으로 구성하고 싶은 분",
  "초고를 끝까지 완성하고 싶은 분",
  "전문가의 원고 첨삭을 받아보고 싶은 분",
  "투고 전략과 출판 프로세스를 배우고 싶은 분",
  "혼자 쓰다가 여러 번 중단한 경험이 있는 분",
  "온라인 코칭에 더해 대면 코칭도 원하는 분",
];

const pricingIncludes = [
  "주 1회 전화 · 온라인 Zoom 코칭",
  "오프라인 코칭 4회",
  "원고 첨삭 지도",
  "출간 기획서 컨설팅",
  "총 5개월 밀착 과정",
];

const faqs = [
  {
    q: "전자책 코칭과 무엇이 다른가요?",
    a: "전자책 코칭은 6주 동안 온라인으로만 진행됩니다. 종이책 코칭은 5개월간 주 1회 전화·온라인 Zoom 코칭에 오프라인 코칭 4회가 더해지고, 출판사 투고를 위한 원고 첨삭과 출간 기획서 컨설팅까지 포함된 밀착 과정입니다.",
  },
  {
    q: "코칭은 어떻게 진행되나요?",
    a: "주 1회 전화 또는 온라인 Zoom 코칭으로 진행 상황을 점검하고, 별도로 오프라인 코칭을 4회 진행합니다.",
  },
  {
    q: "전체 기간은 얼마나 되나요?",
    a: "총 5개월 과정입니다. 기획부터 투고까지 밀착으로 함께합니다.",
  },
  {
    q: "원고 첨삭도 받을 수 있나요?",
    a: "네. 원고 첨삭 지도는 종이책 코칭에서만 제공됩니다. 초고와 퇴고 단계에서 직접 원고를 검토하고 첨삭해 드립니다.",
  },
  {
    q: "어떤 내용을 코칭받을 수 있나요?",
    a: "기획, 주제, 목차 컨설팅부터 초고·퇴고 쓰기 요령, 원고 첨삭, 출간 기획서 작성법과 투고 전략까지 맞춤형으로 코칭받을 수 있습니다.",
  },
  {
    q: "일정은 어떻게 정하나요?",
    a: "일정과 안내는 검파크 사이트에서 관리합니다.",
  },
  {
    q: "수강료는 얼마인가요?",
    a: "수강료는 상담 후 안내해 드립니다. 현재 진행 상황과 목표에 따라 코칭 범위가 달라질 수 있습니다.",
  },
  {
    q: "현금영수증이나 세금계산서 발행이 가능한가요?",
    a: "네. 현금영수증 또는 세금계산서 발행이 가능합니다.",
  },
];

export default function PrintCoachingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-white py-16 sm:py-20 border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="inline-block bg-brand-yellow text-brand-text text-xs font-semibold px-3 py-1 rounded-full mb-6">
            1대1 종이책 코칭
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-brand-text leading-tight mb-3">
            검마사와 함께하는 1대1 종이책 코칭
          </h1>
          <p className="text-lg text-brand-green font-semibold mb-6">
            내 책 한 권을 함께 완성합니다
          </p>
          <p className="text-brand-muted leading-relaxed mb-4">
            종이책을 쓰고 싶지만, 아직 원고를 완성하지 못하셨나요? 주제는 정했지만 목차를 만들지
            못했거나, 초고를 쓰다가 멈췄거나, 퇴고와 투고 단계에서 막막함을 느끼고 계신가요?
          </p>
          <p className="text-brand-muted leading-relaxed mb-6">
            검마사의 종이책 코칭은 기획부터 투고까지, 한 권의 책을 완성하는 5개월의 여정을
            함께합니다.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {["5개월 과정", "주 1회 전화 · 온라인 줌 코칭", "오프라인 코칭 4회", "원고 첨삭 지도"].map(
              (item) => (
                <span
                  key={item}
                  className="text-xs font-semibold text-brand-green bg-green-50 px-3 py-1.5 rounded-full"
                >
                  {item}
                </span>
              )
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/mypage/coaching/apply/paper"
              className="bg-brand-green text-white font-semibold px-8 py-3 rounded-lg hover:bg-green-800 transition-colors inline-flex items-center justify-center gap-2"
            >
              종이책 코칭 신청 <ArrowRight size={18} />
            </Link>
            <Link
              href="/contact"
              className="border border-gray-300 text-brand-text font-semibold px-8 py-3 rounded-lg hover:border-brand-green hover:text-brand-green transition-colors inline-flex items-center justify-center"
            >
              무료상담 문의
            </Link>
          </div>
        </div>
      </section>

      {/* Why writers get stuck */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-brand-text mb-4">
            쓰고 싶지만, 원고는 아직 완성되지 않았습니다
          </h2>
          <p className="text-brand-muted leading-relaxed mb-8">
            책을 쓰는 과정에서는 여러 번 멈추게 됩니다. 혼자서 계속 고민하다 보면 처음의 의욕이 줄어들고,
            &ldquo;언젠가는 써야지&rdquo;라는 생각만 남게 됩니다.
          </p>
          <div className="grid sm:grid-cols-2 gap-3 mb-8">
            {stuckPoints.map((point) => (
              <div
                key={point}
                className="flex items-start gap-2 bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-brand-text"
              >
                <span className="text-brand-green font-bold flex-shrink-0">·</span>
                {point}
              </div>
            ))}
          </div>
          <p className="text-brand-muted leading-relaxed">
            검마사의 종이책 코칭은 막연하게 생각만 하던 종이책을 실제로 기획하고, 쓰고, 다듬어 투고까지
            나아갈 수 있도록 돕습니다.
          </p>
        </div>
      </section>

      {/* Author credibility */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-brand-text mb-4">
            직접 종이책을 출간한 작가의 코칭
          </h2>
          <p className="text-brand-muted leading-relaxed mb-6">
            검마사는 2025년 8월, 모모북스에서 종이책 <strong>루틴의 설계</strong>를 출간했습니다. 12권의
            전자책을 집필한 경험과 종이책 출간 과정을 직접 겪으며 얻은 노하우를 바탕으로, 기획부터
            투고까지 실제 출판 시장의 눈높이에서 원고를 함께 다듬습니다.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-xl p-6 text-center">
              <p className="text-3xl font-bold text-brand-green mb-1">1권</p>
              <p className="text-xs text-brand-muted">종이책 출간 (루틴의 설계)</p>
            </div>
            <div className="bg-green-50 rounded-xl p-6 text-center">
              <p className="text-3xl font-bold text-brand-green mb-1">12권</p>
              <p className="text-xs text-brand-muted">전자책 집필 경험</p>
            </div>
          </div>
        </div>
      </section>

      {/* Layer structure */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-brand-text mb-2">
            내 원고에 집중하는 5개월, 온라인과 오프라인의 두 겹 코칭
          </h2>
          <p className="text-brand-muted leading-relaxed mb-8">
            종이책 코칭은 그룹이 아닌 수강생 한 분의 원고에 집중하는 1대1 코칭입니다. 현재 쓰고 있는
            책의 주제, 진행 상황, 고민하고 있는 지점을 바탕으로 필요한 부분을 맞춤형으로 살펴봅니다.
          </p>
          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            <div className="border border-gray-200 rounded-xl p-6 bg-white">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-4">
                <Phone size={20} className="text-brand-green" />
              </div>
              <p className="text-xs font-semibold text-brand-green mb-1">LAYER 01</p>
              <h3 className="text-lg font-bold text-brand-text mb-2">
                주 1회 전화 · 온라인 Zoom 코칭
              </h3>
              <p className="text-sm text-brand-muted leading-relaxed">
                매주 정기적으로 전화 또는 온라인 Zoom으로 원고 진행 상황을 점검합니다. 꾸준한 점검을
                통해 집필 속도와 방향을 놓치지 않도록 함께합니다.
              </p>
            </div>
            <div className="border border-gray-200 rounded-xl p-6 bg-white">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-4">
                <Users2 size={20} className="text-brand-green" />
              </div>
              <p className="text-xs font-semibold text-brand-green mb-1">LAYER 02</p>
              <h3 className="text-lg font-bold text-brand-text mb-2">오프라인 코칭 4회</h3>
              <p className="text-sm text-brand-muted leading-relaxed">
                5개월 과정 동안 총 4회의 오프라인 대면 코칭을 진행합니다. 원고를 깊이 있게 검토하고
                방향을 함께 점검하는 밀착 세션입니다.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white rounded-lg py-4">
              <p className="text-lg font-bold text-brand-green">5개월</p>
              <p className="text-xs text-brand-muted mt-1">총 기간</p>
            </div>
            <div className="bg-white rounded-lg py-4">
              <p className="text-lg font-bold text-brand-green">주 1회</p>
              <p className="text-xs text-brand-muted mt-1">전화 · 온라인 줌</p>
            </div>
            <div className="bg-white rounded-lg py-4">
              <p className="text-lg font-bold text-brand-green">4회</p>
              <p className="text-xs text-brand-muted mt-1">오프라인 코칭</p>
            </div>
          </div>
        </div>
      </section>

      {/* Manuscript feedback highlight */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="bg-green-50 border border-green-100 rounded-2xl p-8 flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
              <Star size={22} className="text-brand-green" />
            </div>
            <div>
              <p className="text-xs font-semibold text-brand-green mb-1">종이책 코칭 전용</p>
              <h3 className="text-lg font-bold text-brand-text mb-2">원고 첨삭 지도</h3>
              <p className="text-sm text-brand-muted leading-relaxed">
                원고 첨삭 지도는 종이책 코칭에서만 제공됩니다. 초고와 퇴고 단계에서 검마사가 직접 원고를
                읽고 문장, 흐름, 구성을 첨삭하여 출판사 투고에 걸맞은 완성도로 다듬어 드립니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-brand-text mb-2">
            기획에서 투고까지, 빈 곳 없이 한 권의 책을 완성합니다
          </h2>
          <p className="text-brand-muted leading-relaxed mb-8">
            종이책 코칭에서는 다음 내용을 함께 살펴봅니다.
          </p>
          <div className="space-y-4">
            {curriculum.map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="bg-white border border-gray-200 rounded-xl p-6 flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-green text-white font-bold flex items-center justify-center text-sm">
                  {step}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon size={16} className="text-brand-green" />
                    <h3 className="font-bold text-brand-text">{title}</h3>
                  </div>
                  <p className="text-sm text-brand-muted leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery method */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-brand-text mb-4">
            온라인 코칭과 오프라인 코칭을 함께 진행합니다
          </h2>
          <p className="text-brand-muted leading-relaxed mb-6">
            종이책 코칭은 정기적인 온라인·전화 코칭에 오프라인 대면 코칭을 더해, 기획부터 투고까지
            5개월 동안 밀착으로 진행됩니다.
          </p>
          <ul className="space-y-2 mb-6">
            {[
              "주 1회 전화 코칭 또는 온라인 Zoom 코칭",
              "오프라인 코칭 4회",
              "원고 첨삭 지도 (종이책 코칭 전용)",
              "기획에서 투고까지 5개월 밀착 과정",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-brand-text">
                <CheckCircle size={16} className="text-brand-green flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <p className="text-sm text-brand-muted">모든 일정과 안내는 검파크에서 관리됩니다.</p>
        </div>
      </section>

      {/* Recommended for */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-brand-text mb-6">이런 분께 추천합니다</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {recommendedFor.map((item) => (
              <div
                key={item}
                className="flex items-start gap-2 bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-brand-text"
              >
                <CheckCircle size={16} className="text-brand-green flex-shrink-0 mt-0.5" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="py-16 bg-brand-green">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-green-100 leading-relaxed mb-6">
            종이책을 쓰기 전에는 누구나 이렇게 말합니다.<br />&ldquo;언젠가는 내 이름으로 된 책을 내고
            싶어요.&rdquo;<br />하지만 5개월의 여정을 마치고 나면 이렇게 말할 수 있습니다.<br />&ldquo;어느새
            투고할 원고를 완성했습니다.&rdquo;
          </p>
          <p className="text-white font-bold text-xl mb-2">언젠가는에서 어느새로.</p>
          <p className="text-green-100 text-sm">
            검마사는 수강생의 이야기를 대신 만들어드리지 않습니다.<br />대신 자신의 경험과 생각을 스스로
            정리하고,<br />자신의 언어로 한 권의 책을 완성해<br />투고까지 나아갈 수 있도록 함께합니다.
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-brand-text mb-6 text-center">수강료 및 발행 안내</h2>
          <div className="border border-gray-200 rounded-2xl p-8 max-w-md mx-auto text-center">
            <p className="text-xs font-semibold text-brand-green bg-green-50 px-2 py-0.5 rounded-full inline-block mb-4">
              1대1 코칭 · 5개월 과정
            </p>
            <p className="text-3xl font-bold text-brand-text mb-1">상담 후 안내</p>
            <p className="text-xs text-brand-muted mb-6">진행 상황과 목표에 따라 맞춤 안내</p>
            <ul className="space-y-2 text-left mb-6">
              {pricingIncludes.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-brand-text">
                  <CheckCircle size={16} className="text-brand-green flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-center gap-2 text-xs text-brand-muted mb-6">
              <Receipt size={14} />
              현금영수증 발행 가능 · 세금계산서 발행 가능
            </div>
            <Link
              href="/contact"
              className="bg-brand-green text-white font-semibold px-6 py-3 rounded-lg hover:bg-green-800 transition-colors inline-flex items-center justify-center gap-2 w-full"
            >
              1대1 종이책 코칭 신청 <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-brand-text mb-6">자주 묻는 질문</h2>
          <div className="space-y-3">
            {faqs.map(({ q, a }) => (
              <details
                key={q}
                className="group bg-white border border-gray-200 rounded-lg px-5 py-4"
              >
                <summary className="cursor-pointer list-none flex items-center justify-between font-medium text-brand-text text-sm">
                  {q}
                  <span className="text-brand-green ml-4 flex-shrink-0 group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <p className="text-sm text-brand-muted leading-relaxed mt-3">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-text mb-4">
            이제, 당신의 책을 시작할 시간입니다
          </h2>
          <p className="text-brand-muted leading-relaxed mb-8">
            미루던 일이 있었다면 당장 실행하십시오. 검마사와 함께 5개월 동안 나의 원고를 기획하고,
            쓰고, 다듬어 투고까지 나아가 보세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/mypage/coaching/apply/paper"
              className="bg-brand-green text-white font-semibold px-8 py-3 rounded-lg hover:bg-green-800 transition-colors inline-flex items-center justify-center gap-2"
            >
              종이책 코칭 신청 <ArrowRight size={18} />
            </Link>
            <Link
              href="/contact"
              className="border border-gray-300 text-brand-text font-semibold px-8 py-3 rounded-lg hover:border-brand-green hover:text-brand-green transition-colors inline-flex items-center justify-center"
            >
              무료상담 문의
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
