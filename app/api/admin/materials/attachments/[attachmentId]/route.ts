import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/auth";

async function requireAdmin() {
  const token = cookies().get(COOKIE_NAME)?.value;
  return token ? await verifyAdminToken(token) : null;
}

export async function GET(
  _req: Request,
  { params }: { params: { attachmentId: string } }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rows } = await pool.query(
    `SELECT file_name, mime_type, file_data FROM post_attachments WHERE id = $1`,
    [params.attachmentId]
  );
  const file = rows[0];
  if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return new NextResponse(file.file_data, {
    headers: {
      "Content-Type": file.mime_type || "application/octet-stream",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(file.file_name)}`,
    },
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { attachmentId: string } }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rowCount } = await pool.query(
    `DELETE FROM post_attachments WHERE id = $1`,
    [params.attachmentId]
  );
  if (rowCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
