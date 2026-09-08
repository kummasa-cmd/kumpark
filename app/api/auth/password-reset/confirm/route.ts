import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import pool, { withTransaction } from "@/lib/db";
import { ensurePasswordResetTable } from "@/lib/ensure-tables";

export async function POST(request: Request) {
  try {
    await ensurePasswordResetTable();

    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "비밀번호는 8자 이상이어야 합니다." },
        { status: 400 }
      );
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const { rows } = await pool.query(
      `SELECT id, member_id FROM password_resets
       WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()`,
      [tokenHash]
    );
    const reset = rows[0];

    if (!reset) {
      return NextResponse.json(
        { error: "유효하지 않거나 만료된 링크입니다. 비밀번호 찾기를 다시 시도해 주세요." },
        { status: 400 }
      );
    }

    const hash = await bcrypt.hash(password, 12);

    await withTransaction(async (client) => {
      await client.query(
        "UPDATE members SET password_hash = $1 WHERE id = $2",
        [hash, reset.member_id]
      );
      await client.query(
        "UPDATE password_resets SET used_at = NOW() WHERE id = $1",
        [reset.id]
      );
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[auth/password-reset/confirm]", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
