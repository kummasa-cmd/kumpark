import pool from "./db";
import { ensureMessagesTable, MESSAGE_MAX_LENGTH } from "./ensure-tables";

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

// ── 관리자 발송 (개별 / 다중 선택 / 전체) ─────────────────────────────

export const MAX_SELECTED_RECIPIENTS = 500;

// 관리자 → 회원 쪽지 생성. 받는 회원이 2명 이상이면 묶음(broadcast)으로 저장한다.
// 반환값: 실제로 쪽지를 받은 회원 수
export async function createAdminMessages(opts: {
  adminId: number;
  target: "all" | "selected";
  memberIds: number[];
  content: string;
}) {
  await ensureMessagesTable();

  // 전체 발송은 활성 회원 전원, 선택 발송은 존재하는 회원만
  const { rows: recipients } =
    opts.target === "all"
      ? await pool.query<{ id: number }>(`SELECT id FROM members WHERE status = 'active'`)
      : await pool.query<{ id: number }>(`SELECT id FROM members WHERE id = ANY($1::int[])`, [
          opts.memberIds,
        ]);
  const ids = recipients.map((r) => r.id);
  if (ids.length === 0) return 0;

  if (opts.target === "selected" && ids.length === 1) {
    await pool.query(
      `INSERT INTO messages (member_id, admin_id, direction, content) VALUES ($1, $2, 'to_member', $3)`,
      [ids[0], opts.adminId, opts.content]
    );
    return 1;
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query<{ id: number }>(
      `INSERT INTO message_broadcasts (admin_id, target, content) VALUES ($1, $2, $3) RETURNING id`,
      [opts.adminId, opts.target, opts.content]
    );
    await client.query(
      `INSERT INTO messages (member_id, admin_id, direction, content, broadcast_id)
       SELECT id, $2, 'to_member', $3, $4 FROM UNNEST($1::int[]) AS id`,
      [ids, opts.adminId, opts.content, rows[0].id]
    );
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
  return ids.length;
}

export type AdminSentRow = {
  kind: "single" | "broadcast";
  id: number;
  content: string;
  target: "all" | "selected" | null;
  recipient_count: number;
  read_count: number;
  created_at: string;
  read_at: string | null;
  member_id: number | null;
  member_name: string | null;
  member_nickname: string | null;
  member_email: string | null;
  admin_name: string | null;
};

const ADMIN_SENT_ITEMS = `
  WITH items AS (
    SELECT 'single'::text AS kind, ms.id, ms.created_at, ms.content, ms.admin_id, ms.member_id,
           NULL::text AS target, 1 AS recipient_count,
           (ms.read_at IS NOT NULL)::int AS read_count, ms.read_at
    FROM messages ms
    WHERE ms.direction = 'to_member' AND ms.admin_deleted_at IS NULL AND ms.broadcast_id IS NULL
    UNION ALL
    SELECT 'broadcast', b.id, b.created_at, b.content, b.admin_id, MIN(ms.member_id),
           b.target, COUNT(ms.id)::int, COUNT(ms.read_at)::int, NULL
    FROM message_broadcasts b
    JOIN messages ms ON ms.broadcast_id = b.id AND ms.admin_deleted_at IS NULL
    GROUP BY b.id
  )`;

// 관리자 보낸 쪽지함 — 개별 쪽지와 묶음 발송을 한 목록으로
export async function listAdminSent(limit: number, offset: number) {
  await ensureMessagesTable();
  const [{ rows }, { rows: countRows }] = await Promise.all([
    pool.query<AdminSentRow>(
      `${ADMIN_SENT_ITEMS}
       SELECT i.kind, i.id, i.content, i.target, i.recipient_count, i.read_count, i.member_id,
              TO_CHAR(i.created_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI') AS created_at,
              TO_CHAR(i.read_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI') AS read_at,
              m.name AS member_name, m.nickname AS member_nickname, m.email AS member_email,
              a.name AS admin_name
       FROM items i
       LEFT JOIN members m ON m.id = i.member_id
       LEFT JOIN admins a ON a.id = i.admin_id
       ORDER BY i.created_at DESC, i.id DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    ),
    pool.query<{ total: number }>(`${ADMIN_SENT_ITEMS} SELECT COUNT(*)::int AS total FROM items`),
  ]);
  return { rows, total: countRows[0].total };
}

// 묶음 발송의 받는 회원별 확인 현황
export async function listBroadcastRecipients(broadcastId: number) {
  await ensureMessagesTable();
  const { rows } = await pool.query<{
    member_id: number;
    name: string;
    nickname: string;
    read_at: string | null;
  }>(
    `SELECT m.id AS member_id, m.name, m.nickname,
            TO_CHAR(ms.read_at AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI') AS read_at
     FROM messages ms
     JOIN members m ON m.id = ms.member_id
     WHERE ms.broadcast_id = $1 AND ms.admin_deleted_at IS NULL
     ORDER BY ms.read_at IS NULL, ms.read_at DESC, m.name`,
    [broadcastId]
  );
  return rows;
}

// 관리자 쪽지함에서 묶음 발송 삭제 (회원 쪽지함에는 남음)
export async function deleteBroadcastForAdmin(broadcastId: number) {
  await ensureMessagesTable();
  const { rowCount } = await pool.query(
    `UPDATE messages SET admin_deleted_at = NOW()
     WHERE broadcast_id = $1 AND admin_deleted_at IS NULL`,
    [broadcastId]
  );
  await pool.query(
    `DELETE FROM messages
     WHERE broadcast_id = $1 AND admin_deleted_at IS NOT NULL AND member_deleted_at IS NOT NULL`,
    [broadcastId]
  );
  // 남은 회원 쪽지는 broadcast_id가 NULL로 바뀌어 개별 쪽지로 유지된다
  await pool.query(`DELETE FROM message_broadcasts WHERE id = $1`, [broadcastId]);
  return (rowCount ?? 0) > 0;
}
