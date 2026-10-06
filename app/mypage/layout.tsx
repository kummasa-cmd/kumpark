import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyMemberToken, MEMBER_COOKIE } from "@/lib/member-auth";
import { ensureMemberColumns } from "@/lib/ensure-tables";
import { hasCoachingBoardAccess } from "@/lib/coaching-access";
import { countMemberUnread } from "@/lib/messages";
import UnreadMessageAlert from "@/components/messages/UnreadMessageAlert";
import MypageSidebar from "@/components/mypage/MypageSidebar";
import MypageMobileNav from "@/components/mypage/MypageMobileNav";

export default async function MypageLayout({ children }: { children: React.ReactNode }) {
  const token = cookies().get(MEMBER_COOKIE)?.value;
  const member = token ? await verifyMemberToken(token) : null;

  if (!member) {
    redirect("/login?redirect=/mypage");
  }

  await ensureMemberColumns();
  const [showCoaching, unreadMessages] = await Promise.all([
    hasCoachingBoardAccess(member.id),
    countMemberUnread(member.id).catch(() => 0),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <UnreadMessageAlert count={unreadMessages} href="/mypage/messages" storageKey="kumpark_member_unread_alerted" />
      {/* 모바일 탭 */}
      <MypageMobileNav showCoaching={showCoaching} />

      {/* 데스크탑 2단 레이아웃 */}
      <div className="flex gap-8 items-start">
        <div className="hidden md:block">
          <MypageSidebar memberName={member.name} showCoaching={showCoaching} unreadMessages={unreadMessages} />
        </div>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
