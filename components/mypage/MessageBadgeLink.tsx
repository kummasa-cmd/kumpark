import Link from "next/link";
import { Mail } from "lucide-react";

interface Props {
  count: number;
  // dark: 초록 배경 위(사이드바), light: 흰 배경 위(대시보드 제목)
  variant?: "dark" | "light";
  className?: string;
}

// 쪽지 아이콘 + 확인하지 않은 쪽지 수 배지 — 클릭 시 쪽지함으로 이동
export default function MessageBadgeLink({ count, variant = "dark", className = "" }: Props) {
  const iconCls =
    variant === "dark"
      ? "text-white hover:bg-white/15"
      : "text-gray-500 hover:bg-gray-100 hover:text-brand-green";

  return (
    <Link
      href="/mypage/messages"
      className={`relative inline-flex shrink-0 p-1.5 rounded-md transition-colors ${iconCls} ${className}`}
      aria-label={`쪽지함 (확인하지 않은 쪽지 ${count}개)`}
      title="쪽지함"
    >
      <Mail size={18} />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
