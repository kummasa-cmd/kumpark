import type { Metadata } from "next";
import { cookies } from "next/headers";
import { verifyMemberToken, MEMBER_COOKIE } from "@/lib/member-auth";
import { listMessages, messageCounts } from "@/lib/messages";
import MessageItem from "@/components/messages/MessageItem";
import MessageTabs from "@/components/messages/MessageTabs";
import MessageComposeForm from "@/components/messages/MessageComposeForm";
import Pagination from "@/components/admin/Pagination";

export const metadata: Metadata = { title: "쪽지함" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 15;

export default async function MypageMessagesPage({
  searchParams,
}: {
  searchParams: { tab?: string; page?: string };
}) {
  const token = cookies().get(MEMBER_COOKIE)?.value;
  const member = token ? await verifyMemberToken(token) : null;
  if (!member) return null;

  const tab = searchParams.tab === "sent" ? "sent" : "received";
  const counts = await messageCounts("member", member.id);
  const total = tab === "sent" ? counts.to_admin : counts.to_member;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1), totalPages);

  const { rows } = await listMessages({
    direction: tab === "sent" ? "to_admin" : "to_member",
    viewer: "member",
    memberId: member.id,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">쪽지함</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          관리자와 주고받은 쪽지입니다. 확인하지 않은 쪽지{" "}
          <span className="text-yellow-600 font-semibold">{counts.unread_to_member}개</span>
        </p>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <MessageTabs
          basePath="/mypage/messages"
          active={tab}
          receivedTotal={counts.to_member}
          receivedUnread={counts.unread_to_member}
          sentTotal={counts.to_admin}
        />
        <MessageComposeForm endpoint="/api/mypage/messages" sentHref="/mypage/messages?tab=sent" />
      </div>

      {rows.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 px-5 py-12 text-center">
          <p className="text-gray-400 text-sm">
            {tab === "sent" ? "보낸 쪽지가 없습니다." : "받은 쪽지가 없습니다."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((m) => (
            <MessageItem
              key={m.id}
              box={tab}
              readEndpoint={tab === "received" ? `/api/mypage/messages/${m.id}/read` : undefined}
              deleteEndpoint={`/api/mypage/messages/${m.id}`}
              message={{
                id: m.id,
                content: m.content,
                created_at: m.created_at,
                read_at: m.read_at,
                counterpart: tab === "sent" ? "To. 관리자" : "From. 검파크 관리자",
              }}
            />
          ))}
        </div>
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath="/mypage/messages"
        searchParams={{ tab }}
      />
    </div>
  );
}
