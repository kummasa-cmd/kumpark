import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  Video,
  Users2,
  Compass,
  BookOpen,
  ListOrdered,
  PenLine,
  Sparkles,
  Receipt,
} from "lucide-react";

export const metadata: Metadata = {
  title: "전자책 코칭",
  description:
    "검마사와 함께하는 1대1 전자책 코칭, 검전쓰. 기획부터 퇴고까지 6주 동안 내 책 한 권을 완성합니다.",
};

const stuckPoints = [
  "무엇을 주제로 써야 할지 결정하지 못할 때",
  "제목과 목차를 구성하지 못할 때",
  "초고를 쓰다가 막힐 때",
  "퇴고와 완성 단계에서 방향을 잃을 때",
];

const curriculum = [
  {
    icon: Compass,
    step: "1",
    title: "기획",
    desc: "무엇을 쓰고 싶은지, 왜 이 책을 쓰고 싶은지 정리합니다. 막연한 아이디어를 전자책으로 발전시킬 수 있도록 책의 방향을 구체화합니다.",
  },
  {
    icon: BookOpen,
    step: "2",
    title: "주제",
    desc: "나의 경험과 지식에서 독자에게 전할 수 있는 핵심 주제를 찾습니다. 이미 알고 있는 이야기라도 하나의 관점과 메시지로 정리하면 책의 주제가 될 수 있습니다.",
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
    title: "퇴고",
    desc: "문장의 흐름과 내용의 연결을 점검합니다. 독자에게 책의 메시지가 더 분명하게 전달될 수 있도록 퇴고 요령을 맞춤형으로 안내합니다.",
  },
];

const recommendedFor = [
  "전자책을 쓰고 싶지만 아직 시작하지 못한 분",
  "쓰고 싶은 주제는 있지만 책의 방향이 정리되지 않은 분",
  "제목과 목차를 구체적으로 구성하고 싶은 분",
  "초고를 끝까지 완성하고 싶은 분",
  "퇴고 방법을 배우고 싶은 분",
  "혼자 쓰다가 여러 번 중단한 경험이 있는 분",
  "자신의 경험과 지식을 한 권의 책으로 만들고 싶은 분",
  "그룹보다 자신의 책에 집중하는 코칭을 원하는 분",
];

const pricingIncludes = [
  "기본 4개 과정 동영상",
  "1대1 코칭 3회",
  "총 6주 과정",
];

const faqs = [
  {
    q: "그룹코칭과 무엇이 다른가요?",
    a: "기존 그룹코칭은 여러 수강생이 함께 배우고 진행하는 방식이었습니다. 새로운 검전쓰는 그룹이 아닌 1대1 맞춤 코칭으로 진행됩니다. 수강생의 책 주제와 현재 진행 상황에 맞춰 자신의 책에 집중할 수 있습니다.",
  },
  {
    q: "코칭은 몇 번 진행되나요?",
    a: "총 3회 진행됩니다. 기본 4개 과정 동영상을 시청한 뒤, 온라인 Zoom 또는 전화로 1대1 코칭을 진행합니다.",
  },
  {
    q: "전체 기간은 얼마나 되나요?",
    a: "총 6주 과정입니다.",
  },
  {
    q: "어떤 내용을 코칭받을 수 있나요?",
    a: "기획, 주제, 목차 컨설팅부터 초고 쓰기 요령과 퇴고 쓰기 요령까지 맞춤형으로 코칭받을 수 있습니다.",
  },
  {
    q: "코칭은 어디에서 진행되나요?",
    a: "온라인 Zoom 또는 전화로 진행됩니다.",
  },
  {
    q: "일정은 어떻게 정하나요?",
    a: "일정과 안내는 검파크 사이트에서 관리합니다.",
  },
  {
    q: "수강료는 얼마인가요?",
    a: "수강료는 20만원이며 부가세가 포함되어 있습니다.",
  },
  {
    q: "현금영수증이나 세금계산서 발행이 가능한가요?",
    a: "네. 현금영수증 또는 세금계산서 발행이 가능합니다.",
  },
];

