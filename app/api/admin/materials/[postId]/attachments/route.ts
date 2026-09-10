import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/auth";
import { ensurePostAttachmentsTable } from "@/lib/ensure-tables";

const ALLOWED_EXT = [
  "pdf", "doc", "docx", "hwp", "hwpx", "ppt", "pptx", "xls", "xlsx",
  "zip", "jpg", "jpeg", "png", "gif", "txt",
];

// Called after the file has already been uploaded directly to Blob storage
// from the browser (see ./token/route.ts); this only records the metadata.
export async function POST(
  req: Request,
  { params }: { params: { postId: string } }
) {
  await ensurePostAttachmentsTable();

  const token = cookies().get(COOKIE_NAME)?.value;
  const payload = token ? await verifyAdminToken(token) : null;
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rows: postRows } = await pool.query(
    `SELECT p.id FROM posts p JOIN boards b ON b.id = p.board_id
     WHERE p.id = $1 AND b.slug = 'coaching-materials'`,
    [params.postId]
  );
  if (!postRows[0]) {
    return NextResponse.json({ error: "게시물을 찾을 수 없습니다." }, { status: 404 });
  }

  const { url, pathname, fileName, fileSize, mimeType } = await req.json();
  if (
    typeof url !== "string" || !url ||
    typeof pathname !== "string" || !pathname ||
    typeof fileName !== "string" || !fileName ||
    typeof fileSize !== "number"
  ) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXT.includes(ext)) {
    return NextResponse.json(
      { error: `허용되지 않는 파일 형식입니다: ${fileName}` },
      { status: 400 }
    );
  }

  const { rows } = await pool.query(
    `INSERT INTO post_attachments (post_id, file_name, file_size, mime_type, blob_url, blob_pathname)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, file_name, file_size, download_count`,
    [params.postId, fileName, fileSize, mimeType || null, url, pathname]
  );

  return NextResponse.json({ attachment: rows[0] }, { status: 201 });
}
