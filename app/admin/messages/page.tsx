import type { Metadata } from "next";
import pool from "@/lib/db";
import { ensureMemberColumns } from "@/lib/ensure-tables";
import { listMessages, messageCounts } from "@/lib/messages";
import MessageItem from "@/components/messages/MessageItem";
import MessageTabs from "@/components/messages/MessageTabs";
import MessageComposeForm from "@/components/messages/MessageComposeForm";
import Pagination from "@/components/admin/Pagination";
import type { SelectedMember } from "@/components/admin/MemberSearchSelect";

export const metadata: Metadata = { title: "쪽지목록" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 15;

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: { tab?: string; page?: string; to?: string };
}) {
  await ensureMemberColumns();

  const tab = searchParams.tab === "sent" ? "sent" : "received";
  const counts = await messageCounts("admin");
  const total = tab === "sent" ? counts.to_member : counts.to_admin;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1), totalPages);

  const { rows } = await listMessages({
    direction: tab === "sent" ? "to_member" : "to_admin",
    viewer: "admin",
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });

  // 답장(?to=회원ID) 시 받는 회원 미리 선택
  let replyTo: SelectedMember | null = null;
  const toId = Number(searchParams.to);
  if (Number.isInteger(toId) && toId > 0) {
    const { rows: m } = await pool.query<SelectedMember>(
      "SELECT id, name, nickname, phone FROM members WHERE id = $1",
      [toId]
    );
    replyTo = m[0] ?? null;
  }

  const memberLabel = (name: string, nickname: string) => (nickname ? `${name} (${nickname})` : name);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">쪽지목록</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          회원과 주고받은 쪽지입니다. 확인하지 않은 쪽지{" "}
          <span className="text-yellow-600 font-semibold">{counts.unread_to_admin}개</span>
        </p>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <MessageTabs
          basePath="/admin/messages"
          active={tab}
          receivedTotal={counts.to_admin}
          receivedUnread={counts.unread_to_admin}
          sentTotal={counts.to_member}
        />
        <MessageComposeForm
          key={replyTo?.id ?? "new"}
          endpoint="/api/admin/messages"
          selectRecipient
          initialRecipient={replyTo}
          defaultOpen={Boolean(replyTo)}
          sentHref="/admin/messages?tab=sent"
        />
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
              readEndpoint={tab === "received" ? `/api/admin/messages/${m.id}/read` : undefined}
              deleteEndpoint={`/api/admin/messages/${m.id}`}
              replyHref={tab === "received" ? `/admin/messages?tab=received&to=${m.member_id}` : undefined}
              message={{
                id: m.id,
                content: m.content,
                created_at: m.created_at,
                read_at: m.read_at,
                counterpart:
                  tab === "sent"
                    ? `To. ${memberLabel(m.member_name, m.member_nickname)}`
                    : `From. ${memberLabel(m.member_name, m.member_nickname)}`,
                counterpartSub:
                  tab === "sent"
                    ? `${m.member_email}${m.admin_name ? ` · 보낸 관리자 ${m.admin_name}` : ""}`
                    : m.member_email,
              }}
            />
          ))}
        </div>
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath="/admin/messages"
        searchParams={{ tab }}
      />
    </div>
  );
}