export default function EbookCoachingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-white py-16 sm:py-20 border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="inline-block bg-brand-yellow text-brand-text text-xs font-semibold px-3 py-1 rounded-full mb-6">
            검전쓰 · 전자책 코칭
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-brand-text leading-tight mb-3">
            검마사와 함께하는 1대1 전자책 코칭
          </h1>
          <p className="text-lg text-brand-green font-semibold mb-6">
            내 책 한 권을 함께 완성합니다
          </p>
          <p className="text-brand-muted leading-relaxed mb-4">
            전자책을 쓰고 싶지만, 아직 책을 완성하지 못하셨나요? 주제는 정했지만 목차를 만들지 못했거나,
            초고를 쓰다가 멈췄거나, 퇴고 단계에서 막막함을 느끼고 계신가요?
          </p>
          <p className="text-brand-muted leading-relaxed mb-10">
            검전쓰는 기획부터 퇴고까지, 한 권의 전자책을 완성하는 과정을 함께합니다. 이제 검전쓰는
            그룹코칭을 넘어, 내 책에 집중하는 1대1 맞춤 코칭으로 진행됩니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/mypage/coaching/apply/ebook"
              className="bg-brand-green text-white font-semibold px-8 py-3 rounded-lg hover:bg-green-800 transition-colors inline-flex items-center justify-center gap-2"
            >
              전자책 코칭 신청 <ArrowRight size={18} />
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
            쓰고 싶지만, 책은 아직 완성되지 않았습니다
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
            검전쓰는 막연하게 생각만 하던 전자책을 실제로 기획하고, 쓰고, 다듬을 수 있도록 돕습니다.
          </p>
        </div>
      </section>

      {/* Track record */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-brand-text mb-4">
            작가 검마사와 함께 걸어온 5시즌의 기록
          </h2>
          <p className="text-brand-muted leading-relaxed mb-6">
            검전쓰는 지금까지 총 5시즌 동안 운영되었습니다. 그동안 60명이 넘는 수강생이 검전쓰와 함께
            전자책을 완성하고 베스트셀러 작가가 되었습니다.
          </p>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-green-50 rounded-xl p-6 text-center">
              <p className="text-3xl font-bold text-brand-green mb-1">5시즌</p>
              <p className="text-xs text-brand-muted">누적 운영 시즌</p>
            </div>
            <div className="bg-green-50 rounded-xl p-6 text-center">
              <p className="text-3xl font-bold text-brand-green mb-1">60+명</p>
              <p className="text-xs text-brand-muted">전자책 완성 수강생</p>
            </div>
          </div>
          <p className="text-brand-muted leading-relaxed">
            전자책을 쓰는 일은 단순히 글을 많이 쓰는 일이 아닙니다. 나의 경험과 생각을 하나의 주제로
            정리하고, 독자에게 전하고 싶은 메시지를 책의 형태로 완성하는 일입니다. 검전쓰는 그 과정을
            함께 설계하고 실행하도록 돕습니다.
          </p>
        </div>
      </section>

      {/* Not a challenge, a project */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-brand-text mb-4">
            검전쓰는 단순 챌린지가 아닙니다. 함께 하는 프로젝트입니다
          </h2>
          <p className="text-brand-muted leading-relaxed mb-4">
            검전쓰는 단순히 매일 글을 쓰는 챌린지가 아닙니다. 내가 쓰고 싶은 책이 무엇인지 살펴보고,
            책의 방향을 정하고, 실제 원고를 완성해가는 전자책 프로젝트입니다.
          </p>
          <p className="text-brand-muted leading-relaxed">
            나만의 서사는 AI가 대신 써줄 수 없습니다. 그래서 첫 책만큼은 자신의 경험과 언어로 직접 써보는
            과정이 중요합니다. 검전쓰는 수강생의 이야기를 대신 써드리는 것이 아니라, 수강생이 자신의
            책을 끝까지 완성할 수 있도록 질문하고 방향을 잡아드립니다.
          </p>
        </div>
      </section>

      {/* Layer structure */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-brand-text mb-2">
            그룹에서 1대1로, 내 책에 집중하는 6주
          </h2>
          <p className="text-brand-muted leading-relaxed mb-8">
            기존 검전쓰가 여러 사람이 함께 배우고 성장하는 그룹코칭이었다면, 새롭게 진행되는 검전쓰는
            수강생 한 분의 책에 집중하는 1대1 코칭입니다. 함께하는 동료의 응원에 더해, 이제는 내 책만을
            위한 코치의 질문과 시간이 더해집니다. 현재 쓰고 있는 책의 주제, 진행 상황, 고민하고 있는
            지점을 바탕으로 필요한 부분을 맞춤형으로 살펴봅니다.
          </p>
          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            <div className="border border-gray-200 rounded-xl p-6">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-4">
                <Video size={20} className="text-brand-green" />
              </div>
              <p className="text-xs font-semibold text-brand-green mb-1">LAYER 01</p>
              <h3 className="text-lg font-bold text-brand-text mb-2">기본 4개 과정 동영상</h3>
              <p className="text-sm text-brand-muted leading-relaxed">
                전자책 집필에 필요한 기본 과정을 동영상으로 시청합니다. 각자의 일정에 맞춰 기본 내용을
                먼저 익히고, 자신의 책에 적용해볼 수 있습니다.
              </p>
            </div>
            <div className="border border-gray-200 rounded-xl p-6">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-4">
                <Users2 size={20} className="text-brand-green" />
              </div>
              <p className="text-xs font-semibold text-brand-green mb-1">LAYER 02</p>
              <h3 className="text-lg font-bold text-brand-text mb-2">1대1 코칭 3회</h3>
              <p className="text-sm text-brand-muted leading-relaxed">
                기본 동영상 과정을 바탕으로 온라인 1대1 코칭을 3회 진행합니다. 코칭은 온라인 Zoom 또는
                전화로 진행되며, 수강생의 책 진행 상황에 맞춰 필요한 내용을 함께 점검합니다.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-gray-50 rounded-lg py-4">
              <p className="text-lg font-bold text-brand-green">6주</p>
              <p className="text-xs text-brand-muted mt-1">총 기간</p>
            </div>
            <div className="bg-gray-50 rounded-lg py-4">
              <p className="text-lg font-bold text-brand-green">4개</p>
              <p className="text-xs text-brand-muted mt-1">기본 과정 동영상</p>
            </div>
            <div className="bg-gray-50 rounded-lg py-4">
              <p className="text-lg font-bold text-brand-green">3회</p>
              <p className="text-xs text-brand-muted mt-1">1대1 코칭</p>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-brand-text mb-2">
            기획에서 퇴고까지, 빈 곳 없이 한 권의 책을 완성합니다
          </h2>
          <p className="text-brand-muted leading-relaxed mb-8">
            검전쓰 1대1 코칭에서는 다음 내용을 함께 살펴봅니다.
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

      {/* Online delivery */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-brand-text mb-4">
            거리가 있어도 함께 갑니다, 온라인·전화로 진행합니다
          </h2>
          <p className="text-brand-muted leading-relaxed mb-6">
            검전쓰 1대1 코칭은 온라인으로 진행됩니다. 거리나 장소 때문에 시작을 미루고 있었다면,
            온라인으로 검전쓰를 시작해보세요.
          </p>
          <ul className="space-y-2 mb-6">
            {["온라인 Zoom 코칭", "전화 코칭", "1대1 코칭 총 3회", "전체 기간 6주"].map((item) => (
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
            전자책을 쓰기 전에는 누구나 이렇게 말합니다. <br />&ldquo;언젠가는 책을 써보고 싶어요.&rdquo;
            <br />하지만 한 권의 책을 완성하고 나면 이렇게 말할 수 있습니다. <br />&ldquo;어느새 책을 쓰는 사람이
            되었습니다.&rdquo;
          </p>
          <p className="text-white font-bold text-xl mb-2">언젠가는에서 어느새로.</p>
          <p className="text-green-100 text-sm">
            검전쓰는 수강생의 이야기를 대신 만들어드리지 않습니다. <br />대신 자신의 경험과 생각을 스스로
            정리하고, <br />자신의 언어로 한 권의 책을 완성할 수 있도록 함께합니다.
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-brand-text mb-6 text-center">수강료 및 발행 안내</h2>
          <div className="border border-gray-200 rounded-2xl p-8 max-w-md mx-auto text-center">
            <p className="text-xs font-semibold text-brand-green bg-green-50 px-2 py-0.5 rounded-full inline-block mb-4">
              1대1 코칭 · 6주 과정
            </p>
            <p className="text-4xl font-bold text-brand-text mb-1">20만원</p>
            <p className="text-xs text-brand-muted mb-6">부가세 포함</p>
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
              검전쓰 1대1 전자책 코칭 신청 <ArrowRight size={16} />
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
            미루던 일이 있었다면 당장 실행하십시오. 검마사와 함께 6주 동안 나의 책을 기획하고, 쓰고,
            다듬어보세요. 내 책 한 권을 함께 완성합니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/mypage/coaching/apply/ebook"
              className="bg-brand-green text-white font-semibold px-8 py-3 rounded-lg hover:bg-green-800 transition-colors inline-flex items-center justify-center gap-2"
            >
              전자책 코칭 신청 <ArrowRight size={18} />
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
