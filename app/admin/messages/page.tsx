import type { Metadata } from "next";
import pool from "@/lib/db";
import { ensureMemberColumns } from "@/lib/ensure-tables";
import { listMessages, listAdminSent, messageCounts } from "@/lib/messages";
import MessageItem from "@/components/messages/MessageItem";
import MessageTabs from "@/components/messages/MessageTabs";
import AdminMessageComposeForm from "@/components/admin/AdminMessageComposeForm";
import BroadcastMessageItem from "@/components/admin/BroadcastMessageItem";
import Pagination from "@/components/admin/Pagination";
import type { SelectedMember } from "@/components/admin/MemberSearchSelect";

export const metadata: Metadata = { title: "쪽지목록" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 15;

const memberLabel = (name: string | null, nickname: string | null) =>
  nickname ? `${name} (${nickname})` : name ?? "탈퇴 회원";

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: { tab?: string; page?: string; to?: string };
}) {
  await ensureMemberColumns();

  const tab = searchParams.tab === "sent" ? "sent" : "received";
  const requestedPage = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);

  const [counts, sentFirst, activeRes] = await Promise.all([
    messageCounts("admin"),
    // 보낸 쪽지는 묶음 발송을 한 건으로 세므로 별도 집계
    listAdminSent(PAGE_SIZE, tab === "sent" ? (requestedPage - 1) * PAGE_SIZE : 0),
    pool.query<{ cnt: number }>(`SELECT COUNT(*)::int AS cnt FROM members WHERE status = 'active'`),
  ]);

  const total = tab === "sent" ? sentFirst.total : counts.to_admin;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);

  const received =
    tab === "received"
      ? await listMessages({
          direction: "to_admin",
          viewer: "admin",
          limit: PAGE_SIZE,
          offset: (page - 1) * PAGE_SIZE,
        })
      : null;
  const sent =
    tab === "sent"
      ? page === requestedPage
        ? sentFirst
        : await listAdminSent(PAGE_SIZE, (page - 1) * PAGE_SIZE)
      : null;

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

  const isEmpty = tab === "sent" ? !sent?.rows.length : !received?.rows.length;

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
          sentTotal={sentFirst.total}
        />
        <AdminMessageComposeForm
          key={replyTo?.id ?? "new"}
          activeMemberCount={activeRes.rows[0].cnt}
          initialRecipient={replyTo}
        />
      </div>

      {isEmpty ? (
        <div className="bg-white rounded-xl border border-gray-100 px-5 py-12 text-center">
          <p className="text-gray-400 text-sm">
            {tab === "sent" ? "보낸 쪽지가 없습니다." : "받은 쪽지가 없습니다."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {received?.rows.map((m) => (
            <MessageItem
              key={m.id}
              box="received"
              readEndpoint={`/api/admin/messages/${m.id}/read`}
              deleteEndpoint={`/api/admin/messages/${m.id}`}
              replyHref={`/admin/messages?tab=received&to=${m.member_id}`}
              message={{
                id: m.id,
                content: m.content,
                created_at: m.created_at,
                read_at: m.read_at,
                counterpart: `From. ${memberLabel(m.member_name, m.member_nickname)}`,
                counterpartSub: m.member_email,
              }}
            />
          ))}

          {sent?.rows.map((m) =>
            m.kind === "broadcast" ? (
              <BroadcastMessageItem
                key={`b-${m.id}`}
                broadcast={{
                  id: m.id,
                  content: m.content,
                  target: m.target === "all" ? "all" : "selected",
                  created_at: m.created_at,
                  recipient_count: m.recipient_count,
                  read_count: m.read_count,
                  first_member_name: m.member_name,
                  admin_name: m.admin_name,
                }}
              />
            ) : (
              <MessageItem
                key={`m-${m.id}`}
                box="sent"
                deleteEndpoint={`/api/admin/messages/${m.id}`}
                message={{
                  id: m.id,
                  content: m.content,
                  created_at: m.created_at,
                  read_at: m.read_at,
                  counterpart: `To. ${memberLabel(m.member_name, m.member_nickname)}`,
                  counterpartSub: `${m.member_email ?? ""}${m.admin_name ? ` · 보낸 관리자 ${m.admin_name}` : ""}`,
                }}
              />
            )
          )}
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
