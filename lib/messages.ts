import pool from "./db";
import { ensureMessagesTable, MESSAGE_MAX_LENGTH } from "./ensure-tables";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kumpark.com";

export type MessageRow = {
  id: number;
  content: string;
  created_at: string;
  read_at: string | null;
  member_id: number;
  member_name: string;
  member_nickname: string;
  member_email: string;
  admin_name: string | null;
};

// 쪽지 본문 검증 — 정리된 본문 또는 오류 메시지 반환
export function validateMessageContent(raw: unknown): { content: string } | { error: string } {
  const content = typeof raw === "string" ? raw.trim() : "";
  if (!content) return { error: "쪽지 내용을 입력하세요." };
  if (content.length > MESSAGE_MAX_LENGTH) {
    return { error: `쪽지는 ${MESSAGE_MAX_LENGTH}자 이내로 작성하세요.` };
  }
  return { content };
}

export function formatSentAt(date: Date) {
  return date.toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const SELECT_MESSAGE = `
  SELECT ms.id, ms.content, ms.member_id,
         TO_CHAR(ms.created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI') AS created_at,
         TO_CHAR(ms.read_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI') AS read_at,
         m.name AS member_name, m.nickname AS member_nickname, m.email AS member_email,
         a.name AS admin_name
  FROM messages ms
  JOIN members m ON m.id = ms.member_id
  LEFT JOIN admins a ON a.id = ms.admin_id`;

// 보는 사람 기준으로 본인이 삭제한 쪽지 제외
const notDeletedBy = (viewer: "member" | "admin") =>
  viewer === "member" ? "member_deleted_at IS NULL" : "admin_deleted_at IS NULL";

export async function listMessages(opts: {
  direction: "to_admin" | "to_member";
  viewer: "member" | "admin";
  memberId?: number;
  limit: number;
  offset: number;
}) {
  await ensureMessagesTable();
  const params: (string | number)[] = [opts.direction];
  let where = `ms.direction = $1 AND ms.${notDeletedBy(opts.viewer)}`;
  if (opts.memberId !== undefined) {
    params.push(opts.memberId);
    where += ` AND ms.member_id = $${params.length}`;
  }
  const [{ rows }, { rows: countRows }] = await Promise.all([
    pool.query<MessageRow>(
      `${SELECT_MESSAGE} WHERE ${where}
       ORDER BY ms.created_at DESC, ms.id DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, opts.limit, opts.offset]
    ),
    pool.query<{ total: number }>(
      `SELECT COUNT(*)::int AS total FROM messages ms WHERE ${where}`,
      params
    ),
  ]);
  return { rows, total: countRows[0].total };
}

// 방향별 전체/미확인 쪽지 수 (memberId 지정 시 해당 회원 대화만)
export async function messageCounts(viewer: "member" | "admin", memberId?: number) {
  await ensureMessagesTable();
  const { rows } = await pool.query<{
    to_admin: number;
    to_member: number;
    unread_to_admin: number;
    unread_to_member: number;
  }>(
    `SELECT
       COUNT(*) FILTER (WHERE direction = 'to_admin')::int AS to_admin,
       COUNT(*) FILTER (WHERE direction = 'to_member')::int AS to_member,
       COUNT(*) FILTER (WHERE direction = 'to_admin' AND read_at IS NULL)::int AS unread_to_admin,
       COUNT(*) FILTER (WHERE direction = 'to_member' AND read_at IS NULL)::int AS unread_to_member
     FROM messages
     WHERE ${notDeletedBy(viewer)} AND ($1::int IS NULL OR member_id = $1)`,
    [memberId ?? null]
  );
  return rows[0];
}

// 회원이 읽지 않은 받은 쪽지 수
export async function countMemberUnread(memberId: number) {
  await ensureMessagesTable();
  const { rows } = await pool.query<{ cnt: number }>(
    `SELECT COUNT(*)::int AS cnt FROM messages
     WHERE member_id = $1 AND direction = 'to_member' AND read_at IS NULL
       AND member_deleted_at IS NULL`,
    [memberId]
  );
  return rows[0].cnt;
}

// 관리자가 읽지 않은 받은 쪽지 수 (관리자 공용 쪽지함)
export async function countAdminUnread() {
  await ensureMessagesTable();
  const { rows } = await pool.query<{ cnt: number }>(
    `SELECT COUNT(*)::int AS cnt FROM messages
     WHERE direction = 'to_admin' AND read_at IS NULL AND admin_deleted_at IS NULL`
  );
  return rows[0].cnt;
}

// 보는 사람의 쪽지함에서 삭제. 상대방도 이미 삭제했다면 행을 지운다.
// 반환값: 삭제 대상이 존재했는지 여부
export async function deleteMessageFor(
  viewer: "member" | "admin",
  id: number,
  memberId?: number
) {
  await ensureMessagesTable();
  const mine = viewer === "member" ? "member_deleted_at" : "admin_deleted_at";
  const other = viewer === "member" ? "admin_deleted_at" : "member_deleted_at";
  const params: number[] = [id];
  let owner = "";
  if (viewer === "member") {
    params.push(memberId ?? -1);
    owner = " AND member_id = $2";
  }
  const { rowCount } = await pool.query(
    `UPDATE messages SET ${mine} = NOW() WHERE id = $1${owner} AND ${mine} IS NULL`,
    params
  );
  await pool.query(
    `DELETE FROM messages WHERE id = $1${owner} AND ${mine} IS NOT NULL AND ${other} IS NOT NULL`,
    params
  );
  return (rowCount ?? 0) > 0;
}
