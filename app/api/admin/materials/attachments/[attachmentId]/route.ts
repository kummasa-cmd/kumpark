import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { get, del } from "@vercel/blob";
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
    `SELECT file_name, mime_type, blob_url FROM post_attachments WHERE id = $1`,
    [params.attachmentId]
  );
  const file = rows[0];
  if (!file?.blob_url) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const blob = await get(file.blob_url, { access: "private" });
  if (!blob || blob.statusCode !== 200) {
    return NextResponse.json({ error: "파일을 찾을 수 없습니다." }, { status: 404 });
  }

  return new NextResponse(blob.stream, {
    headers: {
      "Content-Type": file.mime_type || blob.blob.contentType || "application/octet-stream",
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

  const { rows } = await pool.query(
    `DELETE FROM post_attachments WHERE id = $1 RETURNING blob_url`,
    [params.attachmentId]
  );
  const deleted = rows[0];
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (deleted.blob_url) {
    try {
      await del(deleted.blob_url);
    } catch {
      // DB row is already gone; a leftover blob is a cheap cost of not
      // blocking deletion on Blob storage availability.
    }
  }
  return NextResponse.json({ ok: true });
}
