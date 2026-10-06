import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "./db";
import { verifyAdminToken, COOKIE_NAME, type AdminPayload } from "./auth";

// 관리자 API 공통 인증 — 미들웨어와 별개로 각 핸들러에서 한 번 더 확인한다.
// 토큰 검증 후 DB에서 활성 상태·현재 권한을 다시 읽으므로
// 비활성화되거나 권한이 바뀐 관리자는 토큰 만료 전이라도 즉시 차단된다.
export async function requireAdmin(
  opts: { superOnly?: boolean } = {}
): Promise<AdminPayload | NextResponse> {
  const token = cookies().get(COOKIE_NAME)?.value;
  const payload = token ? await verifyAdminToken(token) : null;
  if (!payload || typeof payload.role !== "string") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rows } = await pool.query<{ id: number; email: string; role: string; status: string }>(
    "SELECT id, email, role, status FROM admins WHERE id = $1",
    [payload.id]
  );
  const admin = rows[0];
  if (!admin || admin.status !== "active") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (opts.superOnly && admin.role !== "super") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return { id: admin.id, email: admin.email, role: admin.role };
}
