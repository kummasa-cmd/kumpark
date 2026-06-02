import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, CreditCard, MessageSquare, BookOpen, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "마이페이지",
  description: "코칭 일정 확인, 코칭 신청, 결제 정보, 1대1 문의를 관리하는 마이페이지입니다.",
};

const menuItems = [
  { icon: CalendarDays, title: "코칭 일정", description: "예약된 코칭 일정을 확인합니다." },
  { icon: BookOpen, title: "코칭 신청", description: "새 코칭 과정을 신청합니다." },
  { icon: MessageSquare, title: "1대1 문의", description: "코치와 직접 소통합니다." },
  { icon: CreditCard, title: "결제 정보", description: "결제 내역 및 영수증을 확인합니다." },
];

export default function MypagePage() {
  return (
    <div className="py-16 sm:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-brand-green uppercase tracking-widest mb-3">
            My Page
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-brand-text mb-4">마이페이지</h1>
          <p className="text-brand-muted">로그인 후 이용하실 수 있습니다.</p>
        </div>

        {/* Preview of menu items (greyed out as login required) */}
        <div className="grid sm:grid-cols-2 gap-4 mb-10 opacity-40 pointer-events-none select-none">
          {menuItems.map(({ icon: Icon, title, description }) => (
            <div key={title} className="border border-gray-200 rounded-xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-brand-green" />
              </div>
              <div>
                <h3 className="font-semibold text-brand-text mb-0.5">{title}</h3>
                <p className="text-sm text-brand-muted">{description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-2xl p-8 text-center">
          <p className="text-brand-text font-semibold mb-2">로그인이 필요한 서비스입니다</p>
          <p className="text-brand-muted text-sm mb-6">
            마이페이지 기능은 준비 중입니다.
            <br />
            코칭 신청은 문의 페이지를 이용해 주세요.
          </p>
          <Link
            href="/contact"
            className="bg-brand-green text-white font-semibold px-8 py-3 rounded-lg hover:bg-green-800 transition-colors inline-flex items-center gap-2"
          >
            코칭 문의하기 <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
