import type { Metadata } from "next";
import { Bell, Star, MessageSquare, Trophy, Quote } from "lucide-react";

export const metadata: Metadata = {
  title: "커뮤니티",
  description: "검파크 커뮤니티. 공지사항, 코칭 후기, 명언, 자유게시판, 챌린지 게시판.",
};

const boards = [
  {
    icon: Bell,
    title: "공지사항",
    description: "코칭 일정, 신규 상품, 이벤트 등 중요 공지를 안내합니다.",
    badge: "필독",
  },
  {
    icon: Star,
    title: "코칭 후기",
    description: "코칭을 수료한 작가들의 솔직한 후기와 출간 성과를 공유합니다.",
    badge: null,
  },
  {
    icon: Quote,
    title: "명언 게시판",
    description: "글쓰기와 삶에 영감을 주는 명언을 함께 나눕니다.",
    badge: null,
  },
  {
    icon: MessageSquare,
    title: "자유게시판",
    description: "작가 생활, 글쓰기 고민, 일상을 자유롭게 나누는 공간입니다.",
    badge: null,
  },
  {
    icon: Trophy,
    title: "챌린지 게시판",
    description: "30일 글쓰기 챌린지, 전자책 완성 챌린지 등 함께 도전하고 인증합니다.",
    badge: "인기",
  },
];

export default function CommunityPage() {
  return (
    <div className="py-16 sm:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-brand-green uppercase tracking-widest mb-3">
            Community
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-brand-text mb-4">커뮤니티</h1>
          <p className="text-brand-muted">
            같은 꿈을 가진 작가들이 모이는 공간입니다.
            <br />
            함께 쓰고, 함께 성장하세요.
          </p>
        </div>

        <div className="space-y-3">
          {boards.map(({ icon: Icon, title, description, badge }) => (
            <div
              key={title}
              className="border border-gray-200 rounded-xl p-5 flex items-start gap-4 hover:border-brand-green hover:shadow-sm transition-all cursor-pointer"
            >
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-brand-green" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-brand-text">{title}</h3>
                  {badge && (
                    <span className="text-xs bg-brand-yellow text-brand-text font-bold px-2 py-0.5 rounded-full">
                      {badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-brand-muted">{description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gray-50 rounded-2xl p-8 text-center">
          <p className="text-brand-muted text-sm">
            커뮤니티 기능은 현재 준비 중입니다.
            <br />
            오픈 시 알림을 받으시려면 문의 남겨주세요.
          </p>
        </div>
      </div>
    </div>
  );
}
