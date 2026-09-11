import pool from "@/lib/db";
import { ensureCoachingTable } from "@/lib/ensure-tables";

/**
 * 코칭 게시판/자료실 이용 권한: 관리자가 수동으로 켜둔 coaching_yn 플래그이거나,
 * 입금확인/코칭중 상태의 코칭 건을 하나라도 보유한 경우 접근을 허용한다.
 */
export async function hasCoachingBoardAccess(memberId: number): Promise<boolean> {
  await ensureCoachingTable();
  const { rows } = await pool.query(
    `SELECT
       (SELECT coaching_yn FROM members WHERE id = $1) AS coaching_yn,
       EXISTS(
         SELECT 1 FROM coachings
         WHERE member_id = $1 AND status IN ('deposit_confirmed', 'in_progress')
       ) AS has_active_coaching`,
    [memberId]
  );
  return rows[0]?.coaching_yn === "Y" || rows[0]?.has_active_coaching === true;
}
