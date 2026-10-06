import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { ensureMessagesTable } from "@/lib/ensure-tables";
import { requireAdmin } from "@/lib/admin-guard";

// 관리자가 받은 쪽지를 읽음 처리
export async function PATCH(_request: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const id = Number(params.id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await ensureMessagesTable();
  await pool.query(
    `UPDATE messages SET read_at = NOW()
     WHERE id = $1 AND direction = 'to_admin' AND read_at IS NULL`,
    [id]
  );
  return NextResponse.json({ ok: true });
}
